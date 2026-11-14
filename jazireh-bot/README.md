# Jazireh Bot – ربات جزیره

An Android app that performs **Jazireh (جزیره) Instagram challenges** automatically with your own
Instagram accounts, every N minutes (default 10):

1. opens Jazireh → «چالش‌ها» → «اینستاگرام»
2. for every challenge card and every one of your accounts:
   «شروع چالش» → choose «پیج مبدأ» → read the guide → switch Instagram to that account →
   «انجام چالش» → like / follow / comment / repost / save → take a screenshot →
   back to Jazireh → «افزودن اسکرین‌شات» → pick the screenshot → «انجام شد»
3. goes back to the home screen and waits for the next tick.

It is built on Android's **Accessibility Service** (it reads the screen and taps for you), so it
works on an unrooted phone. There is a built-in log, a screen inspector and an editable list of
UI texts ("selectors") so it can be tuned on the phone when Jazireh or Instagram change their UI.

> **Before you use it**
> * Instagram's terms forbid automated likes, follows and comments. Accounts that automate can get
>   "Try again later" blocks or be restricted. The bot stops a run when it sees such a message, keeps
>   human-like pauses, and only does what Jazireh offers, but the risk is yours.
> * Jazireh may consider bot-submitted challenges a violation of its own rules.
> * Keep the volume modest: a few accounts, the default 10-minute cadence.

---

## 1. Get the APK

The APK is built by GitHub Actions on every push that touches `jazireh-bot/`:

* **Easiest:** open the repository's **Releases** page on the phone → release **"Jazireh Bot – latest build"**
  (tag `jazireh-bot-latest`) → download `jazireh-bot.apk` → install (allow installs from your browser when asked).
* Or: **Actions → "Jazireh Bot – build APK"** → latest run → artifact `jazireh-bot-apk` (a zip containing the APK).
* Or build it yourself: open the `jazireh-bot/` folder in Android Studio, or run
  `./gradlew :app:assembleRelease` inside `jazireh-bot/` (needs JDK 17 and the Android SDK).

Every build is signed with the same local key (`keystore/jazireh-bot.jks`, used only for sideloading),
so a newer APK installs over the old one and keeps your settings.

Requirements: **Android 11 or newer** (the screenshot API needs it), the normal Instagram app
(`com.instagram.android`) and Jazireh installed.

## 2. Set up the phone (once)

Open **Jazireh Bot** and work through the status list at the top until everything shows ✔:

| Button / step | What to do | Why |
|---|---|---|
| **Accessibility** | Settings → Accessibility → *Installed apps / Downloaded apps* → **Jazireh Bot** → On → Allow | This is what lets the bot see and tap the screen |
| **Exact alarms** | Allow | Makes the 10-minute schedule fire on time even in sleep mode |
| **Battery** | Allow / "Unrestricted" | Stops Android from killing the bot |
| **Notifications** | Allow | The ongoing notification shows the state and has *Run now / Stop / Pause* buttons |
| **Pick Jazireh app** | Only if it was not detected automatically | The bot needs Jazireh's package name to launch it |
| Phone → Settings → **Lock screen → None or Swipe** | Required | An accessibility service **cannot** enter a PIN/pattern. The bot turns the screen on by itself but cannot unlock a secure lock screen |
| Phone → Settings → Display → **Screen timeout** → 10 min or more | Recommended | The bot keeps the screen on during a run; between runs the phone may sleep |
| Keep the phone **plugged in** | Recommended | Runs happen every 10 minutes all day |
| Instagram → log in to **every account** you list | Required | The bot switches accounts through Instagram's own account switcher; it never types passwords |
| Jazireh → **اکانت‌ها** → register the same pages | Required | The «پیج مبدأ» list only offers pages registered in Jazireh |
| Android → Apps → Instagram → **Open by default → Open supported links** = allowed | Recommended | Makes «انجام چالش» open straight in Instagram. If a browser opens instead, the bot reads the URL and hands it to Instagram, but that is slower |

## 3. Settings in the app

* **Run every N minutes** – default 10.
* **Instagram accounts** – one username per line, written exactly as Jazireh shows them under «پیج مبدأ»
  (for example `ala.karimi1375`). Every challenge is done once per account.
