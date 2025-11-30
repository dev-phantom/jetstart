package com.jetstart.client.ui.screens

import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.jetstart.client.data.BuildStatus
import com.jetstart.client.data.ConnectionManager
import com.jetstart.client.network.JetStartHttpClient
import com.jetstart.client.ui.components.StatusCard
import com.jetstart.client.utils.ApkInstaller
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import androidx.compose.runtime.rememberCoroutineScope

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConnectionScreen(
    onBack: () -> Unit
) {
    val context = LocalContext.current
    val connectionInfo by ConnectionManager.connectionInfo.collectAsState()
    val isConnected by ConnectionManager.isConnected.collectAsState()
    val buildStatus by ConnectionManager.buildStatus.collectAsState()
    val coroutineScope = rememberCoroutineScope()

    var isDownloading by remember { mutableStateOf(false) }
    var downloadProgress by remember { mutableStateOf(0) }

    // Connect WebSocket when screen loads
    LaunchedEffect(Unit) {
        ConnectionManager.connectWebSocket(context)
    }

    // Determine status strings
    val connectionStatusText = when {
        isConnected -> "Connected"
        else -> "Connecting..."
    }

    val buildStatusText = when (buildStatus) {
        is BuildStatus.Waiting -> "Waiting for build"
        is BuildStatus.Building -> "Building"
        is BuildStatus.Complete -> "Build complete"
        is BuildStatus.Error -> "Build failed"
    }

    val showInstallButton = buildStatus is BuildStatus.Complete
    val apkDownloadUrl = (buildStatus as? BuildStatus.Complete)?.apkUrl

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
                status = connectionStatusText,
                icon = Icons.Default.Wifi,
                isActive = isConnected
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Build Status
            StatusCard(
                title = "Build",
                status = buildStatusText,
                icon = Icons.Default.Build,
                isActive = buildStatus is BuildStatus.Building
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Project Info
            connectionInfo?.let { info ->
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
                            text = "Project: ${info.projectName}",
                            style = MaterialTheme.typography.bodyMedium
                        )
                        Text(
                            text = "Server: ${info.serverUrl}",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = "Session: ${info.sessionId.take(8)}...",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Build error message
            if (buildStatus is BuildStatus.Error) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.errorContainer
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.Error,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.error
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Build Failed",
                                style = MaterialTheme.typography.titleMedium,
                                color = MaterialTheme.colorScheme.onErrorContainer
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = (buildStatus as BuildStatus.Error).message,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onErrorContainer
                        )
                    }
                }
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Installation section
            if (showInstallButton && apkDownloadUrl != null) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.primaryContainer
                    )
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Icon(
                                Icons.Default.Download,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Build Complete",
                                style = MaterialTheme.typography.titleMedium,
                                color = MaterialTheme.colorScheme.onPrimaryContainer
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            text = "Your app has been built successfully. Install it to see your changes.",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onPrimaryContainer
                        )
                        Spacer(modifier = Modifier.height(12.dp))

                        // Show download progress if downloading
                        if (isDownloading) {
                            LinearProgressIndicator(
                                progress = downloadProgress / 100f,
                                modifier = Modifier.fillMaxWidth()
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                            Text(
                                text = "Downloading APK... $downloadProgress%",
                                style = MaterialTheme.typography.bodySmall
                            )
                            Spacer(modifier = Modifier.height(8.dp))
                        }

                        Button(
                            onClick = {
                                // Request install permission first
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                                    if (!context.packageManager.canRequestPackageInstalls()) {
                                        // Open settings to allow install from unknown sources
                                        val intent = Intent(Settings.ACTION_MANAGE_UNKNOWN_APP_SOURCES).apply {
                                            data = Uri.parse("package:${context.packageName}")
                                        }
                                        context.startActivity(intent)
                                        return@Button
                                    }
                                }

                                // Permission granted, download and install APK
                                isDownloading = true
                                downloadProgress = 0

                                coroutineScope.launch(Dispatchers.IO) {
                                    try {
                                        // Create HTTP client
                                        val httpClient = JetStartHttpClient(connectionInfo?.serverUrl ?: "")

                                        // Download APK
                                        httpClient.downloadFile(
                                            endpoint = apkDownloadUrl,
                                            onProgress = { progress ->
                                                coroutineScope.launch(Dispatchers.Main) {
                                                    downloadProgress = progress
                                                }
                                            },
                                            callback = { apkBytes ->
                                                if (apkBytes != null) {
                                                    // Save APK to cache (already on IO thread)
                                                    val installer = ApkInstaller(context)
                                                    val apkFile = installer.saveApkToCache(apkBytes, "app-debug.apk")

                                                    // Switch to Main thread for UI updates and installation
                                                    coroutineScope.launch(Dispatchers.Main) {
                                                        if (apkFile != null) {
                                                            // Install from local file
                                                            installer.installApk(apkFile)
                                                            isDownloading = false
                                                        } else {
                                                            isDownloading = false
                                                            // TODO: Show error
                                                        }
                                                    }
                                                } else {
                                                    coroutineScope.launch(Dispatchers.Main) {
                                                        isDownloading = false
                                                        // TODO: Show error
                                                    }
                                                }
                                            }
                                        )
                                    } catch (e: Exception) {
                                        coroutineScope.launch(Dispatchers.Main) {
                                            isDownloading = false
                                            // TODO: Show error
                                        }
                                    }
                                }
                            },
                            modifier = Modifier.fillMaxWidth(),
                            enabled = !isDownloading
                        ) {
                            Icon(Icons.Default.InstallMobile, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(if (isDownloading) "Downloading..." else "Install App")
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.weight(1f))

            // Help text when waiting
            if (buildStatus is BuildStatus.Waiting && isConnected) {
                Text(
                    text = "Edit your Kotlin files to trigger a build",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                Spacer(modifier = Modifier.height(16.dp))
            }

            // Disconnect Button
            OutlinedButton(
                onClick = {
                    ConnectionManager.disconnect()
                    onBack()
                },
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Close, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Disconnect")
            }
        }
    }
}
