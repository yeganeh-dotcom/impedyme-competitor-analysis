package com.impedyme.jazirehbot

import android.Manifest
import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.graphics.drawable.Icon
import android.os.Build

object Notifications {
    const val CHANNEL = "status"
    const val ID = 1001

    fun ensureChannel(ctx: Context) {
        val nm = ctx.getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(
            NotificationChannel(CHANNEL, "Bot status", NotificationManager.IMPORTANCE_LOW).apply {
                description = "Shows whether the Jazireh bot is scheduled or running"
                setShowBadge(false)
            }
        )
    }

    fun canPost(ctx: Context): Boolean =
        Build.VERSION.SDK_INT < 33 ||
            ctx.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED

    fun showStatus(ctx: Context, text: String) {
        if (!canPost(ctx)) return
        val open = PendingIntent.getActivity(
            ctx, 0, Intent(ctx, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val n = Notification.Builder(ctx, CHANNEL)
            .setSmallIcon(iconRes(ctx))
            .setContentTitle("Jazireh Bot")
            .setContentText(text)
            .setStyle(Notification.BigTextStyle().bigText(text))
            .setOngoing(true)
            .setOnlyAlertOnce(true)
            .setContentIntent(open)
            .addAction(action(ctx, "Run now", AlarmReceiver.ACTION_RUN_NOW, 1))
            .addAction(action(ctx, "Stop", AlarmReceiver.ACTION_STOP, 2))
            .addAction(action(ctx, "Pause schedule", AlarmReceiver.ACTION_PAUSE, 3))
            .build()
        try {
            ctx.getSystemService(NotificationManager::class.java).notify(ID, n)
        } catch (e: Exception) {
            RunLog.w("notify failed: ${e.message}")
        }
    }

    fun cancel(ctx: Context) {
        try { ctx.getSystemService(NotificationManager::class.java).cancel(ID) } catch (_: Exception) {}
    }

    private fun action(ctx: Context, title: String, act: String, req: Int): Notification.Action {
        val pi = PendingIntent.getBroadcast(
            ctx, req, Intent(ctx, AlarmReceiver::class.java).setAction(act),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        return Notification.Action.Builder(null as Icon?, title, pi).build()
    }

    fun iconRes(ctx: Context): Int {
        val id = ctx.resources.getIdentifier("ic_bot", "drawable", ctx.packageName)
        return if (id != 0) id else android.R.drawable.ic_popup_sync
    }
}
