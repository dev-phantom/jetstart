package com.jetstart.client.network

import android.util.Log
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import com.google.gson.Gson
import java.io.IOException

class JetStartHttpClient(private val baseUrl: String) {
    
    private val client = OkHttpClient.Builder()
        .build()
    
    private val gson = Gson()
    private val tag = "HttpClient"
    
    private val JSON = "application/json; charset=utf-8".toMediaType()

    fun get(endpoint: String, callback: (String?) -> Unit) {
        val url = "$baseUrl$endpoint"
        val request = Request.Builder()
            .url(url)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e(tag, "GET $endpoint failed: ${e.message}")
                callback(null)
            }

            override fun onResponse(call: Call, response: Response) {
                if (response.isSuccessful) {
                    callback(response.body?.string())
                } else {
                    Log.e(tag, "GET $endpoint error: ${response.code}")
                    callback(null)
                }
            }
        })
    }

    fun post(endpoint: String, body: Any, callback: (String?) -> Unit) {
        val url = "$baseUrl$endpoint"
        val json = gson.toJson(body)
        val requestBody = json.toRequestBody(JSON)
        
        val request = Request.Builder()
            .url(url)
            .post(requestBody)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e(tag, "POST $endpoint failed: ${e.message}")
                callback(null)
            }

            override fun onResponse(call: Call, response: Response) {
                if (response.isSuccessful) {
                    callback(response.body?.string())
                } else {
                    Log.e(tag, "POST $endpoint error: ${response.code}")
                    callback(null)
                }
            }
        })
    }

    fun downloadFile(endpoint: String, onProgress: (Int) -> Unit, callback: (ByteArray?) -> Unit) {
        val url = "$baseUrl$endpoint"
        val request = Request.Builder()
            .url(url)
            .build()

        client.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e(tag, "Download failed: ${e.message}")
                callback(null)
            }

            override fun onResponse(call: Call, response: Response) {
                if (response.isSuccessful) {
                    response.body?.let { body ->
                        val totalSize = body.contentLength()
                        val bytes = body.bytes()
                        onProgress(100)
                        callback(bytes)
                    } ?: callback(null)
                } else {
                    callback(null)
                }
            }
        })
    }
}