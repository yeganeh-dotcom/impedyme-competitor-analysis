#!/usr/bin/env python3
"""Alarm when a watched LinkedIn page publishes a new post.

LinkedIn blocks direct scraping, so this reads an RSS mirror of the page
(rss.app, Feedspot, FetchRSS, ...) and fires a Telegram message the moment a
post appears that we have not seen before.

Configuration is entirely via environment variables:

  TELEGRAM_BOT_TOKEN   bot token from @BotFather                    (required)
  TELEGRAM_CHAT_ID     chat/group/channel id to alarm into          (required)
  LINKEDIN_FEEDS       feed(s) to watch, one per line, either
                       "https://rss.app/feeds/xyz.xml" or
                       "Impedyme=https://rss.app/feeds/xyz.xml"     (required)
  LINKEDIN_RSS_URL     legacy single-feed alias for LINKEDIN_FEEDS
  STATE_FILE           where seen-post ids live  (state/linkedin_seen.json)
  MAX_ALARMS_PER_RUN   flood guard, newest N are sent               (5)
  MAX_POST_AGE_DAYS    ignore posts older than this, 0 disables     (7)
  MAX_SEEN_PER_FEED    how many post ids to remember per feed       (300)
  FAILURE_ALARM_AFTER  consecutive feed failures before warning     (3)
"""

from __future__ import annotations

import argparse
import calendar
import hashlib
import html
import json
import os
import re
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import feedparser
import requests
from bs4 import BeautifulSoup

STATE_VERSION = 1
TELEGRAM_LIMIT = 4096
TITLE_CHARS = 200
SUMMARY_CHARS = 500

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/124.0.0.0 Safari/537.36"
    )
}

# Query params the RSS bridges bolt onto LinkedIn links. They change between
# fetches, so they must not be part of a post's identity.
TRACKING_PARAMS = {
    "trk", "trackingid", "trackingId", "lipi", "licu", "eid", "rcm",
    "midtoken", "midsig", "otptoken", "originalsubdomain", "refid", "src",
}


class FeedError(RuntimeError):
    """A feed could not be fetched or parsed."""


# --------------------------------------------------------------------------- #
# config
# --------------------------------------------------------------------------- #

def state_path() -> Path:
    return Path(os.environ.get("STATE_FILE", "state/linkedin_seen.json"))


def env_int(name: str, default: int) -> int:
    raw = os.environ.get(name, "").strip()
    if not raw:
        return default
    try:
        return int(raw)
    except ValueError:
        print(f"[warn] {name}={raw!r} is not a number, using {default}")
        return default


def parse_feed_config(raw: str) -> list[tuple[str | None, str]]:
    """Turn the LINKEDIN_FEEDS blob into [(label_or_None, url), ...]."""
    # Only fall back to comma-splitting when there are no line breaks, so a URL
    # that legitimately contains a comma survives.
    chunks = raw.splitlines() if "\n" in raw else raw.split(",")

    feeds: list[tuple[str | None, str]] = []
    for chunk in chunks:
        chunk = chunk.strip()
        if not chunk or chunk.startswith("#"):
            continue

        label: str | None = None
        if "=" in chunk and not chunk.lower().startswith(("http://", "https://")):
            label, _, chunk = chunk.partition("=")
            label, chunk = label.strip(), chunk.strip()

        if not chunk.lower().startswith(("http://", "https://")):
            raise ValueError(
                f"{chunk!r} is not a feed URL. Use 'https://...' or 'Label=https://...'."
            )
        feeds.append((label or None, chunk))

    return feeds


# --------------------------------------------------------------------------- #
# state
# --------------------------------------------------------------------------- #

def load_state() -> dict:
    path = state_path()
    if not path.exists():
        return {"version": STATE_VERSION, "feeds": {}}
    try:
        state = json.loads(path.read_text())
    except (json.JSONDecodeError, OSError) as exc:
        print(f"[warn] Could not read {path} ({exc}); starting from a clean state.")
        return {"version": STATE_VERSION, "feeds": {}}

    state.setdefault("version", STATE_VERSION)
    state.setdefault("feeds", {})
    return state


