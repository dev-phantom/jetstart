package com.jetstart.client.data

import android.content.Context
import android.util.Log
import com.google.gson.Gson
import com.jetstart.client.network.JetStartWebSocketClient
import com.jetstart.client.utils.DeviceInfo
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import org.json.JSONObject

data class ConnectionInfo(
    val sessionId: String,
    val token: String,
    val serverUrl: String,
    val wsUrl: String,
    val projectName: String,
    val version: String
)

sealed class BuildStatus {
    object Waiting : BuildStatus()
    object Building : BuildStatus()
    data class Complete(val apkUrl: String) : BuildStatus()
    data class Error(val message: String) : BuildStatus()
}

object ConnectionManager {
    private val tag = "ConnectionManager"
    private val gson = Gson()
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    private val _connectionInfo = MutableStateFlow<ConnectionInfo?>(null)
    val connectionInfo: StateFlow<ConnectionInfo?> = _connectionInfo.asStateFlow()

    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()

    private val _buildStatus = MutableStateFlow<BuildStatus>(BuildStatus.Waiting)
    val buildStatus: StateFlow<BuildStatus> = _buildStatus.asStateFlow()

    private var webSocketClient: JetStartWebSocketClient? = null

    fun parseAndSetConnection(qrData: String): Boolean {
        return try {
            Log.d(tag, "Parsing QR data...")
            val json = JSONObject(qrData)
            val info = ConnectionInfo(
                sessionId = json.getString("sessionId"),
                token = json.getString("token"),
                serverUrl = json.getString("serverUrl"),
                wsUrl = json.getString("wsUrl"),
                projectName = json.getString("projectName"),
                version = json.getString("version")
            )
            _connectionInfo.value = info
            Log.d(tag, "Connection info set: wsUrl=${info.wsUrl}, sessionId=${info.sessionId}")
            true
        } catch (e: Exception) {
            Log.e(tag, "Failed to parse QR data: ${e.message}", e)
            e.printStackTrace()
            false
        }
    }

    fun setConnectionFromIP(
        ip: String,
        sessionId: String,
        token: String,
        projectName: String = "Manual"
    ) {
        val info = ConnectionInfo(
            sessionId = sessionId,
            token = token,
            serverUrl = "http://$ip:8765",
            wsUrl = "ws://$ip:8766",
            projectName = projectName,
            version = "0.1.0"
        )
        _connectionInfo.value = info
        Log.d(tag, "Manual connection set: wsUrl=${info.wsUrl}, sessionId=$sessionId")
    }

    fun connectWebSocket(context: Context) {
        val info = _connectionInfo.value
        if (info == null) {
            Log.e(tag, "Cannot connect: connection info is null")
            return
        }

        Log.d(tag, "Starting WebSocket connection to ${info.wsUrl}")

        scope.launch {
            try {
                webSocketClient = JetStartWebSocketClient.create(
                    wsUrl = info.wsUrl,
                    onMessageReceived = { message ->
                        Log.d(tag, "Received message: $message")
                        handleWebSocketMessage(message)
                    },
                    onConnected = {
                        Log.d(tag, "WebSocket connected successfully!")
                        // Send client:connect message
                        val connectMessage = mapOf(
                            "type" to "client:connect",
                            "sessionId" to info.sessionId,
                            "token" to info.token,
                            "deviceInfo" to DeviceInfo.getDeviceInfo(context)
                        )
                        webSocketClient?.sendMessage(connectMessage)
                        Log.d(tag, "Sent client:connect message")
                    },
                    onDisconnected = {
                        Log.w(tag, "WebSocket disconnected")
                        _isConnected.value = false
                    }
                )

                Log.d(tag, "Calling connect()...")
                webSocketClient?.connect()
                Log.d(tag, "Connect() called")
            } catch (e: Exception) {
                Log.e(tag, "Failed to connect WebSocket: ${e.message}", e)
                e.printStackTrace()
            }
        }
    }

    private fun handleWebSocketMessage(message: String) {
        try {
            val json = JSONObject(message)
            val type = json.getString("type")

            Log.d(tag, "Received message type: $type")

            when (type) {
                "core:connected" -> {
                    _isConnected.value = true
                    Log.d(tag, "Core confirmed connection")
                }

                "core:build-start" -> {
                    _buildStatus.value = BuildStatus.Building
                    Log.d(tag, "Build started")
                }

                "core:build-complete" -> {
                    val downloadUrl = json.optString("downloadUrl", "")
                    _buildStatus.value = BuildStatus.Complete(downloadUrl)
                    Log.d(tag, "Build complete: $downloadUrl")
                }

                "core:build-error" -> {
                    val error = json.optString("error", "Unknown error")
                    _buildStatus.value = BuildStatus.Error(error)
                    Log.e(tag, "Build error: $error")
                }

                "core:reload" -> {
                    val reloadType = json.optString("reloadType", "full")
                    Log.d(tag, "Reload requested: $reloadType")
                    // TODO: Handle reload
                }

                else -> {
                    Log.w(tag, "Unknown message type: $type")
                }
            }
        } catch (e: Exception) {
            Log.e(tag, "Failed to parse message: ${e.message}", e)
            e.printStackTrace()
        }
    }

    fun disconnect() {
        Log.d(tag, "Disconnecting...")
        webSocketClient?.close()
        webSocketClient = null
        _isConnected.value = false
        _connectionInfo.value = null
        _buildStatus.value = BuildStatus.Waiting
    }
}
