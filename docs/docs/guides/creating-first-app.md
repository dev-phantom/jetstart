---
sidebar_position: 1
title: Creating Your First App
description: Complete guide to creating and running your first JetStart application
---

# Creating Your First App

Learn how to create, customize, and deploy your first JetStart Android application with Kotlin and Jetpack Compose. This guide walks you through the entire process from installation to seeing your app running.

## Prerequisites

### Required Software

Before creating your first app, ensure you have:

**Node.js 18+**
```bash
node --version  # Should be v18.0.0 or higher
```

**Java/JDK 17+**
```bash
java --version  # Should be 17.0.0 or higher
```

**Gradle 8+** (optional - JetStart can install)
```bash
gradle --version  # Should be 8.0 or higher
```

**Android SDK** (optional - JetStart can install)
- Command Line Tools
- Build Tools (34.0.0)
- Platform Tools
- API 34 (Android 14)
- API 24 (Android 7.0) minimum

### Installation Check

Run the audit command to verify your environment:

```bash
npx jetstart install-audit
```

If missing dependencies, use automated installation:

```bash
npx jetstart create my-app --full-install
```

## Step 1: Create Project

### Quick Start (Automated)

```bash
# Create project with automated dependency installation
npx jetstart create my-app --full-install
```

**What happens:**
1. ✓ Checks and installs Java 17+
2. ✓ Checks and installs Android SDK
3. ✓ Installs required SDK components (API 34, Build Tools, etc.)
4. ✓ Creates project structure
5. ✓ Generates Kotlin source files
6. ✓ Configures Gradle build
7. ✓ Installs npm dependencies

### Interactive Mode

For more control over installation:

```bash
npx jetstart create my-app
```

You'll be prompted to:
- Check and install dependencies (yes/no)
- Choose package name (default: com.jetstart.myapp)
- Select installation options interactively

### Custom Package Name

```bash
npx jetstart create my-app --package com.company.myapp
```

**Package naming rules:**
- Format: `com.company.app`
- Lowercase letters only
- Use dots to separate segments
- 3+ segments recommended

### Template Options

```bash
# Default template
npx jetstart create my-app

# Specific template (future feature)
npx jetstart create my-app --template minimal
```

## Step 2: Understand Project Structure

After creation, your project will look like this:

```
my-awesome-app/
├── app/
│   ├── build.gradle              # App-level Gradle configuration
│   ├── proguard-rules.pro        # ProGuard rules
│   └── src/
│       └── main/
│           ├── AndroidManifest.xml
│           ├── java/
│           │   └── com/example/myapp/           # Your app package
│           │       ├── MainActivity.kt          # App entry point
│           │       ├── data/                    # Data models
│           │       ├── logic/                   # Business logic
│           │       └── ui/                      # UI screens & components
│           │           ├── NotesScreen.kt
│           │           └── NotesViewModel.kt
│           └── res/                              # Android resources
├── build.gradle                  # Root build file
├── settings.gradle
├── gradle.properties
├── jetstart.config.json         # JetStart configuration
├── gradlew                       # Gradle wrapper (Linux/macOS)
├── gradlew.bat                   # Gradle wrapper (Windows)
└── README.md
```

### Key Files

**MainActivity.kt** - Your app entry point
```kotlin
package com.jetstart.myapp

import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.jetstart.myapp.ui.NotesScreen

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
```



**jetstart.config.json** - Project configuration
```json
{
  "projectName": "my-app",
  "packageName": "com.jetstart.myapp",
  "version": "1.0.0",
  "jetstart": {
    "version": "0.1.0",
    "enableHotReload": true,
    "enableLogs": true,
    "port": 8765
  }
}
```

**build.gradle** - Android build configuration
```gradle
android {
    namespace 'com.jetstart.myapp'
    compileSdk 34

    defaultConfig {
        applicationId "com.jetstart.myapp"
        minSdk 24
        targetSdk 34
        versionCode 1
        versionName "1.0"
    }
}
```

## Step 3: Start Development Server

Navigate to your project:

```bash
cd my-app
```

Start the dev server:

```bash
jetstart dev
```

