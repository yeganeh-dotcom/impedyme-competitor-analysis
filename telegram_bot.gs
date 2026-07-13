// ============================================================================
// impedyme Telegram onboarding bot (Google Apps Script)
//
// Flow:
//   1. User sends /start  -> bot asks for their name
//   2. User sends name    -> bot asks for their email
//   3. User sends email   -> bot sends a personal link + "open it in Chrome"
//   4. Bot sends the list of Google keywords to search and click impedyme
//
// SETUP (do these in order — see TELEGRAM_BOT_SETUP.md for details):
//   1. Paste your bot token into TELEGRAM_TOKEN below.
//   2. Run cleanupProperties() ONCE (fixes a full property store — this is
//      what made the old bot go silent).
//   3. Deploy > New deployment > Web app, "Execute as: Me",
//      "Who has access: Anyone". Copy the /exec URL into WEBAPP_URL.
//   4. Run setWebhook() once. Run getWebhookInfo() to confirm.
//   5. IMPORTANT: every time you edit this code you MUST publish a new
//      deployment version (Deploy > Manage deployments > pencil icon >
//      Version: New version > Deploy), otherwise Telegram keeps hitting
//      the OLD code.
// ============================================================================

var TELEGRAM_TOKEN = "PASTE_YOUR_BOT_TOKEN_HERE";
var WEBSITE = "https://www.impedyme.com/";

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
  try {
    handleUpdate_(e);
  } catch (err) {
    // Log instead of swallowing silently, so failures are visible in
    // Apps Script > Executions. Still return "ok" so Telegram won't retry.
    console.error("doPost failed: " + err);
  }
  return ContentService.createTextOutput("ok");
}

function handleUpdate_(e) {
  if (!e || !e.postData) return;
  var update = JSON.parse(e.postData.contents);
  var msg = update.message;
  if (!msg || !msg.text) return;

  // Deduplicate retried updates using CacheService, which auto-expires.
  // (The old version stored a permanent "seen_" Script Property per message,
  // which filled the 500KB property quota and made every handler throw.)
  var cache = CacheService.getScriptCache();
  var seenKey = "seen_" + update.update_id;
  if (cache.get(seenKey)) return;
  cache.put(seenKey, "1", 21600); // remember for 6 hours, then auto-delete

  var chatId = String(msg.chat.id);
  var text = msg.text.trim();

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

function getState_(chatId) {
  var raw = PropertiesService.getScriptProperties().getProperty("state_" + chatId);
  return raw ? JSON.parse(raw) : {};
}

function setState_(chatId, state) {
  PropertiesService.getScriptProperties()
    .setProperty("state_" + chatId, JSON.stringify(state));
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

// Run ONCE to wipe the property store (the old "seen_..." flood keys filled
// its 500KB quota and made state saves throw). Deleting keys one-by-one can
// exceed the 6-minute execution limit with thousands of keys, so this wipes
// everything in a single call. Users just send /start again afterwards.
function cleanupProperties() {
  var props = PropertiesService.getScriptProperties();
  Logger.log("Before: " + props.getKeys().length + " keys");
  props.deleteAllProperties();
  Logger.log("After: " + props.getKeys().length + " keys (should be 0)");
}

// Diagnostic: how many keys are currently in the property store.
// Anything in the hundreds/thousands means the store is (nearly) full.
function showStorageUsage() {
  var keys = PropertiesService.getScriptProperties().getKeys();
  Logger.log(keys.length + " keys in the property store");
  Logger.log("First 20: " + JSON.stringify(keys.slice(0, 20)));
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

// Diagnostic: shows where Telegram is currently sending updates,
// how many are pending, and the last delivery error if any.
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
