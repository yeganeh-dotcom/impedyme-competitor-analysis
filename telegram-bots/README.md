# Impedyme Telegram bots: fixed version

Two Google Apps Script bots, a user bot and an admin bot, share one Google Sheet. This folder holds the fixed code, the installation steps, and a local test suite.

```
telegram-bots/
├── shared/Config.gs        ← copy into BOTH projects (identical)
├── shared/Core.gs          ← copy into BOTH projects (identical): coin engine
├── user-bot/UserBot.gs     ← user bot project only
├── admin-bot/AdminBot.gs   ← admin bot project only
├── admin-bot/AdminViews.gs ← admin bot project only
├── sheet-logger/Logger.gs  ← optional: new version of the script inside the Google Sheet
├── website/footer.html     ← optional: new version of the website tracker
└── test/                   ← node telegram-bots/test/run-tests.js
```

> Tokens and the sheet ID are **not** in this repo. Put them in `Config.gs`, or better, in each
> project's *Project Settings → Script Properties* using the same key names.

---

## 1. Why coins dropped after you changed the keywords

The old code never stored coins. Every time a user opened *کیف پول*, it recounted all of their
visits from scratch, but only kept visits whose page matched the keywords active **right now**:

```js
const activeKws = getKeywordsFromSheet();          // today's keywords only
if (activeKws.length === 0) return stats;          // no keywords → 0 coins
...
if (!isMatch) continue;                            // yesterday's keyword page → not counted anymore
```

So when you replaced *grid emulator* with *motor emulator*, every visit made for *grid emulator*
stopped counting and the user fell from 10 coins to 5. Deleting `ALL` dropped everyone to 0 until
new keywords were added. The bot then wrote the smaller number back into the sheet.

Other causes:

| Cause | Effect |
|---|---|
| The hourly limit key was `timestamp.getHours()`, with no date | All days shared the same 24 buckets, so each page could earn about 14 coins **for life** |
| `/start` and *شروع دوباره 🔄* created a **new UID and a new link** | The bot then read a new, empty log tab, so all earlier work vanished |
| *🔄 بروزرسانی سکه‌ها* in the admin bot used a **different formula** (it read `k.path`, but `getTodayKeywords()` returns `url`) | The admin overwrote users' numbers with different values |

**The fix is a coin ledger (`Core.gs`):**
- Each visit (log row) is judged **once**. The result goes into a new `Credit` column of the user's
  log tab (`COUNTED`, `LIMIT`, `NO_KEYWORD`, `NOT_GOOGLE`, `SPONSORED`, `IRAN`).
- Running totals (`CountedPV`, `CountedHB`, `ProcessedRows`) are stored in *Users*. Coins only ever
  go up from new visits. Nothing is recalculated from scratch.
- Keywords are no longer deleted. They get a `RemovedAt` time. Each visit is checked against the
  keywords that were active **at the moment of that visit**.
- The hourly limit is now per date and hour (`yyyyMMddHH`).
- A user keeps one UID and one link forever. `/start` for a registered user only shows their info.
- **Migration:** on first run, each user's current balance is locked in (`LegacyBonus`). Nobody
  gets less than what they had. Users whose coins already dropped can be restored with
  *🪙 مدیریت سکه کاربر*. *🔍 بررسی کاربر* shows an estimate from their full history to help you decide.

## 2. Why *🪙 مدیریت سکه کاربر* did nothing

```js
props.setProperty("coin_target_uid_" + chatId, foundCoinUser.uid);
```

`foundCoinUser.uid` comes from the sheet. Google Sheets turns `"123456"` into the **number**
`123456`, and `PropertiesService.setProperty` only accepts strings. The call throws
(*"The parameters (String,number) don't match the method signature…"*), so the bot never moves to
the next step. Your `+5` was then searched as a user name and you got "user not found". The same
bug existed in *✉️ پیام به یک کاربر*.

Also fixed: partial name search could pick the wrong user. Persian digits (`+۵`) were rejected.
"Set total" used a stale value.

**Now:** you search by UID, name, email or chat ID. If several users match, you pick one from
buttons. The coin card has **+1 +5 +10 +20 / −1 −5 −10 −20 / zero balance / full reset (asks for
confirmation)** buttons, or you can type `+5`, `-3`, `20` or `صفر`. Every change is logged in the
**CoinHistory** sheet. Direct commands: `/coin UID +5`, `/reset UID`.

## 3. How to know the admin list matches what the user sees

Before, it didn't. The list showed whatever was last written to the sheet, sometimes by a
different formula. Now:
- Both bots use the **same `Core.gs`**: one balance function (`balanceOf_`) and one wallet text
  (`walletText_`).
- *👥 آمار و لیست کاربران* recalculates everyone (if older than 2 minutes) **before** showing the list,
  with the calculation time.
