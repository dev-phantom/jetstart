package com.jetstart.client.data.models

data class LogEntry(
    val id: String,
    val timestamp: Long,
    val level: String,
    val tag: String,
    val message: String,
    val source: String,
    val metadata: Map<String, Any>? = null
)