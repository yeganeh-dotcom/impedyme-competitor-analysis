/**
 * ============================================================
 *  AdminBot.gs  —  ربات مدیریت (مسیریابی پیام‌ها و دکمه‌ها)
 *  فایل‌های این پروژه: Config.gs + Core.gs (مشترک) + AdminBot.gs + AdminViews.gs
 * ============================================================
 */

var ADMIN_BTN = {
  KW_LIST: "📋 کلمات کلیدی امروز",
  KW_ADD: "✏️ ثبت کلمات جدید",
  KW_DEL: "🗑️ حذف کلمات کلیدی",
  BROADCAST: "📢 ارسال پیام همگانی",
  USERS: "👥 آمار و لیست کاربران",
  SYNC: "🔄 بروزرسانی سکه‌ها",
  COINS: "🪙 مدیریت سکه کاربر",
  MSG_ONE: "✉️ پیام به یک کاربر",
  WITHDRAWALS: "💳 درخواستهای تسویه",
  CHECK: "🔍 بررسی کاربر",
  PUSH_MENU: "📲 ارسال منوی جدید به همه",
  STATUS: "⚙️ وضعیت سیستم"
};

// برچسب‌های قدیمی/مشابه هم شناخته می‌شوند (تطبیق «کامل»، نه «شامل بودن»؛
// قبلاً اگر متن پیام همگانی کلمه «کاربران» یا «تسویه» داشت، پیام ارسال نمی‌شد!)
var ADMIN_BTN_ALIASES = {
  USERS: ["لیست کاربران", "آمار کاربران", "امار کاربران", "امار و لیست کاربران"],
  WITHDRAWALS: ["درخواست‌های تسویه", "درخواست های تسویه", "تسویه"],
  SYNC: ["بروزرسانی", "به‌روزرسانی سکه‌ها"],
  COINS: ["مدیریت سکه"]
};

function normBtn_(t) {
  return String(t || "").replace(/ي/g, "ی").replace(/ك/g, "ک").replace(/[^A-Za-z0-9؀-ۿ]/g, "");
}

var _btnLookup = null;
function adminBtnOf_(text) {
  if (!_btnLookup) {
    _btnLookup = {};
    Object.keys(ADMIN_BTN).forEach(function (k) { _btnLookup[normBtn_(ADMIN_BTN[k])] = k; });
    Object.keys(ADMIN_BTN_ALIASES).forEach(function (k) {
      ADMIN_BTN_ALIASES[k].forEach(function (a) { _btnLookup[normBtn_(a)] = k; });
    });
  }
  var n = normBtn_(text);
  return n ? (_btnLookup[n] || null) : null;
}

function adminKeyboard_() {
  var B = ADMIN_BTN;
  return {
    keyboard: [
      [{ text: B.KW_LIST }, { text: B.KW_ADD }],
      [{ text: B.KW_DEL }, { text: B.BROADCAST }],
      [{ text: B.USERS }, { text: B.SYNC }],
      [{ text: B.COINS }, { text: B.MSG_ONE }],
      [{ text: B.WITHDRAWALS }, { text: B.CHECK }],
      [{ text: B.PUSH_MENU }, { text: B.STATUS }]
    ],
    resize_keyboard: true,
    is_persistent: true
  };
}

function cancelKeyboard_() { return { keyboard: [[{ text: "انصراف ❌" }]], resize_keyboard: true }; }

function aSend_(chatId, text, markup) {
  return tgSend_(cfg_("ADMIN_BOT_TOKEN"), chatId, text, markup === undefined ? adminKeyboard_() : markup);
}

/* ------------------------- ورودی وبهوک ------------------------- */

function doPost(e) {
  var chatId = null;
  try {
    if (!e || !e.postData || !e.postData.contents) return;
    var update = JSON.parse(e.postData.contents);
    if (isDuplicateUpdate_(update, "a")) return;
    reportCoreVersion_("ADMIN");
    if (update.callback_query) {
      var cb = update.callback_query;
      chatId = String(cb.message ? cb.message.chat.id : cb.from.id);
      return handleAdminCallback_(cb);
    }
    if (update.message && update.message.chat) {
      chatId = String(update.message.chat.id);
      return handleAdminMessage_(update.message);
    }
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    try {
      if (chatId && adminIds_().indexOf(chatId) !== -1) aSend_(chatId, "⚠️ خطا: " + esc_(err && err.message ? err.message : err));
    } catch (e2) {}
  }
}