* **Comment texts** – one per line; one is picked at random for comment challenges, unless the challenge's
  guide text quotes a specific comment in «…» or "…", in which case that text is used.
* **Screenshot folder** – where screenshots are saved so the gallery picker shows them first (default `DCIM/Screenshots`).
* **Pause between actions**, **Max challenges per run**, **Max minutes per run** – safety limits. A run always ends
  before the next tick.
* **Skip pairs already submitted today** – the bot remembers `day + challenge + account` so it does not redo a
  challenge the same day. *Reset today's ledger* clears that memory.

Press **Save settings**, then **Run now** while you watch the phone. When one full cycle works, switch
**Schedule ON**.

## 4. What a run looks like in the log

```
================ run start (schedule) ================
Challenge cards: 'ری پست' 0/1 left=9 پاداش: ۳۰۰ تومان type=REPOST ; 'لایک پست' 0/1 left=15 پاداش: ۴۰۰ تومان type=LIKE
---- 'ری پست' (REPOST) with @ala.karimi1375 ----
Source page already @ala.karimi1375
Guide: راهنمای انجام چالش ...
Instagram active account: ala.karimi1375
Shared to story ✔
Screenshot saved: content://media/external/images/media/1234
Image picker opened: com.google.android.providers.media.module
Tapping newest image tile: ImageView '...' [12,300-350,640] clickable
Back in Jazireh after picking the image
✔ Submitted 'ری پست' for @ala.karimi1375
```

Lines starting with `✖` are items that failed; the bot closes the dialog and continues with the next one.
After three failures in a row it stops the run. Use **Export to Downloads** to save the log
(plus the last screen dump) to `Download/JazirehBot/` so you can share it.

## 5. When something does not match – tuning the selectors

Every text and view id the bot looks for is in **Advanced → Selectors JSON** (keys like
`jazireh.done`, `ig.likeDesc`, `picker.confirmTexts`). Matching ignores spaces, نیم‌فاصله, Arabic/Persian
letter variants and digits, so `چالش‌ها` and `چالش ها` are the same.

To find the right text or id:

1. Tap **Inspect screen in 8 s**, switch to the screen in question (the Jazireh dialog, the image picker, an
   Instagram post…), wait.
2. **Export to Downloads** – the file ends with the UI dump: one line per element with class, `#id`, text,
   bounds and flags such as `clickable`/`editable`.
3. Add the text or id you see to the matching list in the Selectors JSON, **Save selectors**, run again.

Typical places that need a look on a new phone:

| Step | Key(s) | Notes |
|---|---|---|
| Choosing the source page | `jazireh.sourcePageLabel` | The bot clicks the first clickable/editable element below the «پیج مبدأ» label and then the row with the account name |
| The card title / counters | `jazireh.progressPattern`, `jazireh.remainingPattern` | Regular expressions on the normalised text «انجام‌شده با ۰ از ۱ پیج • باقی‌مانده ۹» |
| Gallery picker | `picker.*` | The bot taps the first (newest) tile in the top row, then any *Done/Add/Select/تایید* button. Albums are handled by tapping again |
| Instagram buttons | `ig.*` | Ids like `row_feed_button_like` change between Instagram versions; descriptions (`Like`, `پسندیدن`) usually survive |
| Browser instead of Instagram | `browser.urlBarIds` | Add your browser's URL bar id if the handoff fails |

## 6. Troubleshooting

| Symptom / log line | Fix |
|---|---|
| `Tick: accessibility service is OFF` | Turn the service on again (Android disables it after some updates or a force-stop) |
| `Screen is locked – the bot needs an unlocked screen` | Set the lock screen to None/Swipe |
| `Nothing opened after «انجام چالش»` | Open a challenge manually and see where the link goes; if it opens inside Jazireh's own browser the bot cannot follow it |
| `@… is not offered as «پیج مبدأ»` | Register that page in Jazireh → اکانت‌ها, or fix the spelling in *Instagram accounts* |
| `@… is not in Instagram's account switcher` | Log into that account inside Instagram |
| `Instagram is limiting this account` | Instagram blocked the action. Stop for several hours; lower the number of accounts or raise the pause |
| `Could not pick the screenshot in the image picker` | Inspect the picker screen and extend `picker.confirmTexts` / `picker.imagesTabTexts` |
| `Dialog did not close after «انجام شد»` | Jazireh rejected the submission (usually the screenshot). Check the exported log and the screenshot in the gallery |
| Nothing happens at the scheduled time | Check *Exact alarms* and *Battery*; on Samsung also Settings → Battery → Background usage limits → remove Jazireh Bot from "sleeping apps" |

