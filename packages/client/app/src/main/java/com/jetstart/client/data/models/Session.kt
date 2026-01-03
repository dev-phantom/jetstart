package com.jetstart.client.data.models

data class Session(
    val id: String,
    val token: String,
    val serverUrl: String,
    val wsUrl: String,
    val projectName: String,
    val version: String
)

data class QRCodeData(
    val sessionId: String,
    val serverUrl: String,
    val wsUrl: String,
    val token: String,
    val projectName: String,
    val version: String
)