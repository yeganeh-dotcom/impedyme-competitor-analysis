package com.impedyme.jazirehbot.bot

import android.accessibilityservice.AccessibilityService
import android.content.ContentUris
import android.content.ContentValues
import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import android.os.SystemClock
import android.provider.MediaStore
import android.view.Display
import com.impedyme.jazirehbot.RunLog
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.coroutines.resume

object ScreenshotSaver {

    class Shot(val uri: Uri?, val displayName: String?) {
        override fun toString(): String = "${displayName ?: "?"} (${uri ?: "no uri"})"
    }

    /**
     * Takes a screenshot and stores it in the gallery. First through the accessibility API
     * (silent, saved under [folder]); if that fails, through the system screenshot action
     * (same as pressing Power + Volume down).
     */
    suspend fun capture(svc: AccessibilityService, folder: String): Shot? {
        val bmp = take(svc)
        if (bmp != null) {
            val shot = withContext(Dispatchers.IO) { save(svc, bmp, folder) }
            if (shot != null) return shot
        }
        RunLog.w("Accessibility screenshot failed – using the system screenshot instead")
        return viaSystemScreenshot(svc)
    }

    private suspend fun take(svc: AccessibilityService): Bitmap? = withTimeoutOrNull(8_000) {
        suspendCancellableCoroutine { cont ->
            try {
                svc.takeScreenshot(Display.DEFAULT_DISPLAY, svc.mainExecutor,
                    object : AccessibilityService.TakeScreenshotCallback {
                        override fun onSuccess(screenshot: AccessibilityService.ScreenshotResult) {
                            val hb = screenshot.hardwareBuffer
                            val bmp: Bitmap? = try {
                                Bitmap.wrapHardwareBuffer(hb, screenshot.colorSpace)
                                    ?.copy(Bitmap.Config.ARGB_8888, false)
                            } catch (e: Exception) {
                                RunLog.e("Screenshot bitmap conversion failed", e); null
                            } finally {
                                try { hb.close() } catch (_: Exception) {}
                            }
                            if (bmp == null) RunLog.e("Screenshot buffer could not be converted to a bitmap")
                            if (cont.isActive) cont.resume(bmp)
                        }

                        override fun onFailure(errorCode: Int) {
                            RunLog.e("takeScreenshot failed: ${errorName(errorCode)}")
                            if (cont.isActive) cont.resume(null)
                        }
                    })
            } catch (e: Exception) {
                RunLog.e("takeScreenshot threw", e)
                if (cont.isActive) cont.resume(null)
            }
        }
    }

    private fun errorName(code: Int): String = when (code) {
        1 -> "NO_ACCESSIBILITY_ACCESS (service is not allowed to take screenshots)"
        2 -> "INTERNAL_ERROR"
        3 -> "INTERVAL_TIME_SHORT (too soon after the previous one)"
        4 -> "INVALID_DISPLAY"
        5 -> "SECURE_WINDOW (an app on screen forbids screenshots)"
        else -> "error code $code"
    }

    private suspend fun viaSystemScreenshot(svc: AccessibilityService): Shot? {
        val since = System.currentTimeMillis() / 1000 - 3
        val ok = try { svc.performGlobalAction(AccessibilityService.GLOBAL_ACTION_TAKE_SCREENSHOT) } catch (e: Exception) { false }
        if (!ok) {
            RunLog.e("System screenshot action was refused")
            return null
        }
        var found: Shot? = null
        val deadline = SystemClock.uptimeMillis() + 10_000
        while (SystemClock.uptimeMillis() < deadline) {
            delay(900)
            found = withContext(Dispatchers.IO) { newestImageSince(svc, since) }
            if (found != null) break
        }
        delay(2500) // let the system's screenshot preview / toolbar go away
        if (found == null) {
            RunLog.w("System screenshot taken, but it was not found in the gallery (photo permission missing?) – continuing")
            return Shot(null, null)
        }
        RunLog.i("System screenshot saved as $found")
        return found
    }

    /** Newest image in MediaStore added after [sinceEpochSec]; needs the photo permission for other apps' images. */
    fun newestImageSince(ctx: Context, sinceEpochSec: Long): Shot? {
        val proj = arrayOf(MediaStore.Images.Media._ID, MediaStore.Images.Media.DISPLAY_NAME)
        return try {
            ctx.contentResolver.query(
                MediaStore.Images.Media.EXTERNAL_CONTENT_URI, proj,
                "${MediaStore.Images.Media.DATE_ADDED} >= ?", arrayOf(sinceEpochSec.toString()),
                "${MediaStore.Images.Media.DATE_ADDED} DESC"
            )?.use { c ->
                if (c.moveToFirst()) {
                    Shot(ContentUris.withAppendedId(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, c.getLong(0)), c.getString(1))
                } else null
            }
        } catch (e: Exception) {
            RunLog.w("MediaStore query failed: ${e.message}")
            null
        }
    }

    private fun save(ctx: Context, bmp: Bitmap, folder: String): Shot? {
        val stamp = SimpleDateFormat("yyyyMMdd_HHmmss", Locale.US).format(Date())
        val name = "Screenshot_${stamp}_jazirehbot.jpg"
        val now = System.currentTimeMillis()
        val values = ContentValues().apply {
            put(MediaStore.Images.Media.DISPLAY_NAME, name)
            put(MediaStore.Images.Media.MIME_TYPE, "image/jpeg")
            put(MediaStore.Images.Media.RELATIVE_PATH, folder)
            put(MediaStore.Images.Media.DATE_ADDED, now / 1000)
            put(MediaStore.Images.Media.DATE_TAKEN, now)
            put(MediaStore.Images.Media.IS_PENDING, 1)
        }
        val resolver = ctx.contentResolver
        val uri = try {
            resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values)
        } catch (e: Exception) {
            RunLog.e("MediaStore insert failed", e); null
        } ?: run {
            RunLog.e("MediaStore insert returned null for folder '$folder'")
            return null
        }
        try {
            resolver.openOutputStream(uri)?.use { bmp.compress(Bitmap.CompressFormat.JPEG, 90, it) }
                ?: throw IllegalStateException("openOutputStream returned null")
            values.clear()
            values.put(MediaStore.Images.Media.IS_PENDING, 0)
            resolver.update(uri, values, null, null)
            return Shot(uri, name)
        } catch (e: Exception) {
            RunLog.e("Saving screenshot failed", e)
            try { resolver.delete(uri, null, null) } catch (_: Exception) {}
            return null
        } finally {
            try { bmp.recycle() } catch (_: Exception) {}
        }
    }
}
