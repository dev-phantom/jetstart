---
title: Package Structure
description: How the JetStart monorepo is organized
---

# Package Structure

JetStart is a **npm workspace monorepo**. All packages live under `packages/` and are built together via a root `tsconfig.json` project reference.

## Top-Level Layout

```
jetstart/
├── packages/
│   ├── shared/             TypeScript — shared types, WS protocol, constants
│   ├── core/               TypeScript — build server, hot reload pipeline
│   ├── cli/                TypeScript — jetstart CLI
│   ├── web/                TypeScript/React — browser web emulator
│   ├── logs/               TypeScript — log server and CLI viewer
│   ├── sanity-studio/      TypeScript — CMS for jetstart.dev
│   ├── client/             Kotlin/Gradle — Android companion app
│   ├── gradle-plugin/      Kotlin/Gradle — Gradle build plugin
│   ├── hot-reload-runtime/ Kotlin — Android DEX-loading library
│   └── template/           — Base project template for `jetstart create`
├── docs/                   Docusaurus documentation site (this site)
├── scripts/                Deployment helpers
├── package.json            Workspace root
└── tsconfig.json           TypeScript project references
```

## Package Details

### `@jetstart/shared`

**Language:** TypeScript  
**Role:** Single source of truth for all shared types, the WebSocket protocol, validation helpers, and constants.

Every other TypeScript package imports types from here. Nothing about the protocol is duplicated.

```
src/
├── types/         Session, BuildConfig, BuildResult, APKInfo, DeviceInfo, LogEntry
├── protocols/     WSMessage union type, all ClientMessage and CoreMessage interfaces
└── utils/         constants (ports, timeouts, limits), validation, version-compare
```

Key exports: `WSMessage`, `DEFAULT_CORE_PORT` (`8765`), `DEFAULT_WS_PORT` (`8766`), `DEFAULT_LOGS_PORT` (`8767`), `JETSTART_VERSION`.

---

### `@jetstart/core`

**Language:** TypeScript  
**Role:** The engine. Runs three servers and owns the entire hot reload pipeline.

```
src/
├── build/
│   ├── kotlin-compiler.ts      kotlinc wrapper, classpath builder
│   ├── dex-generator.ts        d8 wrapper
│   ├── override-generator.ts   $Override class generator
│   ├── hot-reload-service.ts   orchestrates compile → override → dex pipeline
│   ├── gradle.ts               GradleExecutor + AdbHelper
│   ├── gradle-injector.ts      injects server URL into BuildConfig
│   ├── watcher.ts              chokidar file watcher
│   ├── builder.ts              high-level build manager
│   ├── cache.ts                incremental build cache
│   ├── parser.ts               Gradle output parser
│   ├── dsl-parser.ts           Compose DSL parser (for web emulator preview)
│   └── js-compiler-service.ts  kotlinc-js → ES module (web emulator path)
├── server/
│   ├── http.ts                 Express HTTP server
│   ├── routes.ts               REST endpoints
│   └── middleware.ts
├── websocket/
│   ├── manager.ts              connection registry, session routing
│   └── handler.ts              message dispatch + session/token auth
└── utils/
    ├── logger.ts
    ├── qr.ts                   QR code generation
    └── session.ts              session creation and lifecycle
```

Ports: HTTP `8765`, WebSocket `8766`.

---

### `@jetstart/cli`

**Language:** TypeScript  
**Role:** The `jetstart` command-line tool.

```
src/
├── cli.ts
├── commands/
│   ├── create.ts           project scaffolding, Java/SDK install
│   ├── dev.ts              starts JetStartServer, shows QR, handles SIGINT
│   ├── build.ts            Gradle builds with release security hardening
│   ├── logs.ts             connects to Logs server, streams to terminal
│   ├── android-emulator.ts AVD management
│   ├── install-audit.ts    checks Java, Gradle, Android SDK
│   └── clean.ts
└── utils/
    ├── android-sdk.ts
    ├── emulator-deployer.ts  ADB-based emulator APK deploy
    ├── emulator.ts
    ├── java.ts               Java detection and install
    ├── system-tools.ts       Android SDK path detection
    └── template.ts           project template generator
```

