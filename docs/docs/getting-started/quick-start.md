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
│   └── src/
│       └── main/
│           ├── java/com/example/myapp/
│           │   ├── MainActivity.kt    # Main activity
│           │   └── JetStart.kt       # Hot reload engine
│           ├── res/                  # Android resources
│           └── AndroidManifest.xml
├── build.gradle                  # Root build file
├── settings.gradle
├── gradle.properties
├── jetstart.config.json         # JetStart configuration
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
🚀 JetStart Development Server

Session ID: a7f3e9d2-4b1c-4a8e-9f3d-7c2e1b5a9d8f
Token: 3f7a9b2c1d4e5f6g7h8i9j0k1l2m3n4o

📱 Connect your device:
┌─────────────────────────────────┐
│                                 │
│   █▀▀▀▀▀█ ▄▀▄▀█▀ █▀▀▀▀▀█       │
│   █ ███ █ ▄█▀▄█▀ █ ███ █       │
│   █ ▀▀▀ █ ▀ █▄▀▄ █ ▀▀▀ █       │
│   ▀▀▀▀▀▀▀ ▀ ▀ █ ▀ ▀▀▀▀▀▀▀       │
│                                 │
└─────────────────────────────────┘

Or connect manually:
• Server: http://192.168.1.100:8765
• WebSocket: ws://192.168.1.100:8766

✓ HTTP server running on http://192.168.1.100:8765
✓ WebSocket server running on ws://192.168.1.100:8766
✓ Watching for file changes...

Ready to launch! 🎯
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
   - Visit [https://github.com/dev-phantom/jetstart/releases](https://github.com/dev-phantom/jetstart/releases)
   - Download the latest release APK (e.g., `jetstart-client-v1.2.0.apk`)

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
   - Tap "Scan QR Code"
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

3. **Tap "Manual Connection"** (if available) or enter details manually

4. **Enter connection details** from your terminal:
   - Host: `192.168.1.100` (your computer's IP)
   - Port: `8765`
   - Session ID: (from terminal output, e.g., `a1b2c3`)
   - Token: (from terminal output, e.g., `xyz789`)

5. **Tap "Connect"**

### Option C: Web Emulator
 
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

### Option D: Android Emulator

If you have Android Studio installed:

1. Open a new terminal window
2. Run `jetstart android-emulator`
3. Select an available emulator from the list
4. JetStart will launch the emulator and install the app automatically

:::tip Network Connection
Make sure your computer and Android device are on the same Wi-Fi network!
:::

:::info Platform Support
The JetStart Client app is available as an **Android APK** only. It supports Android 7.0+ (API 24+). iOS support is not available.
:::

## Step 5: Make Your First Hot Reload Change

Now for the exciting part - let's see hot reload in action!

1. Open `app/src/main/java/com/example/myapp/MainActivity.kt` in your editor

2. Find the `Text` component and change its content:

```kotlin title="MainActivity.kt"
@Composable
fun AppContent() {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        // highlight-next-line
        Text("Hello, JetStart! 🚀") // Change this text

        Spacer(modifier = Modifier.height(16.dp))

        Button(onClick = {}) {
            Text("Click Me")
        }
    }
}
```

3. Save the file

4. **Watch your device update in under 100ms!** ⚡

The text on your connected device or web emulator will change instantly - no rebuild, no reinstall!

## Understanding Hot Reload

JetStart uses a two-tier hot reload system:

### Tier 1: DSL Hot Reload (Fast - under 100ms)

Changes to UI components trigger DSL hot reload:
- ✅ Text changes
- ✅ Modifier changes (padding, size, etc.)
- ✅ Layout changes (Column, Row, Box)
- ✅ Color changes
- ✅ Typography changes

These update **instantly** via WebSocket.

### Tier 2: Full Rebuild (Slower - 30-60s)

Changes to logic trigger full Gradle build:
- ⏳ Function logic changes
- ⏳ New imports or dependencies
- ⏳ Resource changes
- ⏳ Manifest changes

These require a full rebuild and APK installation.

:::tip Development Workflow
Structure your code to maximize UI changes (fast) and minimize logic changes (slow). Use composable functions extensively!
:::

## Viewing Logs

While developing, you might want to see app logs. Open a new terminal and run:

```bash
npx jetstart logs --follow
```

This shows real-time logs from your connected devices:

```bash
[INFO] [CLIENT] Connection established
[INFO] [CORE] Client connected: device-abc123
[INFO] [BUILD] DSL hot reload triggered
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

The APK will be in `app/build/outputs/apk/release/`.

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
