// End-to-end scenarios for the bots, using mocked Sheets/Telegram.  Run:  node telegram-bots/test/run-tests.js
const assert = require("assert");
const { MockSpreadsheet, makeProject, run, formatDate } = require("./mocks");

const LOG_HEADERS = ["Timestamp", "User", "Visit ID", "Event", "Site", "Page", "Came From", "IP", "City", "Country", "Timezone", "User Agent", "Traffic Type"];
const world = { ss: new MockSpreadsheet(), sent: [], logs: [], failHook: null };
const USER = makeProject(["shared/Config.gs", "shared/Core.gs", "user-bot/UserBot.gs"], world);
const ADMIN = makeProject(["shared/Config.gs", "shared/Core.gs", "admin-bot/AdminBot.gs", "admin-bot/AdminViews.gs"], world);
const ADMIN_ID = 999;

let updateId = 1000;
function post(project, update) {
  if (!update.update_id) update.update_id = ++updateId;
  run(project, "doPost", { postData: { contents: JSON.stringify(update) } });
}
function userSays(chatId, text) { world.sent = []; post(USER, { message: { chat: { id: chatId, type: "private" }, from: { id: chatId }, text } }); return world.sent; }
function adminSays(text, chatId = ADMIN_ID) { world.sent = []; post(ADMIN, { message: { chat: { id: chatId, type: "private" }, from: { id: chatId }, text } }); return world.sent; }
function adminClicks(data) {
  world.sent = [];
  post(ADMIN, { callback_query: { id: "cb" + ++updateId, from: { id: ADMIN_ID }, data, message: { message_id: 55, chat: { id: ADMIN_ID } } } });
  return world.sent;
}
const allText = (sent) => sent.map((s) => s.payload.text || "").join("\n----\n");
const walletTotal = (chatId) => {
  const t = allText(userSays(chatId, "کیف پول 💰"));
  const m = t.match(/مجموع کل سکه‌ها: (\d+)/);
  assert(m, "wallet text missing total:\n" + t);
  return Number(m[1]);
};
const sheetRows = (name) => world.ss.getSheetByName(name).data;
const usersRow = (chatId) => {
  const d = sheetRows("Users"); const h = d[0];
  const r = d.find((row, i) => i > 0 && String(row[0]) === String(chatId));
  return r && Object.fromEntries(h.map((k, i) => [k, r[i]]));
};
let passed = 0;
function test(name, fn) { fn(); passed++; console.log("✔ " + name); }

/* ---------- Original (old) algorithm, copied from the user's previous code, used to verify migration ---------- */
function cleanPath(u) { if (!u) return ""; let p = String(u).toLowerCase().trim(); p = p.replace(/^https?:\/\/[^\/]+/, ""); p = p.split("?")[0].split("#")[0]; return p.replace(/^\/+|\/+$/g, ""); }
function oldStats(rows, kws) {
  const stats = { pv: 0, hb: 0 }; const counter = {};
  if (!kws.length) return stats;
  for (const r of rows) {
    const country = String(r[9] || ""), timezone = String(r[10] || "");
    if (timezone === "Asia/Tehran" || country.toLowerCase().includes("iran")) continue;
    const ev = String(r[3] || "").toLowerCase(), page = String(r[5] || ""), ref = String(r[6] || "");
    if (!ref.toLowerCase().includes("google")) continue;
    const ok = kws.some((k) => {
      const t = cleanPath(k.path), p = cleanPath(page), slug = k.kw.toLowerCase().replace(/\s+/g, "-");
      const nk = k.kw.toLowerCase().replace(/[\s\-_]+/g, ""), np = p.replace(/[\s\-_]+/g, "");
      if (t && (p === t || p.includes(t) || t.includes(p))) return true;
      if (slug && (p.includes(slug) || p === slug)) return true;
      if (nk && (np.includes(nk) || nk.includes(np))) return true;
      return false;
    });
    if (!ok) continue;
    const key = formatDate(new Date(r[0]), "Asia/Tehran", "H") + "_" + cleanPath(page) + "_" + ev;
    counter[key] = counter[key] || 0;
    if (counter[key] < 5) { counter[key]++; if (ev === "pageview") stats.pv++; if (ev === "heartbeat") stats.hb++; }
  }
  return stats;
}

