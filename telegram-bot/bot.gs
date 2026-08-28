/**
 * ==========================================================================================
 *  IMPEDYME TELEGRAM BOT  —  Google Apps Script
 * ==========================================================================================
 *
 *  WHAT THIS FILE DOES
 *  -------------------
 *  1. Registers users (name -> email -> personal tracking link).
 *  2. Reads their tracked visits from the Google Sheet written by `sheet-logger.gs`.
 *  3. Turns valid visits into coins / Toman.
 *  4. >>> Sends a WARNING whenever the user's computer timezone is Asia/Tehran <<<
 *     ("change your timezone to match the country of your VPN").
 *
 *  HOW TO EDIT
 *  -----------
 *  Everything you would normally want to change lives in SECTIONS 1-6 below.
 *  You should almost never need to touch SECTION 7 and later (the logic).
 *  Every setting has a comment saying exactly what it does.
 *
 *  FIRST-TIME SETUP (do this once)
 *  -------------------------------
 *  a) Apps Script editor -> Project Settings -> Script Properties -> add:
 *        TELEGRAM_TOKEN = <your BotFather token>
 *        SHEET_ID       = <id of the tracking spreadsheet>
 *        WEB_APP_URL    = <the /exec URL of THIS deployed script>
 *     Storing them there keeps the secrets out of the code file.
 *  b) Deploy -> New deployment -> Web app -> Execute as: Me, Access: Anyone.
 *  c) Run `setWebhook()` once from the editor.
 *  d) (Optional but recommended) Run `installTimezoneCheckTrigger()` once so the bot
 *     also warns Tehran users automatically every hour, without them opening the bot.
 * ==========================================================================================
 */


/* ==========================================================================================
 * SECTION 1 — CONNECTION SETTINGS
 * ------------------------------------------------------------------------------------------
 * These three values connect the bot to Telegram and to your spreadsheet.
 * Best practice: leave the strings empty here and put the real values in Script Properties
 * (see "FIRST-TIME SETUP" above). If a Script Property is missing, the fallback string below
 * is used instead — so you can also just paste the values here if you prefer.
 * ========================================================================================== */
var SETTINGS = {

  // Telegram bot token from @BotFather. Leave "" and use Script Property TELEGRAM_TOKEN.
  TELEGRAM_TOKEN_FALLBACK: "",

  // The /exec URL of THIS deployed script (used by setWebhook). Script Property: WEB_APP_URL.
  WEB_APP_URL_FALLBACK: "",

  // The id of the tracking spreadsheet (the long part of its URL). Script Property: SHEET_ID.
  SHEET_ID_FALLBACK: "",

  // Prefix of the per-user tabs created by sheet-logger.gs. Must match that file.
  USER_TAB_PREFIX: "User - ",

  // Your website. The personal link given to each user is built from this.
  SITE_BASE_URL: "https://www.impedyme.com/",

  // Telegram formatting mode. "HTML" is the safe one: names/emails with * or _ cannot break it.
  // If you switch this to "Markdown" you must also rewrite the <b>...</b> tags in SECTION 6.
  PARSE_MODE: "HTML",

  // Timezone used to group activity into "hours" for the anti-spam limit (SECTION 2).
  // Use the same timezone as your Apps Script project to avoid confusion.
  SCRIPT_TIMEZONE: "Etc/GMT",

  // Thousands separator used for money amounts, e.g. 300,000
  THOUSANDS_SEPARATOR: ","
};


/* ==========================================================================================
 * SECTION 2 — COIN / MONEY RULES
 * ------------------------------------------------------------------------------------------
 * This is the whole payout formula. Change the numbers, nothing else.
 * ========================================================================================== */
var COIN_RULES = {

  PAGEVIEWS_PER_COIN:  20,      // how many valid pageviews make 1 coin
  HEARTBEATS_PER_COIN: 15,      // how many valid heartbeats make 1 coin
  TOMAN_PER_COIN:      5000,    // value of one coin, in Toman
  MIN_WITHDRAW_TOMAN:  300000,  // withdraw button only appears above this balance

  // Anti-spam: at most this many events of the same type, on the same page, in the same hour.
  MAX_EVENTS_PER_PAGE_PER_HOUR: 5,

  // A visit only counts if the referrer contains this text. Set to "" to accept any source.
  REQUIRED_REFERRER: "google",

  // Only these pages earn coins. Add/remove paths freely (lowercase, keep the slashes).
  TARGET_PAGES: [
    "/grid-emulator/",
    "/motor-emulator/",
    "/battery-pack-emulation/",
    "/power-hardware-in-the-loop/"
  ]
};


/* ==========================================================================================
 * SECTION 3 — TIMEZONE / COUNTRY RULES   <<< THE FEATURE YOU ASKED FOR >>>
 * ------------------------------------------------------------------------------------------
 * A visit is REJECTED (earns nothing) and the user gets a warning when either:
 *   - their laptop timezone is in BLOCKED_TIMEZONES / contains a BLOCKED_TIMEZONE_KEYWORD, or
 *   - their IP country is in BLOCKED_COUNTRIES.
 * ========================================================================================== */
