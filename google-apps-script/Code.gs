/**
 * Impedyme Telegram bot — Google Apps Script version (free hosting, no server).
 *
 * Webhook-based and fully STATELESS: each question is sent with
 * force_reply, and the incoming answer carries the question it replies
 * to, so the bot knows which step it's on without storing anything.
 *
 * ── SETUP (one time) ─────────────────────────────────────────────────────
 * 1. Get a bot token from @BotFather on Telegram (/newbot).
 * 2. Go to https://script.google.com → New project → paste this file.
 * 3. Project Settings (gear icon) → Script properties → add:
 *      BOT_TOKEN  = your token from BotFather
 *      SHEET_ID   = (optional) ID of a Google Sheet to collect name/email leads
 * 4. Deploy → New deployment → type "Web app":
 *      Execute as: Me / Who has access: Anyone. Copy the /exec URL.
 * 5. Script properties → add:  WEBAPP_URL = that URL
 * 6. Run setWebhook() once from the editor.
 *
 * NOTE: after ANY code edit you must publish it: Deploy → Manage
 * deployments → pencil icon → Version: "New version" → Deploy.
 * Telegram keeps hitting the old code until you do.
 */

var VERSION = 'v4';

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

// A question the user answers by replying; the answer carries the
// question text, which is how the stateless flow knows the current step.
function askText(chatId, text) {
  tg('sendMessage', {
    chat_id: chatId,
    text: text,
    reply_markup: { force_reply: true },
  });
}

// ── Webhook entry point ─────────────────────────────────────────────────

function doPost(e) {
  try {
    var update = JSON.parse(e.postData.contents);

    // Telegram re-sends an update when it isn't sure we received it;
    // remember handled update_ids so no reply is ever sent twice.
    var cache = CacheService.getScriptCache();
    var dedupeKey = 'upd_' + update.update_id;
    if (cache.get(dedupeKey)) {
      return ContentService.createTextOutput('OK');
    }
    cache.put(dedupeKey, '1', 21600);

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
    // Clicking Start always (re)starts the flow at step 1.
    askText(chatId, 'Step 1 of 3 📝\n\nPlease write your name:');
  }
}

function handleMessage(message) {
  var chatId = message.chat.id;
  var text = message.text.trim();

  if (text === '/start') {
    sendText(
      chatId,
      'Welcome to the Impedyme bot! 👋 (' + VERSION + ')\nChoose an option:',
      true
    );
    return;
  }

  // Which question is this message answering?
  var replied =
    message.reply_to_message && message.reply_to_message.text
      ? message.reply_to_message.text
      : '';

  if (replied.indexOf('write your name') !== -1) {
    // Step 1 answered → greet by first name, ask for email.
    if (!text) return;
    var firstName = text.split(/\s+/)[0];
    askText(
      chatId,
      'Nice to meet you, ' + firstName + '! ✅\n\n' +
      'Step 2 of 3 📧\n\nPlease write your email:'
    );
  } else if (replied.indexOf('write your email') !== -1) {
    // Step 2 answered → validate, then send the final combined message.
    var m =
      replied.match(/Nice to meet you, (.+?)!/) ||
      replied.match(/^Sorry (.+?),/);
    var first = m ? m[1] : 'user';

    if (!EMAIL_RE.test(text)) {
      askText(
        chatId,
        'Sorry ' + first + ", that doesn't look like a valid email. 🤔\n" +
        'Please write your email (e.g. name@example.com):'
      );
      return;
    }

    var link = 'https://www.impedyme.com/?uid=' + encodeURIComponent(first);
    logSignup(first, text, link);

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
  } else {
    // Text outside the flow: one gentle pointer, never repeated on its own.
    sendText(chatId, 'Please tap Start to begin 👇', true);
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
  // drop_pending_updates clears any backlog of stale queued messages.
  var resp = UrlFetchApp.fetch(
    'https://api.telegram.org/bot' + token + '/setWebhook?url=' +
    encodeURIComponent(url) + '&drop_pending_updates=true'
  );
  Logger.log(resp.getContentText());
}
