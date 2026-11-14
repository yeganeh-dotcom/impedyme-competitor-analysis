package com.impedyme.jazirehbot.bot

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.GestureDescription
import android.content.ClipData
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.graphics.Path
import android.graphics.Point
import android.net.Uri
import android.os.Bundle
import android.os.SystemClock
import android.text.TextUtils
import android.view.View
import android.view.accessibility.AccessibilityNodeInfo
import com.impedyme.jazirehbot.FaText
import com.impedyme.jazirehbot.Prefs
import com.impedyme.jazirehbot.RunLog
import kotlinx.coroutines.delay
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withTimeoutOrNull
import java.util.Locale
import kotlin.coroutines.resume
import kotlin.random.Random

/** Thin, coroutine-friendly layer over the accessibility APIs: find, wait, click, type. */
class UiDriver(private val svc: AccessibilityService) {
    val ctx: Context get() = svc

    // ---------- querying ----------

    fun roots(): List<AccessibilityNodeInfo> = svc.allRoots()

    fun nodes(): Sequence<AccessibilityNodeInfo> = roots().asSequence().flatMap { it.walk() }

    fun currentPackage(): String? =
        try { svc.rootInActiveWindow?.packageName?.toString() } catch (e: Exception) { null }

    fun find(pred: (AccessibilityNodeInfo) -> Boolean): AccessibilityNodeInfo? =
        try { nodes().firstOrNull { safe(it, pred) } } catch (e: Exception) { null }

    fun findAll(pred: (AccessibilityNodeInfo) -> Boolean): List<AccessibilityNodeInfo> =
        try { nodes().filter { safe(it, pred) }.toList() } catch (e: Exception) { emptyList() }

    private inline fun safe(n: AccessibilityNodeInfo, pred: (AccessibilityNodeInfo) -> Boolean): Boolean =
        try { pred(n) } catch (e: Exception) { false }

    /** 2 = one of the node's texts equals a candidate, 1 = contains it, 0 = no match. */
    fun matchScore(n: AccessibilityNodeInfo, cands: List<String>, exact: Boolean): Int {
        if (cands.isEmpty()) return 0
        val texts = arrayOf(n.textStr, n.descStr, n.hintStr)
        var best = 0
        for (c in cands) for (t in texts) {
            if (t.isEmpty()) continue
            if (FaText.equalsLoose(t, c)) return 2
            if (!exact && best < 1 && FaText.containsLoose(t, c)) best = 1
        }
        return best
    }

    fun matchText(n: AccessibilityNodeInfo, cands: List<String>, exact: Boolean = false): Boolean =
        matchScore(n, cands, exact) >= (if (exact) 2 else 1)

    /** Best visible node whose text/description matches; prefers exact and clickable matches. */
    fun byText(cands: List<String>, exact: Boolean = false, clickableOnly: Boolean = false): AccessibilityNodeInfo? {
        if (cands.isEmpty()) return null
        var best: AccessibilityNodeInfo? = null
        var bestScore = -1
        try {
            for (n in nodes()) {
                if (!safe(n) { it.isVisibleToUser }) continue
                val m = matchScore(n, cands, exact)
                if (m == 0 || (exact && m < 2)) continue
                val clickable = n.clickableAncestorOrSelf() != null
                if (clickableOnly && !clickable) continue
                val score = m * 2 + (if (clickable) 1 else 0)
                if (score > bestScore) {
                    best = n; bestScore = score
                    if (score == 5) break
                }
            }
        } catch (e: Exception) {
            RunLog.d("byText error: ${e.message}")
        }
        return best
    }

    fun byId(ids: List<String>): AccessibilityNodeInfo? {
        if (ids.isEmpty()) return null
        return find { n ->
            n.isVisibleToUser && ids.any { id -> if (id.contains(':')) n.idName == id else n.idShort == id }
        }
    }

    fun byIdOrText(ids: List<String>, texts: List<String>, exact: Boolean = false): AccessibilityNodeInfo? =
        byId(ids) ?: byText(texts, exact)

    // ---------- waiting ----------

    suspend fun waitFor(
        timeoutMs: Long, pollMs: Long = 350, pred: () -> AccessibilityNodeInfo?
    ): AccessibilityNodeInfo? {
        val end = SystemClock.uptimeMillis() + timeoutMs
        while (true) {
            val n = try { pred() } catch (e: Exception) { null }
            if (n != null) return n
            if (SystemClock.uptimeMillis() >= end) return null
            delay(pollMs)
        }
    }

    suspend fun waitUntil(timeoutMs: Long, pollMs: Long = 350, pred: () -> Boolean): Boolean {
        val end = SystemClock.uptimeMillis() + timeoutMs
        while (true) {
            val ok = try { pred() } catch (e: Exception) { false }
            if (ok) return true
            if (SystemClock.uptimeMillis() >= end) return false
            delay(pollMs)
        }
    }

    suspend fun waitForPackage(pkgs: Collection<String>, timeoutMs: Long): String? {
        var found: String? = null
        waitUntil(timeoutMs) {
            val p = currentPackage()
            if (p != null && p in pkgs) { found = p; true } else false
        }
        return found
    }

    // ---------- acting ----------

    suspend fun click(node: AccessibilityNodeInfo?, label: String = ""): Boolean {
        if (node == null) return false
        val target = node.clickableAncestorOrSelf()
        if (target != null) {
            val ok = try { target.performAction(AccessibilityNodeInfo.ACTION_CLICK) } catch (e: Exception) { false }
            if (ok) {
                RunLog.d("click[$label] ok: ${node.describe()}")
                return true
            }
        }
        val r = node.bounds()
        if (r.isEmpty) {
            RunLog.w("click[$label] failed: node has no bounds ${node.describe()}")
            return false
        }
        val ok = tap(r.exactCenterX(), r.exactCenterY())
        RunLog.d("click[$label] via tap=$ok: ${node.describe()}")
        return ok
    }

