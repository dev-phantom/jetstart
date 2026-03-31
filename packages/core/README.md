# @jetstart/core

Central build server and real-time orchestration layer for JetStart.

## Overview

`@jetstart/core` is the engine that powers `jetstart`. It runs three networked services and orchestrates the complete hot reload pipeline — from detecting a file change to having new code running on a physical Android device in instantly.

```
src/
├── build/
│   ├── kotlin-compiler.ts    # Invokes kotlinc, builds classpath from SDK + Gradle caches
│   ├── dex-generator.ts      # Runs d8 to convert .class files to classes.dex
│   ├── override-generator.ts # Generates $Override companion classes (InstantRun-style)
│   ├── hot-reload-service.ts # Orchestrates compile → override → dex pipeline
│   ├── gradle.ts             # GradleExecutor + AdbHelper for full builds
│   ├── gradle-injector.ts    # Injects JetStart plugin config into build.gradle
│   ├── watcher.ts            # chokidar-based file watcher with debounce
│   ├── builder.ts            # High-level build manager
│   ├── cache.ts              # Incremental build cache
│   ├── parser.ts             # Gradle output parser
│   ├── dsl-parser.ts         # Compose DSL parser
│   └── js-compiler-service.ts # kotlinc-js → ES module for web emulator
├── server/
│   ├── http.ts               # Express HTTP server setup
│   ├── routes.ts             # REST API routes
│   └── middleware.ts         # Request middleware
├── websocket/
│   ├── manager.ts            # Connection registry, session routing
│   ├── handler.ts            # Message dispatch + session/token validation
│   └── index.ts
├── utils/
│   ├── logger.ts             # Colored terminal logger
│   ├── qr.ts                 # QR code generation
│   └── session.ts            # Session creation and lifecycle
└── types/
    └── index.ts              # ServerSession, QRCodeOptions
```

---

## Architecture

```
File change detected  (chokidar — watches *.kt, *.xml, *.gradle, 300ms debounce)
  │
  ├─► KotlinCompiler
  │     kotlinc + Compose compiler plugin (bundled in Kotlin 2.0+, or Gradle cache fallback)
  │     Classpath: android.jar + Gradle module cache + transforms-3 cache + project build outputs
  │     Uses @argfile to avoid Windows command-line length limits
  │     → .class files in a temp directory
  │
  ├─► OverrideGenerator
  │     Generates $Override companion classes for each modified class (InstantRun pattern)
  │     Compiles override source files back through KotlinCompiler
  │     Falls back to direct class reload if override generation fails
  │
  ├─► DexGenerator
  │     Runs d8 from $ANDROID_HOME/build-tools/<latest>
  │     --min-api 24  (Android 7.0+)
  │     → classes.dex
  │
  └─► WebSocketHandler.sendDexReload()
        Broadcasts base64-encoded DEX + class name list to all authenticated Android clients
        Android runtime loads classes via custom ClassLoader — no reinstall needed
```

For the web emulator, a parallel path compiles via `kotlinc-js` to an ES module and broadcasts it as `core:js-update`.

---

## Usage

```typescript
import { JetStartServer } from '@jetstart/core';

const server = new JetStartServer({
  httpPort: 8765,
  wsPort: 8766,
  host: '0.0.0.0',           // Bind to all interfaces
  displayHost: '192.168.1.5', // LAN IP used in QR code and terminal output
  projectPath: '/path/to/my-app',
  projectName: 'my-app',
  // For Android emulators — host is reachable at 10.0.2.2 inside the AVD
  emulatorHost: '10.0.2.2',
});

const session = await server.start();
// session.id and session.token are embedded in the QR code

server.on('build:complete', (result) => {
  console.log('APK ready:', result.apkPath);
});

await server.stop();
```

---

## HTTP API

All endpoints are served on the HTTP port (default `8765`).

### `GET /`
Redirects to `https://web.jetstart.site` with the active session's connection parameters (`host`, `port`, `wsPort`, `sessionId`, `token`, `version`, `projectName`) as query parameters, so the web emulator connects automatically. Returns a plain status page if no session is active.

### `GET /health`
```json
{ "status": "ok", "version": "0.1.0", "uptime": 42.3 }
```

