/**
 * ==========================================================================================
 *  IMPEDYME VISIT LOGGER  —  Google Apps Script attached to the tracking spreadsheet
 * ==========================================================================================
 *
 *  WHAT THIS FILE DOES
 *  -------------------
 *  1. Receives every event sent by the website footer (tracker-footer.html).
 *  2. Writes it to the "Log" sheet and to a per-user tab ("User - saraahmadi482913").
 *  3. Gives you menu tools: Summary, rebuild user tabs, and a Timezone report that shows
 *     exactly which users are still on Asia/Tehran.
 *
 *  IMPORTANT — the column order below must match SECTION 4 (COL) of bot.gs.
 *  If you add a column in the middle, the bot will read the wrong values.
 *  Always add new columns at the END.
 *
 *  SETUP
 *  -----
 *  a) Extensions -> Apps Script inside the spreadsheet, paste this file.
 *  b) Deploy -> New deployment -> Web app -> Execute as: Me, Access: Anyone.
 *  c) Put that /exec URL into CONFIG.ENDPOINT of tracker-footer.html.
 *  d) Reload the spreadsheet: a "Visit Tracker" menu appears.
 * ==========================================================================================
 */


/* ==========================================================================================
 * SECTION 1 — CONFIG
 * ========================================================================================== */
var CONFIG = {

  LOG_SHEET_NAME:     "Log",         // sheet that keeps every event of every user
  SUMMARY_SHEET_NAME: "Summary",     // per-user totals
  TIMEZONE_SHEET_NAME:"Timezone Check",  // report of users with a wrong timezone
  USER_TAB_PREFIX:    "User - ",     // must match SETTINGS.USER_TAB_PREFIX in bot.gs

  // Timezones treated as "wrong" in the Timezone Check report.
  // Keep this identical to TZ_RULES in bot.gs.
  BLOCKED_TIMEZONE_KEYWORDS: ["tehran", "iran"],
  BLOCKED_COUNTRIES:         ["iran"],

  // Colour used to highlight blocked rows in the report. "" = no colouring.
  BLOCKED_ROW_COLOR: "#f8d7da"
};


/* ==========================================================================================
 * SECTION 2 — COLUMNS
 * ------------------------------------------------------------------------------------------
 * Column order of "Log" and of every "User - ..." tab.
 * The bot reads: Event(D), Page(F), Came From(G), Country(J), Timezone(K).
 * ADD NEW COLUMNS AT THE END ONLY.
 * ========================================================================================== */
var LOG_HEADERS = [
  "Timestamp",       // A  0
  "User",            // B  1
  "Visit ID",        // C  2
  "Event",           // D  3
  "Site",            // E  4
  "Page",            // F  5
  "Came From",       // G  6
  "IP",              // H  7
  "City",            // I  8
  "Country",         // J  9
  "Timezone",        // K 10  <-- the bot checks this one for Asia/Tehran
  "User Agent",      // L 11
  "TZ Offset (min)"  // M 12  <-- minutes ahead of UTC: Tehran = 210, Rome summer = 120
];

var SUMMARY_HEADERS = [
  "User", "Total Visits", "Total Time (minutes)", "First Seen", "Last Seen", "Sites Visited"
];

var TIMEZONE_HEADERS = [
  "User", "Last Seen", "Last Timezone", "TZ Offset (min)", "Last Country", "Last City",
  "Blocked Events", "Total Events", "Status"
];


/* ==========================================================================================
 * SECTION 3 — RECEIVING DATA FROM THE WEBSITE
 * ========================================================================================== */

/**
 * Called by the footer script on every pageview and heartbeat.
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Build the row in exactly the LOG_HEADERS order.
    var row = [
      data.ts        || new Date().toISOString(),
      data.uid       || "",
      data.visitId   || "",
      data.type      || "",
      data.site      || "",
      data.page      || "",
      data.referrer  || "",
      data.ip        || "",
      data.city      || "",
      data.country   || "",
      data.timezone  || "Unknown",     // sent by Intl.DateTimeFormat() in the browser
      data.userAgent || "",
      (data.tzOffset === 0 || data.tzOffset) ? data.tzOffset : ""
    ];

    // 1) the shared log
    getSheet_(CONFIG.LOG_SHEET_NAME, LOG_HEADERS).appendRow(row);

    // 2) the user's own tab (this is what the bot reads)
    if (data.uid) getSheet_(userTabName_(data.uid), LOG_HEADERS).appendRow(row);

    return ContentService.createTextOutput("ok");
  } catch (err) {
    console.error("doPost failed: " + err);
    return ContentService.createTextOutput("Error: " + err.message);
  }
}


/* ==========================================================================================
 * SECTION 4 — REPORTS (run them from the "Visit Tracker" menu)
 * ========================================================================================== */

