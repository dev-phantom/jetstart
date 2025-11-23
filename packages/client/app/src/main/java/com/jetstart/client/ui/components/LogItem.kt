package com.jetstart.client.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.unit.dp
import com.jetstart.client.data.models.LogEntry
import java.text.SimpleDateFormat
import java.util.*

@Composable
fun LogItem(log: LogEntry) {
    val levelColor = when (log.level) {
        "VERBOSE" -> Color.Gray
        "DEBUG" -> Color.Blue
        "INFO" -> Color.Green
        "WARN" -> Color(0xFFFFA500) // Orange
        "ERROR" -> Color.Red
        "FATAL" -> Color(0xFF8B0000) // Dark Red
        else -> Color.Black
    }

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surface
        )
    ) {
        Column(
            modifier = Modifier.padding(12.dp)
        ) {
            // Header: timestamp, level, source
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = formatTimestamp(log.timestamp),
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )

                Row {
                    Text(
                        text = log.level,
                        style = MaterialTheme.typography.labelSmall,
                        color = levelColor
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = "[${log.source}]",
                        style = MaterialTheme.typography.labelSmall,
                        color = Color.Gray
                    )
                }
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Tag
            Text(
                text = "[${log.tag}]",
                style = MaterialTheme.typography.bodySmall,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.height(4.dp))

            // Message
            Text(
                text = log.message,
                style = MaterialTheme.typography.bodyMedium,
                fontFamily = FontFamily.Monospace
            )
        }
    }
}

private fun formatTimestamp(timestamp: Long): String {
    val sdf = SimpleDateFormat("HH:mm:ss.SSS", Locale.getDefault())
    return sdf.format(Date(timestamp))
}