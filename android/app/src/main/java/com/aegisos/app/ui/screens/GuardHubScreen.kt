package com.aegisos.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aegisos.app.ui.components.AegisTopAppBar

data class GuardHubItem(
    val title: String,
    val subtitle: String,
    val icon: ImageVector,
    val isEnabled: Boolean,
    val threatCount: Int,
    val onClick: () -> Unit
)

@Composable
fun GuardHubScreen(
    modifier: Modifier = Modifier,
    onNavigateToWebGuard: () -> Unit = {},
    onNavigateToMessageGuard: () -> Unit = {},
    onNavigateToMediaGuard: () -> Unit = {},
    onNavigateToAppGuard: () -> Unit = {},
    onNavigateToNetworkGuard: () -> Unit = {},
    onNavigateBack: (() -> Unit)? = null
) {
    val guardItems = listOf(
        GuardHubItem(
            title = "WebGuard",
            subtitle = "Zero-day phishing heuristics, SSL inspection & domain reputational lookup",
            icon = Icons.Outlined.Language,
            isEnabled = true,
            threatCount = 3,
            onClick = onNavigateToWebGuard
        ),
        GuardHubItem(
            title = "MessageGuard",
            subtitle = "NLP intent extraction, bank impersonation flags & urgency detection",
            icon = Icons.Outlined.Forum,
            isEnabled = true,
            threatCount = 2,
            onClick = onNavigateToMessageGuard
        ),
        GuardHubItem(
            title = "MediaGuard",
            subtitle = "Forensic OCR text extraction, quishing scanner & steganography analysis",
            icon = Icons.Outlined.PermMedia,
            isEnabled = true,
            threatCount = 1,
            onClick = onNavigateToMediaGuard
        ),
        GuardHubItem(
            title = "AppGuard",
            subtitle = "Installed package permission audit, accessibility abuse & trojan detection",
            icon = Icons.Outlined.Security,
            isEnabled = true,
            threatCount = 2,
            onClick = onNavigateToAppGuard
        ),
        GuardHubItem(
            title = "NetworkGuard",
            subtitle = "On-device loopback DNS firewall & domain sinkhole filter",
            icon = Icons.Outlined.VpnLock,
            isEnabled = true,
            threatCount = 47,
            onClick = onNavigateToNetworkGuard
        )
    )

    Surface(
        modifier = modifier.fillMaxSize(),
        color = Color(0xFF080B12)
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            item {
                AegisTopAppBar(
                    title = "GUARD HUB",
                    subtitle = "DEFENSE SENTINEL MODULES",
                    onBackClick = onNavigateBack
                )
            }

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
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = "ACTIVE DEFENSE SUITE",
                            color = Color(0xFF00E5FF),
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "5 of 5 Sentinels Online",
                            color = Color(0xFFE2E8F0),
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "Real-time behavioral monitoring and sandbox interception enabled across network, web, media, and application vectors.",
                            color = Color(0xFF94A3B8),
                            fontSize = 12.sp,
                            lineHeight = 16.sp
                        )
                    }
                }
            }

            items(guardItems.size) { index ->
                val item = guardItems[index]
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .clickable(onClick = item.onClick),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF223049))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(
                            modifier = Modifier.weight(1f),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color(0xFF7C4DFF).copy(alpha = 0.18f)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = item.icon,
                                    contentDescription = item.title,
                                    tint = Color(0xFF00E5FF),
                                    modifier = Modifier.size(22.dp)
                                )
                            }

                            Column(modifier = Modifier.weight(1f)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Text(
                                        text = item.title,
                                        color = Color(0xFFE2E8F0),
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Box(
                                        modifier = Modifier
                                            .size(7.dp)
                                            .clip(CircleShape)
                                            .background(if (item.isEnabled) Color(0xFF00E676) else Color(0xFF64748B))
                                    )
                                }

                                Spacer(modifier = Modifier.height(2.dp))

                                Text(
                                    text = item.subtitle,
                                    color = Color(0xFF94A3B8),
                                    fontSize = 11.sp,
                                    lineHeight = 15.sp
                                )
                            }
                        }

                        Icon(
                            imageVector = Icons.Default.ChevronRight,
                            contentDescription = "Open",
                            tint = Color(0xFF64748B),
                            modifier = Modifier.size(20.dp)
                        )
                    }
                }
            }
        }
    }
}
