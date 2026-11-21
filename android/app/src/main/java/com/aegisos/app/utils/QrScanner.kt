package com.aegisos.app.utils

import android.graphics.Bitmap
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.barcode.BarcodeScannerOptions
import com.google.mlkit.vision.barcode.common.Barcode
import com.google.mlkit.vision.common.InputImage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.tasks.await
import kotlinx.coroutines.withContext

/**
 * QrScanner:
 * Decodes QR code payloads from bitmap images using Google ML Kit BarcodeScanning.
 *
 * Requirements:
 * - Object with suspend fun decodeBitmap(bitmap: Bitmap): List<String>
 * - Uses ML Kit BarcodeScanning to decode QR codes
 * - Returns list of decoded values
 */
object QrScanner {

    private val options = BarcodeScannerOptions.Builder()
        .setBarcodeFormats(Barcode.FORMAT_QR_CODE)
        .build()

    private val scanner = BarcodeScanning.getClient(options)

    /**
     * Inspects provided bitmap and extracts all encoded QR code payloads.
     */
    suspend fun decodeBitmap(bitmap: Bitmap): List<String> = withContext(Dispatchers.Default) {
        try {
            val inputImage = InputImage.fromBitmap(bitmap, 0)
            val barcodes = scanner.process(inputImage).await()

            barcodes.mapNotNull { barcode ->
                barcode.rawValue ?: barcode.displayValue
            }.filter { it.isNotBlank() }
        } catch (e: Exception) {
            emptyList()
        }
    }
}