**Output:**
```bash

Starting JetStart development server...

[ADB] Found at: C:\Android\platform-tools\adb.exe
[Core] Starting JetStart Core server...
[Logs] Server listening on port 8767
[Core] Injected buildConfigFields into build.gradle
[Core] Injected server URL: ws://192.168.43.220:8766
[Core] [JsCompiler] kotlinc-js ready: kotlinc-js.bat
[Core] Found kotlinc at: C:\kotlinc\bin\kotlinc.bat
[Core] Found d8 at: C:\Android\build-tools\34.0.0\d8.bat (build-tools 34.0.0)
[Core] Using Android SDK: android-34
[Core] Added 242 transforms-3 JARs to classpath
[Core] Built static classpath with 242 entries + 1 project entries
[Core] 🔥 True hot reload enabled (DEX-based)
[Core] HTTP server listening on 0.0.0.0:8765
[Core] WebSocket server listening on port 8766

✔ [Core] JetStart Core is running!
[Core] HTTP Server: http://192.168.43.220:8765   
[Core] WebSocket Server: ws://192.168.43.220:8766
[Core] Session ID: YZj0l1Ms
[Core] Session Token: fMLoUwp6w3Cm

ℹ Emulator deployment not configured: deployer=false, packageName=null

✔ JetStart dev server is running!

ℹ Local:    http://localhost:8765
ℹ Network:  http://192.168.43.220:8765
ℹ Project:  test-app

Scan QR or connect manually:
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █▀█ █▄   ▀▀▀▄▀██▄▀█ ▄▄▄▄▄ █
█ █   █ █▀▀▀█ ▄▀ ███▄ ▄█ ▄█ █   █ █
█ █▄▄▄█ █▀ █▀▀██▄▄▀ ▄▄ ▄███ █▄▄▄█ █
█▄▄▄▄▄▄▄█▄▀ ▀▄█ █ █▄▀ ▀▄█ █▄▄▄▄▄▄▄█
█▄ ▄  ▀▄ ▄▄▀▄▀▀▀▀▄ ▀▀▄█▄▄█ ▀ █▄▀ ▀█
█  ▄█▄▄▄▀▀█▄█▀ ▄ ▄████ ▄█▄█▄▄▀▄ █▀█
█▄ █ ▄█▄▀▄ ▄█▄█▄ ▀ █▀ ▀▀ █▀▀█▄ ▀▄ █
█▀▀▀█▄█▄ █▀█ ▄█▀█▀█▀▀  ▀▀▄ ▀ ██▀█▀█
██▄ ▄▄▀▄█  ▀▄▀▀▀▀█▄█▀ ▄▄▀▀▀▀▀▄▄█▀▀█
█ █▀▀▀▄▄█ ▄▀█▀ ▄ ██▀█   ▀▄▄▀ ▄█ ▀██
█ ▄ ▄█▄▄▄ ███▄█▄▄ ▄▀█ ▀ ▀▀▀▀▀▄▀█▀ █
█ █▄ █ ▄▄▄██ ▄█▀ ███▀ ▀▀▀█ █ ▄█▀▀██
█▄██▄▄▄▄▄▀ ▄▄▀▀▀▄ ▄█ ▀█ ▀ ▄▄▄  ▀▀▀█
█ ▄▄▄▄▄ █▄ ██▀ ▄ ▄▄▄█▀ ▄▄ █▄█ █ ▀▀█
█ █   █ █ ▄▄█▄█▄▄▀▄█▄▀▀▄█  ▄▄ ▄▀ ▀█
█ █▄▄▄█ █ ▄▄ ▄█▀  █▀█ ▀▄▀█   ▀▄▀███
█▄▄▄▄▄▄▄█▄▄▄▄█████▄▄▄█▄▄█▄███▄██▄██


ℹ IP: 192.168.43.220
ℹ Session: YZj0l1Ms
ℹ Token: fMLoUwp6w3Cm
ℹ Watching for file changes...
ℹ Press Ctrl+C to stop
```

## Step 4: Connect Your Device

### Option A: Physical Device (Recommended)

**Prerequisites:**
- Phone and computer on **same WiFi network**
- Android 7.0+ device
- JetStart Client app installed

**Steps:**

