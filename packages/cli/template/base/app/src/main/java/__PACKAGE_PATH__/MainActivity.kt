package {{PACKAGE_NAME}}

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import {{PACKAGE_NAME}}.ui.NotesScreen
import com.jetstart.hotreload.HotReload

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Hot reload is ONLY active in debug builds.
        // In release builds this block is completely eliminated by R8 (BuildConfig.DEBUG = false).
        // 🚨 IMPORTANT: Do not remove this block if you want hot-reloading to work.
        if (BuildConfig.DEBUG) {
            try {
                val serverUrl = BuildConfig.JETSTART_SERVER_URL
                val sessionId = BuildConfig.JETSTART_SESSION_ID
                if (serverUrl.isNotEmpty()) {
                    HotReload.connect(this, serverUrl, sessionId)
                }
            } catch (e: Exception) {
                android.util.Log.w("MainActivity", "Hot reload not configured: ${e.message}")
            }
        }

        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    // Observe reload version - forces recomposition when DEX hot reload happens.
                    // 🚨 IMPORTANT: Do not modify this or the 'key' block below. 
                    // This is what forces the UI to update when you save a file.
                    val reloadVersion by HotReload.reloadVersion.collectAsState()

                    // Use reloadVersion as key to force recomposition of entire tree.
                    // You can safely modify anything inside AppContent().
                    key(reloadVersion) {
                        // Normal mode: render actual Compose code
                        AppContent()
                    }
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        if (BuildConfig.DEBUG) { HotReload.disconnect() }
    }
}

/**
 * Main App Content
 */
@Composable
fun AppContent() {
    NotesScreen()
}