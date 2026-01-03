package com.jetstart.client.data.repository

import com.jetstart.client.data.models.Session
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class SessionRepository {
    private val _currentSession = MutableStateFlow<Session?>(null)
    val currentSession: StateFlow<Session?> = _currentSession.asStateFlow()

    private val _isConnected = MutableStateFlow(false)
    val isConnected: StateFlow<Boolean> = _isConnected.asStateFlow()

    fun setSession(session: Session) {
        _currentSession.value = session
    }

    fun clearSession() {
        _currentSession.value = null
        _isConnected.value = false
    }

    fun setConnected(connected: Boolean) {
        _isConnected.value = connected
    }

    fun getSession(): Session? {
        return _currentSession.value
    }
}