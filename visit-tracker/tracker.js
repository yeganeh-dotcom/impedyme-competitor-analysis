/**
 * Impedyme visit tracker
 *
 * Paste this file's content inside a <script> tag before </body> on every
 * page of every website you want to track. Works on any site (plain HTML,
 * WordPress, React, ...).
 *
 * How a person gets identified:
 *   Send each user a personal link ONCE, e.g. https://yoursite.com/?uid=sara
 *   After that first click, their browser is remembered forever (until they
 *   clear browser data), no matter how often their IP changes.
 *
 * What gets recorded (into your Google Sheet, via the Apps Script endpoint):
 *   - who (uid), which site, which page
 *   - every visit (a new visit starts after 30+ minutes of inactivity)
 *   - a heartbeat every 60 seconds while the tab is open and visible,
 *     so you can calculate how long they stayed
 */
(function () {
  // 1) Paste your Apps Script Web App URL here (see README.md, step 2)
  var ENDPOINT = "PASTE_YOUR_APPS_SCRIPT_WEB_APP_URL_HERE";

  var SESSION_GAP_MINUTES = 30; // inactivity gap that starts a new visit
  var HEARTBEAT_SECONDS = 60;   // how often to report "still here"

  // 2) Identify the visitor: from their personal link, or from earlier visits
  var uid = new URLSearchParams(location.search).get("uid")
         || localStorage.getItem("impedyme_uid");
  if (!uid) return; // unknown visitor -> track nothing
  localStorage.setItem("impedyme_uid", uid);

  // 3) Visit (session) logic: new visit after a long gap
  var now = Date.now();
  var lastSeen = Number(localStorage.getItem("impedyme_last_seen") || 0);
  var visitId = localStorage.getItem("impedyme_visit_id");
  if (!visitId || now - lastSeen > SESSION_GAP_MINUTES * 60 * 1000) {
    visitId = uid + "-" + now;
    localStorage.setItem("impedyme_visit_id", visitId);
  }

  function send(eventType) {
    localStorage.setItem("impedyme_last_seen", String(Date.now()));
    var payload = JSON.stringify({
      uid: uid,
      visitId: visitId,
      type: eventType,
      site: location.hostname,
      page: location.pathname,
      ts: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
    // sendBeacon fires even if the user is leaving the page
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, payload);
    } else {
      fetch(ENDPOINT, { method: "POST", body: payload, keepalive: true });
    }
  }

  send("pageview");

  setInterval(function () {
    if (document.visibilityState === "visible") send("heartbeat");
  }, HEARTBEAT_SECONDS * 1000);
})();
