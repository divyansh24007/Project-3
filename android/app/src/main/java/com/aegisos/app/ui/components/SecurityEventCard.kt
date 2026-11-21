package com.aegisos.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.BugReport
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Security
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * SecurityEventCard:
 * Card showing a security event or audit record with visual severity indicator.
 *
 * Requirements:
 * - Parameters: eventType, severity, description, timestamp
 * - Left color bar matching severity
 * - Icon, description, and timestamp
 */
@Composable
fun SecurityEventCard(
    eventType: String,
    severity: String,
    description: String,
    timestamp: String,
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null
) {
    val normalizedSeverity = severity.lowercase().trim()

    // Left color bar matching severity
    val severityColor = when (normalizedSeverity) {
        "safe" -> Color(0xFF10B981)     // Green
        "low" -> Color(0xFF06B6D4)      // Cyan
        "medium" -> Color(0xFFFBBF24)   // Yellow
        "high" -> Color(0xFFF97316)     // Orange
        "critical" -> Color(0xFFEF4444) // Red
        else -> Color(0xFF94A3B8)       // Slate
    }

    val icon: ImageVector = when {
        normalizedSeverity == "critical" -> Icons.Default.Error
        normalizedSeverity == "high" -> Icons.Default.Warning
        eventType.contains("phish", ignoreCase = true) -> Icons.Default.BugReport
        eventType.contains("auth", ignoreCase = true) || eventType.contains("lock", ignoreCase = true) -> Icons.Default.Lock
        eventType.contains("block", ignoreCase = true) || eventType.contains("shield", ignoreCase = true) -> Icons.Default.Security
        normalizedSeverity == "safe" -> Icons.Default.CheckCircle
        else -> Icons.Default.Info
    }

    Card(
        onClick = { onClick?.invoke() },
        enabled = onClick != null,
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = Color(0xFF131D2E), // Deep cyber blue-gray
            contentColor = Color.White
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(0.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Left color bar matching severity
            Box(
                modifier = Modifier
                    .width(5.dp)
                    .height(84.dp)
                    .clip(RoundedCornerShape(topStart = 12.dp, bottomStart = 12.dp))
                    .background(severityColor)
            )

            Spacer(modifier = Modifier.width(14.dp))

            // Event Icon in circular badge
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(RoundedCornerShape(10.dp))
                    .background(severityColor.copy(alpha = 0.15f)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = eventType,
                    tint = severityColor,
                    modifier = Modifier.size(22.dp)
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            // Event details
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(vertical = 12.dp, horizontal = 4.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = eventType.replace("_", " ").uppercase(),
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 13.sp,
                        color = Color.White,
                        modifier = Modifier.weight(1f),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    RiskBadge(riskLevel = severity)
                }

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = description,
                    fontSize = 12.sp,
                    color = Color(0xFFCBD5E1),
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    lineHeight = 16.sp
                )

                Spacer(modifier = Modifier.height(6.dp))

                Text(
                    text = timestamp,
                    fontSize = 10.sp,
                    color = Color(0xFF64748B),
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.width(12.dp))
        }
    }
}
