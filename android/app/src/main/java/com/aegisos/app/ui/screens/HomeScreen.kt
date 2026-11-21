package com.aegisos.app.ui.screens

import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
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
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aegisos.app.ui.components.AegisTopAppBar
import com.aegisos.app.ui.components.RiskBadge

// Security Event Data Model
data class SecurityEvent(
    val id: String,
    val title: String,
    val description: String,
    val timestamp: String,
    val severity: String,
    val severityColor: Color,
    val module: String
)

// Protection Module Data Model
data class ProtectionModule(
    val id: String,
    val name: String,
    val icon: ImageVector,
    val isActive: Boolean,
    val description: String
)

@Composable
fun HomeScreen(
    modifier: Modifier = Modifier,
    onNavigateToScanner: () -> Unit = {},
    onNavigateToGuard: () -> Unit = {},
    onNavigateToInvestigations: () -> Unit = {},
    onNavigateToSettings: () -> Unit = {},
    onNavigateToModule: (String) -> Unit = {},
    onQuickScanClick: () -> Unit = {}
) {
    var animationTriggered by remember { mutableStateOf(false) }

    LaunchedEffect(Unit) {
        animationTriggered = true
    }

    val animatedScoreProgress by animateFloatAsState(
        targetValue = if (animationTriggered) 0.85f else 0f,
        animationSpec = tween(durationMillis = 1400),
        label = "TrustScoreAnimation"
    )

    val modules = remember {
        listOf(
            ProtectionModule("web", "WebGuard", Icons.Outlined.Language, true, "Zero-Day Phishing Filter"),
            ProtectionModule("msg", "MessageGuard", Icons.Outlined.Forum, true, "SMS & Chat Analysis"),
            ProtectionModule("media", "MediaGuard", Icons.Outlined.PermMedia, true, "Forensic QR & OCR"),
            ProtectionModule("app", "AppGuard", Icons.Outlined.Security, true, "Sandbox & Permissions"),
            ProtectionModule("net", "NetworkGuard", Icons.Outlined.VpnLock, true, "Local DNS Filter"),
            ProtectionModule("ai", "AI Engine", Icons.Outlined.SmartToy, true, "Gemini Threat Core")
        )
    }

    val recentEvents = remember {
        listOf(
            SecurityEvent(
                id = "1",
                title = "Phishing URL Intercepted",
                description = "Blocked access to chase-security-auth.online",
                timestamp = "2m ago",
                severity = "CRITICAL",
                severityColor = Color(0xFFFF1744),
                module = "WebGuard"
            ),
            SecurityEvent(
                id = "2",
                title = "Malicious APK Quarantined",
                description = "Blocked install of FastClean_v3.apk with stealth trojan",
                timestamp = "18m ago",
                severity = "MALICIOUS",
                severityColor = Color(0xFFFF3D57),
                module = "AppGuard"
            ),
            SecurityEvent(
                id = "3",
                title = "Suspicious SMS Flagged",
                description = "Bank impersonation OTP request detected and isolated",
                timestamp = "1h ago",
                severity = "WARNING",
                severityColor = Color(0xFFFFB300),
                module = "MessageGuard"
            ),
            SecurityEvent(
                id = "4",
                title = "Ad & Tracker Query Blocked",
                description = "telemetry.fingerprint.io routed to local sinkhole",
                timestamp = "3h ago",
                severity = "CAUTION",
                severityColor = Color(0xFF7C4DFF),
                module = "NetworkGuard"
            ),
            SecurityEvent(
                id = "5",
                title = "System Integrity Verified",
                description = "Kernel sandbox and process permissions match baseline",
                timestamp = "5h ago",
                severity = "SAFE",
                severityColor = Color(0xFF00E676),
                module = "AI Engine"
            )
        )
    }

    Surface(
        modifier = modifier.fillMaxSize(),
        color = Color(0xFF080B12)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            LazyColumn(
                modifier = Modifier.fillMaxSize(),
                contentPadding = PaddingValues(bottom = 96.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp)
            ) {
                // Top App Bar
                item {
                    AegisTopAppBar(
                        title = "AEGISOS SENTINEL",
                        subtitle = "SYS-STATUS: SHIELD ACTIVE",
                        actions = {
                            IconButton(onClick = onNavigateToSettings) {
                                Icon(
                                    imageVector = Icons.Default.Settings,
                                    contentDescription = "Settings",
                                    tint = Color(0xFF94A3B8)
                                )
                            }
                        }
                    )
                }

                // 1. Trust Score Canvas Arc
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
                        shape = RoundedCornerShape(16.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF223049))
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = "SYSTEM TRUST SCORE",
                                color = Color(0xFF94A3B8),
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold,
                                letterSpacing = 1.sp
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            Box(
                                modifier = Modifier.size(190.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Canvas(modifier = Modifier.fillMaxSize()) {
                                    val strokeWidth = 14.dp.toPx()
                                    val arcSize = size.minDimension - strokeWidth
                                    val startAngle = 145f
                                    val sweepMax = 250f

                                    // Background Track Arc
                                    drawArc(
                                        color = Color(0xFF1E293B),
                                        startAngle = startAngle,
                                        sweepAngle = sweepMax,
                                        useCenter = false,
                                        style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                                    )

                                    // Animated Foreground Gradient Arc
                                    val gradientBrush = Brush.sweepGradient(
                                        0.0f to Color(0xFF7C4DFF),
                                        0.5f to Color(0xFF00E5FF),
                                        1.0f to Color(0xFF00E676)
                                    )

                                    drawArc(
                                        brush = gradientBrush,
                                        startAngle = startAngle,
                                        sweepAngle = sweepMax * animatedScoreProgress,
                                        useCenter = false,
                                        style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                                    )
                                }

                                // Center score display
                                Column(
                                    horizontalAlignment = Alignment.CenterVertically,
                                    verticalArrangement = Arrangement.Center
                                ) {
                                    val displayScore = (85 * animatedScoreProgress / 0.85f).toInt()
                                    Text(
                                        text = "$displayScore",
                                        color = Color(0xFF00E5FF),
                                        fontSize = 46.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        fontFamily = FontFamily.Monospace
                                    )
                                    Text(
                                        text = "OUT OF 100",
                                        color = Color(0xFF64748B),
                                        fontSize = 10.sp,
                                        fontFamily = FontFamily.Monospace,
                                        letterSpacing = 0.5.sp
                                    )
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        horizontalArrangement = Arrangement.spacedBy(4.dp)
                                    ) {
                                        Box(
                                            modifier = Modifier
                                                .size(6.dp)
                                                .clip(CircleShape)
                                                .background(Color(0xFF00E676))
                                        )
                                        Text(
                                            text = "OPTIMAL INTEGRITY",
                                            color = Color(0xFF00E676),
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(14.dp))

                            Text(
                                text = "Zero vulnerabilities detected in active sandbox memory",
                                color = Color(0xFF94A3B8),
                                fontSize = 12.sp,
                                textAlign = androidx.compose.ui.text.style.TextAlign.Center
                            )
                        }
                    }
                }

                // 2. Row of 4 Stat Cards
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            StatCard(
                                title = "Investigations",
                                value = "24",
                                subtitle = "Audit logs",
                                icon = Icons.Outlined.Search,
                                accentColor = Color(0xFF00E5FF),
                                modifier = Modifier.weight(1f)
                            )
                            StatCard(
                                title = "Threats Found",
                                value = "8",
                                subtitle = "High severity",
                                icon = Icons.Outlined.WarningAmber,
                                accentColor = Color(0xFFFF3D57),
                                modifier = Modifier.weight(1f)
                            )
                        }
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            StatCard(
                                title = "Blocked",
                                value = "6",
                                subtitle = "Intercepted",
                                icon = Icons.Outlined.Block,
                                accentColor = Color(0xFF7C4DFF),
                                modifier = Modifier.weight(1f)
                            )
                            StatCard(
                                title = "Active Modules",
                                value = "5",
                                subtitle = "Of 6 loaded",
                                icon = Icons.Outlined.CheckCircle,
                                accentColor = Color(0xFF00E676),
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }
                }

                // 3. Protection Modules Section (LazyRow of 6 cards)
                item {
                    Column(modifier = Modifier.fillMaxWidth()) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 4.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .clip(CircleShape)
                                        .background(Color(0xFF00E5FF))
                                )
                                Text(
                                    text = "PROTECTION MODULES",
                                    color = Color(0xFFE2E8F0),
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace,
                                    letterSpacing = 0.5.sp
                                )
                            }
                            Text(
                                text = "6 Active",
                                color = Color(0xFF00E5FF),
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        LazyRow(
                            modifier = Modifier.fillMaxWidth(),
                            contentPadding = PaddingValues(horizontal = 16.dp),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            items(modules) { module ->
                                ModuleCard(
                                    module = module,
                                    onClick = { onNavigateToModule(module.id) }
                                )
                            }
                        }
                    }
                }

                // 4. Recent Events Section
                item {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .clip(CircleShape)
                                        .background(Color(0xFF7C4DFF))
                                )
                                Text(
                                    text = "RECENT EVENTS",
                                    color = Color(0xFFE2E8F0),
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace,
                                    letterSpacing = 0.5.sp
                                )
                            }
                            Text(
                                text = "Live Stream",
                                color = Color(0xFF64748B),
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }

                        recentEvents.forEach { event ->
                            SecurityEventCard(event = event)
                        }
                    }
                }
            }

            // Quick Scan FAB Button
            ExtendedFloatingActionButton(
                onClick = {
                    onQuickScanClick()
                    onNavigateToScanner()
                },
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(20.dp),
                containerColor = Color(0xFF00E5FF),
                contentColor = Color(0xFF080B12),
                shape = RoundedCornerShape(14.dp),
                icon = {
                    Icon(
                        imageVector = Icons.Default.Bolt,
                        contentDescription = "Quick Scan",
                        tint = Color(0xFF080B12)
                    )
                },
                text = {
                    Text(
                        text = "QUICK SCAN",
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        letterSpacing = 0.5.sp
                    )
                }
            )
        }
    }
}

