package com.impedyme.jazirehbot

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.util.Log
import java.io.File
import java.text.SimpleDateFormat
import java.util.ArrayDeque
import java.util.Date
import java.util.Locale
import java.util.concurrent.Executors

/** In-memory + on-disk log that the main screen shows live. */
object RunLog {
    private const val TAG = "JazirehBot"
    private const val MAX_LINES = 700
    private val lines = ArrayDeque<String>()
    private val fmt = SimpleDateFormat("MM-dd HH:mm:ss", Locale.US)
    private val main = Handler(Looper.getMainLooper())
    private val io = Executors.newSingleThreadExecutor()
    private val listeners = ArrayList<() -> Unit>()
    @Volatile private var file: File? = null

    fun init(ctx: Context) {
        val f = File(ctx.applicationContext.filesDir, "runlog.txt")
        file = f
        synchronized(lines) {
            if (lines.isEmpty() && f.exists()) {
                try { f.readLines().takeLast(250).forEach { lines.addLast(it) } } catch (_: Exception) {}
            }
        }
    }

    fun d(msg: String) = add("D", msg, null)
    fun i(msg: String) = add("I", msg, null)
    fun w(msg: String) = add("W", msg, null)
    fun e(msg: String, t: Throwable? = null) = add("E", msg, t)

    private fun add(level: String, msg: String, t: Throwable?) {
        val extra = if (t != null) "\n    ${t.javaClass.simpleName}: ${t.message}" else ""
        val line = "${fmt.format(Date())} $level  $msg$extra"
        when (level) {
            "E" -> Log.e(TAG, msg, t)
            "W" -> Log.w(TAG, msg)
            else -> Log.d(TAG, msg)
        }
        synchronized(lines) {
            lines.addLast(line)
            while (lines.size > MAX_LINES) lines.removeFirst()
        }
        io.execute { appendToFile(line) }
        main.post { notifyListeners() }
    }

    private fun appendToFile(line: String) {
        val f = file ?: return
        try {
            if (f.exists() && f.length() > 1_500_000) {
                val keep = f.readLines().takeLast(400)
                f.writeText(keep.joinToString("\n") + "\n")
            }
            f.appendText(line + "\n")
        } catch (_: Exception) {}
    }

    fun text(): String = synchronized(lines) { lines.joinToString("\n") }

    fun clear() {
        synchronized(lines) { lines.clear() }
        io.execute { try { file?.delete() } catch (_: Exception) {} }
        main.post { notifyListeners() }
    }

    fun logFile(): File? = file

    fun addListener(l: () -> Unit) { listeners.add(l) }
    fun removeListener(l: () -> Unit) { listeners.remove(l) }
    private fun notifyListeners() { listeners.toList().forEach { it() } }
}
