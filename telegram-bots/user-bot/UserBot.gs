/**
 * ============================================================
 *  UserBot.gs  —  ربات کاربران
 *  فایل‌های این پروژه: Config.gs + Core.gs (مشترک) + همین فایل
 * ============================================================
 */

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return;
    var update = JSON.parse(e.postData.contents);
    if (isDuplicateUpdate_(update, "u")) return;
    reportCoreVersion_("USER");
    var msg = update.message;
    if (!msg || !msg.chat || (msg.chat.type && msg.chat.type !== "private")) return;
    handleUserMessage_(msg);
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
  }
}

var CANCEL_TEXT = "انصراف ❌";

function uSend_(chatId, text) { return tgSend_(cfg_("USER_BOT_TOKEN"), chatId, text, userMainKeyboard_()); }
function uSendCancel_(chatId, text) {
  return tgSend_(cfg_("USER_BOT_TOKEN"), chatId, text, { keyboard: [[{ text: CANCEL_TEXT }]], resize_keyboard: true });
}

function handleUserMessage_(msg) {
  var chatId = String(msg.chat.id);
  var text = String(msg.text || "").trim();
  var props = PropertiesService.getScriptProperties();
  var stateKey = "state_" + chatId;
  var state = props.getProperty(stateKey) || "idle";

  // دکمه‌های منو همیشه اولویت دارند و هر حالت نیمه‌کاره را لغو می‌کنند
  var isMenu = text === "/start" || text === CANCEL_TEXT || text === "انصراف" ||
    Object.keys(USER_BTN).some(function (k) { return USER_BTN[k] === text; });
  if (isMenu && state !== "idle") { props.deleteProperty(stateKey); state = "idle"; }

  if (text === CANCEL_TEXT || text === "انصراف") return uSend_(chatId, "لغو شد. منوی اصلی:");
  if (text === USER_BTN.KEYWORDS) return showKeywords_(chatId);
  if (text === "/start" || text === USER_BTN.RESTART) return startOrWelcome_(chatId, props);
  if (state === "waiting_name") return onName_(chatId, text, props);
  if (state === "waiting_email") return onEmail_(chatId, text, props);
  if (state === "waiting_card") return onCard_(chatId, text, props);
  if (text === USER_BTN.HELP || text === "گوشی" || text === "دسکتاپ") return showHelp_(chatId, text);

  var user = getUser_(chatId, props);
  if (text === USER_BTN.WALLET) {
    if (!user) return askRegister_(chatId);
    return uSend_(chatId, walletText_(user, getFreshBalance_(user)));
  }
  if (text === USER_BTN.WITHDRAW) {
    if (!user) return askRegister_(chatId);
    return startWithdraw_(chatId, user, props);
  }
  if (text === USER_BTN.INFO) {
    if (!user) return askRegister_(chatId);
    return uSend_(chatId, infoText_(user));
  }
  uSend_(chatId, "منوی اصلی:");
}

function askRegister_(chatId) {
  return uSend_(chatId, "لطفاً ابتدا با ارسال /start ثبت‌نام کنید.");
}

/* ------------------------- ثبت‌نام ------------------------- */

function startOrWelcome_(chatId, props) {
  var user = getUser_(chatId, props);
  if (user) {
    props.deleteProperty("state_" + chatId);
    return uSend_(chatId, "👋 خوش برگشتید <b>" + esc_(user.name) + "</b>!\n\n" +
      "✅ حساب شما فعال است؛ سکه‌ها، سابقه فعالیت و لینک اختصاصی‌تان حفظ شده‌اند و نیازی به ثبت‌نام دوباره نیست.\n\n" +
      infoText_(user));
  }
  props.setProperty("state_" + chatId, "waiting_name");
  return tgSend_(cfg_("USER_BOT_TOKEN"), chatId,
    "سلام! خوش آمدید.\nبرای شروع، نام خود را به <b>انگلیسی</b> وارد کنید:", { remove_keyboard: true });
}

function onName_(chatId, text, props) {
  var name = text.replace(/\s+/g, " ").trim();
  if (!/^[A-Za-z][A-Za-z0-9 ]{1,29}$/.test(name)) {
    return uSendCancel_(chatId, "⚠️ نام را فقط با حروف انگلیسی وارد کنید (۲ تا ۳۰ کاراکتر).\nمثال: <code>Ali Rezaei</code>");
  }
  props.setProperty("name_" + chatId, name);
  props.setProperty("state_" + chatId, "waiting_email");
  return uSendCancel_(chatId, "حالا ایمیل خود را وارد کنید:");
}

