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

class MainActivity : AppCompatActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize hot reload - reads from BuildConfig injected by jetstart dev
        try {
            val serverUrl = BuildConfig.JETSTART_SERVER_URL
            val sessionId = BuildConfig.JETSTART_SESSION_ID
            HotReload.connect(this, serverUrl, sessionId)
        } catch (e: Exception) {
            // BuildConfig not available yet, hot reload will be disabled
            android.util.Log.w("MainActivity", "Hot reload not configured: ${e.message}")
        }

        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    // Observe reload version - forces recomposition when DEX hot reload happens
                    val reloadVersion by HotReload.reloadVersion.collectAsState()

                    // Check if we should render from DSL (hot reload mode)
                    val dsl by DSLInterpreter.currentDSL.collectAsState()

                    // Use reloadVersion as key to force recomposition of entire tree
                    key(reloadVersion) {
                        if (dsl != null) {
                            // Hot reload mode: render from DSL sent by server
                            DSLInterpreter.RenderDSL(dsl!!)
                        } else {
                            // Normal mode: render actual Compose code
                            AppContent()
                        }
                    }
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        HotReload.disconnect()
    }
}

/**
 * Main App Content
 */
@Composable
fun AppContent() {
    NotesScreen()
}