def save_state(state: dict) -> None:
    path = state_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    state["updated_at"] = now_iso()
    tmp = path.with_suffix(path.suffix + ".tmp")
    tmp.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n")
    tmp.replace(path)


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


# --------------------------------------------------------------------------- #
# feed reading
# --------------------------------------------------------------------------- #

def normalize_url(url: str) -> str:
    """Strip tracking noise so the same post always yields the same key."""
    try:
        parts = urlsplit(url.strip())
    except ValueError:
        return url.strip()

    if not parts.netloc:
        return url.strip()

    query = [
        (k, v) for k, v in parse_qsl(parts.query, keep_blank_values=True)
        if k.lower() not in {p.lower() for p in TRACKING_PARAMS}
        and not k.lower().startswith("utm_")
    ]
    path = parts.path.rstrip("/") or "/"
    return urlunsplit(
        (parts.scheme.lower(), parts.netloc.lower(), path, urlencode(query), "")
    )


def fetch_feed(url: str):
    last_error: FeedError | None = None

    for attempt in range(1, 4):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=25)
        except requests.RequestException as exc:
            last_error = FeedError(str(exc))
        else:
            if resp.status_code == 200:
                parsed = feedparser.parse(resp.content)
                if parsed.entries or not parsed.bozo:
                    return parsed
                raise FeedError(f"feed did not parse: {parsed.bozo_exception}")
            if resp.status_code == 429 or resp.status_code >= 500:
                last_error = FeedError(f"HTTP {resp.status_code}")
            else:
                # 401/403/404 will not fix themselves — fail fast.
                raise FeedError(f"HTTP {resp.status_code}")

        if attempt < 3:
            time.sleep(2 ** attempt)

    raise last_error or FeedError("unknown error")


def clean_text(raw: str) -> str:
    if not raw:
        return ""
    text = BeautifulSoup(raw, "html.parser").get_text(separator=" ", strip=True)
    return re.sub(r"\s+", " ", text).strip()


