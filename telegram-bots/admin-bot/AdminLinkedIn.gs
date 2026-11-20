/**
 * ============================================================
 *  AdminLinkedIn.gs  —  بخش لینکدین در ربات ادمین
 *  (به LinkedIn.gs مشترک نیاز دارد؛ بقیه امکانات ربات دست نخورده‌اند)
 * ============================================================
 */

function aToken_() { return cfg_("ADMIN_BOT_TOKEN"); }

function tgEditCaption_(token, chatId, mid, caption, markup) {
  if (!mid) return tgSend_(token, chatId, caption, markup);
  var p = { chat_id: chatId, message_id: mid, caption: caption, parse_mode: "HTML" };
  if (markup) p.reply_markup = markup;
  var r = tgApi_(token, "editMessageCaption", p);
  if (!r.ok && !/not modified/i.test(r.description || "")) r = tgEdit_(token, chatId, mid, caption, markup);
  return r;
}

function tgEditMarkup_(token, chatId, mid, markup) {
  return tgApi_(token, "editMessageReplyMarkup", { chat_id: chatId, message_id: mid, reply_markup: markup });
}

/* ------------------------- پنل ------------------------- */

function liAdminPanel_(chatId) {
  var c = liCfg_();
  var members = liTable_(LI.MEMBERS, LI_MEMBER_HEADERS).rows;
  var claims = liClaims_().rows;
  var pm = members.filter(function (m) { return liStatus_(m.Status) === LI_ST.PENDING; }).length;
  var am = members.filter(function (m) { return liStatus_(m.Status) === LI_ST.APPROVED; }).length;
  var pc = claims.filter(function (x) { return x.Status === LI_ST.PENDING; });
  var pcl = pc.filter(function (x) { return String(x.Type) !== "comment"; }).length;
  var posts = liPosts_(null);
  var pl = posts.filter(function (p) { return p.type === "like"; }).length;
  return tgSend_(aToken_(), chatId,
    "💼 <b>مدیریت لینکدین</b>\n\n" +
    "⏳ عضویت در انتظار: <b>" + pm + "</b>\n" +
    "🔔 لایک/کامنت در انتظار: <b>" + pc.length + "</b> (👍 " + pcl + " · 💬 " + (pc.length - pcl) + ")\n" +
    "👥 اعضای تاییدشده: " + am + "\n" +
    "📌 پست‌های فعال: 👍 " + pl + " · 💬 " + (posts.length - pl) + "\n" +
    "⚙️ نرخ: " + c.likesPerCoin + " لایک = ۱ سکه · " + c.commentsPerCoin + " کامنت = ۱ سکه · فالو = " + c.followCoins + " سکه\n" +
    liApiStatusText_(),
    { inline_keyboard: [
      [{ text: "⏳ بررسی عضویت‌ها (" + pm + ")", callback_data: "la|qm" }, { text: "🔔 بررسی لایک/کامنت‌ها (" + pc.length + ")", callback_data: "la|qc" }],
      [{ text: "➕ پست لایک", callback_data: "la|add|like" }, { text: "➕ پست کامنت", callback_data: "la|add|comment" }],
      [{ text: "📌 لیست پست‌ها", callback_data: "la|posts" }, { text: "👥 اعضای لینکدین", callback_data: "la|members" }],
      [{ text: "🔑 اتصال API لینکدین", callback_data: "la|api" }, { text: "🔄 بررسی با API الان", callback_data: "la|check" }]
    ] });
}

function liShowMemberQueue_(chatId) {
  var t = liTable_(LI.MEMBERS, LI_MEMBER_HEADERS);
  var list = t.rows.filter(function (m) { return liStatus_(m.Status) === LI_ST.PENDING; });
  if (!list.length) return aSend_(chatId, "✅ درخواست عضویتی در انتظار نیست.");
  list.slice(0, 10).forEach(function (m) {
    m.Status = LI_ST.PENDING;
    var fid = liShowShot_(chatId, m.UserFileId, m.AdminFileId, liMemberCaption_(m), liMemberButtons_(String(m.ChatID).trim()));
    if (fid && fid !== m.AdminFileId) liSaveAdminFile_(LI.MEMBERS, LI_MEMBER_HEADERS, "ChatID", String(m.ChatID).trim(), fid);
  });
  if (list.length > 10) aSend_(chatId, "… و " + (list.length - 10) + " درخواست دیگر؛ بعد از بررسی این‌ها دوباره بزنید.");
}