var TZ_RULES = {

  // Exact timezone names that are not allowed (compared lowercase, spaces ignored).
  BLOCKED_TIMEZONES: [
    "asia/tehran"
  ],

  // Anything containing one of these words is also treated as blocked.
  // Catches "Iran/Tehran", "Asia/Tehran " with a space, etc. Empty the list to disable.
  BLOCKED_TIMEZONE_KEYWORDS: [
    "tehran",
    "iran"
  ],

  // IP countries that are not allowed (compared lowercase, "contains" match).
  BLOCKED_COUNTRIES: [
    "iran"
  ],

  // ---- When to push the warning -------------------------------------------------------
  // true  = the warning is also sent as its own message on ANY bot interaction,
  //         not only inside the wallet message.
  WARN_ON_EVERY_INTERACTION: true,

  // Minimum minutes between two automatic warnings for the same user (anti-spam).
  // 0 = warn every single time. 60 = at most once per hour.
  WARN_COOLDOWN_MINUTES: 60,

  // Used by the hourly trigger `notifyBlockedTimezoneUsers()`:
  // only warn users whose last blocked visit happened within this many hours.
  // Set to 0 to warn every user who was EVER seen with a blocked timezone.
  RECENT_ACTIVITY_HOURS: 24,

  // Inside the wallet message the warning is always shown (cooldown does not apply there).
  ALWAYS_SHOW_IN_WALLET: true
};

/* ------------------------------------------------------------------------------------------
 * Country -> correct timezone hint.
 * When we know the user's VPN country we tell them exactly which timezone to pick.
 * ADD YOUR OWN COUNTRIES HERE — the key must be lowercase and match the country name that
 * ipwho.is returns (column J of the sheet), e.g. "italy", "germany", "united states".
 * ------------------------------------------------------------------------------------------ */
var COUNTRY_TIMEZONE_HINTS = {
  "italy":                { flag: "🇮🇹", timezone: "Europe/Rome",       offset: "UTC+1 in winter / UTC+2 in summer" },
  "germany":              { flag: "🇩🇪", timezone: "Europe/Berlin",     offset: "UTC+1 in winter / UTC+2 in summer" },
  "france":               { flag: "🇫🇷", timezone: "Europe/Paris",      offset: "UTC+1 in winter / UTC+2 in summer" },
  "netherlands":          { flag: "🇳🇱", timezone: "Europe/Amsterdam",  offset: "UTC+1 in winter / UTC+2 in summer" },
  "spain":                { flag: "🇪🇸", timezone: "Europe/Madrid",     offset: "UTC+1 in winter / UTC+2 in summer" },
  "sweden":               { flag: "🇸🇪", timezone: "Europe/Stockholm",  offset: "UTC+1 in winter / UTC+2 in summer" },
  "poland":               { flag: "🇵🇱", timezone: "Europe/Warsaw",     offset: "UTC+1 in winter / UTC+2 in summer" },
  "united kingdom":       { flag: "🇬🇧", timezone: "Europe/London",     offset: "UTC+0 in winter / UTC+1 in summer" },
  "finland":              { flag: "🇫🇮", timezone: "Europe/Helsinki",   offset: "UTC+2 in winter / UTC+3 in summer" },
  "romania":              { flag: "🇷🇴", timezone: "Europe/Bucharest",  offset: "UTC+2 in winter / UTC+3 in summer" },
  "turkey":               { flag: "🇹🇷", timezone: "Europe/Istanbul",   offset: "UTC+3 all year" },
  "united arab emirates": { flag: "🇦🇪", timezone: "Asia/Dubai",        offset: "UTC+4 all year" },
  "canada":               { flag: "🇨🇦", timezone: "America/Toronto",   offset: "UTC-5 in winter / UTC-4 in summer" },
  "united states":        { flag: "🇺🇸", timezone: "America/New_York",  offset: "UTC-5 in winter / UTC-4 in summer" }
};


/* ==========================================================================================
 * SECTION 4 — SPREADSHEET COLUMN MAP
 * ------------------------------------------------------------------------------------------
 * Which column of the user tab holds what (0 = column A, 1 = column B, ...).
 * If you ever reorder the columns in sheet-logger.gs, fix the numbers here and nothing else.
 * ========================================================================================== */
var COL = {
  TIMESTAMP:  0,   // A  Timestamp
  USER:       1,   // B  User (uid)
  VISIT_ID:   2,   // C  Visit ID
  EVENT:      3,   // D  Event  -> "pageview" / "heartbeat"
  SITE:       4,   // E  Site
  PAGE:       5,   // F  Page   -> /grid-emulator/ ...
  REFERRER:   6,   // G  Came From -> "google.com" ...
  IP:         7,   // H  IP
  CITY:       8,   // I  City
  COUNTRY:    9,   // J  Country -> "Italy"
  TIMEZONE:  10,   // K  Timezone -> "Asia/Tehran"   <-- the important one
  USER_AGENT:11,   // L  User Agent
  TZ_OFFSET: 12    // M  TZ Offset in minutes (optional, added by the new footer)
};


/* ==========================================================================================
 * SECTION 5 — BUTTON LABELS
 * ------------------------------------------------------------------------------------------
 * Change the wording here and the bot will still work: the code compares against these
 * variables, never against hard-coded text.
 * ========================================================================================== */
var BUTTONS = {
  RESTART:  "شروع دوباره 🔄",
  WALLET:   "کیف پول 💰",
  PROFILE:  "اطلاعات کاربری 👤",
  WITHDRAW: "برداشت وجه 💳"
};


