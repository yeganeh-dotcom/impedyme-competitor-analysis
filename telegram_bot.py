"""Impedyme Telegram bot.

Shows two buttons: "Start" and "Wallet".

  - Wallet: placeholder for now, nothing opens.
  - Start: a 3-step flow (clicking Start again restarts it from step 1):
      1. Ask the user for their name; the reply greets them by first name.
      2. Ask the user for their email.
      3. One combined message: the personal link
         (https://www.impedyme.com/?uid=<first-name>) to open in Chrome,
         plus the instructions to open a new tab, search the keywords
         'grid emulator', 'motor emulator', 'power hardware in the loop',
         'battery emulator' and click on the Impedyme website.

Run:
    export TELEGRAM_BOT_TOKEN="123456:ABC-your-token-from-BotFather"
    pip install -r requirements-bot.txt
    python telegram_bot.py
"""

import logging
import os
import re
from urllib.parse import quote

from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.ext import (
    Application,
    CallbackQueryHandler,
    CommandHandler,
    ContextTypes,
    ConversationHandler,
    MessageHandler,
    filters,
)

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
)
logger = logging.getLogger(__name__)

ASK_NAME, ASK_EMAIL = range(2)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

KEYWORDS = [
    "grid emulator",
    "motor emulator",
    "power hardware in the loop",
    "battery emulator",
]


def main_menu_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        [
            [
                InlineKeyboardButton("Start", callback_data="start_flow"),
                InlineKeyboardButton("Wallet", callback_data="wallet"),
            ]
        ]
    )


async def start_command(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Handle /start: show the two-button main menu."""
    await update.message.reply_text(
        "Welcome to the Impedyme bot! 👋\nChoose an option:",
        reply_markup=main_menu_keyboard(),
    )


async def wallet_button(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    """Wallet button: placeholder, nothing to open yet."""
    query = update.callback_query
    await query.answer()
    await query.message.reply_text(
        "💼 Wallet is coming soon. Stay tuned!",
        reply_markup=main_menu_keyboard(),
    )


async def start_button(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Start button pressed: (re)start the flow, step 1 — ask for the name."""
    query = update.callback_query
    await query.answer()
    context.user_data.clear()
    await query.message.reply_text("Step 1 of 3 📝\n\nPlease write your name:")
    return ASK_NAME


async def receive_name(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Step 1 answer received: greet by first name, step 2 — ask for the email."""
    name = update.message.text.strip()
    if not name:
        return ASK_NAME

    first_name = name.split()[0]
    context.user_data["name"] = name
    context.user_data["first_name"] = first_name
    await update.message.reply_text(
        f"Nice to meet you, {first_name}! ✅\n\n"
        "Step 2 of 3 📧\n\nPlease write your email:"
    )
    return ASK_EMAIL


async def receive_email(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Step 2 answer received: validate email, then send the final combined step."""
    email = update.message.text.strip()
    if not EMAIL_RE.match(email):
        await update.message.reply_text(
            "That doesn't look like a valid email. 🤔\n"
            "Please write your email (e.g. name@example.com):"
        )
        return ASK_EMAIL

    context.user_data["email"] = email
    name = context.user_data.get("name", "")
    first_name = context.user_data.get("first_name", "user")
    personal_link = f"https://www.impedyme.com/?uid={quote(first_name)}"

    logger.info("New signup: name=%s email=%s link=%s", name, email, personal_link)

    # Step 3: personal link + keyword-search instructions in one message
    keyword_lines = "\n".join(f"  🔍 '{kw}'" for kw in KEYWORDS)
    await update.message.reply_text(
        "Step 3 of 3 🔗\n\n"
        "Here is your personal link:\n\n"
        f"{personal_link}\n\n"
        "👉 Open Chrome, put your personal link in the address bar, "
        "and open the website.\n\n"
        "Then open a new tab and search these keywords, and click on the "
        "Impedyme website in the results:\n\n"
        f"{keyword_lines}\n\n"
        "That's it — thank you! 🎉",
        reply_markup=main_menu_keyboard(),
    )
    return ConversationHandler.END


async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE) -> int:
    """Allow the user to cancel the flow with /cancel."""
    await update.message.reply_text(
        "Cancelled. You can start again anytime:",
        reply_markup=main_menu_keyboard(),
    )
    return ConversationHandler.END


def main() -> None:
    token = os.environ.get("TELEGRAM_BOT_TOKEN")
    if not token:
        raise SystemExit(
            "TELEGRAM_BOT_TOKEN environment variable is not set. "
            "Get a token from @BotFather on Telegram and run:\n"
            '  export TELEGRAM_BOT_TOKEN="your-token"'
        )

    application = Application.builder().token(token).build()

    conv_handler = ConversationHandler(
        entry_points=[CallbackQueryHandler(start_button, pattern="^start_flow$")],
        states={
            ASK_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, receive_name)],
            ASK_EMAIL: [MessageHandler(filters.TEXT & ~filters.COMMAND, receive_email)],
        },
        fallbacks=[CommandHandler("cancel", cancel)],
        # Clicking Start at any point restarts the flow from step 1.
        allow_reentry=True,
    )

    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(conv_handler)
    application.add_handler(CallbackQueryHandler(wallet_button, pattern="^wallet$"))

    logger.info("Bot is running. Press Ctrl+C to stop.")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