---

### `@jetstart/web`

**Language:** TypeScript + React  
**Role:** Browser-based web emulator hosted at `https://web.jetstart.site`.

```
src/
├── App.tsx                         auto-connects from URL params
├── components/
│   ├── StatusBar, DeviceFrame      connection + build status UI
│   ├── LogViewer, BuildProgress    live log feed, build progress
│   ├── PerformancePanel            hot reload timing metrics
│   └── dsl/                        DSLRenderer + DSL component set
├── hooks/
│   ├── useWebSocket.ts             WS lifecycle, auth, message routing
│   ├── useLogs.ts                  log entry store (1000-entry cap)
│   └── usePerformanceMetrics.ts    build + hot reload timing
└── services/
    ├── CoreClient.ts               low-level WS client
    └── ComposeRenderer.tsx         renders core:js-update ES module payloads
```

Receives `core:dex-reload` (ignored), `core:js-update` (renders JS module), `core:ui-update` (DSL preview).

---

### `@jetstart/logs`

**Language:** TypeScript  
**Role:** Log aggregation server (port `8767`) and terminal log viewer.

```
src/
├── server/
│   ├── index.ts        LogsServer — WS server, in-memory storage, broadcast
│   └── storage.ts      LogStorage — capped ring buffer (10,000 entries)
├── cli/
│   ├── viewer.ts       terminal log viewer
│   └── formatter.ts    colorized log line rendering
└── filters/
    ├── level.ts, source.ts, search.ts
    └── index.ts        applyFilters() combining all filter types
```

---

### `packages/client` (Android)

**Language:** Kotlin  
**Build system:** Gradle  
**Role:** Android companion app — scans QR, connects to Core, receives DEX patches, installs APKs, streams logs.

```
app/src/main/java/com/jetstart/client/
├── MainActivity.kt
├── ui/screens/           HomeScreen, ScannerScreen, ConnectionScreen, LogsScreen
├── ui/components/        StatusCard, LogItem, QRScanner
├── network/              WebSocketClient (OkHttp), HttpClient, MessageHandler
└── utils/                ApkInstaller, DeviceInfo, Logger
```

Dependencies: Kotlin, Jetpack Compose, Material 3, Coroutines, OkHttp, Gson, ML Kit, CameraX.

---

### `packages/gradle-plugin`

**Language:** Kotlin  
**Build system:** Gradle  
**Role:** Gradle plugin that integrates JetStart into Android project builds — injects server URL and session credentials into `BuildConfig`, instruments debug variants for hot reload.

---

### `packages/hot-reload-runtime`

**Language:** Kotlin  
**Build system:** Gradle  
**Role:** Android library included in the app under development. Provides the custom `ClassLoader` that loads incoming DEX patches at runtime.

---

### `packages/template`

**Role:** Base Android project template used by `jetstart create`. Contains a minimal Jetpack Compose app pre-wired to use `hot-reload-runtime` and the Gradle plugin.

---

### `docs`

**Framework:** Docusaurus  
**Deployed to:** `https://jetstart.dev`  
**Content backend:** Sanity CMS (via `@jetstart/sanity-studio`)

## Dependency Graph

```
@jetstart/cli  ──────► @jetstart/core ──────► @jetstart/shared
@jetstart/web  ──────────────────────────────► @jetstart/shared
@jetstart/logs ──────────────────────────────► @jetstart/shared

packages/client          (Android, no npm dependencies)
packages/gradle-plugin   (Kotlin, no npm dependencies)
packages/hot-reload-runtime (Kotlin, no npm dependencies)
```

The Android packages implement the WebSocket protocol defined in `@jetstart/shared` independently (no code sharing across runtimes).

## Build System

```bash
# Build all TypeScript packages in dependency order
npm run build

# Build individual packages
npm run build:shared
npm run build:core
npm run build:cli
npm run build:web
npm run build:logs

# Watch mode
npm run dev

# Typecheck without emitting
npm run typecheck
```