/* ==========================================================================================
 * SECTION 6 — ALL TEXTS THE BOT SENDS
 * ------------------------------------------------------------------------------------------
 * Edit any sentence you like. {placeholders} are replaced with real values at send time —
 * keep the ones you need, delete the lines you don't want.
 * Formatting uses HTML (SETTINGS.PARSE_MODE): <b>bold</b>, <i>italic</i>, <code>mono</code>.
 * ========================================================================================== */
var TEXTS = {

  /* ---------- registration ---------- */
  ASK_NAME:  "سلام! خوش آمدید.\nلطفاً نام خود را به <b>انگلیسی</b> وارد کنید:",
  ASK_EMAIL: "حالا لطفاً ایمیل خود را وارد کنید:",

  REGISTERED:
    "ثبت‌نام شما با موفقیت انجام شد! 🎉\n\n" +
    "ID: {id}\n" +
    "name: {name}\n" +
    "email: {email}\n" +
    "personal link: {link}\n\n" +
    "📌 <b>دستورالعمل مرحله بعد:</b>\n" +
    "۱. حتماً یک پنجره ناشناس (<b>New Incognito window</b>) در مرورگر Chrome باز کنید.\n" +
    "۲. لینک اختصاصی بالا را در آن پنجره باز کنید.\n" +
    "۳. پس از باز شدن سایت، یک Tab جدید باز کنید.\n" +
    "۴. کلمات زیر را در گوگل جستجو کرده و روی لینک سایت ما کلیک کنید:\n" +
    "• 'grid emulator'\n" +
    "• 'motor emulator'\n" +
    "• 'power hardware in the loop'\n" +
    "• 'battery emulator'\n\n" +
    "⚠️ <b>نکته ۱:</b> فقط کلیک‌هایی که از طریق <b>گوگل</b> باشند محاسبه می‌شوند.\n" +
    "⚠️ <b>نکته ۲:</b> در هر ساعت فقط ۵ فعالیت از هر صفحه برای شما محاسبه می‌شود.\n" +
    "⚠️ <b>نکته ۳:</b> تایم‌زون لپ‌تاپ شما باید با کشور VPN شما یکی باشد، وگرنه بازدیدها سکه نمی‌شوند.",

  /* ---------- wallet ---------- */
  WALLET_HEADER:
    "💰 <b>وضعیت کیف پول</b>\n\n" +
    "🆔 شناسه: {id}\n" +
    "📊 بازدید مجاز (Google): {pageviews}\n" +
    "💓 هارت‌بیت مجاز (Google): {heartbeats}\n",

  WALLET_BALANCE:
    "🪙 مجموع سکه: {coins}\n" +
    "💵 موجودی کل: {toman} تومان\n\n" +
    "ℹ️ <i>قانون محاسبه:</i> فقط ورودی‌های گوگل و حداکثر {maxPerHour} فعالیت از هر صفحه در هر ساعت محاسبه می‌شود.",

  WALLET_ENOUGH:  "\n\n✅ موجودی کافیست! برای برداشت روی دکمه زیر کلیک کنید.",
  WALLET_NOT_ENOUGH: "\n\n⚠️ حداقل برداشت: {min} تومان",
  NOT_REGISTERED: "لطفاً ابتدا با زدن دکمه «" + BUTTONS.RESTART + "» ثبت‌نام کنید.",

  /* ---------- profile ---------- */
  PROFILE:
    "📋 <b>اطلاعات حساب شما:</b>\n" +
    "ID: {id}\n" +
    "name: {name}\n" +
    "email: {email}\n" +
    "personal link: {link}",

  /* ---------- withdraw ---------- */
  ASK_CARD:     "لطفاً شماره کارت ۱۶ رقمی خود را وارد کنید:",
  CARD_INVALID: "❌ شماره کارت باید دقیقاً ۱۶ رقم باشد. لطفاً دوباره ارسال کنید:",
  CARD_SAVED:   "✅ درخواست شما ثبت شد. پس از بررسی حساب، مبلغ واریز خواهد شد.",

  /* ---------- menu ---------- */
  MAIN_MENU: "منوی اصلی:",

  /* =========================================================================================
   *  >>> THE TIMEZONE WARNING <<<
   *  Shown whenever the tracked timezone is Asia/Tehran (or anything else you blocked).
   *  Placeholders:
   *     {timezone}   the wrong timezone we detected, e.g. Asia/Tehran
   *     {country}    the country of their VPN IP, e.g. Italy
   *     {lostCoins}  how many coins they already lost because of this
   *     {hint}       the country-specific line built from COUNTRY_TIMEZONE_HINTS (may be empty)
   * ======================================================================================= */
  TIMEZONE_WARNING:
    "⚠️ <b>WARNING — YOUR TIMEZONE IS WRONG</b>\n\n" +
    "Your laptop timezone is <code>{timezone}</code>, so your visits do <b>NOT</b> count as coins.\n" +
    "You should change your timezone according to the country you have in your VPN.\n\n" +
    "🇮🇷 <b>هشدار:</b> تایم‌زون لپ‌تاپ شما روی <code>{timezone}</code> است و به همین دلیل " +
    "بازدیدهای شما تبدیل به سکه <b>نمی‌شود</b>.\n" +
    "باید تایم‌زون لپ‌تاپ خود را از تنظیمات ویندوز تغییر دهید و همان کشوری را انتخاب کنید " +
    "که VPN شما به آن وصل است.\n" +
    "{hint}\n" +
    "🛠 <b>How to change it / روش تغییر:</b>\n" +
    "Windows: Settings → Time &amp; Language → Date &amp; Time → turn OFF “Set time zone automatically” → pick the correct time zone.\n" +
    "Mac: System Settings → General → Date &amp; Time → turn OFF “Set time zone automatically”.\n" +
    "سپس مرورگر را کامل ببندید و دوباره با لینک اختصاصی خود وارد سایت شوید.\n",

  // Extra line appended when we know their VPN country (built from COUNTRY_TIMEZONE_HINTS).
  TIMEZONE_HINT_KNOWN:
    "{flag} Your IP is from <b>{country}</b> → choose <code>{timezone}</code> ({offset}). " +
    "هر شهری با همین اختلاف ساعت هم قابل قبول است.\n",

  // Used when the country is not in COUNTRY_TIMEZONE_HINTS.
  TIMEZONE_HINT_UNKNOWN:
    "🌍 Your IP country is <b>{country}</b> — choose any city in that country's time zone.\n",

  // Appended when the user already lost coins because of the wrong timezone.
  TIMEZONE_LOST_COINS:
    "\n💸 تا این لحظه حدود <b>{lostCoins}</b> سکه به همین دلیل از دست رفته است.\n",

  /* ---------- Iranian IP (VPN is off) ---------- */
  IRAN_IP_WARNING:
    "⛔️ <b>خطا:</b> سیستم تشخیص داده که شما با IP ایران وارد سایت شده‌اید " +
    "(کشور: {country}).\n" +
    "برای دریافت سکه حتماً باید VPN شما روشن باشد و سپس دوباره وارد لینک اختصاصی خود شوید.\n"
};


