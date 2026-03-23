package com.jetstart.client.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.jetstart.client.data.ConnectionManager
import com.jetstart.client.ui.components.QRScanner

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScannerScreen(
    onQRScanned: () -> Unit,
    onBack: () -> Unit
) {
    var showManualInput by remember { mutableStateOf(false) }
    var manualIpAddress by remember { mutableStateOf("") }
    var manualSessionId by remember { mutableStateOf("") }
    var manualToken by remember { mutableStateOf("") }
    var errorMessage by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Scan QR Code") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            if (!showManualInput) {
                // QR Scanner with viewfinder overlay
                Box(modifier = Modifier.fillMaxSize()) {
                    // Camera preview
                    QRScanner(
                        onQRScanned = { qrData ->
                            if (ConnectionManager.parseAndSetConnection(qrData)) {
                                onQRScanned()
                            } else {
                                errorMessage = "Invalid QR code"
                            }
                        },
                        modifier = Modifier.fillMaxSize()
                    )

                    // Scan area overlay (viewfinder)
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Box(
                            modifier = Modifier
                                .size(250.dp)
                                .border(
                                    BorderStroke(3.dp, Color.White),
                                    RoundedCornerShape(12.dp)
                                )
                        )
                    }

                    Card(
                        modifier = Modifier
                            .align(Alignment.TopCenter)
                            .padding(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = Color.Black.copy(alpha = 0.7f)
                        )
                    ) {
                        Text(
                            text = "Point camera at QR code",
                            color = Color.White,
                            modifier = Modifier.padding(16.dp),
                            style = MaterialTheme.typography.bodyLarge
                        )
                    }

                    Button(
                        onClick = { showManualInput = true },
                        modifier = Modifier
                            .align(Alignment.BottomCenter)
                            .padding(16.dp)
                            .fillMaxWidth(0.8f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = MaterialTheme.colorScheme.secondary
                        )
                    ) {
                        Text("Enter Details Manually")
                    }
                }
            } else {
                Column(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(24.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Text(
                        text = "Enter Connection Details",
                        style = MaterialTheme.typography.headlineSmall
                    )

                    Text(
                        text = "Your phone and PC must be on the same network",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )

                    OutlinedTextField(
                        value = manualIpAddress,
                        onValueChange = { manualIpAddress = it },
                        label = { Text("PC IP Address") },
                        placeholder = { Text("e.g., 192.168.1.100") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = manualSessionId,
                        onValueChange = { manualSessionId = it },
                        label = { Text("Session ID") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    OutlinedTextField(
                        value = manualToken,
                        onValueChange = { manualToken = it },
                        label = { Text("Token") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true
                    )

                    if (errorMessage != null) {
                        Text(
                            text = errorMessage!!,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodySmall
                        )
                    }

                    Spacer(modifier = Modifier.weight(1f))

                    Button(
                        onClick = {
                            ConnectionManager.setConnectionFromIP(
                                ip = manualIpAddress.trim(),
                                sessionId = manualSessionId.trim(),
                                token = manualToken.trim()
                            )
                            onQRScanned()
                        },
                        modifier = Modifier.fillMaxWidth(),
                        enabled = manualIpAddress.isNotBlank() &&
                                  manualSessionId.isNotBlank() &&
                                  manualToken.isNotBlank()
                    ) {
                        Text("Connect")
                    }

                    OutlinedButton(
                        onClick = { showManualInput = false },
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Text("Back to Scanner")
                    }
                }
            }
        }
    }
}
