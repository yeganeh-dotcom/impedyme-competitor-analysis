# Timezone sync for the LinkedIn bot

## Your actual question: "my clock settings doesn't have all countries"

It never will, and nothing is broken. **Clock pickers are not lists of countries.**
They are lists of *clocks*, labelled by representative city.

Running the numbers over the IANA database (`bot/tools/generate_timezones.py`):

| | count |
|---|---|
| Countries & territories | 247 |
| **Distinct clocks among them** | **38** |

31 European countries keep the *identical* clock (UTC+1, UTC+2 in summer):

> Albania, Andorra, Austria, Belgium, Bosnia & Herzegovina, Croatia, Czech Republic,
> Denmark, France, Germany, Gibraltar, Hungary, Italy, Liechtenstein, Luxembourg,
> Malta, Monaco, Montenegro, Netherlands, North Macedonia, Norway, Poland, San Marino,
> Serbia, Slovakia, Slovenia, Spain, Svalbard & Jan Mayen, Sweden, Switzerland, Vatican City

Windows collapses all 31 into **one** dropdown row —
`(UTC+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna`.
So a user on a Belgian VPN scrolls the list, sees no "Belgium", and concludes their
country is missing. It isn't: Belgium *is* that row. Picking Berlin gives a Belgian
user a clock that is correct to the second, all year, DST included.

Where each OS lets you pick:

| OS | Picks by | Country name shown? |
|---|---|---|
| Android 12+ | Region, then zone | Yes — real country list |
| iOS / iPadOS | City search | No |
| Windows 10/11 | UTC offset + grouped cities | No |
| macOS | Closest city | No |

So the fix is not "find more countries". It is: **map country → IANA zone → the city
that country's clock is filed under**, and tell the user to search for *that*. That is
what this code does.

## What's here

| File | |
|---|---|
| `Timezones.gs` | Generated. 247 countries → IANA zone, city label, UTC offsets, DST flag |
| `TimezoneBot.gs` | `/tz` command, country resolver, instruction builder, Mini App verifier |
| `Code.gs` | Your bot, with `/tz` wired in and several bugs fixed |
| `tools/generate_timezones.py` | Regenerates `Timezones.gs` from OS tzdata |
| `tools/test_timezones.js` | 69 assertions, runs under plain Node |

The resolver accepts Persian names, English names, ISO codes, and city names, and
normalizes Arabic ی/ك variants and ZWNJ, because users type all of them:

```
/tz آلمان     /tz المان     /tz Germany     /tz DE     /tz Berlin
```

All five return `Europe/Berlin`. Ambiguous input returns nothing rather than guessing
(`/tz ira` matches both Iran and Iraq, so it asks again instead of picking one).

## Setup

1. **Revoke your bot token first** — see the security note below.
2. Apps Script → Project Settings → Script Properties, add:
   `BOT_TOKEN`, `WEB_APP_URL`, `ADMIN_ID`, and `OPENAI_API_KEY` if you use it.
3. Add columns F–I to the `Users` sheet:
   `countryCode`, `expectedTimezone`, `reportedTimezone`, `lastTimezoneCheck`.
4. Deploy as Web App (Execute as: me, Access: anyone) and set that URL as `WEB_APP_URL`.
5. Point the Telegram webhook at the same URL.

Regenerate the country table after a tzdata update (countries change their rules —
Iran dropped DST in 2022, Kazakhstan unified to UTC+5 in 2024):

```bash
python3 bot/tools/generate_timezones.py > bot/Timezones.gs
node bot/tools/test_timezones.js
```

## How verification works

A bot cannot change anyone's device clock — no Telegram API or Apps Script call can
reach OS settings. It can only instruct, then *check*. The check uses the Mini App you
already had a URL for:

1. `/tz <country>` stores the expected zone and shows a reply-keyboard button.
2. The button opens `doGet()` inside Telegram's webview.
3. The page reads `Intl.DateTimeFormat().resolvedOptions().timeZone` and the live
   offset, and returns them via `Telegram.WebApp.sendData()`.
4. `handleWebAppData()` compares **offsets, not zone names** — `Europe/Brussels` and
   `Europe/Berlin` are both correct for a Belgian VPN, and a name comparison would
   wrongly reject one.

Note this is a cooperative check, not proof. A user who wants to defeat it can spoof
the webview's timezone. It catches people who simply forgot, which is the common case.

## Two things worth knowing

**Your bot token was pasted in plain text and is compromised.** Anyone who has
seen it can read every message your bot receives and post as that bot. Open
BotFather → `/revoke` → pick the bot → store the new token in Script Properties, not in
source. `ADMIN_ID` was also still the `12345678` placeholder, so `chatId === ADMIN_ID`
never matched and every admin notification was going nowhere.

**Timezone matching will not make pod engagement look organic.** LinkedIn's detection
for coordinated engagement is graph-shaped: the same accounts engaging the same authors,
in the same order, within minutes of each post. Device timezone is a weak signal next to
that pattern, so this work buys much less than it appears to, and the accounts involved
carry restriction risk regardless. Worth weighing before investing more in this direction.
