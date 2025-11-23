package com.jetstart.client.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ScannerScreen(
    onQRScanned: (String) -> Unit,
    onBack: () -> Unit
) {
    var isScanning by remember { mutableStateOf(true) }

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
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            if (isScanning) {
                // Camera preview would go here
                // For now, we'll show a placeholder
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        CircularProgressIndicator()
                        Spacer(modifier = Modifier.height(16.dp))
                        Text(
                            text = "Point camera at QR code",
                            style = MaterialTheme.typography.bodyLarge
                        )
                    }
                }

                // Test button for development
                Button(
                    onClick = {
                        // Simulate QR scan
                        val testQRData = """
                            {
                                "sessionId": "test-session-123",
                                "serverUrl": "http://192.168.1.100:8765",
                                "wsUrl": "ws://192.168.1.100:8766",
                                "token": "test-token-abc",
                                "projectName": "TestProject",
                                "version": "0.1.0"
                            }
                        """.trimIndent()
                        onQRScanned(testQRData)
                    },
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text("Simulate QR Scan (Dev)")
                }
            }
        }
    }
}