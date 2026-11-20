/**
 * ============================================================
 *  UserLinkedIn.gs  —  بخش لینکدین در ربات کاربر
 *  (به LinkedIn.gs مشترک نیاز دارد؛ بخش کلیک سایت دست نخورده است)
 * ============================================================
 *  ورود: ۱) لینک پروفایل  ۲) فالو صفحه Impedyme + اسکرین‌شات  ← ادمین هر دو را با هم تایید می‌کند
 *  تا تایید نشود، کار لایک/کامنت باز نمی‌شود.
 *  بررسی کارها: اگر API لینکدین وصل باشد و شناسه لینکدین کاربر ثبت شده باشد، با «✅ لایک کردم / ✅ کامنت گذاشتم»
 *  خودکار بررسی می‌شود؛ در غیر این صورت با اسکرین‌شات و تایید ادمین.
 */

function uInline_(chatId, text, rows) { return tgSend_(cfg_("USER_BOT_TOKEN"), chatId, text, { inline_keyboard: rows }); }
function liShort_(t) { t = String(t); return t.length > 48 ? t.substring(0, 46) + "…" : t; }

/** این کاربر کارهایش را با API بررسی می‌شود؟ */
function liApiModeFor_(member) {
  return !!member && liApiReady_() && liIdKey_(member.LinkedInID) !== "";
}

/* ------------------------- عضویت ------------------------- */

/** دکمه «💼 لینکدین» */
function liEntry_(chatId, user, props) {
  if (!user) return askRegister_(chatId);
  var m = liMember_(chatId).m;
  if (m && m.Status === LI_ST.APPROVED) return liHome_(chatId, user);
  if (m && m.Status === LI_ST.PENDING) return uSend_(chatId, "⏳ درخواست عضویت لینکدین شما در حال بررسی است. نتیجه همین‌جا اطلاع داده می‌شود.");
  var c = liCfg_();
  props.setProperty("state_" + chatId, "waiting_li_profile");
  return uSendCancel_(chatId,
    "💼 <b>کسب سکه از لینکدین</b>\n\n" +
    "➕ فالو صفحه Impedyme = " + c.followCoins + " سکه\n" +
    "👍 هر " + c.likesPerCoin + " لایک تاییدشده = ۱ سکه\n" +
    "💬 هر " + c.commentsPerCoin + " کامنت تاییدشده = ۱ سکه\n" +
    (m && m.Status === LI_ST.REJECTED && m.Reason ? "\n❌ درخواست قبلی شما رد شد: " + esc_(m.Reason) + "\n" : "") +
    "\n<b>مرحله ۱ از ۲:</b> لینک پروفایل لینکدین خود را بفرستید.\nمثال: <code>https://www.linkedin.com/in/your-name</code>\n" +
    "(در اپ لینکدین: روی عکس خودتان ← View profile ← «⋯» ← Share via ← Copy link)");
}

function liAskProfile_(chatId, props) {
  props.setProperty("state_" + chatId, "waiting_li_profile");
  return uSendCancel_(chatId, "<b>مرحله ۱ از ۲:</b> لینک پروفایل لینکدین خود را بفرستید.\nمثال: <code>https://www.linkedin.com/in/your-name</code>");
}

function onLiProfile_(chatId, text, props) {
  if (!liNormProfile_(text)) {
    return uSendCancel_(chatId, "⚠️ این لینک پروفایل شخصی لینکدین نیست. لینک باید شبیه <code>linkedin.com/in/...</code> باشد. دوباره بفرستید:");
  }
  props.setProperty("li_profile_" + chatId, text.trim());
  props.setProperty("state_" + chatId, "waiting_li_follow_shot");
  return uInline_(chatId,
    "<b>مرحله ۲ از ۲:</b> صفحه Impedyme را در لینکدین <b>فالو</b> کنید و یک <b>اسکرین‌شات</b> از صفحه بفرستید که دکمه <b>Following</b> در آن دیده شود.\n" +
    "مدیر پروفایل و فالو را با هم بررسی و تایید می‌کند.",
    [[{ text: "🔗 باز کردن صفحه Impedyme", url: liCfg_().companyUrl }]]);
}