/* ==========================================================================================
 * ==========================================================================================
 *  SECTION 7 — LOGIC.  You normally do NOT need to edit anything below this line.
 * ==========================================================================================
 * ========================================================================================== */


/**
 * Telegram calls this function on every incoming message (this is the webhook).
 */
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) return ContentService.createTextOutput("no data");

    var update = JSON.parse(e.postData.contents);

    // We only handle normal text messages. Photos, stickers, callbacks etc. are ignored.
    if (!update.message || !update.message.chat) return ContentService.createTextOutput("ok");

    var chatId = update.message.chat.id;
    var text   = update.message.text ? String(update.message.text).trim() : "";

    handleMessage_(chatId, text);
    return ContentService.createTextOutput("ok");

  } catch (error) {
    console.error("doPost failed: " + error);
    return ContentService.createTextOutput("error");
  }
}


/**
 * The router: decides what to do with one incoming text.
 */
function handleMessage_(chatId, text) {
  var props = PropertiesService.getScriptProperties();
  var state = props.getProperty("state_" + chatId) || "idle";

  /* ---- 1) restart / start ------------------------------------------------------------- */
  if (text === BUTTONS.RESTART || text === "/start") {
    props.setProperty("state_" + chatId, "waiting_name");
    sendMessage(chatId, TEXTS.ASK_NAME);
    return;
  }

  /* ---- 2) registration steps (these must run BEFORE the menu buttons) ----------------- */
  if (state === "waiting_name")  { registerName_(chatId, text);  return; }
  if (state === "waiting_email") { registerEmail_(chatId, text); return; }
  if (state === "waiting_card")  { saveCard_(chatId, text);      return; }

  /* ---- 3) menu buttons ---------------------------------------------------------------- */
  if (text === BUTTONS.WALLET)   { showWallet_(chatId);   return; }
  if (text === BUTTONS.PROFILE)  { showProfile_(chatId);  return; }
  if (text === BUTTONS.WITHDRAW) { startWithdraw_(chatId); return; }

  /* ---- 4) anything else: show the menu, and warn about a wrong timezone ---------------- */
  if (TZ_RULES.WARN_ON_EVERY_INTERACTION) maybeWarnAboutTimezone_(chatId);
  sendMainButtons(chatId, TEXTS.MAIN_MENU, false);
}


/* ------------------------------------------------------------------------------------------
 * REGISTRATION
 * ------------------------------------------------------------------------------------------ */

function registerName_(chatId, name) {
  var props = PropertiesService.getScriptProperties();
  props.setProperty("name_" + chatId, name);
  props.setProperty("state_" + chatId, "waiting_email");
  sendMessage(chatId, TEXTS.ASK_EMAIL);
}

function registerEmail_(chatId, email) {
  var props = PropertiesService.getScriptProperties();
  var name  = props.getProperty("name_" + chatId) || "";

  // 6-digit random id, e.g. 482913
  var id = Math.floor(100000 + Math.random() * 900000).toString();

  props.setProperty("email_" + chatId, email);
  props.setProperty("id_" + chatId, id);
  props.deleteProperty("state_" + chatId);

  sendMainButtons(chatId, fill_(TEXTS.REGISTERED, {
    id: esc_(id),
    name: esc_(name),
    email: esc_(email),
    link: esc_(buildPersonalLink_(name, id))
  }), false);
}


