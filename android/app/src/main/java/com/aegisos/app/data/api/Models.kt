package com.aegisos.app.data.api

import com.google.gson.annotations.SerializedName

/**
 * Data Transfer Objects (DTOs) matching the AEGISOS Backend OpenAPI specification.
 */

// ----------------- Request Models -----------------

data class URLScanRequest(
    @SerializedName("url") val url: String,
    @SerializedName("depth") val depth: String? = "standard",
    @SerializedName("tags") val tags: List<String>? = emptyList()
)

data class MessageScanRequest(
    @SerializedName("message") val message: String,
    @SerializedName("sender") val sender: String? = null,
    @SerializedName("channel") val channel: String? = "sms",
    @SerializedName("metadata") val metadata: Map<String, Any>? = emptyMap()
)

data class ImageScanRequest(
    @SerializedName("image_base64") val imageBase64: String,
    @SerializedName("filename") val filename: String? = "image.png",
    @SerializedName("check_qr") val checkQr: Boolean? = true,
    @SerializedName("run_ocr") val runOcr: Boolean? = true
)

data class QRScanRequest(
    @SerializedName("qr_content") val qrContent: String? = null,
    @SerializedName("image_base64") val imageBase64: String? = null
)

data class DomainIntelRequest(
    @SerializedName("domain") val domain: String
)

data class DeviceRegisterRequest(
    @SerializedName("device_name") val deviceName: String,
    @SerializedName("device_type") val deviceType: String = "android",
    @SerializedName("os_version") val osVersion: String,
    @SerializedName("app_version") val appVersion: String,
    @SerializedName("fcm_token") val fcmToken: String? = null,
    @SerializedName("security_posture") val securityPosture: Map<String, Any>? = emptyMap()
)

data class SettingsUpdateRequest(
    @SerializedName("theme") val theme: String? = null,
    @SerializedName("ai_analysis_depth") val aiAnalysisDepth: String? = null,
    @SerializedName("auto_quarantine") val autoQuarantine: Boolean? = null,
    @SerializedName("telemetry_enabled") val telemetryEnabled: Boolean? = null,
    @SerializedName("email_alerts") val emailAlerts: Boolean? = null,
    @SerializedName("push_alerts") val pushAlerts: Boolean? = null,
    @SerializedName("sms_alerts") val smsAlerts: Boolean? = null,
    @SerializedName("custom_config") val customConfig: Map<String, Any>? = null
)

// ----------------- Response Models -----------------

data class ThreatIndicatorDto(
    @SerializedName("type") val type: String = "unknown",
    @SerializedName("value") val value: String = "",
    @SerializedName("severity") val severity: String = "medium",
    @SerializedName("confidence") val confidence: Double = 1.0,
    @SerializedName("description") val description: String? = null,
    @SerializedName("source") val source: String? = "heuristics"
)

data class ScanResultDto(
    @SerializedName("scan_id") val scanId: String,
    @SerializedName("target") val target: String,
    @SerializedName("target_type") val targetType: String,
    @SerializedName("status") val status: String = "completed",
    @SerializedName("risk_score") val riskScore: Double = 0.0,
    @SerializedName("risk_level") val riskLevel: String = "safe",
    @SerializedName("threat_category") val threatCategory: String? = "unknown",
    @SerializedName("summary") val summary: String = "",
    @SerializedName("indicators") val indicators: List<ThreatIndicatorDto> = emptyList(),
    @SerializedName("recommendations") val recommendations: List<String> = emptyList(),
    @SerializedName("details") val details: Map<String, Any> = emptyMap(),
    @SerializedName("created_at") val createdAt: String = ""
)

