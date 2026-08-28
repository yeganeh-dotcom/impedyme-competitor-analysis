// Runs SheetLogger.gs under Node with stubbed Google globals.
// Usage: node tracker/test_tracker.js   (from the repo root)
const fs = require('fs');

// ---- fake Spreadsheet ----
function FakeSheet(name) {
  this.name = name; this.rows = []; this.maxCols = 26; this.frozen = 0;
}
FakeSheet.prototype.appendRow = function (r) { this.rows.push(r.slice()); };
FakeSheet.prototype.getLastRow = function () { return this.rows.length; };
FakeSheet.prototype.getLastColumn = function () {
  return this.rows.length ? Math.max(...this.rows.map(r => r.length)) : 0;
};
FakeSheet.prototype.getMaxColumns = function () { return this.maxCols; };
FakeSheet.prototype.insertColumnsAfter = function (after, n) { this.maxCols += n; };
FakeSheet.prototype.setFrozenRows = function (n) { this.frozen = n; };
FakeSheet.prototype.getDataRange = function () { return this.getRange(1, 1, this.rows.length, 99); };
FakeSheet.prototype.getRange = function (r, c, nr, nc) {
  const sheet = this;
  return {
    getValues() {
      const out = [];
      for (let i = 0; i < nr; i++) {
        const src = sheet.rows[r - 1 + i] || [];
        out.push(src.slice(c - 1, c - 1 + nc));
      }
      return out;
    },
    setValues(vals) {
      vals.forEach((row, i) => {
        const idx = r - 1 + i;
        while (sheet.rows.length <= idx) sheet.rows.push([]);
        row.forEach((v, j) => { sheet.rows[idx][c - 1 + j] = v; });
      });
      return this;
    },
    clearContent() {
      for (let i = 0; i < nr; i++) if (sheet.rows[r - 1 + i]) sheet.rows[r - 1 + i] = [];
      return this;
    },
    setFontWeight() { return this; },
  };
};

const sheets = {};
global.SpreadsheetApp = {
  getActiveSpreadsheet: () => ({
    getSheetByName: n => sheets[n] || null,
    insertSheet: n => (sheets[n] = new FakeSheet(n)),
  }),
};
const telegramSent = [];
global.UrlFetchApp = { fetch: (url, opts) => { telegramSent.push({ url, payload: opts.payload }); return {}; } };
const cache = {};
global.CacheService = { getScriptCache: () => ({ get: k => cache[k] || null, put: (k, v) => { cache[k] = v; } }) };
let props = { BOT_TOKEN: 'TEST_TOKEN' };
global.PropertiesService = { getScriptProperties: () => ({ getProperty: k => props[k] || null }) };
global.ContentService = { createTextOutput: t => t };

eval(fs.readFileSync('tracker/SheetLogger.gs', 'utf8'));

let pass = 0, fail = 0;
const eq = (label, got, want) => {
  if (JSON.stringify(got) === JSON.stringify(want)) pass++;
  else { fail++; console.log(`  FAIL ${label}\n    got  ${JSON.stringify(got)}\n    want ${JSON.stringify(want)}`); }
};
const post = d => doPost({ postData: { contents: JSON.stringify(d) } });
const COL = n => LOG_HEADERS.indexOf(n);

const base = { site: 'impedyme.com', page: '/', userAgent: 'UA' };

console.log('--- isIranClock_ ---');
eq('Asia/Tehran by zone id', isIranClock_('Asia/Tehran', 210), true);
eq('legacy "Iran" zone id', isIranClock_('Iran', 210), true);
eq('raw +03:30 offset with no zone id', isIranClock_('', 210), true);
eq('Europe/Rome is not Iran', isIranClock_('Europe/Rome', 120), false);
eq('Kabul +04:30 is not Iran', isIranClock_('Asia/Kabul', 270), false);
eq('India +05:30 is not Iran', isIranClock_('Asia/Kolkata', 330), false);
eq('unknown zone, UTC offset', isIranClock_('', 0), false);

console.log('--- offsetLabel_ ---');
eq('+03:30', offsetLabel_(210), 'UTC+03:30');
eq('+02:00', offsetLabel_(120), 'UTC+02:00');
eq('-05:00', offsetLabel_(-300), 'UTC-05:00');
eq('null is blank', offsetLabel_(null), '');

