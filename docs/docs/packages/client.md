---
title: Client
description: JetStart mobile client app for Android devices
---

# Client

The JetStart Client is the Android mobile application that connects to your development server wirelessly. It enables instant hot reload, QR code pairing, and automatic APK installation on your Android device.

## Overview

The JetStart Client is a Jetpack Compose Android app that serves as the bridge between your development environment and your Android device. It provides:

- 📷 **QR Code Scanning** - Instantly pair with your dev server by scanning a QR code
- 🔌 **WebSocket Connection** - Real-time communication for hot reload updates
- 📦 **Automatic APK Installation** - Downloads and installs your app builds automatically
- 🔥 **Hot Reload Support** - Receives `core:dex-reload` DEX patches and loads them via a custom ClassLoader in under 100ms
- 📊 **Real-time Logs** - View application logs and build status
- 📱 **Connection Management** - Monitor connection status and project information

## Platform Support

**Supported Platforms:**
- ✅ **Android APK** - The only supported format
- ✅ **Android 7.0+** (API 24+) - Minimum Android version
- ✅ **Android 14** (API 34) - Target Android version

**Not Supported:**
- ❌ iOS - Not available
- ❌ Android App Bundle (AAB) - Only APK format is distributed
- ❌ Android versions below 7.0

## Download and Installation

### Option 1: Direct Download from Docs (Recommended)

Download the latest JetStart Client APK directly:

<a href="/downloads/jetstart-client.apk" download className="w-10 h-auto">
  📥 Download JetStart Client APK
</a>

**Quick Steps:**
1. Click the download button above on your Android device
2. Once downloaded, tap the APK file to install
3. Follow the installation steps below

### Option 2: Download from GitHub Releases

The JetStart Client app is also available from GitHub Releases:

