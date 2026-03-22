# JetStart Client (Android)

Android companion app for JetStart — pairs with `jetstart dev` to receive hot reload patches, download APKs, and stream device logs back to the development machine.

## Overview

The JetStart Client is a Jetpack Compose app that acts as the bridge between the `@jetstart/core` server running on your development machine and the Android runtime. Once paired via QR code, it receives DEX patches over WebSocket and loads them live without reinstalling the app.

---

## How It Works

1. **Scan** — the app scans the QR code printed by `jetstart dev`, which encodes `host|port|wsPort|sessionId|token|projectName`
2. **Connect** — it opens a WebSocket to `ws://<host>:<wsPort>` and sends `client:connect` with the session credentials
3. **Receive** — on `core:build-complete` it downloads the APK; on `core:dex-reload` it loads the DEX patch immediately via a custom ClassLoader
4. **Stream** — all Logcat output is forwarded to the server as `client:log` messages, visible via `jetstart logs`

---

## Screens

| Screen | Description |
|---|---|
| **Home** | Welcome screen with quick-connect button and recent session history |
| **Scanner** | CameraX-based QR code scanner for device pairing |
| **Connection** | Live connection status, build progress, and APK download/install controls |
| **Logs** | Real-time log viewer with level and source filtering |

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Kotlin | Primary language |
| Jetpack Compose | UI framework |
| Material 3 | Design system |
| Kotlin Coroutines | Async operations and Flow-based state |
| OkHttp | WebSocket client and APK HTTP downloads |
| Gson | JSON serialization for WebSocket messages |
| ML Kit (Barcode) | QR code scanning |
| CameraX | Camera access for the scanner screen |

---

## Building

### Requirements

- JDK 17
- Android SDK — minSdk 24 (Android 7.0), targetSdk 34 (Android 14)
- Gradle 8.2+

### Commands

```bash
# Debug build
./gradlew assembleDebug

# Release build
./gradlew assembleRelease

# Install on connected device
./gradlew installDebug

# Unit tests
./gradlew test

# Instrumented tests (requires connected device or emulator)
./gradlew connectedAndroidTest
```

---

## Package Structure

```
com.jetstart.client/
├── MainActivity.kt          # Entry point, Compose NavHost
├── ui/
│   ├── screens/
│   │   ├── HomeScreen.kt
│   │   ├── ScannerScreen.kt
│   │   ├── ConnectionScreen.kt
│   │   └── LogsScreen.kt
│   ├── components/
│   │   ├── StatusCard.kt    # Animated connection / build status display
│   │   ├── LogItem.kt       # Formatted log entry row
│   │   └── QRScanner.kt     # CameraX + ML Kit scanner composable
│   └── theme/
├── network/
│   ├── WebSocketClient.kt   # OkHttp WS — send/receive JetStart protocol messages
│   ├── HttpClient.kt        # APK download with progress
│   └── MessageHandler.kt    # Routes incoming core:* messages to the right handler
├── data/
│   ├── models/              # Kotlin data classes mirroring shared WS message types
│   └── repository/
└── utils/
    ├── ApkInstaller.kt      # Triggers Android package installer intent
    ├── DeviceInfo.kt        # Collects model, API level, architecture
    └── Logger.kt            # Logcat wrapper that also forwards via client:log
```

---

## WebSocket Protocol

The client implements the JetStart WebSocket protocol defined in `@jetstart/shared`.

**Sent by client:**

| Message | When |
|---|---|
| `client:connect` | Immediately after WebSocket opens — carries `sessionId`, `token`, `deviceInfo` |
| `client:status` | When connection or build state changes |
| `client:log` | Continuously — every Logcat entry is forwarded |
| `client:heartbeat` | Every 30 seconds to keep the connection alive |
| `client:disconnect` | When the user navigates away or the app is backgrounded |

**Received from core:**

| Message | Action |
|---|---|
| `core:connected` | Show project name; trigger initial build if needed |
| `core:build-start` | Show build progress indicator |
| `core:build-complete` | Offer APK download and install |
| `core:build-error` | Show error notification |
| `core:dex-reload` | Load DEX patch via custom ClassLoader immediately |
| `core:disconnect` | Show reconnect prompt |

---

## APK Installation

When `core:build-complete` arrives, the app downloads the APK via the `/download/:filename` HTTP endpoint and triggers Android's native package installer (requires user confirmation via the system dialog).

Silent installation via ADB over TCP is handled on the **server side** by `@jetstart/core`'s `AdbHelper` when `jetstart dev --emulator` is used — the client app itself does not perform silent installs.

---

## Permissions

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />
```

---

## License

MIT

