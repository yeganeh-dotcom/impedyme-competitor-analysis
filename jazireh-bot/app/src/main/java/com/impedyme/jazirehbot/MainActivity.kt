package com.impedyme.jazirehbot

import android.Manifest
import android.app.Activity
import android.app.AlertDialog
import android.app.KeyguardManager
import android.content.ClipData
import android.content.ClipboardManager
import android.content.ContentValues
import android.content.Intent
import android.graphics.Typeface
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.MediaStore
import android.provider.Settings
import android.text.InputType
import android.util.TypedValue
import android.view.Gravity
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.CheckBox
import android.widget.EditText
import android.widget.LinearLayout
import android.widget.ScrollView
import android.widget.Switch
import android.widget.TextView
import android.widget.Toast
import com.impedyme.jazirehbot.bot.BotService
import java.io.File
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/** Single settings/status screen. Built in code so the app needs no AndroidX. */
class MainActivity : Activity() {

    private lateinit var prefs: Prefs
    private lateinit var content: LinearLayout
    private lateinit var statusView: TextView
    private lateinit var logView: TextView
    private lateinit var scheduleSwitch: Switch
    private lateinit var intervalEdit: EditText
    private lateinit var accountsEdit: EditText
    private lateinit var commentsEdit: EditText
    private lateinit var jazirehView: TextView
    private lateinit var instagramEdit: EditText
    private lateinit var folderEdit: EditText
    private lateinit var delayEdit: EditText
    private lateinit var maxItemsEdit: EditText
    private lateinit var maxMinutesEdit: EditText
    private lateinit var goHomeCheck: CheckBox
    private lateinit var ledgerCheck: CheckBox
    private lateinit var selectorsEdit: EditText
    private var suppressSwitch = false
    private val logListener: () -> Unit = { refreshLog() }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        prefs = Prefs(this)
        if (prefs.jazirehPackage == null) AppFinder.findJazireh(this)?.let { prefs.jazirehPackage = it }
        setContentView(buildUi())
        loadFields()
        if (Build.VERSION.SDK_INT >= 33 && !Notifications.canPost(this)) {
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 1)
        }
    }

    override fun onResume() {
        super.onResume()
        refreshStatus()
        refreshLog()
        RunLog.addListener(logListener)
    }

    override fun onPause() {
        RunLog.removeListener(logListener)
        super.onPause()
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        refreshStatus()
    }

    // ---------------- UI construction ----------------

    private fun dp(v: Int): Int =
        TypedValue.applyDimension(TypedValue.COMPLEX_UNIT_DIP, v.toFloat(), resources.displayMetrics).toInt()

    private fun buildUi(): View {
        content = LinearLayout(this).apply {
            orientation = LinearLayout.VERTICAL
            setPadding(dp(16), dp(12), dp(16), dp(48))
        }
        add(heading("Jazireh Bot", 22f))
        add(para("Runs Jazireh Instagram challenges automatically with your own Instagram accounts. " +
            "Fill in the settings, grant the permissions, then switch the schedule on. " +
            "The phone must stay on and unlocked while it works."))

        add(heading("1. Status & permissions"))
        statusView = mono("")
        add(statusView)
        add(row(
            button("Accessibility") { startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)) },
            button("Exact alarms") { openExactAlarmSettings() },
        ))
        add(row(
            button("Battery") { openBatterySettings() },
            button("Notifications") { openNotificationSettings() },
        ))

        add(heading("2. Settings"))
        add(label("Jazireh app"))
        jazirehView = para("")
        add(jazirehView)
        add(row(button("Pick Jazireh app") { pickJazirehApp() }))
        intervalEdit = addField("Run every N minutes", number = true)
        accountsEdit = addField("Instagram accounts – one per line, exactly as Jazireh shows them under «پیج مبدأ»", multiline = true)
        commentsEdit = addField("Comment texts – one per line (random pick unless the challenge quotes a comment)", multiline = true)
        instagramEdit = addField("Instagram package name")
        folderEdit = addField("Screenshot folder (inside internal storage)")
        delayEdit = addField("Pause between actions (ms)", number = true)
        maxItemsEdit = addField("Max challenges per run", number = true)
        maxMinutesEdit = addField("Max minutes per run", number = true)
        goHomeCheck = CheckBox(this).apply { text = "Go to the home screen after each run" }
        add(goHomeCheck)
        ledgerCheck = CheckBox(this).apply { text = "Skip challenge + account pairs already submitted today" }
        add(ledgerCheck)
        add(row(button("Save settings") { saveFields() }))

        add(heading("3. Run"))
        scheduleSwitch = Switch(this).apply {
            text = "Schedule ON – run every N minutes"
            setOnCheckedChangeListener { _, checked -> if (!suppressSwitch) onScheduleToggled(checked) }
        }
        add(scheduleSwitch)
        add(row(
            button("Run now") { runNow() },
            button("Stop run") { BotService.instance?.requestStop(); toast("Stop requested") },
        ))
        add(row(
            button("Inspect screen in 8 s") { inspect() },
            button("Reset today's ledger") { prefs.ledgerClear(); refreshStatus(); toast("Ledger cleared") },
        ))

        add(heading("4. Advanced – selectors"))
        add(para("Texts and view ids the bot looks for. Change them only if Jazireh or Instagram renamed something. " +
            "Keys are \"group.name\"; every value is a list of accepted texts."))
        selectorsEdit = field("Selectors JSON", multiline = true).apply {
            typeface = Typeface.MONOSPACE
            textSize = 11f
            minLines = 6
            maxLines = 18
            isVerticalScrollBarEnabled = true
        }
        add(selectorsEdit)
        add(row(
            button("Save selectors") { saveSelectors() },
            button("Reset to defaults") {
                prefs.selectorsJson = null
                Selectors.load(this)
                selectorsEdit.setText(Selectors.defaultsPretty())
                toast("Selectors reset")
            },
        ))

        add(heading("5. Log"))
        add(row(
            button("Copy") { copyLog() },
            button("Export to Downloads") { exportLog() },
            button("Clear") { RunLog.clear() },
        ))
        logView = mono("")
        add(logView)

        return ScrollView(this).apply {
            isFillViewport = true
            addView(content)
        }
    }

    private fun add(v: View) = content.addView(v)

    private fun heading(t: String, size: Float = 17f): TextView = TextView(this).apply {
        text = t
        textSize = size
        setTypeface(null, Typeface.BOLD)
        setPadding(0, dp(18), 0, dp(6))
    }

    private fun para(t: String): TextView = TextView(this).apply {
        text = t
        textSize = 13f
        setPadding(0, dp(2), 0, dp(6))
    }

    private fun label(t: String): TextView = TextView(this).apply {
        text = t
        textSize = 12f
        setPadding(0, dp(8), 0, 0)
    }

    private fun mono(t: String): TextView = TextView(this).apply {
        text = t
        typeface = Typeface.MONOSPACE
        textSize = 11f
        setTextIsSelectable(true)
        setPadding(0, dp(4), 0, dp(4))
    }

    private fun field(hint: String, number: Boolean = false, multiline: Boolean = false): EditText = EditText(this).apply {
        this.hint = hint
        textSize = 14f
        inputType = when {
            number -> InputType.TYPE_CLASS_NUMBER
            multiline -> InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_MULTI_LINE or InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS
            else -> InputType.TYPE_CLASS_TEXT or InputType.TYPE_TEXT_FLAG_NO_SUGGESTIONS
        }
        if (multiline) {
            isSingleLine = false
            minLines = 3
            gravity = Gravity.TOP or Gravity.START
        } else {
            isSingleLine = true
        }
        layoutParams = LinearLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.WRAP_CONTENT)
    }

    private fun addField(labelText: String, number: Boolean = false, multiline: Boolean = false): EditText {
        add(label(labelText))
        val e = field(labelText, number, multiline)
        add(e)
        return e
    }

    private fun button(t: String, onClick: () -> Unit): Button = Button(this).apply {
        text = t
        isAllCaps = false
        textSize = 13f
        setOnClickListener { onClick() }
    }

    private fun row(vararg views: View): LinearLayout = LinearLayout(this).apply {
        orientation = LinearLayout.HORIZONTAL
        for (v in views) {
            addView(v, LinearLayout.LayoutParams(0, ViewGroup.LayoutParams.WRAP_CONTENT, 1f).apply { marginEnd = dp(6) })
        }
    }

    // ---------------- settings ----------------

    private fun loadFields() {
        intervalEdit.setText(prefs.intervalMin.toString())
        accountsEdit.setText(prefs.accounts.joinToString("\n"))
        commentsEdit.setText(prefs.comments.joinToString("\n"))
        instagramEdit.setText(prefs.instagramPackage)
        folderEdit.setText(prefs.screenshotFolder)
        delayEdit.setText(prefs.humanDelayMs.toString())
        maxItemsEdit.setText(prefs.maxItemsPerRun.toString())
        maxMinutesEdit.setText(prefs.maxRunMinutes.toString())
        goHomeCheck.isChecked = prefs.goHomeAfterRun
        ledgerCheck.isChecked = prefs.useLedger
        selectorsEdit.setText(prefs.selectorsJson ?: Selectors.defaultsPretty())
        suppressSwitch = true
        scheduleSwitch.isChecked = prefs.enabled
        suppressSwitch = false
        jazirehView.text = AppFinder.label(this, prefs.jazirehPackage)
    }

    private fun persistFields() {
        prefs.intervalMin = intervalEdit.text.toString().trim().toIntOrNull() ?: 10
        prefs.accounts = accountsEdit.text.toString().split('\n')
        prefs.comments = commentsEdit.text.toString().split('\n')
        prefs.instagramPackage = instagramEdit.text.toString().ifBlank { Prefs.DEFAULT_INSTAGRAM }
        prefs.screenshotFolder = folderEdit.text.toString().ifBlank { "DCIM/Screenshots" }
        prefs.humanDelayMs = delayEdit.text.toString().trim().toLongOrNull() ?: 1200L
        prefs.maxItemsPerRun = maxItemsEdit.text.toString().trim().toIntOrNull() ?: 20
        prefs.maxRunMinutes = maxMinutesEdit.text.toString().trim().toIntOrNull() ?: 9
        prefs.goHomeAfterRun = goHomeCheck.isChecked
        prefs.useLedger = ledgerCheck.isChecked
    }

    private fun saveFields() {
        persistFields()
        loadFields()
        if (prefs.enabled) Scheduler.scheduleNext(this, prefs.intervalMin * 60_000L)
        refreshStatus()
        toast("Settings saved")
    }

    private fun saveSelectors() {
        val json = selectorsEdit.text.toString()
        try {
            Selectors.validate(json)
        } catch (e: Exception) {
            toast("Invalid JSON: ${e.message}")
            return
        }
        prefs.selectorsJson = json
        Selectors.load(this)
        toast("Selectors saved")
    }

    private fun onScheduleToggled(on: Boolean) {
        if (on) {
            persistFields()
            val problem = when {
                prefs.jazirehPackage == null -> "Pick the Jazireh app first"
                prefs.accounts.isEmpty() -> "Add at least one Instagram account first"
                else -> null
            }
            if (problem != null) {
                toast(problem)
                suppressSwitch = true
                scheduleSwitch.isChecked = false
                suppressSwitch = false
                return
            }
            prefs.enabled = true
            Scheduler.scheduleNext(this, 15_000)
            if (BotService.instance == null) {
                toast("Schedule is on, but the accessibility service is OFF – enable it or nothing will run")
            } else {
                toast("Schedule on – first run in 15 seconds, then every ${prefs.intervalMin} min")
            }
            Notifications.showStatus(this, "Scheduled every ${prefs.intervalMin} min – first run in 15 s")
        } else {
            prefs.enabled = false
            Scheduler.cancel(this)
            Notifications.showStatus(this, "Schedule off")
        }
        refreshStatus()
    }

    // ---------------- actions ----------------

    private fun runNow() {
        persistFields()
        val svc = BotService.instance
        if (svc == null) {
            toast("Enable the accessibility service first")
            startActivity(Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS))
            return
        }
        if (svc.requestRun("manual")) toast("Run started – the bot takes over the screen now") else toast("A run is already in progress")
    }

    private fun inspect() {
        val svc = BotService.instance
        if (svc == null) {
            toast("Enable the accessibility service first")
            return
        }
        svc.requestInspect(8_000)
        toast("Open the screen you want to inspect within 8 seconds")
        moveTaskToBack(true)
    }

    private fun pickJazirehApp() {
        val apps = AppFinder.launchable(this)
        if (apps.isEmpty()) {
            toast("Could not list installed apps")
            return
        }
        val labels = apps.map { "${it.label}\n${it.pkg}" }.toTypedArray()
        AlertDialog.Builder(this)
            .setTitle("Which app is Jazireh (جزیره)?")
            .setItems(labels) { _, which ->
                prefs.jazirehPackage = apps[which].pkg
                refreshStatus()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun openExactAlarmSettings() {
        if (Build.VERSION.SDK_INT < 31) {
            toast("Not needed on this Android version")
            return
        }
        try {
            startActivity(Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:$packageName")))
        } catch (e: Exception) {
            toast("Not available: ${e.message}")
        }
    }

    private fun openBatterySettings() {
        try {
            startActivity(Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:$packageName")))
        } catch (e: Exception) {
            try { startActivity(Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS)) } catch (_: Exception) { toast("Not available") }
        }
    }

    private fun openNotificationSettings() {
        if (Build.VERSION.SDK_INT >= 33 && !Notifications.canPost(this)) {
            requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 1)
            return
        }
        try {
            startActivity(Intent(Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(Settings.EXTRA_APP_PACKAGE, packageName))
        } catch (e: Exception) {
            toast("Not available")
        }
    }

    private fun copyLog() {
        val cm = getSystemService(ClipboardManager::class.java)
        cm.setPrimaryClip(ClipData.newPlainText("Jazireh Bot log", RunLog.text()))
        toast("Log copied")
    }

    private fun exportLog() {
        val sb = StringBuilder(RunLog.text())
        val dump = File(filesDir, "ui-dump.txt")
        if (dump.exists()) {
            sb.append("\n\n===== last UI dump =====\n")
            try { sb.append(dump.readText()) } catch (_: Exception) {}
        }
        val name = "jazireh-bot-log-${SimpleDateFormat("yyyyMMdd-HHmmss", Locale.US).format(Date())}.txt"
        val values = ContentValues().apply {
            put(MediaStore.Downloads.DISPLAY_NAME, name)
            put(MediaStore.Downloads.MIME_TYPE, "text/plain")
            put(MediaStore.Downloads.RELATIVE_PATH, "Download/JazirehBot")
        }
        try {
            val uri = contentResolver.insert(MediaStore.Downloads.EXTERNAL_CONTENT_URI, values)
                ?: throw IllegalStateException("insert returned null")
            contentResolver.openOutputStream(uri)?.use { it.write(sb.toString().toByteArray()) }
            toast("Saved to Download/JazirehBot/$name")
        } catch (e: Exception) {
            toast("Export failed: ${e.message}")
        }
    }

    // ---------------- status ----------------

    private fun refreshStatus() {
        val svc = BotService.instance
        val svcEnabled = BotService.isEnabledInSettings(this)
        val pm = getSystemService(PowerManager::class.java)
        val km = getSystemService(KeyguardManager::class.java)
        val sb = StringBuilder()
        sb.append("Accessibility service: ").append(
            when {
                svc != null -> "ON ✔"
                svcEnabled -> "enabled but not connected – toggle it off and on"
                else -> "OFF ✖  → tap Accessibility"
            }
        ).append('\n')
        sb.append("Schedule: ").append(
            if (prefs.enabled) "ON, every ${prefs.intervalMin} min, next ${Scheduler.fmt(prefs.nextRunAt)}" else "OFF"
        ).append('\n')
        sb.append("Last run: ").append(
            if (prefs.lastRunAt > 0) "${Scheduler.fmt(prefs.lastRunAt)} – ${prefs.lastSummary}" else "never"
        ).append('\n')
        sb.append("Bot state: ").append(svc?.state ?: "-").append('\n')
        sb.append("Exact alarms: ").append(if (Scheduler.exactAllowed(this)) "allowed ✔" else "NOT allowed ✖ → tap Exact alarms").append('\n')
        sb.append("Battery optimisation: ").append(
            if (pm.isIgnoringBatteryOptimizations(packageName)) "off ✔" else "ON ✖ → tap Battery"
        ).append('\n')
        sb.append("Notifications: ").append(if (Notifications.canPost(this)) "allowed ✔" else "blocked ✖").append('\n')
        sb.append("Screen lock: ").append(
            if (km.isKeyguardSecure) "PIN/pattern ✖ – the bot cannot unlock; use None or Swipe" else "none/swipe ✔"
        ).append('\n')
        sb.append("Instagram: ").append(
            if (AppFinder.isInstalled(this, prefs.instagramPackage)) "installed ✔" else "${prefs.instagramPackage} NOT installed ✖"
        ).append('\n')
        val jz = prefs.jazirehPackage
        sb.append("Jazireh: ").append(
            when {
                jz == null -> "not set ✖ → Pick Jazireh app"
                AppFinder.isInstalled(this, jz) -> "found ✔"
                else -> "$jz NOT installed ✖"
            }
        ).append('\n')
        sb.append("Accounts: ").append(prefs.accounts.size).append("    Submitted today: ").append(prefs.ledgerSize())
        statusView.text = sb.toString()
        jazirehView.text = AppFinder.label(this, jz)
    }

    private fun refreshLog() {
        logView.text = RunLog.text().lines().takeLast(250).joinToString("\n")
    }

    private fun toast(msg: String) = Toast.makeText(this, msg, Toast.LENGTH_LONG).show()
}
