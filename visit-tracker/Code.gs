var LOG_HEADERS = ["Timestamp", "User", "Visit ID", "Event", "Site", "Page", "Came From", "IP", "City", "Country", "User Agent"];
var SUMMARY_HEADERS = ["User", "Total Visits", "Total Time (minutes)", "First Seen", "Last Seen", "Sites Visited"];
var USER_TAB_PREFIX = "User - ";

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var row = [
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
  ];

  var log = getSheet_("Log", LOG_HEADERS);
  log.appendRow(row);

  if (data.uid) {
    var userSheet = getSheet_(userTabName_(data.uid), LOG_HEADERS);
    userSheet.appendRow(row);
  }

  return ContentService.createTextOutput("ok");
}

function backfillUserTabs() {
  var log = getSheet_("Log", LOG_HEADERS);
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

function updateSummary() {
  var log = getSheet_("Log", LOG_HEADERS);
  var rows = log.getDataRange().getValues().slice(1);

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
  out.sort(function (a, b) { return b[1] - a[1]; });

  var summary = getSheet_("Summary", SUMMARY_HEADERS);
  if (summary.getLastRow() > 1) {
    summary.getRange(2, 1, summary.getLastRow() - 1, SUMMARY_HEADERS.length).clearContent();
  }
  if (out.length) {
    summary.getRange(2, 1, out.length, SUMMARY_HEADERS.length).setValues(out);
  }
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu("Visit Tracker")
    .addItem("Update Summary", "updateSummary")
    .addItem("Create/Refresh User Tabs", "backfillUserTabs")
    .addToUi();
}

function userTabName_(uid) {
  // Sheet names can't contain / \ ? * [ ] : and are limited to 100 chars.
  var safe = String(uid).replace(/[\/\\\?\*\[\]:]/g, "-").trim();
  if (!safe) safe = "unknown";
  return (USER_TAB_PREFIX + safe).substring(0, 100);
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
