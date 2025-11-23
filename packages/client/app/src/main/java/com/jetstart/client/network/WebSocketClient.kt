package com.jetstart.client.network

import android.util.Log
import com.google.gson.Gson
import org.java_websocket.client.WebSocketClient
import org.java_websocket.handshake.ServerHandshake
import java.net.URI

class JetStartWebSocketClient(
    serverUri: URI,
    private val onMessageReceived: (String) -> Unit,
    private val onConnected: () -> Unit,
    private val onDisconnected: () -> Unit
) : WebSocketClient(serverUri) {

    private val gson = Gson()
    private val tag = "WebSocketClient"

    override fun onOpen(handshakedata: ServerHandshake?) {
        Log.d(tag, "WebSocket connected")
        onConnected()
    }

    override fun onMessage(message: String?) {
        message?.let {
            Log.d(tag, "Received: $it")
            onMessageReceived(it)
        }
    }

    override fun onClose(code: Int, reason: String?, remote: Boolean) {
        Log.d(tag, "WebSocket closed: $reason")
        onDisconnected()
    }

    override fun onError(ex: Exception?) {
        Log.e(tag, "WebSocket error: ${ex?.message}")
    }

    fun sendMessage(message: Any) {
        try {
            val json = gson.toJson(message)
            send(json)
            Log.d(tag, "Sent: $json")
        } catch (e: Exception) {
            Log.e(tag, "Failed to send message: ${e.message}")
        }
    }

    companion object {
        fun create(
            wsUrl: String,
            onMessageReceived: (String) -> Unit,
            onConnected: () -> Unit,
            onDisconnected: () -> Unit
        ): JetStartWebSocketClient {
            val uri = URI(wsUrl)
            return JetStartWebSocketClient(
                uri,
                onMessageReceived,
                onConnected,
                onDisconnected
            )
        }
    }
}