package com.aegisos.app.ui.components

import android.graphics.Paint
import android.graphics.Typeface
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.drawIntoCanvas
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.unit.dp

/**
 * TrustScoreIndicator:
 * Circular arc gauge drawn using Canvas with animated progress sweep.
 *
 * Requirements:
 * - score (Int 0-100), modifier
 * - Animated arc with animateFloatAsState
 * - Color: green if score>=80, cyan if >=60, yellow if >=40, red if <40
 * - Score number and "Trust Score" text in center using drawIntoCanvas
 */
@Composable
fun TrustScoreIndicator(
    score: Int,
    modifier: Modifier = Modifier
) {
    val clampedScore = score.coerceIn(0, 100)

    // Dynamic color resolution based on security trust score thresholds
    val scoreColor = when {
        clampedScore >= 80 -> Color(0xFF10B981) // Green (Safe/Trustworthy)
        clampedScore >= 60 -> Color(0xFF06B6D4) // Cyan (Low Risk)
        clampedScore >= 40 -> Color(0xFFFBBF24) // Yellow (Medium Risk)
        else -> Color(0xFFEF4444)               // Red (Critical / Untrusted)
    }

    // High-contrast background track for cyber telemetry aesthetic
    val trackColor = Color(0xFF1E293B) // Dark Slate

    // 270-degree gauge starting at bottom-left (135°) sweeping clockwise
    val startAngle = 135f
    val totalSweepAngle = 270f
    val targetSweep = (clampedScore / 100f) * totalSweepAngle

    // Smooth animation for arc sweep
    val animatedSweep by animateFloatAsState(
        targetValue = targetSweep,
        animationSpec = tween(durationMillis = 1400, easing = FastOutSlowInEasing),
        label = "TrustScoreSweep"
    )

    // Smooth animation for numeric display
    val animatedScore by animateFloatAsState(
        targetValue = clampedScore.toFloat(),
        animationSpec = tween(durationMillis = 1400, easing = FastOutSlowInEasing),
        label = "TrustScoreValue"
    )

    Box(
        modifier = modifier
            .size(190.dp)
            .aspectRatio(1f),
        contentAlignment = Alignment.Center
    ) {
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .padding(14.dp)
        ) {
            val strokeWidth = size.minDimension * 0.09f
            val arcSize = size.minDimension - strokeWidth
            val topLeft = Offset(
                x = (size.width - arcSize) / 2f,
                y = (size.height - arcSize) / 2f
            )

            // 1. Draw Background Track Arc
            drawArc(
                color = trackColor,
                startAngle = startAngle,
                sweepAngle = totalSweepAngle,
                useCenter = false,
                topLeft = topLeft,
                size = Size(arcSize, arcSize),
                style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
            )

            // 2. Draw Animated Score Arc
            if (animatedSweep > 0f) {
                drawArc(
                    color = scoreColor,
                    startAngle = startAngle,
                    sweepAngle = animatedSweep,
                    useCenter = false,
                    topLeft = topLeft,
                    size = Size(arcSize, arcSize),
                    style = Stroke(width = strokeWidth, cap = StrokeCap.Round)
                )
            }

            // 3. Draw Score Number and "Trust Score" label using native canvas
            drawIntoCanvas { canvas ->
                val nativeCanvas = canvas.nativeCanvas
                val centerX = size.width / 2f
                val centerY = size.height / 2f

                // Paint for Score Number
                val scorePaint = Paint().apply {
                    isAntiAlias = true
                    textAlign = Paint.Align.CENTER
                    color = android.graphics.Color.WHITE
                    textSize = size.minDimension * 0.28f
                    typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
                }

                // Paint for "Trust Score" Subtitle
                val labelPaint = Paint().apply {
                    isAntiAlias = true
                    textAlign = Paint.Align.CENTER
                    color = android.graphics.Color.parseColor("#94A3B8") // Slate-400
                    textSize = size.minDimension * 0.082f
                    typeface = Typeface.create(Typeface.DEFAULT, Typeface.NORMAL)
                    letterSpacing = 0.06f
                }

                // Calculate vertical optical centering
                val scoreText = "${animatedScore.toInt()}"
                val textBounds = android.graphics.Rect()
                scorePaint.getTextBounds(scoreText, 0, scoreText.length, textBounds)
                val scoreY = centerY + (textBounds.height() / 4f) - (size.minDimension * 0.03f)

                nativeCanvas.drawText(scoreText, centerX, scoreY, scorePaint)

                // Subtitle position below score
                val labelY = scoreY + (size.minDimension * 0.16f)
                nativeCanvas.drawText("Trust Score", centerX, labelY, labelPaint)
            }
        }
    }
}
