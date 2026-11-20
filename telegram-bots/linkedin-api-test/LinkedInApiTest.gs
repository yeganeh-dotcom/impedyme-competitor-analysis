/**
 * ============================================================
 *  LinkedIn API test (standalone) — for the Impedyme bots
 * ============================================================
 *  Before anything is built into the bots, this checks whether your LinkedIn app can:
 *    1) read who LIKED and who COMMENTED on an Impedyme post, and
 *    2) recognise YOUR account in those lists (that is how the bot would recognise users later).
 *  It only reads. It changes nothing on LinkedIn, in your bots or in your Google Sheet.
 *
 *  SETUP (once)
 *   1. script.google.com → New project → paste this whole file → Save.
 *   2. Deploy → New deployment → type: Web app → Execute as: Me · Who has access: Anyone → Deploy.
 *      Copy the Web app URL (it ends with /exec), paste it into WEB_APP_URL below, Save.
 *   3. LinkedIn Developer portal (linkedin.com/developers/apps) → your app → "Auth" tab
 *      → "Authorized redirect URLs for your app" → add exactly the same /exec URL → Update.
 *   4. In the same Auth tab copy "Client ID" and "Primary Client Secret".
 *      Here: Project Settings (⚙️) → Script Properties → add  LI_CLIENT_ID  and  LI_CLIENT_SECRET.
 *      Never paste the secret into a chat.
 *
 *  TEST
 *   5. Select step1_loginLink → Run → open the link printed in the Execution log → sign in with a
 *      LinkedIn account that is an ADMIN of the Impedyme page → Allow.
 *      If LinkedIn shows "unauthorized_scope_error", your app does not have the
 *      Community Management API yet: stop here and tell Claude.
 *   6. With that same LinkedIn account, LIKE and COMMENT on one Impedyme post.
 *   7. Paste that post's link into TEST_POST_URL below, Save, select step2_test → Run,
 *      and send Claude everything the Execution log shows (it contains no passwords or tokens).
 */

var WEB_APP_URL = "PASTE_WEB_APP_URL_HERE";
var TEST_POST_URL = "PASTE_POST_LINK_HERE";
var SCOPES = "r_basicprofile r_organization_social";
var LI_VERSIONS = ["202610", "202607", "202604", "202601"]; // LinkedIn-Version header; the first one LinkedIn accepts is used

function props_() { return PropertiesService.getScriptProperties(); }

function step1_loginLink() {
  var p = props_();
  var id = p.getProperty("LI_CLIENT_ID");
  if (!id || !p.getProperty("LI_CLIENT_SECRET")) throw new Error("Add LI_CLIENT_ID and LI_CLIENT_SECRET in Project Settings → Script Properties first.");
  if (!/^https:\/\/script\.google\.com\/.+\/exec$/.test(WEB_APP_URL)) throw new Error("Paste your Web app URL (ending with /exec) into WEB_APP_URL first.");
  var state = Utilities.getUuid();
  p.setProperty("LI_STATE", state);
  var url = "https://www.linkedin.com/oauth/v2/authorization?response_type=code" +
    "&client_id=" + encodeURIComponent(id) +
    "&redirect_uri=" + encodeURIComponent(WEB_APP_URL) +
    "&state=" + state +
    "&scope=" + encodeURIComponent(SCOPES);
  Logger.log("Open this link, sign in with a LinkedIn account that is an admin of the Impedyme page, and press Allow:\n\n" + url);
}

/** LinkedIn sends the browser back here after "Allow" */
function doGet(e) {
  var p = props_();
  var q = (e && e.parameter) || {};
  if (q.error) {
    var hint = /scope/i.test(q.error) ? " → Your LinkedIn app does not have the needed permission yet (Community Management API)." : "";
    return page_("❌ LinkedIn said: " + q.error + " — " + (q.error_description || "") + hint);
  }
  if (!q.code) return page_("This page is only used for the LinkedIn connection test.");
  if (!q.state || q.state !== p.getProperty("LI_STATE")) return page_("❌ This link is old or wrong. Run step1_loginLink again.");
  var resp = UrlFetchApp.fetch("https://www.linkedin.com/oauth/v2/accessToken", {
    method: "post",
    muteHttpExceptions: true,
    payload: {
      grant_type: "authorization_code", code: q.code, redirect_uri: WEB_APP_URL,
      client_id: p.getProperty("LI_CLIENT_ID"), client_secret: p.getProperty("LI_CLIENT_SECRET")
    }
  });
  var j = {};
  try { j = JSON.parse(resp.getContentText()); } catch (x) {}
  if (!j.access_token) {
    return page_("❌ Could not finish the sign-in (HTTP " + resp.getResponseCode() + "): " +
      (j.error_description || j.error || resp.getContentText().substring(0, 300)));
  }
  p.setProperty("LI_TOKEN", j.access_token);
  p.setProperty("LI_TOKEN_SCOPES", String(j.scope || ""));
  p.setProperty("LI_TOKEN_EXPIRES", String(Date.now() + 1000 * Number(j.expires_in || 0)));
  p.deleteProperty("LI_STATE");
  return page_("✅ Connected. Permissions LinkedIn granted: " + (j.scope || "(not listed)") +
    ". Now like and comment on one Impedyme post, then run step2_test in the script editor.");
}

