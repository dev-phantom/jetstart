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
import androidx.compose.material3.*
import androidx.compose.material3.AssistChip
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.platform.LocalContext // Added
import android.content.Context // Added
import androidx.compose.foundation.clickable // Added
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete

// Third-party
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import okhttp3.*

// Standard library & JSON
import org.json.JSONArray
import org.json.JSONObject
import java.io.File
import java.io.FileOutputStream
import java.io.IOException
import android.util.Base64
import dalvik.system.DexClassLoader

// DivKit Imports
import com.yandex.div.DivDataTag
import com.yandex.div.core.Div2Context
import com.yandex.div.core.DivConfiguration
import com.yandex.div.core.view2.Div2View
import com.yandex.div.data.DivParsingEnvironment
import com.yandex.div.json.ParsingErrorLogger
import com.yandex.div.glide.GlideDivImageLoader
import com.yandex.div2.DivData
import androidx.compose.ui.viewinterop.AndroidView
import androidx.appcompat.app.AppCompatActivity

// ============================================================================
// DSL Type Definitions
// ============================================================================

/**
 * DSL Type Definitions
 * Represents UI elements in JSON format that can be interpreted at runtime
 */

// ============================================================================
// DivKit Integration
// ============================================================================

// Removed custom DSL classes (UIDefinition, DSLElement) in favor of standard DivKit JSON.

// ============================================================================
// DSL Interpreter
// ============================================================================


/**
 * DivKit Interpreter
 * Renders DivKit JSON using the official DivKit Android SDK
 */

/**
 * DivKit Interpreter
 * Renders DivKit JSON using the official DivKit Android SDK
 */
object DSLInterpreter {
    private const val TAG = "DSLInterpreter"

    private val _currentDSL = MutableStateFlow<JSONObject?>(null)
    val currentDSL: StateFlow<JSONObject?> = _currentDSL

    private var divConfiguration: DivConfiguration? = null

    /**
     * Update the current DSL definition
     */
    fun updateDSL(jsonString: String) {
        try {
            val json = JSONObject(jsonString)
            _currentDSL.value = json
            Log.d(TAG, "DivKit DSL updated successfully")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to parse DivKit JSON: ${e.message}", e)
        }
    }

    /**
     * Find Activity from a Context (traverses ContextWrapper chain)
     */
    private fun Context.findActivity(): AppCompatActivity? {
        var ctx = this
        while (ctx is android.content.ContextWrapper) {
            if (ctx is AppCompatActivity) return ctx
            ctx = ctx.baseContext
        }
        return null
    }