1. **Download and Install JetStart Client app:**

   **Download:**
   <a href="/downloads/jetstart-client.apk" download className="">
     📥 Download JetStart Client APK
   </a>

   Alternatively, visit [GitHub Releases](https://github.com/dev-phantom/jetstart/releases) to download the latest APK (e.g., `jetstart-client-v1.2.0.apk`).


   **Disable Play Protect** (required):
   :::warning Important
   Since the JetStart Client app is not yet on the Play Store, you'll need to temporarily disable Play Protect.
   :::
   - Settings → Security → Google Play Protect
   - Tap Settings (gear icon) → Toggle off "Scan apps with Play Protect"
   - See [Client Documentation](../packages/client.md#disabling-play-protect) for detailed steps

   **Install:**
   - Tap the downloaded APK file
   - Tap "Install" when prompted
   - Grant permissions (Camera, Install packages)

2. **Ensure same network:**
   - Connect phone to same WiFi as your computer
   - Or create WiFi hotspot on computer

3. **Scan QR code:**
   - Open JetStart Client app
   - Tap "Create Connection"
   - Point camera at terminal QR code
   - Connection established automatically!
   - Your app will build and install automatically

4. **Manual connection (if QR fails):**
   - Open JetStart Client app
   - Tap "Manual Connection" (if available)
   - Enter details from dev server output:
     - Host: 192.168.1.100
     - Port: 8765
     - Session ID: a1b2c3
     - Token: xyz789
   - Tap "Connect"

:::info Platform Support
The JetStart Client app is available as an **Android APK** only. It supports Android 7.0+ (API 24+). iOS support is not available. See [Client Documentation](../packages/client.md) for more details.
:::

### Option B: Android Emulator

**Prerequisites:**
- Android emulator created and running
- See [Working with Emulators](./working-with-emulators.md) guide

**Steps:**

1. **Create emulator** (one-time setup):
   ```bash
   jetstart android-emulator
   # Select "Create JetStart-Optimized Emulator"
   ```

2. **Start emulator** (if not running):
   ```bash
   jetstart android-emulator
   # Select "Start emulator"
   ```

3. **Deploy to emulator:**
   ```bash
   jetstart dev --emulator
   ```

**What happens:**
- Detects running emulator
- Triggers initial APK build
- Installs APK via ADB
- Launches app automatically
- Future changes use hot reload (no reinstall!)

## Step 5: Make Your First Change

### Edit UI Code

Open any Kotlin file in `app/src/main/java/`:

**Before:**
```kotlin
Text(
    text = "Welcome to JetStart!",
    fontSize = 24.sp,
    fontWeight = FontWeight.Bold
)
```

**After:**
```kotlin
Text(
    text = "Hello World!",
    fontSize = 32.sp,
    fontWeight = FontWeight.Bold,
    color = Color.Blue
)
```

**Save the file** → Changes appear in \instant! 🚀

### Watch the Logs

In a separate terminal:

```bash
jetstart logs
```

You'll see:
```
12:34:56 INFO [CORE] [FileWatcher] Change detected: MainActivity.kt
12:34:56 DEBUG [CORE] [HotReload] Hot reload starting for: MainActivity.kt
12:34:56 INFO [CLIENT] [UI] Applying hot reload update
12:34:56 DEBUG [CLIENT] [Renderer] UI updated in 87ms
```

### Add New Components

Add a button:

```kotlin
Button(onClick = { /* action */ }) {
    Text("Click Me!")
}
```

Add an image:

```kotlin
Image(
    painter = painterResource(R.drawable.logo),
    contentDescription = "Logo"
)
```

Add a column layout:

```kotlin
Column(
    modifier = Modifier.fillMaxSize(),
    horizontalAlignment = Alignment.CenterHorizontally,
    verticalArrangement = Arrangement.Center
) {
    Text("First item")
    Text("Second item")
    Button(onClick = {}) { Text("Third item") }
}
```

## Step 6: Build Production APK

When ready to distribute:

```bash
# Debug build (for testing)
jetstart build

# Release build (for production)
jetstart build --release --sign
```

Output:
```
build/outputs/apk/debug/app-debug.apk
build/outputs/apk/release/app-release-signed.apk
```

See [Production Deployment](./production-deployment.md) for signing and publishing.

## Common Setup Issues

### Issue: "Android SDK not found"

**Solution:**
```bash
jetstart create my-app --full-install
```

Or set `ANDROID_HOME` manually:
```bash
# Windows
set ANDROID_HOME=C:\Users\YourName\AppData\Local\Android\Sdk

# macOS/Linux
export ANDROID_HOME=$HOME/Library/Android/sdk
```

### Issue: "Java version too old"

**Solution:**
Download Java 17+ from [Adoptium](https://adoptium.net/) or:

```bash
# Windows (with Chocolatey)
choco install temurin17

# macOS (with Homebrew)
brew install openjdk@17

# Linux (Ubuntu/Debian)
sudo apt install openjdk-17-jdk
```

### Issue: "Cannot connect to dev server"

**Checklist:**
- [ ] Phone and computer on **same WiFi**
- [ ] Firewall allows port 8765, 8766, 8767
- [ ] Dev server is running (`jetstart dev`)
- [ ] IP address hasn't changed
- [ ] JetStart app has network permissions

**Solution:**
```bash
# Create WiFi hotspot for dedicated connection
# Windows: Settings → Network → Mobile Hotspot
# macOS: System Preferences → Sharing → Internet Sharing
# Linux: Network Manager → Create Hotspot

# Allow firewall (Windows)
netsh advfirewall firewall add rule name="JetStart" dir=in action=allow protocol=TCP localport=8765-8767

# Allow firewall (macOS)
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /path/to/node

# Allow firewall (Linux)
sudo ufw allow 8765:8767/tcp
```

### Issue: "Build failed"

**Solution:**
```bash
# Clean build
cd my-app
./gradlew clean  # or gradlew.bat clean on Windows

# Rebuild
jetstart build
```

## Next Steps

Congratulations! You've created your first JetStart app. 🎉

**Continue learning:**

1. **[Hot Reload Explained](./hot-reload-explained.md)** - Understand the hot reload DEX pipeline
2. **[Using QR Codes](./using-qr-codes.md)** - Master device pairing
3. **[Working with Emulators](./working-with-emulators.md)** - Emulator workflows
4. **[Debugging Tips](./debugging-tips.md)** - Debug like a pro
5. **[Production Deployment](./production-deployment.md)** - Publish to Play Store

**Explore architecture:**

- [Hot Reload System](../architecture/hot-reload-system.md) - Technical deep dive
- [WebSocket Protocol](../architecture/websocket-protocol.md) - Communication layer
- [DSL Rendering](../architecture/dsl-rendering.md) - UI interpretation

**Need help?**

- Check [Common Issues](../troubleshooting/common-issues.md)
- See [Connection Problems](../troubleshooting/connection-problems.md)
- Review [Build Errors](../troubleshooting/build-errors.md)
