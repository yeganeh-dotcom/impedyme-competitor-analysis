# Iran timezone gate

Visits from a laptop whose clock is set to Iran time are logged, marked `Counted = NO`,
excluded from Summary totals, and the user gets told how to fix it.

**Your Telegram bot is unchanged.** The gate lives where visits are actually counted —
the footer script and the tracker's sheet logger. Nothing in `Code.gs` needed to move.

## What changed

**`footer.html`** — reads `Intl.DateTimeFormat().resolvedOptions().timeZone` and the live
UTC offset, sends both with every event, and shows a red banner on the page when the clock
is on Iran time.

Your existing `ipwho.is` call already returns a `timezone` object (`id`, `utc`, `offset`)
next to `country`, so the "Italy is UTC+2" lookup is free — no country table needed. The
banner names the exact target offset and an example city pulled straight from that response.

**`SheetLogger.gs`** — five new columns, appended **after** `User Agent` so existing rows
stay aligned:

| Device Timezone | TZ Offset | IP Timezone | Counted | Reason |
|---|---|---|---|---|
| `Asia/Tehran` | `UTC+03:30` | `Europe/Rome (UTC+02:00)` | `NO` | `Iran timezone on device` |
| `Europe/Rome` | `UTC+02:00` | `Europe/Rome (UTC+02:00)` | `YES` | |

`updateSummary()` skips `Counted = NO` rows, so they add no visits and no minutes. Two
columns show what was dropped: `Excluded Visits` and `Excluded Reason`. Rows logged before
this change have no `Counted` value and still count normally.

## Detection rule

A clock is Iranian if the zone id is `Asia/Tehran` (or legacy `Iran`), **or** the raw offset
is UTC+03:30. Iran is the only country on +03:30, so the offset alone is conclusive — this
catches users who set a bare offset with no proper zone. Kabul (+04:30) and India (+05:30)
are the near misses and both test clean.

## Setup

1. Paste your tracker Web App URL into `ENDPOINT` at the top of `footer.html`.
2. For the Telegram warning: tracker script → Project Settings → Script Properties →
   add `BOT_TOKEN`. Without it, everything still logs and excludes — only the message is
   skipped.
3. Re-deploy the tracker Web App, then run **Visit Tracker → Update Summary** once to
   rebuild totals with the exclusions applied.

The `uid` in your tracking links must be the user's Telegram chat id, or the warning has
nowhere to go.

Warnings are throttled to one per user per 6 hours via `CacheService` — heartbeats fire
every 60 seconds, so without the throttle a user would get a message every minute.

```bash
node tracker/test_tracker.js   # 36 assertions
```

## One caveat

This reads the clock a browser reports. It catches people who forgot to change their
timezone, which is the case you described. It is not a location check and won't survive
someone deliberately spoofing it — a user in Iran whose laptop says Rome passes the gate.
So read the `Counted = NO` column as "device clock was on Iran time", not as "this person
is in Iran".
