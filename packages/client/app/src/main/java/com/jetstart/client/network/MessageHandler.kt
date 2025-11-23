package com.jetstart.client.network

import android.util.Log
import com.google.gson.Gson
import com.google.gson.JsonObject

class MessageHandler {
    private val gson = Gson()
    private val tag = "MessageHandler"

    fun handleMessage(
        message: String,
        onBuildStart: () -> Unit,
        onBuildComplete: (String) -> Unit,
        onBuildError: (String) -> Unit,
        onReload: () -> Unit
    ) {
        try {
            val json = gson.fromJson(message, JsonObject::class.java)
            val type = json.get("type")?.asString

            when (type) {
                "core:connected" -> {
                    Log.d(tag, "Connected to core")
                }
                "core:build-start" -> {
                    Log.d(tag, "Build started")
                    onBuildStart()
                }
                "core:build-complete" -> {
                    val downloadUrl = json.getAsJsonObject("apkInfo")
                        ?.get("downloadUrl")?.asString
                    downloadUrl?.let {
                        Log.d(tag, "Build complete: $it")
                        onBuildComplete(it)
                    }
                }
                "core:build-error" -> {
                    val error = json.get("error")?.asString ?: "Unknown error"
                    Log.e(tag, "Build error: $error")
                    onBuildError(error)
                }
                "core:reload" -> {
                    Log.d(tag, "Reload triggered")
                    onReload()
                }
                else -> {
                    Log.w(tag, "Unknown message type: $type")
                }
            }
        } catch (e: Exception) {
            Log.e(tag, "Failed to handle message: ${e.message}")
        }
    }
}