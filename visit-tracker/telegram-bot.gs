/**
 * Impedyme link-maker Telegram bot (hosted free on Google Apps Script)
 *
 * Send the bot a name ("mahdi") and it replies with that person's
 * personal tracking link (https://www.impedyme.com/?uid=mahdi).
 *
 * Setup (see visit-tracker/README.md or ask Claude):
 *   1. In Telegram, message @BotFather -> /newbot -> copy the token.
 *   2. Create a NEW Apps Script project at script.google.com, paste this file.
 *   3. Fill in TELEGRAM_TOKEN below (and SHEET_ID if you want links logged).
 *   4. Deploy -> New deployment -> Web app (Execute as: Me, Access: Anyone),
 *      copy the web app URL into WEBAPP_URL below and save.
 *   5. In the editor toolbar select the function "setWebhook" and click Run.
 *   6. Message your bot a name. Done.
 */

var TELEGRAM_TOKEN = "PASTE_YOUR_BOT_TOKEN_HERE";
var WEBSITE = "https://www.impedyme.com/";

// Optional: your visit-tracker spreadsheet ID (the long code in its URL,
// between /d/ and /edit). If set, every created link is saved in a "Links" tab.
var SHEET_ID = "";

// Optional: Telegram usernames allowed to use the bot (without @).
// Leave empty [] to let anyone who finds the bot use it.
var ALLOWED_USERNAMES = [];

// Paste your deployed Web App URL here, then run setWebhook() once.
var WEBAPP_URL = "PASTE_YOUR_WEBAPP_URL_HERE";

function doPost(e) {
  var update = JSON.parse(e.postData.contents);
  var msg = update.message;
  if (!msg || !msg.text) return ok_();

  var chatId = msg.chat.id;
  var username = (msg.from && msg.from.username) || "";

  if (ALLOWED_USERNAMES.length && ALLOWED_USERNAMES.indexOf(username) < 0) {
    reply_(chatId, "Sorry, this is a private bot.");
    return ok_();
  }

  var text = msg.text.trim();
  if (text === "/start" || text === "/help") {
    reply_(chatId,
      "Send me a person's name and I'll give you their personal tracking link.\n\n" +
      "Example: send\n  mahdi\nand you get\n  " + WEBSITE + "?uid=mahdi\n\n" +
      "Tips: use a unique name per person; spaces become dashes.");
    return ok_();
  }

  // "Ali Rezaei" -> "ali-rezaei"
  var name = text.toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!name) {
    reply_(chatId, "I couldn't make a link from that. Send a simple name, e.g.  mahdi  or  ali-rezaei");
    return ok_();
  }

  var link = WEBSITE + "?uid=" + encodeURIComponent(name);
  reply_(chatId,
    "Personal link for “" + name + "”:\n\n" + link + "\n\n" +
    "Send it to them — they click it once, and every visit after that is recorded under this name.");
  logLink_(name, link, username);
  return ok_();
}

function reply_(chatId, text) {
  UrlFetchApp.fetch("https://api.telegram.org/bot" + TELEGRAM_TOKEN + "/sendMessage", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({ chat_id: chatId, text: text, disable_web_page_preview: true }),
    muteHttpExceptions: true,
  });
}

function logLink_(name, link, createdBy) {
  if (!SHEET_ID) return;
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName("Links") || ss.insertSheet("Links");
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Created", "Name", "Link", "Created by (Telegram)"]);
      sheet.getRange(1, 1, 1, 4).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }
    sheet.appendRow([new Date(), name, link, createdBy]);
  } catch (err) {}
}

function ok_() {
  return ContentService.createTextOutput("ok");
}

// Run this once from the editor after deploying (connects Telegram to this script)
function setWebhook() {
  var res = UrlFetchApp.fetch(
    "https://api.telegram.org/bot" + TELEGRAM_TOKEN +
    "/setWebhook?url=" + encodeURIComponent(WEBAPP_URL)
  );
  Logger.log(res.getContentText()); // should say "Webhook was set"
}
