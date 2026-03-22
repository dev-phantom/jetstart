---
title: WebSocket Protocol
description: API reference for the JetStart WebSocket message protocol
---

# WebSocket Protocol API Reference

Full message-level reference for the JetStart WebSocket protocol. For a conceptual overview and connection flow diagrams, see [Architecture: WebSocket Protocol](../architecture/websocket-protocol.md).

## Endpoints

| Server | Default Port | Purpose |
|---|---|---|
| Core WebSocket | `8766` | Hot reload, build events, auth |
| Logs WebSocket | `8767` | Log streaming (separate protocol) |

---

## Client → Core Messages

### `client:connect`

**Must be the first message sent after opening the WebSocket.**

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | `"client:connect"` | ✅ | |
| `timestamp` | `number` | ✅ | Unix ms |
| `sessionId` | `string` | ✅ | Session ID from QR code |
| `token` | `string` | ✅ | Auth token from QR code |
| `deviceInfo.id` | `string` | ✅ | Device identifier |
| `deviceInfo.model` | `string` | ✅ | Device model name |
| `deviceInfo.platform` | `"android" \| "web"` | ✅ | |
| `deviceInfo.architecture` | `"arm64" \| "x86_64" \| "x86"` | ✅ | |
| `deviceInfo.androidVersion` | `string` | — | e.g. `"14"` |
| `deviceInfo.apiLevel` | `number` | — | e.g. `34` |

**Success response:** `core:connected`  
**Failure:** WebSocket closed with code `4001` (session mismatch) or `4002` (token mismatch)

---

### `client:status`

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | `"client:status"` | ✅ | |
| `timestamp` | `number` | ✅ | |
| `status` | `SessionStatus` | ✅ | `connecting \| connected \| idle \| disconnected \| error` |
| `message` | `string` | — | Optional detail |

---

### `client:log`

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | `"client:log"` | ✅ | |
| `timestamp` | `number` | ✅ | |
| `sessionId` | `string` | ✅ | |
| `log.id` | `string` | ✅ | Unique log entry ID |
| `log.timestamp` | `number` | ✅ | |
| `log.level` | `LogLevel` | ✅ | `verbose \| debug \| info \| warn \| error \| fatal` |
| `log.tag` | `string` | ✅ | Logcat tag |
| `log.message` | `string` | ✅ | |
| `log.source` | `LogSource` | ✅ | `cli \| core \| client \| build \| network \| system` |
| `log.metadata` | `object` | — | |

---

### `client:heartbeat`

| Field | Type | Required |
|---|---|---|
| `type` | `"client:heartbeat"` | ✅ |
| `timestamp` | `number` | ✅ |

Sent every 30 seconds. No response expected.

---

### `client:disconnect`

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | `"client:disconnect"` | ✅ | |
| `timestamp` | `number` | ✅ | |
| `reason` | `string` | — | Human-readable disconnect reason |

---

### `client:click`

Web emulator only. Android clients do not send this message.

| Field | Type | Required | Description |
|---|---|---|---|
| `type` | `"client:click"` | ✅ | |
| `timestamp` | `number` | ✅ | |
| `sessionId` | `string` | ✅ | |
| `action` | `string` | ✅ | e.g. `"onClick"` |
| `elementType` | `string` | ✅ | e.g. `"Button"` |
| `elementText` | `string` | — | Visible label of the element |

---

## Core → Client Messages

### `core:connected`

| Field | Type | Description |
|---|---|---|
| `type` | `"core:connected"` | |
| `timestamp` | `number` | |
| `sessionId` | `string` | Echoes back the authenticated session |
| `projectName` | `string` | Human-readable project name |

---

### `core:build-start`

| Field | Type |
|---|---|
| `type` | `"core:build-start"` |
| `timestamp` | `number` |
| `sessionId` | `string` |

---

### `core:build-status`

| Field | Type | Description |
|---|---|---|
| `type` | `"core:build-status"` | |
| `timestamp` | `number` | |
| `sessionId` | `string` | |
| `status` | `BuildStatus` | Progress indicator string |

---

### `core:build-complete`

| Field | Type | Description |
|---|---|---|
| `type` | `"core:build-complete"` | |
| `timestamp` | `number` | |
| `sessionId` | `string` | |
| `apkInfo.path` | `string` | Server-side path to APK |
| `apkInfo.size` | `number` | Bytes |
| `apkInfo.hash` | `string` | |
| `apkInfo.versionCode` | `number` | |
| `apkInfo.versionName` | `string` | |
| `apkInfo.minSdkVersion` | `number` | Minimum `24` |
| `apkInfo.targetSdkVersion` | `number` | |
| `apkInfo.applicationId` | `string` | e.g. `com.example.app` |
| `downloadUrl` | `string` | Full HTTP URL to download the APK |

---

### `core:build-error`

| Field | Type | Description |
|---|---|---|
| `type` | `"core:build-error"` | |
| `timestamp` | `number` | |
| `sessionId` | `string` | |
| `error` | `string` | Short error summary |
| `details` | `any` | — Optional extended detail |

---

### `core:dex-reload`

**Primary hot reload message for Android devices.** Carries DEX bytecode compiled from the changed Kotlin file.

| Field | Type | Description |
|---|---|---|
| `type` | `"core:dex-reload"` | |
| `timestamp` | `number` | |
| `sessionId` | `string` | |
| `dexBase64` | `string` | Base64-encoded `classes.dex` |
| `classNames` | `string[]` | Fully-qualified names of all patched classes |

`classNames` includes both the original class and any `$Override` companion classes generated during the pipeline.

---

### `core:js-update`

**Hot reload message for the web emulator.** Android clients should ignore this message.

| Field | Type | Description |
|---|---|---|
| `type` | `"core:js-update"` | |
| `timestamp` | `number` | |
| `sessionId` | `string` | |
| `jsBase64` | `string` | Base64-encoded ES module (.mjs) |
| `sourceFile` | `string` | Source `.kt` filename that triggered this update |
| `byteSize` | `number` | Decoded size in bytes |

---

### `core:ui-update`

DSL-based UI update for the web emulator fallback renderer.

| Field | Type | Description |
|---|---|---|
| `type` | `"core:ui-update"` | |
| `timestamp` | `number` | |
| `sessionId` | `string` | |
| `dslContent` | `string` | JSON string of the DSL component tree |
| `screens` | `string[]` | — Affected screen names |
| `hash` | `string` | — Content hash for change detection |

---

### `core:reload`

| Field | Type | Description |
|---|---|---|
| `type` | `"core:reload"` | |
| `timestamp` | `number` | |
| `sessionId` | `string` | |
| `reloadType` | `"hot" \| "full"` | |

---

### `core:log`

Broadcast of a device log entry to dashboard/CLI clients.

| Field | Type | Description |
|---|---|---|
| `type` | `"core:log"` | |
| `timestamp` | `number` | |
| `sessionId` | `string` | |
| `log` | `LogEntry` | Same shape as `client:log.log` |

---

### `core:disconnect`

| Field | Type | Description |
|---|---|---|
| `type` | `"core:disconnect"` | |
| `timestamp` | `number` | |
| `reason` | `string` | e.g. `"Server stopped"` |

---

## WebSocket Close Codes

| Code | Reason | Client action |
|---|---|---|
| `4001` | Session mismatch | Rescan QR code |
| `4002` | Token mismatch | Rescan QR code |
| `1001` | Server going away | Retry after server restarts |
| `1000` | Normal closure | No action needed |

