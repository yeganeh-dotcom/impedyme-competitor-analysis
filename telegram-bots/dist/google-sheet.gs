/**
 * ============================================================
 *  Logger.gs  —  (OPTIONAL upgrade) script bound to the Google Sheet that receives
 *  website events. Paste it over your current sheet script, then
 *  Deploy → Manage deployments → ✏️ Edit → Version: "New version" → Deploy
 *  (the /exec URL stays the same, so the website footer keeps working).
 *
 *  Changes vs. the old version (columns 1–13 are unchanged, the bots rely on them):
 *   1. Column A "Timestamp" = server time (users can't fake the hour any more);
 *      the browser time is kept in column 14 "Client Time".
 *   2. Sponsored detection also looks at the URL query (?gclid=… etc.).
 *      The old footer only sent location.pathname, so ads were never detected.
 *      Use the new footer.html to send `query` as well.
 *   3. New per-user tabs are created small (16 columns, few rows) instead of
 *      1000×26 = 26,000 cells each. Google Sheets stops working at 10 million cells.
 *   4. Optional trimMasterLog(): removes old rows from the big "Log" tab
 *      (per-user tabs keep everything the bots need).
 * ============================================================
 */
var LOG_HEADERS = [
  "Timestamp", "User", "Visit ID", "Event", "Site", "Page", "Came From", "IP", "City", "Country", "Timezone", "User Agent", "Traffic Type", "Client Time"
];
var USER_TAB_PREFIX = "User - ";
var USER_TAB_COLUMNS = 16; // 14 logger columns + 2 columns the bots write (Credit, Credit Keyword)

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var query = String(data.query || "");
    var rawPage = String(data.page || "") + (query && query.charAt(0) !== "?" ? "?" + query : query);
    var rawRef = String(data.referrer || "");

    var isSponsored = checkIsSponsored(rawPage, rawRef);
    var eventType = String(data.type || "") + (isSponsored ? " [SPONSORED]" : "");

    var row = [
      new Date(),
      data.uid || "",
      data.visitId || "",
      eventType,
      data.site || "",
      rawPage,
      rawRef,
      data.ip || "",
      data.city || "",
      data.country || "",
      data.timezone || "Unknown",
      data.userAgent || "",
      isSponsored ? "SPONSORED_AD" : "ORGANIC",
      data.ts || ""
    ];

    getSheet_("Log", LOG_HEADERS, false).appendRow(row);
    if (data.uid) getSheet_(userTabName_(data.uid), LOG_HEADERS, true).appendRow(row);

    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.message);
  }
}

function checkIsSponsored(p, r) {
  p = String(p).toLowerCase();
  r = String(r).toLowerCase();
  if (/(gclid=|gad_source=|gbraid=|wbraid=|_gl=)/.test(p)) return true;
  if (/(utm_medium=cpc|utm_medium=paid|utm_source=google_ads|utm_source=adwords)/.test(p)) return true;
  if (/(\/aclk|googleads|doubleclick|adservice\.google)/.test(r)) return true;
  return false;
}

function getSheet_(name, headers, compact) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    if (compact) {
      try {
        if (sheet.getMaxColumns() > USER_TAB_COLUMNS) sheet.deleteColumns(USER_TAB_COLUMNS + 1, sheet.getMaxColumns() - USER_TAB_COLUMNS);
        if (sheet.getMaxRows() > 10) sheet.deleteRows(11, sheet.getMaxRows() - 10);
      } catch (e) {}
    }
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// Must stay identical to userTabName_ in the bots' Core.gs
function userTabName_(uid) {
  var safe = String(uid).replace(/[\/\?\*\[\]:]/g, "-").trim();
  return (USER_TAB_PREFIX + safe).substring(0, 100);
}

/** OPTIONAL: keep only the last `keepDays` days in the big "Log" tab. Run manually or from a daily trigger. */
function trimMasterLog(keepDays) {
  keepDays = keepDays || 30;
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log");
  if (!sh || sh.getLastRow() < 3) return;
  var cutoff = Date.now() - keepDays * 86400000;
  var times = sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues();
  var n = 0;
  while (n < times.length) {
    var t = times[n][0] instanceof Date ? times[n][0].getTime() : Date.parse(times[n][0]);
    if (isNaN(t) || t >= cutoff) break;
    n++;
  }
  if (n > 0) sh.deleteRows(2, n);
  Logger.log("Removed " + n + " old rows from Log");
}