def truncate(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    return text[: limit - 1].rstrip() + "…"


def extract_post(entry) -> dict:
    link = entry.get("link") or ""
    title = clean_text(entry.get("title") or "")
    summary = clean_text(entry.get("summary") or entry.get("description") or "")

    # A post's identity: explicit guid, else its link, else a hash of content.
    raw_id = entry.get("id") or link
    if raw_id:
        post_id = normalize_url(raw_id) if "://" in raw_id else raw_id.strip()
    else:
        digest = hashlib.sha1(
            f"{title}|{entry.get('published', '')}".encode()
        ).hexdigest()
        post_id = f"sha1:{digest}"

    published_ts = None
    published = ""
    struct = entry.get("published_parsed") or entry.get("updated_parsed")
    if struct:
        # feedparser normalises to UTC, so timegm — not mktime, which would
        # reinterpret it in the runner's local timezone.
        published_ts = calendar.timegm(struct)
        published = time.strftime("%Y-%m-%d %H:%M UTC", struct)

    return {
        "id": post_id,
        "title": title,
        "summary": summary,
        "link": link,
        "published": published,
        "published_ts": published_ts,
    }


# --------------------------------------------------------------------------- #
# telegram
# --------------------------------------------------------------------------- #

def build_message(label: str, post: dict, *, include_summary: bool = True) -> str:
    lines = [
        f"🔔 <b>New LinkedIn post — {html.escape(label)}</b>",
        "",
        f"<b>{html.escape(truncate(post['title'], TITLE_CHARS) or '(untitled post)')}</b>",
    ]

    if include_summary and post["summary"]:
        lines += ["", html.escape(truncate(post["summary"], SUMMARY_CHARS))]
    if post["published"]:
        lines += ["", f"🕒 {html.escape(post['published'])}"]
    if post["link"]:
        lines += ["", html.escape(post["link"])]

    message = "\n".join(lines)
    if len(message) > TELEGRAM_LIMIT and include_summary:
        # Drop the body rather than cutting mid-tag and breaking the HTML.
        return build_message(label, post, include_summary=False)
    return message[:TELEGRAM_LIMIT]


def send_telegram(token: str, chat_id: str, text: str, *, dry_run: bool = False) -> bool:
    if dry_run:
        print("--- would send ---\n" + text + "\n------------------")
        return True

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    payload = {"chat_id": chat_id, "text": text, "parse_mode": "HTML"}

    for attempt in range(1, 5):
        try:
            resp = requests.post(url, json=payload, timeout=20)
        except requests.RequestException as exc:
            print(f"[warn] Telegram request failed ({exc}); retrying.")
        else:
            if resp.ok:
                return True
            if resp.status_code == 429:
                try:
                    wait = int(resp.json().get("parameters", {}).get("retry_after", 5))
                except (ValueError, AttributeError):
                    wait = 5
                print(f"[warn] Telegram rate limit, waiting {wait}s.")
                time.sleep(wait)
                continue
            if resp.status_code < 500:
                # Bad token, bad chat id, bad HTML — retrying will not help.
                print(f"[error] Telegram rejected the message ({resp.status_code}): "
                      f"{resp.text[:300]}")
                return False
            print(f"[warn] Telegram server error {resp.status_code}; retrying.")

        if attempt < 4:
            time.sleep(2 ** attempt)

    print("[error] Giving up on Telegram after 4 attempts.")
    return False


# --------------------------------------------------------------------------- #
# main
# --------------------------------------------------------------------------- #

def process_feed(label, url, state, token, chat_id, args) -> tuple[int, bool]:
    """Check one feed. Returns (alarms_sent, failed)."""
    key = normalize_url(url)
    record = state["feeds"].setdefault(key, {})
    record.setdefault("seen", [])
    record.setdefault("consecutive_failures", 0)
    record.setdefault("last_success", None)
    record.setdefault("failure_notified", False)

    display = label or record.get("label") or "LinkedIn"
    first_run = not record["seen"] and record["last_success"] is None

    try:
        parsed = fetch_feed(url)
    except FeedError as exc:
        record["consecutive_failures"] += 1
        record["last_error"] = str(exc)
        print(f"[{display}] FEED FAILED ({exc}) — "
              f"{record['consecutive_failures']} in a row.")

        threshold = env_int("FAILURE_ALARM_AFTER", 3)
        if record["consecutive_failures"] >= threshold and not record["failure_notified"]:
            warning = (
                f"⚠️ <b>LinkedIn alarm is blind — {html.escape(display)}</b>\n\n"
                f"The feed has failed {record['consecutive_failures']} times in a row, "
                f"so new posts will be missed.\n\n"
                f"Last error: {html.escape(str(exc))}"
            )
            if send_telegram(token, chat_id, warning, dry_run=args.dry_run):
                record["failure_notified"] = True
        return 0, True

    record["consecutive_failures"] = 0
    record["failure_notified"] = False
    record["last_error"] = None
    record["last_success"] = now_iso()

    if not label:
        display = clean_text(parsed.feed.get("title", "")) or display
    record["label"] = display
    record["url"] = url

    posts = [extract_post(entry) for entry in parsed.entries]
    seen = set(record["seen"])
    new = [p for p in posts if p["id"] not in seen]

    print(f"[{display}] {len(posts)} post(s) in feed, {len(new)} new.")

    if args.seed or (first_run and not args.alarm_on_first_run):
        record["seen"] = [p["id"] for p in posts][: env_int("MAX_SEEN_PER_FEED", 300)]
        reason = "Re-seeded" if args.seed else "First run — baselined"
        print(f"[{display}] {reason} {len(posts)} existing post(s); no alarm sent.")
        return 0, False

    # Posts that are new *to us* but old in the world are a backfill, not an
    # alarm — bridges do this when they widen their history or change feed id.
    # Undated posts are never suppressed: better a stray alarm than a missed one.
    stale: list[dict] = []
    max_age_days = env_int("MAX_POST_AGE_DAYS", 7)
    if max_age_days > 0:
        cutoff = time.time() - max_age_days * 86400
        stale = [p for p in new if p["published_ts"] and p["published_ts"] < cutoff]
        if stale:
            stale_ids = {p["id"] for p in stale}
            new = [p for p in new if p["id"] not in stale_ids]
            print(f"[{display}] Ignoring {len(stale)} post(s) older than "
                  f"{max_age_days} days (backfill, not news).")

    if not new and not stale:
        return 0, False

    # Feeds are newest-first; alarm oldest-first so the chat reads in order.
    new.reverse()
    if all(p["published_ts"] for p in new):
        new.sort(key=lambda p: p["published_ts"])

    max_alarms = env_int("MAX_ALARMS_PER_RUN", 5)
    skipped = new[:-max_alarms] if len(new) > max_alarms else []
    to_alarm = new[-max_alarms:] if len(new) > max_alarms else new
    if skipped:
        print(f"[{display}] Flood guard: alarming on the newest {len(to_alarm)}, "
              f"silently marking {len(skipped)} older post(s) as seen.")

    # Stale and flood-skipped posts are recorded as seen without alarming.
    confirmed = [p["id"] for p in stale] + [p["id"] for p in skipped]
    sent = 0
    for post in to_alarm:
        message = build_message(display, post)
        if send_telegram(token, chat_id, message, dry_run=args.dry_run):
            confirmed.append(post["id"])
            sent += 1
            print(f"[{display}] ALARM: {post['title'][:80]!r}")
        else:
            # Leave it unseen so the next run tries again.
            print(f"[{display}] Alarm failed for {post['title'][:80]!r}; "
                  f"will retry next run.")

    merged, seen_set = [], set()
    for post_id in list(reversed(confirmed)) + record["seen"]:
        if post_id not in seen_set:
            seen_set.add(post_id)
            merged.append(post_id)
    record["seen"] = merged[: env_int("MAX_SEEN_PER_FEED", 300)]

    return sent, False


def parse_args(argv=None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--test", action="store_true",
                        help="send a test alarm to prove the wiring works, then exit")
    parser.add_argument("--dry-run", action="store_true",
                        help="print alarms instead of sending them")
    parser.add_argument("--seed", action="store_true",
                        help="mark everything currently in the feed as seen, no alarms")
    parser.add_argument("--alarm-on-first-run", action="store_true",
                        help="alarm on every post already in the feed (default: baseline quietly)")
    return parser.parse_args(argv)


def main(argv=None) -> int:
    args = parse_args(argv)
    print(f"=== LinkedIn post alarm — {now_iso()} ===")

    token = os.environ.get("TELEGRAM_BOT_TOKEN", "").strip()
    chat_id = os.environ.get("TELEGRAM_CHAT_ID", "").strip()
    if not args.dry_run and not (token and chat_id):
        print("[error] TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID must both be set.")
        return 2

    if args.test:
        ok = send_telegram(
            token, chat_id,
            "✅ <b>LinkedIn alarm is wired up</b>\n\n"
            "This is a test. You'll get a message like this whenever a watched "
            "LinkedIn page publishes a new post.",
            dry_run=args.dry_run,
        )
        print("Test alarm sent." if ok else "Test alarm FAILED.")
        return 0 if ok else 1

    raw_feeds = (os.environ.get("LINKEDIN_FEEDS")
                 or os.environ.get("LINKEDIN_RSS_URL")
                 or "")
    if not raw_feeds.strip():
        print("[error] Set LINKEDIN_FEEDS to the RSS URL mirroring the LinkedIn page.")
        return 2

    try:
        feeds = parse_feed_config(raw_feeds)
    except ValueError as exc:
        print(f"[error] {exc}")
        return 2

    if not feeds:
        print("[error] LINKEDIN_FEEDS is set but contains no usable feed URL.")
        return 2

    state = load_state()
    total_alarms = 0
    failed = 0

    try:
        for label, url in feeds:
            alarms, feed_failed = process_feed(label, url, state, token, chat_id, args)
            total_alarms += alarms
            failed += int(feed_failed)
    finally:
        if not args.dry_run:
            save_state(state)

    print(f"\nDone — {total_alarms} alarm(s) sent, "
          f"{failed}/{len(feeds)} feed(s) failed.")

    # Exit non-zero on failure so a silently broken watcher shows up red.
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
