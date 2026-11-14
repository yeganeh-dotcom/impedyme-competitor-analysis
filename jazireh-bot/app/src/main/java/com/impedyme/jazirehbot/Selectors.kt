package com.impedyme.jazirehbot

import android.content.Context
import org.json.JSONArray
import org.json.JSONObject

/**
 * Every UI label / view id the bot looks for lives here, so it can be tuned on the phone
 * (Advanced > Selectors JSON) without rebuilding the app when Jazireh or Instagram change.
 * Keys are flattened as "group.name"; values are lists of candidate strings.
 */
object Selectors {
    val DEFAULT_JSON: String = """
{
  "jazireh": {
    "challengesTab": ["چالش‌ها", "چالش ها"],
    "currentChallengesHeader": ["چالش‌های جاری"],
    "instagramTab": ["اینستاگرام"],
    "startChallenge": ["شروع چالش"],
    "sourcePageLabel": ["پیج مبدأ", "پیج مبدا"],
    "guideHeader": ["راهنمای انجام چالش", "راهنما"],
    "doChallenge": ["انجام چالش"],
    "done": ["انجام شد"],
    "addScreenshot": ["افزودن اسکرین‌شات", "افزودن اسکرین شات", "انتخاب اسکرین‌شات", "آپلود اسکرین‌شات", "بارگذاری اسکرین‌شات"],
    "screenshotAttachedTexts": ["تغییر اسکرین‌شات", "حذف اسکرین‌شات", "ویرایش اسکرین‌شات", "اسکرین‌شات انتخاب شد"],
    "closeDialog": ["بستن", "Close"],
    "confirmTexts": ["بله", "تایید", "تأیید", "ادامه"],
    "errorTexts": ["خطا", "ناموفق", "اسکرین‌شات را انتخاب کنید", "لطفا اسکرین‌شات", "لطفاً اسکرین‌شات"],
    "progressPattern": ["انجام ?شده با (\\d+) از (\\d+)"],
    "remainingPattern": ["باقی ?مانده:? ?(\\d+)"],
    "rewardPattern": ["پاداش"],
    "ignoreTexts": ["جزیره", "ثبت سفارش", "درآمد تقریبی", "نصب اپلیکیشن", "یوتیوب", "اکانت‌ها", "روند", "پروفایل"]
  },
  "ig": {
    "profileTabIds": ["profile_tab"],
    "profileTabDesc": ["Profile", "پروفایل", "نمایه"],
    "titleIds": ["action_bar_title", "action_bar_large_title", "action_bar_large_title_auto_size", "action_bar_textview_title"],
    "likeIds": ["row_feed_button_like", "like_button"],
    "likeDesc": ["Like", "پسندیدن", "لایک"],
    "unlikeDesc": ["Unlike", "Liked", "برداشتن پسند", "لایک شده", "پسندیده شده"],
    "mediaIds": ["row_feed_photo_imageview", "zoomable_view_container", "carousel_media_group", "clips_video_container", "row_feed_media_container"],
    "followIds": ["profile_header_follow_button", "follow_button", "row_feed_follow_button"],
    "followText": ["Follow", "Follow Back", "دنبال کردن", "دنبال کردن متقابل", "فالو"],
    "followingText": ["Following", "Requested", "دنبال می‌کنید", "درخواست داده شده", "درخواست شده"],
    "commentIds": ["row_feed_button_comment", "comment_button"],
    "commentDesc": ["Comment", "نظر", "کامنت", "افزودن نظر"],
    "commentInputIds": ["layout_comment_thread_edittext", "comment_edittext", "comment_composer_edittext"],
    "commentInputHint": ["Add a comment", "افزودن نظر", "نظر بدهید", "نظر خود را", "نظری بنویسید"],
    "postCommentIds": ["layout_comment_thread_post_button_click_area", "layout_comment_thread_post_button", "post_button", "comment_composer_post_button"],
    "postCommentText": ["Post", "ارسال", "انتشار"],
    "repostIds": ["repost_button", "row_feed_button_repost"],
    "repostDesc": ["Repost", "بازنشر", "ری‌پست"],
    "repostConfirmTexts": ["Repost", "بازنشر"],
    "shareIds": ["row_feed_button_share", "share_button", "direct_share_button"],
    "shareDesc": ["Share", "Send post", "Share post", "اشتراک‌گذاری", "ارسال پست", "ارسال"],
    "addToStoryText": ["Add to story", "Add post to your story", "Add reel to your story", "افزودن به استوری", "افزودن پست به استوری"],
    "storyShareIds": ["share_button_text", "share_to_story_button", "story_share_button", "sticker_tray_share_button"],
    "storyShareText": ["Your story", "Share", "Add to story", "Share to story", "استوری شما", "اشتراک‌گذاری"],
    "storyShareConfirm": ["Share", "Done", "اشتراک‌گذاری", "تمام"],
    "saveIds": ["row_feed_button_save", "save_button"],
    "saveDesc": ["Save", "ذخیره"],
    "savedDesc": ["Saved", "Remove", "ذخیره شده"],
    "dismissTexts": ["Not now", "Not Now", "بعداً", "بعدا", "حالا نه", "اکنون نه", "Cancel", "لغو", "Skip", "رد شدن", "Maybe later", "Close", "بستن", "OK", "Dismiss"],
    "blockedTexts": ["Try Again Later", "Action Blocked", "We limit how often", "We restrict certain activity", "Suspicious Login", "بعداً دوباره امتحان کنید", "فعالیت شما محدود", "مسدود شد"]
  },
  "picker": {
    "allowTexts": ["Allow", "Allow all", "Allow access", "Allow limited access", "While using the app", "اجازه دادن", "مجاز", "اجازه", "هنگام استفاده از برنامه"],
    "confirmTexts": ["Done", "Add", "Select", "Open", "OK", "Use", "Confirm", "Upload", "تایید", "تأیید", "انجام شد", "افزودن", "انتخاب", "باز کردن", "استفاده", "تمام"],
    "imagesTabTexts": ["Photos", "Images", "Screenshots", "Recent", "تصاویر", "عکس‌ها", "اسکرین‌شات", "اخیر"],
    "cameraTexts": ["Camera", "Take photo", "دوربین", "عکس گرفتن", "گرفتن عکس"],
    "chooserTexts": ["Open with", "Complete action using", "Choose an app", "Select an app", "باز کردن با", "انتخاب برنامه", "تکمیل عملیات با"],
    "galleryAppTexts": ["Gallery", "Photos", "گالری", "عکس‌ها"],
    "onceTexts": ["Just once", "Once", "فقط یک بار", "فقط یک‌بار", "فقط این بار"]
  },
  "browser": {
    "packages": ["com.android.chrome", "com.sec.android.app.sbrowser", "org.mozilla.firefox", "com.brave.browser", "com.opera.browser", "com.microsoft.emmx", "com.android.browser"],
    "urlBarIds": ["com.android.chrome:id/url_bar", "com.sec.android.app.sbrowser:id/location_bar_edit_text", "org.mozilla.firefox:id/mozac_browser_toolbar_url_view", "com.brave.browser:id/url_bar"],
    "openInAppTexts": ["Open Instagram", "Open in app", "Open app", "Open the app", "باز کردن در برنامه", "باز کردن برنامه"]
  },
  "resolver": {
    "packages": ["android", "com.android.intentresolver", "com.samsung.android.app.resolver"],
    "instagramLabel": ["Instagram", "اینستاگرام"]
  }
}
"""

