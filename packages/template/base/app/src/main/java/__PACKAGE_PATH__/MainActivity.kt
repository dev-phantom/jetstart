package {{PACKAGE_NAME}}

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
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
                    // Check if we should render from DSL (hot reload mode)
                    val dsl by DSLInterpreter.currentDSL.collectAsState()

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

    override fun onDestroy() {
        super.onDestroy()
        HotReload.disconnect()
    }
}

/**
 * Main App Content - REAL Kotlin Compose Code!
 * This gets parsed to DSL and sent via hot reload
 */
@Composable
fun AppContent() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "Welcome to JetStart! 🚀",
            style = MaterialTheme.typography.headlineMedium
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Edit this code and save to see hot reload!",
            style = MaterialTheme.typography.bodyMedium
        )

        Spacer(modifier = Modifier.height(24.dp))

        Button(
            onClick = { /* Handle click */ },
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Click Me!")
        }
    }
}