/** عکس‌هایی که کاربر می‌فرستد (اسکرین‌شات فالو، یا لایک/کامنت وقتی API وصل نیست) */
function onUserPhoto_(chatId, fileId, props) {
  var state = props.getProperty("state_" + chatId) || "idle";
  var user = getUser_(chatId, props);
  if (!user) return askRegister_(chatId);

  if (state === "waiting_li_follow_shot") {
    var profile = props.getProperty("li_profile_" + chatId);
    if (!profile) return liAskProfile_(chatId, props);
    var r = liSubmitMember_(user, profile, fileId);
    props.deleteProperty("state_" + chatId);
    props.deleteProperty("li_profile_" + chatId);
    if (!r.ok && r.reason === "taken") return uSend_(chatId, "⚠️ این پروفایل لینکدین قبلاً با حساب دیگری ثبت شده است. اگر اشتباهی شده، به پشتیبانی پیام دهید.");
    if (!r.ok) return liHome_(chatId, user);
    var fid = liNotifyAdminsShot_(fileId, liMemberCaption_(r.member), liMemberButtons_(user.chatId));
    liSaveAdminFile_(LI.MEMBERS, LI_MEMBER_HEADERS, "ChatID", user.chatId, fid);
    return uSend_(chatId, "✅ پروفایل و اسکرین‌شات فالو ثبت شد و برای بررسی به مدیر ارسال شد.\n" +
      "بعد از تایید، " + liCfg_().followCoins + " سکه فالو به کیف پول شما اضافه می‌شود و پست‌های لایک و کامنت باز می‌شوند.");
  }

  if (state === "waiting_li_shot") {
    var postId = props.getProperty("li_post_" + chatId);
    props.deleteProperty("state_" + chatId);
    props.deleteProperty("li_post_" + chatId);
    var post = postId ? liPost_(postId) : null;
    if (!post || !post.active) return uSend_(chatId, "⚠️ این پست دیگر فعال نیست.");
    var cr = liCreateClaim_(user, post, fileId, "screenshot");
    if (!cr.ok) return uSend_(chatId, "⏳ برای این پست قبلاً ثبت کرده‌اید و در حال بررسی یا تاییدشده است.");
    var cfid = liNotifyAdminsShot_(fileId, liClaimCaption_(cr.claim, post), liClaimButtons_(cr.claim.ClaimID));
    liSaveAdminFile_(LI.CLAIMS, LI_CLAIM_HEADERS, "ClaimID", cr.claim.ClaimID, cfid);
    return uInline_(chatId, "✅ اسکرین‌شات " + liTypeFa_(post.type) + " شما ثبت شد و بعد از تایید مدیر حساب می‌شود.",
      [[{ text: liTypeIcon_(post.type) + " پست‌های " + liTypeFa_(post.type) + " دیگر", callback_data: "li|list|" + post.type }]]);
  }

  return uSend_(chatId, "برای ارسال اسکرین‌شات، اول از «" + USER_BTN.LINKEDIN + "» شروع کنید.");
}

/* ------------------------- صفحه اصلی و لیست پست‌ها ------------------------- */

function liHome_(chatId, user) {
  var member = liMember_(chatId).m;
  var info = liInfoFor_(chatId);
  var claims = liUserClaims_(chatId);
  var open = function (type) {
    return liPosts_(type).filter(function (p) { var c = claims[p.id]; return !c || c.Status === LI_ST.REJECTED; }).length;
  };
  var api = liApiModeFor_(member);
  var rows = [
    [{ text: "👍 پست‌های لایک (" + open("like") + " انجام‌نشده)", callback_data: "li|list|like" }],
    [{ text: "💬 پست‌های کامنت (" + open("comment") + " انجام‌نشده)", callback_data: "li|list|comment" }]
  ];
  if (!api && liApiReady_() && liOAuthConfigured_("LI_USER_REDIRECT_URL")) {
    rows.push([{ text: "🔗 اتصال حساب لینکدین (بررسی خودکار)", callback_data: "li|connect" }]);
  }
  return uInline_(chatId, "💼 <b>بخش لینکدین</b>\n\n" + liProgressText_(info) + "\n\n" +
    (api ? "🤖 لایک و کامنت‌های شما خودکار با API لینکدین بررسی می‌شوند." : "📷 برای هر لایک/کامنت یک اسکرین‌شات می‌فرستید و مدیر تایید می‌کند.") +
    "\n\nکدام را انجام می‌دهید؟", rows);
}

function liList_(chatId, user, type) {
  var posts = liPosts_(type);
  var back = [{ text: "🔙 بخش لینکدین", callback_data: "li|home" }];
  if (!posts.length) return uInline_(chatId, liTypeIcon_(type) + " فعلاً پستی برای " + liTypeFa_(type) + " وجود ندارد. بعداً سر بزنید.", [back]);
  var claims = liUserClaims_(chatId);
  var icon = function (c) {
    if (!c) return "🆕";
    if (c.Status === LI_ST.APPROVED) return "✅";
    if (c.Status === LI_ST.PENDING) return "⏳";
    return "❌";
  };
  var rows = posts.slice(0, 40).map(function (p, i) {
    return [{ text: icon(claims[p.id]) + " " + (i + 1) + ". " + liShort_(p.title), callback_data: "li|post|" + p.id }];
  });
  rows.push(back);
  var head = type === "comment"
    ? "💬 <b>پست‌های کامنت</b>\nزیر این پست‌ها یک کامنت با کلمات خودتان بنویسید."
    : "👍 <b>پست‌های لایک</b>\nاین پست‌ها را لایک کنید.";
  return uInline_(chatId, head + "\n\n🆕 انجام نشده · ⏳ در انتظار بررسی · ✅ تایید شده · ❌ رد شده (دوباره انجام دهید)\nروی یک پست بزنید:", rows);
}

