package com.aegisos.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/**
 * RiskBadge:
 * Displays a security posture badge matching risk categorization.
 *
 * Requirements:
 * - Parameter: riskLevel (String: safe/low/medium/high/critical)
 * - Colored Surface with rounded corners and text
 * - Colors: safe=green, low=cyan, medium=yellow, high=orange, critical=red
 */
@Composable
fun RiskBadge(
    riskLevel: String,
    modifier: Modifier = Modifier
) {
    val normalized = riskLevel.lowercase().trim()

    // Colors: safe=green, low=cyan, medium=yellow, high=orange, critical=red
    val (backgroundColor, textColor, borderColor) = when (normalized) {
        "safe" -> Triple(
            Color(0x2410B981), // Green container (14% alpha)
            Color(0xFF10B981), // Vibrant Green
            Color(0x5510B981)
        )
        "low" -> Triple(
            Color(0x2406B6D4), // Cyan container
            Color(0xFF06B6D4), // Vibrant Cyan
            Color(0x5506B6D4)
        )
        "medium" -> Triple(
            Color(0x24FBBF24), // Yellow container
            Color(0xFFFBBF24), // Vibrant Yellow
            Color(0x55FBBF24)
        )
        "high" -> Triple(
            Color(0x24F97316), // Orange container
            Color(0xFFF97316), // Vibrant Orange
            Color(0x55F97316)
        )
        "critical" -> Triple(
            Color(0x24EF4444), // Red container
            Color(0xFFEF4444), // Vibrant Red
            Color(0x55EF4444)
        )
        else -> Triple(
            Color(0x2494A3B8),
            Color(0xFF94A3B8),
            Color(0x5594A3B8)
        )
    }

    Surface(
        modifier = modifier,
        shape = RoundedCornerShape(6.dp),
        color = backgroundColor,
        border = BorderStroke(1.dp, borderColor)
    ) {
        Text(
            text = riskLevel.uppercase(),
            color = textColor,
            fontSize = 11.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.8.sp,
            modifier = Modifier.padding(horizontal = 9.dp, vertical = 3.dp)
        )
    }
}
