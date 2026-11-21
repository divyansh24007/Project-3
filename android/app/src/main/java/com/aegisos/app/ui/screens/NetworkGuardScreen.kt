package com.aegisos.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
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

data class NetworkConnectionLog(
    val id: String,
    val host: String,
    val protocol: String,
    val isBlocked: Boolean,
    val timestamp: String,
    val ruleTriggered: String? = null
)

@Composable
fun NetworkGuardScreen(
    modifier: Modifier = Modifier,
    onNavigateBack: (() -> Unit)? = null
) {
    var isProtectionActive by remember { mutableStateOf(true) }
    var filterMalware by remember { mutableStateOf(true) }
    var filterTrackers by remember { mutableStateOf(true) }
    var filterCrypto by remember { mutableStateOf(true) }

    val recentConnections = remember {
        listOf(
            NetworkConnectionLog("1", "api.aegisos.internal:443", "HTTPS", false, "2s ago"),
            NetworkConnectionLog("2", "telemetry.adtracker-mobile.net:53", "DNS", true, "9s ago", "Adware Tracker Filter"),
            NetworkConnectionLog("3", "c2-pool.botnet-node.su:8080", "TCP", true, "34s ago", "C2 Command & Control Beacon"),
            NetworkConnectionLog("4", "firebaseinstallations.googleapis.com:443", "HTTPS", false, "1m ago"),
            NetworkConnectionLog("5", "tracking.fingerprint.io:443", "HTTPS", true, "4m ago", "Fingerprinting Script"),
            NetworkConnectionLog("6", "cloudflare-dns.com:853", "DoT", false, "8m ago")
        )
    }

    Surface(
        modifier = modifier.fillMaxSize(),
        color = Color(0xFF080B12)
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Top App Bar
            item {
                AegisTopAppBar(
                    title = "NETWORKGUARD",
                    subtitle = "DNS TRAFFIC SENTINEL & VPN FIREWALL",
                    onBackClick = onNavigateBack
                )
            }

            // Banner: "Prototype - Local DNS-level filtering only"
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFFB300).copy(alpha = 0.6f))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .size(32.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(Color(0x33FFB300)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.Info,
                                contentDescription = "Prototype Info",
                                tint = Color(0xFFFFB300),
                                modifier = Modifier.size(18.dp)
                            )
                        }

                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = "Prototype - Local DNS-level filtering only",
                                color = Color(0xFFFFB300),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace
                            )
                            Text(
                                text = "Inspects local loopback DNS requests on device. No remote VPN proxy is required; network packets are evaluated locally in memory.",
                                color = Color(0xFF94A3B8),
                                fontSize = 11.sp,
                                lineHeight = 15.sp
                            )
                        }
                    }
                }
            }

            // Protection Toggle & Status Card: "VPN Protection: Active/Inactive"
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
                    shape = RoundedCornerShape(16.dp),
                    border = androidx.compose.foundation.BorderStroke(
                        1.dp,
                        if (isProtectionActive) Color(0xFF00E5FF).copy(alpha = 0.5f) else Color(0xFF223049)
                    )
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(20.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(46.dp)
                                        .clip(CircleShape)
                                        .background(
                                            if (isProtectionActive) Color(0x2200E5FF) else Color(0x2264748B)
                                        )
                                        .border(
                                            1.dp,
                                            if (isProtectionActive) Color(0xFF00E5FF) else Color(0xFF64748B),
                                            CircleShape
                                        ),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = if (isProtectionActive) Icons.Default.VpnLock else Icons.Default.VpnKeyOff,
                                        contentDescription = "VPN Status",
                                        tint = if (isProtectionActive) Color(0xFF00E5FF) else Color(0xFF64748B),
                                        modifier = Modifier.size(24.dp)
                                    )
                                }

                                Column {
                                    Text(
                                        text = if (isProtectionActive) "VPN Protection: Active" else "VPN Protection: Inactive",
                                        color = if (isProtectionActive) Color(0xFF00E5FF) else Color(0xFF94A3B8),
                                        fontSize = 16.sp,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace
                                    )
                                    Text(
                                        text = if (isProtectionActive) "Encrypted Local DNS Sinkhole" else "Protection Paused by User",
                                        color = Color(0xFF64748B),
                                        fontSize = 11.sp
                                    )
                                }
                            }

                            // Large Styled Protection Toggle Switch
                            Switch(
                                checked = isProtectionActive,
                                onCheckedChange = { isProtectionActive = it },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color(0xFF080B12),
                                    checkedTrackColor = Color(0xFF00E5FF),
                                    uncheckedThumbColor = Color(0xFF94A3B8),
                                    uncheckedTrackColor = Color(0xFF1E293B)
                                )
                            )
                        }

                        HorizontalDivider(color = Color(0xFF223049))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Column {
                                Text("LOOPBACK RESOLVER", color = Color(0xFF64748B), fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                                Text("127.0.0.1:5353", color = Color(0xFFE2E8F0), fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                            }
                            Column(horizontalAlignment = Alignment.End) {
                                Text("ENCRYPTION", color = Color(0xFF64748B), fontSize = 10.sp, fontFamily = FontFamily.Monospace)
                                Text("DNS-over-HTTPS (DoH)", color = Color(0xFF00E676), fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                            }
                        }
                    }
                }
            }

            // Stats: Connections Monitored, Threats Blocked
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Card(
                        modifier = Modifier.weight(1f),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF223049))
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp)
                        ) {
                            Text(
                                text = "CONNECTIONS MONITORED",
                                color = Color(0xFF94A3B8),
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = if (isProtectionActive) "1,428" else "Paused",
                                color = Color(0xFF00E5FF),
                                fontSize = 22.sp,
                                fontWeight = FontWeight.ExtraBold,
                                fontFamily = FontFamily.Monospace
                            )
                            Text(
                                text = "Last 24 hours",
                                color = Color(0xFF64748B),
                                fontSize = 10.sp
                            )
                        }
                    }

                    Card(
                        modifier = Modifier.weight(1f),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF223049))
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(14.dp)
                        ) {
                            Text(
                                text = "THREATS BLOCKED",
                                color = Color(0xFF94A3B8),
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = if (isProtectionActive) "47" else "47",
                                color = Color(0xFFFF1744),
                                fontSize = 22.sp,
                                fontWeight = FontWeight.ExtraBold,
                                fontFamily = FontFamily.Monospace
                            )
                            Text(
                                text = "Prevented leaks",
                                color = Color(0xFF64748B),
                                fontSize = 10.sp
                            )
                        }
                    }
                }
            }

            // Blocklist Section
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
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "FILTER RULES & BLOCKLIST",
                                color = Color(0xFF00E5FF),
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "148,290 Rules",
                                color = Color(0xFF64748B),
                                fontSize = 10.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }

                        // Filter rule item 1
                        BlocklistRuleRow(
                            title = "Malware & Phishing Domains",
                            ruleCount = "82,100 domains",
                            isChecked = filterMalware,
                            onCheckedChange = { filterMalware = it }
                        )

                        // Filter rule item 2
                        BlocklistRuleRow(
                            title = "Telemetry & Device Trackers",
                            ruleCount = "41,200 domains",
                            isChecked = filterTrackers,
                            onCheckedChange = { filterTrackers = it }
                        )

                        // Filter rule item 3
                        BlocklistRuleRow(
                            title = "Crypto Mining & C2 Infrastructure",
                            ruleCount = "24,990 domains",
                            isChecked = filterCrypto,
                            onCheckedChange = { filterCrypto = it }
                        )
                    }
                }
            }

            // Recent Connections Log (LazyColumn items)
            item {
                Text(
                    text = "RECENT CONNECTIONS LOG (LIVE)",
                    color = Color(0xFF94A3B8),
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.padding(horizontal = 16.dp)
                )
            }

            items(recentConnections) { log ->
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
                    shape = RoundedCornerShape(10.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF223049))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(12.dp),
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
                                    .size(32.dp)
                                    .clip(RoundedCornerShape(8.dp))
                                    .background(if (log.isBlocked) Color(0x33FF1744) else Color(0x2200E676)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = if (log.isBlocked) Icons.Default.Block else Icons.Default.Check,
                                    contentDescription = null,
                                    tint = if (log.isBlocked) Color(0xFFFF1744) else Color(0xFF00E676),
                                    modifier = Modifier.size(16.dp)
                                )
                            }

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = log.host,
                                    color = Color(0xFFE2E8F0),
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    fontFamily = FontFamily.Monospace,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                                Text(
                                    text = "${log.protocol} • ${log.timestamp}${if (log.ruleTriggered != null) " • ${log.ruleTriggered}" else ""}",
                                    color = Color(0xFF64748B),
                                    fontSize = 10.sp,
                                    maxLines = 1,
                                    overflow = TextOverflow.Ellipsis
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(8.dp))

                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(4.dp))
                                .background(if (log.isBlocked) Color(0x33FF1744) else Color(0x2200E676))
                                .padding(horizontal = 6.dp, vertical = 2.dp)
                        ) {
                            Text(
                                text = if (log.isBlocked) "BLOCKED" else "ALLOWED",
                                color = if (log.isBlocked) Color(0xFFFF5252) else Color(0xFF00E676),
                                fontSize = 9.sp,
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

@Composable
fun BlocklistRuleRow(
    title: String,
    ruleCount: String,
    isChecked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                color = Color(0xFFE2E8F0),
                fontSize = 12.sp,
                fontWeight = FontWeight.Medium
            )
            Text(
                text = ruleCount,
                color = Color(0xFF64748B),
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace
            )
        }
        Switch(
            checked = isChecked,
            onCheckedChange = onCheckedChange,
            colors = SwitchDefaults.colors(
                checkedThumbColor = Color(0xFF080B12),
                checkedTrackColor = Color(0xFF00E5FF),
                uncheckedThumbColor = Color(0xFF64748B),
                uncheckedTrackColor = Color(0xFF1E293B)
            )
        )
    }
}
