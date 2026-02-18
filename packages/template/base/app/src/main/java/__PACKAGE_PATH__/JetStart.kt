package {{PACKAGE_NAME}}

// Android
import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.util.Log
import androidx.core.content.FileProvider

// Compose
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

// Third-party
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import okhttp3.*

// Standard library & JSON
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.IOException

// ============================================================================
// DSL Type Definitions
// ============================================================================

/**
 * DSL Type Definitions
 * Represents UI elements in JSON format that can be interpreted at runtime
 */

data class UIDefinition(
    val version: String = "1.0",
    val screen: DSLElement
)

data class DSLElement(
    val type: String,
    val text: String? = null,
    val style: String? = null,
    val color: String? = null,
    val modifier: DSLModifier? = null,
    val horizontalAlignment: String? = null,
    val verticalArrangement: String? = null,
    val contentAlignment: String? = null,
    val height: Int? = null,
    val width: Int? = null,
    val onClick: String? = null,
    val enabled: Boolean? = true,
    val imageVector: String? = null,
    val tint: String? = null,
    val contentDescription: String? = null,
    val children: List<DSLElement>? = null
)

data class DSLModifier(
    val fillMaxSize: Boolean? = null,
    val fillMaxWidth: Boolean? = null,
    val fillMaxHeight: Boolean? = null,
    val padding: Int? = null,
    val paddingHorizontal: Int? = null,
    val paddingVertical: Int? = null,
    val size: Int? = null,
    val height: Int? = null,
    val width: Int? = null,
    val weight: Float? = null
)

/**
 * Parse JSON string to UIDefinition
 */
fun parseUIDefinition(json: String): UIDefinition {
    val obj = JSONObject(json)
    val version = obj.optString("version", "1.0")
    val screenObj = obj.getJSONObject("screen")

    return UIDefinition(
        version = version,
        screen = parseDSLElement(screenObj)
    )
}

/**
 * Parse JSONObject to DSLElement
 */
fun parseDSLElement(obj: JSONObject): DSLElement {
    val children = if (obj.has("children")) {
        val childrenArray = obj.getJSONArray("children")
        List(childrenArray.length()) { i ->
            parseDSLElement(childrenArray.getJSONObject(i))
        }
    } else null

    val modifier = if (obj.has("modifier")) {
        val modObj = obj.getJSONObject("modifier")
        DSLModifier(
            fillMaxSize = modObj.optBoolean("fillMaxSize"),
            fillMaxWidth = modObj.optBoolean("fillMaxWidth"),
            fillMaxHeight = modObj.optBoolean("fillMaxHeight"),
            padding = if (modObj.has("padding")) modObj.getInt("padding") else null,
            paddingHorizontal = if (modObj.has("paddingHorizontal")) modObj.getInt("paddingHorizontal") else null,
            paddingVertical = if (modObj.has("paddingVertical")) modObj.getInt("paddingVertical") else null,
            size = if (modObj.has("size")) modObj.getInt("size") else null,
            height = if (modObj.has("height")) modObj.getInt("height") else null,
            width = if (modObj.has("width")) modObj.getInt("width") else null,
            weight = if (modObj.has("weight")) modObj.getDouble("weight").toFloat() else null
        )
    } else null

    return DSLElement(
        type = obj.getString("type"),
        text = if (obj.has("text")) obj.getString("text") else null,
        style = if (obj.has("style")) obj.getString("style") else null,
        color = if (obj.has("color")) obj.getString("color") else null,
        modifier = modifier,
        horizontalAlignment = if (obj.has("horizontalAlignment")) obj.getString("horizontalAlignment") else null,
        verticalArrangement = if (obj.has("verticalArrangement")) obj.getString("verticalArrangement") else null,
        contentAlignment = if (obj.has("contentAlignment")) obj.getString("contentAlignment") else null,
        height = if (obj.has("height")) obj.getInt("height") else null,
        width = if (obj.has("width")) obj.getInt("width") else null,
        onClick = if (obj.has("onClick")) obj.getString("onClick") else null,
        enabled = obj.optBoolean("enabled", true),
        imageVector = if (obj.has("imageVector")) obj.getString("imageVector") else null,
        tint = if (obj.has("tint")) obj.getString("tint") else null,
        contentDescription = if (obj.has("contentDescription")) obj.getString("contentDescription") else null,
        children = children
    )
}

