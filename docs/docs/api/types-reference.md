---
title: Types Reference
description: TypeScript type definitions shared across all JetStart packages
---

# Types Reference

All shared TypeScript types are defined in `@jetstart/shared`. This page documents every exported interface, enum, and type alias.

## Session Types

### `Session`

```typescript
interface Session {
  id: string;
  token: string;
  projectName: string;
  projectPath: string;
  createdAt: number;   // Unix ms
  lastActivity: number;
}
```

### `ServerSession`

Extends `Session` with internal server fields (exported from `@jetstart/core`):

```typescript
interface ServerSession {
  id: string;
  token: string;
  projectName: string;
  projectPath: string;
  createdAt: number;
  lastActivity: number;
}
```

### `SessionStatus`

```typescript
enum SessionStatus {
  CONNECTING   = 'connecting',
  CONNECTED    = 'connected',
  IDLE         = 'idle',
  DISCONNECTED = 'disconnected',
  ERROR        = 'error',
}
```

---

## Build Types

### `BuildConfig`

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
```

### `BuildResult`

```typescript
interface BuildResult {
  success: boolean;
  buildTime: number;   // ms
  apkPath?: string;
  apkSize?: number;    // bytes
  errors?: BuildError[];
}
```

### `BuildError`

```typescript
interface BuildError {
  file: string;
  line: number;
  column: number;
  message: string;
  severity: 'error' | 'warning';
}
```

### `BuildStatus`

```typescript
type BuildStatus = string; // e.g. "compiling_kotlin", "packaging", "complete"
```

### `APKInfo`

```typescript
interface APKInfo {
  path: string;
  size: number;           // bytes
  hash: string;
  versionCode: number;
  versionName: string;
  minSdkVersion: number;  // minimum: 24
  targetSdkVersion: number;
  applicationId: string;
}
```

---

## Device Types

### `DeviceInfo`

```typescript
interface DeviceInfo {
  id: string;
  model: string;
  platform: Platform;
  architecture: Architecture;
  androidVersion?: string;
  apiLevel?: number;
}
```

### `Platform`

```typescript
enum Platform {
  ANDROID = 'android',
  WEB     = 'web',
}
```

### `Architecture`

```typescript
enum Architecture {
  ARM64  = 'arm64',
  X86_64 = 'x86_64',
  X86    = 'x86',
}
```

---

## Log Types

### `LogEntry`

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
```

### `LogLevel`

```typescript
enum LogLevel {
  VERBOSE = 'verbose',
  DEBUG   = 'debug',
  INFO    = 'info',
  WARN    = 'warn',
  ERROR   = 'error',
  FATAL   = 'fatal',
}
```

### `LogSource`

```typescript
enum LogSource {
  CLI     = 'cli',
  CORE    = 'core',
  CLIENT  = 'client',
  BUILD   = 'build',
  NETWORK = 'network',
  SYSTEM  = 'system',
}
```

### `LogFilter`

```typescript
interface LogFilter {
  levels?: LogLevel[];
  sources?: LogSource[];
  searchQuery?: string;
  startTime?: number;
  endTime?: number;
}
```

### `LogStats`

```typescript
interface LogStats {
  total: number;
  byLevel: Record<LogLevel, number>;
  bySource: Record<LogSource, number>;
}
```

---

## WebSocket Types

### `WSMessage`

Union type of all possible WebSocket messages:

```typescript
type WSMessage = ClientMessage | CoreMessage;
```

### `ClientMessage`

```typescript
type ClientMessage =
  | ClientConnectMessage
  | ClientStatusMessage
  | ClientLogMessage
  | ClientHeartbeatMessage
  | ClientDisconnectMessage
  | ClientClickEventMessage;
```

### `CoreMessage`

```typescript
type CoreMessage =
  | CoreConnectedMessage
  | CoreBuildStartMessage
  | CoreBuildStatusMessage
  | CoreBuildCompleteMessage
  | CoreBuildErrorMessage
  | CoreReloadMessage
  | CoreUIUpdateMessage
  | CoreDexReloadMessage
  | CoreJsUpdateMessage
  | CoreDisconnectMessage
  | CoreLogMessage;
```

### `WSState`

```typescript
enum WSState {
  CONNECTING    = 'connecting',
  CONNECTED     = 'connected',
  DISCONNECTING = 'disconnecting',
  DISCONNECTED  = 'disconnected',
  ERROR         = 'error',
}
```

### `WSErrorCode`

```typescript
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

## Constants

```typescript
// Ports
DEFAULT_CORE_PORT  = 8765
DEFAULT_WS_PORT    = 8766
DEFAULT_LOGS_PORT  = 8767

// WebSocket
WS_HEARTBEAT_INTERVAL      = 30_000   // ms
WS_RECONNECT_DELAY         = 5_000    // ms
WS_MAX_RECONNECT_ATTEMPTS  = 5

// Session
SESSION_TOKEN_EXPIRY        = 3_600_000   // 1 hour
SESSION_CLEANUP_INTERVAL    = 60_000      // 1 minute
SESSION_IDLE_TIMEOUT        = 1_800_000   // 30 minutes

// Build
BUILD_CACHE_SIZE_LIMIT      = 1_073_741_824  // 1 GB
BUILD_TIMEOUT               = 300_000         // 5 minutes
MAX_CONCURRENT_BUILDS       = 3

// Files
MAX_APK_SIZE                = 104_857_600   // 100 MB
MAX_LOG_ENTRIES             = 10_000
MAX_LOG_FILE_SIZE           = 10_485_760    // 10 MB

// Android
MIN_ANDROID_API_LEVEL       = 24   // Android 7.0
TARGET_ANDROID_API_LEVEL    = 34   // Android 14

// Version
JETSTART_VERSION            = '0.1.0'
```

---

## Validation Functions

```typescript
// Project name: letters, numbers, hyphens, underscores; starts with letter; 1-64 chars
isValidProjectName(name: string): boolean

// Package name: reverse-domain format, at least 2 segments
isValidPackageName(name: string): boolean

// Session ID format check
isValidSessionId(id: string): boolean
```

