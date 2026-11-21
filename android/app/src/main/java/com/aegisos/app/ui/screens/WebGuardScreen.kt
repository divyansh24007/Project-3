package com.aegisos.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
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
import com.aegisos.app.ui.components.RiskBadge
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

data class WebScanHistoryItem(
    val url: String,
    val timestamp: String,
    val riskScore: Int,
    val riskLevel: String
)

@Composable
fun WebGuardScreen(
    modifier: Modifier = Modifier,
    onNavigateBack: (() -> Unit)? = null
) {
    var urlInput by remember { mutableStateOf("https://secure-login-chase-portal.account-update.xyz/login") }
    var isAnalyzing by remember { mutableStateOf(false) }
    var showResults by remember { mutableStateOf(true) }
    val coroutineScope = rememberCoroutineScope()

    val scanHistory = remember {
        listOf(
            WebScanHistoryItem("https://github.com/login", "15m ago", 2, "SAFE"),
            WebScanHistoryItem("https://crypto-airdrop-claim.network", "1h ago", 98, "MALICIOUS"),
            WebScanHistoryItem("https://docs.google.com/forms/d/e/share", "4h ago", 35, "CAUTION"),
            WebScanHistoryItem("https://paypal-security-check.info", "1d ago", 96, "CRITICAL"),
            WebScanHistoryItem("https://wellsfargo-verify-alert.online", "2d ago", 91, "MALICIOUS")
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
                    title = "WEBGUARD SENTINEL",
                    subtitle = "PHISHING & ZERO-DAY WEB SHIELD",
                    onBackClick = onNavigateBack
                )
            }

            // URL input with paste button & Analyze Website Button
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
                        Text(
                            text = "URL HEURISTIC INSPECTOR",
                            color = Color(0xFF94A3B8),
                            fontSize = 11.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.Bold
                        )

                        OutlinedTextField(
                            value = urlInput,
                            onValueChange = { urlInput = it },
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
                                    imageVector = Icons.Default.Language,
                                    contentDescription = "URL",
                                    tint = Color(0xFF00E5FF)
                                )
                            },
                            trailingIcon = {
                                IconButton(
                                    onClick = {
                                        urlInput = "https://bank-auth-verify.identity-login.com"
                                    }
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.ContentPaste,
                                        contentDescription = "Paste",
                                        tint = Color(0xFF00E5FF)
                                    )
                                }
                            },
                            placeholder = { Text("Enter target URL...", color = Color(0xFF64748B)) },
                            singleLine = true
                        )

                        Button(
                            onClick = {
                                coroutineScope.launch {
                                    isAnalyzing = true
                                    showResults = false
                                    delay(1100)
                                    isAnalyzing = false
                                    showResults = true
                                }
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00E5FF)),
                            shape = RoundedCornerShape(10.dp),
                            enabled = !isAnalyzing && urlInput.isNotBlank()
                        ) {
                            if (isAnalyzing) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    color = Color(0xFF080B12),
                                    strokeWidth = 2.dp
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "SCANNING DOMAINS & CERTIFICATES...",
                                    color = Color(0xFF080B12),
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace
                                )
                            } else {
                                Icon(
                                    imageVector = Icons.Default.Shield,
                                    contentDescription = "Analyze",
                                    tint = Color(0xFF080B12)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "ANALYZE WEBSITE",
                                    color = Color(0xFF080B12),
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }
                    }
                }
            }

            // Results Section (Domain info, Risk Assessment, SSL info, Indicators)
            if (showResults) {
                // 1. Risk Assessment Card
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
                        shape = RoundedCornerShape(14.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFF3D57).copy(alpha = 0.5f))
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = "RISK ASSESSMENT",
                                    color = Color(0xFF94A3B8),
                                    fontSize = 11.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold
                                )
                                RiskBadge(riskLevel = "MALICIOUS")
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text(
                                        text = "Active Phishing Threat",
                                        color = Color(0xFFE2E8F0),
                                        fontSize = 18.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = "Category: Credential Harvester",
                                        color = Color(0xFF00E5FF),
                                        fontSize = 12.sp,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                                Column(horizontalAlignment = Alignment.End) {
                                    Text(
                                        text = "94 / 100",
                                        color = Color(0xFFFF3D57),
                                        fontSize = 24.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        fontFamily = FontFamily.Monospace
                                    )
                                    Text(
                                        text = "Confidence: 98.7%",
                                        color = Color(0xFF64748B),
                                        fontSize = 10.sp,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                            }
                        }
                    }
                }

                // 2. Domain Info Card
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
                                text = "DOMAIN INTEL & REGISTRAR",
                                color = Color(0xFF00E5FF),
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )

                            WebInfoRow("Domain", "account-update.xyz")
                            WebInfoRow("Registrar", "NameCheap Inc. (Anonymous Proxy)")
                            WebInfoRow("Age", "3 Days Old (Registered Nov 18, 2026)")
                            WebInfoRow("IP Address", "185.220.101.42")
                            WebInfoRow("Server Location", "Frankfurt, Germany (ASN 24940)")
                        }
                    }
                }

                // 3. SSL Info Card
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
                                text = "TLS / SSL CERTIFICATE TELEMETRY",
                                color = Color(0xFF7C4DFF),
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )

                            WebInfoRow("Issuer", "Let's Encrypt Authority R3")
                            WebInfoRow("Valid Until", "Feb 19, 2027")
                            WebInfoRow("Cipher Suite", "TLS 1.3 / ChaCha20-Poly1305")
                            WebInfoRow("Status", "Hostname Mismatch / Suspicious SAN")
                        }
                    }
                }

                // 4. Indicators List Card
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
                                text = "THREAT INDICATORS (4 DETECTED)",
                                color = Color(0xFFE2E8F0),
                                fontSize = 12.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )

                            val indicators = listOf(
                                "DOM elements clone Chase Bank official authentication CSS" to Color(0xFFFF1744),
                                "Form submission points to unverified external credential drop IP" to Color(0xFFFF3D57),
                                "Newly created free tier SSL cert used for financial impersonation" to Color(0xFFFFB300),
                                "Zero-day heuristics score exceeds 90% risk threshold" to Color(0xFFFF1744)
                            )

                            indicators.forEach { (text, color) ->
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalAlignment = Alignment.Top
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .padding(top = 4.dp)
                                            .size(8.dp)
                                            .clip(CircleShape)
                                            .background(color)
                                    )
                                    Text(
                                        text = text,
                                        color = Color(0xFFCBD5E1),
                                        fontSize = 12.sp
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // History Section with Recent URL Scans
            item {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = "RECENT URL AUDITS",
                        color = Color(0xFF94A3B8),
                        fontSize = 12.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold
                    )

                    scanHistory.forEach { history ->
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
                            shape = RoundedCornerShape(10.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF223049))
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(12.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = history.url,
                                        color = Color(0xFFE2E8F0),
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Medium,
                                        maxLines = 1,
                                        overflow = TextOverflow.Ellipsis
                                    )
                                    Text(
                                        text = "${history.timestamp} • Score: ${history.riskScore}/100",
                                        color = Color(0xFF64748B),
                                        fontSize = 10.sp,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                RiskBadge(riskLevel = history.riskLevel)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun WebInfoRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            text = label,
            color = Color(0xFF64748B),
            fontSize = 11.sp,
            fontFamily = FontFamily.Monospace
        )
        Text(
            text = value,
            color = Color(0xFFE2E8F0),
            fontSize = 12.sp,
            fontWeight = FontWeight.Medium,
            fontFamily = FontFamily.Monospace
        )
    }
}
