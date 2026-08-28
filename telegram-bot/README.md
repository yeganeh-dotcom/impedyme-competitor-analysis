# Impedyme Telegram Bot — timezone warning edition

Three files that work together. Every file has a **config block at the top**; you should
never need to edit anything below the config to change behaviour.

| File | Where it runs | What it does |
|---|---|---|
| `bot.gs` | Apps Script project of the **bot** | Talks to Telegram, counts coins, **sends the Asia/Tehran warning** |
| `tracker-footer.html` | Footer of **impedyme.com** | Sends pageviews/heartbeats + the visitor's timezone |
| `sheet-logger.gs` | Apps Script project of the **spreadsheet** | Writes every event into the sheet, builds reports |

---

## 1. Security first — rotate your bot token

The token that was in the old code is exposed. Open **@BotFather → /mybots → your bot →
API Token → Revoke current token**, then store the new one as a Script Property
(never inside the code file, and never in a public repo).

Apps Script editor → ⚙️ **Project Settings** → **Script Properties** → Add:

| Property | Value |
|---|---|
| `TELEGRAM_TOKEN` | the new BotFather token |
| `SHEET_ID` | id of the tracking spreadsheet (the long part of its URL) |
| `WEB_APP_URL` | the `/exec` URL of the deployed bot script |

---

## 2. Install

**Spreadsheet script**
1. Spreadsheet → Extensions → Apps Script → paste `sheet-logger.gs`.
2. Deploy → New deployment → Web app → *Execute as: Me*, *Access: Anyone* → copy the `/exec` URL.
3. Reload the spreadsheet → run **Visit Tracker → Repair Headers** once (adds the new
   `TZ Offset (min)` column to sheets that already exist).

**Website footer**
4. Paste `tracker-footer.html` into the site footer and set `CONFIG.ENDPOINT` to the URL from step 2.

**Bot script**
5. Apps Script project of the bot → paste `bot.gs` → add the Script Properties from section 1.
6. Deploy → New deployment → Web app → *Execute as: Me*, *Access: Anyone*.
7. Run `setWebhook()` once.
8. Run `installTimezoneCheckTrigger()` once — the bot then checks every hour and warns
   Tehran users even when they never open the chat.

---

## 3. The timezone rule

A visit earns **nothing** when the laptop timezone is `Asia/Tehran` **or** the IP country is Iran.
The user is told about it in three places:

1. **In the wallet message** — always, whenever their timezone is wrong.
2. **As its own message** on any bot interaction — `TZ_RULES.WARN_ON_EVERY_INTERACTION`,
   at most once per `TZ_RULES.WARN_COOLDOWN_MINUTES`.
3. **Every hour automatically** — `notifyBlockedTimezoneUsers()`, for users active in the
   last `TZ_RULES.RECENT_ACTIVITY_HOURS` hours.

Plus, optionally, a red banner on the website itself (`CONFIG.SHOW_TIMEZONE_BANNER` in the footer).

The message names the exact timezone to pick, based on the country of their VPN IP —
for example *Italy → `Europe/Rome` (UTC+1 winter / UTC+2 summer)*. It also shows how many
coins they already lost.

---

## 4. Where to change what

| I want to… | File | Setting |
|---|---|---|
| Change the warning wording | `bot.gs` | `TEXTS.TIMEZONE_WARNING` |
| Block another timezone (e.g. `Asia/Baku`) | `bot.gs` | `TZ_RULES.BLOCKED_TIMEZONES` |
| Add a country hint (e.g. Belgium) | `bot.gs` | `COUNTRY_TIMEZONE_HINTS` |
| Warn more/less often | `bot.gs` | `TZ_RULES.WARN_COOLDOWN_MINUTES` |
| Stop the separate warning message | `bot.gs` | `TZ_RULES.WARN_ON_EVERY_INTERACTION = false` |
| Change coin values / minimum withdrawal | `bot.gs` | `COIN_RULES` |
| Change which pages earn coins | `bot.gs` | `COIN_RULES.TARGET_PAGES` |
| Accept sources other than Google | `bot.gs` | `COIN_RULES.REQUIRED_REFERRER` |
| Rename a button | `bot.gs` | `BUTTONS` |
| Change any Persian text | `bot.gs` | `TEXTS` |
| Turn off the website banner | `tracker-footer.html` | `CONFIG.SHOW_TIMEZONE_BANNER = false` |
| Change heartbeat frequency | `tracker-footer.html` | `CONFIG.HEARTBEAT_SECONDS` |
| See which users are on Tehran time | `sheet-logger.gs` | menu **Visit Tracker → Timezone Check** |

---

## 5. Testing

In `bot.gs`:

* `testTimezoneWarning()` — put your own chat id in it and run; sends the warning immediately,
  ignoring the cooldown.
* `debugUser()` — put a uid in it and run; prints exactly what the bot sees
  (valid events, blocked events, last timezone, last country).
* `getWebhookInfo()` — check that Telegram can reach the script; look at `last_error_message`.

---

## 6. Changes from the previous version

* Blocked timezones are matched case-insensitively and by keyword, so `asia/tehran `,
  `Asia/Tehran` and `Iran/Tehran` are all caught (the old exact `===` comparison missed them).
* The warning is now pushed on its own, not only inside the wallet message, and an hourly
  trigger reaches users who never open the bot.
* The Italy-only hint became a country table you can extend.
* The correct VPN country is taken from the last **non-Iranian** visit, so the hint no longer
  says "your IP is from Iran" when the last row happened to be a VPN-off visit.
* The message reports how many coins were lost to the wrong timezone.
* Telegram formatting switched to HTML with escaping — a name containing `*` or `_` used to
  make `sendMessage` fail silently. If a message is still rejected, it is resent as plain text.
* Card numbers are validated (16 digits) and stored.
* Secrets moved to Script Properties.
* New `TZ Offset (min)` column and a **Timezone Check** report in the spreadsheet.