    private val defaults: Map<String, List<String>> = parse(DEFAULT_JSON)
    @Volatile private var current: Map<String, List<String>> = defaults

    fun load(ctx: Context) {
        val custom = Prefs(ctx).selectorsJson
        current = if (custom.isNullOrBlank()) defaults else try {
            defaults + parse(custom)
        } catch (e: Exception) {
            RunLog.e("Custom selectors JSON is invalid – using defaults", e)
            defaults
        }
    }

    fun get(key: String): List<String> = current[key] ?: defaults[key] ?: emptyList()
    fun str(key: String): String = get(key).firstOrNull() ?: ""

    fun defaultsPretty(): String = JSONObject(DEFAULT_JSON).toString(2)

    /** Throws if the JSON is not valid. */
    fun validate(json: String) { parse(json) }

    fun parse(json: String): Map<String, List<String>> {
        val out = LinkedHashMap<String, List<String>>()
        val root = JSONObject(json)
        for (group in root.keys()) {
            val obj = root.optJSONObject(group)
            if (obj == null) {
                out[group] = toList(root.get(group))
                continue
            }
            for (name in obj.keys()) out["$group.$name"] = toList(obj.get(name))
        }
        return out
    }

    private fun toList(v: Any?): List<String> = when (v) {
        null -> emptyList()
        is JSONArray -> (0 until v.length()).map { v.optString(it) }.filter { it.isNotEmpty() }
        else -> listOf(v.toString())
    }
}