data class InvestigationDto(
    @SerializedName("id") val id: String,
    @SerializedName("user_id") val userId: String? = null,
    @SerializedName("title") val title: String = "",
    @SerializedName("input_type") val inputType: String = "",
    @SerializedName("input_data") val inputData: String = "",
    @SerializedName("status") val status: String = "completed",
    @SerializedName("risk_score") val riskScore: Double = 0.0,
    @SerializedName("risk_level") val riskLevel: String = "safe",
    @SerializedName("summary") val summary: String? = null,
    @SerializedName("full_report") val fullReport: Map<String, Any> = emptyMap(),
    @SerializedName("threat_indicators") val threatIndicators: List<ThreatIndicatorDto> = emptyList(),
    @SerializedName("created_at") val createdAt: String = "",
    @SerializedName("updated_at") val updatedAt: String = ""
)

data class ThreatIntelDto(
    @SerializedName("target") val target: String,
    @SerializedName("target_type") val targetType: String,
    @SerializedName("is_malicious") val isMalicious: Boolean = false,
    @SerializedName("risk_score") val riskScore: Double = 0.0,
    @SerializedName("categories") val categories: List<String> = emptyList(),
    @SerializedName("reputation") val reputation: String = "neutral",
    @SerializedName("dns_records") val dnsRecords: Map<String, Any>? = null,
    @SerializedName("rdap_info") val rdapInfo: Map<String, Any>? = null,
    @SerializedName("matched_rules") val matchedRules: List<String> = emptyList(),
    @SerializedName("details") val details: Map<String, Any> = emptyMap()
)

data class DeviceDto(
    @SerializedName("id") val id: String,
    @SerializedName("user_id") val userId: String,
    @SerializedName("device_name") val deviceName: String,
    @SerializedName("device_type") val deviceType: String,
    @SerializedName("os_version") val osVersion: String,
    @SerializedName("app_version") val appVersion: String,
    @SerializedName("is_active") val isActive: Boolean = true,
    @SerializedName("last_active_at") val lastActiveAt: String = "",
    @SerializedName("security_status") val securityStatus: Map<String, Any> = emptyMap(),
    @SerializedName("created_at") val createdAt: String = ""
)

data class AnalyticsOverviewDto(
    @SerializedName("total_scans") val totalScans: Int = 0,
    @SerializedName("threats_blocked") val threatsBlocked: Int = 0,
    @SerializedName("clean_items") val cleanItems: Int = 0,
    @SerializedName("avg_risk_score") val avgRiskScore: Double = 0.0,
    @SerializedName("critical_alerts") val criticalAlerts: Int = 0
)

data class SettingsDto(
    @SerializedName("user_id") val userId: String = "",
    @SerializedName("theme") val theme: String = "dark",
    @SerializedName("ai_analysis_depth") val aiAnalysisDepth: String = "standard",
    @SerializedName("auto_quarantine") val autoQuarantine: Boolean = false,
    @SerializedName("telemetry_enabled") val telemetryEnabled: Boolean = true,
    @SerializedName("notification_preferences") val notificationPreferences: Map<String, Any> = emptyMap(),
    @SerializedName("custom_config") val customConfig: Map<String, Any> = emptyMap()
)

data class DemoScenarioDto(
    @SerializedName("id") val id: String,
    @SerializedName("title") val title: String,
    @SerializedName("description") val description: String,
    @SerializedName("target_type") val targetType: String,
    @SerializedName("sample_data") val sampleData: String,
    @SerializedName("expected_threat") val expectedThreat: String,
    @SerializedName("severity") val severity: String
)

data class DemoRunResponseDto(
    @SerializedName("scenario_id") val scenarioId: String,
    @SerializedName("title") val title: String,
    @SerializedName("scan_result") val scanResult: ScanResultDto
)

data class SecurityEventDto(
    @SerializedName("id") val id: String,
    @SerializedName("user_id") val userId: String? = null,
    @SerializedName("device_id") val deviceId: String? = null,
    @SerializedName("event_type") val eventType: String,
    @SerializedName("severity") val severity: String,
    @SerializedName("details") val details: Map<String, Any> = emptyMap(),
    @SerializedName("created_at") val createdAt: String
)
