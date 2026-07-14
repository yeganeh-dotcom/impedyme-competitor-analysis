/**
 * Impedyme Telegram bot — Google Apps Script version (free hosting, no server).
 *
 * Same behavior as telegram_bot.py, but webhook-based instead of polling:
 * Telegram pushes each update to this web app, we reply and exit.
 *
 * ── SETUP (one time, ~5 minutes) ─────────────────────────────────────────
 * 1. Get a bot token from @BotFather on Telegram (/newbot).
 * 2. Go to https://script.google.com → New project → paste this file.
 * 3. Project Settings (gear icon) → Script properties → add:
 *      BOT_TOKEN  = your token from BotFather
 *      SHEET_ID   = (optional) ID of a Google Sheet to collect name/email leads
 * 4. Deploy → New deployment → type "Web app":
 *      Execute as:            Me
 *      Who has access:        Anyone
 *    Copy the web app URL (ends in /exec).
 * 5. Script properties → add:  WEBAPP_URL = that URL
 * 6. In the editor, select the function `setWebhook` and click Run
 *    (authorize when prompted). Check the log says {"ok":true,...}.
 * 7. Open your bot in Telegram and send /start. Done.
 *
 * NOTE: after editing this code you must Deploy → Manage deployments →
 * edit → New version, otherwise Telegram keeps hitting the old code.
 */

var KEYWORDS = [
  'grid emulator',
  'motor emulator',
  'power hardware in the loop',
  'battery emulator',
];

var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

// ── Telegram API helpers ────────────────────────────────────────────────

function tg(method, payload) {
  var token = PropertiesService.getScriptProperties().getProperty('BOT_TOKEN');
  return UrlFetchApp.fetch('https://api.telegram.org/bot' + token + '/' + method, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload),
    muteHttpExceptions: true,
  });
}

function sendText(chatId, text, withMenu) {
  var payload = { chat_id: chatId, text: text };
  if (withMenu) {
    payload.reply_markup = {
      inline_keyboard: [[
        { text: 'Start', callback_data: 'start_flow' },
        { text: 'Wallet', callback_data: 'wallet' },
      ]],
    };
  }
  tg('sendMessage', payload);
}

// ── Per-user conversation state (stored in script properties) ──────────

function getState(chatId) {
  var raw = PropertiesService.getScriptProperties().getProperty('state_' + chatId);
  return raw ? JSON.parse(raw) : null;
}

function setState(chatId, state) {
  PropertiesService.getScriptProperties().setProperty('state_' + chatId, JSON.stringify(state));
}

function clearState(chatId) {
  PropertiesService.getScriptProperties().deleteProperty('state_' + chatId);
}

// ── Webhook entry point ─────────────────────────────────────────────────

function doPost(e) {
  try {
    var update = JSON.parse(e.postData.contents);
    if (update.callback_query) {
      handleCallback(update.callback_query);
    } else if (update.message && update.message.text) {
      handleMessage(update.message);
    }
  } catch (err) {
    console.error(err);
  }
  return ContentService.createTextOutput('OK');
}

function handleCallback(query) {
  var chatId = query.message.chat.id;
  tg('answerCallbackQuery', { callback_query_id: query.id });

  if (query.data === 'wallet') {
    sendText(chatId, '💼 Wallet is coming soon. Stay tuned!', true);
  } else if (query.data === 'start_flow') {
    // Clicking Start always restarts the flow from step 1.
    setState(chatId, { step: 'NAME' });
    sendText(chatId, 'Step 1 of 3 📝\n\nPlease write your name:');
  }
}

function handleMessage(message) {
  var chatId = message.chat.id;
  var text = message.text.trim();

  if (text === '/start') {
    clearState(chatId);
    sendText(chatId, 'Welcome to the Impedyme bot! 👋\nChoose an option:', true);
    return;
  }

  var state = getState(chatId);
  if (!state) return; // not in the flow: stay silent, no nagging

  if (state.step === 'NAME') {
    if (!text) return;
    var firstName = text.split(/\s+/)[0];
    setState(chatId, { step: 'EMAIL', name: text, first: firstName });
    sendText(
      chatId,
      'Nice to meet you, ' + firstName + '! ✅\n\n' +
      'Step 2 of 3 📧\n\nPlease write your email:'
    );
  } else if (state.step === 'EMAIL') {
    if (!EMAIL_RE.test(text)) {
      sendText(
        chatId,
        "That doesn't look like a valid email. 🤔\n" +
        'Please write your email (e.g. name@example.com):'
      );
      return;
    }
    var link = 'https://www.impedyme.com/?uid=' + encodeURIComponent(state.first);
    logSignup(state.name, text, link);
    clearState(chatId);

    var keywordLines = KEYWORDS.map(function (kw) { return "  🔍 '" + kw + "'"; }).join('\n');
    sendText(
      chatId,
      'Step 3 of 3 🔗\n\n' +
      'Here is your personal link:\n\n' +
      link + '\n\n' +
      '👉 Open Chrome, put your personal link in the address bar, ' +
      'and open the website.\n\n' +
      'Then open a new tab and search these keywords, and click on the ' +
      'Impedyme website in the results:\n\n' +
      keywordLines + '\n\n' +
      "That's it — thank you! 🎉",
      true
    );
  }
}

// ── Lead logging (optional: set SHEET_ID script property) ──────────────

function logSignup(name, email, link) {
  console.log('New signup: ' + name + ' / ' + email + ' / ' + link);
  var sheetId = PropertiesService.getScriptProperties().getProperty('SHEET_ID');
  if (!sheetId) return;
  try {
    SpreadsheetApp.openById(sheetId)
      .getSheets()[0]
      .appendRow([new Date(), name, email, link]);
  } catch (err) {
    console.error('Sheet logging failed: ' + err);
  }
}

// ── One-time setup helper: run this manually from the editor ───────────

function setWebhook() {
  var props = PropertiesService.getScriptProperties();
  var token = props.getProperty('BOT_TOKEN');
  var url = props.getProperty('WEBAPP_URL');
  if (!token || !url) {
    throw new Error('Set BOT_TOKEN and WEBAPP_URL in Script properties first.');
  }
  var resp = UrlFetchApp.fetch(
    'https://api.telegram.org/bot' + token + '/setWebhook?url=' + encodeURIComponent(url)
  );
  Logger.log(resp.getContentText());
}
