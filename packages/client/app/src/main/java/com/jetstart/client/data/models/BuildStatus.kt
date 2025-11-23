package com.jetstart.client.data.models

data class BuildStatus(
    val phase: BuildPhase,
    val progress: Int,
    val message: String,
    val timestamp: Long
)

enum class BuildPhase {
    IDLE,
    INITIALIZING,
    COMPILING,
    PACKAGING,
    SIGNING,
    OPTIMIZING,
    COMPLETE,
    FAILED
}