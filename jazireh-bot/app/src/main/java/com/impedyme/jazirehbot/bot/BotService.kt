package com.impedyme.jazirehbot.bot

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.PowerManager
import android.provider.Settings
import android.view.accessibility.AccessibilityEvent
import com.impedyme.jazirehbot.Notifications
import com.impedyme.jazirehbot.Prefs
import com.impedyme.jazirehbot.RunLog
import com.impedyme.jazirehbot.Scheduler
import com.impedyme.jazirehbot.Selectors
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.TimeoutCancellationException
import kotlinx.coroutines.cancel
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import kotlinx.coroutines.withTimeout
import java.io.File

class BotService : AccessibilityService() {

    companion object {
        @Volatile var instance: BotService? = null

        fun isEnabledInSettings(ctx: Context): Boolean {
            val cn = ComponentName(ctx, BotService::class.java)
            val enabled = Settings.Secure.getString(
                ctx.contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: return false
            return enabled.split(':').any {
                it.equals(cn.flattenToString(), true) || it.equals(cn.flattenToShortString(), true)
            }
        }
    }

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private var runJob: Job? = null
    lateinit var ui: UiDriver
        private set

    @Volatile var lastEventPackage: String? = null
    @Volatile var state: String = "idle"

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        ui = UiDriver(this)
        try {
            val info = serviceInfo ?: AccessibilityServiceInfo()
            info.eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or AccessibilityEvent.TYPE_WINDOW_CONTENT_CHANGED
            info.flags = info.flags or
                AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or
                AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS or
                AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS
            info.notificationTimeout = 100
            serviceInfo = info
        } catch (e: Exception) {
            RunLog.w("Could not update serviceInfo: ${e.message}")
        }
        Selectors.load(this)
        RunLog.i("Accessibility service connected")
        val p = Prefs(this)
        Notifications.showStatus(this, if (p.enabled) "Scheduled every ${p.intervalMin} min" else "Service on, schedule off")
        if (p.enabled) Scheduler.ensureScheduled(this)
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        event?.packageName?.let { lastEventPackage = it.toString() }
    }

    override fun onInterrupt() {}

    override fun onUnbind(intent: Intent?): Boolean {
        RunLog.i("Accessibility service disconnected")
        runJob?.cancel()
        instance = null
        return super.onUnbind(intent)
    }

    override fun onDestroy() {
        instance = null
        scope.cancel()
        super.onDestroy()
    }

    fun isBusy(): Boolean = runJob?.isActive == true

    fun requestRun(reason: String): Boolean {
        if (isBusy()) {
            RunLog.w("Run requested ($reason) but the previous run is still going – skipped")
            return false
        }
        runJob = scope.launch { runGuarded(reason) }
        return true
    }

    fun requestStop() {
        if (isBusy()) {
            RunLog.w("Stop requested by user")
            runJob?.cancel()
        }
    }

    @Suppress("DEPRECATION")
    private suspend fun runGuarded(reason: String) {
        val prefs = Prefs(this)
        val maxMs = minOf(prefs.maxRunMinutes, maxOf(1, prefs.intervalMin - 1)) * 60_000L
        val pm = getSystemService(PowerManager::class.java)
        val cpu = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "jazirehbot:cpu")
        val screen = pm.newWakeLock(
            PowerManager.SCREEN_BRIGHT_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP or PowerManager.ON_AFTER_RELEASE,
            "jazirehbot:screen"
        )
        cpu.setReferenceCounted(false); screen.setReferenceCounted(false)
        try { cpu.acquire(maxMs + 30_000); screen.acquire(maxMs + 30_000) } catch (e: Exception) { RunLog.w("wakelock: ${e.message}") }
        state = "running"
        Notifications.showStatus(this, "Running ($reason)…")
        val started = System.currentTimeMillis()
        var summary: String
        try {
            summary = withTimeout(maxMs) { Automation(this@BotService, ui).runOnce(reason) }
        } catch (e: TimeoutCancellationException) {
            summary = "stopped after ${maxMs / 60_000} min (time limit)"
            RunLog.e("Run exceeded its time limit and was stopped")
        } catch (e: CancellationException) {
            summary = "cancelled"
            RunLog.w("Run cancelled")
        } catch (e: RunAborted) {
            summary = "aborted: ${e.message}"
            RunLog.e("Run aborted: ${e.message}")
        } catch (e: Throwable) {
            summary = "crashed: ${e.javaClass.simpleName}"
            RunLog.e("Run crashed", e)
        } finally {
            try { if (cpu.isHeld) cpu.release() } catch (_: Exception) {}
            try { if (screen.isHeld) screen.release() } catch (_: Exception) {}
            state = "idle"
        }
        prefs.lastRunAt = started
        prefs.lastSummary = summary
        val next = if (prefs.enabled) ", next at ${Scheduler.fmt(prefs.nextRunAt)}" else ""
        Notifications.showStatus(this, "Last run: $summary$next")
    }

    /** Dumps the UI tree of whatever is on screen after [delayMs] (lets the user switch apps first). */
    fun requestInspect(delayMs: Long) {
        scope.launch {
            RunLog.i("Inspecting the screen in ${delayMs / 1000}s – open the screen you want to inspect")
            delay(delayMs)
            val dump = try { ui.dumpTree() } catch (e: Exception) { "dump failed: $e" }
            val f = File(filesDir, "ui-dump.txt")
            try { f.writeText(dump) } catch (_: Exception) {}
            RunLog.i("UI dump (${dump.length} chars, saved to ${f.name}, also exported with the log):\n$dump")
        }
    }
}
