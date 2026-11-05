// Minimal Google Apps Script mocks to run the bots locally with Node (no network).
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const ROOT = path.join(__dirname, "..");

// Emulates Google Sheets auto-conversion when writing values.
function conv(v) {
  if (typeof v === "string") {
    if (v.startsWith("'")) return v.slice(1);
    const t = v.trim();
    if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t); // numeric strings become numbers (like real Sheets)
  }
  if (v === null || v === undefined) return "";
  return v;
}

class MockRange {
  constructor(sheet, r, c, nr, nc) {
    if (r < 1 || c < 1 || nr < 1 || nc < 1) throw new Error(`Bad range ${r},${c},${nr},${nc} on ${sheet.name}`);
    if (c + nc - 1 > sheet.maxCols) throw new Error(`Range out of bounds (cols ${c + nc - 1} > ${sheet.maxCols}) on ${sheet.name}`);
    Object.assign(this, { sheet, r, c, nr, nc });
  }
  getValues() {
    const out = [];
    for (let i = 0; i < this.nr; i++) {
      const row = this.sheet.data[this.r - 1 + i] || [];
      const vals = [];
      for (let j = 0; j < this.nc; j++) { const v = row[this.c - 1 + j]; vals.push(v === undefined ? "" : v); }
      out.push(vals);
    }
    return out;
  }
  getValue() { return this.getValues()[0][0]; }
  setValues(vals) {
    if (vals.length !== this.nr || vals.some((r) => r.length !== this.nc)) {
      throw new Error(`setValues dims mismatch: data ${vals.length}x${vals[0] && vals[0].length} vs range ${this.nr}x${this.nc}`);
    }
    vals.forEach((row, i) => row.forEach((v, j) => this.sheet.set(this.r + i, this.c + j, conv(v))));
    return this;
  }
  setValue(v) { for (let i = 0; i < this.nr; i++) for (let j = 0; j < this.nc; j++) this.sheet.set(this.r + i, this.c + j, conv(v)); return this; }
  clearContent() { for (let i = 0; i < this.nr; i++) for (let j = 0; j < this.nc; j++) this.sheet.set(this.r + i, this.c + j, ""); return this; }
  clear() { return this.clearContent(); }
  setFontWeight() { return this; }
}

class MockSheet {
  constructor(name) { this.name = name; this.data = []; this.maxCols = 26; }
  getName() { return this.name; }
  set(r, c, v) {
    while (this.data.length < r) this.data.push([]);
    const row = this.data[r - 1];
    while (row.length < c) row.push("");
    row[c - 1] = v;
  }
  getLastRow() {
    for (let i = this.data.length - 1; i >= 0; i--) if (this.data[i].some((v) => v !== "" && v !== undefined && v !== null)) return i + 1;
    return 0;
  }
  getLastColumn() {
    let m = 0;
    this.data.forEach((row) => row.forEach((v, j) => { if (v !== "" && v !== undefined && v !== null && j + 1 > m) m = j + 1; }));
    return m;
  }
  getMaxColumns() { return this.maxCols; }
  insertColumnsAfter(after, n) { this.maxCols += n; }
  getRange(r, c, nr, nc) { return new MockRange(this, r, c, nr || 1, nc || 1); }
  getDataRange() { return this.getRange(1, 1, Math.max(1, this.getLastRow()), Math.max(1, this.getLastColumn())); }
  appendRow(arr) {
    if (arr.length > this.maxCols) this.maxCols = arr.length;
    const r = this.getLastRow() + 1;
    arr.forEach((v, i) => this.set(r, i + 1, conv(v)));
    return this;
  }
  setFrozenRows() {}
}

class MockSpreadsheet {
  constructor() { this.sheets = {}; }
  getSheetByName(n) { return this.sheets[n] || null; }
  insertSheet(n) { if (this.sheets[n]) throw new Error("Sheet exists: " + n); return (this.sheets[n] = new MockSheet(n)); }
  getSheets() { return Object.values(this.sheets); }
}

function formatDate(date, tz, pattern) {
  const parts = {};
  new Intl.DateTimeFormat("en-GB", {
    timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23"
  }).formatToParts(date).forEach((p) => { parts[p.type] = p.value; });
  return pattern.replace(/yyyy|yy|MM|dd|HH|H|mm|ss/g, (t) => ({
    yyyy: parts.year, yy: parts.year.slice(2), MM: parts.month, dd: parts.day, HH: parts.hour,
    H: String(Number(parts.hour)), mm: parts.minute, ss: parts.second
  })[t]);
}

/** A "project" = its own Script Properties / Cache, sharing the spreadsheet. */
function makeProject(files, world) {
  return { files, props: new Map(), cache: new Map(), triggers: [], world };
}

function makeGlobals(project) {
  const world = project.world;
  const props = project.props;
  const respond = (url, payload) => {
    world.sent.push({ url, method: url.split("/").pop(), token: url.split("/bot")[1].split("/")[0], payload });
    const fail = world.failHook && world.failHook(url, payload);
    if (fail) return { getContentText: () => JSON.stringify(fail.body), getResponseCode: () => fail.code };
    return { getContentText: () => JSON.stringify({ ok: true, result: { message_id: 1 } }), getResponseCode: () => 200 };
  };
  return {
    SpreadsheetApp: { openById: () => world.ss },
    PropertiesService: {
      getScriptProperties: () => ({
        getProperty: (k) => (props.has(k) ? props.get(k) : null),
        setProperty: (k, v) => {
          if (typeof v !== "string") throw new Error(`The parameters (String,${typeof v}) don't match the method signature for PropertiesService.Properties.setProperty.`);
          props.set(k, v);
        },
        deleteProperty: (k) => props.delete(k)
      })
    },
    CacheService: { getScriptCache: () => ({ get: (k) => project.cache.get(k) || null, put: (k, v) => project.cache.set(k, v) }) },
    LockService: { getScriptLock: () => ({ waitLock() {}, tryLock() { return true; }, releaseLock() {} }) },
    UrlFetchApp: {
      fetch: (url, o) => respond(url, JSON.parse(o.payload)),
      fetchAll: (reqs) => reqs.map((q) => respond(q.url, JSON.parse(q.payload)))
    },
    Utilities: { formatDate, sleep() {} },
    Session: { getScriptTimeZone: () => "Asia/Tehran" },
    Logger: { log: (...a) => world.logs.push(a.join(" ")) },
    ScriptApp: {
      getProjectTriggers: () => project.triggers,
      deleteTrigger: (t) => { project.triggers = project.triggers.filter((x) => x !== t); },
      newTrigger: (fn) => ({ timeBased: () => ({ everyMinutes: () => ({ create: () => { const t = { getHandlerFunction: () => fn }; project.triggers.push(t); return t; } }) }) })
    },
    console
  };
}

/** Runs one Apps Script "execution": fresh globals each time, like production. */
function run(project, fnName, ...args) {
  const ctx = vm.createContext(makeGlobals(project));
  for (const f of project.files) {
    vm.runInContext(fs.readFileSync(path.join(ROOT, f), "utf8"), ctx, { filename: f });
  }
  vm.runInContext(`CONFIG.SHEET_ID="test"; CONFIG.USER_BOT_TOKEN="USERTOKEN"; CONFIG.ADMIN_BOT_TOKEN="ADMINTOKEN";`, ctx);
  ctx.__args = args;
  return vm.runInContext(`${fnName}.apply(null, __args)`, ctx);
}

module.exports = { MockSpreadsheet, MockSheet, makeProject, run, formatDate, conv };