/* ---------- Legacy data, exactly like the old bots left it ---------- */
const ss = world.ss;
const usersSh = ss.insertSheet("Users");
usersSh.appendRow(["ChatID", "UID", "Name", "Email", "EarnedCoins", "Adjustment", "TotalCoins", "LastUpdated"]);
usersSh.appendRow([111, "123456", "Ali", "ali_r@gmail.com", 3, 2, 5, new Date()]);
usersSh.appendRow([222, "654321", "Sara Karimi", "s@x.com", 70, -1, 69, new Date()]);
const kwSh = ss.insertSheet("DailyKeywords");
kwSh.appendRow(["Keyword", "URL"]);
kwSh.appendRow(["grid emulator", "https://www.impedyme.com/grid-emulator"]);
const wdSh = ss.insertSheet("Withdrawals");
wdSh.appendRow(["ChatID", "UID", "Name", "Card", "Amount", "Date", "Status"]);
wdSh.appendRow([222, "654321", "Sara Karimi", "6037-9911-1111-1111", "300,000 تومان", new Date(Date.now() - 86400000), "Pending"]);

const logRow = (ts, ev, page, ref, o = {}) => [ts.toISOString(), o.uid || "ali123456", "v1", ev, "www.impedyme.com", page, ref,
  "1.2.3.4", "Berlin", o.country || "Germany", o.tz || "Europe/Berlin", "UA", o.traffic || "ORGANIC"];
const G = "https://www.google.com/";
const aliTab = ss.insertSheet("User - ali123456");
aliTab.appendRow(LOG_HEADERS);
const base = Date.now() - 3 * 86400000;
for (let day = 0; day < 2; day++) for (let h = 0; h < 6; h++) for (let k = 0; k < 6; k++) {
  const ts = new Date(base + day * 86400000 + h * 3600000 + k * 60000);
  aliTab.appendRow(logRow(ts, "pageview", "/grid-emulator", G));
  aliTab.appendRow(logRow(ts, "heartbeat", "/grid-emulator", G));
}
aliTab.appendRow(logRow(new Date(base), "pageview", "/", G));
aliTab.appendRow(logRow(new Date(base), "pageview", "/grid-emulator", G, { tz: "Asia/Tehran" }));
aliTab.appendRow(logRow(new Date(base), "pageview [SPONSORED]", "/grid-emulator", G, { traffic: "SPONSORED_AD" }));
aliTab.appendRow(logRow(new Date(base), "pageview", "/grid-emulator", "direct"));
const aliOld = oldStats(aliTab.data.slice(1), [{ kw: "grid emulator", path: "https://www.impedyme.com/grid-emulator" }]);
const aliOldCoins = Math.floor(aliOld.pv / 20) + Math.floor(aliOld.hb / 15);

/* ------------------------------------ scenarios ------------------------------------ */

test("upgrade keeps Ali's balance exactly (legacy numbers reproduced)", () => {
  assert.deepStrictEqual(aliOld, { pv: 31, hb: 30 });
  assert.strictEqual(walletTotal(111), aliOldCoins + 2); // E(3) + adjustment(2)
  const r = usersRow(111);
  assert.strictEqual(r.CountedPV, 31); assert.strictEqual(r.CountedHB, 30);
  assert.strictEqual(r.LegacyBonus, 0); assert.strictEqual(r.ProcessedRows, aliTab.getLastRow());
});

test("first admin /start claims the panel, strangers are rejected", () => {
  const t = allText(adminSays("/start"));
  assert(t.includes("مدیر اصلی"), t);
  const t2 = allText(adminSays("/start", 888));
  assert(t2.includes("دسترسی مدیریت ندارید"), t2);
  assert(!allText(adminSays("👥 آمار و لیست کاربران", 888)).includes("Ali"));
});

test("removing ALL keywords does not reduce coins", () => {
  adminSays("🗑️ حذف کلمات کلیدی");
  assert(allText(adminSays("ALL")).includes("1 کلمه غیرفعال شد"));
  assert.strictEqual(walletTotal(111), 5);
  assert(allText(userSays(111, "کلمات امروز 🔑")).includes("هیچ کلمه"));
});

test("new keyword: new visits earn, hourly cap per date-hour, old keyword no longer earns", () => {
  adminSays("✏️ ثبت کلمات جدید");
  assert(allText(adminSays("motor emulator, https://www.impedyme.com/motor-emulator")).includes("جدید: <b>1</b>"));
  const start = Date.now() + 60000;
  for (let h = 0; h < 5; h++) for (let k = 0; k < 6; k++) aliTab.appendRow(logRow(new Date(start + h * 3600000 + k * 60000), "pageview", "/motor-emulator", G));
  for (let k = 0; k < 3; k++) aliTab.appendRow(logRow(new Date(start + k * 60000), "pageview", "/grid-emulator", G));
  assert.strictEqual(walletTotal(111), 6); // PV 31+25=56 → floor(56/20)=2 (+1 coin)
  const credits = aliTab.data.slice(-33).map((r) => r[14]);
  assert.strictEqual(credits.filter((c) => c === "COUNTED").length, 25);
  assert.strictEqual(credits.filter((c) => c === "LIMIT").length, 5);
  assert.strictEqual(credits.filter((c) => c === "NO_KEYWORD").length, 3);
  adminSays("🔄 بروزرسانی سکه‌ها");
  adminSays("🔄 بروزرسانی سکه‌ها");
  assert.strictEqual(usersRow(111).CountedPV, 56, "settle must be idempotent");
  assert.strictEqual(walletTotal(111), 6);
});

