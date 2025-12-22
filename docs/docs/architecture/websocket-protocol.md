---
title: WebSocket Protocol
description: Detailed specification of the real-time communication protocol
---

# WebSocket Protocol

JetStart uses WebSockets for real-time communication between the Core Release, Android Client, and Web Interface. The protocol ensures instant updates, build status notifications, and device logging.

## Connection Details

- **Default Port:** `8766`
- **Path:** `/`
- **Subprotocols:** None currently used

## Message Structure

All messages follow a base structure:

```typescript
interface BaseMessage {
  type: string;      // Unique message identifier
  timestamp: number; // Unix timestamp
  sessionId?: string; // Session ID (if authenticated)
}
```

## Client Messages (Client -> Core)

Messages sent from the Android Client or Web Interface to the Core Server.

### `client:connect`
Sent immediately after establishing a WebSocket connection to authenticate.

```json
{
  "type": "client:connect",
  "sessionId": "session-123",
  "token": "auth-token-xyz",
  "deviceInfo": {
    "model": "Pixel 6",
    "osVersion": "13",
    "ipAddress": "192.168.1.100"
  }
}
```

### `client:status`
Updates the server with the client's current status (e.g., waiting, building, ready).

```json
{
  "type": "client:status",
  "status": "ready",
  "message": "Waiting for changes"
}
```

### `client:log`
Streams device logs to the server.

```json
{
  "type": "client:log",
  "log": {
    "level": "info",
    "tag": "JetStart",
    "message": "Activity started",
    "timestamp": 1234567890
  }
}
```

### `client:click`
Sent when a user interacts with a UI element (if interactive mode is enabled).

```json
{
  "type": "client:click",
  "action": "onClick",
  "elementType": "Button",
  "elementText": "Submit"
}
```

### `client:heartbeat`
Keep-alive message sent periodically.

```json
{
  "type": "client:heartbeat"
}
```

### `client:disconnect`
Sent before closing the connection gracefully.

```json
{
  "type": "client:disconnect",
  "reason": "User quit app"
}
```

## Core Messages (Core -> Client)

Messages sent from the Core Server to connected clients.

### `core:connected`
Confirmation of successful authentication.

```json
{
  "type": "core:connected",
  "sessionId": "session-123",
  "projectName": "My Awesome App"
}
```

### `core:build-start`
Notifies that a build process has started.

```json
{
  "type": "core:build-start"
}
```

### `core:build-status`
Provides progress updates during a build.

```json
{
  "type": "core:build-status",
  "status": "compiling_kotlin"
}
```

### `core:build-complete`
Sent when a full APK build is finished.

```json
{
  "type": "core:build-complete",
  "apkInfo": {
    "size": 15000000,
    "version": "1.0.1"
  },
  "downloadUrl": "http://192.168.1.5:8765/download/app-debug.apk"
}
```

### `core:build-error`
Sent if the build fails.

```json
{
  "type": "core:build-error",
  "error": "Compilation failed",
  "details": "Unresolved reference: MyClass at line 42"
}
```

### `core:ui-update`
**The Hot Reload Message.** Contains the serialized DSL to update the UI instantly.

```json
{
  "type": "core:ui-update",
  "dslContent": "{ \"type\": \"Column\", \"children\": [...] }",
  "screens": ["MainActivity"],
  "hash": "abc-123-hash"
}
```

### `core:reload`
Instructs the client to perform a specific type of reload.

```json
{
  "type": "core:reload",
  "reloadType": "hot" // or "full"
}
```

## Error Codes

If the connection fails or is rejected, the WebSocket close code/reason may contain:

| Code | Message | Description |
|------|---------|-------------|
| `connection_failed` | Connection Failed | Generic connection error |
| `authentication_failed` | Authentication Failed | Invalid session ID or token |
| `session_expired` | Session Expired | The session is no longer active |
| `timeout` | Timeout | Connection timed out |
| `invalid_message` | Invalid Message | Malformed JSON or unknown type |

