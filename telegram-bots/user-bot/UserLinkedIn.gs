/**
 * ============================================================
 *  UserLinkedIn.gs  —  بخش لینکدین در ربات کاربر
 *  (به LinkedIn.gs مشترک نیاز دارد؛ بقیه امکانات ربات دست نخورده‌اند)
 * ============================================================
 */

function uInline_(chatId, text, rows) { return tgSend_(cfg_("USER_BOT_TOKEN"), chatId, text, { inline_keyboard: rows }); }
function liShort_(t) { t = String(t); return t.length > 48 ? t.substring(0, 46) + "…" : t; }

/** دکمه «💼 لینکدین» */
function liEntry_(chatId, user, props) {
  if (!user) return askRegister_(chatId);
  var m = liMember_(chatId).m;
  if (m && m.Status === LI_ST.APPROVED) return liHome_(chatId, user);
  if (m && m.Status === LI_ST.PENDING) return uSend_(chatId, "⏳ درخواست عضویت لینکدین شما در حال بررسی است. نتیجه همین‌جا اطلاع داده می‌شود.");
  var c = liCfg_();
  return uInline_(chatId,
    "💼 <b>کسب سکه از لینکدین</b>\n\n" +
    "➕ فالو صفحه Impedyme = " + c.followCoins + " سکه\n" +
    "👍 هر " + c.likesPerCoin + " لایک تاییدشده = ۱ سکه\n" +
    "💬 هر " + c.commentsPerCoin + " کامنت تاییدشده = ۱ سکه\n" +
    "📷 برای هر کار یک اسکرین‌شات می‌فرستید و بعد از تایید مدیر، سکه به همان کیف پول اضافه می‌شود.\n\n" +
    "<b>مرحله ۱ از ۳:</b> صفحه Impedyme را در لینکدین فالو کنید." +
    (m && m.Status === LI_ST.REJECTED && m.Reason ? "\n\n❌ درخواست قبلی شما رد شد: " + esc_(m.Reason) : ""),
    [[{ text: "🔗 باز کردن صفحه Impedyme", url: c.companyUrl }],
     [{ text: "✅ فالو کردم، مرحله بعد", callback_data: "li|followed" }]]);
}

function liAskProfile_(chatId, props) {
  props.setProperty("state_" + chatId, "waiting_li_profile");
  return uSendCancel_(chatId, "<b>مرحله ۲ از ۳:</b> لینک پروفایل لینکدین خود را بفرستید.\nمثال: <code>https://www.linkedin.com/in/your-name</code>\n\n" +
    "(در اپ لینکدین: روی عکس خودتان ← View profile ← «⋯» ← Share via ← Copy link)");
}

function onLiProfile_(chatId, text, props) {
  if (!liNormProfile_(text)) {
    return uSendCancel_(chatId, "⚠️ این لینک پروفایل شخصی لینکدین نیست. لینک باید شبیه <code>linkedin.com/in/...</code> باشد. دوباره بفرستید:");
  }
  props.setProperty("li_profile_" + chatId, text.trim());
  props.setProperty("state_" + chatId, "waiting_li_follow_shot");
  return uSendCancel_(chatId, "<b>مرحله ۳ از ۳:</b> یک <b>اسکرین‌شات</b> از صفحه Impedyme در لینکدین بفرستید که دکمه <b>Following</b> در آن دیده شود.");
}

/** عکس‌هایی که کاربر می‌فرستد (اسکرین‌شات فالو یا لایک/کامنت) */
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
    return uSend_(chatId, "✅ درخواست عضویت لینکدین ثبت شد و برای بررسی به مدیر ارسال شد.\n" +
      "بعد از تایید، " + liCfg_().followCoins + " سکه فالو به کیف پول شما اضافه می‌شود و پست‌ها برایتان باز می‌شوند.");
  }

  if (state === "waiting_li_shot") {
    var postId = props.getProperty("li_post_" + chatId);
    props.deleteProperty("state_" + chatId);
    props.deleteProperty("li_post_" + chatId);
    var post = postId ? liPost_(postId) : null;
    if (!post || !post.active) return uSend_(chatId, "⚠️ این پست دیگر فعال نیست.");
    var cr = liCreateClaim_(user, post, fileId);
    if (!cr.ok) return uSend_(chatId, "⏳ برای این پست قبلاً اسکرین‌شات فرستاده‌اید و در حال بررسی یا تاییدشده است.");
    var cfid = liNotifyAdminsShot_(fileId, liClaimCaption_(cr.claim, post), liClaimButtons_(cr.claim.ClaimID));
    liSaveAdminFile_(LI.CLAIMS, LI_CLAIM_HEADERS, "ClaimID", cr.claim.ClaimID, cfid);
    return uInline_(chatId, "✅ اسکرین‌شات " + liTypeFa_(post.type) + " شما ثبت شد و بعد از تایید مدیر حساب می‌شود.",
      [[{ text: liTypeIcon_(post.type) + " پست‌های " + liTypeFa_(post.type) + " دیگر", callback_data: "li|list|" + post.type }]]);
  }

  return uSend_(chatId, "برای ارسال اسکرین‌شات، اول از «" + USER_BTN.LINKEDIN + "» پست را انتخاب کنید و «📷 ارسال اسکرین‌شات» را بزنید.");
}

