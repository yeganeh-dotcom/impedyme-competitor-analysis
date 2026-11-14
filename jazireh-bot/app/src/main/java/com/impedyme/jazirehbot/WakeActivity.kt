package com.impedyme.jazirehbot

import android.app.Activity
import android.app.KeyguardManager
import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.view.WindowManager
import kotlinx.coroutines.delay
import kotlinx.coroutines.withTimeoutOrNull

/** Invisible activity that turns the screen on and dismisses a non-secure keyguard. */
class WakeActivity : Activity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setShowWhenLocked(true)
        setTurnScreenOn(true)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        val km = getSystemService(KeyguardManager::class.java)
        km.requestDismissKeyguard(this, object : KeyguardManager.KeyguardDismissCallback() {
            override fun onDismissSucceeded() { finishSoon() }
            override fun onDismissError() { finishSoon() }
            override fun onDismissCancelled() { finishSoon() }
        })
        Handler(Looper.getMainLooper()).postDelayed({ if (!isFinishing) finish() }, 3000)
    }

    private fun finishSoon() {
        Handler(Looper.getMainLooper()).postDelayed({ if (!isFinishing) finish() }, 500)
    }
}

object ScreenWaker {
    fun isUsable(ctx: Context): Boolean {
        val pm = ctx.getSystemService(PowerManager::class.java)
        val km = ctx.getSystemService(KeyguardManager::class.java)
        return pm.isInteractive && !km.isKeyguardLocked
    }

    /** Returns true when the screen is on and unlocked. */
    suspend fun ensureAwake(ctx: Context): Boolean {
        if (isUsable(ctx)) return true
        val km = ctx.getSystemService(KeyguardManager::class.java)
        RunLog.i("Screen is off or locked – waking it up")
        try {
            ctx.startActivity(
                Intent(ctx, WakeActivity::class.java).addFlags(
                    Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_NO_ANIMATION or
                        Intent.FLAG_ACTIVITY_EXCLUDE_FROM_RECENTS
                )
            )
        } catch (e: Exception) {
            RunLog.w("Cannot start WakeActivity: ${e.message}")
        }
        val ok = withTimeoutOrNull(9_000) {
            while (!isUsable(ctx)) delay(300)
            true
        } ?: false
        if (!ok) {
            if (km.isKeyguardSecure) {
                RunLog.e("The phone is locked with PIN/pattern/fingerprint. The bot cannot unlock it – remove the lock screen or keep the phone unlocked.")
            } else {
                RunLog.w("Screen still not usable after wake attempt")
            }
        }
        return ok
    }
}
