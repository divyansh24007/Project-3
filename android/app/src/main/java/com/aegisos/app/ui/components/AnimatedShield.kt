package com.aegisos.app.ui.components

import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.animateFloat
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.rememberInfiniteTransition
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Security
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp

/**
 * AnimatedShield:
 * Shield icon composable with pulsing cybersecurity animation.
 *
 * Requirements:
 * - Shield icon composable with pulsing animation
 * - Use InfiniteTransition for alpha animation
 */
@Composable
fun AnimatedShield(
    modifier: Modifier = Modifier,
    size: Dp = 100.dp,
    tint: Color = Color(0xFF00E5FF), // Cyber Cyan
    riskLevel: String? = null
) {
    val dynamicTint = when (riskLevel?.lowercase()?.trim()) {
        "safe" -> Color(0xFF10B981)
        "low" -> Color(0xFF06B6D4)
        "medium" -> Color(0xFFFBBF24)
        "high" -> Color(0xFFF97316)
        "critical" -> Color(0xFFEF4444)
        else -> tint
    }

    val infiniteTransition = rememberInfiniteTransition(label = "ShieldPulseTransition")

    // Pulsing alpha animation for outer halo ring
    val haloAlpha by infiniteTransition.animateFloat(
        initialValue = 0.15f,
        targetValue = 0.65f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "HaloAlpha"
    )

    // Pulsing scale animation for outer halo ring
    val haloScale by infiniteTransition.animateFloat(
        initialValue = 0.95f,
        targetValue = 1.32f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "HaloScale"
    )

    // Subtle breathing pulse for inner shield
    val iconScale by infiniteTransition.animateFloat(
        initialValue = 0.98f,
        targetValue = 1.04f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1400, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "IconScale"
    )

    Box(
        modifier = modifier.size(size),
        contentAlignment = Alignment.Center
    ) {
        // Pulsing radar/halo wave
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .scale(haloScale)
        ) {
            val centerOffset = center
            val maxRadius = size.toPx() / 2f

            // Outer pulse glow
            drawCircle(
                color = dynamicTint.copy(alpha = haloAlpha * 0.25f),
                radius = maxRadius * 0.92f
            )

            // Outer pulse ring stroke
            drawCircle(
                color = dynamicTint.copy(alpha = haloAlpha),
                radius = maxRadius * 0.92f,
                style = Stroke(width = 2.dp.toPx())
            )
        }

        // Inner solid shield glow
        Canvas(modifier = Modifier.size(size * 0.7f)) {
            drawCircle(
                color = dynamicTint.copy(alpha = 0.12f),
                radius = size.toPx() / 2f
            )
        }

        // Primary Shield Icon
        Icon(
            imageVector = Icons.Default.Security,
            contentDescription = "Shield Protection Active",
            tint = dynamicTint,
            modifier = Modifier
                .size(size * 0.52f)
                .scale(iconScale)
        )
    }
}