/** فقط مدیران مجازند. اگر هنوز هیچ مدیری ثبت نشده، اولین نفر مدیر می‌شود. */
function ensureAdmin_(chatId) {
  if (adminIds_().indexOf(chatId) !== -1) return true;
  if (adminIds_().length === 0) {
    withLock_(function () {
      _settingsCache = null;
      if (adminIds_().length === 0) setSetting_("ADMIN_IDS", "'" + chatId);
    });
    if (adminIds_().indexOf(chatId) !== -1) {
      aSend_(chatId, "✅ شما به عنوان <b>مدیر اصلی</b> ثبت شدید (Chat ID: <code>" + chatId + "</code>).\n" +
        "از این به بعد فقط مدیران به این پنل دسترسی دارند. برای افزودن مدیر دیگر: <code>/addadmin CHAT_ID</code>");
      return true;
    }
  }
  aSend_(chatId, "⛔️ شما دسترسی مدیریت ندارید.\nChat ID شما: <code>" + esc_(chatId) + "</code>", { remove_keyboard: true });
  return false;
}

/* ------------------------- پیام‌های متنی ------------------------- */

function handleAdminMessage_(msg) {
  var chatId = String(msg.chat.id);
  var rawText = String(msg.text || "").trim();
  if (!ensureAdmin_(chatId)) return;
  var props = PropertiesService.getScriptProperties();
  var stateKey = "state_" + chatId;
  var state = props.getProperty(stateKey) || "idle";
  var lower = rawText.toLowerCase();

  if (lower.indexOf("/start") === 0 || rawText === "منوی اصلی 🏠" || rawText === "انصراف ❌" || rawText === "انصراف") {
    props.deleteProperty(stateKey);
    return aSend_(chatId, "👑 <b>پنل مدیریت اختصاصی</b>\nیک گزینه را انتخاب کنید:");
  }
  if (rawText.charAt(0) === "/") {
    props.deleteProperty(stateKey);
    return handleAdminCommand_(chatId, rawText);
  }
  var btn = adminBtnOf_(rawText);
  if (btn) {
    props.deleteProperty(stateKey);
    return handleAdminButton_(chatId, btn, props);
  }

  switch (state) {
    case "waiting_kw":
      props.deleteProperty(stateKey);
      var r = addKeywords_(rawText);
      return aSend_(chatId, "✅ ثبت شد.\n➕ جدید: <b>" + r.added + "</b>\n🔁 لینک جدید برای کلمه موجود: <b>" + r.updated +
        "</b>\n⏭ تکراری (بدون تغییر): <b>" + r.skipped + "</b>\n\n" + keywordsListText_());
    case "waiting_del":
      props.deleteProperty(stateKey);
      var removed = removeKeywords_(rawText);
      return aSend_(chatId, (removed.length ? "✅ " + removed.length + " کلمه غیرفعال شد: " + esc_(removed.join("، ")) : "⚠️ کلمه‌ای با این مشخصات پیدا نشد.") +
        "\nℹ️ بازدیدهایی که قبلاً با این کلمات انجام شده، همچنان معتبرند و سکه‌ای کم نمی‌شود.\n\n" + keywordsListText_());
    case "waiting_broadcast":
      props.deleteProperty(stateKey);
      return doBroadcast_(chatId, rawText);
    case "waiting_single_msg_target":
    case "waiting_coin_target":
    case "waiting_check_target":
      var purpose = state === "waiting_coin_target" ? "s" : state === "waiting_check_target" ? "k" : "m";
      var u = pickOneUser_(chatId, rawText, purpose);
      if (!u) return;
      props.deleteProperty(stateKey);
      return openUserFor_(chatId, u, purpose, props);
    case "waiting_single_msg_content":
      props.deleteProperty(stateKey);
      return aSend_(chatId, sendToUser_(props.getProperty("msg_target_" + chatId), rawText));
    case "waiting_coin_val":
      var p = parseCoinInput_(rawText);
      if (!p) return aSend_(chatId, "❌ مقدار نامعتبر است. مثال: <code>+5</code> یا <code>-3</code> یا <code>20</code> یا <code>صفر</code>", cancelKeyboard_());
      props.deleteProperty(stateKey);
      return applyCoinOp_(chatId, props.getProperty("coin_target_" + chatId), p, null);
  }
  return aSend_(chatId, "👑 یک گزینه را از منو انتخاب کنید:");
}

