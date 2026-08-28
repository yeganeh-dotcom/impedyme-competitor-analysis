// ستون‌های جدید منطقه زمانی به انتهای هدرها اضافه شده‌اند، نه وسط آن،
// تا ردیف‌های قدیمی شیت به‌هم نریزند.
var LOG_HEADERS = ["Timestamp", "User", "Visit ID", "Event", "Site", "Page", "Came From", "IP", "City", "Country", "User Agent",
                   "Device Timezone", "TZ Offset", "IP Timezone", "Counted", "Reason"];
var SUMMARY_HEADERS = ["User", "Total Visits", "Total Time (minutes)", "First Seen", "Last Seen", "Sites Visited",
                       "Excluded Visits", "Excluded Reason"];
var USER_TAB_PREFIX = "User - ";

// ===== قانون ایران =====
var IRAN_OFFSET_MINUTES = 210;   // UTC+03:30 — هیچ کشور دیگری این آفست را ندارد
var IRAN_ZONE_IDS = ["Asia/Tehran", "Iran"];
var IRAN_REASON = "Iran timezone on device";

function isIranClock_(zoneId, offsetMinutes) {
  if (zoneId && IRAN_ZONE_IDS.indexOf(String(zoneId)) !== -1) return true;
  return offsetMinutes === IRAN_OFFSET_MINUTES;
}

function offsetLabel_(minutes) {
  if (minutes === null || minutes === undefined || minutes === "") return "";
  var sign = minutes < 0 ? "-" : "+";
  var abs = Math.abs(minutes);
  var hh = String(Math.floor(abs / 60));
  var mm = String(abs % 60);
  while (hh.length < 2) hh = "0" + hh;
  while (mm.length < 2) mm = "0" + mm;
  return "UTC" + sign + hh + ":" + mm;
}

function cityOf_(zoneId) {
  if (!zoneId) return "";
  var parts = String(zoneId).split("/");
  return parts[parts.length - 1].replace(/_/g, " ");
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);

  var deviceZone = data.timezone || "";
  var tzOffset = (typeof data.tzOffset === "number") ? data.tzOffset : null;
  var ipZone = data.ipTimezone || "";
  var ipOffset = (typeof data.ipTzOffset === "number") ? data.ipTzOffset : null;

  var iranClock = isIranClock_(deviceZone, tzOffset);
  var counted = iranClock ? "NO" : "YES";
  var reason = iranClock ? IRAN_REASON : "";

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
    deviceZone,
    offsetLabel_(tzOffset),
    ipZone ? ipZone + " (" + offsetLabel_(ipOffset) + ")" : "",
    counted,
    reason,
  ];

  var log = getSheet_("Log", LOG_HEADERS);
  log.appendRow(row);

  if (data.uid) {
    var userSheet = getSheet_(userTabName_(data.uid), LOG_HEADERS);
    userSheet.appendRow(row);
  }

  // هشدار تلگرام: فقط یک بار در هر ۶ ساعت برای هر کاربر، وگرنه
  // هر heartbeat یک پیام می‌فرستد و کاربر را غرق پیام می‌کند.
  if (iranClock && data.uid && shouldWarn_(data.uid)) {
    sendTimezoneWarning_(data.uid, data.country, ipZone, ipOffset, tzOffset);
  }

  return ContentService.createTextOutput("ok");
}

function shouldWarn_(uid) {
  var cache = CacheService.getScriptCache();
  var key = "tzwarn_" + uid;
  if (cache.get(key)) return false;
  cache.put(key, "1", 21600);   // ۶ ساعت، بیشترین مقدار مجاز CacheService
  return true;
}

/**
 * پیام هشدار در تلگرام. توکن ربات را در:
 *   Project Settings ← Script Properties ← BOT_TOKEN
 * بگذارید. اگر توکن نباشد، فقط از این بخش صرف‌نظر می‌شود و لاگ سر جایش می‌ماند.
 */
function sendTimezoneWarning_(uid, ipCountry, ipZone, ipOffset, deviceOffset) {
  var token = PropertiesService.getScriptProperties().getProperty("BOT_TOKEN");
  if (!token) return;

  var lines = [];
  lines.push("⚠️ ساعت لپ‌تاپ شما روی ایران است (" + offsetLabel_(deviceOffset) + ").");
  lines.push("");
  lines.push("فعالیت شما تا زمانی که منطقه زمانی را عوض نکنید کوین حساب نمی‌شود.");
  lines.push("");

  if (ipOffset !== null && ipOffset !== undefined) {
    var want = offsetLabel_(ipOffset);
    var city = cityOf_(ipZone);
    lines.push("IP شما از " + (ipCountry || "کشور دیگری") + " است و " + want + " دارد.");
    lines.push("در تنظیمات ساعت، شهری با اختلاف " + want + " انتخاب کنید" +
               (city ? " — مثلاً " + city + "." : "."));
  } else {
    lines.push("منطقه زمانی را روی همان کشوری بگذارید که VPN شما روی آن است.");
  }

  lines.push("");
  lines.push("مسیر: Settings ← Time & language ← Date & time");
  lines.push("گزینه «Set time zone automatically» را خاموش کنید.");

  UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/sendMessage", {
    method: "post",
    payload: { chat_id: String(uid), text: lines.join("\n") },
    muteHttpExceptions: true
  });
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

    var u = users[uid] || (users[uid] = {
      visits: {}, sites: {}, first: ts, last: ts, excluded: {}, reasons: {}
    });
    if (ts < u.first) u.first = ts;
    if (ts > u.last) u.last = ts;
    if (site) u.sites[site] = true;

    // ردیف‌های ایران کوین حساب نمی‌شوند: از بازدید و زمان کنار گذاشته
    // می‌شوند و فقط در ستون Excluded شمرده می‌شوند.
    // ردیف‌های قدیمی که ستون Counted ندارند خالی‌اند و معتبر شمرده می‌شوند.
    if (String(r[14]) === "NO") {
      u.excluded[visitId] = true;
      if (r[15]) u.reasons[String(r[15])] = true;
      return;
    }

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
      Object.keys(u.excluded).length,
      Object.keys(u.reasons).join(", "),
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
    return sheet;
  }
  // شیت‌هایی که از قبل وجود دارند هدرهای جدید را ندارند؛ اینجا اضافه می‌شوند.
  if (sheet.getMaxColumns() < headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  }
  if (sheet.getLastColumn() < headers.length) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
  }
  return sheet;
}
