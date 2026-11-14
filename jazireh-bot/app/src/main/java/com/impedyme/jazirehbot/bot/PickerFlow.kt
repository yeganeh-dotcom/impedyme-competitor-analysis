package com.impedyme.jazirehbot.bot

import android.os.SystemClock
import android.view.accessibility.AccessibilityNodeInfo
import com.impedyme.jazirehbot.FaText
import com.impedyme.jazirehbot.Prefs
import com.impedyme.jazirehbot.RunLog
import com.impedyme.jazirehbot.Selectors
import kotlinx.coroutines.delay

/** Drives whatever image picker Jazireh opens and selects the newest picture (our screenshot). */
class PickerFlow(private val ui: UiDriver, private val prefs: Prefs) {

    private fun s(k: String) = Selectors.get(k)

    suspend fun pickNewest(jazirehPkg: String) {
        val start = SystemClock.uptimeMillis()
        val external = ui.waitUntil(6_000) {
            val p = ui.currentPackage()
            p != null && p != jazirehPkg
        }
        RunLog.i(if (external) "Image picker opened: ${ui.currentPackage()}" else "No external picker detected – looking for an in-app picker")
        val excludePkg = if (external) jazirehPkg else null
        var taps = 0
        var lastTap = 0L
        val deadline = start + 35_000
        while (SystemClock.uptimeMillis() < deadline) {
            val p = ui.currentPackage()
            val now = SystemClock.uptimeMillis()
            if (taps > 0 && p == jazirehPkg && now - lastTap > 800) {
                RunLog.i("Back in Jazireh after picking the image")
                return
            }
            // 1) runtime permission prompt (storage / photos)
            val allow = ui.find {
                it.isVisibleToUser && it.clickableAncestorOrSelf() != null && ui.matchText(it, s("picker.allowTexts"), exact = true)
            }
            if (allow != null) {
                ui.click(allow, "picker:allow")
                delay(1200)
                continue
            }
            // 2) "Open with" chooser between gallery apps
            if (ui.byText(s("picker.chooserTexts")) != null) {
                val app = ui.byText(s("picker.galleryAppTexts"))
                if (app != null) { ui.click(app, "chooser:gallery"); delay(800) }
                val once = ui.byText(s("picker.onceTexts"), exact = true)
                if (once != null) ui.click(once, "chooser:once")
                delay(1200)
                continue
            }
            // 3) after a tap: a confirm button, or another tap if we only opened an album
            if (taps > 0) {
                val confirm = ui.find {
                    it.isVisibleToUser && it.clickableAncestorOrSelf() != null &&
                        it.packageName?.toString() != jazirehPkg &&
                        ui.matchText(it, s("picker.confirmTexts"), exact = true) && !isCameraLike(it)
                }
                if (confirm != null && p != jazirehPkg) {
                    ui.click(confirm, "picker:confirm")
                    delay(1500)
                    continue
                }
                if (now - lastTap > 3000 && taps < 3) {
                    val tile = findNewestTile(excludePkg)
                    if (tile != null) {
                        RunLog.i("Tapping tile again (album opened?): ${tile.describe()}")
                        ui.click(tile, "picker:tile")
                        taps++; lastTap = SystemClock.uptimeMillis()
                        delay(1500)
                        continue
                    }
                }
                delay(600)
                continue
            }
            // 4) pick the newest tile
            val tile = findNewestTile(excludePkg)
            if (tile != null) {
                RunLog.i("Tapping newest image tile: ${tile.describe()}")
                ui.click(tile, "picker:tile")
                taps++; lastTap = SystemClock.uptimeMillis()
                delay(1500)
                continue
            }
            // 5) maybe a Photos/Images tab must be opened first
            val tab = ui.byText(s("picker.imagesTabTexts"), exact = true, clickableOnly = true)
            if (tab != null) {
                ui.click(tab, "picker:imagesTab")
                delay(1200)
                continue
            }
            delay(700)
        }
        if (ui.currentPackage() != jazirehPkg) { ui.back(); delay(600) }
        throw StepFailed("Could not pick the screenshot in the image picker – use 'Inspect screen' while the picker is open and send the dump")
    }

    private fun isCameraLike(n: AccessibilityNodeInfo): Boolean {
        val cam = s("picker.cameraTexts")
        if (cam.any { FaText.containsLoose(n.anyText, it) }) return true
        val anc = n.clickableAncestorOrSelf(2) ?: return false
        val t = anc.subtreeText(4)
        return cam.any { FaText.containsLoose(t, it) }
    }

    private fun findNewestTile(excludePkg: String?): AccessibilityNodeInfo? {
        val size = ui.screenSize()
        val minSide = (size.x / 7).coerceAtLeast(64)
        val maxSide = (size.x * 0.6).toInt()
        val cands = ui.findAll { n ->
            if (!n.isVisibleToUser) return@findAll false
            if (excludePkg != null && n.packageName?.toString() == excludePkg) return@findAll false
            val r = n.bounds()
            if (r.width() < minSide || r.height() < minSide || r.width() > maxSide || r.top < size.y * 0.06) return@findAll false
            val c = n.cls
            val imageLike = c.contains("Image") || (c.endsWith(".View") && n.childCount == 0) ||
                ((c.contains("FrameLayout") || c.contains("RelativeLayout") || c.contains("ViewGroup")) && n.childCount <= 3 && n.isClickable)
            if (!imageLike) return@findAll false
            if (!(n.isClickable || n.isCheckable || n.clickableAncestorOrSelf(2) != null)) return@findAll false
            !isCameraLike(n)
        }
        if (cands.isEmpty()) return null
        val screenshotLike = cands.filter { n ->
            val own = n.anyText
            val anc = n.clickableAncestorOrSelf(2)
            val t = if (anc != null) anc.subtreeText(4) else own
            FaText.containsLoose(t, "screenshot") || FaText.containsLoose(t, "اسکرین")
        }
        val pool = screenshotLike.ifEmpty { cands }
        val topMost = pool.minOf { it.bounds().top }
        val firstRow = pool.filter { it.bounds().top <= topMost + minSide / 2 }
        return if (ui.isRtl()) firstRow.maxByOrNull { it.bounds().left } else firstRow.minByOrNull { it.bounds().left }
    }
}
