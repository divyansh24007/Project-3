package com.aegisos.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
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
import com.aegisos.app.ui.components.RiskBadge
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun MessageGuardScreen(
    modifier: Modifier = Modifier,
    onNavigateBack: (() -> Unit)? = null
) {
    var messageText by remember {
        mutableStateOf(
            "CRITICAL ALERT: Your bank account has been locked due to an unauthorized wire request. Click here immediately to verify your KYC and prevent permanent closure: http://auth-bank-kyc.top/verify?token=8910"
        )
    }
    var isAnalyzing by remember { mutableStateOf(false) }
    var showResults by remember { mutableStateOf(true) }
    val coroutineScope = rememberCoroutineScope()

    val suspiciousPhrases = remember {
        listOf(
            "CRITICAL ALERT",
            "account has been locked",
            "unauthorized wire request",
            "Click here immediately",
            "verify your KYC",
            "prevent permanent closure",
            "http://auth-bank-kyc.top/verify"
        )
    }

    val evidenceBullets = remember {
        listOf(
            "Artificial urgency and scareware tactics to provoke impulsive user compliance",
            "Unauthenticated sender claiming to represent institutional fraud prevention",
            "High-risk non-standard TLD (.top) associated with disposable phishing campaigns",
            "Direct link redirection to unencrypted credential harvesting landing page"
        )
    }

    val recommendedActions = remember {
        listOf(
            "Do not click the provided link or input confidential credentials",
            "Block incoming sender phone number or email address (+1-888-293-1029)",
            "Report message as phishing to telecom carrier and IT security desk",
            "Quarantine message in AEGISOS encrypted vault"
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
                    title = "MESSAGEGUARD",
                    subtitle = "SMS, EMAIL & CHAT THREAT DEFENDER",
                    onBackClick = onNavigateBack
                )
            }

            // Large message input area & Analyze Message button
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
                                text = "RAW MESSAGE INPUT",
                                color = Color(0xFF94A3B8),
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )
                            TextButton(
                                onClick = {
                                    messageText =
                                        "FINAL WARNING: Your package shipment has failed delivery due to missing $2.50 fee. Update billing now: https://usps-post-redelivery.info/pay"
                                },
                                contentPadding = PaddingValues(horizontal = 8.dp, vertical = 2.dp)
                            ) {
                                Text(
                                    text = "Load Sample",
                                    color = Color(0xFF00E5FF),
                                    fontSize = 11.sp,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }

                        OutlinedTextField(
                            value = messageText,
                            onValueChange = { messageText = it },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(140.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedBorderColor = Color(0xFF00E5FF),
                                unfocusedBorderColor = Color(0xFF223049),
                                focusedTextColor = Color(0xFFE2E8F0),
                                unfocusedTextColor = Color(0xFFE2E8F0),
                                cursorColor = Color(0xFF00E5FF)
                            ),
                            placeholder = {
                                Text("Paste suspicious SMS, WhatsApp, or email message...", color = Color(0xFF64748B))
                            },
                            maxLines = 6
                        )

                        Button(
                            onClick = {
                                coroutineScope.launch {
                                    isAnalyzing = true
                                    showResults = false
                                    delay(1000)
                                    isAnalyzing = false
                                    showResults = true
                                }
                            },
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00E5FF)),
                            shape = RoundedCornerShape(10.dp),
                            enabled = !isAnalyzing && messageText.isNotBlank()
                        ) {
                            if (isAnalyzing) {
                                CircularProgressIndicator(
                                    modifier = Modifier.size(20.dp),
                                    color = Color(0xFF080B12),
                                    strokeWidth = 2.dp
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "PARSING NLP INTENT & PHRASES...",
                                    color = Color(0xFF080B12),
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace
                                )
                            } else {
                                Icon(
                                    imageVector = Icons.Default.Bolt,
                                    contentDescription = "Analyze",
                                    tint = Color(0xFF080B12)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "ANALYZE MESSAGE",
                                    color = Color(0xFF080B12),
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace
                                )
                            }
                        }
                    }
                }
            }

            // Results Section
            if (showResults && !isAnalyzing) {
                // 1. Scam Category Badge & Risk Score Card
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
                        shape = RoundedCornerShape(14.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFF1744).copy(alpha = 0.6f))
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
                                    text = "SCAM CATEGORY",
                                    color = Color(0xFF94A3B8),
                                    fontSize = 11.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold
                                )
                                RiskBadge(riskLevel = "CRITICAL")
                            }

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column(modifier = Modifier.weight(1f)) {
                                    Text(
                                        text = "Bank Impersonation & Scareware",
                                        color = Color(0xFFE2E8F0),
                                        fontSize = 17.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                    Text(
                                        text = "Smishing vector targeting financial KYC credentials",
                                        color = Color(0xFF94A3B8),
                                        fontSize = 12.sp
                                    )
                                }
                                Column(horizontalAlignment = Alignment.End) {
                                    Text(
                                        text = "96 / 100",
                                        color = Color(0xFFFF1744),
                                        fontSize = 26.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        fontFamily = FontFamily.Monospace
                                    )
                                    Text(
                                        text = "High Confidence",
                                        color = Color(0xFFFF3D57),
                                        fontSize = 10.sp,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                            }
                        }
                    }
                }

                // 2. Suspicious phrases highlighted in red within a card
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
                                text = "SUSPICIOUS PHRASES DETECTED",
                                color = Color(0xFFFF3D57),
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )

                            Text(
                                text = "The following trigger keywords matched social engineering dictionaries:",
                                color = Color(0xFF94A3B8),
                                fontSize = 12.sp
                            )

                            FlowRow(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                verticalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                suspiciousPhrases.forEach { phrase ->
                                    Box(
                                        modifier = Modifier
                                            .clip(RoundedCornerShape(6.dp))
                                            .background(Color(0x33FF1744))
                                            .border(1.dp, Color(0xFFFF1744), RoundedCornerShape(6.dp))
                                            .padding(horizontal = 8.dp, vertical = 4.dp)
                                    ) {
                                        Text(
                                            text = phrase,
                                            color = Color(0xFFFF5252),
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

                // 3. Evidence Bullets Card
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
                                text = "FORENSIC EVIDENCE BULLETS",
                                color = Color(0xFF7C4DFF),
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )

                            evidenceBullets.forEach { bullet ->
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalAlignment = Alignment.Top
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.WarningAmber,
                                        contentDescription = null,
                                        tint = Color(0xFFFF9100),
                                        modifier = Modifier
                                            .padding(top = 2.dp)
                                            .size(16.dp)
                                    )
                                    Text(
                                        text = bullet,
                                        color = Color(0xFFCBD5E1),
                                        fontSize = 12.sp,
                                        lineHeight = 16.sp
                                    )
                                }
                            }
                        }
                    }
                }

                // 4. Recommended Action Card
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
                        shape = RoundedCornerShape(14.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF00E5FF).copy(alpha = 0.5f))
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            Text(
                                text = "RECOMMENDED ACTION",
                                color = Color(0xFF00E5FF),
                                fontSize = 11.sp,
                                fontFamily = FontFamily.Monospace,
                                fontWeight = FontWeight.Bold
                            )

                            recommendedActions.forEachIndexed { index, action ->
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Box(
                                        modifier = Modifier
                                            .size(18.dp)
                                            .clip(CircleShape)
                                            .background(Color(0xFF00E5FF).copy(alpha = 0.2f)),
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = "${index + 1}",
                                            color = Color(0xFF00E5FF),
                                            fontSize = 10.sp,
                                            fontWeight = FontWeight.Bold
                                        )
                                    }
                                    Text(
                                        text = action,
                                        color = Color(0xFFE2E8F0),
                                        fontSize = 12.sp
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
