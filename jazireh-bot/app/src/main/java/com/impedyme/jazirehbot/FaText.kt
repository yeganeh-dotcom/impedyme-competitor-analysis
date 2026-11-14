package com.impedyme.jazirehbot

/**
 * Persian/Arabic-aware text normalisation so that UI labels match regardless of
 * ZWNJ (نیم‌فاصله), Arabic vs Persian letter forms, digits and spacing.
 */
object FaText {
    private val digits: Map<Char, Char> = HashMap<Char, Char>().apply {
        "۰۱۲۳۴۵۶۷۸۹".forEachIndexed { i, c -> put(c, '0' + i) }
        "٠١٢٣٤٥٦٧٨٩".forEachIndexed { i, c -> put(c, '0' + i) }
    }
    private val spaces = Regex("\\s+")
    private val nonWord = Regex("[\\s\\p{P}\\p{S}]+")
    private val number = Regex("\\d+")
    private val username = Regex("^@?[A-Za-z0-9._]{2,30}$")

    fun asciiDigits(s: CharSequence?): String {
        if (s == null) return ""
        val sb = StringBuilder(s.length)
        for (c in s) sb.append(digits[c] ?: c)
        return sb.toString()
    }

    /** Lower-cased, digit- and letter-normalised text with single spaces. */
    fun norm(s: CharSequence?): String {
        if (s == null) return ""
        val sb = StringBuilder(s.length)
        for (raw in asciiDigits(s)) {
            val c: Char? = when (raw) {
                'ي', 'ى', 'ئ' -> 'ی'
                'ك' -> 'ک'
                'أ', 'إ', 'آ', 'ٱ' -> 'ا'
                'ة' -> 'ه'
                'ؤ' -> 'و'
                '‌', '‍', '‎', '‏', '‪', '‫', '‬', 'ـ', '﻿' -> null
                in 'ً'..'ْ' -> null
                else -> raw.lowercaseChar()
            }
            if (c != null) sb.append(c)
        }
        return sb.toString().replace(spaces, " ").trim()
    }

    /** Normalised text with all whitespace, punctuation and symbols removed. */
    fun loose(s: CharSequence?): String = norm(s).replace(nonWord, "")

    fun equalsLoose(a: CharSequence?, b: CharSequence?): Boolean {
        val x = loose(a)
        return x.isNotEmpty() && x == loose(b)
    }

    fun containsLoose(hay: CharSequence?, needle: CharSequence?): Boolean {
        val n = loose(needle)
        return n.isNotEmpty() && loose(hay).contains(n)
    }

    fun numbers(s: CharSequence?): List<Int> =
        number.findAll(asciiDigits(s)).mapNotNull { it.value.toIntOrNull() }.toList()

    fun looksLikeUsername(s: CharSequence?): Boolean =
        s != null && username.matches(s.toString().trim())
}
