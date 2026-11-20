/**
 * ============================================================
 *  LinkedIn.gs  —  بخش لینکدین (مشترک؛ باید در «هر دو» پروژه یکسان باشد)
 * ============================================================
 *  ورود: فالو صفحه Impedyme + لینک پروفایل + اسکرین‌شات ← تایید ادمین ← سکه فالو
 *  کارها: پست‌های «لایک» و پست‌های «کامنت» جدا هستند؛ هر کار با اسکرین‌شات و تایید ادمین.
 *  سکه لینکدین = floor(لایک‌های تاییدشده / ۵) + floor(کامنت‌های تاییدشده / ۳) + سکه فالو
 *  (این سکه‌ها فقط «اضافه» می‌شوند؛ موجودی و شناسه فعلی کاربران تغییری نمی‌کند.)
 */
var LI = { MEMBERS: "LinkedInMembers", POSTS: "LinkedInPosts", CLAIMS: "LinkedInClaims" };
var LI_MEMBER_HEADERS = ["ChatID", "UID", "Name", "ProfileURL", "Status", "FollowCoins", "UserFileId", "AdminFileId", "RequestedAt", "ReviewedAt", "Reason",
  "LinkedInID", "LinkedInName", "ConnectedAt"];
var LI_POST_HEADERS = ["PostID", "Type", "Title", "URL", "Active", "AddedAt", "ApiURN"];
var LI_CLAIM_HEADERS = ["ClaimID", "ChatID", "UID", "Name", "PostID", "Type", "Status", "UserFileId", "AdminFileId", "CreatedAt", "ReviewedAt", "Reason",
  "Method", "CommentText", "CheckedAt"];
var LI_ST = { PENDING: "Pending", APPROVED: "Approved", REJECTED: "Rejected" };

var LI_REASONS = {
  member: [
    "اسکرین‌شات، فالو بودن صفحه Impedyme را نشان نمی‌دهد",
    "پروفایل لینکدین باز نمی‌شود یا خصوصی است",
    "پروفایل ناقص یا ساختگی به نظر می‌رسد",
    "این پروفایل قبلاً با حساب دیگری ثبت شده است"
  ],
  like: [
    "لایک شما در اسکرین‌شات دیده نمی‌شود",
    "اسکرین‌شات مربوط به این پست نیست",
    "اسکرین‌شات واضح نیست",
    "لایک شما روی پست پیدا نشد"
  ],
  comment: [
    "کامنت شما در اسکرین‌شات دیده نمی‌شود",
    "کامنت کپی‌شده، تکراری یا بی‌ربط است",
    "اسکرین‌شات مربوط به این پست نیست",
    "کامنت شما زیر پست پیدا نشد"
  ]
};

function liCfg_() {
  var f = Number(cfg_("LI_FOLLOW_COINS"));
  return {
    likesPerCoin: num_(cfg_("LI_LIKES_PER_COIN")) || 5,
    commentsPerCoin: num_(cfg_("LI_COMMENTS_PER_COIN")) || 3,
    followCoins: isFinite(f) && String(cfg_("LI_FOLLOW_COINS")) !== "" ? f : 3,
    companyUrl: String(cfg_("LI_COMPANY_URL") || "https://www.linkedin.com/company/impedyme/")
  };
}

function liStatus_(s) {
  s = String(s || "").trim().toLowerCase();
  if (s === "approved") return LI_ST.APPROVED;
  if (s === "rejected") return LI_ST.REJECTED;
  if (s === "pending") return LI_ST.PENDING;
  return "";
}

function liTypeFa_(type) { return type === "comment" ? "کامنت" : "لایک"; }
function liTypeIcon_(type) { return type === "comment" ? "💬" : "👍"; }

/* ------------------------- خواندن/نوشتن شیت‌ها ------------------------- */

function liTable_(name, headers) {
  var sh = sheet_(name, headers);
  var map = colMap_(sh, headers);
  var last = sh.getLastRow();
  var rows = [];
  if (last >= 2) {
    sh.getRange(2, 1, last - 1, maxCol_(map)).getValues().forEach(function (r, i) {
      var o = { row: i + 2 };
      headers.forEach(function (h) { o[h] = r[map[h] - 1]; });
      rows.push(o);
    });
  }
  return { sh: sh, map: map, rows: rows };
}

