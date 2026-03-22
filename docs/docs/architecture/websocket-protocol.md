---
title: WebSocket Protocol
description: Complete specification of the JetStart real-time communication protocol
---

# WebSocket Protocol

JetStart uses WebSockets for all real-time communication between the Core server, Android clients, and the web emulator. Every connection is session-scoped and token-authenticated.

## Connection Details

| Property | Value |
|---|---|
| Default port | `8766` |
| Path | `/` |
| Subprotocols | None |
| Close code `4001` | Session mismatch — rescan QR code |
| Close code `4002` | Token mismatch — rescan QR code |

## Authentication

Immediately after the WebSocket connection is established, the client must send `client:connect` with the correct `sessionId` and `token` (both encoded in the QR code). If either value does not match the active session, the server closes the connection immediately with the appropriate close code. Any further messages from an unauthenticated client are ignored.

## Base Message Shape

All messages share this base structure:

```typescript
interface BaseMessage {
  type: string;       // Identifies the message
  timestamp: number;  // Unix ms
  sessionId?: string; // Required on most messages after authentication
}
```

---

## Client → Core Messages

Sent by the Android app or web emulator to the Core server.

### `client:connect`

Opens a session. Must be the first message sent.

```json
{
  "type": "client:connect",
  "timestamp": 1711900000000,
  "sessionId": "a1b2c3",
  "token": "xyz789",
  "deviceInfo": {
    "id": "device-abc",
    "model": "Pixel 7",
    "platform": "android",
    "architecture": "arm64",
    "androidVersion": "14",
    "apiLevel": 34
  }
}
```

On success, the server responds with `core:connected` and triggers the initial build.

### `client:status`

Reports the client's current state.

```json
{
  "type": "client:status",
  "timestamp": 1711900000000,
  "sessionId": "a1b2c3",
  "status": "connected",
  "message": "Waiting for changes"
}
```

### `client:log`

Forwards a device log entry to the Core server, which relays it to the Logs server and broadcasts it as `core:log` to dashboard clients.

```json
{
  "type": "client:log",
  "timestamp": 1711900000000,
  "sessionId": "a1b2c3",
  "log": {
    "id": "log-001",
    "timestamp": 1711900000000,
    "level": "info",
    "tag": "JetStart",
    "message": "Activity resumed",
    "source": "client"
  }
}
```

### `client:heartbeat`

Keep-alive ping sent every 30 seconds.

```json
{
  "type": "client:heartbeat",
  "timestamp": 1711900000000
}
```

No response is expected.

### `client:disconnect`

Sent before the client closes the connection gracefully.

```json
{
  "type": "client:disconnect",
  "timestamp": 1711900000000,
  "reason": "User backgrounded app"
}
```

### `client:click`

UI interaction event from the web emulator (Android clients do not send this).

```json
{
  "type": "client:click",
  "timestamp": 1711900000000,
  "sessionId": "a1b2c3",
  "action": "onClick",
  "elementType": "Button",
  "elementText": "Submit"
}
```

---

## Core → Client Messages

Sent by the Core server to all authenticated clients in a session.

### `core:connected`

Authentication accepted. Sent immediately after a valid `client:connect`.

```json
{
  "type": "core:connected",
  "timestamp": 1711900000000,
  "sessionId": "a1b2c3",
  "projectName": "my-awesome-app"
}
```

After receiving this, the client can expect a `core:build-start` as the initial build is triggered.

### `core:build-start`

A Gradle build has started.

```json
{
  "type": "core:build-start",
  "timestamp": 1711900000000,
  "sessionId": "a1b2c3"
}
```

### `core:build-status`

Mid-build progress update.

```json
{
  "type": "core:build-status",
  "timestamp": 1711900000000,
  "sessionId": "a1b2c3",
  "status": "compiling_kotlin"
}
```

### `core:build-complete`

Build succeeded. The APK is available for download.

```json
{
  "type": "core:build-complete",
  "timestamp": 1711900000000,
  "sessionId": "a1b2c3",
  "apkInfo": {
    "path": "/path/to/app-debug.apk",
    "size": 5242880,
    "hash": "abc123",
    "versionCode": 1,
    "versionName": "1.0.0",
    "minSdkVersion": 24,
    "targetSdkVersion": 34,
    "applicationId": "com.example.app"
  },
  "downloadUrl": "http://192.168.1.100:8765/download/app-debug.apk"
}
```

### `core:build-error`

Build failed.

```json
{
  "type": "core:build-error",
  "timestamp": 1711900000000,
  "sessionId": "a1b2c3",
  "error": "Compilation failed",
  "details": "Unresolved reference: MyClass at MainActivity.kt:42"
}
```

