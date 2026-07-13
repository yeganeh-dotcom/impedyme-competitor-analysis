/**
 * Impedyme visit tracker — Google Apps Script backend
 *
 * Paste this into a Google Sheet's Apps Script editor (Extensions > Apps
 * Script) and deploy it as a Web App (see README.md, step 2).
 *
 * It creates two tabs in the Sheet:
 *   Log     — one row per event received from the website (raw data)
 *   Summary — one row per person: total visits, total time, last seen
 */

var LOG_HEADERS = ["Timestamp", "User", "Visit ID", "Event", "Site", "Page", "Came From", "IP", "City", "Country", "User Agent"];
var SUMMARY_HEADERS = ["User", "Total Visits", "Total Time (minutes)", "First Seen", "Last Seen", "Sites Visited"];

// Receives events from tracker.js
function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var log = getSheet_("Log", LOG_HEADERS);
  log.appendRow([
    data.ts || new Date().toISOString(),
    data.uid || "",
    data.visitId || "",
    data.type || "",
    data.site || "",
    data.page || "",
    data.referrer || "",
    data.ip || "",
    data.city || "",
    data.country || "",
    data.userAgent || "",
  ]);
  return ContentService.createTextOutput("ok");
}

// Rebuilds the Summary tab from the Log tab.
// Run it manually from the sheet menu ("Visit Tracker > Update Summary"),
// or add a time-driven trigger to run it every hour (README.md, step 4).
function updateSummary() {
  var log = getSheet_("Log", LOG_HEADERS);
  var rows = log.getDataRange().getValues().slice(1); // skip header

  // users[uid] = { visits: {visitId: {first, last}}, sites: {}, first, last }
  var users = {};
  rows.forEach(function (r) {
    var ts = new Date(r[0]);
    var uid = String(r[1]);
    var visitId = String(r[2]);
    var site = String(r[4]);
    if (!uid || isNaN(ts)) return;

    var u = users[uid] || (users[uid] = { visits: {}, sites: {}, first: ts, last: ts });
    if (ts < u.first) u.first = ts;
    if (ts > u.last) u.last = ts;
    if (site) u.sites[site] = true;

    var v = u.visits[visitId] || (u.visits[visitId] = { first: ts, last: ts });
    if (ts < v.first) v.first = ts;
    if (ts > v.last) v.last = ts;
  });

  var out = Object.keys(users).map(function (uid) {
    var u = users[uid];
    var totalMinutes = 0;
    Object.keys(u.visits).forEach(function (id) {
      var v = u.visits[id];
      // at least 1 minute per visit, even if only one event arrived
      totalMinutes += Math.max(1, Math.round((v.last - v.first) / 60000));
    });
    return [
      uid,
      Object.keys(u.visits).length,
      totalMinutes,
      u.first,
      u.last,
      Object.keys(u.sites).join(", "),
    ];
  });
  // most visits first
  out.sort(function (a, b) { return b[1] - a[1]; });

  var summary = getSheet_("Summary", SUMMARY_HEADERS);
  if (summary.getLastRow() > 1) {
    summary.getRange(2, 1, summary.getLastRow() - 1, SUMMARY_HEADERS.length).clearContent();
  }
  if (out.length) {
    summary.getRange(2, 1, out.length, SUMMARY_HEADERS.length).setValues(out);
  }
}

// Adds a "Visit Tracker" menu to the sheet
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Visit Tracker")
    .addItem("Update Summary", "updateSummary")
    .addToUi();
}

function getSheet_(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}