/* ------------------------------------------------------------------------------------------
 * WALLET
 * ------------------------------------------------------------------------------------------ */

function showWallet_(chatId) {
  var props = PropertiesService.getScriptProperties();
  var id    = props.getProperty("id_" + chatId);
  var name  = props.getProperty("name_" + chatId);

  if (!id || !name) { sendMessage(chatId, TEXTS.NOT_REGISTERED); return; }

  var stats = getStatsWithLimit(buildUid_(name, id));
  var money = computeCoins_(stats);

  var msg = fill_(TEXTS.WALLET_HEADER, {
    id: esc_(id),
    pageviews: stats.validPageviews,
    heartbeats: stats.validHeartbeats
  });

  // ---- the timezone / country warning goes right here, before the balance ----
  if (TZ_RULES.ALWAYS_SHOW_IN_WALLET) {
    var warning = buildTimezoneWarning_(stats);
    if (warning) msg += "\n" + warning + "\n";
  }

  msg += fill_(TEXTS.WALLET_BALANCE, {
    coins: money.coins,
    toman: formatNumber_(money.toman),
    maxPerHour: COIN_RULES.MAX_EVENTS_PER_PAGE_PER_HOUR
  });

  var canWithdraw = money.toman >= COIN_RULES.MIN_WITHDRAW_TOMAN;
  msg += canWithdraw
    ? TEXTS.WALLET_ENOUGH
    : fill_(TEXTS.WALLET_NOT_ENOUGH, { min: formatNumber_(COIN_RULES.MIN_WITHDRAW_TOMAN) });

  sendMainButtons(chatId, msg, canWithdraw);
}


/* ------------------------------------------------------------------------------------------
 * PROFILE
 * ------------------------------------------------------------------------------------------ */

function showProfile_(chatId) {
  var props = PropertiesService.getScriptProperties();
  var id    = props.getProperty("id_" + chatId);
  var name  = props.getProperty("name_" + chatId);
  var email = props.getProperty("email_" + chatId) || "-";

  if (!id || !name) { sendMessage(chatId, TEXTS.NOT_REGISTERED); return; }

  sendMessage(chatId, fill_(TEXTS.PROFILE, {
    id: esc_(id),
    name: esc_(name),
    email: esc_(email),
    link: esc_(buildPersonalLink_(name, id))
  }));

  if (TZ_RULES.WARN_ON_EVERY_INTERACTION) maybeWarnAboutTimezone_(chatId);
}


/* ------------------------------------------------------------------------------------------
 * WITHDRAW
 * ------------------------------------------------------------------------------------------ */

function startWithdraw_(chatId) {
  PropertiesService.getScriptProperties().setProperty("state_" + chatId, "waiting_card");
  sendMessage(chatId, TEXTS.ASK_CARD);
}

function saveCard_(chatId, text) {
  var props = PropertiesService.getScriptProperties();
  var digits = String(text).replace(/\D/g, "");   // keep only numbers, so "1234-5678" also works

  // Card must be exactly 16 digits. Change 16 here if you want another length.
  if (digits.length !== 16) { sendMessage(chatId, TEXTS.CARD_INVALID); return; }

  props.deleteProperty("state_" + chatId);
  props.setProperty("card_" + chatId, digits);   // saved so you can look it up later
  sendMessage(chatId, TEXTS.CARD_SAVED);
}


/* ==========================================================================================
 * SECTION 8 — READING THE SHEET AND COUNTING COINS
 * ========================================================================================== */

/**
 * Reads one user's tab and returns everything we know about them.
 *
 * @param {string} uid  e.g. "sara482913"  (lowercase name without spaces + id)
 * @return {Object} stats
 */