function liShowClaimQueue_(chatId) {
  var list = liClaims_().rows.filter(function (x) { return x.Status === LI_ST.PENDING; });
  if (!list.length) return aSend_(chatId, "✅ لایک یا کامنتی در انتظار بررسی نیست.");
  list.slice(0, 10).forEach(function (c) {
    if (String(c.Method) === "api") {
      tgSend_(aToken_(), chatId, liClaimCaption_(c, liPost_(c.PostID)) + "\n⏳ در انتظار بررسی خودکار (می‌توانید دستی هم تایید/رد کنید)", liClaimButtons_(c.ClaimID));
      return;
    }
    var fid = liShowShot_(chatId, c.UserFileId, c.AdminFileId, liClaimCaption_(c, liPost_(c.PostID)), liClaimButtons_(c.ClaimID));
    if (fid && fid !== c.AdminFileId) liSaveAdminFile_(LI.CLAIMS, LI_CLAIM_HEADERS, "ClaimID", c.ClaimID, fid);
  });
  if (list.length > 10) aSend_(chatId, "… و " + (list.length - 10) + " مورد دیگر؛ بعد از بررسی این‌ها دوباره بزنید.");
}

function liPostsView_() {
  var posts = liPosts_(null, true);
  if (!posts.length) return { text: "📌 هنوز پستی اضافه نشده است.", markup: { inline_keyboard: [[{ text: "➕ پست لایک", callback_data: "la|add|like" }, { text: "➕ پست کامنت", callback_data: "la|add|comment" }]] } };
  var text = "📌 <b>پست‌های لینکدین</b>\n(برای فعال/غیرفعال کردن روی هر پست بزنید؛ سکه‌های قبلی کاربران حفظ می‌شود)\n";
  var rows = posts.slice(-30).map(function (p) {
    return [{ text: (p.active ? "🟢 " : "⏸ ") + liTypeIcon_(p.type) + " " + (p.title.length > 40 ? p.title.substring(0, 38) + "…" : p.title),
      callback_data: "lp|" + p.id + "|" + (p.active ? "off" : "on") }];
  });
  return { text: text, markup: { inline_keyboard: rows } };
}

/* ------------------------- افزودن پست ------------------------- */

function liOnAdminPostText_(chatId, text, props) {
  var type = props.getProperty("li_post_type_" + chatId) === "comment" ? "comment" : "like";
  var m = String(text).match(/https?:\/\/\S+/i);
  if (!m || !liIsPostUrl_(m[0])) {
    return aSend_(chatId, "⚠️ لینک پست لینکدین پیدا نشد. لینک باید با <code>https://www.linkedin.com/</code> شروع شود. دوباره بفرستید (یا یکی از دکمه‌های منو را بزنید).");
  }
  props.deleteProperty("state_" + chatId);
  var title = String(text).replace(m[0], "").replace(/\s+/g, " ").trim() || ("پست " + liTypeFa_(type) + " " + fmtDate_(new Date(), "MM/dd"));
  var p = liAddPost_(type, title, m[0]);
  return tgSend_(aToken_(), chatId, "✅ پست " + liTypeFa_(type) + " اضافه شد و برای اعضای لینکدین نمایش داده می‌شود:\n📌 " + esc_(p.title) + "\n🔗 " + esc_(p.url),
    { inline_keyboard: [[{ text: "📢 خبر دادن به اعضای لینکدین", callback_data: "la|notify|" + p.id }], [{ text: "⏸ غیرفعال کردن", callback_data: "lp|" + p.id + "|off" }]] });
}

/* ------------------------- بررسی (تایید/رد) ------------------------- */

function liNotifyMember_(member, approved) {
  var token = cfg_("USER_BOT_TOKEN");
  if (approved) {
    return tgSend_(token, member.ChatID, "🎉 <b>عضویت لینکدین شما تایید شد!</b>\n+" + num_(member.FollowCoins) + " سکه بابت فالو صفحه Impedyme به کیف پول شما اضافه شد.\n" +
      "حالا پست‌های لایک و کامنت برایتان باز است.", { inline_keyboard: [[{ text: "💼 رفتن به بخش لینکدین", callback_data: "li|home" }]] });
  }
  return tgSend_(token, member.ChatID, "❌ عضویت لینکدین شما تایید نشد.\nدلیل: <b>" + esc_(member.Reason || "—") + "</b>\nبعد از اصلاح، دوباره بفرستید.",
    { inline_keyboard: [[{ text: "🔄 ارسال دوباره", callback_data: "li|retry" }]] });
}

