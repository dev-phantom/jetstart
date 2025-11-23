package com.jetstart.client.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun QRScanner(
    onQRScanned: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    // Placeholder for camera preview
    // In real implementation, use CameraX with ML Kit barcode scanning
    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text("Camera Preview")
            Spacer(modifier = Modifier.height(8.dp))
            Text("QR Scanner will be implemented here")
        }
    }
}