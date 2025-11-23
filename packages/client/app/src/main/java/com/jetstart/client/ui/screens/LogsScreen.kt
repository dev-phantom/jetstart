package com.jetstart.client.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.jetstart.client.data.models.LogEntry
import com.jetstart.client.ui.components.LogItem

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LogsScreen(
    onBack: () -> Unit
) {
    // Sample logs for demonstration
    val sampleLogs = remember {
        listOf(
            LogEntry(
                id = "1",
                timestamp = System.currentTimeMillis(),
                level = "INFO",
                tag = "JetStart",
                message = "Connected to development server",
                source = "CLIENT"
            ),
            LogEntry(
                id = "2",
                timestamp = System.currentTimeMillis(),
                level = "INFO",
                tag = "Build",
                message = "Build started",
                source = "BUILD"
            ),
            LogEntry(
                id = "3",
                timestamp = System.currentTimeMillis(),
                level = "WARN",
                tag = "Network",
                message = "Connection timeout, retrying...",
                source = "NETWORK"
            ),
            LogEntry(
                id = "4",
                timestamp = System.currentTimeMillis(),
                level = "ERROR",
                tag = "Build",
                message = "Compilation failed: Syntax error",
                source = "BUILD"
            )
        )
    }

    var logs by remember { mutableStateOf(sampleLogs) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Logs") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                },
                actions = {
                    IconButton(onClick = { logs = emptyList() }) {
                        Icon(Icons.Default.Delete, contentDescription = "Clear Logs")
                    }
                }
            )
        }
    ) { paddingValues ->
        if (logs.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentAlignment = androidx.compose.ui.Alignment.Center
            ) {
                Text(
                    text = "No logs yet",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        } else {
            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues),
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(logs) { log ->
                    LogItem(log = log)
                }
            }
        }
    }
}