package com.aegisos.app.services

import android.content.Context
import android.content.pm.ApplicationInfo
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.os.Build
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * AppAuditResult:
 * Detailed risk analysis for an installed application.
 *
 * Requirements:
 * - name, packageName, permissions, riskLevel
 */
data class AppAuditResult(
    val name: String,
    val packageName: String,
    val permissions: List<String>,
    val riskLevel: String, // safe, low, medium, high, critical
    val riskScore: Int = 0,
    val dangerousCombinations: List<String> = emptyList(),
    val isSystemApp: Boolean = false
)

/**
 * AppAuditor:
 * Inspects installed applications on the device, evaluates requested permission sets,
 * and classifies systemic risk based on known attack vectors and hazardous permission combinations.
 *
 * Requirements:
 * - Queries PackageManager for installed apps
 * - Analyzes permissions per app
 * - Scores risk based on dangerous permission combinations (camera+internet+contacts = high risk, etc.)
 * - Returns list of AppAuditResult(name, packageName, permissions, riskLevel)
 */
class AppAuditor(private val context: Context) {

    private val packageManager: PackageManager = context.packageManager

    /**
     * Inspects all installed packages on the device asynchronously.
     */
    suspend fun auditInstalledApps(includeSystemApps: Boolean = false): List<AppAuditResult> =
        withContext(Dispatchers.IO) {
            val installedPackages = getInstalledPackagesCompat()
            val results = mutableListOf<AppAuditResult>()

            for (pkg in installedPackages) {
                val appInfo = pkg.applicationInfo ?: continue
                val isSystem = (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0

                if (isSystem && !includeSystemApps) {
                    continue
                }

                val appName = try {
                    packageManager.getApplicationLabel(appInfo).toString()
                } catch (e: Exception) {
                    pkg.packageName
                }

                val permissions = pkg.requestedPermissions?.toList() ?: emptyList()
                val analysis = evaluateAppRisk(permissions, isSystem)

                results.add(
                    AppAuditResult(
                        name = appName,
                        packageName = pkg.packageName,
                        permissions = permissions,
                        riskLevel = analysis.riskLevel,
                        riskScore = analysis.riskScore,
                        dangerousCombinations = analysis.flaggedCombinations,
                        isSystemApp = isSystem
                    )
                )
            }

            // Return highest risk applications first
            results.sortedByDescending { it.riskScore }
        }

    /**
     * Audits a specific package by package name.
     */
    fun auditPackage(packageName: String): AppAuditResult? {
        return try {
            val pkg = getPackageInfoCompat(packageName)
            val appInfo = pkg.applicationInfo ?: return null
            val isSystem = (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) != 0
            val appName = packageManager.getApplicationLabel(appInfo).toString()
            val permissions = pkg.requestedPermissions?.toList() ?: emptyList()
            val analysis = evaluateAppRisk(permissions, isSystem)

            AppAuditResult(
                name = appName,
                packageName = pkg.packageName,
                permissions = permissions,
                riskLevel = analysis.riskLevel,
                riskScore = analysis.riskScore,
                dangerousCombinations = analysis.flaggedCombinations,
                isSystemApp = isSystem
            )
        } catch (e: Exception) {
            null
        }
    }

    private data class RiskAnalysis(
        val riskScore: Int,
        val riskLevel: String,
        val flaggedCombinations: List<String>
    )

    /**
     * Evaluates permission set against cybersecurity threat matrices.
     */
    private fun evaluateAppRisk(permissions: List<String>, isSystem: Boolean): RiskAnalysis {
        if (permissions.isEmpty()) {
            return RiskAnalysis(0, "safe", emptyList())
        }

        val permSet = permissions.map { it.uppercase() }.toSet()
        val flagged = mutableListOf<String>()
        var score = 0

        val hasInternet = permSet.contains("ANDROID.PERMISSION.INTERNET")
        val hasCamera = permSet.contains("ANDROID.PERMISSION.CAMERA")
        val hasMic = permSet.contains("ANDROID.PERMISSION.RECORD_AUDIO")
        val hasContacts = permSet.contains("ANDROID.PERMISSION.READ_CONTACTS") ||
                permSet.contains("ANDROID.PERMISSION.WRITE_CONTACTS")
        val hasSms = permSet.contains("ANDROID.PERMISSION.READ_SMS") ||
                permSet.contains("ANDROID.PERMISSION.RECEIVE_SMS") ||
                permSet.contains("ANDROID.PERMISSION.SEND_SMS")
        val hasLocation = permSet.contains("ANDROID.PERMISSION.ACCESS_FINE_LOCATION") ||
                permSet.contains("ANDROID.PERMISSION.ACCESS_COARSE_LOCATION")
        val hasBackgroundLoc = permSet.contains("ANDROID.PERMISSION.ACCESS_BACKGROUND_LOCATION")
        val hasStorage = permSet.contains("ANDROID.PERMISSION.READ_EXTERNAL_STORAGE") ||
                permSet.contains("ANDROID.PERMISSION.WRITE_EXTERNAL_STORAGE") ||
                permSet.contains("ANDROID.PERMISSION.MANAGE_EXTERNAL_STORAGE")
        val hasOverlay = permSet.contains("ANDROID.PERMISSION.SYSTEM_ALERT_WINDOW")
        val hasAccessibility = permSet.contains("ANDROID.PERMISSION.BIND_ACCESSIBILITY_SERVICE")
        val hasInstallPackages = permSet.contains("ANDROID.PERMISSION.REQUEST_INSTALL_PACKAGES")
        val hasBootReceiver = permSet.contains("ANDROID.PERMISSION.RECEIVE_BOOT_COMPLETED")
        val hasPhoneState = permSet.contains("ANDROID.PERMISSION.READ_PHONE_STATE") ||
                permSet.contains("ANDROID.PERMISSION.READ_CALL_LOG")

        // 1. Combination: CAMERA + INTERNET + CONTACTS (High / Critical Risk Surveillance)
        if (hasCamera && hasInternet && hasContacts) {
            score += 45
            flagged.add("Surveillance Hazard: Camera, Internet & Contacts access combined")
        }

        // 2. Combination: SMS + INTERNET (Banking & OTP Hijacking Hazard)
        if (hasSms && hasInternet) {
            score += 50
            flagged.add("Financial/OTP Threat: SMS interception and Internet data transmission")
        }

        // 3. Combination: AUDIO + INTERNET + CONTACTS (Eavesdropping Hazard)
        if (hasMic && hasInternet && hasContacts) {
            score += 40
            flagged.add("Eavesdropping Hazard: Microphone, Internet & Contacts access combined")
        }

        // 4. Combination: OVERLAY + ACCESSIBILITY (Screen Hijacking & Tapjacking)
        if (hasOverlay || hasAccessibility) {
            score += 40
            if (hasOverlay && hasAccessibility) {
                score += 30
                flagged.add("Tapjacking Threat: Accessibility service and system window overlay")
            } else if (hasOverlay) {
                flagged.add("Display Overlay: Can draw over other applications")
            } else {
                flagged.add("Accessibility Binding: Can observe all user screen gestures")
            }
        }

        // 5. Combination: LOCATION + INTERNET + BACKGROUND (Persistent Tracking)
        if (hasLocation && hasInternet) {
            score += 20
            if (hasBackgroundLoc || hasBootReceiver) {
                score += 25
                flagged.add("Silent Tracking: Persistent background geolocation monitoring")
            } else {
                flagged.add("Geolocation Tracking: Fine location transmitted over network")
            }
        }

        // 6. Combination: PHONE STATE + INTERNET (Device Fingerprinting / Call Logging)
        if (hasPhoneState && hasInternet) {
            score += 20
            flagged.add("Identity Fingerprinting: Phone state / call logs and Internet access")
        }

        // 7. Combination: DROPPER HAZARD (Install packages + Internet)
        if (hasInstallPackages && hasInternet) {
            score += 30
            flagged.add("Dropper Threat: Requests permission to install arbitrary packages")
        }

        // 8. STORAGE + INTERNET (Data Exfiltration)
        if (hasStorage && hasInternet) {
            score += 15
        }

        // System apps receive risk dampening since they are pre-signed vendor binaries
        if (isSystem) {
            score = (score * 0.45f).toInt()
        }

        val clampedScore = score.coerceIn(0, 100)

        val riskLevel = when {
            clampedScore >= 70 -> "critical"
            clampedScore >= 45 -> "high"
            clampedScore >= 25 -> "medium"
            clampedScore > 0 -> "low"
            else -> "safe"
        }

        return RiskAnalysis(clampedScore, riskLevel, flagged)
    }

    private fun getInstalledPackagesCompat(): List<PackageInfo> {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            packageManager.getInstalledPackages(PackageManager.PackageInfoFlags.of(PackageManager.GET_PERMISSIONS.toLong()))
        } else {
            @Suppress("DEPRECATION")
            packageManager.getInstalledPackages(PackageManager.GET_PERMISSIONS)
        }
    }

    private fun getPackageInfoCompat(packageName: String): PackageInfo {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            packageManager.getPackageInfo(packageName, PackageManager.PackageInfoFlags.of(PackageManager.GET_PERMISSIONS.toLong()))
        } else {
            @Suppress("DEPRECATION")
            packageManager.getPackageInfo(packageName, PackageManager.GET_PERMISSIONS)
        }
    }
}