function liNotifyClaim_(claim, post, approved) {
  var token = cfg_("USER_BOT_TOKEN");
  var title = post ? post.title : claim.PostID;
  if (approved) {
    var info = liInfoFor_(claim.ChatID);
    return tgSend_(token, claim.ChatID, "✅ " + liTypeFa_(claim.Type) + " شما روی «" + esc_(title) + "» تایید شد.\n\n" + liProgressText_(info),
      { inline_keyboard: [[{ text: liTypeIcon_(claim.Type) + " پست‌های " + liTypeFa_(claim.Type) + " بعدی", callback_data: "li|list|" + claim.Type }]] });
  }
  return tgSend_(token, claim.ChatID, "❌ " + liTypeFa_(claim.Type) + " شما روی «" + esc_(title) + "» تایید نشد.\nدلیل: <b>" + esc_(claim.Reason || "—") + "</b>",
    { inline_keyboard: [[{ text: "🔄 دوباره انجام دهید", callback_data: "li|post|" + claim.PostID }]] });
}

/** kind: "m" (عضویت) یا "c" (لایک/کامنت) */
function liDecide_(chatId, adminId, mid, kind, key, approve, reason) {
  var token = aToken_();
  if (kind === "m") {
    var r = liReviewMember_(adminId, key, approve, reason);
    if (!r.ok) {
      if (r.member) tgEditCaption_(token, chatId, mid, liMemberCaption_(r.member), null);
      return "این درخواست قبلاً بررسی شده است.";
    }
    tgEditCaption_(token, chatId, mid, liMemberCaption_(r.member), approve ? liIdentButton_(key) : null);
    liNotifyMember_(r.member, approve);
    return approve ? "تایید شد (+" + num_(r.member.FollowCoins) + " سکه)" : "رد شد";
  }
  var rc = liReviewClaim_(adminId, key, approve, reason);
  var post = rc.claim ? liPost_(rc.claim.PostID) : null;
  if (!rc.ok) {
    if (rc.claim) tgEditCaption_(token, chatId, mid, liClaimCaption_(rc.claim, post), null);
    return "این مورد قبلاً بررسی شده است.";
  }
  tgEditCaption_(token, chatId, mid, liClaimCaption_(rc.claim, post), null);
  liNotifyClaim_(rc.claim, post, approve);
  return approve ? "تایید شد" : "رد شد";
}

function liReasonButtons_(prefix, key, list) {
  var rows = list.map(function (r, i) { return [{ text: r, callback_data: prefix + "|" + key + "|r|" + i }]; });
  rows.push([{ text: "✏️ دلیل دلخواه", callback_data: prefix + "|" + key + "|c" }, { text: "↩️ بازگشت", callback_data: prefix + "|" + key + "|b" }]);
  return { inline_keyboard: rows };
}

/** وقتی ادمین بعد از «✏️ دلیل دلخواه» دلیل را تایپ می‌کند */
function liOnAdminReason_(chatId, text, props) {
  props.deleteProperty("state_" + chatId);
  var raw = props.getProperty("li_reason_" + chatId);
  props.deleteProperty("li_reason_" + chatId);
  if (!raw) return aSend_(chatId, "⚠️ مورد انتخاب‌شده پیدا نشد؛ دوباره از «💼 لینکدین» اقدام کنید.");
  var t = JSON.parse(raw);
  var msg = liDecide_(chatId, chatId, t.mid, t.kind, t.key, false, String(text).trim().substring(0, 200));
  return aSend_(chatId, "❌ " + msg + " — دلیل برای کاربر ارسال شد.");
}

/* ------------------------- دکمه‌های شیشه‌ای ------------------------- */

