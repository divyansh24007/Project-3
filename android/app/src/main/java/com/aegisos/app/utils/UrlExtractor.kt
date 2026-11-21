package com.aegisos.app.utils

import java.util.regex.Pattern

/**
 * UrlExtractor:
 * Regular expression utility to extract web URLs, domain targets, and telephone contact numbers
 * from unstructured text messages, email bodies, and OCR output.
 *
 * Requirements:
 * - Object with fun extractUrls(text: String): List<String> using regex
 * - fun extractPhoneNumbers(text: String): List<String> using regex
 */
object UrlExtractor {

    // Regex for standard URLs, IP addresses, domains, and URI schemes (including UPI)
    private val URL_REGEX = Pattern.compile(
        """(?i)\b(?:(?:https?|ftp)://|upi://|www\.)[a-zA-Z0-9+&@#/%?=~_|!:,.;]*[a-zA-Z0-9+&@#/%=~_|]|(?:\b[a-zA-Z0-9.-]+\.(?:com|org|net|edu|gov|io|xyz|top|in|co|tech|online|site|app|live|vip|me|info|biz)\b(?:/[^\s]*)?)""",
        Pattern.CASE_INSENSITIVE
    )

    // Regex matching Indian (+91, 10 digits) and standard international phone numbers
    private val PHONE_REGEX = Pattern.compile(
        """(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,5}[-.\s]?\d{3,5}\b"""
    )

    /**
     * Extracts all distinct URLs and domain links from raw text.
     */
    fun extractUrls(text: String): List<String> {
        if (text.isBlank()) return emptyList()

        val results = mutableListOf<String>()
        val matcher = URL_REGEX.matcher(text)

        while (matcher.find()) {
            val raw = matcher.group().trim()
            val clean = sanitizeUrl(raw)
            if (clean.isNotEmpty() && !results.contains(clean)) {
                results.add(clean)
            }
        }
        return results
    }

    /**
     * Extracts all valid telephone numbers from raw text.
     */
    fun extractPhoneNumbers(text: String): List<String> {
        if (text.isBlank()) return emptyList()

        val results = mutableListOf<String>()
        val matcher = PHONE_REGEX.matcher(text)

        while (matcher.find()) {
            val raw = matcher.group().trim()
            val digitsOnly = raw.replace(Regex("""[^\d]"""), "")
            // Valid phone length filter (usually between 7 and 15 digits)
            if (digitsOnly.length in 8..15 && !results.contains(raw)) {
                results.add(raw)
            }
        }
        return results
    }

    /**
     * Sanitizes trailing punctuation and formats URL scheme if missing.
     */
    private fun sanitizeUrl(raw: String): String {
        var url = raw.trimEnd('.', ',', ';', ':', ')', ']')
        if (!url.startsWith("http://", ignoreCase = true) &&
            !url.startsWith("https://", ignoreCase = true) &&
            !url.startsWith("upi://", ignoreCase = true) &&
            !url.startsWith("ftp://", ignoreCase = true)
        ) {
            url = "https://$url"
        }
        return url
    }
}
