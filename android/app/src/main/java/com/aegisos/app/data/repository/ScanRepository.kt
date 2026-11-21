package com.aegisos.app.data.repository

import com.aegisos.app.data.api.AegisosApi
import com.aegisos.app.data.api.AnalyticsOverviewDto
import com.aegisos.app.data.api.DemoRunResponseDto
import com.aegisos.app.data.api.DemoScenarioDto
import com.aegisos.app.data.api.DeviceDto
import com.aegisos.app.data.api.DeviceRegisterRequest
import com.aegisos.app.data.api.DomainIntelRequest
import com.aegisos.app.data.api.ImageScanRequest
import com.aegisos.app.data.api.InvestigationDto
import com.aegisos.app.data.api.MessageScanRequest
import com.aegisos.app.data.api.QRScanRequest
import com.aegisos.app.data.api.RetrofitClient
import com.aegisos.app.data.api.ScanResultDto
import com.aegisos.app.data.api.SettingsDto
import com.aegisos.app.data.api.SettingsUpdateRequest
import com.aegisos.app.data.api.ThreatIntelDto
import com.aegisos.app.data.api.URLScanRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.RequestBody.Companion.asRequestBody
import java.io.File

/**
 * ScanRepository:
 * Central repository managing threat analysis workflows, device telemetry enrollment,
 * intelligence queries, and simulation scenarios.
 *
 * Requirements:
 * - Class with AegisosApi dependency
 * - Suspend functions wrapping each API call
 * - Returns Result<T> for error handling
 */
class ScanRepository(
    private val api: AegisosApi = RetrofitClient.api
) {

    /**
     * Inspects target URL using Map parameters as per backend specification.
     */
    suspend fun scanUrlMap(body: Map<String, Any>): Result<ScanResultDto> = withContext(Dispatchers.IO) {
        runCatching {
            api.scanUrl(body)
        }
    }

    /**
     * Inspects target URL with strongly-typed parameters.
     */
    suspend fun scanUrl(
        url: String,
        depth: String = "standard",
        tags: List<String> = emptyList()
    ): Result<ScanResultDto> = withContext(Dispatchers.IO) {
        runCatching {
            api.scanUrlWithModel(
                URLScanRequest(
                    url = url,
                    depth = depth,
                    tags = tags
                )
            )
        }
    }

    /**
     * Analyzes SMS, chat, or email content for social engineering or fraud.
     */
    suspend fun scanMessage(
        message: String,
        sender: String? = null,
        channel: String = "sms",
        metadata: Map<String, Any>? = emptyMap()
    ): Result<ScanResultDto> = withContext(Dispatchers.IO) {
        runCatching {
            api.scanMessage(
                MessageScanRequest(
                    message = message,
                    sender = sender,
                    channel = channel,
                    metadata = metadata
                )
            )
        }
    }

    /**
     * Uploads image file via multipart form data for visual and QR analysis.
     */
    suspend fun scanImageFile(file: File): Result<ScanResultDto> = withContext(Dispatchers.IO) {
        runCatching {
            val requestFile = file.asRequestBody("image/*".toMediaTypeOrNull())
            val filePart = MultipartBody.Part.createFormData("file", file.name, requestFile)
            api.scanImage(file = filePart, payload = null)
        }
    }

    /**
     * Scans base64-encoded image string directly.
     */
    suspend fun scanImageBase64(
        base64Data: String,
        filename: String = "image.png",
        checkQr: Boolean = true,
        runOcr: Boolean = true
    ): Result<ScanResultDto> = withContext(Dispatchers.IO) {
        runCatching {
            api.scanImageBase64(
                ImageScanRequest(
                    image_base64 = base64Data,
                    filename = filename,
                    check_qr = checkQr,
                    run_ocr = runOcr
                )
            )
        }
    }

    /**
     * Analyzes QR code content payload or embedded base64 image.
     */
    suspend fun scanQr(
        qrContent: String?,
        imageBase64: String? = null
    ): Result<ScanResultDto> = withContext(Dispatchers.IO) {
        runCatching {
            api.scanQr(
                QRScanRequest(
                    qr_content = qrContent,
                    image_base64 = imageBase64
                )
            )
        }
    }

    /**
     * Lists historical security investigations with optional filtering.
     */
    suspend fun getInvestigations(
        page: Int? = 1,
        limit: Int? = 20,
        riskLevel: String? = null
    ): Result<List<InvestigationDto>> = withContext(Dispatchers.IO) {
        runCatching {
            api.getInvestigations(page = page, limit = limit, riskLevel = riskLevel)
        }
    }

    /**
     * Retrieves full investigation record with IoCs and agent findings.
     */
    suspend fun getInvestigationById(id: String): Result<InvestigationDto> = withContext(Dispatchers.IO) {
        runCatching {
            api.getInvestigationById(id)
        }
    }

    /**
     * Deletes investigation and associated indicators.
     */
    suspend fun deleteInvestigation(id: String): Result<Map<String, Any>> = withContext(Dispatchers.IO) {
        runCatching {
            api.deleteInvestigation(id)
        }
    }

    /**
     * Queries domain reputation, RDAP, and DNS security posture.
     */
    suspend fun getDomainIntelligence(domain: String): Result<ThreatIntelDto> = withContext(Dispatchers.IO) {
        runCatching {
            api.getDomainIntelligence(DomainIntelRequest(domain = domain))
        }
    }

    /**
     * Enrolls device telemetry and security posture into AEGISOS registry.
     */
    suspend fun registerDevice(
        deviceName: String,
        deviceType: String = "android",
        osVersion: String,
        appVersion: String,
        fcmToken: String? = null,
        securityPosture: Map<String, Any>? = emptyMap()
    ): Result<DeviceDto> = withContext(Dispatchers.IO) {
        runCatching {
            api.registerDevice(
                DeviceRegisterRequest(
                    device_name = deviceName,
                    device_type = deviceType,
                    os_version = osVersion,
                    app_version = appVersion,
                    fcm_token = fcmToken,
                    security_posture = securityPosture
                )
            )
        }
    }

    /**
     * Fetches enrolled client devices for authenticated profile.
     */
    suspend fun getDevices(): Result<List<DeviceDto>> = withContext(Dispatchers.IO) {
        runCatching {
            api.getDevices()
        }
    }

    /**
     * Retrieves overview analytics KPIs (total scans, threats blocked, avg score).
     */
    suspend fun getAnalyticsOverview(): Result<AnalyticsOverviewDto> = withContext(Dispatchers.IO) {
        runCatching {
            api.getAnalyticsOverview()
        }
    }

    /**
     * Fetches user workbench preferences and alerting config.
     */
    suspend fun getSettings(): Result<SettingsDto> = withContext(Dispatchers.IO) {
        runCatching {
            api.getSettings()
        }
    }

    /**
     * Updates user preferences, theme, and notification thresholds.
     */
    suspend fun updateSettings(payload: SettingsUpdateRequest): Result<SettingsDto> = withContext(Dispatchers.IO) {
        runCatching {
            api.updateSettings(payload)
        }
    }

    /**
     * Retrieves built-in cybersecurity demonstration scenarios.
     */
    suspend fun getDemoScenarios(): Result<List<DemoScenarioDto>> = withContext(Dispatchers.IO) {
        runCatching {
            api.getDemoScenarios()
        }
    }

    /**
     * Triggers live multi-agent simulation run on demo scenario.
     */
    suspend fun runDemoScenario(id: String): Result<DemoRunResponseDto> = withContext(Dispatchers.IO) {
        runCatching {
            api.runDemoScenario(id)
        }
    }
}
