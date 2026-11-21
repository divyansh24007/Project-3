package com.aegisos.app.data.api

import okhttp3.MultipartBody
import okhttp3.RequestBody
import retrofit2.http.Body
import retrofit2.http.DELETE
import retrofit2.http.GET
import retrofit2.http.Multipart
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Part
import retrofit2.http.Path
import retrofit2.http.Query

/**
 * AegisosApi:
 * Central Retrofit interface for the AEGISOS threat detection engine and device management APIs.
 *
 * Endpoints:
 * - POST scan/url (body: Map)
 * - POST scan/message
 * - POST scan/image (Multipart)
 * - POST scan/qr
 * - GET investigations
 * - GET investigations/{id}
 * - DELETE investigations/{id}
 * - POST intelligence/domain
 * - POST devices/register
 * - GET devices
 * - GET analytics/overview
 * - GET settings
 * - PUT settings
 * - GET demo/scenarios
 * - POST demo/run/{id}
 */
interface AegisosApi {

    // 1. Scan URL
    @POST("scan/url")
    suspend fun scanUrl(
        @Body body: Map<String, @JvmSuppressWildcards Any>
    ): ScanResultDto

    @POST("scan/url")
    suspend fun scanUrlWithModel(
        @Body body: URLScanRequest
    ): ScanResultDto

    // 2. Scan Message
    @POST("scan/message")
    suspend fun scanMessage(
        @Body body: MessageScanRequest
    ): ScanResultDto

    @POST("scan/message")
    suspend fun scanMessageMap(
        @Body body: Map<String, @JvmSuppressWildcards Any>
    ): ScanResultDto

    // 3. Scan Image (Multipart)
    @Multipart
    @POST("scan/image")
    suspend fun scanImage(
        @Part file: MultipartBody.Part?,
        @Part("payload") payload: RequestBody? = null
    ): ScanResultDto

    @POST("scan/image")
    suspend fun scanImageBase64(
        @Body body: ImageScanRequest
    ): ScanResultDto

    // 4. Scan QR
    @POST("scan/qr")
    suspend fun scanQr(
        @Body body: QRScanRequest
    ): ScanResultDto

    // 5. List Investigations
    @GET("investigations")
    suspend fun getInvestigations(
        @Query("page") page: Int? = null,
        @Query("limit") limit: Int? = null,
        @Query("risk_level") riskLevel: String? = null
    ): List<InvestigationDto>

    // 6. Get Investigation by ID
    @GET("investigations/{id}")
    suspend fun getInvestigationById(
        @Path("id") id: String
    ): InvestigationDto

    // 7. Delete Investigation
    @DELETE("investigations/{id}")
    suspend fun deleteInvestigation(
        @Path("id") id: String
    ): Map<String, Any>

    // 8. Query Threat Intelligence on Domain
    @POST("intelligence/domain")
    suspend fun getDomainIntelligence(
        @Body body: DomainIntelRequest
    ): ThreatIntelDto

    // 9. Register Device Telemetry
    @POST("devices/register")
    suspend fun registerDevice(
        @Body body: DeviceRegisterRequest
    ): DeviceDto

    // 10. List User Devices
    @GET("devices")
    suspend fun getDevices(): List<DeviceDto>

    // 11. Retrieve Dashboard Analytics Overview
    @GET("analytics/overview")
    suspend fun getAnalyticsOverview(): AnalyticsOverviewDto

    // 12. Get User Settings
    @GET("settings")
    suspend fun getSettings(): SettingsDto

    // 13. Update User Settings
    @PUT("settings")
    suspend fun updateSettings(
        @Body body: SettingsUpdateRequest
    ): SettingsDto

    // 14. List Demo Scenarios
    @GET("demo/scenarios")
    suspend fun getDemoScenarios(): List<DemoScenarioDto>

    // 15. Execute Demo Scenario
    @POST("demo/run/{id}")
    suspend fun runDemoScenario(
        @Path("id") id: String
    ): DemoRunResponseDto
}
