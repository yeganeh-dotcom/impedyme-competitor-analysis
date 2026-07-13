/**
 * Impedyme onboarding Telegram bot (hosted free on Google Apps Script)
 *
 * A short guided flow:
 *   1. Bot asks for the person's NAME.
 *   2. Bot asks for their EMAIL.
 *   3. Bot builds their personal tracking link and tells them to open it
 *      in Chrome (which records them from then on).
 *   4. Bot tells them to open a new tab and search a list of keywords,
 *      clicking the impedyme result each time.
 *
 * Send /start (or /reset) at any time to begin again.
 *
 * Setup (see README):
 *   1. @BotFather -> /newbot -> copy token into TELEGRAM_TOKEN.
 *   2. Deploy -> New deployment -> Web app (Execute as: Me, Access: Anyone).
 *   3. Paste the /exec URL into WEBAPP_URL, save.
 *   4. Select setWebhook in the toolbar and Run once (log: "Webhook was set").
 */

var TELEGRAM_TOKEN = "8878235298:AAFRvJH5iWTa0-bzGhDuZgN7fqhVP7sIV8U";
var WEBSITE = "https://www.impedyme.com/";

// Keywords the user is asked to search for and click the impedyme result.
var KEYWORDS = [
  "grid emulator",
  "motor emulator",
  "power hardware in the loop",
  "battery emulator",
];

// Optional: your visit-tracker spreadsheet ID (the long code in its URL,
// between /d/ and /edit). If set, each completed person is saved to a "Leads" tab.
var SHEET_ID = "";

// Paste your deployed Web App URL here, then run setWebhook() once.
var WEBAPP_URL = "PASTE_YOUR_WEBAPP_URL_HERE";

// ---------------------------------------------------------------------------

function doPost(e) {
  // ALWAYS return 200 "ok" so Telegram never retries (that caused the flood).
  try {
    handleUpdate_(e);
  } catch (err) {
    // swallow errors on purpose: a thrown error makes Telegram resend forever
  }
  return ContentService.createTextOutput("ok");
}

function handleUpdate_(e) {
  if (!e || !e.postData) return;
  var update = JSON.parse(e.postData.contents);
  var msg = update.message;
  if (!msg || !msg.text) return;

  // Ignore duplicate deliveries of the same update.
  var props = PropertiesService.getScriptProperties();
  var seenKey = "seen_" + update.update_id;
  if (props.getProperty(seenKey)) return;
  props.setProperty(seenKey, "1");

  var chatId = String(msg.chat.id);
  var text = msg.text.trim();

  if (text === "/start" || text === "/reset") {
    setState_(chatId, { step: "await_name" });
    reply_(chatId, "👋 Welcome to impedyme!\n\nLet's get you set up in a few quick steps.\n\nFirst, what is your *name*?");
    return;
  }

  var state = getState_(chatId);

  // No active flow -> start one.
  if (!state.step) {
    setState_(chatId, { step: "await_name" });
    reply_(chatId, "👋 Welcome to impedyme!\n\nFirst, what is your *name*?");
    return;
  }

  // Step 1 -> got name, ask for email.
  if (state.step === "await_name") {
    state.name = text;
    state.step = "await_email";
    setState_(chatId, state);
    reply_(chatId, "Thanks, *" + escapeMd_(text) + "*! 📧\n\nNow, what is your *email address*?");
    return;
  }

  // Step 2 -> got email, validate, then finish.
  if (state.step === "await_email") {
    if (!isEmail_(text)) {
      reply_(chatId, "That doesn't look like a valid email. Please send it again, e.g. name@company.com");
      return;
    }
    state.email = text;
    state.step = "done";
    setState_(chatId, state);
    finish_(chatId, state);
    return;
  }

  // Flow already done.
  reply_(chatId, "You're all set ✅\n\nSend /start if you'd like to begin again.");
}

function finish_(chatId, state) {
  var uid = slug_(state.name);
  var link = WEBSITE + "?uid=" + encodeURIComponent(uid);

  // Step 3: the personal link + how to open it.
  reply_(chatId,
    "✅ Here is your personal link:\n\n" + link + "\n\n" +
    "*Step 1:* Open *Google Chrome*, paste this link into the address bar, " +
    "and press Enter to open the impedyme website. Please browse a little.");

  // Step 4: the keyword searches.
  var lines = KEYWORDS.map(function (k, i) {
    return (i + 1) + ". " + k;
  }).join("\n");
  reply_(chatId,
    "*Step 2:* Open a *new tab* in Chrome and search Google for each of these, " +
    "then click the *impedyme* result each time:\n\n" + lines + "\n\n" +
    "That's it — thank you! 🙏");

  logLead_(state.name, state.email, uid, link);
}

// ---------------------------------------------------------------------------
// helpers

function isEmail_(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function slug_(name) {
  return String(name).toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "") || "user";
}

function escapeMd_(s) {
  return String(s).replace(/([_*\[\]`])/g, "\\$1");
}

function getState_(chatId) {
  var raw = PropertiesService.getScriptProperties().getProperty("state_" + chatId);
  return raw ? JSON.parse(raw) : {};
}

function setState_(chatId, state) {
  PropertiesService.getScriptProperties().setProperty("state_" + chatId, JSON.stringify(state));
}

function reply_(chatId, text) {
  UrlFetchApp.fetch("https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/sendMessage", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown",
      disable_web_page_preview: true,
    }),
    muteHttpExceptions: true,
  });
}

function logLead_(name, email, uid, link) {
  if (!SHEET_ID) return;
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName("Leads") || ss.insertSheet("Leads");
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Created", "Name", "Email", "UID", "Link"]);
      sheet.getRange(1, 1, 1, 5).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([new Date(), name, email, uid, link]);
  } catch (err) {}
}

// Run this once from the editor after deploying (connects Telegram to this script).
function setWebhook() {
  var res = UrlFetchApp.fetch(
    "https://api.telegram.org/bot" + TELEGRAM_TOKEN +
    "/setWebhook?url=" + encodeURIComponent(WEBAPP_URL) +
    "&drop_pending_updates=true"
  );
  Logger.log(res.getContentText()); // should say "Webhook was set"
}
