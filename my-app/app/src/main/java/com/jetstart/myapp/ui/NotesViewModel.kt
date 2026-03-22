package com.jetstart.myapp.ui

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.jetstart.myapp.data.AppDatabase
import com.jetstart.myapp.data.Note
import com.jetstart.myapp.logic.TaggingEngine
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch

class NotesViewModel(application: Application) : AndroidViewModel(application) {
    private val dao = AppDatabase.getDatabase(application).noteDao()
    private val taggingEngine = TaggingEngine()
    
    // For search
    private val _searchQuery = MutableStateFlow("")
    val searchQuery = _searchQuery.asStateFlow()
    
    // All notes from DB
    val notes = dao.getAllNotes()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Search results: Use combine to filter locally for responsiveness, or use DAO search
    val searchResults = combine(notes, _searchQuery) { list, query ->
        if (query.isBlank()) list
        else list.filter { it.content.contains(query, ignoreCase = true) || it.tags.any { tag -> tag.contains(query, ignoreCase = true) } }
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun onSearchQueryChanged(query: String) {
        _searchQuery.value = query
    }

    fun addNote(content: String) {
        if (content.isBlank()) return
        val tags = taggingEngine.autoTag(content)
        val note = Note(content = content, tags = tags)
        viewModelScope.launch {
            dao.insertNote(note)
        }
    }
    
    fun deleteNote(note: Note) {
        viewModelScope.launch {
            dao.deleteNote(note)
        }
    }
    
    // Trigger full build for client update 7 (Fix Duplicate Renderers)
    fun getSuggestedTags(content: String): List<String> {
        return taggingEngine.autoTag(content)
    }
}
