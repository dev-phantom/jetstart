package com.jetstart.client.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.jetstart.client.ui.components.StatusCard

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConnectionScreen(
    qrData: String,
    onBack: () -> Unit
) {
    var connectionStatus by remember { mutableStateOf("Connecting...") }
    var buildStatus by remember { mutableStateOf("Waiting") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Connection") },
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
                .padding(paddingValues)
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // Connection Status
            StatusCard(
                title = "Connection",
                status = connectionStatus,
                icon = Icons.Default.Wifi,
                isActive = connectionStatus == "Connected"
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Build Status
            StatusCard(
                title = "Build",
                status = buildStatus,
                icon = Icons.Default.Build,
                isActive = buildStatus == "Building"
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Project Info
            Card(
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Project Information",
                        style = MaterialTheme.typography.titleMedium
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Session: ${qrData.take(20)}...",
                        style = MaterialTheme.typography.bodyMedium
                    )
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // Disconnect Button
            OutlinedButton(
                onClick = onBack,
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Close, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Disconnect")
            }
        }
    }
}