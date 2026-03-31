---
sidebar_position: 3
title: Quick Start
description: Create your first JetStart project in 5 minutes
---

# Quick Start

Get your first JetStart project up and running in just 5 minutes! This guide will walk you through creating a new project, starting the development server, and making your first hot reload change.

## Step 1: Create a New Project

Create a new JetStart project with a single command:

```bash
npx jetstart create my-awesome-app --package com.example.myapp
```

:::tip Package Name
The package name should follow Android package naming conventions (e.g., `com.yourcompany.appname`). This will be used as your app's unique identifier.
:::

### What Gets Created?

JetStart generates a complete Android project structure:

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





## Step 2: Navigate to Your Project

```bash
cd my-awesome-app
```

## Step 3: Start the Development Server

Launch the JetStart development server:

```bash
npx jetstart dev
```

You'll see output like this:

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


:::info What Just Happened?
JetStart started two servers:
- **HTTP Server** (port 8765) - Serves APK files for download
- **WebSocket Server** (port 8766) - Handles real-time hot reload updates
:::

## Step 4: Connect Your Device

You have three ways to connect your Android device:

### Option A: QR Code (Recommended)

**First, install the JetStart Client app on your Android device:**

1. **Download the JetStart Client APK:**
   
   <a href="/downloads/jetstart-client.apk" download className="">
     📥 Download JetStart Client APK
   </a>

   Alternatively, visit [GitHub Releases](https://github.com/dev-phantom/jetstart/releases) to download the latest APK (e.g., `jetstart-client-v1.2.0.apk`).

2. **Disable Play Protect** (required for now):
   :::warning Important
   Since the JetStart Client app is not yet on the Play Store, you'll need to disable Play Protect temporarily.
   :::
   - Settings → Security → Google Play Protect
   - Tap Settings (gear icon) → Toggle off "Scan apps with Play Protect"
   - See [Client Documentation](../packages/client.md#disabling-play-protect) for detailed steps

3. **Install the APK:**
   - Tap the downloaded APK file
   - Tap "Install" when prompted
   - Grant permissions (Camera, Install packages)

4. **Connect to dev server:**
   - Open the JetStart Client app on your device
   - Tap "Create Connection"
   - Point camera at the QR code displayed in your terminal
   - Connection established automatically!

5. **Your app installs automatically:**
   - Once connected, JetStart Client triggers the initial build
   - The APK downloads and installs automatically
   - Your app launches and is ready for hot reload!

### Option B: Manual Connection

If QR scanning doesn't work:

1. **Install JetStart Client app** (see Option A, steps 1-3)

2. **Open JetStart Client app** on your device

3. **Tap "Create Connection"** then click  enter details manually

4. **Enter connection details** from your terminal:
   - Host: `192.168.43.220` (your computer's IP)
   - Session ID: `YZj0l1Ms`
   - Token: `fMLoUwp6w3Cm`

5. **Tap "Connect"**

### Option C: Android Emulator

If you don't have a physical device, you can use an Android Virtual Device (AVD):

1. **Create and Start your emulator**:
   ```bash
   npx jetstart android-emulator
   ```
   - Follow the prompts to **"Create JetStart-optimized emulator"** (if you haven't yet).
   - Then select **"Start emulator"** from the main menu to launch it.

2. **Run the development session** with automated deployment:
   ```bash
   npx jetstart dev --emulator
   ```

JetStart will detect your running emulator, automatically build and install the JetStart Client APK, and launch the app with a hot-reload connection established.

### Option D: Web Emulator (No Device Required: experimental)
 
 Don't have an Android device? Use the web emulator:
 
 1. Open a new terminal window
 2. Run explicit web emulator command:
    ```bash
    npx jetstart dev --web
    ```
 3. JetStart automatically opens your browser to `http://localhost:8765`
 4. This will redirect you to the JetStart Web Emulator with your session
 
 Alternatively, if `jetstart dev` is already running:
 1. Manually open `http://localhost:8765` in your browser
 2. It will redirect and connect automatically



:::tip Network Connection
Make sure your computer and Android device are on the same Wi-Fi network!
:::

:::info Platform Support
The JetStart Client app is available as an **Android APK** only. It supports Android 7.0+ (API 24+). iOS support is not available.
:::

## Step 5: Make Your First Hot Reload Change

Now for the exciting part - let's see hot reload in action!

1. Open `app/src/main/java/com/example/myapp/ui/NotesScreen.kt` in your editor

2. Find the header `Text` component and change its content:

```kotlin title="NotesScreen.kt"
// ... inside Column
Text(
    // highlight-next-line
    text = "Hello, JetStart! 🚀", // Change this text from "✅ DESUGARING ! 🚀 HOT  "
    style = MaterialTheme.typography.displaySmall,
    modifier = Modifier.padding(start = 16.dp, top = 16.dp, bottom = 20.dp)
)
```

3. Save the file

4. **Watch your device update in instantly!** ⚡


The text on your connected device or web emulator will change instantly - no rebuild, no reinstall!

## Understanding Hot Reload

JetStart uses a two-tier hot reload system:

### Tier 1: DEX Hot Reload (Fast - instantly)

Any `.kt` file change that compiles in isolation triggers DEX hot reload:
- ✅ `@Composable` function body changes
- ✅ Text, color, layout, modifier changes
- ✅ Logic changes inside Kotlin classes
- ✅ Any class `kotlinc` can compile independently

JetStart compiles the file, generates DEX with `d8`, and pushes it to your device via WebSocket. **No reinstall required**.

### Tier 2: Full Gradle Build (Slower - 30-60s)

Some changes cannot be hot-reloaded and require a full Gradle rebuild:
- ⏳ New library dependencies in `build.gradle`
- ⏳ Resource file changes (`.xml`, drawables, strings)
- ⏳ `AndroidManifest.xml` changes
- ⏳ Any `.kt` file that fails independent compilation

These produce a new APK that the client downloads and installs automatically.

## Viewing Logs

While developing, you might want to see app logs. Open a new terminal and run:

```bash
npx jetstart logs --follow
```

This shows real-time logs from your connected devices:

```bash
[INFO] [CLIENT] Connection established
[INFO] [CORE] Client connected: device-abc123
[INFO] [BUILD] Hot reload: kotlinc + d8 completed in 84ms
[INFO] [CLIENT] UI updated in 87ms
```

### Filter Logs

```bash
# Show only errors
jetstart logs --level error

# Show only build logs
jetstart logs --source BUILD

# Show last 50 lines
jetstart logs --lines 50
```

## Building for Production

When you're ready to build a production APK:

```bash
npx jetstart build --release
```

The APK will be in `/build/`.

## Common Commands

Here are the most common commands you'll use:

```bash
# Create new project
jetstart create <name> --package <com.example.app>

# Start development server
jetstart dev

# Build APK
jetstart build

# View logs
jetstart logs --follow

# Check dependencies
jetstart install-audit

# Manage emulators
jetstart android-emulator
```

## Next Steps

Congratulations! You've created your first JetStart project and experienced hot reload. Here's what to explore next:

1. **Learn the Architecture** - [How hot reload works](../architecture/hot-reload-system.md)
2. **Explore CLI Commands** - [Full command reference](../cli/overview.md)
3. **Read Guides** - [Best practices and tips](../guides/creating-first-app.md)
4. **Troubleshooting** - [Solutions to common issues](../troubleshooting/common-issues.md)

## Having Issues?

If something isn't working:

1. Check [Troubleshooting Guide](../troubleshooting/common-issues.md)
2. Verify [System Requirements](./system-requirements.md)
3. Run `jetstart install-audit` to check dependencies
4. Ask for help on [GitHub Discussions](https://github.com/dev-phantom/jetstart/discussions)

Happy coding with JetStart! 🚀