// ============================================================================
// DSL Interpreter
// ============================================================================

/**
 * DSL Interpreter
 * Converts JSON DSL to Compose UI at runtime
 */
object DSLInterpreter {
    private const val TAG = "DSLInterpreter"

    private val _currentDSL = MutableStateFlow<UIDefinition?>(null)
    val currentDSL: StateFlow<UIDefinition?> = _currentDSL

    /**
     * Update the current DSL definition
     */
    fun updateDSL(jsonString: String) {
        try {
            val definition = parseUIDefinition(jsonString)
            _currentDSL.value = definition
            Log.d(TAG, "DSL updated successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to parse DSL: ${e.message}", e)
        }
    }

    /**
     * Render DSL as Compose UI
     */
    @Composable
    fun RenderDSL(definition: UIDefinition) {
        RenderElement(definition.screen)
    }

    /**
     * Render individual DSL element
     */
    @Composable
    fun RenderElement(element: DSLElement) {
        when (element.type) {
            "Column" -> RenderColumn(element)
            "Row" -> RenderRow(element)
            "Box" -> RenderBox(element)
            "Text" -> RenderText(element)
            "Button" -> RenderButton(element)
            "Spacer" -> RenderSpacer(element)
            else -> {
                Log.w(TAG, "Unknown element type: ${element.type}")
                Text("Unsupported: ${element.type}", color = Color.Red)
            }
        }
    }

    @Composable
    private fun RenderColumn(element: DSLElement) {
        Column(
            modifier = parseModifier(element.modifier),
            horizontalAlignment = parseHorizontalAlignment(element.horizontalAlignment),
            verticalArrangement = parseVerticalArrangement(element.verticalArrangement)
        ) {
            element.children?.forEach { child ->
                RenderElement(child)
            }
        }
    }

    @Composable
    private fun RenderRow(element: DSLElement) {
        Row(
            modifier = parseModifier(element.modifier),
            verticalAlignment = parseVerticalAlignment(element.horizontalAlignment),
            horizontalArrangement = parseHorizontalArrangement(element.verticalArrangement)
        ) {
            element.children?.forEach { child ->
                RenderElement(child)
            }
        }
    }

    @Composable
    private fun RenderBox(element: DSLElement) {
        Box(
            modifier = parseModifier(element.modifier),
            contentAlignment = parseContentAlignment(element.contentAlignment)
        ) {
            element.children?.forEach { child ->
                RenderElement(child)
            }
        }
    }

    @Composable
    private fun RenderText(element: DSLElement) {
        Text(
            text = element.text ?: "",
            style = parseTextStyle(element.style),
            color = parseColor(element.color) ?: Color.Unspecified,
            modifier = parseModifier(element.modifier)
        )
    }

    @Composable
    private fun RenderButton(element: DSLElement) {
        Button(
            onClick = { handleClick(element.onClick, element.text) },
            modifier = parseModifier(element.modifier),
            enabled = element.enabled ?: true
        ) {
            Text(element.text ?: "Button")
        }
    }

    @Composable
    private fun RenderSpacer(element: DSLElement) {
        Spacer(
            modifier = Modifier
                .height(element.height?.dp ?: 0.dp)
                .width(element.width?.dp ?: 0.dp)
        )
    }

