/**
 * ============================================================
 *  AdminViews.gs  —  نمایش‌ها و عملیات ربات مدیریت
 * ============================================================
 */

var CREDIT_LABELS = {
  COUNTED: "✅ شمرده شد", LIMIT: "⏱ سقف ساعتی", NO_KEYWORD: "🔤 خارج از کلمات فعال",
  NOT_GOOGLE: "🌐 ورودی غیرگوگل", SPONSORED: "⛔️ تبلیغاتی", IRAN: "🇮🇷 IP/ساعت ایران",
  OTHER: "❔ سایر", BEFORE_UPDATE: "📦 قبل از بروزرسانی (در موجودی قبلی حساب شده)"
};

function btn_(text, data) { return { text: text, callback_data: data }; }

/* ------------------------- کلمات ------------------------- */

function keywordsListText_() {
  var kws = activeKeywords_();
  if (!kws.length) return "🔑 <b>کلمات کلیدی فعال:</b>\n⚠️ هیچ کلمه‌ای ثبت نشده است.";
  var t = "🔑 <b>کلمات کلیدی فعال امروز:</b>\n\n";
  kws.forEach(function (k, i) {
    t += (i + 1) + ". <code>" + esc_(k.kw) + "</code>";
    if (/^https?:\/\//i.test(k.url)) t += " ➡️ <a href=\"" + esc_(k.url) + "\">لینک</a>";
    else if (k.url) t += " ➡️ <code>" + esc_(k.url) + "</code>";
    if (isFinite(k.from)) t += " <i>(از " + fmtDate_(new Date(k.from), "MM/dd HH:mm") + ")</i>";
    t += "\n";
  });
  return t;
}

/* ------------------------- کاربران ------------------------- */

function getUsersSnapshot_(force) {
  var last = toMs_(getSetting_("LAST_SETTLE_ALL"));
  var all = readAllUsers_();
  var stale = last === null || (Date.now() - last) > 2 * 60 * 1000;
  if (force || stale || all.users.some(function (u) { return u.processed === null; })) {
    var r = settleAllUsers_();
    r.settledNow = true;
    return r;
  }
  var wt = withdrawalTotals_(readWithdrawals_().list);
  all.users.forEach(function (u) { u.balance = balanceOf_(u, wt[u.chatId]); });
  return { users: all.users, wt: wt, settledNow: false, lastMs: last };
}

function showUsers_(chatId, force) {
  var snap = getUsersSnapshot_(force);
  var users = snap.users.slice().sort(function (a, b) { return b.balance.coins - a.balance.coins; });
  if (!users.length) return aSend_(chatId, "👥 <b>آمار کاربران:</b>\n⚠️ هیچ کاربری ثبت نشده است.");
  var totalCoins = 0, openReqs = 0;
  users.forEach(function (u) { totalCoins += u.balance.coins; openReqs += u.balance.pendingCount; });
  var msg = "👥 <b>آمار و وضعیت سکه کاربران</b>\n" +
    "📊 تعداد کل کاربران: <b>" + users.length + "</b> نفر\n" +
    "🪙 مجموع موجودی همه: <b>" + totalCoins + "</b> سکه (" + fmtNum_(totalCoins * coinValue_()) + " تومان)\n" +
    "⏳ درخواست تسویه باز: <b>" + openReqs + "</b>\n" +
    "🕒 محاسبه: " + fmtDate_(snap.settledNow ? new Date() : new Date(snap.lastMs), "yyyy-MM-dd HH:mm") +
    (snap.settledNow ? " (همین الان)" : "") + "\n" +
    "✅ موجودی‌ها با همان فرمولی حساب شده‌اند که کیف پول کاربر نشان می‌دهد.\n" +
    "━━━━━━━━━━━━━━━━━━━━\n\n";
  users.forEach(function (u, i) {
    var b = u.balance;
    msg += (i + 1) + ". <b>" + esc_(u.name || "بدون نام") + "</b> (ID: <code>" + esc_(u.uid) + "</code>)\n";
    if (u.email) msg += "📧 " + esc_(u.email) + "\n";
    msg += "📊 بازدید: " + u.pv + " | 💓 فعالیت: " + u.hb + " | 🪙 سکه فعالیت: " + b.activity + "\n";
    var extra = [];
    if (b.adj) extra.push("⚙️ دستی: " + signed_(b.adj));
    if (b.pending) extra.push("⏳ تسویه: -" + b.pending);
    if (b.paid) extra.push("✅ پرداخت‌شده: -" + b.paid);
    if (extra.length) msg += extra.join(" | ") + "\n";
    msg += "💰 <b>موجودی: " + b.coins + " سکه</b> (" + fmtNum_(b.toman) + " تومان)\n";
    msg += "------------------------------------\n";
  });
  return aSend_(chatId, msg);
}

function doSync_(chatId) {
  aSend_(chatId, "⏳ در حال بررسی لاگ‌ها و به‌روزرسانی سکه کاربران...");
  var r = settleAllUsers_();
  var msg = "✅ سکه <b>" + r.users.length + "</b> کاربر بروزرسانی شد.\n";
  if (r.migrated) msg += "📦 انتقال به سیستم جدید: " + r.migrated + " کاربر (موجودی قبلی‌شان قفل و حفظ شد)\n";
  if (r.bonusUsers.length) {
    msg += "🛟 برای " + r.bonusUsers.length + " کاربر عدد ذخیره‌شده قبلی بیشتر از بازسازی لاگ بود و همان عدد بیشتر حفظ شد: " +
      esc_(r.bonusUsers.slice(0, 20).map(function (u) { return u.name + " (" + u.uid + ")"; }).join("، ")) + "\n";
  }
  if (r.errors) msg += "⚠️ خطا در " + r.errors + " کاربر (جزئیات در Executions پروژه)\n";
  msg += "\nℹ️ این عملیات فقط بازدیدهای جدید را اضافه می‌کند و هرگز سکه کسی را کم نمی‌کند.";
  return aSend_(chatId, msg);
}

/* ------------------------- مدیریت سکه ------------------------- */

function coinCard_(u, b, header) {
  var text = (header ? header + "\n\n" : "") +
    "🪙 <b>مدیریت سکه</b>\n" +
    "👤 <b>" + esc_(u.name) + "</b> | 🆔 <code>" + esc_(u.uid) + "</code> | Chat: <code>" + esc_(u.chatId) + "</code>\n" +
    "📊 بازدید مجاز: " + u.pv + " | 💓 فعالیت: " + u.hb + "\n" +
    "🪙 سکه فعالیت: <b>" + b.activity + "</b>" + (u.bonus ? " (شامل " + u.bonus + " سکه حفظ‌شده از نسخه قبل)" : "") + "\n" +
    "⚙️ تنظیم دستی: <b>" + signed_(b.adj) + "</b>\n" +
    (b.pending ? "⏳ در انتظار تسویه: <b>-" + b.pending + "</b>\n" : "") +
    (b.paid ? "✅ تسویه‌شده: <b>-" + b.paid + "</b>\n" : "") +
    "💰 <b>موجودی فعلی کاربر: " + b.coins + " سکه</b> (" + fmtNum_(b.toman) + " تومان)\n" +
    "🕒 " + fmtDate_(new Date(), "HH:mm:ss");
  var id = u.chatId;
  var markup = {
    inline_keyboard: [
      [btn_("+1", "c|" + id + "|add|1"), btn_("+5", "c|" + id + "|add|5"), btn_("+10", "c|" + id + "|add|10"), btn_("+20", "c|" + id + "|add|20")],
      [btn_("-1", "c|" + id + "|sub|1"), btn_("-5", "c|" + id + "|sub|5"), btn_("-10", "c|" + id + "|sub|10"), btn_("-20", "c|" + id + "|sub|20")],
      [btn_("♻️ صفر کردن موجودی", "c|" + id + "|zero"), btn_("🧹 ریست کامل", "c|" + id + "|reset")],
      [btn_("🔍 جزئیات کاربر", "k|" + id), btn_("🔄 تازه‌سازی", "c|" + id + "|refresh")]
    ]
  };
  return { text: text, markup: markup };
}

function applyCoinOp_(adminChatId, targetChatId, p, messageId) {
  var token = cfg_("ADMIN_BOT_TOKEN");
  var show = function (text, markup) {
    return messageId ? tgEdit_(token, adminChatId, messageId, text, markup) : aSend_(adminChatId, text, markup);
  };
  if (!targetChatId) return aSend_(adminChatId, "⚠️ کاربر انتخاب نشده است. دوباره «" + ADMIN_BTN.COINS + "» را بزنید.");
  if (p.op === "reset") {
    var u0 = findUserByChatId_(targetChatId);
    return show("⚠️ <b>ریست کامل</b> کاربر <b>" + esc_(u0 ? u0.name : targetChatId) + "</b>؟\n\n" +
      "همه لاگ‌های بازدید او پاک و موجودی‌اش صفر می‌شود (سابقه تسویه‌ها می‌ماند). این کار برگشت‌پذیر نیست.\n\n" +
      "💡 اگر فقط می‌خواهید موجودی صفر شود، «♻️ صفر کردن موجودی» کافی است و لاگ‌ها حفظ می‌شوند.",
      { inline_keyboard: [[btn_("✅ بله، ریست کامل", "c|" + targetChatId + "|resetok"), btn_("↩️ انصراف", "c|" + targetChatId + "|refresh")]] });
  }
  var header = "", user, b;
  if (p.op === "resetok") {
    var rr = adminFullReset_(adminChatId, targetChatId);
    user = rr.user;
    b = getFreshBalance_(user);
    header = "🧹 <b>ریست کامل انجام شد.</b> " + rr.cleared + " ردیف لاگ پاک شد.";
  } else if (p.op === "refresh") {
    user = findUserByChatId_(targetChatId);
    if (!user) return show("❌ کاربر پیدا نشد.", null);
    b = getFreshBalance_(user);
  } else {
    var r = adminAdjust_(adminChatId, targetChatId, p.op, p.amount, "");
    user = r.user;
    b = r.after;
    header = "✅ <b>سکه کاربر تغییر کرد</b> (" + signed_(r.delta) + ")\nقبل: <b>" + r.before.coins + "</b> سکه | بعد: <b>" + r.after.coins + "</b> سکه";
    if (p.op === "sub" && -r.delta < p.amount) {
      header += "\n⚠️ موجودی کافی نبود؛ فقط " + (-r.delta) + " سکه کم شد (موجودی منفی نمی‌شود).";
    }
  }
  var card = coinCard_(user, b, header);
  return show(card.text, card.markup);
}

/* ------------------------- دکمه‌های شیشه‌ای ------------------------- */

function handleAdminCallback_(cb) {
  var token = cfg_("ADMIN_BOT_TOKEN");
  var adminId = String(cb.from.id);
  var chatId = String(cb.message ? cb.message.chat.id : adminId);
  var mid = cb.message ? cb.message.message_id : null;
  if (adminIds_().indexOf(adminId) === -1) return tgAnswerCb_(token, cb.id, "⛔️ دسترسی ندارید", true);
  var d = String(cb.data || "").split("|");
  var props = PropertiesService.getScriptProperties();
  try {
    if (d[0] === "s" || d[0] === "k" || d[0] === "m") {
      var u = findUserByChatId_(d[1]);
      tgAnswerCb_(token, cb.id, u ? "" : "کاربر پیدا نشد", !u);
      if (!u) return;
      return d[0] === "k" ? showCheck_(chatId, u) : openUserFor_(chatId, u, d[0], props);
    }
    if (d[0] === "c") {
      var op = d[2], amount = Number(d[3] || 0);
      tgAnswerCb_(token, cb.id, op === "add" ? "+" + amount : op === "sub" ? "-" + amount : "⏳");
      return applyCoinOp_(chatId, d[1], { op: op, amount: amount }, mid);
    }
    if (d[0] === "w") return handleWithdrawalCallback_(cb.id, chatId, mid, adminId, d[1], d[2], props);
    tgAnswerCb_(token, cb.id, "");
  } catch (err) {
    tgAnswerCb_(token, cb.id, "⚠️ " + String(err && err.message ? err.message : err).substring(0, 180), true);
  }
}

/* ------------------------- بررسی کاربر ------------------------- */

function showCheck_(chatId, u) {
  var b = getFreshBalance_(u);
  var br = creditBreakdown_(u);
  var t = "🔍 <b>بررسی کاربر</b>\n\n" +
    "👤 <b>" + esc_(u.name) + "</b> | 🆔 <code>" + esc_(u.uid) + "</code> | Chat: <code>" + esc_(u.chatId) + "</code>\n" +
    "📧 " + esc_(u.email || "—") + "\n" +
    "🔗 " + esc_(personalLink_(u.linkUid)) + "\n" +
    "📄 تب لاگ: <code>" + esc_(u.logTab) + "</code>" + (br ? " (" + br.rows + " ردیف)" : " (هنوز بازدیدی ثبت نشده)") + "\n";
  if (br) t += "🕒 آخرین فعالیت: " + fmtDate_(br.lastTime) + "\n";
  t += "\n👇 <b>دقیقاً همان چیزی که کاربر در «کیف پول» می‌بیند:</b>\n━━━━━━━━━━━━━━\n" +
    walletText_(u, b) + "\n━━━━━━━━━━━━━━\n\n<b>🧾 جزئیات برای مدیر:</b>\n";
  if (u.bonus) t += "• سکه حفظ‌شده از نسخه قبل: " + u.bonus + "\n";
  if (br) {
    t += "• وضعیت ردیف‌های لاگ:\n";
    Object.keys(br.counts).forEach(function (k) { t += "   " + (CREDIT_LABELS[k] || k) + ": " + br.counts[k] + "\n"; });
    t += "• اگر «همه» ورودی‌های ارگانیک گوگل (بدون فیلتر کلمه) شمرده می‌شد: حدود " + br.estimateAllGoogle + " سکه\n";
  }
  t += "• ستون Credit در تب لاگ کاربر، دلیل شمرده شدن/نشدن هر بازدید را نشان می‌دهد.\n" +
    "• هر تغییر دستی سکه در شیت CoinHistory ثبت می‌شود.";
  return aSend_(chatId, t, { inline_keyboard: [[btn_("🪙 مدیریت سکه", "s|" + u.chatId), btn_("✉️ پیام به کاربر", "m|" + u.chatId)]] });
}

/* ------------------------- پیام‌ها ------------------------- */

function sendToUser_(targetChatId, text) {
  if (!targetChatId) return "⚠️ کاربر انتخاب نشده است.";
  var u = findUserByChatId_(targetChatId);
  var res = tgSend_(cfg_("USER_BOT_TOKEN"), targetChatId, "📩 <b>پیام اختصاصی از طرف مدیریت:</b>\n\n" + esc_(text), userMainKeyboard_());
  if (res && res.ok) return "✅ پیام فقط برای کاربر <b>" + esc_(u ? u.name : targetChatId) + "</b> ارسال شد.";
  var desc = (res && res.description) || "نامشخص";
  return "⚠️ خطا در ارسال پیام: " + esc_(desc) + (/blocked/i.test(desc) ? "\n(کاربر ربات را بلاک کرده است)" : "");
}

function allUserChatIds_() {
  var seen = {};
  return readAllUsers_().users.map(function (u) { return u.chatId; })
    .filter(function (id) { if (!id || seen[id]) return false; seen[id] = true; return true; });
}

function doBroadcast_(chatId, text) {
  var ids = allUserChatIds_();
  aSend_(chatId, "⏳ در حال ارسال به " + ids.length + " کاربر...");
  var r = tgBroadcast_(cfg_("USER_BOT_TOKEN"), ids, "📢 <b>پیام عمومی ادمین:</b>\n\n" + esc_(text), userMainKeyboard_());
  return aSend_(chatId, "✅ ارسال شد: " + r.sent + "\n🚫 ربات را بلاک کرده‌اند: " + r.blocked + "\n⚠️ ناموفق: " + r.failed);
}

/** منوی جدید ربات کاربر را برای همه می‌فرستد (بعد از هر آپدیت کد) */
function pushMenuToAll_(chatId) {
  var ids = allUserChatIds_();
  aSend_(chatId, "⏳ ارسال منوی جدید به " + ids.length + " کاربر...");
  var r = tgBroadcast_(cfg_("USER_BOT_TOKEN"), ids,
    "🆕 <b>ربات بروزرسانی شد!</b>\nمنوی جدید برای شما فعال شد. سکه‌ها و اطلاعات شما بدون هیچ تغییری حفظ شده‌اند ✅",
    userMainKeyboard_());
  return aSend_(chatId, "✅ منوی جدید ارسال شد: " + r.sent + "\n🚫 بلاک‌کرده: " + r.blocked + "\n⚠️ ناموفق: " + r.failed);
}

/* ------------------------- تسویه ------------------------- */

function showWithdrawals_(chatId) {
  var w = readWithdrawals_();
  var pending = w.list.filter(function (x) { return x.status === WD_STATUS.PENDING; });
  pending.forEach(function (x) {
    if (!x.hasId) { writeCells_(w.sh, x.row, w.map, { RequestID: x.id }); x.hasId = true; }
  });
  var paid = w.list.filter(function (x) { return x.status === WD_STATUS.PAID; }).length;
  var rejected = w.list.filter(function (x) { return x.status === WD_STATUS.REJECTED; }).length;
  var pendingToman = 0;
  pending.forEach(function (x) { pendingToman += (x.coins === null ? parseAmountCoins_(x.amount) : x.coins) * coinValue_(); });
  var recent = w.list.filter(function (x) { return x.status === WD_STATUS.PAID || x.status === WD_STATUS.REJECTED; })
    .sort(function (a, b) { return (toMs_(b.processedAt) || toMs_(b.date) || 0) - (toMs_(a.processedAt) || toMs_(a.date) || 0); })
    .slice(0, 5);
  var recentTxt = recent.length ? "\n\n🧾 <b>آخرین بررسی‌ها:</b>\n" + recent.map(function (x) {
    return (x.status === WD_STATUS.PAID ? "✅ " : "❌ ") + esc_(x.name) + " | " + esc_(x.amount) + " | " +
      fmtDate_(isBlank_(x.processedAt) ? x.date : x.processedAt, "MM/dd HH:mm") + (x.note ? " | 🔖 " + esc_(x.note) : "");
  }).join("\n") : "";
  aSend_(chatId, "💳 <b>درخواست‌های تسویه</b>\n⏳ در انتظار: <b>" + pending.length + "</b> (" + fmtNum_(pendingToman) + " تومان)\n" +
    "✅ پرداخت‌شده: " + paid + "\n❌ ردشده: " + rejected +
    (pending.length ? "\n\nبعد از واریز، زیر همان درخواست «✅ پرداخت شد» را بزنید؛ وضعیت «پرداخت‌شده» می‌شود و به کاربر پیام می‌رود. «❌ رد» سکه‌ها را به کاربر برمی‌گرداند." : "\n\n📭 درخواست بازی وجود ندارد.") +
    recentTxt);
  var token = cfg_("ADMIN_BOT_TOKEN");
  pending.slice(0, 15).forEach(function (req) { tgSend_(token, chatId, withdrawalAdminText_(req, null), withdrawalButtons_(req)); });
  if (pending.length > 15) aSend_(chatId, "… و " + (pending.length - 15) + " درخواست دیگر؛ پس از بررسی این‌ها دوباره دکمه را بزنید.");
}

/**
 * دکمه‌های زیر هر درخواست تسویه:
 *  paid / paid0 / reject  → مرحله تأیید (و امکان تایپ شماره پیگیری یا دلیل رد)
 *  paidok / paid0ok / rejectok → ثبت نهایی، تغییر وضعیت در شیت و پیام به کاربر
 *  back → برگشت به دکمه‌های اصلی
 */
function handleWithdrawalCallback_(cbId, chatId, mid, adminId, reqId, act, props) {
  var token = cfg_("ADMIN_BOT_TOKEN");
  var req = findWithdrawal_(reqId);
  if (!req) return tgAnswerCb_(token, cbId, "درخواست پیدا نشد", true);
  if (req.status !== WD_STATUS.PENDING && act !== "back") {
    tgAnswerCb_(token, cbId, "این درخواست قبلاً بررسی شده: " + wdStatusFa_(req.status), true);
    if (mid) tgEdit_(token, chatId, mid, withdrawalAdminText_(req, null), null);
    return;
  }
  if (act === "paid" || act === "paid0" || act === "reject") {
    props.setProperty("state_" + chatId, "waiting_wd_note");
    props.setProperty("wd_note_req_" + chatId, reqId);
    props.setProperty("wd_note_act_" + chatId, act);
    props.setProperty("wd_note_msg_" + chatId, String(mid || ""));
    props.setProperty("wd_note_at_" + chatId, String(Date.now()));
    tgAnswerCb_(token, cbId, "");
    var prompt = act === "reject" ?
      "❓ <b>رد این درخواست را تأیید می‌کنید؟</b>\nسکه‌های رزروشده به موجودی کاربر برمی‌گردد و به او پیام می‌رود.\n" +
      "📝 <b>اختیاری:</b> برای ارسال <b>دلیل رد</b> به کاربر، به جای دکمه، دلیل را همین حالا تایپ و ارسال کنید." :
      "❓ <b>مبلغ را واریز کرده‌اید؟</b>\nبا تأیید، وضعیت «✅ پرداخت‌شده» می‌شود، سکه‌های این درخواست برای همیشه کسر می‌ماند و به کاربر پیام «مدیریت پرداخت کرد» می‌رود.\n" +
      "🔖 <b>اختیاری:</b> برای ارسال <b>شماره پیگیری واریز</b> به کاربر، به جای دکمه، شماره پیگیری را همین حالا تایپ و ارسال کنید.";
    return tgEdit_(token, chatId, mid, withdrawalAdminText_(req, null) + "\n\n" + prompt, withdrawalConfirmButtons_(req, act));
  }
  if (props.getProperty("wd_note_req_" + chatId) === reqId) clearWdNoteState_(chatId, props);
  if (act === "back") {
    tgAnswerCb_(token, cbId, "");
    return tgEdit_(token, chatId, mid, withdrawalAdminText_(req, null), withdrawalButtons_(req));
  }
  if (act === "paidok" || act === "paid0ok" || act === "rejectok") {
    tgAnswerCb_(token, cbId, "⏳ در حال ثبت...");
    return finishWithdrawal_(chatId, adminId, reqId, act.replace(/ok$/, ""), "", mid, false);
  }
  tgAnswerCb_(token, cbId, "");
}

function clearWdNoteState_(chatId, props) {
  if (props.getProperty("state_" + chatId) === "waiting_wd_note") props.deleteProperty("state_" + chatId);
  ["wd_note_req_", "wd_note_act_", "wd_note_msg_", "wd_note_at_"].forEach(function (k) { props.deleteProperty(k + chatId); });
}

/** وقتی ادمین بعد از زدن «✅ پرداخت شد» یا «❌ رد»، شماره پیگیری/دلیل را تایپ می‌کند */
function onWithdrawalNote_(chatId, text, props) {
  var reqId = props.getProperty("wd_note_req_" + chatId);
  var act = props.getProperty("wd_note_act_" + chatId);
  var mid = Number(props.getProperty("wd_note_msg_" + chatId)) || null;
  var at = Number(props.getProperty("wd_note_at_" + chatId)) || 0;
  clearWdNoteState_(chatId, props);
  if (!reqId || !act || Date.now() - at > 10 * 60 * 1000) {
    return aSend_(chatId, "⏱ مهلت ثبت شماره پیگیری/دلیل (۱۰ دقیقه) گذشته است و چیزی ثبت نشد.\nدوباره از «" + ADMIN_BTN.WITHDRAWALS + "» روی دکمه همان درخواست بزنید.");
  }
  return finishWithdrawal_(chatId, chatId, reqId, act, String(text).trim().substring(0, 200), mid, true);
}

/** ثبت نهایی پرداخت/رد: تغییر وضعیت در شیت + پیام به کاربر + نمایش موجودی جدید کاربر به ادمین */
function finishWithdrawal_(chatId, adminId, reqId, action, note, mid, announce) {
  var token = cfg_("ADMIN_BOT_TOKEN");
  var r = processWithdrawal_(adminId, reqId, action, note);
  if (!r.ok) {
    if (r.req && mid) tgEdit_(token, chatId, mid, withdrawalAdminText_(r.req, null), null);
    return aSend_(chatId, r.reason === "already" ? "⚠️ این درخواست قبلاً بررسی شده است (" + wdStatusFa_(r.req.status) + ")." : "⚠️ درخواست پیدا نشد.");
  }
  var sent = notifyWithdrawalResult_(r.req, action, r.balance);
  var done = (action === "reject" ? "❌ درخواست رد شد و سکه‌ها به موجودی کاربر برگشت." : "✅ پرداخت ثبت شد و وضعیت به «پرداخت‌شده» تغییر کرد.") + "\n" +
    (sent && sent.ok ? "📨 پیام برای کاربر ارسال شد." : "⚠️ ارسال پیام به کاربر ناموفق بود" + (sent && sent.description ? " (" + esc_(sent.description) + ")" : "") + ".") +
    (r.balance ? "\n🪙 موجودی فعلی کاربر: <b>" + r.balance.coins + " سکه</b> (" + fmtNum_(r.balance.toman) + " تومان)" : "");
  var full = withdrawalAdminText_(r.req, r.user) + "\n\n" + done;
  if (mid) tgEdit_(token, chatId, mid, full, null);
  if (announce || !mid) aSend_(chatId, announce && mid ? done : full);
}

function notifyWithdrawalResult_(req, action, balance) {
  var bal = balance ? "🪙 موجودی فعلی شما: <b>" + balance.coins + " سکه</b>\n" : "";
  var text;
  if (action === "reject") {
    text = "❌ <b>درخواست تسویه شما رد شد</b>\n\n" +
      "🧾 کد درخواست: <code>" + esc_(req.id) + "</code>\n" +
      (req.coins ? "↩️ " + req.coins + " سکه به موجودی شما برگشت.\n" : "") +
      (req.note ? "📝 دلیل: " + esc_(req.note) + "\n" : "") +
      bal + "\nبرای اطلاعات بیشتر با پشتیبانی در تماس باشید.";
  } else {
    text = "✅ <b>مدیریت درخواست تسویه شما را پرداخت کرد</b>\n\n" +
      "🧾 کد درخواست: <code>" + esc_(req.id) + "</code>\n" +
      "💵 مبلغ: " + esc_(req.amount) + "\n" +
      "💳 کارت: <code>" + esc_(req.card) + "</code>\n" +
      (req.note ? "🔖 شماره پیگیری واریز: <code>" + esc_(req.note) + "</code>\n" : "") +
      bal + "\nاز همکاری شما سپاسگزاریم 🌹";
  }
  return notifyUser_(req.chatId, text);
}

/* ------------------------- وضعیت سیستم ------------------------- */

function showStatus_(chatId) {
  var userVer = String(getSetting_("CORE_VERSION_USER") || "");
  var all = readAllUsers_();
  var unmigrated = all.users.filter(function (u) { return u.processed === null; }).length;
  var hist = getKeywordHistory_();
  var trig = false;
  try { trig = ScriptApp.getProjectTriggers().some(function (t) { return t.getHandlerFunction() === "autoSettleAll"; }); } catch (e) {}
  var verLine = !userVer ? "⚠️ هنوز ثبت نشده (ربات کاربر با کد جدید پیامی دریافت نکرده)" :
    userVer === CORE_VERSION ? "✅ " + esc_(userVer) + " (یکسان)" : "❌ " + esc_(userVer) + " — با ربات ادمین فرق دارد! Core.gs را در هر دو پروژه یکسان کنید.";
  return aSend_(chatId, "⚙️ <b>وضعیت سیستم</b>\n\n" +
    "🧩 نسخه Core ربات ادمین: <b>" + CORE_VERSION + "</b>\n" +
    "🧩 نسخه Core ربات کاربر: " + verLine + "\n" +
    "👥 کاربران: <b>" + all.users.length + "</b>" + (unmigrated ? " (منتقل‌نشده: " + unmigrated + " ← «" + ADMIN_BTN.SYNC + "» را بزنید)" : "") + "\n" +
    "🔑 کلمات فعال: <b>" + activeAt_(hist, Date.now()).length + "</b> | کل تاریخچه: " + hist.length + "\n" +
    "📦 زمان انتقال به سیستم جدید: " + fmtDate_(getSetting_("MIGRATION_TIME")) + "\n" +
    "🔄 آخرین بروزرسانی همه سکه‌ها: " + fmtDate_(getSetting_("LAST_SETTLE_ALL")) + "\n" +
    "⏰ بروزرسانی خودکار هر ۳۰ دقیقه: " + (trig ? "✅ فعال" : "❌ غیرفعال (installAutoSettleTrigger را یک بار اجرا کنید)") + "\n" +
    "👑 مدیران: <code>" + esc_(adminIds_().join(", ")) + "</code>");
}

/* ------------------------- توابع راه‌اندازی (از ویرایشگر Apps Script اجرا کنید) ------------------------- */

/** یک بار بعد از نصب نسخه جدید اجرا کنید: موجودی فعلی همه کاربران را قفل/منتقل می‌کند */
function migrateAllUsers() {
  var r = settleAllUsers_();
  Logger.log("Users: " + r.users.length + " | migrated now: " + r.migrated + " | kept higher stored value: " + r.bonusUsers.length + " | errors: " + r.errors);
}

/** تریگر زمانی: هر ۳۰ دقیقه سکه همه کاربران را به‌روز می‌کند (اختیاری ولی توصیه‌شده) */
function installAutoSettleTrigger() {
  removeAutoSettleTrigger();
  ScriptApp.newTrigger("autoSettleAll").timeBased().everyMinutes(30).create();
  Logger.log("✅ Auto-settle trigger installed (every 30 minutes).");
}

function removeAutoSettleTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "autoSettleAll") ScriptApp.deleteTrigger(t);
  });
}

function autoSettleAll() {
  try { settleAllUsers_(); } catch (e) { console.error(e && e.stack ? e.stack : e); }
}

/** وضعیت وبهوک ربات ادمین را در Execution log نشان می‌دهد */
function checkAdminWebhook() {
  Logger.log(JSON.stringify(tgApi_(cfg_("ADMIN_BOT_TOKEN"), "getWebhookInfo", {}), null, 2));
}