/** صفحه اصلی بخش لینکدین (برای عضو تاییدشده) */
function liHome_(chatId, user) {
  var info = liInfoFor_(chatId);
  var claims = liUserClaims_(chatId);
  var open = function (type) {
    return liPosts_(type).filter(function (p) { var c = claims[p.id]; return !c || c.Status === LI_ST.REJECTED; }).length;
  };
  return uInline_(chatId, "💼 <b>بخش لینکدین</b>\n\n" + liProgressText_(info) + "\n\nکدام را انجام می‌دهید؟",
    [[{ text: "👍 پست‌های لایک (" + open("like") + " انجام‌نشده)", callback_data: "li|list|like" }],
     [{ text: "💬 پست‌های کامنت (" + open("comment") + " انجام‌نشده)", callback_data: "li|list|comment" }]]);
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
  return uInline_(chatId, head + "\n\n🆕 انجام نشده · ⏳ در انتظار بررسی · ✅ تایید شده · ❌ رد شده (دوباره بفرستید)\nروی یک پست بزنید:", rows);
}

function liPostCard_(chatId, user, postId) {
  var p = liPost_(postId);
  if (!p || !p.active) return uSend_(chatId, "⚠️ این پست دیگر فعال نیست.");
  var c = liUserClaims_(chatId)[p.id];
  var steps = p.type === "comment"
    ? "۱) پست را باز کنید و زیر آن یک <b>کامنت با کلمات خودتان</b> درباره موضوع پست بنویسید (کامنت کپی‌شده یا تکراری قبول نمی‌شود).\n" +
      "۲) از کامنت خودتان زیر پست اسکرین‌شات بگیرید.\n۳) «📷 ارسال اسکرین‌شات» را بزنید و عکس را بفرستید."
    : "۱) پست را باز کنید و <b>لایک</b> کنید.\n۲) اسکرین‌شاتی بگیرید که لایک شما در آن دیده شود.\n۳) «📷 ارسال اسکرین‌شات» را بزنید و عکس را بفرستید.";
  var status = !c ? "انجام نشده"
    : c.Status === LI_ST.APPROVED ? "✅ تایید شده"
    : c.Status === LI_ST.PENDING ? "⏳ در انتظار بررسی"
    : "❌ رد شده" + (c.Reason ? " — " + esc_(c.Reason) : "") + " (می‌توانید دوباره بفرستید)";
  var rows = [];
  if (/^https?:\/\//i.test(p.url)) rows.push([{ text: "🔗 باز کردن پست", url: p.url }]);
  if (!c || c.Status === LI_ST.REJECTED) rows.push([{ text: "📷 ارسال اسکرین‌شات", callback_data: "li|shot|" + p.id }]);
  rows.push([{ text: "🔙 لیست پست‌ها", callback_data: "li|list|" + p.type }]);
  return uInline_(chatId, liTypeIcon_(p.type) + " <b>پست " + liTypeFa_(p.type) + "</b>\n📌 " + esc_(p.title) + "\n\n" + steps + "\n\nوضعیت: " + status, rows);
}

function liAskShot_(chatId, user, postId, props) {
  var p = liPost_(postId);
  if (!p || !p.active) return uSend_(chatId, "⚠️ این پست دیگر فعال نیست.");
  var c = liUserClaims_(chatId)[p.id];
  if (c && c.Status !== LI_ST.REJECTED) return uSend_(chatId, "⏳ برای این پست قبلاً اسکرین‌شات فرستاده‌اید.");
  props.setProperty("state_" + chatId, "waiting_li_shot");
  props.setProperty("li_post_" + chatId, p.id);
  return uSend_(chatId, "📷 اسکرین‌شات " + liTypeFa_(p.type) + " خود را برای این پست بفرستید:\n📌 " + esc_(p.title) +
    "\n\n(برای انصراف، یکی از دکمه‌های منو را بزنید.)");
}

/** دکمه‌های شیشه‌ای ربات کاربر (فقط بخش لینکدین) */
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
}
