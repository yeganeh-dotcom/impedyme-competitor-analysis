/**
 * Code.gs — ربات پاداش لینکدین (نسخه به‌روزشده)
 *
 * تغییرات نسبت به نسخه قبلی:
 *  • توکن‌ها از Script Properties خوانده می‌شوند، نه از داخل کد.
 *  • دستور /tz برای هماهنگ‌سازی ساعت با کشور VPN اضافه شد.
 *  • باگ ثبت‌نام تکراری برطرف شد.
 *  • answerCallbackQuery اضافه شد تا دکمه‌ها قفل نشوند.
 */

// ۱. تنظیمات — مقادیر را در:
//    Extensions ← Apps Script ← Project Settings ← Script Properties وارد کنید
//    کلیدها: BOT_TOKEN ، WEB_APP_URL ، OPENAI_API_KEY ، ADMIN_ID
const PROPS = PropertiesService.getScriptProperties();
const BOT_TOKEN = PROPS.getProperty("BOT_TOKEN");
const WEB_APP_URL = PROPS.getProperty("WEB_APP_URL");
const OPENAI_API_KEY = PROPS.getProperty("OPENAI_API_KEY") || "";
const ADMIN_ID = Number(PROPS.getProperty("ADMIN_ID") || 0);

const SS = SpreadsheetApp.getActiveSpreadsheet();

// شیت‌ها با تابع گرفته می‌شوند تا اگر شیت نبود، خطای واضح بدهد
function sheet_(name) {
  const sh = SS.getSheetByName(name);
  if (!sh) throw new Error("شیت «" + name + "» پیدا نشد. آن را بسازید.");
  return sh;
}
const sheetUsers = sheet_("Users");
const sheetPosts = sheet_("Posts");
const sheetReqs = sheet_("Requests");

// ستون‌های شیت Users:
// A=chatId  B=name  C=linkedin  D=status  E=points
// F=countryCode  G=expectedTimezone  H=reportedTimezone  I=lastTimezoneCheck

// تابع اصلی دریافت پیام از تلگرام
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.message) {
      handleMessage(data.message);
    } else if (data.callback_query) {
      handleCallback(data.callback_query);
    }
  } catch (err) {
    console.error("doPost error: " + err.stack);
  }
}

// مدیریت پیام‌های متنی
function handleMessage(msg) {
  const chatId = msg.chat.id;
  const text = (msg.text || "").trim();

  // نتیجه‌ای که Mini App برمی‌گرداند (بررسی ساعت دستگاه)
  if (msg.web_app_data) {
    handleWebAppData(msg);
    return;
  }

  const user = getUser(chatId);

  if (text === "/start") {
    sendText(chatId, "سلام! به ربات پاداش لینکدین خوش آمدید. 🚀\n" +
                     "لطفاً لینک پروفایل لینکدین خود را بفرستید:");
    return;
  }

  // دستور ساعت: /tz آلمان  یا  /tz Germany  یا  /tz DE
  if (text === "/tz" || text.indexOf("/tz ") === 0) {
    handleTimezoneCommand(chatId, text.substring(3).trim());
    return;
  }

  // ثبت‌نام فقط برای کاربری که هنوز در شیت نیست
  // (قبلاً شرط status === "awaiting_linkedin" باعث می‌شد کاربر
  //  با هر پیام یک ردیف تکراری بسازد)
  if (!user) {
    if (text.indexOf("linkedin.com/in/") !== -1) {
      saveUser(chatId, msg.from.first_name, text);
      sendText(chatId, "✅ لینک شما ثبت شد و منتظر تایید ادمین است.");
      sendAdminNotification(chatId, "👤 کاربر جدید ثبت‌نام کرد:\n" +
                                    "نام: " + msg.from.first_name + "\nلینک: " + text);
    } else {
      sendText(chatId, "❌ لطفاً یک لینک معتبر لینکدین بفرستید (شامل linkedin.com/in/ باشد).");
    }
    return;
  }

  if (user.status === "awaiting_linkedin") {
    sendText(chatId, "⏳ ثبت‌نام شما در انتظار تایید ادمین است.");
    return;
  }

  // پنل ادمین
  if (chatId === ADMIN_ID && text === "/admin") {
    sendText(chatId, "🛠 به پنل مدیریت خوش آمدید.");
  }
}

