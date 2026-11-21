package com.aegisos.app.ui.theme

import android.app.Activity
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = AegisCyan,
    onPrimary = Background,
    primaryContainer = Card,
    onPrimaryContainer = AegisCyan,
    secondary = AegisPurple,
    onSecondary = TextPrimary,
    secondaryContainer = Card,
    onSecondaryContainer = AegisPurple,
    tertiary = Success,
    onTertiary = Background,
    background = Background,
    onBackground = TextPrimary,
    surface = Surface,
    onSurface = TextPrimary,
    surfaceVariant = Card,
    onSurfaceVariant = TextMuted,
    error = Critical,
    onError = TextPrimary,
    errorContainer = Card,
    onErrorContainer = Critical
)

@Composable
fun AegisosTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    // AEGISOS is dark-themed by design for high-contrast cybersecurity operations
    val colorScheme = DarkColorScheme
    val view = LocalView.current

    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as? Activity)?.window
            if (window != null) {
                window.statusBarColor = Background.toArgb()
                window.navigationBarColor = Background.toArgb()
                val insetsController = WindowCompat.getInsetsController(window, view)
                insetsController.isAppearanceLightStatusBars = false
                insetsController.isAppearanceLightNavigationBars = false
            }
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        content = content
    )
}
