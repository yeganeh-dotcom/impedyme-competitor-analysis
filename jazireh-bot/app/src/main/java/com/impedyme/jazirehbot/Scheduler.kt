package com.impedyme.jazirehbot

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

object Scheduler {
    private const val REQ = 42

    private fun tickIntent(ctx: Context): PendingIntent = PendingIntent.getBroadcast(
        ctx, REQ, Intent(ctx, AlarmReceiver::class.java).setAction(AlarmReceiver.ACTION_TICK),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    private fun showIntent(ctx: Context): PendingIntent = PendingIntent.getActivity(
        ctx, 0, Intent(ctx, MainActivity::class.java),
        PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
    )

    fun exactAllowed(ctx: Context): Boolean {
        val am = ctx.getSystemService(AlarmManager::class.java)
        return Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms()
    }

    fun scheduleNext(ctx: Context, delayMs: Long) {
        val am = ctx.getSystemService(AlarmManager::class.java)
        val at = System.currentTimeMillis() + delayMs
        val pi = tickIntent(ctx)
        var how = "alarm-clock"
        try {
            if (exactAllowed(ctx)) {
                am.setAlarmClock(AlarmManager.AlarmClockInfo(at, showIntent(ctx)), pi)
            } else {
                how = "inexact (exact alarms not allowed)"
                am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
            }
        } catch (e: SecurityException) {
            how = "inexact (security exception)"
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
        }
        Prefs(ctx).nextRunAt = at
        RunLog.i("Next run scheduled for ${fmt(at)} [$how]")
    }

    /** Called when the service connects or the device boots: make sure a tick is pending. */
    fun ensureScheduled(ctx: Context) {
        val p = Prefs(ctx)
        if (!p.enabled) return
        val next = p.nextRunAt
        if (next <= System.currentTimeMillis() + 2_000) {
            scheduleNext(ctx, 20_000)
        } else {
            // Re-arm the same time; alarms do not survive force-stop / reinstall.
            scheduleNext(ctx, next - System.currentTimeMillis())
        }
    }

    fun cancel(ctx: Context) {
        try { ctx.getSystemService(AlarmManager::class.java).cancel(tickIntent(ctx)) } catch (_: Exception) {}
        Prefs(ctx).nextRunAt = 0L
        RunLog.i("Schedule cancelled")
    }

    fun fmt(t: Long): String = if (t <= 0) "-" else SimpleDateFormat("HH:mm:ss", Locale.US).format(Date(t))
}