/**
 * Per-user totals: visits, minutes spent, first/last seen.
 */
function updateSummary() {
  var log = getSheet_(CONFIG.LOG_SHEET_NAME, LOG_HEADERS);
  if (log.getLastRow() < 2) return;

  var rows  = log.getDataRange().getValues().slice(1);
  var users = {};

  rows.forEach(function (r) {
    var when    = new Date(r[0]);
    var uid     = String(r[1]);
    var visitId = String(r[2]);
    var site    = String(r[4]);
    if (!uid || isNaN(when.getTime())) return;

    var user = users[uid] || (users[uid] = { visits: {}, sites: {}, first: when, last: when });
    if (when < user.first) user.first = when;
    if (when > user.last)  user.last  = when;
    if (site) user.sites[site] = true;

    var visit = user.visits[visitId] || (user.visits[visitId] = { first: when, last: when });
    if (when < visit.first) visit.first = when;
    if (when > visit.last)  visit.last  = when;
  });

  var out = Object.keys(users).map(function (uid) {
    var user = users[uid];
    var minutes = 0;
    Object.keys(user.visits).forEach(function (id) {
      var visit = user.visits[id];
      minutes += Math.max(1, Math.round((visit.last - visit.first) / 60000));
    });
    return [uid, Object.keys(user.visits).length, minutes,
            user.first, user.last, Object.keys(user.sites).join(", ")];
  });

  out.sort(function (a, b) { return b[1] - a[1]; });   // most visits first
  writeReport_(CONFIG.SUMMARY_SHEET_NAME, SUMMARY_HEADERS, out);
}


/**
 * >>> TIMEZONE CHECK <<<
 * Lists every user and marks the ones whose laptop timezone is Asia/Tehran (or whose IP is
 * Iranian), plus how many of their events were rejected because of it.
 * This is the admin view of the same rule the bot uses to warn users.
 */
function buildTimezoneReport() {
  var log = getSheet_(CONFIG.LOG_SHEET_NAME, LOG_HEADERS);
  if (log.getLastRow() < 2) return;

  var rows  = log.getDataRange().getValues().slice(1);
  var users = {};

  rows.forEach(function (r) {
    var uid = String(r[1]);
    if (!uid) return;
    var when = new Date(r[0]);
    if (isNaN(when.getTime())) return;

    var user = users[uid] || (users[uid] = {
      last: null, timezone: "", offset: "", country: "", city: "", blocked: 0, total: 0
    });

    user.total++;
    var blocked = isBlockedTimezone_(r[10]) || isBlockedCountry_(r[9]);
    if (blocked) user.blocked++;

    if (!user.last || when > user.last) {
      user.last     = when;
      user.timezone = String(r[10] || "");
      user.offset   = r[12] === "" || r[12] === undefined ? "" : r[12];
      user.country  = String(r[9] || "");
      user.city     = String(r[8] || "");
    }
  });

  var out = Object.keys(users).map(function (uid) {
    var u = users[uid];
    var status = isBlockedTimezone_(u.timezone) ? "❌ WRONG TIMEZONE"
               : isBlockedCountry_(u.country)   ? "⛔️ IRAN IP (VPN off)"
               : "✅ OK";
    return [uid, u.last, u.timezone, u.offset, u.country, u.city, u.blocked, u.total, status];
  });

  // Worst offenders first: most blocked events at the top.
  out.sort(function (a, b) { return b[6] - a[6]; });

  var sheet = writeReport_(CONFIG.TIMEZONE_SHEET_NAME, TIMEZONE_HEADERS, out);

  // Colour the problem rows so they are easy to spot.
  if (CONFIG.BLOCKED_ROW_COLOR && out.length) {
    out.forEach(function (row, index) {
      if (row[8].indexOf("✅") === -1) {
        sheet.getRange(index + 2, 1, 1, TIMEZONE_HEADERS.length)
             .setBackground(CONFIG.BLOCKED_ROW_COLOR);
      }
    });
  }
}