function handleAdminButton_(chatId, btn, props) {
  var setState = function (s) { props.setProperty("state_" + chatId, s); };
  switch (btn) {
    case "KW_LIST": return aSend_(chatId, keywordsListText_());
    case "KW_ADD":
      setState("waiting_kw");
      return aSend_(chatId, "✍️ کلمه کلیدی و URL را با ویرگول جدا کنید (هر خط یک کلمه):\n<code>grid emulator, https://site.com/page</code>", cancelKeyboard_());
    case "KW_DEL":
      setState("waiting_del");
      return aSend_(chatId, keywordsListText_() + "\n\n🗑 نام کلمه، <b>شماره</b> آن (مثلاً <code>2</code> یا <code>1,3</code>) یا <code>ALL</code> را بفرستید.\n" +
        "ℹ️ حذف فقط از همین لحظه اعمال می‌شود و سکه‌های قبلی کاربران دست نمی‌خورد.", cancelKeyboard_());
    case "BROADCAST":
      setState("waiting_broadcast");
      return aSend_(chatId, "✍️ متن پیام را برای ارسال به تمام کاربران وارد کنید:", cancelKeyboard_());
    case "USERS": return showUsers_(chatId, false);
    case "SYNC": return doSync_(chatId);
    case "COINS":
      setState("waiting_coin_target");
      return aSend_(chatId, "🪙 <b>مدیریت سکه کاربران</b>\n\nشناسه (UID)، نام، ایمیل یا Chat ID کاربر را بفرستید:\n(دستور مستقیم: <code>/coin UID +5</code>)", cancelKeyboard_());
    case "MSG_ONE":
      setState("waiting_single_msg_target");
      return aSend_(chatId, "✉️ شناسه (UID)، نام یا ایمیل کاربر را بفرستید:\n(دستور مستقیم: <code>/msg UID متن</code>)", cancelKeyboard_());
    case "CHECK":
      setState("waiting_check_target");
      return aSend_(chatId, "🔍 شناسه (UID)، نام یا ایمیل کاربر را بفرستید تا دقیقاً همان کیف پولی که او می‌بیند نمایش داده شود:", cancelKeyboard_());
    case "WITHDRAWALS": return showWithdrawals_(chatId);
    case "PUSH_MENU": return pushMenuToAll_(chatId);
    case "STATUS": return showStatus_(chatId);
  }
}

/* ------------------------- دستورات مستقیم ------------------------- */

function commandsHelp_() {
  return "ℹ️ <b>دستورات مستقیم:</b>\n" +
    "<code>/coin UID +5</code> | <code>/coin UID -3</code> | <code>/coin UID 20</code> | <code>/coin UID صفر</code>\n" +
    "<code>/reset UID</code> — ریست کامل (با تأیید)\n" +
    "<code>/msg UID متن</code> — پیام به یک کاربر\n" +
    "<code>/user UID</code> — بررسی کاربر\n" +
    "<code>/users</code> — لیست کاربران\n" +
    "<code>/sync</code> — بروزرسانی سکه همه\n" +
    "<code>/status</code> — وضعیت سیستم\n" +
    "<code>/addadmin CHAT_ID</code> — افزودن مدیر";
}