function liAdminCallback_(cb, chatId, mid, adminId, d, props) {
  var token = aToken_();
  var answer = function (t, alert) { tgAnswerCb_(token, cb.id, t || "", alert); };
  try {
    if (d[0] === "la") {
      answer("");
      if (d[1] === "qm") return liShowMemberQueue_(chatId);
      if (d[1] === "qc") return liShowClaimQueue_(chatId);
      if (d[1] === "posts") { var v = liPostsView_(); return tgSend_(token, chatId, v.text, v.markup); }
      if (d[1] === "members") return liShowMembers_(chatId);
      if (d[1] === "api") return liStartApiConnect_(chatId);
      if (d[1] === "check") {
        var cr = liRunApiCheck_();
        return aSend_(chatId, liCheckReport_(cr));
      }
      if (d[1] === "add") {
        props.setProperty("state_" + chatId, "waiting_li_post");
        props.setProperty("li_post_type_" + chatId, d[2] === "comment" ? "comment" : "like");
        return aSend_(chatId, (d[2] === "comment" ? "💬 <b>افزودن پست کامنت</b>" : "👍 <b>افزودن پست لایک</b>") +
          "\nلینک پست لینکدین را بفرستید. (اختیاری: عنوان کوتاه را در خط اول و لینک را در خط دوم بنویسید.)\nبرای انصراف یکی از دکمه‌های منو را بزنید.");
      }
      if (d[1] === "notify") {
        var p = liPost_(d[2]);
        if (!p || !p.active) return aSend_(chatId, "⚠️ این پست فعال نیست.");
        var ids = liTable_(LI.MEMBERS, LI_MEMBER_HEADERS).rows
          .filter(function (m) { return liStatus_(m.Status) === LI_ST.APPROVED; })
          .map(function (m) { return String(m.ChatID).trim(); });
        var r = tgBroadcast_(cfg_("USER_BOT_TOKEN"), ids,
          "🆕 <b>پست جدید برای " + liTypeFa_(p.type) + "</b>\n📌 " + esc_(p.title) + "\nانجامش دهید، اسکرین‌شات بفرستید و سکه بگیرید.",
          { inline_keyboard: [[{ text: liTypeIcon_(p.type) + " باز کردن", callback_data: "li|post|" + p.id }]] });
        return aSend_(chatId, "📢 خبر پست جدید ارسال شد: " + r.sent + " نفر" + (r.blocked ? " · بلاک‌کرده: " + r.blocked : "") + (r.failed ? " · ناموفق: " + r.failed : ""));
      }
      return;
    }
    if (d[0] === "lid") {
      answer("");
      var mm = liMember_(d[1]).m;
      if (!mm) return aSend_(chatId, "عضو پیدا نشد.");
      props.setProperty("state_" + chatId, "waiting_li_ident");
      props.setProperty("li_ident_" + chatId, String(d[1]));
      return aSend_(chatId, "🆔 <b>نام و شناسه لینکدین</b> برای " + esc_(mm.Name) + "\n" +
        "فعلی: " + esc_(mm.LinkedInName || "—") + " · <code>" + esc_(mm.LinkedInID || "—") + "</code>\n\n" +
        "در <b>خط اول نام</b> و در <b>خط دوم شناسه</b> لینکدین را بفرستید (فقط یک خط بدون فاصله = فقط شناسه). برای پاک کردن شناسه: <code>-</code>\n" +
        "ℹ️ شناسه همان عددی است که API لینکدین برای این شخص برمی‌گرداند (مثل <code>urn:li:person:AbC123</code>). اگر کاربر «🔗 اتصال حساب لینکدین» را بزند، خودکار ثبت می‌شود.");
    }
    if (d[0] === "lp") {
      liSetPostActive_(d[1], d[2] === "on");
      answer(d[2] === "on" ? "فعال شد" : "غیرفعال شد");
      var view = liPostsView_();
      return tgEdit_(token, chatId, mid, view.text, view.markup);
    }
    // lm|chatId|...  یا  lc|claimId|...
    var kind = d[0] === "lm" ? "m" : "c", key = d[1], act = d[2];
    if (act === "ok") return answer(liDecide_(chatId, adminId, mid, kind, key, true, ""));
    var reasons;
    if (kind === "m") reasons = LI_REASONS.member;
    else { var fc = liFindClaim_(key).c; reasons = LI_REASONS[fc && String(fc.Type) === "comment" ? "comment" : "like"]; }
    if (act === "no") { answer(""); return tgEditMarkup_(token, chatId, mid, liReasonButtons_(d[0], key, reasons)); }
    if (act === "b") { answer(""); return tgEditMarkup_(token, chatId, mid, kind === "m" ? liMemberButtons_(key) : liClaimButtons_(key)); }
    if (act === "r") return answer(liDecide_(chatId, adminId, mid, kind, key, false, reasons[Number(d[3])] || reasons[0]));
    if (act === "c") {
      answer("");
      props.setProperty("state_" + chatId, "waiting_li_reason");
      props.setProperty("li_reason_" + chatId, JSON.stringify({ kind: kind, key: key, mid: mid }));
      return aSend_(chatId, "✏️ دلیل رد را تایپ کنید (برای کاربر ارسال می‌شود):");
    }
    answer("");
  } catch (err) {
    answer("⚠️ " + String(err && err.message ? err.message : err).substring(0, 180), true);
  }
}

