package com.impedyme.jazirehbot

import android.content.Context
import android.content.Intent

object AppFinder {
    data class AppEntry(val label: String, val pkg: String)

    @Suppress("DEPRECATION")
    fun launchable(ctx: Context): List<AppEntry> {
        val pm = ctx.packageManager
        val intent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
        return try {
            pm.queryIntentActivities(intent, 0)
                .map { AppEntry(it.loadLabel(pm).toString(), it.activityInfo.packageName) }
                .distinctBy { it.pkg }
                .sortedBy { it.label.lowercase() }
        } catch (e: Exception) {
            RunLog.e("Cannot list apps", e)
            emptyList()
        }
    }

    fun findJazireh(ctx: Context): String? {
        val apps = launchable(ctx)
        return apps.firstOrNull { FaText.equalsLoose(it.label, "جزیره") }?.pkg
            ?: apps.firstOrNull {
                FaText.containsLoose(it.label, "جزیره") ||
                    it.pkg.contains("jazireh", true) || it.pkg.contains("jazire", true)
            }?.pkg
    }

    fun label(ctx: Context, pkg: String?): String {
        if (pkg == null) return "(not set)"
        return try {
            val ai = ctx.packageManager.getApplicationInfo(pkg, 0)
            ctx.packageManager.getApplicationLabel(ai).toString() + "  ($pkg)"
        } catch (e: Exception) {
            "$pkg  (NOT INSTALLED)"
        }
    }

    fun isInstalled(ctx: Context, pkg: String): Boolean =
        try { ctx.packageManager.getPackageInfo(pkg, 0); true } catch (e: Exception) { false }
}
