package {{PACKAGE_NAME}}.data

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "notes")
data class Note(
    @PrimaryKey(autoGenerate = true) val id: Int = 0,
    val content: String,
    val tags: List<String>,
    val timestamp: Long = System.currentTimeMillis()
)