/* ------------------------- نام و شناسه لینکدین اعضا ------------------------- */

function liIdentButton_(chatId) {
  return { inline_keyboard: [[{ text: "🆔 ثبت نام و شناسه لینکدین", callback_data: "lid|" + chatId }]] };
}

function liOnAdminIdent_(chatId, text, props) {
  var target = props.getProperty("li_ident_" + chatId);
  props.deleteProperty("state_" + chatId);
  props.deleteProperty("li_ident_" + chatId);
  if (!target) return aSend_(chatId, "⚠️ عضو انتخاب‌شده پیدا نشد؛ دوباره از «👥 اعضای لینکدین» اقدام کنید.");
  var lines = String(text).split(/\r?\n/).map(function (l) { return l.trim(); }).filter(String);
  var name = null, id = null;
  if (lines.length >= 2) { name = lines[0]; id = lines[1]; }
  else if (lines.length === 1) { if (/\s/.test(lines[0])) name = lines[0]; else id = lines[0]; }
  if (id !== null && id !== "-" && !/^(urn:li:(person|member):)?[A-Za-z0-9_-]{3,}$/.test(id)) {
    return aSend_(chatId, "⚠️ شناسه معتبر نیست. مثال: <code>urn:li:person:AbC123</code> یا <code>AbC123</code>");
  }
  liSetIdentity_(target, id, name);
  var m = liMember_(target).m;
  return aSend_(chatId, "✅ ذخیره شد.\n👤 " + esc_(m.Name) + "\n🆔 LinkedIn: " + esc_(m.LinkedInName || "—") + " · <code>" + esc_(m.LinkedInID || "—") + "</code>");
}

function liShowMembers_(chatId) {
  var list = liTable_(LI.MEMBERS, LI_MEMBER_HEADERS).rows.filter(function (m) { return liStatus_(m.Status) === LI_ST.APPROVED; });
  if (!list.length) return aSend_(chatId, "👥 هنوز عضو تاییدشده‌ای در بخش لینکدین نیست.");
  var withId = list.filter(function (m) { return liIdKey_(m.LinkedInID); }).length;
  var rows = list.slice(-40).map(function (m) {
    return [{ text: (liIdKey_(m.LinkedInID) ? "✅ " : "❔ ") + m.Name + (m.LinkedInName ? " · " + m.LinkedInName : ""), callback_data: "lid|" + String(m.ChatID).trim() }];
  });
  return tgSend_(aToken_(), chatId, "👥 <b>اعضای لینکدین</b>: " + list.length + " نفر · با شناسه: " + withId +
    "\n✅ شناسه ثبت شده (بررسی خودکار) · ❔ بدون شناسه (با اسکرین‌شات)\nبرای ثبت یا ویرایش نام و شناسه، روی هر نفر بزنید:", { inline_keyboard: rows });
}

/* ------------------------- اتصال API لینکدین (ادمین) ------------------------- */

function liAdminToken_() {
  return String(PropertiesService.getScriptProperties().getProperty("LI_ACCESS_TOKEN") || "").trim();
}

function liApiStatusText_() {
  if (!liApiReady_()) return "🤖 API لینکدین: ❌ وصل نیست (لایک/کامنت با اسکرین‌شات بررسی می‌شود)";
  var exp = getSetting_("LI_TOKEN_EXPIRES");
  return "🤖 API لینکدین: ✅ وصل" + (toMs_(exp) ? " · اعتبار تا " + fmtDate_(exp, "yyyy-MM-dd") : "") +
    " · آخرین بررسی: " + fmtDate_(getSetting_("LI_LAST_CHECK"), "MM/dd HH:mm");
}

