package com.aegisos.app.utils

import android.graphics.Bitmap
import com.google.mlkit.vision.common.InputImage
import com.google.mlkit.vision.text.TextRecognition
import com.google.mlkit.vision.text.latin.TextRecognizerOptions
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext

/**
 * OcrEngine:
 * On-device optical character recognition using Google ML Kit TextRecognition.
 *
 * Requirements:
 * - Object with suspend fun extractText(bitmap: Bitmap): String
 * - Uses ML Kit TextRecognition
 * - Returns concatenated text blocks
 */
object OcrEngine {

    private val recognizer = TextRecognition.getClient(TextRecognizerOptions.DEFAULT_OPTIONS)

    /**
     * Extracts all detected text from a bitmap image and returns concatenated text blocks.
     */
    suspend fun extractText(bitmap: Bitmap): String = withContext(Dispatchers.Default) {
        try {
            val inputImage = InputImage.fromBitmap(bitmap, 0)
            val visionText = recognizer.process(inputImage).await()

            visionText.textBlocks.joinToString(separator = "\n") { block ->
                block.text
            }.trim()
        } catch (e: Exception) {
            ""
        }
    }
}
