// Runs the Apps Script modules under Node with stubbed Google globals.
// Usage: node bot/tools/test_timezones.js   (from the repo root)
const fs = require('fs');

// --- stubs for the Apps Script globals the module touches ---
function offsetMinutes(tz, date) {
  const dtf = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'longOffset' });
  const part = dtf.formatToParts(date).find(p => p.type === 'timeZoneName').value; // "GMT+03:30"
  const m = part.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!m) return 0;
  return (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + +m[3]);
}
global.Utilities = {
  formatDate(date, tz, fmt) {
    if (fmt === 'Z') {
      const o = offsetMinutes(tz, date), a = Math.abs(o);
      return (o < 0 ? '-' : '+') + String(Math.floor(a / 60)).padStart(2, '0') + String(a % 60).padStart(2, '0');
    }
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: false
    }).format(date);
  }
};
global.WEB_APP_URL = 'https://example.invalid/exec';
global.sendText = () => {};
global.HtmlService = { createHtmlOutput: () => ({ addMetaTag: () => ({}) }) };

const load = f => eval(fs.readFileSync(f, 'utf8'));
eval(fs.readFileSync('bot/Timezones.gs', 'utf8') + '\nglobal.COUNTRY_TIMEZONES=COUNTRY_TIMEZONES;global.COUNTRY_ALIASES=COUNTRY_ALIASES;');
eval(fs.readFileSync('bot/TimezoneBot.gs', 'utf8').replace(/^function doGet[\s\S]*$/m, '') +
  '\nglobal.resolveCountry=resolveCountry;global.formatOffset=formatOffset;global.currentOffsetMinutes=currentOffsetMinutes;' +
  'global.localTimeIn=localTimeIn;global.countriesSharingClock=countriesSharingClock;global.buildTimezoneInstructions=buildTimezoneInstructions;');

let pass = 0, fail = 0;
const eq = (label, got, want) => {
  if (got === want) { pass++; }
  else { fail++; console.log(`  FAIL ${label}: got ${JSON.stringify(got)} want ${JSON.stringify(want)}`); }
};

console.log('--- resolveCountry ---');
[['Germany','DE'],['germany','DE'],['DE','DE'],['de','DE'],['آلمان','DE'],['Berlin','DE'],
 ['USA','US'],['usa','US'],['United States','US'],['آمریکا','US'],['u.s.a.','US'],
 ['UK','GB'],['England','GB'],['انگلیس','GB'],['Britain (UK)','GB'],
 ['UAE','AE'],['dubai','AE'],['امارات','AE'],['Iran','IR'],['ایران','IR'],['Tehran','IR'],
 ['Netherlands','NL'],['holland','NL'],['هلند','NL'],['Turkey','TR'],['türkiye','TR'],['ترکیه','TR'],
 ['Czechia','CZ'],['south korea','KR'],['کره جنوبی','KR'],['ivory coast','CI'],['Canada','CA'],
 ['روسیه','RU'],['Vietnam','VN'],['  Spain  ','ES'],['NOT_A_COUNTRY',null],['',null],['x',null]
].forEach(([q,w]) => eq(`resolveCountry(${JSON.stringify(q)})`, resolveCountry(q), w));

console.log('--- formatOffset ---');
[[210,'UTC+03:30'],[-300,'UTC-05:00'],[0,'UTC+00:00'],[345,'UTC+05:45'],[-210,'UTC-03:30'],[825,'UTC+13:45']]
  .forEach(([m,w]) => eq(`formatOffset(${m})`, formatOffset(m), w));

console.log('--- every country resolves + has a live offset ---');
let bad = 0;
for (const code in COUNTRY_TIMEZONES) {
  const e = COUNTRY_TIMEZONES[code];
  if (resolveCountry(code) !== code) { console.log('  code lookup broke:', code); bad++; }
  if (resolveCountry(e.name) !== code) { console.log('  name lookup broke:', e.name); bad++; }
  const off = currentOffsetMinutes(e.tz);
  if (typeof off !== 'number' || Number.isNaN(off)) { console.log('  bad offset:', code, e.tz); bad++; }
  if (!/^\d{2}:\d{2}$/.test(localTimeIn(e.tz))) { console.log('  bad time:', code, e.tz); bad++; }
}
eq('all 247 countries round-trip', bad, 0);
console.log(`  checked ${Object.keys(COUNTRY_TIMEZONES).length} countries`);

console.log('--- generated offsets match live tz rules ---');
let drift = [];
for (const code in COUNTRY_TIMEZONES) {
  const e = COUNTRY_TIMEZONES[code];
  const live = currentOffsetMinutes(e.tz);
  if (live !== e.std && live !== e.dst) drift.push(`${code} ${e.tz} live=${live} std=${e.std} dst=${e.dst}`);
}
eq('no offset drift', drift.length, 0);
if (drift.length) drift.slice(0, 5).forEach(d => console.log('   ', d));

console.log('--- countriesSharingClock (the Windows-grouping answer) ---');
const beShare = countriesSharingClock('BE');
eq('Belgium shares a clock with others', beShare.length > 5, true);
eq('Belgium group contains Paris', beShare.indexOf('Paris') !== -1, true);
eq('Iran shares with nobody (UTC+3:30 unique)', countriesSharingClock('IR').length, 0);

console.log('--- buildTimezoneInstructions ---');
const de = buildTimezoneInstructions('DE');
eq('DE mentions zone', de.indexOf('Europe/Berlin') !== -1, true);
eq('DE mentions city to search', de.indexOf('Berlin') !== -1, true);
eq('DE flags DST', de.indexOf('ساعت تابستانی') !== -1, true);
const ir = buildTimezoneInstructions('IR');
eq('IR does not claim DST', ir.indexOf('ساعت تابستانی') === -1, true);
eq('unknown country returns null', buildTimezoneInstructions('ZZ'), null);
const us = buildTimezoneInstructions('US');
eq('US warns about multiple zones', us.indexOf('منطقه زمانی دارد') !== -1, true);

console.log('--- Persian input variants ---');
// کاربرها ي و ك عربی و نیم‌فاصله تایپ می‌کنند
[['آلمان','DE'],['المان','DE'],['ترکيه','TR'],['ترکیه','TR'],['كانادا','CA'],['کانادا','CA'],
 ['آفریقای جنوبی','ZA'],['آفريقاي جنوبي','ZA'],['  ایران  ','IR'],['کره جنوبی','KR']
].forEach(([q,w]) => eq(`resolveCountry(${JSON.stringify(q)})`, resolveCountry(q), w));

console.log('--- normalizer parity with the generator ---');
eq('parens name matches', resolveCountry('Britain (UK)'), 'GB');
eq('accent-free spelling matches', resolveCountry("cote d'ivoire"), 'CI');
eq('accented spelling matches', resolveCountry("Côte d'Ivoire"), 'CI');
eq('ambiguous prefix stays null', resolveCountry('ira'), null);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