**Latest Release:**
- Visit: [https://github.com/dev-phantom/jetstart/releases](https://github.com/dev-phantom/jetstart/releases)
- Look for the latest release (e.g., v1.2.0)
- Download the APK file (e.g., `jetstart-client-v1.2.0.apk`)

**Direct Link Format:**
```
https://github.com/dev-phantom/jetstart/releases/tag/v1.2.0
```

### Installation Steps

1. **Download the APK** from GitHub Releases to your Android device
2. **Enable Unknown Sources** (if not already enabled)
3. **Disable Play Protect** (required - see below)
4. **Install the APK** by tapping the downloaded file
5. **Grant Permissions** when prompted (Camera, Install packages)

### Disabling Play Protect

:::warning Important
Since the JetStart Client app is not yet available on the Google Play Store, Android's Play Protect may block the installation. You'll need to temporarily disable Play Protect to install the app.
:::

**Why Disable Play Protect?**
- The app is distributed directly via GitHub Releases
- Play Protect blocks apps from unknown sources by default
- This is a temporary measure until the app is published to the Play Store

**How to Disable Play Protect:**

**Method 1: During Installation (Recommended)**
1. When you tap the APK file to install, you may see a warning
2. Tap **"More details"** or **"Install anyway"**
3. If prompted, tap **"Settings"** → Toggle off **"Scan apps with Play Protect"**
4. Return to the installer and complete installation

**Method 2: From Settings (Pre-installation)**
1. Open **Settings** on your Android device
2. Navigate to **Security** or **Google** → **Security**
3. Find **Play Protect** or **Google Play Protect**
4. Tap **Settings** (gear icon)
5. Toggle off **"Scan apps with Play Protect"**
6. Confirm the change
7. Now install the APK file

**Method 3: Per-App Exception (Android 8.0+)**
1. When installing the APK, if blocked, tap **"Settings"**
2. Find **"Install unknown apps"** or **"Allow from this source"**
3. Enable **"Allow from this source"** for your browser or file manager
4. Return and complete installation

**Re-enabling Play Protect:**
After installation, you can re-enable Play Protect:
1. Settings → Security → Play Protect
2. Toggle **"Scan apps with Play Protect"** back on

:::tip Security Note
Play Protect helps keep your device safe. Only disable it temporarily to install trusted apps like JetStart Client. Re-enable it after installation for continued protection.
:::

## Features

### Screens

The app includes four main screens:

1. **Home Screen**
   - Welcome interface
   - Quick access to QR scanner
   - View logs button
   - Connection instructions

2. **Scanner Screen**
   - Camera-based QR code scanner
   - Automatic QR code detection
   - Connection pairing interface

3. **Connection Screen**
   - Real-time connection status
   - Build progress and status
   - Project information display
   - Disconnect option

4. **Logs Screen**
   - Real-time log streaming
   - Filter by log level
   - Clear logs functionality
   - Scrollable log history

### Network Capabilities

- **WebSocket Client** - Maintains persistent connection to dev server
- **HTTP Client** - Downloads APK files and makes REST API calls
- **Message Handler** - Processes WebSocket messages for hot reload

### Permissions

The app requires the following permissions:

| Permission | Purpose |
|------------|---------|
| `INTERNET` | Network communication with dev server |
| `ACCESS_NETWORK_STATE` | Check network connectivity |
| `CAMERA` | QR code scanning functionality |
| `REQUEST_INSTALL_PACKAGES` | Install downloaded APK files |
| `WRITE_EXTERNAL_STORAGE` | Store downloaded APKs (Android 9 and below) |

All permissions are requested at runtime when needed.

## Usage

### Connecting to Dev Server

**Step 1: Start Dev Server**
```bash
cd my-app
jetstart dev
```

**Step 2: Scan QR Code**
1. Open JetStart Client app on your device
2. Tap **"Create Connection"**
3. Point camera at the QR code in your terminal
4. Wait for automatic connection

**Step 3: Automatic Setup**
- Connection established automatically
- Initial APK build triggered
- App installs on your device
- Ready for hot reload!

### Manual Connection

If QR scanning doesn't work:

1. Open JetStart Client app
2. Tap **"Manual Connection"** (if available)
3. Enter connection details from terminal:
   - **Host:** `192.168.1.100` (your computer's IP)
   - **Port:** `8765` (HTTP port)
   - **Session ID:** `a1b2c3` (from terminal)
   - **Token:** `xyz789` (from terminal)
4. Tap **"Connect"**

### Viewing Logs

1. Open JetStart Client app
2. Tap **"View Logs"** from home screen
3. See real-time logs from your app
4. Filter by level (INFO, DEBUG, WARN, ERROR)

## Architecture

### Tech Stack

- **Kotlin** - Primary programming language
- **Jetpack Compose** - Modern declarative UI toolkit
- **Material 3** - Google's latest design system
- **Coroutines** - Asynchronous operations
- **OkHttp** - HTTP client for network requests
- **Gson** - JSON serialization
- **ML Kit** - Google's machine learning for QR scanning
- **CameraX** - Modern camera API for QR scanning

### Package Structure

```
com.jetstart.client/
├── MainActivity.kt              # App entry point
├── ui/
│   ├── screens/
│   │   ├── HomeScreen.kt
│   │   ├── ScannerScreen.kt
│   │   ├── ConnectionScreen.kt
│   │   └── LogsScreen.kt
│   ├── components/
│   │   ├── StatusCard.kt
│   │   ├── LogItem.kt
│   │   └── QRScanner.kt
│   └── theme/
│       └── Theme.kt
├── network/
│   ├── WebSocketClient.kt      # WebSocket connection
│   ├── HttpClient.kt            # HTTP requests
│   └── MessageHandler.kt       # Message processing
├── data/
│   ├── models/                  # Data models
│   └── repository/               # Data repositories
└── utils/
    ├── ApkInstaller.kt          # APK installation logic
    ├── DeviceInfo.kt            # Device information
    └── Logger.kt                # Logging utilities
```

## WebSocket Protocol

The client implements the JetStart WebSocket protocol for real-time communication:

**Messages Sent by Client:**
- `client:connect` - Initial connection request
- `client:status` - Status updates
- `client:log` - Log messages
- `client:heartbeat` - Keep-alive ping

**Messages Received from Server:**
- `core:connected` - Connection confirmed; initial build triggered
- `core:build-start` - Gradle build started
- `core:build-complete` - APK ready for download (includes `downloadUrl` and `apkInfo`)
- `core:build-error` - Build failed with error details
- `core:dex-reload` - **Hot reload payload**: base64-encoded DEX bytecode + patched class names; loaded via custom ClassLoader immediately
- `core:js-update` - Web emulator ES module update (Android client ignores this)
- `core:reload` - Explicit reload trigger
- `core:log` - Broadcast of a device log entry back to dashboard clients

See [WebSocket Protocol](../architecture/websocket-protocol.md) for detailed protocol documentation.

## APK Installation

The client supports automatic APK installation:

1. **Download** - APK downloaded from dev server
2. **Permission Request** - Android prompts for install permission
3. **Installation** - Native Android installer handles installation
4. **Launch** - App launches automatically after installation

**Installation Modes:**
- **Manual** - Uses Android's native installer (requires user confirmation)
- **Automatic** - Seamless installation when permission granted

## Troubleshooting

### Installation Issues

**Problem: "App not installed" or "Install blocked"**

**Solutions:**
1. Ensure Play Protect is disabled (see above)
2. Enable "Install from unknown sources" in Settings
3. Check if device has enough storage space
4. Try downloading the APK again

**Problem: "Play Protect warning"**

**Solution:**
- Follow the Play Protect disabling steps above
- The app is safe - it's open source and distributed via GitHub

### Connection Issues

**Problem: "Cannot connect to server"**

**Solutions:**
1. Ensure phone and computer are on same WiFi network
2. Check firewall settings (ports 8765, 8766, 8767)
3. Verify dev server is running (`jetstart dev`)
4. Check IP address hasn't changed
5. Try manual connection instead of QR code

**Problem: "QR code not scanning"**

**Solutions:**
1. Ensure good lighting
2. Hold phone 6-12 inches from screen
3. Clean camera lens
4. Try manual connection method
5. Check camera permissions are granted

### Permission Issues

**Problem: "Camera permission denied"**

**Solution:**
1. Settings → Apps → JetStart Client
2. Permissions → Camera → Allow
3. Restart the app

**Problem: "Install permission denied"**

**Solution:**
1. Settings → Apps → JetStart Client
2. Permissions → Install unknown apps → Allow
3. Or: Settings → Security → Install unknown apps → Enable

## Building from Source

If you want to build the client app from source:

### Requirements

- Android SDK 24+ (Android 7.0)
- JDK 17
- Gradle 8.2+
- Android Studio (recommended)

### Build Commands

```bash
cd packages/client

# Debug build
./gradlew assembleDebug

# Release build
./gradlew assembleRelease

# Install on connected device
./gradlew installDebug

# Run tests
./gradlew test
```

:::tip Important
The JetStart Client is built using standard Kotlin and Jetpack Compose Gradle properties. It is **not** a JetStart-managed project itself. Therefore, you must use standard `./gradlew` commands (or Android Studio) to build it. Running `jetstart build` from the CLI will not work for this specific package.
:::

### Output Location

- Debug APK: `app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `app/build/outputs/apk/release/app-release-unsigned.apk`

## Related Documentation

- [Quick Start Guide](../getting-started/quick-start.md) - Get started with JetStart
- [Using QR Codes](../guides/using-qr-codes.md) - Master QR code pairing
- [Connection Problems](../troubleshooting/connection-problems.md) - Troubleshoot connection issues
- [WebSocket Protocol](../architecture/websocket-protocol.md) - Protocol details
- [Hot Reload System](../architecture/hot-reload-system.md) - How hot reload works

## License

Apache-2.0