function handleAdminCommand_(chatId, rawText) {
  var text = toEnDigits_(rawText);
  var parts = text.split(/\s+/);
  var cmd = parts[0].toLowerCase().replace(/@.*$/, "");
  var u;
  if (cmd === "/msg" || cmd === "/message") {
    var m = rawText.match(/^\/\S+\s+(\S+)\s+([\s\S]+)$/);
    if (!m) return aSend_(chatId, commandsHelp_());
    u = pickOneUser_(chatId, m[1], "m");
    return u ? aSend_(chatId, sendToUser_(u.chatId, m[2])) : null;
  }
  if (cmd === "/coin") {
    if (parts.length !== 3) return aSend_(chatId, commandsHelp_());
    var p = parseCoinInput_(parts[2]);
    if (!p) return aSend_(chatId, "❌ مقدار نامعتبر است.\n\n" + commandsHelp_());
    u = pickOneUser_(chatId, parts[1], "s");
    return u ? applyCoinOp_(chatId, u.chatId, p, null) : null;
  }
  if (cmd === "/reset") {
    if (parts.length < 2) return aSend_(chatId, commandsHelp_());
    u = pickOneUser_(chatId, parts[1], "s");
    return u ? applyCoinOp_(chatId, u.chatId, { op: "reset" }, null) : null;
  }
  if (cmd === "/user" || cmd === "/check") {
    u = pickOneUser_(chatId, parts.slice(1).join(" "), "k");
    return u ? showCheck_(chatId, u) : null;
  }
  if (cmd === "/users") return showUsers_(chatId, false);
  if (cmd === "/sync" || cmd === "/migrate") return doSync_(chatId);
  if (cmd === "/status") return showStatus_(chatId);
  if (cmd === "/id") return aSend_(chatId, "Chat ID شما: <code>" + chatId + "</code>");
  if (cmd === "/addadmin") {
    var id = String(parts[1] || "").trim();
    if (!/^-?\d+$/.test(id)) return aSend_(chatId, "مثال: <code>/addadmin 123456789</code>");
    var ids = adminIds_();
    if (ids.indexOf(id) === -1) ids.push(id);
    setSetting_("ADMIN_IDS", "'" + ids.join(","));
    return aSend_(chatId, "✅ مدیران: <code>" + ids.join(", ") + "</code>");
  }
  return aSend_(chatId, commandsHelp_());
}

/** ورودی سکه: +5 ، -3 ، 20 (تعیین مستقیم) ، صفر ، reset/ریست (ریست کامل). ارقام فارسی هم قبول است. */
function parseCoinInput_(text) {
  var t = toEnDigits_(text).trim().toLowerCase().replace(/−/g, "-").replace(/＋/g, "+").replace(/\s+/g, "");
  if (t === "reset" || t === "ریست") return { op: "reset" };
  if (t === "صفر" || t === "zero") return { op: "zero" };
  var m;
  if ((m = t.match(/^\+(\d+)$/))) return { op: "add", amount: Number(m[1]) };
  if ((m = t.match(/^-(\d+)$/))) return { op: "sub", amount: Number(m[1]) };
  if ((m = t.match(/^=?(\d+)$/))) return { op: "set", amount: Number(m[1]) };
  return null;
}

/** اگر دقیقاً یک کاربر پیدا شد برمی‌گرداند؛ اگر چند نفر بودند دکمه انتخاب می‌فرستد */
function pickOneUser_(chatId, query, purpose) {
  var list = findUsers_(query);
  if (!list.length) {
    aSend_(chatId, "❌ کاربری با «" + esc_(query) + "» یافت نشد. دوباره بفرستید یا «انصراف ❌» را بزنید.", cancelKeyboard_());
    return null;
  }
  if (list.length === 1) return list[0];
  var rows = list.slice(0, 10).map(function (u) {
    return [{ text: u.name + " | " + u.uid + (u.email ? " | " + u.email : ""), callback_data: purpose + "|" + u.chatId }];
  });
  aSend_(chatId, "👥 " + list.length + " کاربر پیدا شد؛ یکی را انتخاب کنید:", { inline_keyboard: rows });
  return null;
}

function openUserFor_(chatId, u, purpose, props) {
  if (purpose === "k") return showCheck_(chatId, u);
  if (purpose === "m") {
    props.setProperty("msg_target_" + chatId, String(u.chatId));
    props.setProperty("state_" + chatId, "waiting_single_msg_content");
    return aSend_(chatId, "👤 <b>کاربر انتخاب شد:</b> " + esc_(u.name) + " (ID: <code>" + esc_(u.uid) + "</code>)\n\n✍️ متن پیام اختصاصی را بفرستید:", cancelKeyboard_());
  }
  props.setProperty("coin_target_" + chatId, String(u.chatId));
  props.setProperty("state_" + chatId, "waiting_coin_val");
  var b = getFreshBalance_(u);
  var card = coinCard_(u, b, "");
  return aSend_(chatId, card.text + "\n\n✍️ یا مقدار دلخواه را تایپ کنید: <code>+5</code> ، <code>-3</code> ، <code>20</code> ، <code>صفر</code>", card.markup);
}