function liPostCard_(chatId, user, postId) {
  var p = liPost_(postId);
  if (!p || !p.active) return uSend_(chatId, "⚠️ این پست دیگر فعال نیست.");
  var api = liApiModeFor_(liMember_(chatId).m);
  var c = liUserClaims_(chatId)[p.id];
  var doText = p.type === "comment"
    ? "پست را باز کنید و زیر آن یک <b>کامنت با کلمات خودتان</b> درباره موضوع پست بنویسید (کامنت کپی‌شده یا تکراری قبول نمی‌شود)."
    : "پست را باز کنید و <b>لایک</b> کنید.";
  var steps = api
    ? "۱) " + doText + "\n۲) «" + liDoneLabel_(p.type) + "» را بزنید؛ ربات با API لینکدین بررسی می‌کند و سکه را خودکار اضافه می‌کند."
    : "۱) " + doText + "\n۲) اسکرین‌شاتی بگیرید که " + liTypeFa_(p.type) + " شما در آن دیده شود.\n۳) «📷 ارسال اسکرین‌شات» را بزنید و عکس را بفرستید.";
  var status = !c ? "انجام نشده"
    : c.Status === LI_ST.APPROVED ? "✅ تایید شده"
    : c.Status === LI_ST.PENDING ? "⏳ در انتظار بررسی"
    : "❌ رد شده" + (c.Reason ? " — " + esc_(c.Reason) : "") + " (می‌توانید دوباره انجام دهید)";
  var rows = [];
  if (/^https?:\/\//i.test(p.url)) rows.push([{ text: "🔗 باز کردن پست", url: p.url }]);
  if (!c || c.Status === LI_ST.REJECTED) {
    rows.push([api ? { text: liDoneLabel_(p.type), callback_data: "li|done|" + p.id } : { text: "📷 ارسال اسکرین‌شات", callback_data: "li|shot|" + p.id }]);
  }
  rows.push([{ text: "🔙 لیست پست‌ها", callback_data: "li|list|" + p.type }]);
  return uInline_(chatId, liTypeIcon_(p.type) + " <b>پست " + liTypeFa_(p.type) + "</b>\n📌 " + esc_(p.title) + "\n\n" + steps + "\n\nوضعیت: " + status, rows);
}

function liDoneLabel_(type) { return type === "comment" ? "✅ کامنت گذاشتم" : "✅ لایک کردم"; }

/** حالت اسکرین‌شات (وقتی API وصل نیست) */
function liAskShot_(chatId, user, postId, props) {
  var p = liPost_(postId);
  if (!p || !p.active) return uSend_(chatId, "⚠️ این پست دیگر فعال نیست.");
  var c = liUserClaims_(chatId)[p.id];
  if (c && c.Status !== LI_ST.REJECTED) return uSend_(chatId, "⏳ برای این پست قبلاً ثبت کرده‌اید.");
  props.setProperty("state_" + chatId, "waiting_li_shot");
  props.setProperty("li_post_" + chatId, p.id);
  return uSend_(chatId, "📷 اسکرین‌شات " + liTypeFa_(p.type) + " خود را برای این پست بفرستید:\n📌 " + esc_(p.title) +
    "\n\n(برای انصراف، یکی از دکمه‌های منو را بزنید.)");
}

/** حالت API: کاربر می‌گوید انجام دادم؛ ربات ادمین با API بررسی و سکه را خودکار اضافه می‌کند */
function liMarkDone_(chatId, user, postId) {
  var p = liPost_(postId);
  if (!p || !p.active) return uSend_(chatId, "⚠️ این پست دیگر فعال نیست.");
  if (!liApiModeFor_(liMember_(chatId).m)) return liPostCard_(chatId, user, postId);
  var cr = liCreateClaim_(user, p, "", "api");
  if (!cr.ok) return uSend_(chatId, "⏳ برای این پست قبلاً ثبت کرده‌اید و در حال بررسی یا تاییدشده است.");
  var every = num_(getSetting_("LI_CHECK_EVERY_MIN")) || 60;
  return uInline_(chatId, "⏳ ثبت شد. ربات " + liTypeFa_(p.type) + " شما را با API لینکدین بررسی می‌کند (حداکثر حدود " + every +
    " دقیقه) و نتیجه و سکه را همین‌جا اعلام می‌کند.\n⚠️ تا آن موقع " + liTypeFa_(p.type) + " را پاک نکنید.",
    [[{ text: liTypeIcon_(p.type) + " پست‌های " + liTypeFa_(p.type) + " دیگر", callback_data: "li|list|" + p.type }]]);
}

/* ------------------------- اتصال حساب لینکدین (اختیاری) ------------------------- */

function liConnect_(chatId) {
  if (!liApiReady_() || !liOAuthConfigured_("LI_USER_REDIRECT_URL")) {
    return uSend_(chatId, "اتصال خودکار فعلاً فعال نیست؛ مدیر شناسه لینکدین شما را ثبت می‌کند.");
  }
  var nonce = Utilities.getUuid().replace(/-/g, "");
  CacheService.getScriptCache().put("li_conn_" + nonce, String(chatId), 1800);
  return uInline_(chatId, "🔗 روی دکمه زیر بزنید، با حساب لینکدین خودتان (همان پروفایلی که ثبت کردید) وارد شوید و <b>Allow</b> را بزنید.\n" +
    "ربات فقط نام و شناسه حساب شما را می‌بیند تا لایک و کامنت‌ها را خودکار بررسی کند.",
    [[{ text: "🔗 ورود با لینکدین", url: liOAuthUrl_("r_basicprofile", cfg_("LI_USER_REDIRECT_URL"), nonce) }]]);
}

/** لینکدین بعد از «Allow» به این آدرس (لینک /exec ربات کاربر) برمی‌گردد */
function doGet(e) {
  var q = (e && e.parameter) || {};
  if (q.error) return liPage_("❌ لینکدین: " + q.error + " — " + (q.error_description || ""));
  if (!q.code || !q.state) return liPage_("این صفحه فقط برای اتصال حساب لینکدین به ربات است.");
  var cache = CacheService.getScriptCache();
  var chatId = cache.get("li_conn_" + q.state);
  if (!chatId) return liPage_("❌ این لینک قدیمی است. در ربات دوباره «🔗 اتصال حساب لینکدین» را بزنید.");
  cache.remove("li_conn_" + q.state);
  var t = liExchangeCode_(q.code, cfg_("LI_USER_REDIRECT_URL"));
  if (!t.ok) return liPage_("❌ اتصال انجام نشد: " + t.error);
  var me = liApiMe_(t.token);
  if (!me) return liPage_("❌ اطلاعات حساب از لینکدین دریافت نشد. دوباره امتحان کنید.");
  liSetIdentity_(chatId, me.id, me.name);
  uInline_(chatId, "✅ حساب لینکدین شما (" + esc_(me.name || me.id) + ") به ربات وصل شد. از این به بعد لایک و کامنت‌ها خودکار بررسی می‌شوند.",
    [[{ text: "💼 بخش لینکدین", callback_data: "li|home" }]]);
  return liPage_("✅ حساب لینکدین شما وصل شد. به تلگرام برگردید.");
}

/* ------------------------- دکمه‌های شیشه‌ای ------------------------- */

function handleUserCallback_(cb) {
  var chatId = String(cb.message ? cb.message.chat.id : cb.from.id);
  var d = String(cb.data || "").split("|");
  tgAnswerCb_(cfg_("USER_BOT_TOKEN"), cb.id, "");
  if (d[0] !== "li") return;
  var props = PropertiesService.getScriptProperties();
  var user = getUser_(chatId, props);
  if (!user) return askRegister_(chatId);
  var m = liMember_(chatId).m;
  if (d[1] === "followed" || d[1] === "retry") {
    if (m && m.Status === LI_ST.APPROVED) return liHome_(chatId, user);
    if (m && m.Status === LI_ST.PENDING) return uSend_(chatId, "⏳ درخواست شما در حال بررسی است.");
    return liAskProfile_(chatId, props);
  }
  if (!m || m.Status !== LI_ST.APPROVED) return liEntry_(chatId, user, props);
  if (d[1] === "home") return liHome_(chatId, user);
  if (d[1] === "list") return liList_(chatId, user, d[2] === "comment" ? "comment" : "like");
  if (d[1] === "post") return liPostCard_(chatId, user, d[2]);
  if (d[1] === "shot") return liAskShot_(chatId, user, d[2], props);
  if (d[1] === "done") return liMarkDone_(chatId, user, d[2]);
  if (d[1] === "connect") return liConnect_(chatId);
}
