# Telegram bot — setup & troubleshooting

The bot code lives in `telegram_bot.gs` and runs on Google Apps Script.

## Why the old bot stopped responding

Two problems, either of which makes the bot completely silent:

1. **The Script Properties store was full.** The old code saved a permanent
   `seen_<update_id>` property for *every* message and never deleted them.
   Google Apps Script caps the property store at ~500 KB, and the earlier
   "flood" filled it up. Once full, every `setProperty()` call throws an
   error — and `doPost` swallowed all errors, so `/start` and name replies
   silently did nothing. The new code uses `CacheService` for deduplication
   (entries auto-expire after 6 hours), and includes a one-time
   `cleanupProperties()` function to purge the old keys.

2. **Editing the code does NOT update the live bot.** Apps Script keeps
   serving the code from the last *deployed version*. If you edit the script
   and just save, Telegram keeps hitting the old code forever.

## Setup steps (in order)

1. Open the Apps Script project and paste the code from `telegram_bot.gs`.
2. Set `TELEGRAM_TOKEN` to your bot token (from @BotFather).
3. Optionally set `SHEET_ID` to log completed leads to a Google Sheet.
4. In the editor, select **`cleanupProperties`** in the function dropdown and
   click **Run** once. Check the log — it should report removed `seen_*` keys.
5. **Deploy → New deployment → Web app**, with:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**  ← must be "Anyone", not "Anyone with Google account"
6. Copy the deployment URL (it ends in `/exec`) into `WEBAPP_URL`.
7. Select **`setWebhook`** and Run once. Log should say *Webhook was set*.
8. Select **`getWebhookInfo`** and Run. Confirm `url` matches your `/exec`
   URL and `last_error_message` is empty.
9. Message your bot `/start` — it should ask for your name.

## After every code change

**Deploy → Manage deployments → ✏️ (pencil) → Version: New version → Deploy.**
The URL stays the same, so you do NOT need to run `setWebhook` again — but
without a new version, your edits never go live.

## If it still doesn't respond

- Run `testToken()` — the log should show your bot's username. If not, the
  token is wrong.
- Run `getWebhookInfo()` — look at `last_error_message` and
  `pending_update_count`:
  - `Wrong response from the webhook: 401/403` → the web app isn't deployed
    with access "Anyone", or the URL is the `/dev` URL instead of `/exec`.
  - A big `pending_update_count` → run `setWebhook()` again; it drops the
    backlog (`drop_pending_updates=true`).
- Check **Apps Script → Executions** (left sidebar). Every Telegram message
  should show a `doPost` run. If runs appear but fail, the error message is
  now logged there. If no runs appear at all, Telegram isn't reaching the
  script — re-check steps 5–8.

## Conversation flow

1. `/start` → bot asks for the user's **name**
2. name → bot asks for the user's **email** (validated)
3. email → bot sends a **personal link** (`https://www.impedyme.com/?uid=<name-slug>`)
   and tells the user to open it in Chrome
4. bot then asks the user to open a new tab and Google each keyword and click
   the impedyme result: *grid emulator, motor emulator, power hardware in the
   loop, battery emulator*

`/reset` restarts the flow at any point.
