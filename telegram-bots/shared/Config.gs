/**
 * ============================================================
 *  Config.gs  —  این فایل باید در «هر دو» پروژه (ربات کاربر و ربات ادمین)
 *  دقیقاً یکسان باشد.
 * ============================================================
 *
 *  مقادیر زیر را با اطلاعات خودتان پر کنید.
 *  (اختیاری و امن‌تر) می‌توانید هر کدام از این کلیدها را در
 *  Project Settings → Script Properties با همین نام ذخیره کنید؛
 *  در آن صورت مقدار Script Properties بر مقدار این فایل اولویت دارد
 *  و دیگر لازم نیست توکن داخل کد باشد.
 */
var CONFIG = {
  SHEET_ID: "PUT_YOUR_SPREADSHEET_ID_HERE",
  USER_BOT_TOKEN: "PUT_USER_BOT_TOKEN_HERE",
  ADMIN_BOT_TOKEN: "PUT_ADMIN_BOT_TOKEN_HERE",

  // منطقه زمانی ثابت برای محاسبه سقف ساعتی (در هر دو پروژه یکسان می‌ماند)
  TIMEZONE: "Asia/Tehran",

  // قوانین سکه (فقط اینجا عوض کنید تا هر دو ربات یکسان حساب کنند)
  COIN_VALUE_TOMAN: 5000,
  MIN_WITHDRAW_TOMAN: 300000,
  PAGEVIEWS_PER_COIN: 20,
  HEARTBEATS_PER_COIN: 15,
  HOURLY_LIMIT_PER_PAGE: 5,

  SITE_URL: "https://www.impedyme.com/",

  // ویدیوهای راهنما
  MOBILE_VIDEO_LINK: "https://drive.google.com/file/d/1j5E1EQpSxzMeFqqel631ynWrAUId-hSz/view?usp=drive_link",
  DESKTOP_VIDEO_LINK: "https://drive.google.com/file/d/1g19HjjOOZhgtjedNc987dP20h8_iLwYX/view?usp=drive_link",

  // شناسه‌های تلگرام ادمین‌ها (اختیاری). اگر خالی باشد و در شیت Settings هم
  // چیزی ثبت نشده باشد، اولین نفری که به ربات ادمین /start بدهد ادمین می‌شود.
  ADMIN_IDS: ""
};

function cfg_(key) {
  try {
    var v = PropertiesService.getScriptProperties().getProperty(key);
    if (v !== null && v !== "") return v;
  } catch (e) {}
  return CONFIG[key];
}