@Composable
fun StatCard(
    title: String,
    value: String,
    subtitle: String,
    icon: ImageVector,
    accentColor: Color,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
        shape = RoundedCornerShape(12.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF223049))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = title,
                    color = Color(0xFF94A3B8),
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Medium,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis
                )
                Box(
                    modifier = Modifier
                        .size(26.dp)
                        .clip(RoundedCornerShape(6.dp))
                        .background(accentColor.copy(alpha = 0.15f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = icon,
                        contentDescription = title,
                        tint = accentColor,
                        modifier = Modifier.size(14.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = value,
                color = Color(0xFFE2E8F0),
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace
            )

            Text(
                text = subtitle,
                color = Color(0xFF64748B),
                fontSize = 10.sp,
                fontFamily = FontFamily.Monospace
            )
        }
    }
}

@Composable
private fun ModuleCard(
    module: ProtectionModule,
    onClick: () -> Unit
) {
    Card(
        modifier = Modifier
            .width(140.dp)
            .clickable(onClick = onClick),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
        shape = RoundedCornerShape(12.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF223049))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Box(
                    modifier = Modifier
                        .size(32.dp)
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFF7C4DFF).copy(alpha = 0.18f)),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        imageVector = module.icon,
                        contentDescription = module.name,
                        tint = Color(0xFF00E5FF),
                        modifier = Modifier.size(18.dp)
                    )
                }

                // Status Dot
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .clip(CircleShape)
                        .background(if (module.isActive) Color(0xFF00E676) else Color(0xFF64748B))
                )
            }

            Text(
                text = module.name,
                color = Color(0xFFE2E8F0),
                fontSize = 13.sp,
                fontWeight = FontWeight.Bold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )

            Text(
                text = if (module.isActive) "Running" else "Standby",
                color = if (module.isActive) Color(0xFF00E676) else Color(0xFF64748B),
                fontSize = 11.sp,
                fontFamily = FontFamily.Monospace
            )
        }
    }
}

@Composable
private fun SecurityEventCard(event: SecurityEvent) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
        shape = RoundedCornerShape(12.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF223049))
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .height(IntrinsicSize.Min)
        ) {
            // Severity Color Bar
            Box(
                modifier = Modifier
                    .width(4.dp)
                    .fillMaxHeight()
                    .background(event.severityColor)
            )

            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(14.dp),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = event.title,
                        color = Color(0xFFE2E8F0),
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis,
                        modifier = Modifier.weight(1f, fill = false)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    RiskBadge(riskLevel = event.severity)
                }

                Text(
                    text = event.description,
                    color = Color(0xFF94A3B8),
                    fontSize = 12.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Module: ${event.module}",
                        color = Color(0xFF00E5FF),
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace
                    )
                    Text(
                        text = event.timestamp,
                        color = Color(0xFF64748B),
                        fontSize = 10.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }
        }
    }
}
