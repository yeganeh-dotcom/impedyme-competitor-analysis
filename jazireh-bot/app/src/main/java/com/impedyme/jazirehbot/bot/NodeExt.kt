package com.impedyme.jazirehbot.bot

import android.accessibilityservice.AccessibilityService
import android.graphics.Rect
import android.view.accessibility.AccessibilityNodeInfo
import android.view.accessibility.AccessibilityWindowInfo

/** Roots of all relevant windows, top-most first (dialogs before the app behind them). */
internal fun AccessibilityService.allRoots(): List<AccessibilityNodeInfo> {
    val out = ArrayList<AccessibilityNodeInfo>()
    val ws: List<AccessibilityWindowInfo> = try { windows } catch (e: Exception) { emptyList() }
    for (w in ws) {
        val type = w.type
        if (type != AccessibilityWindowInfo.TYPE_APPLICATION && type != AccessibilityWindowInfo.TYPE_SYSTEM) continue
        val r = try { w.root } catch (e: Exception) { null } ?: continue
        out.add(r)
    }
    if (out.isEmpty()) {
        val active = try { rootInActiveWindow } catch (e: Exception) { null }
        if (active != null) out.add(active)
    }
    return out
}

/** Depth-first walk in reading order, bounded so a pathological tree cannot hang us. */
internal fun AccessibilityNodeInfo.walk(maxDepth: Int = 60, maxNodes: Int = 6000): Sequence<AccessibilityNodeInfo> = sequence {
    val stack = ArrayDeque<Pair<AccessibilityNodeInfo, Int>>()
    stack.addLast(this@walk to 0)
    var visited = 0
    while (stack.isNotEmpty() && visited < maxNodes) {
        val (n, d) = stack.removeLast()
        visited++
        yield(n)
        if (d < maxDepth) {
            val count = try { n.childCount } catch (e: Exception) { 0 }
            for (i in count - 1 downTo 0) {
                val c = try { n.getChild(i) } catch (e: Exception) { null }
                if (c != null) stack.addLast(c to d + 1)
            }
        }
    }
}

internal val AccessibilityNodeInfo.textStr: String get() = try { text?.toString() ?: "" } catch (e: Exception) { "" }
internal val AccessibilityNodeInfo.descStr: String get() = try { contentDescription?.toString() ?: "" } catch (e: Exception) { "" }
internal val AccessibilityNodeInfo.hintStr: String get() = try { hintText?.toString() ?: "" } catch (e: Exception) { "" }
internal val AccessibilityNodeInfo.anyText: String
    get() = listOf(textStr, descStr, hintStr).filter { it.isNotBlank() }.joinToString(" | ")
internal val AccessibilityNodeInfo.idName: String get() = try { viewIdResourceName ?: "" } catch (e: Exception) { "" }
internal val AccessibilityNodeInfo.idShort: String get() = idName.substringAfter('/', idName)
internal val AccessibilityNodeInfo.cls: String get() = try { className?.toString() ?: "" } catch (e: Exception) { "" }

internal fun AccessibilityNodeInfo.bounds(): Rect = Rect().also { try { getBoundsInScreen(it) } catch (_: Exception) {} }

internal fun AccessibilityNodeInfo.clickableAncestorOrSelf(maxUp: Int = 6): AccessibilityNodeInfo? {
    var n: AccessibilityNodeInfo? = this
    var i = 0
    while (n != null && i <= maxUp) {
        if (try { n.isClickable } catch (e: Exception) { false }) return n
        n = try { n.parent } catch (e: Exception) { null }
        i++
    }
    return null
}

internal fun AccessibilityNodeInfo.safeParent(): AccessibilityNodeInfo? = try { parent } catch (e: Exception) { null }

/** All texts in the subtree, one per line, in reading order. */
internal fun AccessibilityNodeInfo.subtreeText(maxDepth: Int = 25): String =
    walk(maxDepth, 1500).map { n -> n.textStr.ifBlank { n.descStr } }.filter { it.isNotBlank() }.joinToString("\n")

internal fun AccessibilityNodeInfo.describe(): String {
    val b = bounds()
    val flags = buildString {
        if (isClickable) append(" clickable")
        if (isEditable) append(" editable")
        if (isScrollable) append(" scrollable")
        if (isSelected) append(" selected")
        if (isChecked) append(" checked")
        if (!isEnabled) append(" disabled")
        if (!isVisibleToUser) append(" invisible")
    }
    val idp = if (idShort.isNotEmpty()) "#$idShort" else ""
    return "${cls.substringAfterLast('.')}$idp '${anyText.take(70).replace("\n", " ")}' [${b.left},${b.top}-${b.right},${b.bottom}]$flags"
}
