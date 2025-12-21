---
title: Shared
description: Shared types, protocols, and utilities for JetStart
---

# Shared

The Shared package (`@jetstart/shared`) contains common code shared across all JetStart packages, including TypeScript types, protocols, validation functions, and constants.

## Overview

This package provides:

- **Type Definitions** - TypeScript interfaces and types used across packages
- **Protocols** - WebSocket message protocols and event definitions
- **Validation** - Utility functions for validating data
- **Constants** - Shared constants like default ports and version numbers

## Installation

```bash
npm install @jetstart/shared
```

## Usage

```typescript
import {
  Session,
  SessionStatus,
  BuildConfig,
  LogLevel,
  ClientMessage,
  CoreMessage,
  isValidSessionId,
  DEFAULT_CORE_PORT,
  JETSTART_VERSION,
} from '@jetstart/shared';
```

## Package Structure

```
src/
├── types/          # Type definitions
│   ├── session.ts  # Session management types
│   ├── build.ts    # Build system types
│   ├── device.ts   # Device information types
│   └── log.ts      # Logging types
├── protocols/      # Communication protocols
│   ├── websocket.ts # WebSocket messages
│   └── events.ts   # Event system
└── utils/          # Utilities
    ├── validation.ts # Validation functions
    └── constants.ts  # Shared constants
```

## Type Definitions

### Session Management

**`Session`** - Development session state
```typescript
interface Session {
  id: string;
  token: string;
  projectName: string;
  projectPath: string;
  createdAt: number;
  lastActivity: number;
}
```

**`SessionStatus`** - Connection status enum
```typescript
enum SessionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error',
}
```

**`SessionToken`** - Authentication token type
```typescript
type SessionToken = string;
```

**`QRCodeData`** - QR code payload
```typescript
interface QRCodeData {
  sessionId: string;
  serverUrl: string;
  wsUrl: string;
  token: string;
  projectName: string;
  version?: string;
}
```

### Build System

**`BuildConfig`** - Build configuration
```typescript
interface BuildConfig {
  projectPath: string;
  buildType?: 'debug' | 'release';
  clean?: boolean;
}
```

**`BuildResult`** - Build output
```typescript
interface BuildResult {
  success: boolean;
  apkPath?: string;
  error?: string;
  duration: number;
}
```

**`BuildStatus`** - Build progress
```typescript
enum BuildStatus {
  IDLE = 'idle',
  BUILDING = 'building',
  SUCCESS = 'success',
  ERROR = 'error',
}
```

**`APKInfo`** - APK metadata
```typescript
interface APKInfo {
  path: string;
  size: number;
  version: string;
  buildType: 'debug' | 'release';
}
```

### Device Information

**`DeviceInfo`** - Device details
```typescript
interface DeviceInfo {
  id: string;
  name: string;
  platform: Platform;
  architecture: Architecture;
  osVersion: string;
}
```

**`Platform`** - Platform enum
```typescript
enum Platform {
  ANDROID = 'android',
  IOS = 'ios', // Reserved for future
}
```

**`Architecture`** - CPU architecture
```typescript
enum Architecture {
  ARM = 'arm',
  ARM64 = 'arm64',
  X86 = 'x86',
  X86_64 = 'x86_64',
}
```

### Logging

**`LogEntry`** - Log message structure
```typescript
interface LogEntry {
  timestamp: number;
  level: LogLevel;
  source: LogSource;
  message: string;
  data?: any;
}
```

**`LogLevel`** - Log severity levels
```typescript
enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}
```

**`LogSource`** - Log origin
```typescript
enum LogSource {
  CLI = 'CLI',
  CORE = 'CORE',
  CLIENT = 'CLIENT',
  BUILD = 'BUILD',
}
```

## Protocols

### WebSocket Messages

**Client → Core Messages:**
- `client:connect` - Initial connection with session ID and token
- `client:status` - Status update from client
- `client:log` - Log message from client
- `client:heartbeat` - Keep-alive ping

