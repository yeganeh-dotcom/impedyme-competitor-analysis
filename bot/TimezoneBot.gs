/**
 * TimezoneBot.gs - ساعت کاربر را با کشور VPN او هماهنگ می‌کند.
 *
 * نکته مهم معماری: هیچ رباتی نمی‌تواند ساعت گوشی یا کامپیوتر کاربر را
 * از راه دور عوض کند. کاری که این فایل انجام می‌دهد:
 *   ۱. کشور VPN را از کاربر می‌گیرد (نام فارسی، انگلیسی، یا کد دو حرفی).
 *   ۲. منطقه زمانی دقیق IANA آن کشور را پیدا می‌کند (۲۴۷ کشور، بدون استثنا).
 *   ۳. به کاربر می‌گوید دقیقاً چه چیزی را در تنظیمات ساعت جستجو کند.
 *   ۴. با Mini App تلگرام، منطقه زمانی واقعی دستگاه را می‌خواند و
 *      با کشور اعلام‌شده مقایسه می‌کند تا مطمئن شویم واقعاً عوض شده.
 *
 * وابسته به Timezones.gs (فایل تولیدشده: COUNTRY_TIMEZONES و COUNTRY_ALIASES).
 */

// نام‌های فارسی پرکاربرد -> کد ISO. بقیه از COUNTRY_ALIASES می‌آید.
const PERSIAN_COUNTRIES = {
  "آمریکا": "US", "امریکا": "US", "ایالات متحده": "US", "استیت": "US",
  "انگلیس": "GB", "انگلستان": "GB", "بریتانیا": "GB", "لندن": "GB",
  "آلمان": "DE", "المان": "DE", "فرانسه": "FR", "ایتالیا": "IT",
  "اسپانیا": "ES", "هلند": "NL", "بلژیک": "BE", "سوییس": "CH", "سوئیس": "CH",
  "اتریش": "AT", "سوئد": "SE", "سوند": "SE", "نروژ": "NO", "دانمارک": "DK",
  "فنلاند": "FI", "لهستان": "PL", "چک": "CZ", "مجارستان": "HU",
  "رومانی": "RO", "پرتغال": "PT", "یونان": "GR", "ایرلند": "IE",
  "کانادا": "CA", "استرالیا": "AU", "نیوزیلند": "NZ", "نیوزلند": "NZ",
  "ترکیه": "TR", "استانبول": "TR", "امارات": "AE", "دبی": "AE",
  "قطر": "QA", "کویت": "KW", "عمان": "OM", "عربستان": "SA", "بحرین": "BH",
  "ایران": "IR", "عراق": "IQ", "افغانستان": "AF", "پاکستان": "PK",
  "هند": "IN", "چین": "CN", "ژاپن": "JP", "کره جنوبی": "KR", "کره": "KR",
  "روسیه": "RU", "اوکراین": "UA", "گرجستان": "GE", "ارمنستان": "AM",
  "آذربایجان": "AZ", "قزاقستان": "KZ", "ازبکستان": "UZ",
  "مالزی": "MY", "سنگاپور": "SG", "اندونزی": "ID", "تایلند": "TH",
  "ویتنام": "VN", "فیلیپین": "PH", "برزیل": "BR", "مکزیک": "MX",
  "آرژانتین": "AR", "شیلی": "CL", "آفریقای جنوبی": "ZA", "مصر": "EG",
  "قبرس": "CY", "صربستان": "RS", "بلغارستان": "BG", "کرواسی": "HR",
  "اسلواکی": "SK", "اسلوونی": "SI", "لیتوانی": "LT", "لتونی": "LV",
  "استونی": "EE", "مولداوی": "MD", "ایسلند": "IS", "لوکزامبورگ": "LU",
  "مالت": "MT", "آلبانی": "AL", "مراکش": "MA", "تونس": "TN", "الجزایر": "DZ",
  "نیجریه": "NG", "کنیا": "KE", "هنگ کنگ": "HK", "تایوان": "TW"
};

