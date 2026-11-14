package com.impedyme.jazirehbot.bot

import android.accessibilityservice.AccessibilityService
import android.content.ContentValues
import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import android.provider.MediaStore
import android.view.Display
import com.impedyme.jazirehbot.RunLog
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import kotlin.coroutines.resume

object ScreenshotSaver {

    /** Takes a screenshot through the accessibility API and stores it in the gallery. */
    suspend fun capture(svc: AccessibilityService, folder: String): Uri? {
        val bmp = take(svc) ?: return null
        return withContext(Dispatchers.IO) { save(svc, bmp, folder) }
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
                            if (cont.isActive) cont.resume(bmp)
                        }

                        override fun onFailure(errorCode: Int) {
                            RunLog.e("takeScreenshot failed with code $errorCode")
                            if (cont.isActive) cont.resume(null)
                        }
                    })
            } catch (e: Exception) {
                RunLog.e("takeScreenshot threw", e)
                if (cont.isActive) cont.resume(null)
            }
        }
    }

    private fun save(ctx: Context, bmp: Bitmap, folder: String): Uri? {
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
        val uri = try { resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values) } catch (e: Exception) {
            RunLog.e("MediaStore insert failed", e); null
        } ?: return null
        try {
            resolver.openOutputStream(uri)?.use { bmp.compress(Bitmap.CompressFormat.JPEG, 90, it) }
                ?: throw IllegalStateException("openOutputStream returned null")
            values.clear()
            values.put(MediaStore.Images.Media.IS_PENDING, 0)
            resolver.update(uri, values, null, null)
            return uri
        } catch (e: Exception) {
            RunLog.e("Saving screenshot failed", e)
            try { resolver.delete(uri, null, null) } catch (_: Exception) {}
            return null
        } finally {
            try { bmp.recycle() } catch (_: Exception) {}
        }
    }
}