function onEmail_(chatId, text, props) {
  var email = text.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return uSendCancel_(chatId, "⚠️ ایمیل معتبر نیست. لطفاً یک ایمیل درست وارد کنید (مثال: <code>name@gmail.com</code>):");
  }
  var name = props.getProperty("name_" + chatId);
  if (!name) {
    props.setProperty("state_" + chatId, "waiting_name");
    return uSendCancel_(chatId, "لطفاً دوباره نام خود را به انگلیسی وارد کنید:");
  }
  var res = registerUser_(chatId, name, email);
  props.deleteProperty("state_" + chatId);
  props.deleteProperty("name_" + chatId);
  var u = res.user;
  if (!res.created) return uSend_(chatId, "✅ شما قبلاً ثبت‌نام کرده‌اید و اطلاعاتتان حفظ شده است.\n\n" + infoText_(u));
  return uSend_(chatId, "🎉 <b>ثبت‌نام شما با موفقیت انجام شد!</b>\n\n" +
    "🆔 شناسه: <code>" + esc_(u.uid) + "</code>\n" +
    "👤 نام: " + esc_(u.name) + "\n" +
    "📧 ایمیل: " + esc_(u.email) + "\n" +
    "🔗 لینک اختصاصی:\n" + esc_(personalLink_(u.linkUid)) + "\n\n" +
    "🚀 <b>مراحل فعالیت:</b>\n" +
    "۱. حتماً یک پنجره ناشناس (<b>New Incognito window</b>) در مرورگر Chrome باز کنید و لینک بالا را در آن باز کنید.\n" +
    "۲. سپس دکمه <b>«" + USER_BTN.KEYWORDS + "»</b> را بزنید.\n" +
    "۳. در همان پنجره کلمات را در گوگل جستجو کرده و روی لینک‌های ارگانیک (غیر تبلیغاتی) کلیک کنید.");
}

/** کاربر را از شیت می‌خواند؛ اگر ردیفش نبود ولی نسخه قدیمی او را در Script Properties داشت، بازسازی می‌کند */
function getUser_(chatId, props) {
  var user = findUserByChatId_(chatId);
  if (user) return user;
  var uid = props.getProperty("id_" + chatId);
  var name = props.getProperty("name_" + chatId);
  var state = props.getProperty("state_" + chatId) || "idle";
  if (!uid || !name || state === "waiting_email") return null;
  return withLock_(function () {
    var again = findUserByChatId_(chatId);
    if (again) return again;
    var u = usersSheet_();
    var linkUid = cleanName_(name) + uid;
    var row = blankRow_(u.map);
    var vals = {
      ChatID: chatId, UID: uid, Name: name, Email: props.getProperty("email_" + chatId) || "",
      EarnedCoins: 0, Adjustment: 0, TotalCoins: 0, LastUpdated: new Date(),
      LinkUid: linkUid, LogTab: userTabName_(linkUid), JoinedAt: new Date()
    };
    Object.keys(vals).forEach(function (k) { row[u.map[k] - 1] = vals[k]; });
    u.sh.appendRow(row); // ProcessedRows خالی است ← در اولین محاسبه، سکه‌های قبلی بازسازی می‌شوند
    return findUserByChatId_(chatId);
  });
}

function infoText_(user) {
  return "📋 <b>اطلاعات حساب شما:</b>\n\n" +
    "🆔 آیدی: <code>" + esc_(user.uid) + "</code>\n" +
    "👤 نام: " + esc_(user.name) + "\n" +
    "📧 ایمیل: " + esc_(user.email || "بدون ایمیل") + "\n" +
    "🔗 لینک اختصاصی شما:\n" + esc_(personalLink_(user.linkUid));
}

/* ------------------------- کلمات و راهنما ------------------------- */

function showKeywords_(chatId) {
  var kws = activeKeywords_();
  var msg = "🔑 <b>لیست کلمات کلیدی فعال امروز:</b>\n\n";
  if (!kws.length) {
    msg += "⚠️ در حال حاضر هیچ کلمه‌ای توسط مدیریت ثبت نشده است.";
  } else {
    kws.forEach(function (k, i) { msg += (i + 1) + ". <code>" + esc_(k.kw) + "</code>\n"; });
    msg += "\n🎯 <b>دستورالعمل:</b> یکی از کلمات بالا را کپی کرده، در گوگل جستجو کنید و روی سایت ما کلیک کنید.\n\n" +
      "⛔️ <b>هشدار بسیار مهم:</b> به هیچ عنوان روی لینک‌های دارای برچسب <b>Sponsored</b> یا <b>Ad</b> (تبلیغات گوگل) کلیک نکنید! " +
      "برای این ورودی‌ها هیچ سکه‌ای ثبت نمی‌شود.\n\n" +
      "⚠️ <b>نکته ۱:</b> فقط کلیک‌های طبیعی (Organic) گوگل محاسبه می‌شوند.\n" +
      "⚠️ <b>نکته ۲:</b> در هر ساعت حداکثر " + hourlyLimit_() + " فعالیت از هر صفحه محاسبه می‌شود.";
  }
  return uSend_(chatId, msg);
}