function getStatsWithLimit(uid) {
  var stats = {
    validPageviews: 0,       // pageviews that earn coins
    validHeartbeats: 0,      // heartbeats that earn coins
    blockedPageviews: 0,     // would have earned coins, rejected for timezone/country
    blockedHeartbeats: 0,
    hasIranIP: false,        // at least one visit came from an Iranian IP
    hasBlockedTZ: false,     // at least one visit had a blocked timezone (Asia/Tehran)
    lastCountry: "",         // country of the most recent visit
    lastCity: "",
    lastTimezone: "",        // timezone of the most recent visit
    lastVisitAt: null,       // Date of the most recent visit
    lastBlockedAt: null,     // Date of the most recent BLOCKED visit
    lastGoodCountry: "",     // country of the most recent visit that was NOT from Iran
    totalRows: 0
  };

  var counter = {};   // hour+page+event -> how many we already counted this hour

  try {
    var sheetId = getSetting_("SHEET_ID", SETTINGS.SHEET_ID_FALLBACK);
    var sheet   = SpreadsheetApp.openById(sheetId)
                                .getSheetByName(SETTINGS.USER_TAB_PREFIX + uid);
    if (!sheet || sheet.getLastRow() < 2) return stats;

    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {           // row 0 is the header
      var row = data[i];
      if (!row[COL.TIMESTAMP]) continue;

      var when      = new Date(row[COL.TIMESTAMP]);
      var eventType = String(row[COL.EVENT]    || "").toLowerCase();
      var page      = String(row[COL.PAGE]     || "").toLowerCase();
      var referrer  = String(row[COL.REFERRER] || "").toLowerCase();
      var country   = String(row[COL.COUNTRY]  || "");
      var timezone  = String(row[COL.TIMEZONE] || "");

      stats.totalRows++;

      // ---- remember the newest values -------------------------------------------------
      if (!stats.lastVisitAt || when > stats.lastVisitAt) {
        stats.lastVisitAt  = when;
        stats.lastCountry  = country;
        stats.lastCity     = String(row[COL.CITY] || "");
        stats.lastTimezone = timezone;
      }

      // ---- the two checks -------------------------------------------------------------
      var badTimezone = isBlockedTimezone_(timezone);
      var badCountry  = isBlockedCountry_(country);

      if (badTimezone) stats.hasBlockedTZ = true;
      if (badCountry)  stats.hasIranIP    = true;
      if (!badCountry && country) stats.lastGoodCountry = country;   // the VPN country

      // ---- would this row have counted if the timezone were right? --------------------
      var wouldCount = passesNormalFilters_(referrer, page);

      if (badTimezone || badCountry) {
        if (!stats.lastBlockedAt || when > stats.lastBlockedAt) stats.lastBlockedAt = when;
        if (wouldCount) {
          if (eventType === "pageview")  stats.blockedPageviews++;
          if (eventType === "heartbeat") stats.blockedHeartbeats++;
        }
        continue;   // <-- NO COINS for Tehran timezone or Iranian IP
      }

      if (!wouldCount) continue;

      // ---- anti-spam: max N events per page per event-type per hour --------------------
      var key = hourKey_(when) + "_" + page + "_" + eventType;
      counter[key] = counter[key] || 0;
      if (counter[key] >= COIN_RULES.MAX_EVENTS_PER_PAGE_PER_HOUR) continue;
      counter[key]++;

      if (eventType === "pageview")  stats.validPageviews++;
      if (eventType === "heartbeat") stats.validHeartbeats++;
    }
  } catch (err) {
    console.error("getStatsWithLimit(" + uid + ") failed: " + err);
  }

  return stats;
}

/** Referrer + target-page filters, shared by valid and blocked counting. */
function passesNormalFilters_(referrer, page) {
  if (COIN_RULES.REQUIRED_REFERRER &&
      referrer.indexOf(COIN_RULES.REQUIRED_REFERRER) === -1) return false;

  return COIN_RULES.TARGET_PAGES.some(function (target) {
    return page.indexOf(target) !== -1;
  });
}

/** Turns valid events into coins and Toman. */
function computeCoins_(stats) {
  var coins = Math.floor(stats.validPageviews  / COIN_RULES.PAGEVIEWS_PER_COIN) +
              Math.floor(stats.validHeartbeats / COIN_RULES.HEARTBEATS_PER_COIN);
  return { coins: coins, toman: coins * COIN_RULES.TOMAN_PER_COIN };
}

/** How many coins the user lost because of a blocked timezone / country. */
function computeLostCoins_(stats) {
  return Math.floor(stats.blockedPageviews  / COIN_RULES.PAGEVIEWS_PER_COIN) +
         Math.floor(stats.blockedHeartbeats / COIN_RULES.HEARTBEATS_PER_COIN);
}


/* ==========================================================================================
 * SECTION 9 — THE TIMEZONE WARNING ITSELF
 * ========================================================================================== */

/** true when the timezone string is one we reject (e.g. Asia/Tehran). */
function isBlockedTimezone_(timezone) {
  var tz = String(timezone || "").trim().toLowerCase();
  if (!tz) return false;

  if (TZ_RULES.BLOCKED_TIMEZONES.indexOf(tz) !== -1) return true;

  return TZ_RULES.BLOCKED_TIMEZONE_KEYWORDS.some(function (word) {
    return word && tz.indexOf(word) !== -1;
  });
}

/** true when the IP country is one we reject (e.g. Iran). */
function isBlockedCountry_(country) {
  var c = String(country || "").trim().toLowerCase();
  if (!c) return false;

  return TZ_RULES.BLOCKED_COUNTRIES.some(function (blocked) {
    return blocked && c.indexOf(blocked) !== -1;
  });
}

/**
 * Builds the warning text for one user.
 * Returns "" when everything is fine, so you can simply do: if (warning) send it.
 */
function buildTimezoneWarning_(stats) {
  // Case A — VPN is off entirely: the IP itself is Iranian.
  if (stats.hasIranIP && !stats.hasBlockedTZ) {
    return fill_(TEXTS.IRAN_IP_WARNING, { country: esc_(stats.lastCountry || "Iran") });
  }

  // Case B — the laptop timezone is Asia/Tehran. THIS is the message you asked for.
  if (stats.hasBlockedTZ) {
    var country = stats.lastGoodCountry || stats.lastCountry || "";
    var hint    = buildCountryHint_(country);

    var message = fill_(TEXTS.TIMEZONE_WARNING, {
      timezone: esc_(stats.lastTimezone || TZ_RULES.BLOCKED_TIMEZONES[0]),
      country:  esc_(country),
      hint:     hint
    });

    var lost = computeLostCoins_(stats);
    if (lost > 0) message += fill_(TEXTS.TIMEZONE_LOST_COINS, { lostCoins: lost });

    // VPN off AND wrong timezone: mention both problems.
    if (stats.hasIranIP) {
      message += "\n" + fill_(TEXTS.IRAN_IP_WARNING, { country: esc_(stats.lastCountry) });
    }
    return message;
  }

  return "";   // nothing wrong
}

