package com.jetstart.hotreload

import android.app.Activity
import android.util.Log
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow

/**
 * JetStart Hot Reload — Main entry point.
 *
 * This is the single object that the template's MainActivity calls.
 * It provides:
 *   - connect(activity, serverUrl, sessionId) — start WebSocket & DEX hot reload
 *   - disconnect() — clean up
 *   - reloadVersion — StateFlow<Int> that increments on every hot reload, for triggering recomposition
 *
 * Usage in MainActivity:
 * ```kotlin
 * // In onCreate:
 * HotReload.connect(this, serverUrl, sessionId)
 *
 * // In setContent:
 * val reloadVersion by HotReload.reloadVersion.collectAsState()
 * key(reloadVersion) { AppContent() }
 *
 * // In onDestroy:
 * HotReload.disconnect()
 * ```
 */
object HotReload {
    private const val TAG = "HotReload"

    private var client: HotReloadClient? = null

    // Reload version for triggering recomposition
    private val _reloadVersion = MutableStateFlow(0)
    val reloadVersion: StateFlow<Int> = _reloadVersion

    /**
     * Get the current WebSocket connection (for sending messages).
     */
    fun getWebSocket(): okhttp3.WebSocket? = client?.webSocket

    /**
     * Connect to the JetStart dev server and start listening for hot reload events.
     */
    fun connect(activity: Activity, serverUrl: String, sessionId: String) {
        Log.d(TAG, "Connecting to dev server: $serverUrl (session: $sessionId)")

        val runtime = HotReloadRuntime.getInstance(activity)
        runtime.setActivity(activity)

        // Set callback to trigger Compose recomposition after DEX reload
        runtime.setOnReloadCallback {
            _reloadVersion.value++
            Log.d(TAG, "🔥 Triggered recomposition (version: ${_reloadVersion.value})")
        }

        // Create and connect the WebSocket client
        client = HotReloadClient(activity, serverUrl, sessionId)
        client?.setReloadListener(object : HotReloadClient.ReloadListener {
            override fun onReloadStarted() {
                Log.d(TAG, "Hot reload started")
            }

            override fun onReloadComplete(success: Boolean) {
                Log.d(TAG, "Hot reload complete: $success")
            }

            override fun onConnectionStateChanged(connected: Boolean) {
                Log.d(TAG, "Connection state: $connected")
            }
        })

        client?.connect()
    }

    /**
     * Disconnect from the dev server and clean up resources.
     * Call this in onDestroy().
     */
    fun disconnect() {
        client?.disconnect()
        client = null
        Log.d(TAG, "Disconnected from dev server")
    }
}
