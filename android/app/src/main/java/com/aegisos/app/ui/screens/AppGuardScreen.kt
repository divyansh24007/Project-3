package com.aegisos.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aegisos.app.ui.components.AegisTopAppBar
import com.aegisos.app.ui.components.RiskBadge
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class AppSecurityEntry(
    val id: String,
    val name: String,
    val packageName: String,
    val permissionCount: Int,
    val riskLevel: String,
    val riskScore: Int,
    val permissions: List<AppPermissionDetail>,
    val notes: String
)

data class AppPermissionDetail(
    val name: String,
    val isDangerous: Boolean,
    val explanation: String
)

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun AppGuardScreen(
    modifier: Modifier = Modifier,
    onNavigateBack: (() -> Unit)? = null
) {
    var isScanning by remember { mutableStateOf(false) }
    var expandedAppIds by remember { mutableStateOf(setOf<String>()) }
    val coroutineScope = rememberCoroutineScope()

    val appsList = remember {
        listOf(
            AppSecurityEntry(
                id = "1",
                name = "Aegis Shield Core",
                packageName = "com.aegisos.app",
                permissionCount = 3,
                riskLevel = "Safe",
                riskScore = 5,
                permissions = listOf(
                    AppPermissionDetail("INTERNET", false, "Required for threat definitions sync"),
                    AppPermissionDetail("ACCESS_NETWORK_STATE", false, "Checks local connectivity"),
                    AppPermissionDetail("POST_NOTIFICATIONS", false, "Sends real-time threat alerts")
                ),
                notes = "Verified system security daemon with minimal attack surface."
            ),
            AppSecurityEntry(
                id = "2",
                name = "FastClean Booster Pro",
                packageName = "com.booster.fastcleaner",
                permissionCount = 24,
                riskLevel = "Critical",
                riskScore = 95,
                permissions = listOf(
                    AppPermissionDetail("BIND_ACCESSIBILITY_SERVICE", true, "Can read screen and hijack touches"),
                    AppPermissionDetail("SYSTEM_ALERT_WINDOW", true, "Can draw deceptive overlay dialogs"),
                    AppPermissionDetail("READ_EXTERNAL_STORAGE", true, "Unrestricted access to user files"),
                    AppPermissionDetail("READ_PHONE_STATE", true, "Extracts IMEI, SIM and carrier identifiers"),
                    AppPermissionDetail("RECEIVE_BOOT_COMPLETED", false, "Persists stealth daemon across reboot")
                ),
                notes = "Known adware/trojan dropper masquerading as cleaner utility. Immediate quarantine recommended."
            ),
            AppSecurityEntry(
                id = "3",
                name = "Super Bright Flashlight",
                packageName = "com.tool.brightlight",
                permissionCount = 14,
                riskLevel = "Warning",
                riskScore = 68,
                permissions = listOf(
                    AppPermissionDetail("ACCESS_FINE_LOCATION", true, "GPS location collected for simple flashlight"),
                    AppPermissionDetail("READ_CONTACTS", true, "Suspicious contact directory exfiltration"),
                    AppPermissionDetail("CAMERA", true, "Required for LED hardware toggle"),
                    AppPermissionDetail("INTERNET", false, "Transmits tracking data to ad servers")
                ),
                notes = "Excessive privilege escalation for basic utility tool."
            ),
            AppSecurityEntry(
                id = "4",
                name = "Nova Apex Launcher",
                packageName = "com.teslacoilsw.launcher",
                permissionCount = 8,
                riskLevel = "Safe",
                riskScore = 12,
                permissions = listOf(
                    AppPermissionDetail("SET_WALLPAPER", false, "Required for launcher customization"),
                    AppPermissionDetail("EXPAND_STATUS_BAR", false, "Quick settings gesture interaction"),
                    AppPermissionDetail("VIBRATE", false, "Haptic feedback for app drawer")
                ),
                notes = "Standard system launcher behavior matching sandbox norms."
            ),
            AppSecurityEntry(
                id = "5",
                name = "CryptoWallet Multi-X",
                packageName = "com.fakecrypto.walletx",
                permissionCount = 19,
                riskLevel = "Critical",
                riskScore = 92,
                permissions = listOf(
                    AppPermissionDetail("SYSTEM_ALERT_WINDOW", true, "Keystroke / screen overlay risk"),
                    AppPermissionDetail("READ_CLIPBOARD", true, "Harvests cryptocurrency seed phrases"),
                    AppPermissionDetail("QUERY_ALL_PACKAGES", true, "Enumerates banking and financial apps"),
                    AppPermissionDetail("REQUEST_INSTALL_PACKAGES", true, "Attempts side-loading unauthorized APKs")
                ),
                notes = "Malicious fake wallet designed to steal private keys from device clipboard."
            ),
            AppSecurityEntry(
                id = "6",
                name = "DocuPDF Reader Ultra",
                packageName = "com.office.pdfultra",
                permissionCount = 11,
                riskLevel = "Caution",
                riskScore = 44,
                permissions = listOf(
                    AppPermissionDetail("READ_EXTERNAL_STORAGE", true, "PDF document retrieval"),
                    AppPermissionDetail("WRITE_EXTERNAL_STORAGE", true, "PDF export and caching"),
                    AppPermissionDetail("INTERNET", false, "Remote analytics and cloud font sync")
                ),
                notes = "Requests broad storage instead of scoped storage framework."
            ),
            AppSecurityEntry(
                id = "7",
                name = "Signal Secure Messenger",
                packageName = "org.whispersystems.securechat",
                permissionCount = 12,
                riskLevel = "Safe",
                riskScore = 8,
                permissions = listOf(
                    AppPermissionDetail("CAMERA", true, "Encrypted video calling and attachment capture"),
                    AppPermissionDetail("RECORD_AUDIO", true, "Encrypted voice messaging"),
                    AppPermissionDetail("READ_CONTACTS", true, "Cryptographic contact discovery"),
                    AppPermissionDetail("POST_NOTIFICATIONS", false, "Message delivery push alerts")
                ),
                notes = "Audited open-source cryptography with standard communication scopes."
            ),
            AppSecurityEntry(
                id = "8",
                name = "Battery Doctor Optimizer",
                packageName = "com.power.batterybooster",
                permissionCount = 16,
                riskLevel = "Warning",
                riskScore = 72,
                permissions = listOf(
                    AppPermissionDetail("PACKAGE_USAGE_STATS", true, "Monitors foreground app usage history"),
                    AppPermissionDetail("KILL_BACKGROUND_PROCESSES", false, "Aggressive process termination"),
                    AppPermissionDetail("SYSTEM_ALERT_WINDOW", true, "Displays lock screen advertisements"),
                    AppPermissionDetail("WAKE_LOCK", false, "Prevents deep CPU sleep cycles")
                ),
                notes = "Misleading optimization tool triggering unnecessary background wakefulness."
            )
        )
    }

    Surface(
        modifier = modifier.fillMaxSize(),
        color = Color(0xFF080B12)
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            // Top App Bar
            item {
                AegisTopAppBar(
                    title = "APPGUARD SENTINEL",
                    subtitle = "APP PERMISSION AUDIT & SANDBOX",
                    onBackClick = onNavigateBack
                )
            }

            // "Scan Installed Apps" Button & Summary Card
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
                    shape = RoundedCornerShape(14.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF223049))
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column {
                                Text(
                                    text = "INSTALLED APPS INVENTORY",
                                    color = Color(0xFF94A3B8),
                                    fontSize = 11.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "8 Monitored • 2 Critical Threats",
                                    color = Color(0xFFE2E8F0),
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }

                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(6.dp))
                                    .background(Color(0x22FF1744))
                                    .border(1.dp, Color(0xFFFF1744), RoundedCornerShape(6.dp))
                                    .padding(horizontal = 8.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = "ACTION NEEDED",
                                    color = Color(0xFFFF5252),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }

                        Button(
                            onClick = {
                                coroutineScope.launch {
                                    isScanning = true
                                    delay(1200)
                                    isScanning = false
                                }
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00E5FF)),
                            shape = RoundedCornerShape(10.dp),
                            enabled = !isScanning
                        ) {
                            if (isScanning) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    color = Color(0xFF080B12),
                                    strokeWidth = 2.dp
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "SCANNING APK MANIFESTS...",
                                    color = Color(0xFF080B12),
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace
                                )
                            } else {
                                Icon(
                                    imageVector = Icons.Default.Security,
                                    contentDescription = "Scan Apps",
                                    tint = Color(0xFF080B12)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "SCAN INSTALLED APPS",
                                    color = Color(0xFF080B12),
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }
                    }
                }
            }

            // Section Header
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 2.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "APPLICATIONS (${appsList.size})",
                        color = Color(0xFF94A3B8),
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Tap card to view permissions",
                        color = Color(0xFF64748B),
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            // LazyColumn of ~8 app cards with tap to expand permissions
            items(appsList) { app ->
                val isExpanded = expandedAppIds.contains(app.id)

                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .clickable {
                            expandedAppIds = if (isExpanded) {
                                expandedAppIds - app.id
                            } else {
                                expandedAppIds + app.id
                            }
                        },
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (isExpanded) Color(0xFF00E5FF).copy(alpha = 0.5f) else Color(0xFF223049)
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        // Header Row: Icon + Name/Package + Badges
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(
                                modifier = Modifier.weight(1f),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(38.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(Color(0xFF080B12))
                                        .border(1.dp, Color(0xFF223049), RoundedCornerShape(8.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Android,
                                        contentDescription = app.name,
                                        tint = when (app.riskLevel.lowercase()) {
                                            "critical" -> Color(0xFFFF1744)
                                            "warning" -> Color(0xFFFF9100)
                                            "caution" -> Color(0xFFFFB300)
                                            else -> Color(0xFF00E676)
                                        },
                                        modifier = Modifier.size(22.dp)
                                    )
                                }

                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = app.name,
                                        color = Color(0xFFE2E8F0),
                                        fontSize = 14.sp,
                                        fontWeight = FontWeight.Bold,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(
                                        text = app.packageName,
                                        color = Color(0xFF64748B),
                                        fontSize = 11.sp,
                                        fontFamily = FontFamily.Monospace,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.width(8.dp))

                            // Badges: Permission count badge + Risk Level badge
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(6.dp))
                                        .background(Color(0xFF1E293B))
                                        .padding(horizontal = 6.dp, vertical = 3.dp)
                                ) {
                                    Text(
                                        text = "${app.permissionCount} Perms",
                                        color = Color(0xFF94A3B8),
                                        fontSize = 10.sp,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }

                                RiskBadge(riskLevel = app.riskLevel)
                            }
                        }

                        // Expanded Permissions Content
                        AnimatedVisibility(
                            visible = isExpanded,
                            enter = fadeIn() + expandVertically(),
                            exit = fadeOut() + shrinkVertically()
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(top = 8.dp),
                                verticalArrangement = Arrangement.spacedBy(10.dp)
                            ) {
                                HorizontalDivider(color = Color(0xFF223049))

                                Text(
                                    text = "PERMISSIONS AUDIT & CAPABILITIES:",
                                    color = Color(0xFF00E5FF),
                                    fontSize = 11.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold
                                )

                                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                    app.permissions.forEach { perm ->
                                        Row(
                                            modifier = Modifier
                                                .fillMaxWidth()
                                                .clip(RoundedCornerShape(6.dp))
                                                .background(Color(0xFF080B12))
                                                .padding(8.dp),
                                            verticalAlignment = Alignment.CenterVertically,
                                            horizontalArrangement = Arrangement.SpaceBetween
                                        ) {
                                            Column(modifier = Modifier.weight(1f)) {
                                                Text(
                                                    text = perm.name,
                                                    color = if (perm.isDangerous) Color(0xFFFF5252) else Color(0xFFCBD5E1),
                                                    fontSize = 11.sp,
                                                    fontWeight = FontWeight.Bold,
                                                    fontFamily = FontFamily.Monospace
                                                )
                                                Text(
                                                    text = perm.explanation,
                                                    color = Color(0xFF64748B),
                                                    fontSize = 10.sp
                                                )
                                            }
                                            if (perm.isDangerous) {
                                                Box(
                                                    modifier = Modifier
                                                        .clip(RoundedCornerShape(4.dp))
                                                        .background(Color(0x33FF1744))
                                                        .padding(horizontal = 5.dp, vertical = 2.dp)
                                                ) {
                                                    Text(
                                                        text = "DANGEROUS",
                                                        color = Color(0xFFFF5252),
                                                        fontSize = 9.sp,
                                                        fontWeight = FontWeight.Bold,
                                                        fontFamily = FontFamily.Monospace
                                                    )
                                                }
                                            }
                                        }
                                    }
                                }

                                Text(
                                    text = "Analysis Note: ${app.notes}",
                                    color = Color(0xFF94A3B8),
                                    fontSize = 11.sp,
                                    fontFamily = FontFamily.Monospace
                                )

                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Button(
                                        onClick = { /* Action */ },
                                        modifier = Modifier.weight(1f),
                                        colors = ButtonDefaults.buttonColors(
                                            containerColor = if (app.riskLevel.equals("critical", ignoreCase = true)) {
                                                Color(0xFFFF1744)
                                            } else {
                                                Color(0xFF223049)
                                            }
                                        ),
                                        shape = RoundedCornerShape(8.dp)
                                    ) {
                                        Text(
                                            text = if (app.riskLevel.equals("critical", ignoreCase = true)) "QUARANTINE APK" else "REVOKE PERMISSIONS",
                                            fontSize = 11.sp,
                                            fontWeight = FontWeight.Bold,
                                            fontFamily = FontFamily.Monospace
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
