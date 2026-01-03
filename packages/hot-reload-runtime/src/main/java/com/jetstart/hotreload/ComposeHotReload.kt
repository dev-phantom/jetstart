package com.jetstart.hotreload

import android.app.Activity
import android.content.Context
import android.util.Log
import androidx.compose.runtime.*
import androidx.compose.runtime.snapshots.Snapshot
import java.lang.reflect.Method

/**
 * Compose Hot Reload integration.
 *
 * This provides true hot reload for Compose apps by:
 * 1. Loading new dex files with updated composable functions
 * 2. Triggering Compose recomposition to pick up changes
 * 3. Using reflection to call updated functions
 */
object ComposeHotReload {
    private const val TAG = "ComposeHotReload"

    // Version counter to force recomposition
    private val reloadVersion = mutableStateOf(0)

    // Registry of loaded override classes
    private val loadedClasses = mutableMapOf<String, Class<*>>()

    // Cached composable methods
    private val composableMethods = mutableMapOf<String, Method>()

    /**
     * Get the current reload version.
     * Composables should read this to subscribe to reload events.
     */
    @Composable
    fun rememberReloadVersion(): Int {
        return reloadVersion.value
    }

    /**
     * Trigger recomposition across all observing composables.
     * Called after a successful dex reload.
     */
    fun triggerRecomposition() {
        Log.d(TAG, "Triggering recomposition, version: ${reloadVersion.value + 1}")

        // Increment version in a snapshot to trigger all observers
        Snapshot.withMutableSnapshot {
            reloadVersion.value++
        }
    }

    /**
     * Register an override class loaded from a hot reload dex.
     */
    fun registerOverrideClass(className: String, clazz: Class<*>) {
        loadedClasses[className] = clazz
        // Clear cached methods for this class
        composableMethods.keys
            .filter { it.startsWith(className) }
            .forEach { composableMethods.remove(it) }
        Log.d(TAG, "Registered override class: $className")
    }

    /**
     * Get an override class if one has been loaded.
     */
    fun getOverrideClass(className: String): Class<*>? {
        return loadedClasses[className]
    }

    /**
     * Check if an override exists for a class.
     */
    fun hasOverride(className: String): Boolean {
        return loadedClasses.containsKey(className)
    }

    /**
     * Clear all loaded overrides.
     */
    fun clearOverrides() {
        loadedClasses.clear()
        composableMethods.clear()
        reloadVersion.value = 0
        Log.d(TAG, "Cleared all overrides")
    }

    /**
     * Initialize hot reload for an activity.
     * Call this in onCreate after setContent.
     */
    fun init(activity: Activity, serverUrl: String, sessionId: String) {
        Log.d(TAG, "Initializing ComposeHotReload")

        val runtime = HotReloadRuntime.getInstance(activity)

        // Set callback to trigger Compose recomposition
        runtime.setOnReloadCallback {
            triggerRecomposition()
        }

        // Create and connect the WebSocket client
        val client = HotReloadClient(activity, serverUrl, sessionId)
        client.setReloadListener(object : HotReloadClient.ReloadListener {
            override fun onReloadStarted() {
                Log.d(TAG, "Hot reload started")
            }

            override fun onReloadComplete(success: Boolean) {
                Log.d(TAG, "Hot reload complete: $success")
                if (success) {
                    // Recomposition is triggered by HotReloadRuntime callback
                }
            }

            override fun onConnectionStateChanged(connected: Boolean) {
                Log.d(TAG, "Connection state: $connected")
            }
        })

        client.connect()
    }
}

/**
 * A composable that automatically recomposes when hot reload occurs.
 * Wrap your main content with this to enable hot reload.
 *
 * Example:
 * ```
 * HotReloadRoot {
 *     NotesScreen()
 * }
 * ```
 */
@Composable
fun HotReloadRoot(
    content: @Composable () -> Unit
) {
    // Subscribe to reload version changes
    val version = ComposeHotReload.rememberReloadVersion()

    // Use key to force recreation on version change
    key(version) {
        content()
    }
}