    /**
     * Render DSL as Compose UI using AndroidView -> Div2View
     */
    @Composable
    fun RenderDSL(json: JSONObject) {
        val context = LocalContext.current
        val activity = context.findActivity()

        if (activity == null) {
            Log.e(TAG, "Cannot find AppCompatActivity from context")
            // Show fallback UI
            androidx.compose.material3.Text(
                text = "Hot reload requires AppCompatActivity",
                color = androidx.compose.ui.graphics.Color.Red
            )
            return
        }

        // Initialize DivConfiguration once
        if (divConfiguration == null) {
            divConfiguration = DivConfiguration.Builder(GlideDivImageLoader(context))
                .build()
        }

        AndroidView(
            factory = { _ ->
                val divContext = Div2Context(
                    baseContext = activity,
                    configuration = divConfiguration!!,
                    lifecycleOwner = activity
                )
                Div2View(divContext)
            },
            update = { view ->
                try {
                    val environment = DivParsingEnvironment(ParsingErrorLogger.ASSERT)
                    // Parse DivKit JSON - expects card format from screen.card
                    val cardJson = json.optJSONObject("screen")?.optJSONObject("card") ?: json
                    val divData = DivData(environment, cardJson)
                    view.setData(divData, DivDataTag("hot_reload"))
                } catch (e: Exception) {
                    Log.e(TAG, "Failed to render DivData: ${e.message}", e)
                }
            }
        )
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

    // DEX-based hot reload state
    private var dexCacheDir: File? = null
    private var dexCounter = 0
    private val loadedClasses = mutableMapOf<String, Class<*>>()

    // Reload version for triggering recomposition
    private val _reloadVersion = MutableStateFlow(0)
    val reloadVersion: StateFlow<Int> = _reloadVersion

    /**
     * Get the current WebSocket connection (for sending messages)
     */
    fun getWebSocket(): WebSocket? = webSocket

    fun connect(activity: Activity, serverUrl: String, sessionId: String) {
        this.activity = activity

        // Initialize DEX cache directory
        dexCacheDir = File(activity.cacheDir, "hot-reload-dex")
        dexCacheDir?.mkdirs()

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
                        "core:dex-reload" -> {
                            // TRUE hot reload - DEX-based class swapping
                            val dexBase64 = json.optString("dexBase64", "")
                            val classNamesArray = json.optJSONArray("classNames")
                            val classNames = mutableListOf<String>()

                            classNamesArray?.let {
                                for (i in 0 until it.length()) {
                                    classNames.add(it.getString(i))
                                }
                            }

                            Log.d(TAG, "🔥 DEX reload received: ${dexBase64.length} base64 chars, ${classNames.size} classes")
                            Log.d(TAG, "Classes: ${classNames.joinToString()}")

                            if (dexBase64.isNotEmpty()) {
                                activity?.runOnUiThread {
                                    android.widget.Toast.makeText(activity, "🔥 True Hot Reload...", android.widget.Toast.LENGTH_SHORT).show()
                                    loadDexAndReload(dexBase64, classNames)
                                }
                            }
                        }

                        "core:ui-update" -> {
                            // DSL-based hot reload (FALLBACK)
                            val timestamp = json.optLong("timestamp", 0)
                            val dslContent = json.optString("dslContent", "")

                            Log.d(TAG, "UI update received at $timestamp")

                            if (dslContent.isNotEmpty()) {
                                Log.d(TAG, "DSL update detected, recomposing (${dslContent.length} bytes)")

                                // Update DSL on main thread
                                activity?.runOnUiThread {
                                    android.widget.Toast.makeText(activity, "⚡ DSL Hot Reload...", android.widget.Toast.LENGTH_SHORT).show()
                                    DSLInterpreter.updateDSL(dslContent)
                                }
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

    /**
     * Load a DEX file and apply hot reload WITHOUT restarting the app.
     * This is TRUE hot reload using the $change field pattern (Instant Run style).
     *
     * How it works:
     * 1. Classes in the APK have been instrumented with a static $change field
     * 2. When we load new DEX, we create IncrementalChange implementations
     * 3. We set $change on the original APK classes via reflection
     * 4. When methods are called, they check $change and delegate to new implementation
     * 5. Trigger recomposition to see the UI updates
     */
    private fun loadDexAndReload(dexBase64: String, classNames: List<String>) {
        try {
            val context = activity ?: return
            val cacheDir = dexCacheDir ?: return

            // Decode and save DEX file
            val dexBytes = Base64.decode(dexBase64, Base64.DEFAULT)

            // Use timestamp-based name to avoid conflicts with previous read-only files
            val dexFile = File(cacheDir, "reload_${System.currentTimeMillis()}.dex")

            // Delete if exists (shouldn't happen with timestamp names)
            if (dexFile.exists()) {
                dexFile.setWritable(true)
                dexFile.delete()
            }

            FileOutputStream(dexFile).use { fos ->
                fos.write(dexBytes)
            }

            // Make file read-only (required by Android security for DexClassLoader)
            dexFile.setReadOnly()

            Log.d(TAG, "🔥 Saved DEX to: ${dexFile.absolutePath} (${dexBytes.size} bytes)")

            // Create Child-First ClassLoader to prioritize classes from DEX
            // This prevents the infinite recursion loop where the new class resolves to the old class
            val dexClassLoader = HotReloadClassLoader(
                dexFile.absolutePath,
                cacheDir.absolutePath,
                null,
                context.classLoader
            )

            // Load the new classes from DEX and apply $change to original classes
            var successCount = 0
            for (className in classNames) {
                try {
                    // Skip $override classes - they're just helpers, not original classes
                    if (className.endsWith("\$override")) {
                        Log.d(TAG, "🔥 Skipping override class: $className")
                        continue
                    }

                    // Load the NEW class from DEX
                    val newClass = dexClassLoader.loadClass(className)
                    loadedClasses[className] = newClass
                    Log.d(TAG, "🔥 Loaded new class from DEX: $className")

                    // Find the ORIGINAL class from APK (loaded by app's classloader)
                    try {
                        val originalClass = context.classLoader.loadClass(className)

                        // ALWAYS use manual dispatch - override classes cause infinite recursion
                        // because they call instance.method() which is the ORIGINAL instrumented method.
                        // When the instrumented method checks $change and calls access$dispatch again,
                        // we get: dispatchToNewClass() → method.invoke() → instrumented code → access$dispatch() → dispatchToNewClass() → LOOP
                        // The recursion guard breaks the cycle but returns null, causing blank screens.
                        // Manual dispatch with new instances from DEX avoids this entirely.
                        if (applyChangeField(originalClass, newClass, dexClassLoader)) {
                            Log.d(TAG, "🔥 Applied ${"$"}change (manual dispatch) to: $className")
                        }

                        successCount++
                    } catch (e: ClassNotFoundException) {
                        // This is a new class, not an update - that's fine
                        Log.d(TAG, "🔥 New class (not update): $className")
                        successCount++
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "🔥 Failed to process class $className: ${e.message}")
                }
            }

            Log.d(TAG, "🔥 Hot reload complete: $successCount/${classNames.size} classes updated")

            // Trigger recomposition by incrementing reload version
            // This will cause @Composable functions to re-execute with new code
            _reloadVersion.value++
            Log.d(TAG, "🔥 Triggered recomposition (version: ${_reloadVersion.value})")

            // Show success toast
            android.widget.Toast.makeText(
                context,
                "🔥 Hot reload applied! ($successCount classes)",
                android.widget.Toast.LENGTH_SHORT
            ).show()

        } catch (e: Exception) {
            Log.e(TAG, "🔥 Failed to load DEX: ${e.message}", e)
            android.widget.Toast.makeText(
                activity,
                "❌ Hot reload failed: ${e.message}",
                android.widget.Toast.LENGTH_LONG
            ).show()
        }
    }

    /**
     * Apply $change field using the $override class (Phase 2 - preferred approach).
     *
     * The override class is generated and already implements IncrementalChange.
     * We just need to instantiate it and set it as $change.
     */
    private fun applyChangeFieldWithOverride(
        originalClass: Class<*>,
        overrideClass: Class<*>
    ): Boolean {
        try {
            // Find the $change field in the original class
            val changeField = try {
                originalClass.getDeclaredField("\$change")
            } catch (e: NoSuchFieldException) {
                Log.w(TAG, "🔥 No \$change field in ${originalClass.name} - not instrumented")
                return false
            }

            changeField.isAccessible = true

            // Instantiate the override class (no-arg constructor)
            // The generated $override class implements IncrementalChange and has a no-arg constructor.
            // It receives the instance as args[0] in the access$dispatch method.
            val overrideInstance = try {
                overrideClass.getDeclaredConstructor().apply { isAccessible = true }.newInstance()
            } catch (e: Exception) {
                Log.w(TAG, "🔥 Cannot instantiate ${overrideClass.name}: ${e.message}")
                return false
            }

            // Set the $change field to the override instance
            changeField.set(null, overrideInstance)

            Log.d(TAG, "🔥 Set \$change field on ${originalClass.name} using \$override class")
            return true

        } catch (e: Exception) {
            Log.e(TAG, "🔥 Failed to apply \$override to ${originalClass.name}: ${e.message}", e)
            return false
        }
    }

    /**
     * Apply $change field to the original class to redirect method calls to new implementation.
     *
     * The original class has been instrumented with:
     *   public static IncrementalChange $change;
     *
     * We create an IncrementalChange that delegates to the new class via reflection.
     */
    private fun applyChangeField(
        originalClass: Class<*>,
        newClass: Class<*>,
        dexClassLoader: ClassLoader
    ): Boolean {
        return try {
            // Find the $change field in the original class
            val changeField = try {
                originalClass.getDeclaredField("\$change")
            } catch (e: NoSuchFieldException) {
                Log.w(TAG, "🔥 No \$change field in ${originalClass.name} - not instrumented")
                return false
            }

            changeField.isAccessible = true

            // Create an IncrementalChange implementation that delegates to the new class
            val incrementalChange = createIncrementalChange(newClass, dexClassLoader)

            if (incrementalChange == null) {
                Log.e(TAG, "🔥 Failed to create IncrementalChange for ${originalClass.name}")
                return false
            }

            // Set the $change field to our implementation
            changeField.set(null, incrementalChange)

            Log.d(TAG, "✔ Set \$change field on ${originalClass.name}")
            true

        } catch (e: NoSuchFieldException) {
            Log.e(TAG, "🔥 Missing \$change field in ${originalClass.name} - not instrumented?")
            false
        } catch (e: IllegalAccessException) {
            Log.e(TAG, "🔥 Cannot access \$change field in ${originalClass.name}: ${e.message}")
            false
        } catch (e: IllegalArgumentException) {
            Log.e(TAG, "🔥 Cannot set \$change field in ${originalClass.name}: ${e.message}")
            false
        } catch (e: Exception) {
            Log.e(TAG, "🔥 Error applying \$change field: ${e.javaClass.simpleName}: ${e.message}", e)
            false
        }
    }

    /**
     * Create an IncrementalChange implementation that delegates method calls
     * to the new class loaded from DEX.
     *
     * This uses dynamic proxy to implement IncrementalChange interface.
     */
    private fun createIncrementalChange(
        newClass: Class<*>,
        dexClassLoader: ClassLoader
    ): Any {
        // Load the IncrementalChange interface from the app's classloader
        // (it needs to be the same class as what the instrumented code expects)
        val incrementalChangeInterface = try {
            activity!!.classLoader.loadClass("com.jetstart.hotreload.IncrementalChange")
        } catch (e: ClassNotFoundException) {
            // Fallback: create a simple delegating object
            Log.w(TAG, "🔥 IncrementalChange interface not found, using fallback")
            return createFallbackIncrementalChange(newClass)
        }

        // Create a dynamic proxy that implements IncrementalChange
        return java.lang.reflect.Proxy.newProxyInstance(
            activity!!.classLoader,
            arrayOf(incrementalChangeInterface)
        ) { _, method, args ->
            when (method.name) {
                "access\$dispatch" -> {
                    // Add validation and logging for arguments
                    if (args == null || args.size < 2) {
                        Log.e(TAG, "🔥 ERROR: Invalid args to access\$dispatch: ${args?.size ?: "null"}")
                        return@newProxyInstance null
                    }

                    val signature = args[0] as? String
                    if (signature == null) {
                        Log.e(TAG, "🔥 ERROR: Signature is null: ${args[0]?.javaClass?.simpleName ?: "unknown"}")
                        return@newProxyInstance null
                    }

                    val methodArgs = args[1] as? Array<*>
                    if (methodArgs == null) {
                        Log.e(TAG, "🔥 ERROR: Method args is null: ${args[1]?.javaClass?.simpleName ?: "unknown"}")
                        return@newProxyInstance null
                    }

                    Log.d(TAG, "🔥 Dispatching: $signature with ${methodArgs.size} args")

                    dispatchToNewClass(newClass, signature, methodArgs)
                }
                else -> {
                    Log.e(TAG, "🔥 ERROR: Unknown method on IncrementalChange: ${method.name}")
                    null
                }
            }
        }
    }

    /**
     * Fallback IncrementalChange for when the interface isn't available
     */
    private fun createFallbackIncrementalChange(newClass: Class<*>): Any {
        return object : com.jetstart.hotreload.IncrementalChange {
            override fun `access$dispatch`(methodSignature: String, vararg args: Any?): Any? {
                return dispatchToNewClass(newClass, methodSignature, args as Array<*>)
            }
        }
    }

    /**
     * Dispatch a method call to the new class implementation.
     *
     * Note: Recursion guard is NOT needed because DEX classes are NOT instrumented.
     * They don't have $change fields, so they can't recurse.
     */
    private fun dispatchToNewClass(newClass: Class<*>, signature: String, args: Array<*>): Any? {
        val methodName = signature.substringBefore(".(")

        try {
            
            // Find methods with matching name
            val allMethods = newClass.declaredMethods
            val candidates = mutableListOf<java.lang.reflect.Method>()

            for (method in allMethods) {
                if (method.name != methodName) continue
                candidates.add(method)
            }

            if (candidates.isEmpty()) {
                Log.w(TAG, "🔥 Method not found: $methodName in ${newClass.name}")
                return null
            }

            // Determine if static based on first candidate
            // All candidates with same name should have same modifiers (instance vs static)
            val representative = candidates.first()
            val isStatic = java.lang.reflect.Modifier.isStatic(representative.modifiers)

            // Prepare actual arguments
            // For instance methods, args[0] is 'this', which we drop because 'invoke' takes instance separately
            val actualArgs = if (isStatic) {
                args
            } else {
                if (args.isEmpty()) emptyArray() else args.drop(1).toTypedArray()
            }

            Log.d(TAG, "🔥 Resolving $methodName: static=$isStatic, totalArgs=${args.size}, actualArgs=${actualArgs.size}")

            // STRICT MATCHING ONLY
            // We do NOT pad arguments anymore. If signatures don't match, we abort.
            // This prevents crashes when adding/removing parameters.

            val method = candidates.find { m ->
                val params = m.parameterTypes
                if (params.size != actualArgs.size) {
                    Log.d(TAG, "🔥 Param count mismatch for ${m.name}: expected ${params.size}, got ${actualArgs.size}")
                    return@find false
                }

                // Check compatibility of each argument
                for (i in params.indices) {
                    val arg = actualArgs[i]
                    val paramType = params[i]

                    if (arg != null) {
                        // Allow assignability (e.g. String passed to CharSequence)
                        // Also handle primitives (Integer -> int)
                        if (!isAssignableFrom(paramType, arg.javaClass)) {
                            Log.d(TAG, "🔥 Type mismatch for ${m.name} param $i: expected ${paramType.simpleName}, got ${arg.javaClass.simpleName}")
                            return@find false
                        }
                    } else {
                        // null passed - only allowed if param is not primitive
                        if (paramType.isPrimitive) {
                            Log.d(TAG, "🔥 Null not allowed for primitive param $i in ${m.name}")
                            return@find false
                        }
                    }
                }
                Log.d(TAG, "🔥 Found matching method: ${m.name} with ${m.parameterCount} params")
                true
            }

            if (method != null) {
                method.isAccessible = true

                // Prepare instance
                val instance = if (isStatic) {
                    null
                } else {
                    if (args.isNotEmpty()) args[0] else null
                }

                Log.d(TAG, "🔥 Invoking ${method.name} on ${if (isStatic) "class" else "instance"}")

                try {
                    val result = method.invoke(instance, *actualArgs)
                    Log.d(TAG, "✔ Dispatch succeeded: ${method.name} returned ${result?.javaClass?.simpleName ?: "null"}")
                    return result
                } catch (e: java.lang.reflect.InvocationTargetException) {
                    Log.e(TAG, "🔥 Method threw exception: ${e.cause?.message}")
                    throw e.cause ?: e
                } catch (e: Exception) {
                    Log.e(TAG, "🔥 Invocation failed: ${e.javaClass.simpleName}: ${e.message}")
                    throw e
                }
            } else {
                Log.w(TAG, "🔥 Signature mismatch for $methodName. Expected ${actualArgs.map { it?.javaClass?.simpleName ?: "null" }}")

                // Inform user about mismatch
                activity?.runOnUiThread {
                    android.widget.Toast.makeText(
                        activity,
                        "⚠️ Restart needed: $methodName signature changed",
                        android.widget.Toast.LENGTH_SHORT
                    ).show()
                }
                return getDefaultValue(signature)
            }

        } catch (e: Exception) {
            Log.e(TAG, "🔥 Dispatch error: ${e.message}", e)
            return getDefaultValue(signature)
        }
    }

    private fun getDefaultValue(signature: String): Any? {
        // signature format: name.(params)returnType
        val returnTypeDesc = signature.substringAfterLast(')')
        return when (returnTypeDesc) {
            "Z" -> false
            "B" -> 0.toByte()
            "S" -> 0.toShort()
            "C" -> '\u0000'
            "I" -> 0
            "J" -> 0L
            "F" -> 0f
            "D" -> 0.0
            else -> null // Objects and void
        }
    }

    private fun isAssignableFrom(paramType: Class<*>, argType: Class<*>): Boolean {
        if (paramType.isAssignableFrom(argType)) return true
        if (paramType == Int::class.javaPrimitiveType && argType == Int::class.javaObjectType) return true
        if (paramType == Boolean::class.javaPrimitiveType && argType == Boolean::class.javaObjectType) return true
        if (paramType == Long::class.javaPrimitiveType && argType == Long::class.javaObjectType) return true
        if (paramType == Float::class.javaPrimitiveType && argType == Float::class.javaObjectType) return true
        if (paramType == Double::class.javaPrimitiveType && argType == Double::class.javaObjectType) return true
        if (paramType == Byte::class.javaPrimitiveType && argType == Byte::class.javaObjectType) return true
        if (paramType == Short::class.javaPrimitiveType && argType == Short::class.javaObjectType) return true
        if (paramType == Char::class.javaPrimitiveType && argType == Char::class.javaObjectType) return true
        return false
    }

    /**
     * Get a loaded override class by name.
     */
    fun getLoadedClass(className: String): Class<*>? {
        return loadedClasses[className]
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

            Log.d(TAG, "Starting installation intent for: ${apkFile.absolutePath}")
            context.startActivity(intent)
            Log.d(TAG, "Installation intent started")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to install APK: ${e.message}")
        }
    }
}

/**
 * Child-First ClassLoader
 * Prioritizes loading classes from the DEX file (child) before delegating to the parent.
 * This is CRITICAL for hot reload to work, otherwise the parent classloader (which has the original class)
 * shadows the new class in the DEX, causing the "new" class to be identically equal to the "old" class,
 * leading to infinite recursion.
 */
class HotReloadClassLoader(
    dexPath: String,
    optimizedDirectory: String?,
    librarySearchPath: String?,
    parent: ClassLoader
) : DexClassLoader(dexPath, optimizedDirectory, librarySearchPath, parent) {

    override fun loadClass(name: String, resolve: Boolean): Class<*> {
        // 1. Check if class is already loaded to prevent duplicate class definition
        var c = findLoadedClass(name)
        if (c != null) {
            if (resolve) resolveClass(c)
            return c
        }

        // 2. Delegate system classes to parent immediately to avoid conflicts
        if (name.startsWith("java.") || name.startsWith("android.") || name.startsWith("androidx.") || name.startsWith("kotlin.")) {
            return super.loadClass(name, resolve)
        }

        // 3. Try to find the class in THIS dex file (child-first)
        try {
            c = findClass(name)
            if (resolve) resolveClass(c)
            return c
        } catch (e: ClassNotFoundException) {
            // 4. If not found in DEX, delegate to parent (dependencies, etc.)
            return super.loadClass(name, resolve)
        }
    }
}