/** The "your IP is from Italy -> pick Europe/Rome" line. */
function buildCountryHint_(country) {
  if (!country) return "";

  var hint = COUNTRY_TIMEZONE_HINTS[String(country).trim().toLowerCase()];
  if (!hint) return fill_(TEXTS.TIMEZONE_HINT_UNKNOWN, { country: esc_(country) });

  return fill_(TEXTS.TIMEZONE_HINT_KNOWN, {
    flag:     hint.flag,
    country:  esc_(country),
    timezone: esc_(hint.timezone),
    offset:   esc_(hint.offset)
  });
}

/**
 * Sends the warning as its own message, respecting TZ_RULES.WARN_COOLDOWN_MINUTES.
 * Used on normal bot interactions and by the hourly trigger.
 *
 * @param {number|string} chatId
 * @param {boolean} ignoreCooldown  true = send even if we warned a minute ago
 * @return {boolean} true if a warning was actually sent
 */
function maybeWarnAboutTimezone_(chatId, ignoreCooldown) {
  var props = PropertiesService.getScriptProperties();
  var id    = props.getProperty("id_" + chatId);
  var name  = props.getProperty("name_" + chatId);
  if (!id || !name) return false;               // not registered yet -> nothing to check

  var stats   = getStatsWithLimit(buildUid_(name, id));
  var warning = buildTimezoneWarning_(stats);
  if (!warning) return false;                   // timezone is fine

  if (!ignoreCooldown && !cooldownPassed_(chatId)) return false;

  sendMessage(chatId, warning);
  props.setProperty("tzwarn_" + chatId, String(Date.now()));
  return true;
}

/** true when enough minutes passed since the last automatic warning for this chat. */
function cooldownPassed_(chatId) {
  if (TZ_RULES.WARN_COOLDOWN_MINUTES <= 0) return true;

  var last = Number(PropertiesService.getScriptProperties()
                                    .getProperty("tzwarn_" + chatId) || 0);
  return (Date.now() - last) >= TZ_RULES.WARN_COOLDOWN_MINUTES * 60 * 1000;
}


/* ==========================================================================================
 * SECTION 10 — AUTOMATIC HOURLY CHECK (optional but recommended)
 * ------------------------------------------------------------------------------------------
 * Warns Tehran-timezone users even when they never open the bot.
 * Run installTimezoneCheckTrigger() ONCE from the editor to switch it on.
 * ========================================================================================== */

function notifyBlockedTimezoneUsers() {
  var props   = PropertiesService.getScriptProperties();
  var allKeys = props.getKeys();
  var warned  = 0;

  for (var i = 0; i < allKeys.length; i++) {
    if (allKeys[i].indexOf("id_") !== 0) continue;     // we only want the "id_<chatId>" keys
    var chatId = allKeys[i].substring(3);

    try {
      var name = props.getProperty("name_" + chatId);
      if (!name) continue;

      var stats = getStatsWithLimit(buildUid_(name, props.getProperty(allKeys[i])));
      if (!buildTimezoneWarning_(stats)) continue;     // nothing wrong for this user

      // Only bother users who were actually active recently.
      if (TZ_RULES.RECENT_ACTIVITY_HOURS > 0) {
        if (!stats.lastBlockedAt) continue;
        var ageHours = (Date.now() - stats.lastBlockedAt.getTime()) / 3600000;
        if (ageHours > TZ_RULES.RECENT_ACTIVITY_HOURS) continue;
      }

      if (maybeWarnAboutTimezone_(chatId)) warned++;
    } catch (err) {
      console.error("timezone check failed for chat " + chatId + ": " + err);
    }
  }

  console.log("Timezone check finished. Users warned: " + warned);
  return warned;
}

/** Run once: creates the hourly trigger. Change `everyHours(1)` to any interval you like. */
function installTimezoneCheckTrigger() {
  removeTimezoneCheckTrigger();      // avoid duplicates
  ScriptApp.newTrigger("notifyBlockedTimezoneUsers").timeBased().everyHours(1).create();
  console.log("Hourly timezone check installed.");
}

/** Run once: removes the hourly trigger. */
function removeTimezoneCheckTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (trigger) {
    if (trigger.getHandlerFunction() === "notifyBlockedTimezoneUsers") {
      ScriptApp.deleteTrigger(trigger);
    }
  });
}


/* ==========================================================================================
 * SECTION 11 — TELEGRAM HELPERS
 * ========================================================================================== */

/** Sends a plain message. */
function sendMessage(chatId, text) {
  callTelegram_("sendMessage", { chat_id: chatId, text: text, parse_mode: SETTINGS.PARSE_MODE });
}

/** Sends a message together with the keyboard. showWithdraw adds the withdraw button. */
function sendMainButtons(chatId, text, showWithdraw) {
  var keyboard = [
    [{ text: BUTTONS.RESTART }, { text: BUTTONS.WALLET }],
    [{ text: BUTTONS.PROFILE }]
  ];
  if (showWithdraw) keyboard.push([{ text: BUTTONS.WITHDRAW }]);

  callTelegram_("sendMessage", {
    chat_id: chatId,
    text: text,
    parse_mode: SETTINGS.PARSE_MODE,
    reply_markup: { keyboard: keyboard, resize_keyboard: true }
  });
}