test("coin management (the broken 'مدیریت سکه کاربر' flow) now works", () => {
  adminSays("🪙 مدیریت سکه کاربر");
  const card = allText(adminSays("123456"));
  assert(card.includes("موجودی فعلی کاربر: 6 سکه"), card);
  assert(allText(adminSays("+5")).includes("بعد: <b>11</b>"));
  assert.strictEqual(walletTotal(111), 11);
  const cb = adminClicks("c|111|sub|3");
  assert(cb.some((s) => s.method === "editMessageText" && s.payload.text.includes("بعد: <b>8</b>")));
  assert.strictEqual(walletTotal(111), 8);
  adminSays("/coin 123456 20"); assert.strictEqual(walletTotal(111), 20);
  adminSays("/coin ali صفر"); assert.strictEqual(walletTotal(111), 0);
  adminSays("/coin 123456 +۷"); assert.strictEqual(walletTotal(111), 7);
  assert(allText(adminSays("/coin 123456 -100")).includes("موجودی کافی نبود"));
  assert.strictEqual(walletTotal(111), 0);
  adminSays("/coin 123456 70"); assert.strictEqual(walletTotal(111), 70);
  assert(sheetRows("CoinHistory").length >= 8, "every change is audited");
});

const luhn = (s) => { let sum = 0, dbl = false; for (let i = s.length - 1; i >= 0; i--) { let d = +s[i]; if (dbl) { d *= 2; if (d > 9) d -= 9; } sum += d; dbl = !dbl; } return sum % 10 === 0; };
const card = (() => { for (let d = 0; d < 10; d++) if (luhn("603799119999999" + d)) return "603799119999999" + d; })();
const faCard = card.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[d]).replace(/(.{4})/g, "$1 ").trim();
const wdId = (n) => String(sheetRows("Withdrawals")[n][8]);

test("withdrawal reserves coins, blocks duplicates, reject refunds, paid deducts", () => {
  assert(allText(userSays(111, "درخواست تسویه 💳")).includes("شماره کارت"));
  assert(allText(userSays(111, "1234")).includes("معتبر نیست"));
  const sent = userSays(111, faCard);
  assert(allText(sent).includes("کد پیگیری"));
  const adminNote = sent.find((s) => s.token === "ADMINTOKEN" && String(s.payload.chat_id) === String(ADMIN_ID));
  assert(adminNote && adminNote.payload.reply_markup.inline_keyboard, "admins get a notification with buttons");
  assert.strictEqual(String(sheetRows("Withdrawals")[2][3]), card.replace(/(\d{4})(?=\d)/g, "$1-"), "card stored as text without precision loss");
  assert.strictEqual(walletTotal(111), 0);
  assert(allText(userSays(111, "درخواست تسویه 💳")).includes("در حال بررسی"));
  const id1 = wdId(2);
  adminClicks("w|" + id1 + "|reject");
  assert(world.sent.some((s) => s.token === "USERTOKEN" && s.payload.text.includes("رد شد")));
  assert.strictEqual(walletTotal(111), 70);
  userSays(111, "درخواست تسویه 💳"); userSays(111, card);
  const id2 = wdId(3);
  adminClicks("w|" + id2 + "|paid");
  assert(world.sent.some((s) => s.token === "USERTOKEN" && s.payload.text.includes("پرداخت شد")));
  assert.strictEqual(walletTotal(111), 0);
  const again = adminClicks("w|" + id2 + "|paid");
  assert(again.some((s) => s.method === "answerCallbackQuery" && s.payload.text.includes("قبلاً")), "no double payment");
});

test("legacy pending withdrawal: gets an ID and deducts only when admin marks it paid", () => {
  assert.strictEqual(walletTotal(222), 69); // E 70 kept via LegacyBonus, adj -1, legacy request not yet deducted
  const t = allText(adminSays("💳 درخواستهای تسویه"));
  assert(t.includes("R2") && t.includes("در انتظار: <b>1</b>"), t);
  adminClicks("w|R2|paid");
  assert.strictEqual(walletTotal(222), 9);
});