    /**
     * Parse DSL modifier to Compose Modifier
     */
    private fun parseModifier(dslModifier: DSLModifier?): Modifier {
        var modifier: Modifier = Modifier

        dslModifier?.let { m ->
            if (m.fillMaxSize == true) modifier = modifier.fillMaxSize()
            if (m.fillMaxWidth == true) modifier = modifier.fillMaxWidth()
            if (m.fillMaxHeight == true) modifier = modifier.fillMaxHeight()

            m.padding?.let { modifier = modifier.padding(it.dp) }
            m.paddingHorizontal?.let { modifier = modifier.padding(horizontal = it.dp) }
            m.paddingVertical?.let { modifier = modifier.padding(vertical = it.dp) }

            m.size?.let { modifier = modifier.size(it.dp) }
            m.height?.let { modifier = modifier.height(it.dp) }
            m.width?.let { modifier = modifier.width(it.dp) }

            // Note: weight() is only available in RowScope/ColumnScope
            // We'll handle it separately when needed
        }

        return modifier
    }

    /**
     * Parse alignment strings
     */
    private fun parseHorizontalAlignment(alignment: String?): Alignment.Horizontal {
        return when (alignment?.lowercase()) {
            "start" -> Alignment.Start
            "centerhorizontally", "center" -> Alignment.CenterHorizontally
            "end" -> Alignment.End
            else -> Alignment.Start
        }
    }

    private fun parseVerticalAlignment(alignment: String?): Alignment.Vertical {
        return when (alignment?.lowercase()) {
            "top" -> Alignment.Top
            "centervertically", "center" -> Alignment.CenterVertically
            "bottom" -> Alignment.Bottom
            else -> Alignment.Top
        }
    }

    private fun parseContentAlignment(alignment: String?): Alignment {
        return when (alignment?.lowercase()) {
            "center" -> Alignment.Center
            "topcenter" -> Alignment.TopCenter
            "topstart" -> Alignment.TopStart
            "topend" -> Alignment.TopEnd
            "bottomcenter" -> Alignment.BottomCenter
            "bottomstart" -> Alignment.BottomStart
            "bottomend" -> Alignment.BottomEnd
            "centerstart" -> Alignment.CenterStart
            "centerend" -> Alignment.CenterEnd
            else -> Alignment.TopStart
        }
    }

    private fun parseVerticalArrangement(arrangement: String?): Arrangement.Vertical {
        return when (arrangement?.lowercase()) {
            "top" -> Arrangement.Top
            "center" -> Arrangement.Center
            "bottom" -> Arrangement.Bottom
            "spacebetween" -> Arrangement.SpaceBetween
            "spacearound" -> Arrangement.SpaceAround
            "spaceevenly" -> Arrangement.SpaceEvenly
            else -> Arrangement.Top
        }
    }

    private fun parseHorizontalArrangement(arrangement: String?): Arrangement.Horizontal {
        return when (arrangement?.lowercase()) {
            "start" -> Arrangement.Start
            "center" -> Arrangement.Center
            "end" -> Arrangement.End
            "spacebetween" -> Arrangement.SpaceBetween
            "spacearound" -> Arrangement.SpaceAround
            "spaceevenly" -> Arrangement.SpaceEvenly
            else -> Arrangement.Start
        }
    }

    /**
     * Parse text style
     */
    @Composable
    private fun parseTextStyle(style: String?): androidx.compose.ui.text.TextStyle {
        return when (style?.lowercase()) {
            "headlinelarge" -> MaterialTheme.typography.headlineLarge
            "headlinemedium" -> MaterialTheme.typography.headlineMedium
            "headlinesmall" -> MaterialTheme.typography.headlineSmall
            "titlelarge" -> MaterialTheme.typography.titleLarge
            "titlemedium" -> MaterialTheme.typography.titleMedium
            "titlesmall" -> MaterialTheme.typography.titleSmall
            "bodylarge" -> MaterialTheme.typography.bodyLarge
            "bodymedium" -> MaterialTheme.typography.bodyMedium
            "bodysmall" -> MaterialTheme.typography.bodySmall
            "labellarge" -> MaterialTheme.typography.labelLarge
            "labelmedium" -> MaterialTheme.typography.labelMedium
            "labelsmall" -> MaterialTheme.typography.labelSmall
            else -> MaterialTheme.typography.bodyMedium
        }
    }

