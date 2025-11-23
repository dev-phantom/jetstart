# JetStart Client (Android)

Android client app for JetStart wireless development.

## Overview

The JetStart Client is a Jetpack Compose Android app that:

- 📷 **Scans QR codes** from dev server
- 🔌 **Connects wirelessly** via WebSocket
- 📦 **Downloads & installs** APKs automatically
- 🔥 **Supports hot reload** for live updates
- 📊 **Streams logs** in real-time
- 📱 **Displays build status** and connection info

## Features

### Screens

1. **Home Screen** - Welcome screen with QR scanner and logs access
2. **Scanner Screen** - QR code scanner for pairing with dev server
3. **Connection Screen** - Shows connection and build status
4. **Logs Screen** - Real-time log viewer with filtering

### Components

- **StatusCard** - Animated status display
- **LogItem** - Formatted log entry display
- **QRScanner** - Camera-based QR scanner

### Network Layer

- **WebSocketClient** - Real-time communication with Core
- **HttpClient** - APK downloads and REST API calls
- **MessageHandler** - Processes WebSocket messages

## Building

### Requirements

- Android SDK 24+ (Android 7.0)
- JDK 17
- Gradle 8.2+

### Build Commands
```bash
# Debug build
./gradlew assembleDebug

# Release build
./gradlew assembleRelease

# Install on device
./gradlew installDebug

# Run tests
./gradlew test
```

## Architecture

### Tech Stack

- **Kotlin** - Primary language
- **Jetpack Compose** - Modern UI toolkit
- **Material 3** - Design system
- **Coroutines** - Async operations
- **OkHttp** - HTTP client
- **Gson** - JSON serialization
- **ML Kit** - QR code scanning
- **CameraX** - Camera access

### Package Structure
```
com.jetstart.client/
├── MainActivity.kt
├── ui/
│   ├── screens/
│   ├── components/
│   └── theme/
├── network/
│   ├── WebSocketClient.kt
│   ├── HttpClient.kt
│   └── MessageHandler.kt
├── data/
│   ├── models/
│   └── repository/
└── utils/
    ├── ApkInstaller.kt
    ├── DeviceInfo.kt
    └── Logger.kt
```

## Permissions

The app requires:

- **INTERNET** - Network communication
- **ACCESS_NETWORK_STATE** - Network status
- **CAMERA** - QR code scanning
- **REQUEST_INSTALL_PACKAGES** - APK installation

## Development

### Running Locally

1. Open project in Android Studio
2. Sync Gradle
3. Run on emulator or physical device

### Testing
```bash
# Unit tests
./gradlew test

# Instrumented tests
./gradlew connectedAndroidTest
```

## WebSocket Protocol

The client implements the JetStart WebSocket protocol:

**Sent by Client:**
- `client:connect` - Initial connection
- `client:status` - Status updates
- `client:log` - Log messages
- `client:heartbeat` - Keep-alive

**Received from Core:**
- `core:connected` - Connection confirmed
- `core:build-start` - Build started
- `core:build-complete` - APK ready
- `core:build-error` - Build failed
- `core:reload` - Trigger reload

## APK Installation

The app supports two installation modes:

1. **Manual** - Uses Android's native installer (requires user confirmation)
2. **Silent** - Uses ADB over TCP (requires developer mode)

## License

Apache-2.0