package com.impedyme.jazirehbot

import android.content.Context
import android.content.SharedPreferences
import java.time.LocalDate

class Prefs(ctx: Context) {
    private val sp: SharedPreferences =
        ctx.applicationContext.getSharedPreferences("jazirehbot", Context.MODE_PRIVATE)

    var enabled: Boolean
        get() = sp.getBoolean("enabled", false)
        set(v) = sp.edit().putBoolean("enabled", v).apply()

    var intervalMin: Int
        get() = sp.getInt("intervalMin", 10).coerceIn(1, 1440)
        set(v) = sp.edit().putInt("intervalMin", v.coerceIn(1, 1440)).apply()

    /** Instagram usernames exactly as they appear as «پیج مبدأ» in Jazireh. */
    var accounts: List<String>
        get() = lines("accounts").map { it.trimStart('@') }.filter { it.isNotEmpty() }
        set(v) = putLines("accounts", v)

    var comments: List<String>
        get() = lines("comments").ifEmpty { DEFAULT_COMMENTS }
        set(v) = putLines("comments", v)

    var jazirehPackage: String?
        get() = sp.getString("jazirehPackage", null)?.takeIf { it.isNotBlank() }
        set(v) = sp.edit().putString("jazirehPackage", v).apply()

    var instagramPackage: String
        get() = sp.getString("instagramPackage", null)?.takeIf { it.isNotBlank() } ?: DEFAULT_INSTAGRAM
        set(v) = sp.edit().putString("instagramPackage", v.trim()).apply()

    var humanDelayMs: Long
        get() = sp.getLong("humanDelayMs", 1200L)
        set(v) = sp.edit().putLong("humanDelayMs", v.coerceIn(0L, 20_000L)).apply()

    var maxItemsPerRun: Int
        get() = sp.getInt("maxItemsPerRun", 20)
        set(v) = sp.edit().putInt("maxItemsPerRun", v.coerceIn(1, 500)).apply()

    var maxRunMinutes: Int
        get() = sp.getInt("maxRunMinutes", 9)
        set(v) = sp.edit().putInt("maxRunMinutes", v.coerceIn(1, 180)).apply()

    var screenshotFolder: String
        get() = sp.getString("screenshotFolder", null)?.takeIf { it.isNotBlank() } ?: "DCIM/Screenshots"
        set(v) = sp.edit().putString("screenshotFolder", v.trim().trim('/')).apply()

    var goHomeAfterRun: Boolean
        get() = sp.getBoolean("goHomeAfterRun", true)
        set(v) = sp.edit().putBoolean("goHomeAfterRun", v).apply()

    var useLedger: Boolean
        get() = sp.getBoolean("useLedger", true)
        set(v) = sp.edit().putBoolean("useLedger", v).apply()

    var selectorsJson: String?
        get() = sp.getString("selectorsJson", null)
        set(v) = sp.edit().putString("selectorsJson", v).apply()

    var lastRunAt: Long
        get() = sp.getLong("lastRunAt", 0L)
        set(v) = sp.edit().putLong("lastRunAt", v).apply()

    var nextRunAt: Long
        get() = sp.getLong("nextRunAt", 0L)
        set(v) = sp.edit().putLong("nextRunAt", v).apply()

    var lastSummary: String
        get() = sp.getString("lastSummary", "") ?: ""
        set(v) = sp.edit().putString("lastSummary", v).apply()

    // ---- ledger of "day|challenge|account" items already submitted (reset daily) ----

    fun ledgerContains(key: String): Boolean = useLedger && ledger().contains(key)

    fun ledgerAdd(key: String) {
        val s = HashSet(ledger())
        s.add(key)
        sp.edit().putStringSet("ledger", s).apply()
    }

    fun ledgerClear() = sp.edit().remove("ledger").apply()

    fun ledgerSize(): Int = ledger().size

    private fun ledger(): Set<String> {
        val today = LocalDate.now().toString()
        val all = sp.getStringSet("ledger", emptySet()) ?: emptySet()
        val fresh = all.filter { it.startsWith(today) }.toSet()
        if (fresh.size != all.size) sp.edit().putStringSet("ledger", fresh).apply()
        return fresh
    }

    private fun lines(k: String): List<String> =
        (sp.getString(k, "") ?: "").split('\n').map { it.trim() }.filter { it.isNotEmpty() }

    private fun putLines(k: String, v: List<String>) =
        sp.edit().putString(k, v.map { it.trim() }.filter { it.isNotEmpty() }.joinToString("\n")).apply()

    companion object {
        const val DEFAULT_INSTAGRAM = "com.instagram.android"
        val DEFAULT_COMMENTS = listOf("عالی 👏", "خیلی خوب بود", "👌👌", "چه پست خوبی", "لایک داره 👍")
    }
}
