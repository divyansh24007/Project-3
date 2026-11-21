package com.aegisos.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aegisos.app.ui.components.AegisTopAppBar

@Composable
fun SettingsScreen(
    modifier: Modifier = Modifier,
    onNavigateBack: (() -> Unit)? = null,
    onLogoutClick: () -> Unit = {}
) {
    // Notification toggles
    var notifyThreats by remember { mutableStateOf(true) }
    var notifyScans by remember { mutableStateOf(true) }
    var notifySinkhole by remember { mutableStateOf(false) }

    // Privacy toggles
    var anonymousTelemetry by remember { mutableStateOf(false) }
    var localOnlyAi by remember { mutableStateOf(true) }

    // API Server URL field
    var apiUrl by remember { mutableStateOf("http://10.0.2.2:8000/") }

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
                    title = "SETTINGS",
                    subtitle = "DAEMON CONFIG & SYSTEM PREFERENCES",
                    onBackClick = onNavigateBack
                )
            }

            // 1. Profile Section: avatar placeholder circle, name, email
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
                    shape = RoundedCornerShape(14.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF223049))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(18.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Avatar Placeholder Circle
                        Box(
                            modifier = Modifier
                                .size(64.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF080B12))
                                .border(2.dp, Color(0xFF00E5FF), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "AG",
                                color = Color(0xFF00E5FF),
                                fontSize = 22.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace
                            )
                        }

                        Column(
                            modifier = Modifier.weight(1f),
                            verticalArrangement = Arrangement.spacedBy(4.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Text(
                                    text = "Agent Aegis",
                                    color = Color(0xFFE2E8F0),
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Box(
                                    modifier = Modifier
                                        .clip(RoundedCornerShape(4.dp))
                                        .background(Color(0x3300E5FF))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "LVL 4",
                                        color = Color(0xFF00E5FF),
                                        fontSize = 9.sp,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                            }

                            Text(
                                text = "analyst@aegisos.internal",
                                color = Color(0xFF94A3B8),
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Monospace
                            )

                            Text(
                                text = "Security Operations Center • Administrator",
                                color = Color(0xFF64748B),
                                fontSize = 11.sp
                            )
                        }
                    }
                }
            }

            // 2. Notifications Toggles (Switch composables)
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
                        Text(
                            text = "NOTIFICATIONS PREFERENCES",
                            color = Color(0xFF00E5FF),
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )

                        SettingsSwitchRow(
                            title = "Critical Threat Alerts",
                            subtitle = "Immediate heads-up alert when malware/phishing is intercepted",
                            checked = notifyThreats,
                            onCheckedChange = { notifyThreats = it }
                        )

                        SettingsSwitchRow(
                            title = "Automated Background Scans",
                            subtitle = "Periodic integrity checks of app manifests and system storage",
                            checked = notifyScans,
                            onCheckedChange = { notifyScans = it }
                        )

                        SettingsSwitchRow(
                            title = "DNS Sinkhole Reports",
                            subtitle = "Daily summary of blocked trackers and suspicious domain requests",
                            checked = notifySinkhole,
                            onCheckedChange = { notifySinkhole = it }
                        )
                    }
                }
            }

            // 3. Privacy Toggle
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
                        Text(
                            text = "DATA PRIVACY & LOCAL PROCESSING",
                            color = Color(0xFF7C4DFF),
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )

                        SettingsSwitchRow(
                            title = "Anonymous Threat Telemetry",
                            subtitle = "Contribute non-identifiable malware hashes to global defense feed",
                            checked = anonymousTelemetry,
                            onCheckedChange = { anonymousTelemetry = it }
                        )

                        SettingsSwitchRow(
                            title = "Local-Only AI Processing",
                            subtitle = "Run heuristics strictly on-device without cloud inference sync",
                            checked = localOnlyAi,
                            onCheckedChange = { localOnlyAi = it }
                        )
                    }
                }
            }

            // 4. API Server URL Field
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
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "API SERVER BACKEND URL",
                            color = Color(0xFF94A3B8),
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )

                        OutlinedTextField(
                            value = apiUrl,
                            onValueChange = { apiUrl = it },
                            modifier = Modifier.fillMaxWidth(),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFF00E5FF),
                                unfocusedBorderColor = Color(0xFF223049),
                                focusedTextColor = Color(0xFFE2E8F0),
                                unfocusedTextColor = Color(0xFFE2E8F0),
                                cursorColor = Color(0xFF00E5FF)
                            ),
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.Dns,
                                    contentDescription = "Server",
                                    tint = Color(0xFF00E5FF)
                                )
                            },
                            singleLine = true
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "Status: Connected (24ms latency)",
                                color = Color(0xFF00E676),
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace
                            )

                            TextButton(
                                onClick = { /* Test connection */ },
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "PING SERVER",
                                    color = Color(0xFF00E5FF),
                                    fontSize = 11.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }
                }
            }

            // 5. About Section with Version
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
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Text(
                            text = "ABOUT AEGISOS MOBILE SENTINEL",
                            color = Color(0xFF94A3B8),
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Version", color = Color(0xFF64748B), fontSize = 12.sp)
                            Text("1.0.0 (Build 2026.11)", color = Color(0xFFE2E8F0), fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Security Core", color = Color(0xFF64748B), fontSize = 12.sp)
                            Text("Gemini AI Sentinel v2.5", color = Color(0xFF00E5FF), fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text("Sandbox Engine", color = Color(0xFF64748B), fontSize = 12.sp)
                            Text("Android 14 Isolation Layer", color = Color(0xFFE2E8F0), fontSize = 12.sp, fontFamily = FontFamily.Monospace)
                        }
                    }
                }
            }

            // 6. Logout Button (Red)
            item {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                ) {
                    Button(
                        onClick = onLogoutClick,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(50.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFFF3D57)),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.ExitToApp,
                            contentDescription = "Logout",
                            tint = Color.White
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "LOGOUT & PURGE LOCAL CACHE",
                            color = Color.White,
                            fontWeight = FontWeight.Bold,
                            fontFamily = FontFamily.Monospace,
                            letterSpacing = 0.5.sp
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun SettingsSwitchRow(
    title: String,
    subtitle: String,
    checked: Boolean,
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
                fontSize = 13.sp,
                fontWeight = FontWeight.Medium
            )
            Text(
                text = subtitle,
                color = Color(0xFF64748B),
                fontSize = 11.sp,
                lineHeight = 15.sp
            )
        }
        Spacer(modifier = Modifier.width(12.dp))
        Switch(
            checked = checked,
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