function liStartApiConnect_(chatId) {
  if (liOAuthConfigured_("LI_ADMIN_REDIRECT_URL")) {
    var state = Utilities.getUuid().replace(/-/g, "");
    PropertiesService.getScriptProperties().setProperty("li_admin_state", state + "|" + chatId);
    var scopes = String(cfg_("LI_ADMIN_SCOPES") || "r_organization_social r_basicprofile");
    return tgSend_(aToken_(), chatId, "🔑 روی دکمه زیر بزنید و با حساب لینکدینی که <b>ادمین صفحه Impedyme</b> است وارد شوید و <b>Allow</b> را بزنید.",
      { inline_keyboard: [[{ text: "🔑 ورود با لینکدین", url: liOAuthUrl_(scopes, cfg_("LI_ADMIN_REDIRECT_URL"), state) }]] });
  }
  var manual = liAdminToken_();
  if (manual) {
    var me = liApiMe_(manual);
    if (!me) return aSend_(chatId, "❌ توکنی که در Script Properties (LI_ACCESS_TOKEN) گذاشته‌اید کار نمی‌کند یا منقضی شده است.");
    setSetting_("LI_API_READY", "yes");
    return aSend_(chatId, "✅ API لینکدین با توکن دستی وصل شد (" + esc_(me.name || me.id) + ").");
  }
  return aSend_(chatId, "⚙️ <b>تنظیمات API هنوز خالی است.</b>\n" +
    "۱) در Script Properties همین پروژه: <code>LI_CLIENT_ID</code> و <code>LI_CLIENT_SECRET</code> اپ لینکدین را بگذارید.\n" +
    "۲) در Config.gs مقدار <code>LI_ADMIN_REDIRECT_URL</code> را لینک /exec همین ربات ادمین بگذارید و همان لینک را در اپ لینکدین (Auth → Redirect URLs) اضافه کنید.\n" +
    "۳) دوباره «🔑 اتصال API لینکدین» را بزنید.\n" +
    "اپ شما باید محصول <b>Community Management API</b> را داشته باشد.");
}

/** لینکدین بعد از «Allow» ادمین به این آدرس (لینک /exec ربات ادمین) برمی‌گردد */
function doGet(e) {
  var q = (e && e.parameter) || {};
  if (q.error) return liPage_("❌ لینکدین: " + q.error + " — " + (q.error_description || "") +
    (/scope/i.test(q.error) ? " → اپ لینکدین شما هنوز Community Management API را ندارد." : ""));
  if (!q.code || !q.state) return liPage_("این صفحه فقط برای اتصال API لینکدین به ربات ادمین است.");
  var props = PropertiesService.getScriptProperties();
  var st = String(props.getProperty("li_admin_state") || "").split("|");
  if (!st[0] || st[0] !== q.state) return liPage_("❌ این لینک قدیمی است. در ربات ادمین دوباره «🔑 اتصال API لینکدین» را بزنید.");
  props.deleteProperty("li_admin_state");
  var t = liExchangeCode_(q.code, cfg_("LI_ADMIN_REDIRECT_URL"));
  if (!t.ok) return liPage_("❌ اتصال انجام نشد: " + t.error);
  props.setProperty("LI_ACCESS_TOKEN", t.token);
  var exp = new Date(Date.now() + (t.expiresIn || 5184000) * 1000);
  setSetting_("LI_TOKEN_EXPIRES", exp);
  setSetting_("LI_API_READY", "yes");
  setSetting_("LI_TOKEN_WARNED", "");
  var me = liApiMe_(t.token);
  if (st[1]) aSend_(st[1], "✅ <b>API لینکدین وصل شد</b>" + (me ? " (" + esc_(me.name || me.id) + ")" : "") +
    "\n🔑 دسترسی‌ها: " + esc_(t.scope || "—") + "\n📅 اعتبار تا: " + fmtDate_(exp, "yyyy-MM-dd") +
    "\nاز این به بعد لایک و کامنت اعضایی که شناسه دارند خودکار بررسی می‌شود.\nبرای بررسی منظم، یک بار تابع <code>installLinkedInCheckTrigger</code> را در ویرایشگر اجرا کنید.");
  return liPage_("✅ API لینکدین به ربات ادمین وصل شد. به تلگرام برگردید.");
}

/* ------------------------- بررسی خودکار لایک/کامنت ------------------------- */

function liPersonIdsIn_(s) { return (String(s).match(/urn:li:person:[A-Za-z0-9_-]+/g) || []).map(liIdKey_); }
function liNormText_(s) { return String(s || "").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, " ").trim(); }

function liSavePostUrn_(postId, urn) {
  var t = liTable_(LI.POSTS, LI_POST_HEADERS);
  for (var i = 0; i < t.rows.length; i++) {
    if (String(t.rows[i].PostID).trim() === postId) { writeCells_(t.sh, t.rows[i].row, t.map, { ApiURN: urn }); return; }
  }
}