/**
 * نرمال‌سازی متن ورودی. باید دقیقاً معادل normalize() در
 * bot/tools/generate_timezones.py باشد، وگرنه کلیدها با هم جور در نمی‌آیند.
 */
function normalizeName(text) {
  return String(text)
    .replace(/\u200c/g, " ")                    // نیم‌فاصله
    .replace(/[\u064a\u0649]/g, "\u06cc")       // ي و ى عربی -> ی فارسی
    .replace(/\u0643/g, "\u06a9")               // ك عربی -> ک فارسی
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")            // حذف اعراب و accent
    .replace(/[\.\,\-_'"()\[\]\/]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// نام‌های فارسی با کلید نرمال‌شده، یک بار در زمان بارگذاری ساخته می‌شود.
const PERSIAN_NORMALIZED = (function () {
  const map = {};
  for (const name in PERSIAN_COUNTRIES) {
    map[normalizeName(name)] = PERSIAN_COUNTRIES[name];
  }
  return map;
})();

/**
 * ورودی کاربر را به کد کشور تبدیل می‌کند.
 * نام فارسی، نام انگلیسی، کد دو حرفی، یا نام شهر اصلی را قبول می‌کند.
 */
function resolveCountry(query) {
  if (!query) return null;
  const key = normalizeName(query);
  if (!key) return null;

  if (PERSIAN_NORMALIZED[key]) return PERSIAN_NORMALIZED[key];
  if (COUNTRY_ALIASES[key]) return COUNTRY_ALIASES[key];

  // تطبیق ابتدای نام: فقط وقتی نتیجه یکتاست، تا "ir" هم ایران هم ایرلند نشود
  if (key.length >= 3) {
    const hits = [];
    for (const alias in COUNTRY_ALIASES) {
      if (alias.indexOf(key) === 0) {
        const code = COUNTRY_ALIASES[alias];
        if (hits.indexOf(code) === -1) hits.push(code);
        if (hits.length > 1) return null;
      }
    }
    if (hits.length === 1) return hits[0];
  }
  return null;
}

/** آفست فعلی منطقه زمانی بر حسب دقیقه (شامل تغییر ساعت تابستانی). */
function currentOffsetMinutes(tz) {
  // "Z" در Apps Script آفست RFC822 می‌دهد، مثلاً "+0330"
  const z = Utilities.formatDate(new Date(), tz, "Z");
  const sign = z.charAt(0) === "-" ? -1 : 1;
  return sign * (parseInt(z.substr(1, 2), 10) * 60 + parseInt(z.substr(3, 2), 10));
}

/** دقیقه -> "UTC+03:30" */
function formatOffset(minutes) {
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  const hh = Math.floor(abs / 60);
  const mm = abs % 60;
  return "UTC" + sign + (hh < 10 ? "0" : "") + hh + ":" + (mm < 10 ? "0" : "") + mm;
}

/** ساعت فعلی در آن منطقه زمانی، مثلاً "۱۴:۰۵" به صورت لاتین. */
function localTimeIn(tz) {
  return Utilities.formatDate(new Date(), tz, "HH:mm");
}

/**
 * کشورهایی که ساعتشان دقیقاً با این کشور یکی است.
 * ویندوز اینها را در یک ردیف کشویی جمع می‌کند، برای همین کاربر
 * اسم کشور خودش را پیدا نمی‌کند و فکر می‌کند کشورش نیست.
 */
function countriesSharingClock(code) {
  const me = COUNTRY_TIMEZONES[code];
  if (!me) return [];
  const out = [];
  for (const c in COUNTRY_TIMEZONES) {
    if (c === code) continue;
    const other = COUNTRY_TIMEZONES[c];
    if (other.std === me.std && other.dst === me.dst) out.push(other.city);
  }
  return out.sort();
}

/** پیام راهنمای تنظیم ساعت برای یک کشور. */
function buildTimezoneInstructions(code) {
  const info = COUNTRY_TIMEZONES[code];
  if (!info) return null;

  const offsetNow = currentOffsetMinutes(info.tz);
  const lines = [];

  lines.push("🕒 تنظیم ساعت برای: *" + info.name + "*");
  lines.push("");
  lines.push("منطقه زمانی: `" + info.tz + "`");
  lines.push("آفست فعلی: " + formatOffset(offsetNow));
  lines.push("ساعت همین الان آنجا: *" + localTimeIn(info.tz) + "*");

  if (info.dst !== null) {
    lines.push("⚠️ این کشور ساعت تابستانی دارد. اگر «تنظیم خودکار» را روشن بگذارید، خودش عوض می‌شود.");
  }
  lines.push("");

  // این بخش دقیقاً همان چیزی است که کاربر گم می‌کند
  lines.push("*چرا اسم کشور را پیدا نمی‌کنید؟*");
  lines.push("چون لیست ساعت سیستم بر اساس *شهر* است، نه کشور. دنبال این بگردید:");
  lines.push("👉 *" + info.city + "*");

  const shared = countriesSharingClock(code);
  if (shared.length) {
    const sample = shared.slice(0, 6).join("، ");
    lines.push("");
    lines.push("در ویندوز ممکن است زیر یک ردیف مشترک باشد، مثل: " + sample +
               (shared.length > 6 ? " و غیره" : ""));
  }

  if (info.zones.length > 1) {
    lines.push("");
    lines.push("ℹ️ این کشور " + info.zones.length + " منطقه زمانی دارد. مقدار بالا مربوط به " +
               "بزرگ‌ترین شهر است. اگر IP شما در منطقه دیگری است، به پشتیبانی بگویید.");
  }

  lines.push("");
  lines.push("*مسیر تنظیمات:*");
  lines.push("• اندروید: Settings ← System ← Date & time ← Time zone (اول Region را روی " +
             info.name + " بگذارید)");
  lines.push("• آیفون: Settings ← General ← Date & Time ← Time Zone ← جستجوی «" + info.city + "»");
  lines.push("• ویندوز: Settings ← Time & language ← Date & time ← Time zone");
  lines.push("• مک: System Settings ← General ← Date & Time ← Closest city");
  lines.push("");
  lines.push("مهم: گزینه «Set automatically / خودکار» را *خاموش* کنید، وگرنه سیستم دوباره برمی‌گرداند.");

  return lines.join("\n");
}

/** ثبت کشور انتخابی کاربر در شیت. */
function setUserCountry(chatId, code) {
  const info = COUNTRY_TIMEZONES[code];
  const data = sheetUsers.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == chatId) {
      sheetUsers.getRange(i + 1, 6).setValue(code);      // F: کد کشور
      sheetUsers.getRange(i + 1, 7).setValue(info.tz);   // G: منطقه زمانی انتظاری
      return true;
    }
  }
  return false;
}

/** خواندن کشور/منطقه زمانی ثبت‌شده کاربر. */
function getUserTimezone(chatId) {
  const data = sheetUsers.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == chatId) {
      return { row: i + 1, country: data[i][5], expected: data[i][6], reported: data[i][7] };
    }
  }
  return null;
}