    suspend fun tap(x: Float, y: Float, durationMs: Long = 60): Boolean =
        gesture(Path().apply { moveTo(x, y) }, durationMs)

    suspend fun longPress(x: Float, y: Float, durationMs: Long = 700): Boolean =
        gesture(Path().apply { moveTo(x, y) }, durationMs)

    suspend fun swipe(x1: Float, y1: Float, x2: Float, y2: Float, durationMs: Long = 350): Boolean =
        gesture(Path().apply { moveTo(x1, y1); lineTo(x2, y2) }, durationMs)

    private suspend fun gesture(path: Path, durationMs: Long): Boolean = withTimeoutOrNull(durationMs + 3000) {
        suspendCancellableCoroutine { cont ->
            val g = GestureDescription.Builder()
                .addStroke(GestureDescription.StrokeDescription(path, 0, durationMs))
                .build()
            val dispatched = try {
                svc.dispatchGesture(g, object : AccessibilityService.GestureResultCallback() {
                    override fun onCompleted(gestureDescription: GestureDescription?) {
                        if (cont.isActive) cont.resume(true)
                    }
                    override fun onCancelled(gestureDescription: GestureDescription?) {
                        if (cont.isActive) cont.resume(false)
                    }
                }, null)
            } catch (e: Exception) { false }
            if (!dispatched && cont.isActive) cont.resume(false)
        }
    } ?: false

    suspend fun setText(node: AccessibilityNodeInfo, text: String): Boolean {
        try { node.performAction(AccessibilityNodeInfo.ACTION_FOCUS) } catch (_: Exception) {}
        val args = Bundle().apply {
            putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, text)
        }
        val ok = try { node.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args) } catch (e: Exception) { false }
        if (ok) return true
        RunLog.d("ACTION_SET_TEXT failed – falling back to paste")
        val cm = ctx.getSystemService(ClipboardManager::class.java)
        cm.setPrimaryClip(ClipData.newPlainText("text", text))
        click(node, "focusForPaste")
        delay(300)
        return try { node.performAction(AccessibilityNodeInfo.ACTION_PASTE) } catch (e: Exception) { false }
    }

    fun back(): Boolean = svc.performGlobalAction(AccessibilityService.GLOBAL_ACTION_BACK)
    fun home(): Boolean = svc.performGlobalAction(AccessibilityService.GLOBAL_ACTION_HOME)

    fun launch(pkg: String): Boolean {
        val i = ctx.packageManager.getLaunchIntentForPackage(pkg)
        if (i == null) {
            RunLog.e("No launch intent for $pkg (not installed?)")
            return false
        }
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        return try { ctx.startActivity(i); true } catch (e: Exception) { RunLog.e("launch($pkg) failed", e); false }
    }

    fun openUrl(url: String, pkg: String?): Boolean {
        val i = Intent(Intent.ACTION_VIEW, Uri.parse(url)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        if (pkg != null) i.setPackage(pkg)
        return try { ctx.startActivity(i); true } catch (e: Exception) { RunLog.e("openUrl failed", e); false }
    }

    fun scrollable(): AccessibilityNodeInfo? = find { it.isScrollable && it.isVisibleToUser }

    suspend fun scrollForward(container: AccessibilityNodeInfo? = scrollable()): Boolean {
        val ok = try { container?.performAction(AccessibilityNodeInfo.ACTION_SCROLL_FORWARD) ?: false } catch (e: Exception) { false }
        if (ok) delay(800)
        return ok
    }

    suspend fun humanDelay(baseMs: Long = Prefs(ctx).humanDelayMs) {
        if (baseMs <= 0) return
        delay(baseMs + Random.nextLong(0, baseMs / 2 + 1))
    }

    // ---------- misc ----------

    fun screenSize(): Point {
        val dm = ctx.resources.displayMetrics
        return Point(dm.widthPixels, dm.heightPixels)
    }

    fun isRtl(): Boolean =
        TextUtils.getLayoutDirectionFromLocale(Locale.getDefault()) == View.LAYOUT_DIRECTION_RTL

    /** Human-readable dump of every window for the "Inspect screen" button. */
    fun dumpTree(): String {
        val sb = StringBuilder()
        sb.append("active package: ").append(currentPackage()).append('\n')
        val rs = roots()
        rs.forEachIndexed { wi, root ->
            sb.append("=== window ").append(wi).append(" pkg=").append(root.packageName).append(" ===\n")
            dumpNode(root, 0, sb, IntArray(1))
        }
        return sb.toString()
    }

    private fun dumpNode(n: AccessibilityNodeInfo, depth: Int, sb: StringBuilder, counter: IntArray) {
        if (counter[0]++ > 4000 || depth > 60) return
        val hasInfo = n.anyText.isNotEmpty() || n.idShort.isNotEmpty() || n.isClickable || n.isEditable || n.isScrollable
        if (hasInfo) {
            repeat(depth) { sb.append(' ') }
            sb.append(n.describe()).append('\n')
        }
        val count = try { n.childCount } catch (e: Exception) { 0 }
        for (i in 0 until count) {
            val c = try { n.getChild(i) } catch (e: Exception) { null } ?: continue
            dumpNode(c, depth + 1, sb, counter)
        }
    }
}