/**
 * Rebuilds every "User - ..." tab from the Log sheet.
 * Use it after editing the Log by hand, or after adding a column.
 */
function backfillUserTabs() {
  var log = getSheet_(CONFIG.LOG_SHEET_NAME, LOG_HEADERS);
  if (log.getLastRow() < 2) return;

  var rows = log.getRange(2, 1, log.getLastRow() - 1, LOG_HEADERS.length).getValues();
  var byUser = {};

  rows.forEach(function (r) {
    var uid = String(r[1]);
    if (!uid) return;
    (byUser[uid] || (byUser[uid] = [])).push(r);
  });

  Object.keys(byUser).forEach(function (uid) {
    var sheet = getSheet_(userTabName_(uid), LOG_HEADERS);
    if (sheet.getLastRow() > 1) {
      sheet.getRange(2, 1, sheet.getLastRow() - 1, LOG_HEADERS.length).clearContent();
    }
    sheet.getRange(2, 1, byUser[uid].length, LOG_HEADERS.length).setValues(byUser[uid]);
  });
}


/**
 * Adds any missing header (for example the new "TZ Offset (min)" column) to sheets that
 * were created before. Run it once from the menu after updating this file.
 */
function repairAllHeaders() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.getSheets().forEach(function (sheet) {
    var name = sheet.getName();
    if (name === CONFIG.LOG_SHEET_NAME || name.indexOf(CONFIG.USER_TAB_PREFIX) === 0) {
      ensureHeaders_(sheet, LOG_HEADERS);
    }
  });
  SpreadsheetApp.getActive().toast("Headers checked.");
}


/* ==========================================================================================
 * SECTION 5 — MENU
 * ========================================================================================== */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Visit Tracker")
    .addItem("Update Summary",        "updateSummary")
    .addItem("Timezone Check",        "buildTimezoneReport")
    .addItem("Refresh User Tabs",     "backfillUserTabs")
    .addSeparator()
    .addItem("Repair Headers",        "repairAllHeaders")
    .addToUi();
}


/* ==========================================================================================
 * SECTION 6 — HELPERS
 * ========================================================================================== */

/** true when a timezone string is one of the blocked ones (e.g. Asia/Tehran). */
function isBlockedTimezone_(timezone) {
  var tz = String(timezone || "").toLowerCase();
  if (!tz) return false;
  return CONFIG.BLOCKED_TIMEZONE_KEYWORDS.some(function (word) {
    return word && tz.indexOf(word) !== -1;
  });
}

/** true when an IP country is blocked (e.g. Iran = VPN is off). */
function isBlockedCountry_(country) {
  var c = String(country || "").toLowerCase();
  if (!c) return false;
  return CONFIG.BLOCKED_COUNTRIES.some(function (blocked) {
    return blocked && c.indexOf(blocked) !== -1;
  });
}

/** Turns a uid into a safe tab name, e.g. "User - saraahmadi482913". */
function userTabName_(uid) {
  var safe = String(uid).replace(/[\/\\\?\*\[\]:]/g, "-").trim() || "unknown";
  return (CONFIG.USER_TAB_PREFIX + safe).substring(0, 100);
}

/** Finds a sheet, creating it with the given headers if it does not exist yet. */
function getSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);

  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
    return sheet;
  }

  ensureHeaders_(sheet, headers);
  return sheet;
}

/** Writes missing headers into an existing sheet without touching its data. */
function ensureHeaders_(sheet, headers) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
    return;
  }

  var width   = Math.max(sheet.getLastColumn(), headers.length);
  var current = sheet.getRange(1, 1, 1, width).getValues()[0];
  var changed = false;

  for (var i = 0; i < headers.length; i++) {
    if (String(current[i] || "") !== headers[i]) { current[i] = headers[i]; changed = true; }
  }
  if (changed) {
    sheet.getRange(1, 1, 1, width).setValues([current]).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
}

/** Clears a report sheet and writes fresh rows into it. */
function writeReport_(name, headers, rows) {
  var sheet = getSheet_(name, headers);
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, headers.length).clearContent();
    sheet.getRange(2, 1, sheet.getMaxRows() - 1, headers.length).setBackground(null);
  }
  if (rows.length) sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  return sheet;
}
