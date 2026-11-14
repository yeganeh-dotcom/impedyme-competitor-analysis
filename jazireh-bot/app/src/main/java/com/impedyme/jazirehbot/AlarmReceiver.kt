package com.impedyme.jazirehbot

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import com.impedyme.jazirehbot.bot.BotService

class AlarmReceiver : BroadcastReceiver() {
    companion object {
        const val ACTION_TICK = "com.impedyme.jazirehbot.TICK"
        const val ACTION_RUN_NOW = "com.impedyme.jazirehbot.RUN_NOW"
        const val ACTION_STOP = "com.impedyme.jazirehbot.STOP"
        const val ACTION_PAUSE = "com.impedyme.jazirehbot.PAUSE"
    }

    override fun onReceive(ctx: Context, intent: Intent) {
        val prefs = Prefs(ctx)
        when (intent.action) {
            ACTION_TICK -> {
                if (!prefs.enabled) return
                // Keep a fixed cadence no matter how long the run takes.
                Scheduler.scheduleNext(ctx, prefs.intervalMin * 60_000L)
                val svc = BotService.instance
                if (svc == null) {
                    RunLog.w("Tick: accessibility service is OFF – enable it in Settings > Accessibility")
                    Notifications.showStatus(ctx, "Accessibility service is OFF. Enable it to let the bot run.")
                    return
                }
                svc.requestRun("schedule")
            }
            ACTION_RUN_NOW -> {
                val svc = BotService.instance
                if (svc == null) RunLog.w("Run now: accessibility service is OFF") else svc.requestRun("manual")
            }
            ACTION_STOP -> BotService.instance?.requestStop()
            ACTION_PAUSE -> {
                prefs.enabled = false
                Scheduler.cancel(ctx)
                Notifications.showStatus(ctx, "Schedule paused")
            }
        }
    }
}