function showHelp_(chatId, text) {
  var mob = String(cfg_("MOBILE_VIDEO_LINK") || "").trim() || "در حال حاضر لینکی ثبت نشده است.";
  var desk = String(cfg_("DESKTOP_VIDEO_LINK") || "").trim() || "در حال حاضر لینکی ثبت نشده است.";
  if (text === "گوشی") return uSend_(chatId, "📱 <b>ویدیوی راهنمای موبایل (گوشی):</b>\n\n" + esc_(mob));
  if (text === "دسکتاپ") return uSend_(chatId, "💻 <b>ویدیوی راهنمای دسکتاپ (کامپیوتر):</b>\n\n" + esc_(desk));
  return uSend_(chatId, "📱 <b>ویدیوی راهنمای موبایل (گوشی):</b>\n" + esc_(mob) +
    "\n\n💻 <b>ویدیوی راهنمای دسکتاپ (کامپیوتر):</b>\n" + esc_(desk));
}

/* ------------------------- تسویه ------------------------- */

function startWithdraw_(chatId, user, props) {
  var t = withdrawalTotals_(readWithdrawals_().list)[chatId];
  if (t && t.pendingCount) {
    return uSend_(chatId, "⏳ شما یک درخواست تسویه در حال بررسی دارید (کد <code>" + esc_(t.pendingReq.id) + "</code>، مبلغ " +
      esc_(t.pendingReq.amount) + ").\nپس از بررسی مدیریت، نتیجه برای شما ارسال می‌شود.");
  }
  var b = getFreshBalance_(user);
  var min = num_(cfg_("MIN_WITHDRAW_TOMAN"));
  if (b.toman < min) {
    return uSend_(chatId, "⚠️ حداقل مبلغ برای تسویه " + fmtNum_(min) + " تومان است.\n\n💵 موجودی فعلی شما: " +
      fmtNum_(b.toman) + " تومان (" + b.coins + " سکه)");
  }
  props.setProperty("state_" + chatId, "waiting_card");
  return uSendCancel_(chatId, "✅ موجودی شما کافی است (" + fmtNum_(b.toman) + " تومان).\n" +
    "لطفاً <b>شماره کارت ۱۶ رقمی</b> خود را جهت واریز ارسال کنید:");
}

function onCard_(chatId, text, props) {
  var digits = toEnDigits_(text).replace(/[\s\-_.]/g, "");
  if (!/^\d{16}$/.test(digits) || !luhnOk_(digits)) {
    return uSendCancel_(chatId, "⚠️ شماره کارت معتبر نیست. لطفاً ۱۶ رقم کارت را دقیق ارسال کنید (یا «" + CANCEL_TEXT + "» را بزنید):");
  }
  props.deleteProperty("state_" + chatId);
  var user = getUser_(chatId, props);
  if (!user) return askRegister_(chatId);
  var res = createWithdrawal_(user, digits);
  if (!res.ok && res.reason === "pending") {
    return uSend_(chatId, "⏳ شما یک درخواست تسویه در حال بررسی دارید (کد <code>" + esc_(res.req.id) + "</code>).");
  }
  if (!res.ok) {
    return uSend_(chatId, "⚠️ موجودی شما برای تسویه کافی نیست. موجودی فعلی: " + fmtNum_(res.b.toman) + " تومان.");
  }
  notifyAdmins_("🔔 <b>درخواست تسویه جدید</b>\n\n" + withdrawalAdminText_({
    id: res.id, chatId: chatId, uid: user.uid, name: user.name, card: res.card,
    amount: fmtNum_(res.toman) + " تومان", coins: res.coins, date: new Date(), status: WD_STATUS.PENDING
  }, user), withdrawalButtons_({ id: res.id, coins: res.coins, status: WD_STATUS.PENDING }));
  return uSend_(chatId, "✅ درخواست تسویه شما با موفقیت ثبت شد و در صف بررسی مدیریت قرار گرفت.\n\n" +
    "🧾 کد پیگیری: <code>" + esc_(res.id) + "</code>\n" +
    "💵 مبلغ: " + fmtNum_(res.toman) + " تومان (" + res.coins + " سکه)\n" +
    "💳 کارت: <code>" + esc_(res.card) + "</code>\n\n" +
    "ℹ️ این سکه‌ها تا زمان بررسی رزرو شده‌اند؛ اگر درخواست رد شود، به حساب شما برمی‌گردند.");
}

/* ------------------------- ابزار تنظیمات (از ویرایشگر اجرا کنید) ------------------------- */

/** وضعیت وبهوک ربات کاربر را در Execution log نشان می‌دهد */
function checkUserWebhook() {
  Logger.log(JSON.stringify(tgApi_(cfg_("USER_BOT_TOKEN"), "getWebhookInfo", {}), null, 2));
}