- *🔍 بررسی کاربر* shows **the exact wallet message** the user gets. It also shows why each visit
  counted or not, and the full-history estimate.
- *⚙️ وضعیت سیستم* warns if the two projects have different `Core.gs` versions.
- The formula, visible in the sheet:
  `balance = floor(CountedPV/20) + floor(CountedHB/15) + LegacyBonus + Adjustment − (pending + paid withdrawals)`

---

## Installation (≈10 minutes)

1. **Back up** the spreadsheet: *File → Make a copy*.
2. **User bot project:** replace the code with three files: `Config.gs`, `Core.gs`, `UserBot.gs`
   (*+ → Script* to add a file; delete the old code).
3. **Admin bot project:** four files: `Config.gs`, `Core.gs`, `AdminBot.gs`, `AdminViews.gs`.
4. In `Config.gs` (the same in both): set `SHEET_ID`, `USER_BOT_TOKEN`, `ADMIN_BOT_TOKEN`.
5. Deploy **each** project: *Deploy → Manage deployments → ✏️ Edit → Version: **New version** → Deploy*.
   ⚠️ Do **not** use *New deployment*. That creates a new URL while Telegram keeps calling the old
   one, so users stay on the old code. To check, run `checkUserWebhook` / `checkAdminWebhook` and
   compare the URL in the log with your deployment URL.
6. In the admin project, select **`migrateAllUsers`** and press ▶ Run once (approve permissions).
   **Do this before changing any keywords.**
7. Send `/start` to the admin bot. The **first** person becomes the admin, and everyone else is
   refused. Add more admins with `/addadmin CHAT_ID`.
8. (Recommended) Run **`installAutoSettleTrigger`** once. It updates everyone's coins every 30 minutes.
9. Press **📲 ارسال منوی جدید به همه** so every user gets the newest keyboard. Later code updates
   never change coins; users also get the new menu with their next reply.
10. (Optional) Replace the sheet script with `sheet-logger/Logger.gs` and the website tracker with
    `website/footer.html`. Then deploy the logger with *Edit → New version*, which keeps the same URL.

Nothing in your sheet is deleted. New columns are added automatically: Users I–O, DailyKeywords
`AddedAt/RemovedAt`, Withdrawals `Coins/RequestID/ProcessedAt`, and `Credit` columns O–P in log tabs.
Two new sheets are created: **Settings** and **CoinHistory**. Don't reorder these columns. Remove
keywords with the bot, not by deleting rows.

## Other bugs fixed

- **The admin bot had no access check.** Anyone who found it could change coins, read emails and card numbers, and broadcast.
- **Withdrawals never deducted coins**, so a user could request the same money again and again. Now
  coins are reserved on request. The admin gets ✅ Paid / ❌ Reject buttons; reject refunds the coins.
  The user is notified either way.
- Card numbers (16 digits) were stored as numbers and could lose digits. They're now text, checked
  with Luhn, and Persian digits are accepted.
- A menu button pressed mid-flow was saved as the name, email or card (e.g. "اطلاعات کاربری 👤" saved as a card).
- Markdown errors (e.g. an email with `_`) silently dropped the registration message. The bots now
  use HTML with a plain-text fallback.
- A broadcast containing "کاربران" or "تسویه" opened another menu instead of being sent.
- Random 6-digit UIDs weren't checked for duplicates. Telegram retries could process one update twice.
- A Google visit to the homepage (empty path) matched *every* keyword.
- Per-user data in Script Properties (500 KB limit) → the sheet is now the only source of truth.

## Recommendations

1. **10-million-cell limit:** every new tab is 1000×26 = 26,000 cells, so about 380 users fill a
   spreadsheet. The big *Log* tab grows with every heartbeat too. Use the new `Logger.gs`
   (small tabs) and run `trimMasterLog(30)` from a daily trigger.
2. **Ads detection:** the old footer only sent `location.pathname`, so `?gclid=` was never seen
   and ad clicks looked organic. The new `footer.html` sends the query string.
3. **Tokens:** move them to Script Properties. If this code was ever shared, revoke them in
   @BotFather (`/revoke`).
4. **Anti-fraud ideas:** flag one IP used by several users; flag heartbeats without a pageview;
   block datacenter/VPN IP ranges; send a daily admin summary.
5. Over about 1,000 active users, consider a real database (Firestore or Supabase) instead of Sheets.

## Tests

```bash
node telegram-bots/test/run-tests.js
```

This runs 15 end-to-end scenarios against mocked Sheets and Telegram:

- migration keeps balances
- keyword changes don't reduce coins
- coin management, withdrawals and refunds
- admin access control
- duplicate updates
- the admin list equals the wallet