**Core → Client Messages:**
- `core:connected` - Connection confirmed
- `core:build-start` - Build process started
- `core:build-status` - Build progress update
- `core:build-complete` - Build finished (includes APK download URL)
- `core:build-error` - Build failed (includes error message)
- `core:reload` - Trigger UI reload with DSL data

**Message Types:**
```typescript
interface ClientMessage {
  type: 'client:connect' | 'client:status' | 'client:log' | 'client:heartbeat';
  payload: any;
}

interface CoreMessage {
  type: 'core:connected' | 'core:build-start' | 'core:build-status' | 
        'core:build-complete' | 'core:build-error' | 'core:reload';
  payload: any;
}

type WSMessage = ClientMessage | CoreMessage;
```

See [WebSocket Protocol](../api/websocket-protocol.md) for detailed message formats.

## Validation Functions

**`isValidSessionId(sessionId: string): boolean`**
- Validates session ID format (8 alphanumeric characters)

**`isValidProjectName(name: string): boolean`**
- Validates project name format

**`isValidToken(token: string): boolean`**
- Validates authentication token format (12 alphanumeric characters)

**Example:**
```typescript
import { isValidSessionId, isValidProjectName } from '@jetstart/shared';

if (isValidSessionId(sessionId)) {
  // Valid session ID
}

if (isValidProjectName(name)) {
  // Valid project name
}
```

## Constants

**`DEFAULT_CORE_PORT`** - Default HTTP server port (8765)

**`DEFAULT_WS_PORT`** - Default WebSocket server port (8766)

**`JETSTART_VERSION`** - Current JetStart version string

**`SESSION_TOKEN_EXPIRY`** - Session token expiry time in milliseconds (3600000 = 1 hour)

**Example:**
```typescript
import { DEFAULT_CORE_PORT, JETSTART_VERSION } from '@jetstart/shared';

console.log(`JetStart v${JETSTART_VERSION}`);
console.log(`Core server on port ${DEFAULT_CORE_PORT}`);
```

## Event Types

The shared package defines event types used for EventEmitter patterns:

```typescript
interface BuildEvents {
  'build:start': [];
  'build:complete': [BuildResult];
  'build:error': [Error];
}

interface ClientEvents {
  'client:connected': [string]; // sessionId
  'client:disconnected': [string]; // sessionId
}
```

## Usage Examples

### Type Safety

```typescript
import { Session, LogLevel, LogSource } from '@jetstart/shared';

function handleSession(session: Session) {
  console.log(`Session ${session.id} for project ${session.projectName}`);
}

function logMessage(level: LogLevel, source: LogSource, message: string) {
  // Type-safe logging
}
```

### Protocol Messages

```typescript
import { CoreMessage } from '@jetstart/shared';

function sendBuildComplete(apkUrl: string) {
  const message: CoreMessage = {
    type: 'core:build-complete',
    payload: {
      apkUrl,
      timestamp: Date.now(),
    },
  };
  ws.send(JSON.stringify(message));
}
```

### Validation

```typescript
import { isValidSessionId, isValidToken } from '@jetstart/shared';

function authenticate(sessionId: string, token: string): boolean {
  if (!isValidSessionId(sessionId)) {
    return false;
  }
  if (!isValidToken(token)) {
    return false;
  }
  // Continue authentication...
  return true;
}
```

## Exports

The Shared package exports:

**Types:**
- All session, build, device, and log types
- Protocol message types
- Event types

**Enums:**
- `SessionStatus`
- `BuildStatus`
- `LogLevel`
- `LogSource`
- `Platform`
- `Architecture`

**Functions:**
- Validation functions (`isValidSessionId`, `isValidProjectName`, etc.)

**Constants:**
- `DEFAULT_CORE_PORT`
- `DEFAULT_WS_PORT`
- `JETSTART_VERSION`
- `SESSION_TOKEN_EXPIRY`

## Related Documentation

- [WebSocket Protocol](../api/websocket-protocol.md) - Detailed protocol documentation
- [Types Reference](../api/types-reference.md) - Complete type definitions
- [Core Package](./core.md) - Uses Shared types
- [CLI Package](./cli.md) - Uses Shared types

## License

MIT