/** دستور /tz — نقطه ورود کاربر. */
function handleTimezoneCommand(chatId, arg) {
  if (!arg) {
    sendText(chatId, "کشوری که VPN شما روی آن است را بفرستید.\n" +
                     "مثال: `/tz آلمان` یا `/tz Germany` یا `/tz DE`");
    return;
  }

  const code = resolveCountry(arg);
  if (!code) {
    sendText(chatId, "❌ کشور «" + arg + "» را پیدا نکردم.\n" +
                     "کد دو حرفی کشور را امتحان کنید، مثلاً DE برای آلمان.");
    return;
  }

  setUserCountry(chatId, code);
  sendText(chatId, buildTimezoneInstructions(code), verifyKeyboard());
}

/** دکمه‌ای که Mini App را باز می‌کند تا ساعت واقعی دستگاه خوانده شود. */
function verifyKeyboard() {
  return {
    keyboard: [[{ text: "✅ بررسی ساعت دستگاه من", web_app: { url: WEB_APP_URL } }]],
    resize_keyboard: true
  };
}

/**
 * نتیجه‌ای که Mini App برمی‌گرداند را بررسی می‌کند.
 * تلگرام این را به صورت message.web_app_data می‌فرستد.
 */
function handleWebAppData(msg) {
  const chatId = msg.chat.id;
  let payload;
  try {
    payload = JSON.parse(msg.web_app_data.data);
  } catch (err) {
    sendText(chatId, "❌ داده‌ی دریافتی نامعتبر بود. دوباره تلاش کنید.");
    return;
  }

  const record = getUserTimezone(chatId);
  if (!record || !record.expected) {
    sendText(chatId, "اول با دستور /tz کشور VPN خود را ثبت کنید.");
    return;
  }

  const deviceTz = payload.timezone || "";
  const deviceOffset = typeof payload.offset === "number" ? payload.offset : null;
  const expectedOffset = currentOffsetMinutes(record.expected);

  sheetUsers.getRange(record.row, 8).setValue(deviceTz);          // H: منطقه گزارش‌شده
  sheetUsers.getRange(record.row, 9).setValue(new Date());        // I: زمان بررسی

  // مقایسه بر اساس آفست، نه اسم منطقه: چند منطقه می‌توانند ساعت یکسان بدهند
  // (مثلاً Europe/Berlin و Europe/Paris هر دو UTC+1 هستند و هر دو درست‌اند).
  if (deviceOffset !== null && deviceOffset === expectedOffset) {
    sendText(chatId, "✅ ساعت دستگاه شما با " + COUNTRY_TIMEZONES[record.country].name +
                     " هماهنگ است (" + formatOffset(expectedOffset) + ").");
  } else {
    const shown = deviceOffset === null ? "نامشخص" : formatOffset(deviceOffset);
    sendText(chatId,
      "❌ ساعت دستگاه هنوز هماهنگ نیست.\n\n" +
      "دستگاه شما: " + shown + (deviceTz ? " (" + deviceTz + ")" : "") + "\n" +
      "باید باشد: " + formatOffset(expectedOffset) + " (" + record.expected + ")\n\n" +
      "دوباره /tz " + record.country + " را بزنید و مراحل را انجام دهید.");
  }
}

