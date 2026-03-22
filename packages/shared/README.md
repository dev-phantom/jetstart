# @jetstart/shared

Shared TypeScript types, WebSocket protocol definitions, validation utilities, and constants used across every JetStart package.

## Overview

`@jetstart/shared` is the single source of truth for the JetStart communication contract. All other packages — `core`, `cli`, `web`, `logs` — import types and constants from here. Nothing about the protocol is duplicated across packages.

```
src/
├── types/
│   ├── session.ts      # Session, SessionStatus, SessionToken, QRCodeData
│   ├── build.ts        # BuildConfig, BuildResult, BuildStatus, APKInfo, BuildError
│   ├── device.ts       # DeviceInfo, Platform, Architecture
│   └── log.ts          # LogEntry, LogLevel, LogSource, LogFilter, LogStats
├── protocols/
│   ├── websocket.ts    # All WebSocket message interfaces + WSMessage union type
│   ├── events.ts       # EventEmitter-style event definitions
│   └── index.ts
└── utils/
    ├── constants.ts        # Ports, timeouts, size limits, version, error codes
    ├── validation.ts       # isValidProjectName, isValidPackageName, isValidSessionId
    ├── version-compare.ts  # Semantic version comparison
    ├── colors.ts           # Log level color helpers
    └── index.ts
```

---

## Installation

`@jetstart/shared` is an internal monorepo package. Import it from any workspace:

```typescript
import {
  Session,
  BuildConfig,
  WSMessage,
  DEFAULT_CORE_PORT,
  isValidProjectName,
} from '@jetstart/shared';
```

---

## Types

### Session

```typescript
interface Session {
  id: string;
  token: string;
  projectName: string;
  projectPath: string;
  createdAt: number;
  lastActivity: number;
}

enum SessionStatus {
  CONNECTING   = 'connecting',
  CONNECTED    = 'connected',
  IDLE         = 'idle',
  DISCONNECTED = 'disconnected',
  ERROR        = 'error',
}
```

### Build

```typescript
interface BuildConfig {
  projectPath: string;
  outputPath?: string;
  buildType: 'debug' | 'release';
  debuggable?: boolean;
  minifyEnabled?: boolean;
  versionCode?: number;
  versionName?: string;
  applicationId?: string;
}

interface BuildResult {
  success: boolean;
  buildTime: number;
  apkPath?: string;
  apkSize?: number;
  errors?: BuildError[];
}

interface APKInfo {
  path: string;
  size: number;
  hash: string;
  versionCode: number;
  versionName: string;
  minSdkVersion: number;    // minimum: 24 (Android 7.0)
  targetSdkVersion: number; // current target: 34 (Android 14)
  applicationId: string;
}
```

### Device

```typescript
interface DeviceInfo {
  id: string;
  model: string;
  platform: Platform;
  architecture: Architecture;
  androidVersion?: string;
  apiLevel?: number;
}

enum Platform      { ANDROID = 'android', WEB = 'web' }
enum Architecture  { ARM64 = 'arm64', X86_64 = 'x86_64', X86 = 'x86' }
```

### Logging

```typescript
interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  tag: string;
  message: string;
  source: LogSource;
  metadata?: Record<string, unknown>;
}

enum LogLevel  { VERBOSE, DEBUG, INFO, WARN, ERROR, FATAL }
enum LogSource { CLI, CORE, CLIENT, BUILD, NETWORK, SYSTEM }
```

---

## WebSocket Protocol

All messages extend `BaseMessage`:

```typescript
interface BaseMessage {
  type: string;
  timestamp: number;
  sessionId?: string;
}

type WSMessage = ClientMessage | CoreMessage;
```

### Device / Browser → Core

| `type` | Key fields | Description |
|---|---|---|
| `client:connect` | `sessionId`, `token`, `deviceInfo` | Authenticate with session credentials |
| `client:status` | `status: SessionStatus` | Send a status update |
| `client:log` | `log: LogEntry` | Forward a device log to the server |
| `client:heartbeat` | — | Keep-alive ping |
| `client:disconnect` | `reason?` | Graceful disconnect |
| `client:click` | `action`, `elementType`, `elementText?` | UI interaction event from web emulator |

### Core → Device / Browser

| `type` | Key fields | Description |
|---|---|---|
| `core:connected` | `projectName` | Authentication accepted |
| `core:build-start` | — | Gradle build has started |
| `core:build-status` | `status: BuildStatus` | Mid-build progress update |
| `core:build-complete` | `apkInfo: APKInfo`, `downloadUrl` | APK is ready |
| `core:build-error` | `error`, `details?` | Build failed |
| `core:reload` | `reloadType: 'full' \| 'hot'` | Request an app reload |
| `core:dex-reload` | `dexBase64`, `classNames: string[]` | Hot reload DEX patch for Android |
| `core:js-update` | `jsBase64`, `sourceFile`, `byteSize` | ES module update for the web emulator |
| `core:log` | `log: LogEntry` | Broadcast a device log to dashboard clients |
| `core:disconnect` | `reason` | Server is shutting down |

---

## Constants

```typescript
// Default ports
DEFAULT_CORE_PORT = 8765   // HTTP server
DEFAULT_WS_PORT   = 8766   // WebSocket server
DEFAULT_LOGS_PORT = 8767   // Logs server

// WebSocket behaviour
WS_HEARTBEAT_INTERVAL     = 30_000   // ms between heartbeat pings
WS_RECONNECT_DELAY        = 5_000    // ms before reconnect attempt
WS_MAX_RECONNECT_ATTEMPTS = 5

// Session lifecycle
SESSION_TOKEN_EXPIRY      = 3_600_000  // 1 hour
SESSION_CLEANUP_INTERVAL  = 60_000     // 1 minute
SESSION_IDLE_TIMEOUT      = 1_800_000  // 30 minutes

// Build limits
BUILD_CACHE_SIZE_LIMIT    = 1_073_741_824  // 1 GB
BUILD_TIMEOUT             = 300_000         // 5 minutes
MAX_CONCURRENT_BUILDS     = 3

// File limits
MAX_APK_SIZE              = 104_857_600  // 100 MB
MAX_LOG_ENTRIES           = 10_000

// Android targets
MIN_ANDROID_API_LEVEL     = 24  // Android 7.0
TARGET_ANDROID_API_LEVEL  = 34  // Android 14

// Version
JETSTART_VERSION          = '0.1.0'
```

---

## Validation

```typescript
import { isValidProjectName, isValidPackageName, isValidSessionId } from '@jetstart/shared';

// Letters, numbers, hyphens, underscores; must start with a letter; 1–64 chars
isValidProjectName('my-app')           // true
isValidProjectName('123bad')           // false

// Reverse-domain format, at least two segments
isValidPackageName('com.example.app')  // true
isValidPackageName('example')          // false

isValidSessionId(sessionId)            // validates generated session ID format
```

---

## WebSocket State & Error Types

```typescript
enum WSState {
  CONNECTING    = 'connecting',
  CONNECTED     = 'connected',
  DISCONNECTING = 'disconnecting',
  DISCONNECTED  = 'disconnected',
  ERROR         = 'error',
}

enum WSErrorCode {
  CONNECTION_FAILED     = 'connection_failed',
  AUTHENTICATION_FAILED = 'authentication_failed',
  TIMEOUT               = 'timeout',
  INVALID_MESSAGE       = 'invalid_message',
  SESSION_EXPIRED       = 'session_expired',
  UNKNOWN               = 'unknown',
}
```

---

## License

MIT