/** شناسه API پست را از لینک آن پیدا می‌کند (share / ugcPost / activity) و ذخیره می‌کند */
function liResolveUrn_(token, post) {
  if (post.apiUrn) return post.apiUrn;
  var m = String(post.url).match(/(?:activity|share|ugcpost)[-:](\d{10,25})/i);
  if (!m) return "";
  var forms = ["urn:li:share:", "urn:li:ugcPost:", "urn:li:activity:"];
  for (var i = 0; i < forms.length; i++) {
    var r = liApiFetch_(token, "https://api.linkedin.com/rest/socialActions/" + encodeURIComponent(forms[i] + m[1]));
    if (r.code === 401) return "!401";
    if (r.code === 200) { liSavePostUrn_(post.id, forms[i] + m[1]); return forms[i] + m[1]; }
  }
  return "";
}

function liApiReactors_(token, urn) {
  var ids = {}, start = 0;
  for (var page = 0; page < 10; page++) {
    var r = liApiFetch_(token, "https://api.linkedin.com/rest/reactions/(entity:" + encodeURIComponent(urn) + ")?q=entity&count=100&start=" + start);
    if (r.code !== 200) return { ok: false, code: r.code, ids: ids };
    var els = (r.json && r.json.elements) || [];
    els.forEach(function (el) { liPersonIdsIn_(JSON.stringify(el.created || el)).forEach(function (id) { ids[id] = true; }); });
    if (els.length < 100) break;
    start += 100;
  }
  return { ok: true, ids: ids };
}

function liApiComments_(token, urn) {
  var list = [], start = 0;
  for (var page = 0; page < 10; page++) {
    var r = liApiFetch_(token, "https://api.linkedin.com/rest/socialActions/" + encodeURIComponent(urn) + "/comments?count=100&start=" + start);
    if (r.code !== 200) return { ok: false, code: r.code, list: list };
    var els = (r.json && r.json.elements) || [];
    els.forEach(function (el) {
      var actor = typeof el.actor === "string" ? liIdKey_(el.actor) : (liPersonIdsIn_(JSON.stringify(el.created || el))[0] || "");
      list.push({ id: actor, text: el.message && el.message.text ? String(el.message.text) : "", time: Number(el.created && el.created.time) || 0 });
    });
    if (els.length < 100) break;
    start += 100;
  }
  return { ok: true, list: list };
}

function liApiExpired_() {
  setSetting_("LI_API_READY", "");
  if (String(getSetting_("LI_TOKEN_WARNED")) !== "expired") {
    setSetting_("LI_TOKEN_WARNED", "expired");
    notifyAdmins_("⚠️ اعتبار API لینکدین تمام شده است. در «💼 لینکدین» دوباره «🔑 اتصال API لینکدین» را بزنید. تا آن موقع لایک/کامنت با اسکرین‌شات بررسی می‌شود.");
  }
}