function page_(text) {
  var safe = String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return HtmlService.createHtmlOutput('<div style="font:16px/1.6 sans-serif;padding:24px;max-width:680px">' + safe + "</div>")
    .setTitle("LinkedIn test");
}

function step2_test() {
  var p = props_();
  var token = p.getProperty("LI_TOKEN");
  if (!token) throw new Error("Run step1_loginLink and finish the sign-in first.");
  var out = [];
  var exp = Number(p.getProperty("LI_TOKEN_EXPIRES") || 0);
  out.push("granted permissions: " + (p.getProperty("LI_TOKEN_SCOPES") || "(unknown)") +
    (exp ? " · login valid until " + new Date(exp).toISOString().substring(0, 10) : ""));

  var me = api_(token, "https://api.linkedin.com/v2/me", false);
  var myId = me.json && me.json.id ? String(me.json.id) : "";
  out.push("your account: HTTP " + me.code + (myId ? " · id found" : " · " + me.text.substring(0, 200)));

  var m = String(TEST_POST_URL).match(/(?:activity|share|ugcpost)[-:](\d{10,25})/i);
  if (!m) { out.push("❌ Could not find the post number in TEST_POST_URL. Paste the full post link."); return report_(out, false); }
  out.push("post number: " + m[1]);

  var likeFound = false, commentFound = false;
  ["urn:li:activity:", "urn:li:share:", "urn:li:ugcPost:"].forEach(function (prefix) {
    var urn = prefix + m[1];
    var enc = encodeURIComponent(urn);
    var r = api_(token, "https://api.linkedin.com/rest/reactions/(entity:" + enc + ")?q=entity&count=100", true);
    var likers = people_(r.text);
    var meLiked = !!myId && likers.indexOf("urn:li:person:" + myId) !== -1;
    likeFound = likeFound || meLiked;
    out.push("likes on " + urn + ": HTTP " + r.code + " · people: " + likers.length +
      (myId ? (meLiked ? " · YOUR LIKE FOUND ✅" : " · your like not found") : "") + errorBit_(r));

    var c = api_(token, "https://api.linkedin.com/rest/socialActions/" + enc + "/comments?count=100", true);
    var commenters = people_(c.text);
    var meCommented = !!myId && commenters.indexOf("urn:li:person:" + myId) !== -1;
    commentFound = commentFound || meCommented;
    out.push("comments on " + urn + ": HTTP " + c.code + " · people: " + commenters.length +
      (myId ? (meCommented ? " · YOUR COMMENT FOUND ✅" : " · your comment not found") : "") + errorBit_(c));
  });
  report_(out, likeFound && commentFound);
}

/** Calls LinkedIn; for /rest/ endpoints it tries the API versions in LI_VERSIONS until one is accepted */
function api_(token, url, rest) {
  var versions = rest ? LI_VERSIONS : [null];
  var last = null;
  for (var i = 0; i < versions.length; i++) {
    var headers = { Authorization: "Bearer " + token };
    if (versions[i]) { headers["LinkedIn-Version"] = versions[i]; headers["X-Restli-Protocol-Version"] = "2.0.0"; }
    var resp = UrlFetchApp.fetch(url, { method: "get", headers: headers, muteHttpExceptions: true });
    var text = resp.getContentText(), json = null;
    try { json = JSON.parse(text); } catch (e) {}
    last = { code: resp.getResponseCode(), text: text, json: json, version: versions[i] };
    var versionProblem = last.code === 426 || (last.code === 400 && /version/i.test(text));
    if (!versionProblem) return last;
  }
  return last;
}

function people_(text) {
  var seen = {};
  (String(text).match(/urn:li:person:[A-Za-z0-9_-]+/g) || []).forEach(function (u) { seen[u] = true; });
  return Object.keys(seen);
}

function errorBit_(r) {
  if (r.code < 400) return "";
  var msg = r.json && (r.json.message || r.json.serviceErrorCode) ? String(r.json.message || r.json.serviceErrorCode) : r.text;
  return " · " + String(msg).substring(0, 160);
}

function report_(lines, ok) {
  lines.push("");
  lines.push(ok
    ? "RESULT: ✅ LinkedIn shows your like and your comment — automatic checking can work. Send this log to Claude."
    : "RESULT: ❌ Not working yet — send this whole log to Claude.");
  Logger.log("\n" + lines.join("\n"));
}