### `core:dex-reload`

**The primary hot reload message for Android devices.** Carries base64-encoded DEX bytecode compiled from the changed Kotlin file. Android clients decode this and load the new classes via a custom ClassLoader — no reinstall required.

```json
{
  "type": "core:dex-reload",
  "timestamp": 1711900000000,
  "sessionId": "a1b2c3",
  "dexBase64": "ZGV4CjAzNQA...",
  "classNames": [
    "com.example.app.MainActivity",
    "com.example.app.MainActivity$Override"
  ]
}
```

`classNames` lists every class patched in this reload. The `$Override` suffix denotes InstantRun-style companion classes that apply method-level patches.

### `core:js-update`

**Hot reload message for the web emulator.** Carries a base64-encoded ES module compiled by `kotlinc-js` from the same changed file. Browser clients import it dynamically and re-render the Compose UI preview. Android clients ignore this message.

```json
{
  "type": "core:js-update",
  "timestamp": 1711900000000,
  "sessionId": "a1b2c3",
  "jsBase64": "aW1wb3J0IHt...",
  "sourceFile": "MainActivity.kt",
  "byteSize": 4096
}
```

### `core:reload`

Instructs clients to perform a reload of a specific type. Used for explicit reload triggers.

```json
{
  "type": "core:reload",
  "timestamp": 1711900000000,
  "sessionId": "a1b2c3",
  "reloadType": "hot"
}
```

`reloadType` is either `"hot"` or `"full"`.

### `core:ui-update`

Sends a DSL (JSON) representation of the Compose UI tree. Used by the web emulator's `DSLRenderer` for static visual preview when a compiled JS module is not yet available.

```json
{
  "type": "core:ui-update",
  "timestamp": 1711900000000,
  "sessionId": "a1b2c3",
  "dslContent": "{\"type\":\"Column\",\"children\":[...]}",
  "screens": ["MainActivity"],
  "hash": "abc-123"
}
```

### `core:log`

Broadcasts a device log entry to all dashboard/CLI clients subscribed to the session. Not sent to the originating Android client.

```json
{
  "type": "core:log",
  "timestamp": 1711900000000,
  "sessionId": "a1b2c3",
  "log": {
    "id": "log-001",
    "timestamp": 1711900000000,
    "level": "info",
    "tag": "JetStart",
    "message": "DEX loaded — 2 classes patched",
    "source": "client"
  }
}
```

### `core:disconnect`

Server is shutting down.

```json
{
  "type": "core:disconnect",
  "timestamp": 1711900000000,
  "reason": "Server stopped"
}
```

---

## Message Flow Examples

### Initial Connection and First Build

```
Client                          Core Server
  │                                  │
  │──── WebSocket open ─────────────►│
  │                                  │
  │──── client:connect ─────────────►│  (sessionId + token)
  │                                  │  Validates credentials
  │Γùä─── core:connected ──────────────│  (projectName)
  │                                  │
  │Γùä─── core:build-start ────────────│  Initial build begins
  │Γùä─── core:build-status ───────────│  Progress updates
  │Γùä─── core:build-complete ─────────│  APK download URL
  │                                  │
  │  Client downloads + installs APK │
```

### Hot Reload (File Save → Device Update)

```
Developer saves .kt file
  │
  │  Core Server
  │  ├─ KotlinCompiler → .class files
  │  ├─ OverrideGenerator → $Override classes
  │  └─ DexGenerator → classes.dex

Core Server                     Android Client   Web Emulator
  │                                   │               │
  │──── core:dex-reload ─────────────►│               │
  │     (base64 DEX, classNames)       │               │
  │                                   │ ClassLoader    │
  │                                   │ loads DEX      │
  │                                   │ Recompose      │
  │                                   │               │
  │──── core:js-update ───────────────────────────────►│
  │     (base64 ES module)            │               │
  │                                   │         dynamic import()
  │                                   │         Re-renders UI
```

---

## Error Handling

If the server rejects a connection, it closes the WebSocket with a code and reason:

| Close Code | Reason | Action |
|---|---|---|
| `4001` | Session mismatch | Rescan QR code — device was built against a different session |
| `4002` | Token mismatch | Rescan QR code — session token does not match |
| `1001` | Server shutdown | Reconnect when server restarts |

Clients should implement automatic reconnect with exponential backoff (max 5 attempts, starting at 5 seconds).

---

## Logs Server (Port 8767)

A separate WebSocket server on port **8767** handles log aggregation independently of the main protocol. See the [`@jetstart/logs`](../packages/logs.md) package documentation for its own message protocol (`subscribe`, `log`, `clear`, `stats`).

