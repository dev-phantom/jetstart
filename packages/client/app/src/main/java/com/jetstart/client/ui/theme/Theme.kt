package com.jetstart.client.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val JetStartColorScheme = darkColorScheme(
    primary = JetStartPrimary,
    onPrimary = JetStartOnPrimary,
    secondary = JetStartSecondary,
    tertiary = JetStartOrange,
    background = JetStartBg,
    surface = JetStartSurface,
    onBackground = JetStartText,
    onSurface = JetStartText,
    error = JetStartError,
    surfaceVariant = JetStartAltBg
)

@Composable
fun JetStartTheme(
    content: @Composable () -> Unit
) {
    val colorScheme = JetStartColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = JetStartBg.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}