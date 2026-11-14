package com.impedyme.jazirehbot

enum class ChallengeType {
    LIKE, FOLLOW, COMMENT, REPOST, SAVE, VISIT, UNKNOWN;

    companion object {
        /** Title of the card is authoritative; the guide text is only a fallback. */
        fun classify(title: String, guide: String = ""): ChallengeType =
            fromText(FaText.loose(title)) ?: fromText(FaText.loose(guide)) ?: UNKNOWN

        private val rules: List<Pair<ChallengeType, List<String>>> = listOf(
            LIKE to listOf("لایک", "پسندیدن", "like"),
            FOLLOW to listOf("فالو", "دنبال", "follow"),
            COMMENT to listOf("کامنت", "نظر", "comment"),
            REPOST to listOf("ریپست", "ری پست", "بازنشر", "استوری", "اشتراک", "repost", "share"),
            SAVE to listOf("سیو", "ذخیره", "save"),
            VISIT to listOf("بازدید", "ویو", "مشاهده", "visit", "view"),
        )

        private fun fromText(x: String): ChallengeType? {
            if (x.isEmpty()) return null
            for ((type, words) in rules) {
                if (words.any { w -> x.contains(FaText.loose(w)) }) return type
            }
            return null
        }
    }
}
