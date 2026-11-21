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
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.aegisos.app.ui.components.AegisTopAppBar
import com.aegisos.app.ui.components.RiskBadge
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch

@Composable
fun ScannerScreen(
    modifier: Modifier = Modifier,
    sharedText: String? = null,
    onNavigateBack: (() -> Unit)? = null
) {
    var selectedTabIndex by remember { mutableIntStateOf(0) }
    val tabTitles = listOf("URL", "Message", "Image", "QR")
    val tabIcons = listOf(
        Icons.Outlined.Language,
        Icons.Outlined.Chat,
        Icons.Outlined.Image,
        Icons.Outlined.QrCodeScanner
    )

    // Input States
    var urlInput by remember {
        mutableStateOf(
            if (sharedText?.startsWith("http", ignoreCase = true) == true) sharedText
            else "https://secure-login-chase-portal.account-update.xyz/login"
        )
    }
    var messageInput by remember {
        mutableStateOf(
            if (!sharedText.isNullOrBlank() && !sharedText.startsWith("http", ignoreCase = true)) sharedText
            else "URGENT: Your Chase banking account has been temporarily disabled due to suspicious access. Verify identity at https://secure-login-chase-portal.account-update.xyz to prevent asset freeze."
        )
    }
    var imageFileName by remember { mutableStateOf<String?>(null) }
    var qrContent by remember { mutableStateOf<String?>(null) }

    // Analysis States
    var isAnalyzing by remember { mutableStateOf(false) }
    var showResults by remember { mutableStateOf(false) }
    val coroutineScope = rememberCoroutineScope()

    fun triggerScan() {
        coroutineScope.launch {
            isAnalyzing = true
            showResults = false
            delay(1300) // Mock inspection latency
            isAnalyzing = false
            showResults = true
        }
    }

    Surface(
        modifier = modifier.fillMaxSize(),
        color = Color(0xFF080B12)
    ) {
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            // Top App Bar
            item {
                AegisTopAppBar(
                    title = "UNIFIED SCANNER",
                    subtitle = "MULTI-VECTOR HEURISTIC ENGINE",
                    onBackClick = onNavigateBack
                )
            }

            // TabRow with 4 tabs: URL, Message, Image, QR
            item {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
                    shape = RoundedCornerShape(12.dp),
                    border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF223049))
                ) {
                    TabRow(
                        selectedTabIndex = selectedTabIndex,
                        containerColor = Color(0xFF151E2D),
                        contentColor = Color(0xFF00E5FF),
                        indicator = { tabPositions ->
                            TabRowDefaults.SecondaryIndicator(
                                modifier = Modifier.tabIndicatorOffset(tabPositions[selectedTabIndex]),
                                color = Color(0xFF00E5FF),
                                height = 3.dp
                            )
                        },
                        divider = {
                            HorizontalDivider(color = Color(0xFF223049))
                        }
                    ) {
                        tabTitles.forEachIndexed { index, title ->
                            Tab(
                                selected = selectedTabIndex == index,
                                onClick = {
                                    selectedTabIndex = index
                                    showResults = false
                                },
                                text = {
                                    Text(
                                        text = title,
                                        fontSize = 13.sp,
                                        fontWeight = if (selectedTabIndex == index) FontWeight.Bold else FontWeight.Normal,
                                        color = if (selectedTabIndex == index) Color(0xFF00E5FF) else Color(0xFF94A3B8),
                                        fontFamily = FontFamily.Monospace
                                    )
                                },
                                icon = {
                                    Icon(
                                        imageVector = tabIcons[index],
                                        contentDescription = title,
                                        tint = if (selectedTabIndex == index) Color(0xFF00E5FF) else Color(0xFF64748B),
                                        modifier = Modifier.size(18.dp)
                                    )
                                }
                            )
                        }
                    }
                }
            }

            // Input Section corresponding to active tab
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
                        when (selectedTabIndex) {
                            0 -> {
                                // URL Tab
                                Text(
                                    text = "TARGET WEB URL",
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
                                    placeholder = {
                                        Text("https://example.com/login", color = Color(0xFF64748B))
                                    },
                                    singleLine = true
                                )
                                Button(
                                    onClick = { triggerScan() },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(48.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00E5FF)),
                                    shape = RoundedCornerShape(10.dp),
                                    enabled = !isAnalyzing && urlInput.isNotBlank()
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Search,
                                        contentDescription = "Analyze",
                                        tint = Color(0xFF080B12)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "ANALYZE URL",
                                        color = Color(0xFF080B12),
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                            }
                            1 -> {
                                // Message Tab
                                Text(
                                    text = "SUSPICIOUS MESSAGE PAYLOAD",
                                    color = Color(0xFF94A3B8),
                                    fontSize = 11.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold
                                )
                                OutlinedTextField(
                                    value = messageInput,
                                    onValueChange = { messageInput = it },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(130.dp),
                                    colors = OutlinedTextFieldDefaults.colors(
                                        focusedBorderColor = Color(0xFF00E5FF),
                                        unfocusedBorderColor = Color(0xFF223049),
                                        focusedTextColor = Color(0xFFE2E8F0),
                                        unfocusedTextColor = Color(0xFFE2E8F0),
                                        cursorColor = Color(0xFF00E5FF)
                                    ),
                                    placeholder = {
                                        Text("Paste raw SMS, email text, or chat snippet...", color = Color(0xFF64748B))
                                    },
                                    maxLines = 6
                                )
                                Button(
                                    onClick = { triggerScan() },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(48.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF7C4DFF)),
                                    shape = RoundedCornerShape(10.dp),
                                    enabled = !isAnalyzing && messageInput.isNotBlank()
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Security,
                                        contentDescription = "Analyze",
                                        tint = Color.White
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "ANALYZE MESSAGE",
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                            }
                            2 -> {
                                // Image Tab
                                Text(
                                    text = "FORENSIC MEDIA ARTIFACT",
                                    color = Color(0xFF94A3B8),
                                    fontSize = 11.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold
                                )
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(110.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(Color(0xFF080B12))
                                        .border(1.dp, Color(0xFF223049), RoundedCornerShape(10.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Column(
                                        horizontalAlignment = Alignment.CenterVertically,
                                        verticalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Outlined.PhotoLibrary,
                                            contentDescription = "Upload",
                                            tint = Color(0xFF00E5FF),
                                            modifier = Modifier.size(32.dp)
                                        )
                                        Text(
                                            text = imageFileName ?: "No image selected (Mock Gallery Ready)",
                                            color = Color(0xFF94A3B8),
                                            fontSize = 12.sp,
                                            fontFamily = FontFamily.Monospace
                                        )
                                    }
                                }
                                Button(
                                    onClick = {
                                        imageFileName = "invoice_payment_screenshot.png"
                                        triggerScan()
                                    },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(48.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF00E5FF)),
                                    shape = RoundedCornerShape(10.dp),
                                    enabled = !isAnalyzing
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.CloudUpload,
                                        contentDescription = "Upload Image",
                                        tint = Color(0xFF080B12)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "UPLOAD IMAGE (GALLERY)",
                                        color = Color(0xFF080B12),
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                            }
                            3 -> {
                                // QR Tab
                                Text(
                                    text = "BARCODE / QR CODE TELEMETRY",
                                    color = Color(0xFF94A3B8),
                                    fontSize = 11.sp,
                                    fontFamily = FontFamily.Monospace,
                                    fontWeight = FontWeight.Bold
                                )
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(110.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(Color(0xFF080B12))
                                        .border(1.dp, Color(0xFF223049), RoundedCornerShape(10.dp)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Column(
                                        horizontalAlignment = Alignment.CenterVertically,
                                        verticalArrangement = Arrangement.spacedBy(6.dp)
                                    ) {
                                        Icon(
                                            imageVector = Icons.Outlined.QrCode,
                                            contentDescription = "QR Scanner",
                                            tint = Color(0xFF7C4DFF),
                                            modifier = Modifier.size(32.dp)
                                        )
                                        Text(
                                            text = qrContent ?: "Camera Viewfinder Ready",
                                            color = Color(0xFF94A3B8),
                                            fontSize = 12.sp,
                                            fontFamily = FontFamily.Monospace
                                        )
                                    }
                                }
                                Button(
                                    onClick = {
                                        qrContent = "https://irs-verify-refund.phish.cc/token=8812"
                                        triggerScan()
                                    },
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(48.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF7C4DFF)),
                                    shape = RoundedCornerShape(10.dp),
                                    enabled = !isAnalyzing
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.CameraAlt,
                                        contentDescription = "Scan QR Code",
                                        tint = Color.White
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "SCAN QR CODE (CAMERA)",
                                        color = Color.White,
                                        fontWeight = FontWeight.Bold,
                                        fontFamily = FontFamily.Monospace
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // CircularProgressIndicator Loading State
            item {
                AnimatedVisibility(
                    visible = isAnalyzing,
                    enter = fadeIn(),
                    exit = fadeOut()
                ) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
                        shape = RoundedCornerShape(12.dp),
                        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFF00E5FF).copy(alpha = 0.5f))
                    ) {
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(24.dp),
                            horizontalAlignment = Alignment.CenterVertically,
                            verticalArrangement = Arrangement.spacedBy(14.dp)
                        ) {
                            CircularProgressIndicator(
                                color = Color(0xFF00E5FF),
                                strokeWidth = 3.dp,
                                modifier = Modifier.size(42.dp)
                            )
                            Text(
                                text = "RUNNING HEURISTIC SANDBOX & AI FORENSICS...",
                                color = Color(0xFF00E5FF),
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace,
                                letterSpacing = 0.5.sp
                            )
                        }
                    }
                }
            }

            // Results Section: RiskBadge, risk score, category text, evidence list, recommendations
            item {
                AnimatedVisibility(
                    visible = showResults && !isAnalyzing,
                    enter = fadeIn(),
                    exit = fadeOut()
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp),
                        verticalArrangement = Arrangement.spacedBy(14.dp)
                    ) {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFF151E2D)),
                            shape = RoundedCornerShape(14.dp),
                            border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFFF1744).copy(alpha = 0.6f))
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(18.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                // Header: Badge + Score
                                Row(
                                    modifier = Modifier.fillMaxWidth(),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column {
                                        Text(
                                            text = "VERDICT",
                                            color = Color(0xFF64748B),
                                            fontSize = 10.sp,
                                            fontFamily = FontFamily.Monospace,
                                            fontWeight = FontWeight.Bold
                                        )
                                        RiskBadge(riskLevel = "CRITICAL")
                                    }

                                    Column(horizontalAlignment = Alignment.End) {
                                        Text(
                                            text = "RISK SCORE",
                                            color = Color(0xFF64748B),
                                            fontSize = 10.sp,
                                            fontFamily = FontFamily.Monospace,
                                            fontWeight = FontWeight.Bold
                                        )
                                        Text(
                                            text = "88 / 100",
                                            color = Color(0xFFFF1744),
                                            fontSize = 22.sp,
                                            fontWeight = FontWeight.ExtraBold,
                                            fontFamily = FontFamily.Monospace
                                        )
                                    }
                                }

                                HorizontalDivider(color = Color(0xFF223049))

                                // Category text
                                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                                    Text(
                                        text = "THREAT CATEGORY",
                                        color = Color(0xFF94A3B8),
                                        fontSize = 11.sp,
                                        fontFamily = FontFamily.Monospace
                                    )
                                    Text(
                                        text = "Zero-Day Credential Harvesting & Financial Phishing",
                                        color = Color(0xFFE2E8F0),
                                        fontSize = 15.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }

                                // Evidence List
                                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text(
                                        text = "FORENSIC EVIDENCE (4 INDICATORS)",
                                        color = Color(0xFF94A3B8),
                                        fontSize = 11.sp,
                                        fontFamily = FontFamily.Monospace,
                                        fontWeight = FontWeight.Bold
                                    )

                                    val evidence = listOf(
                                        "Domain registered within last 48 hours via anonymous Russian registrar",
                                        "Login POST endpoint forwards credentials to unauthenticated C2 IP",
                                        "Contains brand assets cloned verbatim from Chase Bank online banking",
                                        "Obfuscated JavaScript obfuscation payload detected in DOM tree"
                                    )

                                    evidence.forEach { item ->
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                                            verticalAlignment = Alignment.Top
                                        ) {
                                            Text(
                                                text = "•",
                                                color = Color(0xFFFF1744),
                                                fontWeight = FontWeight.Bold,
                                                fontSize = 14.sp
                                            )
                                            Text(
                                                text = item,
                                                color = Color(0xFFCBD5E1),
                                                fontSize = 12.sp,
                                                lineHeight = 16.sp
                                            )
                                        }
                                    }
                                }

                                HorizontalDivider(color = Color(0xFF223049))

                                // Recommendations
                                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                                    Text(
                                        text = "RECOMMENDED MITIGATION ACTIONS",
                                        color = Color(0xFF00E5FF),
                                        fontSize = 11.sp,
                                        fontFamily = FontFamily.Monospace,
                                        fontWeight = FontWeight.Bold
                                    )

                                    val recommendations = listOf(
                                        "Do not input passwords, security pins, or multi-factor codes",
                                        "Add domain to NetworkGuard on-device DNS sinkhole filter",
                                        "Revoke any active session cookies from target web browser"
                                    )

                                    recommendations.forEachIndexed { idx, rec ->
                                        Row(
                                            modifier = Modifier.fillMaxWidth(),
                                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                                            verticalAlignment = Alignment.Top
                                        ) {
                                            Box(
                                                modifier = Modifier
                                                    .size(16.dp)
                                                    .clip(CircleShape)
                                                    .background(Color(0xFF00E5FF).copy(alpha = 0.2f)),
                                                contentAlignment = Alignment.Center
                                            ) {
                                                Text(
                                                    text = "${idx + 1}",
                                                    color = Color(0xFF00E5FF),
                                                    fontSize = 10.sp,
                                                    fontWeight = FontWeight.Bold
                                                )
                                            }
                                            Text(
                                                text = rec,
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
    }
}