### `GET /version`
```json
{ "version": "0.1.0" }
```

### `POST /session/create`
Creates a new dev session and returns a base64 QR code PNG.

Request body:
```json
{ "projectName": "my-app", "projectPath": "/abs/path/to/my-app" }
```

Response:
```json
{
  "session": { "id": "abc123", "token": "xyz789", "projectName": "my-app", "createdAt": 1711900000000 },
  "qrCode": "data:image/png;base64,..."
}
```

### `GET /session/:sessionId`
Returns the session object (404 if not found).

### `GET /download/:filename`
Streams the most recently built APK as a file download.

---

## WebSocket Protocol

The WebSocket server runs on port `8766`. Every client must send `client:connect` with the matching `sessionId` and `token` (both embedded in the QR code). Mismatched connections are closed immediately:

- Close code `4001` — session mismatch (device built against a different session, rescan QR)
- Close code `4002` — token mismatch

### Messages: device/browser → core

| Type | Key fields | Description |
|---|---|---|
| `client:connect` | `sessionId`, `token`, `deviceInfo` | Authenticate with session credentials |
| `client:status` | `status` | Send a `SessionStatus` update |
| `client:log` | `log: LogEntry` | Forward a device log entry to the server |
| `client:heartbeat` | — | Keep-alive ping |
| `client:disconnect` | `reason?` | Graceful disconnect |
| `client:click` | `action`, `elementType`, `elementText?` | UI interaction from web emulator |

### Messages: core → device/browser

| Type | Key fields | Description |
|---|---|---|
| `core:connected` | `projectName` | Authentication accepted |
| `core:build-start` | — | Gradle build has begun |
| `core:build-status` | `status: BuildStatus` | Mid-build progress update |
| `core:build-complete` | `apkInfo`, `downloadUrl` | APK ready for download/install |
| `core:build-error` | `error`, `details?` | Build failed |
| `core:dex-reload` | `dexBase64`, `classNames[]` | Hot reload DEX patch for Android devices |
| `core:js-update` | `jsBase64`, `sourceFile`, `byteSize` | ES module update for the web emulator |
| `core:log` | `log: LogEntry` | Device log broadcast to dashboard clients |
| `core:disconnect` | `reason` | Server shutting down |

---

## File Watcher

```typescript
import { FileWatcher } from '@jetstart/core';

const watcher = new FileWatcher({
  projectPath: '/path/to/project',
  callback: (changedFiles) => { /* handle changes */ },
  debounceMs: 300,
});

watcher.watch('/path/to/project');
// Watches **/*.kt, **/*.xml, **/*.gradle, **/*.gradle.kts
// Ignores: node_modules, build, .gradle, .git, dist

watcher.stop();
```

---

## Hot Reload Service

```typescript
import { HotReloadService } from '@jetstart/core';

const service = new HotReloadService('/path/to/project');

// Check that kotlinc and d8 are available
const env = await service.checkEnvironment();
if (!env.ready) console.log(env.issues);

// Compile a changed file and get the DEX payload
const result = await service.hotReload('/path/to/project/app/src/main/java/com/example/MainActivity.kt');
if (result.success) {
  console.log(`Done in ${result.compileTime + result.dexTime}ms`);
  // result.dexBase64 — send this to the device
  // result.classNames — fully-qualified class names patched
}
```

---

## Gradle & ADB

`GradleExecutor` runs full Gradle builds (debug or release). It prefers system Gradle over the project `gradlew` wrapper for speed, auto-creates `local.properties` if the Android SDK is found but not configured, and supports Gradle build flags `--parallel --build-cache --configure-on-demand --daemon`.

`AdbHelper` handles wireless ADB connections with retry logic (up to 5 attempts, escalating delays) to account for user-approval timing on the device, and polls for device readiness after `adb connect` since the device may transition through `connecting` → `offline` → `device` states.

---

## Environment Variables

| Variable | Description |
|---|---|
| `ANDROID_HOME` / `ANDROID_SDK_ROOT` | Android SDK path — required for hot reload and Gradle builds |
| `KOTLIN_HOME` | Kotlin installation path — used to find `kotlinc` |
| `JAVA_HOME` | JDK path |
| `DEBUG` | Enable verbose logging |

---

## License

MIT