/**
 * صفحه Mini App. تلگرام این URL را باز می‌کند، صفحه منطقه زمانی واقعی
 * مرورگر را می‌خواند و با sendData به ربات برمی‌گرداند.
 */
function doGet(e) {
  return HtmlService.createHtmlOutput(
    '<!DOCTYPE html><html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1">' +
    '<script src="https://telegram.org/js/telegram-web-app.js"></script>' +
    '<style>body{font-family:system-ui,sans-serif;padding:24px;text-align:center}' +
    'code{background:#0001;padding:2px 6px;border-radius:4px}</style></head><body>' +
    '<h3>در حال خواندن ساعت دستگاه…</h3><p id="out"></p>' +
    '<script>' +
    'var tz="";try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||"";}catch(e){}' +
    // getTimezoneOffset مثبت است وقتی غرب UTC هستیم، پس علامت را برعکس می‌کنیم
    'var off=-new Date().getTimezoneOffset();' +
    'document.getElementById("out").innerHTML="<code>"+tz+"</code><br>UTC"+(off<0?"-":"+")+' +
    'String(Math.floor(Math.abs(off)/60)).padStart(2,"0")+":"+String(Math.abs(off)%60).padStart(2,"0");' +
    'if(window.Telegram&&Telegram.WebApp){Telegram.WebApp.ready();' +
    'setTimeout(function(){Telegram.WebApp.sendData(JSON.stringify({timezone:tz,offset:off}));},600);}' +
    '</script></body></html>'
  ).addMetaTag("viewport", "width=device-width, initial-scale=1");
}