function liAppend_(t, obj) {
  var row = blankRow_(t.map);
  Object.keys(obj).forEach(function (k) { row[t.map[k] - 1] = obj[k]; });
  t.sh.appendRow(row);
}

function liNewId_(prefix, rows, col) {
  var used = {};
  (rows || []).forEach(function (r) { used[String(r[col]).trim()] = true; });
  return newId_(prefix, used);
}

/** لینک پروفایل را یکدست می‌کند: linkedin.com/in/<name> ؛ اگر لینک پروفایل نباشد null */
function liNormProfile_(u) {
  var m = String(u || "").trim().match(/linkedin\.com\/in\/([^\/?#\s]+)/i);
  if (!m) return null;
  var slug = m[1];
  try { slug = decodeURIComponent(slug); } catch (e) {}
  return "linkedin.com/in/" + slug.toLowerCase();
}

function liIsPostUrl_(u) { return /^https?:\/\/([a-z0-9-]+\.)*linkedin\.com\/\S+$/i.test(String(u || "").trim()); }

/* ------------------------- عضویت ------------------------- */

function liMember_(chatId) {
  var t = liTable_(LI.MEMBERS, LI_MEMBER_HEADERS);
  var m = null;
  t.rows.forEach(function (r) { if (String(r.ChatID).trim() === String(chatId).trim()) m = r; });
  if (m) m.Status = liStatus_(m.Status);
  return { t: t, m: m };
}

function liSubmitMember_(user, profileUrl, userFileId) {
  return withLock_(function () {
    var x = liMember_(user.chatId);
    if (x.m && x.m.Status === LI_ST.APPROVED) return { ok: false, reason: "approved" };
    var norm = liNormProfile_(profileUrl);
    var taken = x.t.rows.some(function (r) {
      return String(r.ChatID).trim() !== user.chatId && liNormProfile_(r.ProfileURL) === norm && liStatus_(r.Status) !== LI_ST.REJECTED;
    });
    if (taken) return { ok: false, reason: "taken" };
    var vals = {
      ChatID: user.chatId, UID: user.uid, Name: user.name, ProfileURL: String(profileUrl).trim(), Status: LI_ST.PENDING,
      FollowCoins: "", UserFileId: userFileId, AdminFileId: "", RequestedAt: new Date(), ReviewedAt: "", Reason: ""
    };
    if (x.m) writeCells_(x.t.sh, x.m.row, x.t.map, vals); else liAppend_(x.t, vals);
    return { ok: true, member: liMember_(user.chatId).m };
  });
}

function liReviewMember_(adminId, chatId, approve, reason) {
  return withLock_(function () {
    var x = liMember_(chatId);
    if (!x.m) return { ok: false, reason: "notfound" };
    if (x.m.Status !== LI_ST.PENDING) return { ok: false, reason: "already", member: x.m };
    var upd = { Status: approve ? LI_ST.APPROVED : LI_ST.REJECTED, ReviewedAt: new Date(), Reason: reason || "" };
    if (approve) upd.FollowCoins = liCfg_().followCoins;
    writeCells_(x.t.sh, x.m.row, x.t.map, upd);
    Object.keys(upd).forEach(function (k) { x.m[k] = upd[k]; });
    var user = findUserByChatId_(chatId);
    if (user) logHistory_(adminId, user, approve ? "li_follow_ok" : "li_follow_no", 0, user.adj, "", reason || "");
    return { ok: true, member: x.m, user: user };
  });
}

/* ------------------------- پست‌ها ------------------------- */

function liPosts_(type, includeInactive) {
  return liTable_(LI.POSTS, LI_POST_HEADERS).rows.map(function (r) {
    return {
      row: r.row, id: String(r.PostID).trim(), type: String(r.Type).trim().toLowerCase() === "comment" ? "comment" : "like",
      title: String(r.Title || "").trim() || "پست لینکدین", url: String(r.URL || "").trim(), apiUrn: String(r.ApiURN || "").trim(),
      active: !(r.Active === false || String(r.Active).trim().toUpperCase() === "FALSE")
    };
  }).filter(function (p) {
    return p.id && (!type || p.type === type) && (includeInactive || p.active);
  });
}

function liPost_(postId) {
  var all = liPosts_(null, true);
  for (var i = 0; i < all.length; i++) if (all[i].id === postId) return all[i];
  return null;
}

function liAddPost_(type, title, url) {
  var t = liTable_(LI.POSTS, LI_POST_HEADERS);
  var id = liNewId_("P", t.rows, "PostID");
  liAppend_(t, { PostID: id, Type: type, Title: title, URL: url, Active: true, AddedAt: new Date() });
  return liPost_(id);
}

function liSetPostActive_(postId, active) {
  var t = liTable_(LI.POSTS, LI_POST_HEADERS);
  for (var i = 0; i < t.rows.length; i++) {
    if (String(t.rows[i].PostID).trim() === postId) { writeCells_(t.sh, t.rows[i].row, t.map, { Active: !!active }); return true; }
  }
  return false;
}

/* ------------------------- ادعاها (لایک/کامنت با اسکرین‌شات) ------------------------- */

function liClaims_() {
  var t = liTable_(LI.CLAIMS, LI_CLAIM_HEADERS);
  t.rows.forEach(function (r) {
    r.Status = liStatus_(r.Status);
    r.ChatID = String(r.ChatID).trim();
    r.PostID = String(r.PostID).trim();
    r.ClaimID = String(r.ClaimID).trim();
  });
  return t;
}

/** وضعیت آخرین ادعای کاربر برای هر پست: { postId: claim } */
function liUserClaims_(chatId) {
  var m = {};
  liClaims_().rows.forEach(function (c) { if (c.ChatID === String(chatId)) m[c.PostID] = c; });
  return m;
}

function liCreateClaim_(user, post, userFileId, method) {
  return withLock_(function () {
    var t = liClaims_();
    var dup = t.rows.some(function (c) {
      return c.ChatID === user.chatId && c.PostID === post.id && (c.Status === LI_ST.PENDING || c.Status === LI_ST.APPROVED);
    });
    if (dup) return { ok: false, reason: "duplicate" };
    var claim = {
      ClaimID: liNewId_("L", t.rows, "ClaimID"), ChatID: user.chatId, UID: user.uid, Name: user.name, PostID: post.id, Type: post.type,
      Status: LI_ST.PENDING, UserFileId: userFileId || "", AdminFileId: "", CreatedAt: new Date(), ReviewedAt: "", Reason: "",
      Method: method || "screenshot", CommentText: "", CheckedAt: ""
    };
    liAppend_(t, claim);
    return { ok: true, claim: claim };
  });
}

function liFindClaim_(claimId) {
  var t = liClaims_();
  for (var i = 0; i < t.rows.length; i++) if (t.rows[i].ClaimID === claimId) return { t: t, c: t.rows[i] };
  return { t: t, c: null };
}

function liReviewClaim_(adminId, claimId, approve, reason, extra) {
  return withLock_(function () {
    var x = liFindClaim_(claimId);
    if (!x.c) return { ok: false, reason: "notfound" };
    if (x.c.Status !== LI_ST.PENDING) return { ok: false, reason: "already", claim: x.c };
    var upd = { Status: approve ? LI_ST.APPROVED : LI_ST.REJECTED, ReviewedAt: new Date(), Reason: reason || "" };
    if (extra) Object.keys(extra).forEach(function (k) { upd[k] = extra[k]; });
    writeCells_(x.t.sh, x.c.row, x.t.map, upd);
    Object.keys(upd).forEach(function (k) { x.c[k] = upd[k]; });
    var user = findUserByChatId_(x.c.ChatID);
    if (user) logHistory_(adminId, user, "li_" + x.c.Type + (approve ? "_ok" : "_no"), 0, user.adj, "", claimId + (reason ? " | " + reason : ""));
    return { ok: true, claim: x.c, user: user };
  });
}

function liSaveAdminFile_(table, headers, keyCol, keyVal, fileId) {
  if (!fileId) return;
  try {
    var t = liTable_(table, headers);
    for (var i = 0; i < t.rows.length; i++) {
      if (String(t.rows[i][keyCol]).trim() === String(keyVal)) { writeCells_(t.sh, t.rows[i].row, t.map, { AdminFileId: fileId }); return; }
    }
  } catch (e) {}
}

/* ------------------------- سکه لینکدین ------------------------- */

function liBlank_() { return { member: false, memberPending: false, follow: 0, likes: 0, comments: 0, pending: 0, coins: 0 }; }

/** جمع لینکدین همه کاربران: { chatId: {likes, comments, follow, pending, coins, ...} } */
function liTotals_() {
  var c = liCfg_();
  var out = {};
  var get = function (id) { id = String(id).trim(); return out[id] || (out[id] = liBlank_()); };
  liTable_(LI.MEMBERS, LI_MEMBER_HEADERS).rows.forEach(function (m) {
    var st = liStatus_(m.Status), x = get(m.ChatID);
    if (st === LI_ST.APPROVED) { x.member = true; x.follow = num_(m.FollowCoins); }
    else if (st === LI_ST.PENDING) x.memberPending = true;
  });
  liClaims_().rows.forEach(function (cl) {
    var x = get(cl.ChatID);
    if (cl.Status === LI_ST.APPROVED) { if (String(cl.Type) === "comment") x.comments++; else x.likes++; }
    else if (cl.Status === LI_ST.PENDING) x.pending++;
  });
  Object.keys(out).forEach(function (k) {
    var x = out[k];
    x.coins = Math.floor(x.likes / c.likesPerCoin) + Math.floor(x.comments / c.commentsPerCoin) + x.follow;
  });
  return out;
}

function liInfoFor_(chatId) { return liTotals_()[String(chatId).trim()] || liBlank_(); }

/* ------------------------- اسکرین‌شات برای ادمین ------------------------- */

function tgFileBlob_(token, fileId) {
  var r = tgApi_(token, "getFile", { file_id: fileId });
  if (!r.ok || !r.result || !r.result.file_path) return null;
  try {
    var resp = UrlFetchApp.fetch("https://api.telegram.org/file/bot" + token + "/" + r.result.file_path, { muteHttpExceptions: true });
    return resp.getResponseCode() === 200 ? resp.getBlob() : null;
  } catch (e) { return null; }
}

/**
 * عکس را در ربات ادمین نشان می‌دهد. شناسه فایل در هر ربات فرق دارد، پس بار اول عکس از ربات کاربر
 * دانلود و در ربات ادمین آپلود می‌شود و شناسه جدید (AdminFileId) برای دفعات بعد برمی‌گردد.
 */
function liShowShot_(adminChatId, userFileId, adminFileId, caption, markup) {
  var token = cfg_("ADMIN_BOT_TOKEN");
  var res;
  if (adminFileId) {
    res = tgApi_(token, "sendPhoto", { chat_id: adminChatId, photo: adminFileId, caption: caption, parse_mode: "HTML", reply_markup: markup || undefined });
    if (res.ok) return adminFileId;
  }
  var blob = userFileId ? tgFileBlob_(cfg_("USER_BOT_TOKEN"), userFileId) : null;
  if (!blob) {
    tgSend_(token, adminChatId, caption + "\n\n⚠️ اسکرین‌شات قابل دریافت نبود.", markup);
    return "";
  }
  var p = { chat_id: String(adminChatId), photo: blob, caption: caption, parse_mode: "HTML" };
  if (markup) p.reply_markup = JSON.stringify(markup);
  try {
    var resp = UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/sendPhoto", { method: "post", payload: p, muteHttpExceptions: true });
    res = JSON.parse(resp.getContentText());
  } catch (e) { res = { ok: false }; }
  if (!res.ok) { tgSend_(token, adminChatId, caption, markup); return ""; }
  var ph = res.result && res.result.photo;
  return ph && ph.length ? ph[ph.length - 1].file_id : "";
}

/** به همه ادمین‌ها می‌فرستد؛ شناسه عکسِ ربات ادمین را برمی‌گرداند */
function liNotifyAdminsShot_(userFileId, caption, markup) {
  if (!tokenOk_(cfg_("ADMIN_BOT_TOKEN"))) return "";
  var fid = "";
  adminIds_().forEach(function (id) { fid = liShowShot_(id, userFileId, fid, caption, markup) || fid; });
  return fid;
}

function liMemberCaption_(m) {
  return "🧑‍💼 <b>درخواست عضویت لینکدین</b>\n" +
    "👤 " + esc_(m.Name) + " (ID: <code>" + esc_(m.UID) + "</code>)\n" +
    "🔗 " + esc_(m.ProfileURL) + "\n" +
    "📷 اسکرین‌شات فالو صفحه Impedyme\n" +
    (m.LinkedInID ? "🆔 LinkedIn: " + esc_(m.LinkedInName || "") + " <code>" + esc_(m.LinkedInID) + "</code>\n" : "") +
    "🕒 " + fmtDate_(m.RequestedAt) +
    (m.Status && m.Status !== LI_ST.PENDING ? "\n\n" + (m.Status === LI_ST.APPROVED ? "✅ تایید شد (+" + num_(m.FollowCoins) + " سکه فالو)" : "❌ رد شد" + (m.Reason ? " — " + esc_(m.Reason) : "")) : "");
}

function liMemberButtons_(chatId) {
  return { inline_keyboard: [[
    { text: "✅ تایید (+" + liCfg_().followCoins + " سکه فالو)", callback_data: "lm|" + chatId + "|ok" },
    { text: "❌ رد", callback_data: "lm|" + chatId + "|no" }
  ]] };
}

function liClaimCaption_(c, post) {
  var head = liTypeIcon_(c.Type) + " <b>" + liTypeFa_(c.Type) + " برای بررسی</b>";
  var t = head + "\n👤 " + esc_(c.Name) + " (ID: <code>" + esc_(c.UID) + "</code>)\n" +
    "📌 " + esc_(post ? post.title : c.PostID) + "\n" +
    (post && post.url ? "🔗 " + esc_(post.url) + "\n" : "") +
    (c.Method === "api" ? "🤖 بررسی خودکار با API" + (c.CommentText ? "\n💬 «" + esc_(String(c.CommentText).substring(0, 300)) + "»" : "") + "\n" : "") +
    "🕒 " + fmtDate_(c.CreatedAt);
  if (c.Status && c.Status !== LI_ST.PENDING) t += "\n\n" + (c.Status === LI_ST.APPROVED ? "✅ تایید شد" : "❌ رد شد" + (c.Reason ? " — " + esc_(c.Reason) : ""));
  return t;
}

function liClaimButtons_(claimId) {
  return { inline_keyboard: [[
    { text: "✅ تایید", callback_data: "lc|" + claimId + "|ok" },
    { text: "❌ رد", callback_data: "lc|" + claimId + "|no" }
  ]] };
}

/** متن پیشرفت سکه لینکدین (برای کاربر و ادمین) */
function liProgressText_(info) {
  var c = liCfg_();
  var nextL = c.likesPerCoin - (info.likes % c.likesPerCoin);
  var nextC = c.commentsPerCoin - (info.comments % c.commentsPerCoin);
  return (info.member ? "✅ فالو صفحه Impedyme: +" + info.follow + " سکه\n" : "") +
    "👍 لایک‌های تاییدشده: " + info.likes + " (هر " + c.likesPerCoin + " لایک = ۱ سکه؛ " + nextL + " لایک تا سکه بعدی)\n" +
    "💬 کامنت‌های تاییدشده: " + info.comments + " (هر " + c.commentsPerCoin + " کامنت = ۱ سکه؛ " + nextC + " کامنت تا سکه بعدی)\n" +
    (info.pending ? "⏳ در انتظار بررسی: " + info.pending + "\n" : "") +
    "🪙 <b>سکه‌های لینکدین: " + info.coins + "</b>";
}

/* ------------------------- شناسه لینکدین کاربر ------------------------- */

/** شناسه را یکدست می‌کند: «urn:li:person:Ab12» یا «Ab12» ← «Ab12» */
function liIdKey_(s) {
  return String(s || "").trim().replace(/^urn:li:(person|member):/i, "");
}

/** ثبت/ویرایش نام و شناسه لینکدین یک عضو (توسط ادمین یا با «اتصال حساب لینکدین») */
function liSetIdentity_(chatId, linkedinId, linkedinName) {
  return withLock_(function () {
    var x = liMember_(chatId);
    if (!x.m) return false;
    var upd = { ConnectedAt: new Date() };
    if (linkedinId !== null && linkedinId !== undefined) upd.LinkedInID = linkedinId === "-" ? "" : "'" + liIdKey_(linkedinId);
    if (linkedinName !== null && linkedinName !== undefined) upd.LinkedInName = linkedinName === "-" ? "" : linkedinName;
    writeCells_(x.t.sh, x.m.row, x.t.map, upd);
    return true;
  });
}

/* ------------------------- LinkedIn API (اختیاری) ------------------------- */

/** API آماده است وقتی ادمین «🔑 اتصال API لینکدین» را انجام داده و توکن منقضی نشده باشد */
function liApiReady_() {
  if (String(getSetting_("LI_API_READY")) !== "yes") return false;
  var exp = toMs_(getSetting_("LI_TOKEN_EXPIRES"));
  return exp === null || exp > Date.now();
}

function liOAuthConfigured_(redirectKey) {
  return !!(cfg_("LI_CLIENT_ID") && cfg_("LI_CLIENT_SECRET") && /^https:\/\//.test(String(cfg_(redirectKey) || "")));
}

function liOAuthUrl_(scopes, redirectUrl, state) {
  return "https://www.linkedin.com/oauth/v2/authorization?response_type=code" +
    "&client_id=" + encodeURIComponent(cfg_("LI_CLIENT_ID")) +
    "&redirect_uri=" + encodeURIComponent(redirectUrl) +
    "&state=" + encodeURIComponent(state) +
    "&scope=" + encodeURIComponent(scopes);
}

/** کد برگشتی از لینکدین را به توکن تبدیل می‌کند */
function liExchangeCode_(code, redirectUrl) {
  var resp = UrlFetchApp.fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "post", muteHttpExceptions: true,
    payload: { grant_type: "authorization_code", code: code, redirect_uri: redirectUrl, client_id: cfg_("LI_CLIENT_ID"), client_secret: cfg_("LI_CLIENT_SECRET") }
  });
  var j = {};
  try { j = JSON.parse(resp.getContentText()); } catch (e) {}
  return j.access_token ? { ok: true, token: j.access_token, expiresIn: Number(j.expires_in || 0), scope: String(j.scope || "") }
    : { ok: false, error: j.error_description || j.error || ("HTTP " + resp.getResponseCode()) };
}

/** درخواست به API؛ برای /rest/ چند نسخه LinkedIn-Version امتحان می‌شود تا یکی پذیرفته شود */
function liApiFetch_(token, url) {
  var rest = url.indexOf("/rest/") !== -1;
  var versions = rest ? [String(cfg_("LI_API_VERSION") || "202607"), "202604", "202601"] : [null];
  var last = null;
  for (var i = 0; i < versions.length; i++) {
    var h = { Authorization: "Bearer " + token };
    if (versions[i]) { h["LinkedIn-Version"] = versions[i]; h["X-Restli-Protocol-Version"] = "2.0.0"; }
    var resp = UrlFetchApp.fetch(url, { method: "get", headers: h, muteHttpExceptions: true });
    var text = resp.getContentText(), json = null;
    try { json = JSON.parse(text); } catch (e) {}
    last = { code: resp.getResponseCode(), text: text, json: json };
    if (!(last.code === 426 || (last.code === 400 && /version/i.test(text)))) return last;
  }
  return last;
}

/** شناسه و نام صاحب توکن */
function liApiMe_(token) {
  var r = liApiFetch_(token, "https://api.linkedin.com/v2/me");
  if (r.code !== 200 || !r.json || !r.json.id) return null;
  var name = [r.json.localizedFirstName, r.json.localizedLastName].filter(Boolean).join(" ");
  return { id: String(r.json.id), name: name };
}

/** صفحه ساده‌ای که بعد از ورود با لینکدین در مرورگر نشان داده می‌شود */
function liPage_(text) {
  var safe = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return HtmlService.createHtmlOutput('<div dir="auto" style="font:17px/1.8 Tahoma,sans-serif;padding:24px;max-width:640px">' + safe + "</div>")
    .setTitle("Impedyme");
}
