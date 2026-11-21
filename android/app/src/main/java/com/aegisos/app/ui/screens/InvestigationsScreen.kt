package com.aegisos.app.ui.screens

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aegisos.app.ui.components.AegisTopAppBar
import com.aegisos.app.ui.components.RiskBadge

data class InvestigationItem(
    val id: String,
    val type: String,
    val icon: ImageVector,
    val inputPreview: String,
    val riskLevel: String,
    val riskScore: Int,
    val timestamp: String,
    val module: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun InvestigationsScreen(
    modifier: Modifier = Modifier,
    onNavigateBack: (() -> Unit)? = null,
    onItemClick: (InvestigationItem) -> Unit = {}
) {
    var selectedFilter by remember { mutableStateOf("All") }
    val filters = listOf("All", "Safe", "Suspicious", "Malicious")

    val allInvestigations = remember {
        listOf(
            InvestigationItem(
                id = "INV-9021",
                type = "URL",
                icon = Icons.Outlined.Language,
                inputPreview = "https://secure-login-chase-portal.account-update.xyz/login?ref=8910",
                riskLevel = "MALICIOUS",
                riskScore = 94,
                timestamp = "8m ago",
                module = "WebGuard"
            ),
            InvestigationItem(
                id = "INV-9020",
                type = "Message",
                icon = Icons.Outlined.Chat,
                inputPreview = "URGENT: Your account has been temporarily disabled due to suspicious activity. Verify KYC now: http://auth-bank.top",
                riskLevel = "MALICIOUS",
                riskScore = 96,
                timestamp = "32m ago",
                module = "MessageGuard"
            ),
            InvestigationItem(
                id = "INV-9019",
                type = "App",
                icon = Icons.Outlined.Android,
                inputPreview = "FastClean_v3.apk - Trojan Dropper with Accessibility Service Abuse",
                riskLevel = "MALICIOUS",
                riskScore = 92,
                timestamp = "1h ago",
                module = "AppGuard"
            ),
            InvestigationItem(
                id = "INV-9018",
                type = "Media",
                icon = Icons.Outlined.PermMedia,
                inputPreview = "IRS Tax Refund Notice QR Code pointing to claim-gov-online.net",
                riskLevel = "SUSPICIOUS",
                riskScore = 78,
                timestamp = "3h ago",
                module = "MediaGuard"
            ),
            InvestigationItem(
                id = "INV-9017",
                type = "URL",
                icon = Icons.Outlined.Language,
                inputPreview = "https://github.com/login/oauth/authorize?client_id=ae882190",
                riskLevel = "SAFE",
                riskScore = 4,
                timestamp = "5h ago",
                module = "WebGuard"
            ),
            InvestigationItem(
                id = "INV-9016",
                type = "App",
                icon = Icons.Outlined.Android,
                inputPreview = "DocuPDF Reader Ultra - Requested Broad Storage Permission",
                riskLevel = "SUSPICIOUS",
                riskScore = 45,
                timestamp = "9h ago",
                module = "AppGuard"
            ),
            InvestigationItem(
                id = "INV-9015",
                type = "Message",
                icon = Icons.Outlined.Chat,
                inputPreview = "Your package delivery #US-98124 requires address confirmation: https://usps.gov",
                riskLevel = "SAFE",
                riskScore = 8,
                timestamp = "1d ago",
                module = "MessageGuard"
            ),
            InvestigationItem(
                id = "INV-9014",
                type = "QR",
                icon = Icons.Outlined.QrCode,
                inputPreview = "Wi-Fi Configuration: WPA2-PSK Aegis-Secure-Lab-Network",
                riskLevel = "SAFE",
                riskScore = 2,
                timestamp = "2d ago",
                module = "MediaGuard"
            )
        )
    }

    val filteredInvestigations = remember(selectedFilter, allInvestigations) {
        if (selectedFilter == "All") {
            allInvestigations
        } else {
            allInvestigations.filter { it.riskLevel.equals(selectedFilter, ignoreCase = true) }
        }
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
                    title = "INVESTIGATIONS VAULT",
                    subtitle = "AUDIT LOGS & INCIDENT TELEMETRY",
                    onBackClick = onNavigateBack
                )
            }

            // Filter Chips Row: All, Safe, Suspicious, Malicious
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF223049))
                ) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 12.dp, vertical = 10.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        filters.forEach { filter ->
                            val isSelected = selectedFilter == filter
                            FilterChip(
                                selected = isSelected,
                                onClick = { selectedFilter = filter },
                                label = {
                                    Text(
                                        text = filter,
                                        fontSize = 11.sp,
                                        fontWeight = if (isSelected) FontWeight.Bold else FontWeight.Normal,
                                        fontFamily = FontFamily.Monospace
                                    )
                                },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = Color(0xFF00E5FF).copy(alpha = 0.2f),
                                    selectedLabelColor = Color(0xFF00E5FF),
                                    containerColor = Color(0xFF080B12),
                                    labelColor = Color(0xFF94A3B8)
                                ),
                                border = FilterChipDefaults.filterChipBorder(
                                    borderColor = if (isSelected) Color(0xFF00E5FF) else Color(0xFF223049),
                                    selectedBorderColor = Color(0xFF00E5FF),
                                    borderWidth = 1.dp
                                ),
                                shape = RoundedCornerShape(8.dp)
                            )
                        }
                    }
                }
            }

            // Status bar showing item count
            item {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 2.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "RECORDS (${filteredInvestigations.size})",
                        color = Color(0xFF94A3B8),
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Filter: $selectedFilter",
                        color = Color(0xFF00E5FF),
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace
                    )
                }
            }

            // Empty state composable when no items match
            if (filteredInvestigations.isEmpty()) {
                item {
                    EmptyStateComposable(
                        filter = selectedFilter,
                        onResetFilter = { selectedFilter = "All" }
                    )
                }
            } else {
                // LazyColumn of investigation cards: type icon, input preview (truncated), risk badge, timestamp
                items(filteredInvestigations) { item ->
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp)
                            .clickable { onItemClick(item) },
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
                            // Top Row: Type Icon + ID + Risk Badge
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
                                            .size(28.dp)
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(Color(0xFF7C4DFF).copy(alpha = 0.2f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Icon(
                                            imageVector = item.icon,
                                            contentDescription = item.type,
                                            tint = Color(0xFF00E5FF),
                                            modifier = Modifier.size(16.dp)
                                        )
                                    }

                                    Column {
                                        Text(
                                            text = item.id,
                                            color = Color(0xFFE2E8F0),
                                            fontSize = 12.sp,
                                            fontWeight = FontWeight.Bold,
                                            fontFamily = FontFamily.Monospace
                                        )
                                        Text(
                                            text = "${item.module} • ${item.type}",
                                            color = Color(0xFF64748B),
                                            fontSize = 10.sp,
                                            fontFamily = FontFamily.Monospace
                                        )
                                    }
                                }

                                RiskBadge(riskLevel = item.riskLevel)
                            }

                            // Input preview (truncated)
                            Text(
                                text = item.inputPreview,
                                color = Color(0xFFCBD5E1),
                                fontSize = 12.sp,
                                maxLines = 2,
                                overflow = TextOverflow.Ellipsis,
                                lineHeight = 16.sp
                            )

                            // Bottom Row: Risk Score + Timestamp
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "Score: ${item.riskScore}/100",
                                    color = if (item.riskScore > 75) Color(0xFFFF3D57) else if (item.riskScore > 30) Color(0xFFFF9100) else Color(0xFF00E676),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace
                                )
                                Text(
                                    text = item.timestamp,
                                    color = Color(0xFF64748B),
                                    fontSize = 10.sp,
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

@Composable
fun EmptyStateComposable(
    filter: String,
    onResetFilter: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp, vertical = 24.dp),
        colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
        shape = RoundedCornerShape(14.dp),
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF223049))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(32.dp),
            horizontalAlignment = Alignment.CenterVertically,
            verticalArrangement = Arrangement.spacedBy(14.dp)
        ) {
            Box(
                modifier = Modifier
                    .size(56.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF080B12))
                    .border(1.dp, Color(0xFF223049), CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Outlined.FolderOff,
                    contentDescription = "Empty",
                    tint = Color(0xFF64748B),
                    modifier = Modifier.size(28.dp)
                )
            }

            Text(
                text = "NO INVESTIGATIONS FOUND",
                color = Color(0xFFE2E8F0),
                fontSize = 14.sp,
                fontWeight = FontWeight.Bold,
                fontFamily = FontFamily.Monospace
            )

            Text(
                text = "There are no security incident logs categorized as \"$filter\" in the current local vault.",
                color = Color(0xFF94A3B8),
                fontSize = 12.sp,
                textAlign = androidx.compose.ui.text.style.TextAlign.Center
            )

            Button(
                onClick = onResetFilter,
                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF223049)),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(
                    text = "RESET FILTER TO ALL",
                    color = Color(0xFF00E5FF),
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}
