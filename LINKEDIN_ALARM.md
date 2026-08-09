# LinkedIn Post Alarm

Fires a Telegram alarm whenever the [Impedyme LinkedIn page](https://www.linkedin.com/company/impedyme)
publishes a new post. Runs on GitHub Actions every 15 minutes — nothing to keep
running on your laptop.

```
LinkedIn page  →  RSS bridge  →  linkedin_alarm.py (every 15 min)  →  Telegram
```

LinkedIn blocks direct scraping and its API needs a weeks-long approval, so the
bot reads an **RSS mirror** of the page instead. That's the one external piece
you need to set up.

---

## Setup (about 10 minutes)

### 1. Turn the LinkedIn page into an RSS feed

Use any RSS bridge — [rss.app](https://rss.app/rss-feed/linkedin) is the usual
pick, [Feedspot](https://www.feedspot.com/rss-feed/create-linkedin-rss-feed) and
FetchRSS also work.

1. Sign up and choose **LinkedIn → Company Page**.
2. Paste `https://www.linkedin.com/company/impedyme`.
3. Copy the generated feed URL (looks like `https://rss.app/feeds/AbC123.xml`).

Open that URL in a browser first — you should see XML listing recent Impedyme
posts. If it's empty, the bridge hasn't crawled the page yet; wait a few minutes.

> **Heads up on refresh rate.** Free tiers typically refresh hourly, which caps
> how fast the alarm can possibly be. A paid tier (usually ~$10/mo) refreshes
> every few minutes. Polling every 15 minutes only helps if the feed itself
> updates that often.

### 2. Create the Telegram bot

1. Message [@BotFather](https://t.me/botfather) → `/newbot` → pick a name.
   He replies with a token like `8123456789:AAH...`. That's `TELEGRAM_BOT_TOKEN`.
2. Send your new bot any message (`hi`) so it's allowed to message you back.
   For a team alarm, add the bot to a group instead and post there.
3. Get the chat id — open this in a browser, swapping in your token:
   ```
   https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates
   ```
   Find `"chat":{"id":123456789` — that number is `TELEGRAM_CHAT_ID`.
   Group ids are negative (e.g. `-1001234567890`); include the minus sign.

### 3. Add the three GitHub secrets

**Settings → Secrets and variables → Actions → New repository secret**

| Secret | Value |
| --- | --- |
| `TELEGRAM_BOT_TOKEN` | the BotFather token |
| `TELEGRAM_CHAT_ID` | the chat id from step 2 |
| `LINKEDIN_FEEDS` | `Impedyme=https://rss.app/feeds/AbC123.xml` |

### 4. Prove it works

**Actions → LinkedIn Post Alarm → Run workflow**, set **mode** to `test`.
You should get a Telegram message within a few seconds. If not, check the run
log — a bad token or chat id is reported there in plain English.

Then run it once with mode `watch`. The first real run **baselines quietly**:
it records everything already in the feed as "seen" and sends no alarm, so you
aren't spammed with a month of old posts. From then on, only genuinely new
posts alarm.

---

## How it avoids false alarms

- **Post identity** is the LinkedIn permalink with tracking junk (`?trk=`,
  `utm_*`, …) stripped, so a post never alarms twice because the bridge
  reshuffled its query string.
- **Seen posts** live in `state/linkedin_seen.json`, committed back to the repo
  by the workflow. Durable across runs, and you can read it to see exactly what
  the bot knows.
- **First run is silent** (see above). Re-baseline any time with mode `seed`.
- **Flood guard**: if the bridge suddenly coughs up 30 "new" posts, only the
  newest 5 alarm; the rest are marked seen silently.
- **Backfill guard**: a post that's new to the bot but published more than 7
  days ago is history, not news — it's recorded silently. Posts with no date at
  all are never suppressed, on the principle that a stray alarm beats a missed
  one.
- **Failed sends aren't marked seen**, so a Telegram outage means a retry next
  run rather than a missed post.

## When the bot goes blind

An alarm bot that quietly stops working is worse than no bot. If the feed fails
3 runs in a row, you get a **⚠️ warning message on Telegram** saying the alarm
can't read the feed — usually an expired rss.app trial or a changed URL. The
Actions run also goes red, so it shows up in your GitHub notifications.

## Watching more pages

`LINKEDIN_FEEDS` takes one feed per line, so competitor pages are a one-line
change — each alarm is labelled with the name you give it:

```
Impedyme=https://rss.app/feeds/aaa.xml
Speedgoat=https://rss.app/feeds/bbb.xml
Typhoon HIL=https://rss.app/feeds/ccc.xml
```

## Knobs

Set as repo secrets or variables if you want to change the defaults:

| Variable | Default | Meaning |
| --- | --- | --- |
| `MAX_ALARMS_PER_RUN` | `5` | flood guard ceiling |
| `MAX_POST_AGE_DAYS` | `7` | ignore posts older than this; `0` disables |
| `MAX_SEEN_PER_FEED` | `300` | how many post ids to remember |
| `FAILURE_ALARM_AFTER` | `3` | consecutive failures before the ⚠️ warning |
| `STATE_FILE` | `state/linkedin_seen.json` | where state is stored |

To change how often it checks, edit the `cron` in
`.github/workflows/linkedin-alarm.yml`. This repo is public, so Actions minutes
are free.

## Running it locally

```bash
pip install -r requirements.txt
export TELEGRAM_BOT_TOKEN=... TELEGRAM_CHAT_ID=...
export LINKEDIN_FEEDS="Impedyme=https://rss.app/feeds/AbC123.xml"

python linkedin_alarm.py --test      # send a test alarm
python linkedin_alarm.py --dry-run   # print what would be sent, change nothing
python linkedin_alarm.py             # a real check
```

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Test alarm 400s with `chat not found` | You never messaged the bot, or the chat id is wrong/missing its `-`. |
| Test works, real posts never alarm | The bridge feed is stale. Open the feed URL directly — if the post isn't in the XML, the bot can't see it. |
| Everything alarmed at once | The feed URL changed, so the bot re-baselined against a new identity. Harmless, one-off. |
| Scheduled runs never fire | GitHub only runs `schedule` from the **default branch** — this must be merged to `main`. GitHub also pauses Actions on repos with no activity for 60 days (the existing keepalive workflow handles that). |
