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
    "⚙️ نرخ: " + c.likesPerCoin + " لایک = ۱ سکه · " + c.commentsPerCoin + " کامنت = ۱ سکه · فالو = " + c.followCoins + " سکه",
    { inline_keyboard: [
      [{ text: "⏳ بررسی عضویت‌ها (" + pm + ")", callback_data: "la|qm" }, { text: "🔔 بررسی لایک/کامنت‌ها (" + pc.length + ")", callback_data: "la|qc" }],
      [{ text: "➕ پست لایک", callback_data: "la|add|like" }, { text: "➕ پست کامنت", callback_data: "la|add|comment" }],
      [{ text: "📌 لیست پست‌ها", callback_data: "la|posts" }]
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
    { inline_keyboard: [[{ text: "📷 ارسال دوباره اسکرین‌شات", callback_data: "li|shot|" + claim.PostID }]] });
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
    tgEditCaption_(token, chatId, mid, liMemberCaption_(r.member), null);
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
