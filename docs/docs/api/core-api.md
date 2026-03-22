---
title: Core API
description: Programmatic API reference for @jetstart/core
---

# Core API

`@jetstart/core` exports the `JetStartServer` class and the individual pipeline components. The CLI uses all of these internally; you can use them directly if you want to embed JetStart in a custom tool.

---

## JetStartServer

The main class. Creates and coordinates the HTTP server, WebSocket server, file watcher, and hot reload pipeline.

### Constructor

```typescript
import { JetStartServer } from '@jetstart/core';

const server = new JetStartServer({
  httpPort: 8765,        // HTTP server port (default: DEFAULT_CORE_PORT)
  wsPort: 8766,          // WebSocket server port (default: DEFAULT_WS_PORT)
  host: '0.0.0.0',       // Bind address — use 0.0.0.0 to accept all interfaces
  displayHost: '192.168.1.100', // LAN IP shown in QR code and terminal
  projectPath: '/path/to/my-app',
  projectName: 'my-app',
  emulatorHost: '10.0.2.2',  // Optional: override host injected into BuildConfig for AVD
});
```

### `server.start()`

Starts all three servers, creates a session, and begins watching for file changes.

```typescript
const session = await server.start();

console.log(session.id);     // e.g. "a1b2c3"
console.log(session.token);  // e.g. "xyz789abc"
```

Returns a `ServerSession` object with `id`, `token`, `projectName`, `projectPath`, `createdAt`, `lastActivity`.

### `server.stop()`

Gracefully shuts down all servers and stops the file watcher.

```typescript
await server.stop();
```

### `server.on(event, handler)`

Listen for server events:

```typescript
server.on('build:complete', (result) => {
  console.log('APK ready at:', result.apkPath);
  console.log('Build time:', result.buildTime, 'ms');
});

server.on('build:start', () => {
  console.log('Build started');
});

server.on('build:error', (error) => {
  console.error('Build failed:', error.message);
});

server.on('client:connected', (sessionId) => {
  console.log('Client connected to session:', sessionId);
});
```

---

## HotReloadService

Orchestrates the Kotlin → .class → $Override → DEX pipeline for a single file.

```typescript
import { HotReloadService } from '@jetstart/core';

const service = new HotReloadService('/path/to/project');

// Check environment before starting
const { ready, issues } = await service.checkEnvironment();
if (!ready) {
  issues.forEach(i => console.error(i));
  // Issues include: "kotlinc not found", "d8 not found", "Cannot build classpath"
}

// Compile a changed file and get the DEX payload
const result = await service.hotReload('/path/to/project/app/src/main/java/com/example/MainActivity.kt');

if (result.success) {
  console.log(`Compiled in ${result.compileTime}ms, DEX in ${result.dexTime}ms`);
  console.log('Classes patched:', result.classNames);
  // result.dexBase64 — send this via WebSocket as core:dex-reload
} else {
  console.error('Hot reload failed:', result.errors);
}
```

### `HotReloadResult`

```typescript
interface HotReloadResult {
  success: boolean;
  dexBase64: string | null;   // Base64-encoded classes.dex
  classNames: string[];        // Fully-qualified names of all patched classes
  errors: string[];
  compileTime: number;         // ms for kotlinc step
  dexTime: number;             // ms for d8 step
}
```

---

## KotlinCompiler

Compiles a single Kotlin source file to `.class` files.

```typescript
import { KotlinCompiler } from '@jetstart/core';

const compiler = new KotlinCompiler('/path/to/project');

// Find kotlinc executable
const kotlincPath = await compiler.findKotlinc();  // null if not found

// Build classpath from SDK + Gradle caches
const classpath = await compiler.buildClasspath();

// Compile a file
const result = await compiler.compileFile('/path/to/MainActivity.kt');
// result.success, result.classFiles, result.errors, result.outputDir
```

---

## DexGenerator

Converts `.class` files to a `classes.dex` using Android's `d8` tool.

```typescript
import { DexGenerator } from '@jetstart/core';

const generator = new DexGenerator();

const d8Path = await generator.findD8();  // null if not found

const result = await generator.generateDex(classFiles, outputDir);
// result.success, result.dexPath, result.dexBytes (Buffer), result.errors
```

---

## FileWatcher

Watches for file changes and invokes a callback with the changed paths.

```typescript
import { FileWatcher } from '@jetstart/core';

const watcher = new FileWatcher({
  projectPath: '/path/to/project',
  callback: (changedFiles: string[]) => {
    console.log('Changed:', changedFiles);
  },
  debounceMs: 300,  // optional, default 300
});

watcher.watch('/path/to/project');
// Watches: **/*.kt, **/*.xml, **/*.gradle, **/*.gradle.kts
// Ignores: node_modules, build, .gradle, .git, dist

watcher.stop();
```

---

## SessionManager

Creates and manages development sessions.

```typescript
import { SessionManager } from '@jetstart/core';

const manager = new SessionManager();

const session = await manager.createSession({
  projectName: 'my-app',
  projectPath: '/path/to/project',
});
// session.id, session.token, session.createdAt, session.lastActivity

const retrieved = manager.getSession(session.id);

manager.updateActivity(session.id);

manager.deleteSession(session.id);

manager.cleanupExpiredSessions();
// Removes sessions idle for more than SESSION_IDLE_TIMEOUT (30 minutes)
```

---

## generateQRCode

Generates a QR code PNG as a base64 data URL.

```typescript
import { generateQRCode } from '@jetstart/core';

const qrCode = await generateQRCode({
  sessionId: 'a1b2c3',
  serverUrl: 'http://192.168.1.100:8765',
  wsUrl: 'ws://192.168.1.100:8766',
  token: 'xyz789abc',
  projectName: 'my-app',
  version: '0.1.0',
});
// Returns: "data:image/png;base64,..."
```

The QR content uses the compact format: `host|port|wsPort|sessionId|token|projectName`.

---

## Logger utilities

```typescript
import { log, success, error, warning, info } from '@jetstart/core';

log('Informational message');
success('Operation completed');
error('Something failed');
warning('Non-fatal warning');
info('Server running on port 8765');
```

---

## Exported Types

All types from `@jetstart/shared` are re-exported from `@jetstart/core`:

```typescript
export type {
  Session,
  SessionStatus,
  BuildConfig,
  BuildResult,
  DeviceInfo,
  WSMessage,
} from '@jetstart/shared';
```

Core-specific types:

```typescript
interface ServerSession {
  id: string;
  token: string;
  projectName: string;
  projectPath: string;
  createdAt: number;
  lastActivity: number;
}

interface QRCodeOptions {
  sessionId: string;
  serverUrl: string;
  wsUrl: string;
  token: string;
  projectName: string;
  version: string;
}
```