test("admin user list shows exactly the wallet numbers", () => {
  const t = allText(adminSays("👥 آمار و لیست کاربران"));
  assert(/Ali[\s\S]*?موجودی: 0 سکه/.test(t), t);
  assert(/Sara Karimi[\s\S]*?موجودی: 9 سکه/.test(t), t);
});

test("broadcast containing the word 'کاربران' is really broadcast (old bug)", () => {
  adminSays("📢 ارسال پیام همگانی");
  const sent = adminSays("کاربران عزیز سلام");
  assert.strictEqual(sent.filter((s) => s.token === "USERTOKEN" && s.payload.text.includes("کاربران عزیز سلام")).length, 2);
});

test("registration: validation, unique UID, no re-registration", () => {
  userSays(333, "/start");
  assert(allText(userSays(333, "علی")).includes("انگلیسی"));
  userSays(333, "Reza");
  assert(allText(userSays(333, "bad-email")).includes("معتبر نیست"));
  assert(allText(userSays(333, "reza@x.com")).includes("ثبت‌نام شما با موفقیت"));
  const r = usersRow(333);
  assert(/^\d{6}$/.test(String(r.UID)) && r.LinkUid === "reza" + r.UID && r.ProcessedRows === 1);
  const t = allText(userSays(333, "شروع دوباره 🔄"));
  assert(t.includes("خوش برگشتید") && t.includes(String(r.UID)));
  assert.strictEqual(usersRow(333).UID, r.UID, "UID never changes");
});

test("user known only by old Script Properties is restored with legacy coins", () => {
  USER.props.set("id_444", "777777"); USER.props.set("name_444", "Old User"); USER.props.set("email_444", "o@x.com");
  const tab = ss.insertSheet("User - olduser777777");
  tab.appendRow(LOG_HEADERS);
  for (let h = 0; h < 4; h++) for (let k = 0; k < 5; k++) tab.appendRow(logRow(new Date(base + h * 3600000 + k * 60000), "pageview", "/grid-emulator", G, { uid: "olduser777777" }));
  assert.strictEqual(walletTotal(444), 1);
  assert.strictEqual(String(usersRow(444).UID), "777777");
});

test("🔍 check view shows the same wallet the user sees", () => {
  const strip = (s) => s.replace(/🕒 آخرین بروزرسانی: .*\n/, "");
  const userWallet = strip(allText(userSays(111, "کیف پول 💰")));
  adminSays("🔍 بررسی کاربر");
  const view = strip(allText(adminSays("123456")));
  assert(view.includes(userWallet), view);
  assert(view.includes("✅ شمرده شد") && view.includes("📦 قبل از بروزرسانی"), view);
});

test("duplicate Telegram updates are processed once", () => {
  world.sent = [];
  const upd = { update_id: 777777, message: { chat: { id: ADMIN_ID, type: "private" }, from: { id: ADMIN_ID }, text: "/coin 123456 +1" } };
  post(ADMIN, JSON.parse(JSON.stringify(upd)));
  post(ADMIN, JSON.parse(JSON.stringify(upd)));
  assert.strictEqual(walletTotal(111), 1);
});

test("status shows matching Core versions; /msg works; HTML failures fall back to plain text", () => {
  assert(allText(adminSays("⚙️ وضعیت سیستم")).includes("(یکسان)"));
  assert(adminSays("/msg 123456 hello").some((s) => s.token === "USERTOKEN" && s.payload.text.includes("hello")));
  world.failHook = (url, p) => (p.parse_mode ? { code: 400, body: { ok: false, description: "Bad Request: can't parse entities" } } : null);
  const sent = userSays(111, "اطلاعات کاربری 👤");
  world.failHook = null;
  assert(sent.length === 2 && !sent[1].payload.parse_mode && sent[1].payload.text.includes("ali_r@gmail.com"));
});

test("full reset (with confirmation) zeroes balance and clears logs", () => {
  adminSays("/reset 123456");
  assert(world.sent.some((s) => JSON.stringify(s.payload).includes("resetok")));
  adminClicks("c|111|resetok");
  assert.strictEqual(walletTotal(111), 0);
  assert.strictEqual(aliTab.getLastRow(), 1);
  aliTab.appendRow(logRow(new Date(Date.now() + 7200000), "pageview", "/motor-emulator", G));
  assert.strictEqual(walletTotal(111), 0);
  assert.strictEqual(usersRow(111).CountedPV, 1);
});

console.log(`\nAll ${passed} scenario groups passed.`);
