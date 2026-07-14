# Impedyme Telegram Bot

A Telegram bot with two buttons: **Start** and **Wallet**.

- **Wallet** — placeholder for now (shows "coming soon").
- **Start** — runs a 3-step flow (clicking Start again restarts it):
  1. Asks the user to write their **name**; the bot greets them back by
     their first name.
  2. Asks the user to write their **email**.
  3. Sends one combined message with the **personal link** built from the
     user's first name (`https://www.impedyme.com/?uid=<first-name>`) to
     open in Chrome, plus instructions to open a new tab, search these
     keywords, and click on the Impedyme website:
     `grid emulator`, `motor emulator`, `power hardware in the loop`,
     `battery emulator`.

The bot never nags: it asks each question once and simply waits for the
user's reply.

## Setup

1. Create a bot with [@BotFather](https://t.me/BotFather) on Telegram
   (`/newbot`) and copy the token it gives you.

2. Install the dependency:

   ```bash
   pip install -r requirements-bot.txt
   ```

3. Set the token and run the bot:

   ```bash
   export TELEGRAM_BOT_TOKEN="123456:ABC-your-token"
   python telegram_bot.py
   ```

4. Open your bot in Telegram and send `/start` — the Start / Wallet
   buttons will appear.

## Notes

- Users can type `/cancel` at any point in the flow to go back to the menu.
- Each signup (name, email, personal link) is written to the bot's log
  output; you can hook this up to a spreadsheet or database later.
- The bot must keep running to answer users — for production, host it on
  a small server (or any always-on machine) instead of your laptop.