// بخش هوش مصنوعی: تولید کامنت خودکار
function generateAIComment(postTitle) {
  if (!OPENAI_API_KEY) return "Great post! Thanks for sharing.";

  const prompt = 'Write a short, professional LinkedIn comment in English for a post titled: "' +
                 postTitle + '". Human-like, no emojis.';
  const options = {
    method: "post",
    headers: { "Authorization": "Bearer " + OPENAI_API_KEY, "Content-Type": "application/json" },
    payload: JSON.stringify({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }]
    }),
    muteHttpExceptions: true
  };

  try {
    const response = UrlFetchApp.fetch("https://api.openai.com/v1/chat/completions", options);
    const result = JSON.parse(response.getContentText());
    return result.choices[0].message.content;
  } catch (e) {
    return "Excellent insights, very helpful!";
  }
}

// مدیریت دکمه‌های شیشه‌ای
function handleCallback(query) {
  const data = query.data;

  // بدون این، چرخ‌دنده روی دکمه تلگرام تا ۳۰ ثانیه می‌چرخد
  answerCallbackQuery(query.id);

  if (data.indexOf("approve_user_") === 0) {
    const userId = data.substring("approve_user_".length);
    updateUserStatus(userId, "approved");
    sendText(userId, "✅ عضویت شما تایید شد! حالا می‌توانید فعالیت کنید.\n\n" +
                     "اگر از VPN استفاده می‌کنید، ساعت دستگاهتان را هم با همان کشور " +
                     "هماهنگ کنید: /tz به همراه نام کشور، مثلاً `/tz آلمان`");
    sendText(ADMIN_ID, "کاربر " + userId + " تایید شد.");
  }
}

// توابع کمکی ارتباط با تلگرام
function sendText(chatId, text, keyboard) {
  const payload = {
    chat_id: String(chatId),
    text: text,
    parse_mode: "Markdown"
  };
  // اگر کلید را null بگذاریم، Apps Script رشته "null" می‌فرستد
  if (keyboard) payload.reply_markup = JSON.stringify(keyboard);
  return telegramCall_("sendMessage", payload);
}

function answerCallbackQuery(callbackQueryId) {
  return telegramCall_("answerCallbackQuery", { callback_query_id: callbackQueryId });
}

function telegramCall_(method, payload) {
  const url = "https://api.telegram.org/bot" + BOT_TOKEN + "/" + method;
  const res = UrlFetchApp.fetch(url, {
    method: "post",
    payload: payload,
    muteHttpExceptions: true   // بدون این، خطاهای تلگرام بی‌صدا رد می‌شوند
  });
  if (res.getResponseCode() !== 200) {
    console.error("Telegram " + method + " failed: " + res.getContentText());
  }
  return res;
}

function sendAdminNotification(userId, info) {
  const keyboard = {
    inline_keyboard: [
      [{ text: "✅ تایید عضویت", callback_data: "approve_user_" + userId }]
    ]
  };
  sendText(ADMIN_ID, info, keyboard);
}

// توابع دیتابیس (گوگل شیت)
function getUser(chatId) {
  const data = sheetUsers.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == chatId) {
      return {
        row: i + 1,
        id: data[i][0],
        name: data[i][1],
        linkedin: data[i][2],
        status: data[i][3],
        points: data[i][4],
        country: data[i][5],
        timezone: data[i][6]
      };
    }
  }
  return null;
}

function saveUser(id, name, li) {
  sheetUsers.appendRow([id, name, li, "awaiting_linkedin", 0, "", "", "", ""]);
}

function updateUserStatus(id, status) {
  const data = sheetUsers.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheetUsers.getRange(i + 1, 4).setValue(status);
      break;
    }
  }
}