    /**
     * Parse color from string
     */
    private fun parseColor(colorString: String?): Color? {
        if (colorString == null) return null

        return try {
            when {
                colorString.startsWith("#") -> {
                    // Hex color
                    Color(android.graphics.Color.parseColor(colorString))
                }
                else -> null
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to parse color: $colorString")
            null
        }
    }

    /**
     * Handle click events
     */
    private fun handleClick(action: String?, text: String?) {
        if (action != null) {
            Log.d(TAG, "Button clicked: $action")

            // Send click event to dev server
            sendClickEvent(action, "Button", text)
        }
    }

    /**
     * Send click event to dev server via WebSocket
     */
    private fun sendClickEvent(action: String, elementType: String, elementText: String?) {
        try {
            val ws = HotReload.getWebSocket()
            if (ws != null) {
                val message = JSONObject().apply {
                    put("type", "client:click")
                    put("timestamp", System.currentTimeMillis())
                    put("action", action)
                    put("elementType", elementType)
                    elementText?.let { put("elementText", it) }
                }

                ws.send(message.toString())
                Log.d(TAG, "Sent click event to server: $action")
            } else {
                Log.w(TAG, "WebSocket not available, cannot send click event")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to send click event: ${e.message}")
        }
    }
}

// ============================================================================
// Hot Reload Manager
// ============================================================================

/**
 * Hot Reload Manager
 * Connects to JetStart dev server and automatically reloads the app when code changes
 */
object HotReload {
    private const val TAG = "HotReload"
    private var webSocket: WebSocket? = null
    private var activity: Activity? = null
    private var connectionTime: Long = 0
    private var ignoreFirstBuild = true
    private val httpClient = OkHttpClient()

    /**
     * Get the current WebSocket connection (for sending messages)
     */
    fun getWebSocket(): WebSocket? = webSocket

    fun connect(activity: Activity, serverUrl: String, sessionId: String) {
        this.activity = activity

        val wsUrl = serverUrl.replace("http://", "ws://").replace("https://", "wss://")
        Log.d(TAG, "Connecting to dev server: $wsUrl")

        val client = OkHttpClient()
        val request = Request.Builder()
            .url(wsUrl)
            .build()

        webSocket = client.newWebSocket(request, object : WebSocketListener() {
            override fun onOpen(webSocket: WebSocket, response: Response) {
                Log.d(TAG, "WebSocket connected")
                connectionTime = System.currentTimeMillis()
                ignoreFirstBuild = true // Ignore the first build-complete after connecting

                // Send connect message
                val connectMsg = JSONObject().apply {
                    put("type", "client:connect")
                    put("sessionId", sessionId)
                    put("clientType", "test-app")
                }
                webSocket.send(connectMsg.toString())
            }

            override fun onMessage(webSocket: WebSocket, text: String) {
                Log.d(TAG, "Received: $text")

                try {
                    val json = JSONObject(text)
                    val type = json.getString("type")

                    when (type) {
                        "core:ui-update" -> {
                            // DSL-based hot reload (FAST)
                            if (ignoreFirstBuild) {
                                Log.d(TAG, "Ignoring first UI update (old build)")
                                ignoreFirstBuild = false
                                return@onMessage
                            }

                            val timestamp = json.optLong("timestamp", 0)
                            val dslContent = json.optString("dslContent", "")

                            Log.d(TAG, "UI update received at $timestamp, connection at $connectionTime")

                            // Only update if changes happened AFTER we connected
                            if (timestamp > connectionTime && dslContent.isNotEmpty()) {
                                Log.d(TAG, "New UI update detected, recomposing (${dslContent.length} bytes)")

                                // Update DSL on main thread
                                activity?.runOnUiThread {
                                    DSLInterpreter.updateDSL(dslContent)
                                }
                            } else {
                                Log.d(TAG, "Ignoring old UI update")
                            }
                        }

                        "core:reload" -> {
                            Log.d(TAG, "Reload triggered!")
                            // Restart activity on main thread
                            activity?.runOnUiThread {
                                activity?.recreate()
                            }
                        }

                        "core:build-complete" -> {
                            // Full APK rebuild (SLOW - fallback for non-UI changes)
                            if (ignoreFirstBuild) {
                                Log.d(TAG, "Ignoring first build-complete (old build)")
                                ignoreFirstBuild = false
                                return@onMessage
                            }

                            val timestamp = json.optLong("timestamp", 0)
                            val downloadUrl = json.optString("downloadUrl", "")

                            Log.d(TAG, "Build complete at $timestamp, connection at $connectionTime")
                            Log.d(TAG, "Download URL: $downloadUrl")

                            // Only reload if build happened AFTER we connected
                            if (timestamp > connectionTime && downloadUrl.isNotEmpty()) {
                                Log.d(TAG, "New build detected, downloading and installing APK")
                                downloadAndInstallApk(downloadUrl)
                            } else {
                                Log.d(TAG, "Ignoring old build (timestamp before connection)")
                            }
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to parse message: ${e.message}")
                }
            }

            override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                Log.e(TAG, "WebSocket error: ${t.message}")
                // Auto-reconnect after 5 seconds
                android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
                    connect(activity!!, serverUrl, sessionId)
                }, 5000)
            }

            override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                Log.d(TAG, "WebSocket closed: $reason")
            }
        })
    }

