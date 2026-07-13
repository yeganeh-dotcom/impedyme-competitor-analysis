// ============================================================================
// impedyme Telegram onboarding bot (Google Apps Script) — v2
//
// Flow:
//   1. User sends /start  -> bot asks for their name
//   2. User sends name    -> bot asks for their email
//   3. User sends email   -> bot sends a personal link + "open it in Chrome"
//   4. Bot sends the list of Google keywords to search and click impedyme
//
// Design notes (why v2 is robust):
//   - Conversation state lives in CacheService, NOT PropertiesService.
//     The old bot filled the 500KB Script Properties quota with permanent
//     "seen_" keys, after which every state save threw and the bot went
//     silent. The cache has no such quota and entries expire on their own.
//   - Errors are sent back to the user in Telegram, so nothing ever fails
//     silently again.
//   - Send /version to the bot to check which code version is live — if it
//     doesn't match BOT_VERSION below, you forgot to deploy a new version.
//
// SETUP:
//   1. Paste your bot token into TELEGRAM_TOKEN.
//   2. Deploy > New deployment > Web app, "Execute as: Me",
//      "Who has access: Anyone". Copy the /exec URL into WEBAPP_URL.
//   3. Run setWebhook() once. Run getWebhookInfo() to confirm no errors.
//   4. EVERY time you edit this code: Deploy > Manage deployments > pencil
//      icon > Version: New version > Deploy. Without this, Telegram keeps
//      hitting your OLD code. Verify with /version in the chat.
// ============================================================================

var TELEGRAM_TOKEN = "PASTE_YOUR_BOT_TOKEN_HERE";
var WEBSITE = "https://www.impedyme.com/";
var BOT_VERSION = "v2.0";

var KEYWORDS = [
  "grid emulator",
  "motor emulator",
  "power hardware in the loop",
  "battery emulator",
];

// Optional: spreadsheet ID (the long code in its URL between /d/ and /edit).
// If set, each completed person is saved to a "Leads" tab.
var SHEET_ID = "";

// Your deployed Web App URL (must end in /exec, NOT /dev).
var WEBAPP_URL = "PASTE_YOUR_WEBAPP_URL_HERE";

// ---------------------------------------------------------------------------
// Webhook entry point
// ---------------------------------------------------------------------------

function doPost(e) {
  var chatId = null;
  try {
    if (e && e.postData) {
      var update = JSON.parse(e.postData.contents);
      var msg = update.message;
      if (msg && msg.text && msg.chat) {
        chatId = String(msg.chat.id);
        handleMessage_(chatId, msg.text.trim());
      }
    }
  } catch (err) {
    console.error("doPost failed: " + err);
    // Surface the error in the chat so failures are never silent.
    if (chatId) {
      try { reply_(chatId, "⚠️ Bot error: " + err); } catch (ignore) {}
    }
  }
  // Always 200 OK so Telegram never retries/floods.
  return ContentService.createTextOutput("ok");
}

function handleMessage_(chatId, text) {
  if (text === "/version") {
    reply_(chatId, "Bot code version: " + BOT_VERSION);
    return;
  }

  if (text === "/start" || text === "/reset") {
    setState_(chatId, { step: "await_name" });
    reply_(chatId,
      "👋 Welcome to impedyme!\n\n" +
      "Let's get you set up in a few quick steps.\n\n" +
      "First, what is your name?");
    return;
  }

  var state = getState_(chatId);

  if (!state.step) {
    setState_(chatId, { step: "await_name" });
    reply_(chatId, "👋 Welcome to impedyme!\n\nFirst, what is your name?");
    return;
  }

  if (state.step === "await_name") {
    state.name = text;
    state.step = "await_email";
    setState_(chatId, state);
    reply_(chatId,
      "Thanks, " + text + "! 📧\n\nNow, what is your email address?");
    return;
  }

  if (state.step === "await_email") {
    if (!isEmail_(text)) {
      reply_(chatId,
        "That doesn't look like a valid email. " +
        "Please send it again, e.g. name@company.com");
      return;
    }
    state.email = text;
    state.step = "done";
    setState_(chatId, state);
    finish_(chatId, state);
    return;
  }

  reply_(chatId, "You're all set ✅\n\nSend /start if you'd like to begin again.");
}

function finish_(chatId, state) {
  var uid = slug_(state.name);
  var link = WEBSITE + "?uid=" + encodeURIComponent(uid);

  reply_(chatId,
    "✅ Here is your personal link:\n\n" + link + "\n\n" +
    "Step 1: Open Google Chrome, paste this link into the address bar, " +
    "and press Enter to open the impedyme website. Please browse a little.");

  var lines = KEYWORDS.map(function (k, i) {
    return (i + 1) + ". " + k;
  }).join("\n");
  reply_(chatId,
    "Step 2: Open a new tab in Chrome and search Google for each of these, " +
    "then click the impedyme result each time:\n\n" + lines + "\n\n" +
    "That's it — thank you! 🙏");

  logLead_(state.name, state.email, uid, link);
}

// ---------------------------------------------------------------------------
// Conversation state — stored in the script cache (no quota to fill up).
// Entries live 6 hours and are refreshed on every step; an onboarding chat
// takes a minute, so that is plenty. If a user waits longer, the bot simply
// starts over by asking their name again.
// ---------------------------------------------------------------------------

function getState_(chatId) {
  var raw = CacheService.getScriptCache().get("st_" + chatId);
  return raw ? JSON.parse(raw) : {};
}

function setState_(chatId, state) {
  CacheService.getScriptCache().put("st_" + chatId, JSON.stringify(state), 21600);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

function reply_(chatId, text) {
  var res = UrlFetchApp.fetch(
    "https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/sendMessage", {
      method: "post",
      contentType: "application/json",
      payload: JSON.stringify({
        chat_id: chatId,
        text: text,
        disable_web_page_preview: true,
      }),
      muteHttpExceptions: true,
    });
  if (res.getResponseCode() !== 200) {
    console.error("sendMessage failed: " + res.getContentText());
  }
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
  } catch (err) {
    console.error("logLead_ failed: " + err);
  }
}

// ---------------------------------------------------------------------------
// One-time / maintenance functions — run these manually from the editor
// ---------------------------------------------------------------------------

// Wipes the old (now unused) property store in one call. Run once to clear
// the leftover "seen_" flood keys; the bot itself no longer touches
// PropertiesService at all.
function cleanupProperties() {
  var props = PropertiesService.getScriptProperties();
  Logger.log("Before: " + props.getKeys().length + " keys");
  props.deleteAllProperties();
  Logger.log("After: " + props.getKeys().length + " keys (should be 0)");
}

// Run once after deploying. Points Telegram at your web app.
function setWebhook() {
  var res = UrlFetchApp.fetch(
    "https://api.telegram.org/bot" + TELEGRAM_TOKEN +
    "/setWebhook?url=" + encodeURIComponent(WEBAPP_URL) +
    "&drop_pending_updates=true"
  );
  Logger.log(res.getContentText()); // should say "Webhook was set"
}

// Diagnostic: shows where Telegram is sending updates, how many are
// pending, and the last delivery error if any.
function getWebhookInfo() {
  var res = UrlFetchApp.fetch(
    "https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/getWebhookInfo"
  );
  Logger.log(res.getContentText());
}

// Diagnostic: verifies the bot token is valid.
function testToken() {
  var res = UrlFetchApp.fetch(
    "https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/getMe",
    { muteHttpExceptions: true }
  );
  Logger.log(res.getContentText()); // should show your bot's username
}