/**
 * One place for every Telegram API call.
 * If Telegram rejects our formatting we resend the same text as plain text, so a user
 * with a strange name can never make the bot go silent.
 */
function callTelegram_(method, payload) {
  var token = getSetting_("TELEGRAM_TOKEN", SETTINGS.TELEGRAM_TOKEN_FALLBACK);
  if (!token) { console.error("No TELEGRAM_TOKEN set."); return null; }

  var url = "https://api.telegram.org/bot" + token + "/" + method;
  var options = {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify(payload),
    muteHttpExceptions: true       // so we can read the error instead of crashing
  };

  var response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() === 200) return response;

  console.error("Telegram error (" + method + "): " + response.getContentText());

  // Retry once without formatting — this rescues "can't parse entities" errors.
  if (payload.parse_mode) {
    var retry = JSON.parse(JSON.stringify(payload));
    delete retry.parse_mode;
    retry.text = stripTags_(retry.text || "");
    options.payload = JSON.stringify(retry);
    return UrlFetchApp.fetch(url, options);
  }
  return response;
}


/* ==========================================================================================
 * SECTION 12 — SMALL HELPERS
 * ========================================================================================== */

/** Reads a Script Property, falling back to the constant in SECTION 1. */
function getSetting_(propertyName, fallback) {
  return PropertiesService.getScriptProperties().getProperty(propertyName) || fallback || "";
}

/** "Sara Ahmadi" + "482913"  ->  "saraahmadi482913" (must match the uid used on the site). */
function buildUid_(name, id) {
  return String(name).toLowerCase().replace(/\s+/g, "") + String(id);
}

/** Builds the personal tracking link for a user. */
function buildPersonalLink_(name, id) {
  return SETTINGS.SITE_BASE_URL + "?uid=" + encodeURIComponent(buildUid_(name, id));
}

/** Replaces {placeholders} in a template with real values. */
function fill_(template, values) {
  return String(template).replace(/\{(\w+)\}/g, function (whole, key) {
    return values.hasOwnProperty(key) ? String(values[key]) : whole;
  });
}

/** Escapes text that goes inside HTML formatting (user names, emails, countries). */
function esc_(value) {
  return String(value === null || value === undefined ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Removes HTML tags, used by the plain-text retry in callTelegram_. */
function stripTags_(text) {
  return String(text).replace(/<[^>]+>/g, "")
                     .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">");
}

/** 300000 -> "300,000" */
function formatNumber_(number) {
  return String(Math.round(number)).replace(/\B(?=(\d{3})+(?!\d))/g, SETTINGS.THOUSANDS_SEPARATOR);
}

/** Groups a date into an hour bucket, e.g. "2026-08-28-14". */
function hourKey_(date) {
  return Utilities.formatDate(date, SETTINGS.SCRIPT_TIMEZONE, "yyyy-MM-dd-HH");
}


/* ==========================================================================================
 * SECTION 13 — RUN THESE MANUALLY FROM THE EDITOR
 * ========================================================================================== */

/** Connects Telegram to this web app. Run once after every new deployment. */
function setWebhook() {
  var token = getSetting_("TELEGRAM_TOKEN", SETTINGS.TELEGRAM_TOKEN_FALLBACK);
  var url   = getSetting_("WEB_APP_URL",    SETTINGS.WEB_APP_URL_FALLBACK);
  var res = UrlFetchApp.fetch(
    "https://api.telegram.org/bot" + token + "/setWebhook?url=" + encodeURIComponent(url),
    { muteHttpExceptions: true });
  console.log(res.getContentText());
}

/** Disconnects the bot (useful while testing). */
function deleteWebhook() {
  var token = getSetting_("TELEGRAM_TOKEN", SETTINGS.TELEGRAM_TOKEN_FALLBACK);
  console.log(UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/deleteWebhook",
    { muteHttpExceptions: true }).getContentText());
}

/** Shows whether Telegram can reach the web app (look for "last_error_message"). */
function getWebhookInfo() {
  var token = getSetting_("TELEGRAM_TOKEN", SETTINGS.TELEGRAM_TOKEN_FALLBACK);
  console.log(UrlFetchApp.fetch("https://api.telegram.org/bot" + token + "/getWebhookInfo",
    { muteHttpExceptions: true }).getContentText());
}

/**
 * TEST HELPER — put a real chat id here and run it to see the warning yourself,
 * without waiting for the hourly trigger.
 */
function testTimezoneWarning() {
  var CHAT_ID_TO_TEST = 123456789;              // <-- change this to your own chat id
  var sent = maybeWarnAboutTimezone_(CHAT_ID_TO_TEST, true);
  console.log(sent ? "Warning sent." : "No warning needed for this user.");
}

/**
 * TEST HELPER — prints what the bot sees for one uid, so you can check why a user
 * is (or is not) getting the warning.
 */
function debugUser() {
  var UID_TO_TEST = "yourname123456";           // <-- change this
  console.log(JSON.stringify(getStatsWithLimit(UID_TO_TEST), null, 2));
}