console.log('--- Iran user: logged, not counted, warned ---');
post(Object.assign({}, base, {
  uid: '111', visitId: 'v-ir', type: 'pageview', ts: '2026-08-28T10:00:00Z',
  country: 'Italy', ip: '1.2.3.4', city: 'Milan',
  timezone: 'Asia/Tehran', tzOffset: 210,
  ipTimezone: 'Europe/Rome', ipTzOffset: 120,
}));
const irRow = sheets['Log'].rows[1];
eq('Counted = NO', irRow[COL('Counted')], 'NO');
eq('Reason recorded', irRow[COL('Reason')], 'Iran timezone on device');
eq('device tz logged', irRow[COL('Device Timezone')], 'Asia/Tehran');
eq('device offset logged', irRow[COL('TZ Offset')], 'UTC+03:30');
eq('IP tz logged', irRow[COL('IP Timezone')], 'Europe/Rome (UTC+02:00)');
eq('one Telegram warning sent', telegramSent.length, 1);
const warn = telegramSent[0].payload.text;
eq('warning goes to that uid', telegramSent[0].payload.chat_id, '111');
eq('warning names Italy', warn.indexOf('Italy') !== -1, true);
eq('warning states the target offset', warn.indexOf('UTC+02:00') !== -1, true);
eq('warning names the example city', warn.indexOf('Rome') !== -1, true);
eq('warning says no coins', warn.indexOf('کوین حساب نمی‌شود') !== -1, true);

console.log('--- warning is throttled across heartbeats ---');
for (let i = 0; i < 5; i++) {
  post(Object.assign({}, base, {
    uid: '111', visitId: 'v-ir', type: 'heartbeat', ts: '2026-08-28T10:0' + (i + 1) + ':00Z',
    country: 'Italy', timezone: 'Asia/Tehran', tzOffset: 210,
    ipTimezone: 'Europe/Rome', ipTzOffset: 120,
  }));
}
eq('still only 1 message after 5 heartbeats', telegramSent.length, 1);

console.log('--- Italy user: counted, no warning ---');
post(Object.assign({}, base, {
  uid: '222', visitId: 'v-it', type: 'pageview', ts: '2026-08-28T10:00:00Z',
  country: 'Italy', timezone: 'Europe/Rome', tzOffset: 120,
  ipTimezone: 'Europe/Rome', ipTzOffset: 120,
}));
post(Object.assign({}, base, {
  uid: '222', visitId: 'v-it', type: 'heartbeat', ts: '2026-08-28T10:10:00Z',
  country: 'Italy', timezone: 'Europe/Rome', tzOffset: 120,
  ipTimezone: 'Europe/Rome', ipTzOffset: 120,
}));
eq('Counted = YES', sheets['Log'].rows[7][COL('Counted')], 'YES');
eq('no extra Telegram message', telegramSent.length, 1);

console.log('--- updateSummary excludes Iran visits ---');
updateSummary();
const sum = sheets['Summary'].rows.slice(1).filter(r => r.length);
const byUid = {};
sum.forEach(r => { byUid[String(r[0])] = r; });
eq('Italy user counted 1 visit', byUid['222'][1], 1);
eq('Italy user has 10 minutes', byUid['222'][2], 10);
eq('Italy user 0 excluded', byUid['222'][6], 0);
eq('Iran user counted 0 visits', byUid['111'][1], 0);
eq('Iran user 0 minutes', byUid['111'][2], 0);
eq('Iran user 1 excluded visit', byUid['111'][6], 1);
eq('Iran user excluded reason shown', byUid['111'][7], 'Iran timezone on device');

console.log('--- old rows without a Counted column still count ---');
sheets['Log'].rows.push(['2026-08-27T09:00:00Z', '333', 'v-old', 'pageview', 'impedyme.com', '/', '', '', '', '', 'UA']);
sheets['Log'].rows.push(['2026-08-27T09:05:00Z', '333', 'v-old', 'heartbeat', 'impedyme.com', '/', '', '', '', '', 'UA']);
updateSummary();
const sum2 = {}; sheets['Summary'].rows.slice(1).filter(r => r.length).forEach(r => { sum2[String(r[0])] = r; });
eq('legacy row counted as a visit', sum2['333'][1], 1);
eq('legacy row keeps its minutes', sum2['333'][2], 5);

console.log('--- no BOT_TOKEN: logs fine, just no message ---');
props = {};
const before = telegramSent.length;
delete cache['tzwarn_999'];
post(Object.assign({}, base, {
  uid: '999', visitId: 'v-x', type: 'pageview', ts: '2026-08-28T11:00:00Z',
  timezone: 'Asia/Tehran', tzOffset: 210,
}));
eq('no message without a token', telegramSent.length, before);
eq('row still logged and excluded',
   sheets['Log'].rows[sheets['Log'].rows.length - 1][COL('Counted')], 'NO');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