## 7. For developers

```
jazireh-bot/
├── app/src/main/java/com/impedyme/jazirehbot/
│   ├── MainActivity.kt        settings & status screen (built in code, no AndroidX)
│   ├── Prefs.kt               settings + daily ledger
│   ├── Selectors.kt           default UI texts/ids (JSON) + user overrides
│   ├── FaText.kt              Persian/Arabic text normalisation
│   ├── ChallengeType.kt       title → LIKE / FOLLOW / COMMENT / REPOST / SAVE / VISIT
│   ├── Scheduler.kt, AlarmReceiver.kt, BootReceiver.kt   exact-alarm schedule
│   ├── WakeActivity.kt        turns the screen on / dismisses a non-secure keyguard
│   ├── Notifications.kt, RunLog.kt, AppFinder.kt, App.kt
│   └── bot/
│       ├── BotService.kt      the AccessibilityService; owns the run coroutine
│       ├── UiDriver.kt        find / wait / click / type helpers over the accessibility tree
│       ├── Automation.kt      one run: iterate cards × accounts
│       ├── JazirehFlow.kt     everything inside Jazireh
│       ├── InstagramFlow.kt   account switch + like/follow/comment/repost/save
│       ├── PickerFlow.kt      image picker heuristics
│       ├── ScreenshotSaver.kt takeScreenshot() → MediaStore
│       └── NodeExt.kt, Errors.kt
├── app/src/main/res/          manifest resources, accessibility_service_config.xml, icons
├── keystore/jazireh-bot.jks   sideload signing key (password `jazirehbot`); not a secret
└── .github/workflows/jazireh-bot-apk.yml (repo root)  builds and publishes the APK
```

* Min SDK 30, target 34, Kotlin 2.1, AGP 8.9, only dependency `kotlinx-coroutines-android`.
* The code was written without access to the Jazireh app, so the first runs on a real phone will
  almost certainly need a few selector tweaks – that is what the inspector and the JSON are for.

---

## راهنمای سریع (فارسی)

1. فایل `jazireh-bot.apk` را از بخش **Releases** مخزن دانلود و نصب کنید.
2. برنامهٔ **Jazireh Bot** را باز کنید و دکمه‌های **Accessibility**، **Exact alarms**، **Battery** و
   **Notifications** را بزنید و اجازه بدهید. در تنظیمات دسترس‌پذیری گوشی، سرویس «Jazireh Bot» را روشن کنید.
3. قفل صفحهٔ گوشی را روی **None** یا **Swipe** بگذارید (ربات نمی‌تواند رمز/الگو وارد کند) و گوشی را به شارژ بزنید.
4. در اینستاگرام وارد **همهٔ اکانت‌ها** شوید و همان پیج‌ها را در جزیره → **اکانت‌ها** ثبت کنید.
5. در Jazireh Bot، نام اکانت‌ها را هر کدام در یک خط (دقیقاً مثل «پیج مبدأ» در جزیره) بنویسید، متن کامنت‌ها را
   وارد کنید و **Save settings** را بزنید.
6. یک بار **Run now** را بزنید و تماشا کنید. اگر همهٔ مراحل درست انجام شد، **Schedule ON** را روشن کنید؛
   ربات هر ۱۰ دقیقه چالش‌های جدید را انجام می‌دهد.
7. اگر جایی گیر کرد: **Inspect screen in 8 s** را بزنید، به همان صفحه بروید، بعد **Export to Downloads** را
   بزنید و فایل لاگ را بفرستید تا متن‌های «Selectors» اصلاح شود.