/** همه ادعاهای «بررسی خودکار» را با API چک می‌کند؛ پیدا شد ← تایید و سکه، تا LI_CHECK_MAX_HOURS پیدا نشد ← رد */
function liRunApiCheck_() {
  var res = { posts: 0, approved: 0, rejected: 0, waiting: 0, noId: 0, errors: [] };
  if (!liApiReady_()) { res.errors.push("API لینکدین وصل نیست."); return res; }
  var token = liAdminToken_();
  if (!token) { res.errors.push("توکن API پیدا نشد؛ «🔑 اتصال API لینکدین» را بزنید."); return res; }
  var exp = toMs_(getSetting_("LI_TOKEN_EXPIRES"));
  if (exp && exp - Date.now() < 5 * 86400000 && String(getSetting_("LI_TOKEN_WARNED")) === "") {
    setSetting_("LI_TOKEN_WARNED", "soon");
    notifyAdmins_("⏰ اعتبار API لینکدین تا " + fmtDate_(new Date(exp), "yyyy-MM-dd") + " تمام می‌شود؛ قبل از آن «🔑 اتصال API لینکدین» را دوباره بزنید.");
  }
  var all = liClaims_().rows;
  var pending = all.filter(function (c) { return c.Status === LI_ST.PENDING && String(c.Method) === "api"; });
  var members = {};
  liTable_(LI.MEMBERS, LI_MEMBER_HEADERS).rows.forEach(function (m) { members[String(m.ChatID).trim()] = m; });
  var byPost = {};
  pending.forEach(function (c) { (byPost[c.PostID] = byPost[c.PostID] || []).push(c); });
  var maxMs = (num_(cfg_("LI_CHECK_MAX_HOURS")) || 24) * 3600000;
  var stop = false;
  Object.keys(byPost).forEach(function (postId) {
    if (stop) return;
    var post = liPost_(postId), list = byPost[postId];
    if (!post) return;
    res.posts++;
    var urn = liResolveUrn_(token, post);
    if (urn === "!401") { stop = true; return; }
    if (!urn) { res.errors.push("شناسه API پست «" + post.title + "» پیدا نشد (لینک پست را بررسی کنید)."); return; }
    var needLikes = list.some(function (c) { return String(c.Type) !== "comment"; });
    var needComments = list.some(function (c) { return String(c.Type) === "comment"; });
    var likes = needLikes ? liApiReactors_(token, urn) : { ok: true, ids: {} };
    var comments = needComments ? liApiComments_(token, urn) : { ok: true, list: [] };
    if (likes.code === 401 || comments.code === 401) { stop = true; return; }
    if (!likes.ok || !comments.ok) { res.errors.push("خطای API برای «" + post.title + "»: HTTP " + (likes.code || comments.code)); return; }
    list.sort(function (a, b) { return (toMs_(a.CreatedAt) || 0) - (toMs_(b.CreatedAt) || 0); }).forEach(function (c) {
      var m = members[c.ChatID];
      var myId = m ? liIdKey_(m.LinkedInID) : "";
      if (!myId) { res.noId++; return; }
      var found = false, text = "", copied = false;
      if (String(c.Type) === "comment") {
        var mine = comments.list.filter(function (x) { return x.id === myId; });
        if (mine.length) {
          found = true;
          var my = mine[mine.length - 1];
          text = my.text;
          var norm = liNormText_(text);
          // کپی = همین متن را شخص دیگری «زودتر» زیر همین پست نوشته باشد
          copied = norm.length >= 15 && comments.list.some(function (x) {
            return x.id !== myId && liNormText_(x.text) === norm && (!x.time || !my.time || x.time < my.time);
          });
        }
      } else {
        found = !!likes.ids[myId];
      }
      var r = null;
      if (found && copied) r = liReviewClaim_("api", c.ClaimID, false, "کامنت شما کپی کامنت شخص دیگری زیر همین پست است", { CommentText: text, CheckedAt: new Date() });
      else if (found) r = liReviewClaim_("api", c.ClaimID, true, "", { CommentText: text, CheckedAt: new Date() });
      else if (Date.now() - (toMs_(c.CreatedAt) || Date.now()) > maxMs) {
        r = liReviewClaim_("api", c.ClaimID, false, "در بررسی خودکار، " + liTypeFa_(c.Type) + " شما روی این پست پیدا نشد", { CheckedAt: new Date() });
      } else {
        res.waiting++;
        return;
      }
      if (r && r.ok) {
        liNotifyClaim_(r.claim, post, r.claim.Status === LI_ST.APPROVED);
        if (r.claim.Status === LI_ST.APPROVED) res.approved++; else res.rejected++;
      }
    });
  });
  if (stop) { liApiExpired_(); res.errors.push("اعتبار API تمام شده است (HTTP 401)."); }
  setSetting_("LI_LAST_CHECK", new Date());
  return res;
}

function liCheckReport_(r) {
  return "🔄 <b>بررسی با API لینکدین</b>\n" +
    "📌 پست‌های بررسی‌شده: " + r.posts + "\n✅ تایید و سکه: " + r.approved + "\n❌ رد: " + r.rejected +
    "\n⏳ هنوز پیدا نشده (دوباره بررسی می‌شود): " + r.waiting +
    (r.noId ? "\n❔ بدون شناسه لینکدین (در «👥 اعضای لینکدین» ثبت کنید): " + r.noId : "") +
    (r.errors.length ? "\n⚠️ " + esc_(r.errors.join("\n⚠️ ")) : "");
}

/** تابع تریگر زمانی (هر ساعت) */
function liAutoCheck() {
  try { liRunApiCheck_(); } catch (e) { console.error(e && e.stack ? e.stack : e); }
}

/** یک بار از ویرایشگر اجرا کنید تا بررسی خودکار هر ساعت انجام شود */
function installLinkedInCheckTrigger() {
  removeLinkedInCheckTrigger();
  ScriptApp.newTrigger("liAutoCheck").timeBased().everyHours(1).create();
  setSetting_("LI_CHECK_EVERY_MIN", 60);
  Logger.log("✅ LinkedIn auto-check trigger installed (every hour).");
}

function removeLinkedInCheckTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "liAutoCheck") ScriptApp.deleteTrigger(t);
  });
}