    fun disconnect() {
        webSocket?.close(1000, "App closing")
        webSocket = null
        activity = null
    }

    private fun downloadAndInstallApk(downloadUrl: String) {
        Log.d(TAG, "Starting APK download from: $downloadUrl")

        val request = Request.Builder()
            .url(downloadUrl)
            .build()

        httpClient.newCall(request).enqueue(object : Callback {
            override fun onFailure(call: Call, e: IOException) {
                Log.e(TAG, "APK download failed: ${e.message}")
            }

            override fun onResponse(call: Call, response: Response) {
                if (!response.isSuccessful) {
                    Log.e(TAG, "APK download failed with code: ${response.code}")
                    return
                }

                try {
                    val apkData = response.body?.bytes()
                    if (apkData == null) {
                        Log.e(TAG, "APK data is null")
                        return
                    }

                    Log.d(TAG, "APK downloaded successfully (${apkData.size} bytes)")

                    // Save APK to cache directory
                    val cacheDir = activity?.cacheDir
                    if (cacheDir == null) {
                        Log.e(TAG, "Cache directory is null")
                        return
                    }

                    val apkFile = File(cacheDir, "update.apk")
                    apkFile.outputStream().use { output ->
                        output.write(apkData)
                    }

                    Log.d(TAG, "APK saved to: ${apkFile.absolutePath}")

                    // Install APK on main thread
                    activity?.runOnUiThread {
                        installApk(apkFile)
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to save/install APK: ${e.message}")
                }
            }
        })
    }

    private fun installApk(apkFile: File) {
        try {
            val context = activity ?: return

            val uri = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                FileProvider.getUriForFile(
                    context,
                    "${context.packageName}.fileprovider",
                    apkFile
                )
            } else {
                Uri.fromFile(apkFile)
            }

            val intent = Intent(Intent.ACTION_VIEW).apply {
                setDataAndType(uri, "application/vnd.android.package-archive")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            }

            context.startActivity(intent)
            Log.d(TAG, "Installation intent started")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to install APK: ${e.message}")
        }
    }
}
