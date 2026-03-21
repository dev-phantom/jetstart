<div align="center">
  <img src="assets\client\readme.png" alt="JetStart Logo" width="400"/>

  <h3>Launch Android apps at warp speed</h3>

  [![npm version](https://badge.fury.io/js/@jetstart%2Fcli.svg)](https://www.npmjs.com/package/@jetstart/cli)
  [![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
</div>

---

## What is JetStart?

JetStart is a blazing-fast developer toolchain that brings **instant hot reload** to Android Jetpack Compose. Edit your Kotlin UI code and see the change reflected on your device in **under 100ms** no full rebuild, no reinstall required.

It works by compiling only the changed Kotlin file, converting the resulting `.class` files to DEX bytecode using Android's `d8` tool, and pushing the patch to a running app over WebSocket. The Android runtime loads the new classes immediately, applying changes live.

---

## Features

| Feature | Description |
|---|---|
| **Sub-100ms Hot Reload** | Compiles Kotlin to DEX and pushes to device via WebSocket |
| **Real Kotlin Compose** | Write actual `@Composable` functions  no DSL wrappers |
| **QR Code Pairing** | Scan once to link your device; token-secured sessions prevent hijacking |
| **Gradle Integration** | Full debug/release APK builds via Gradle with smart caching |
| **Web Emulator** | Browser-based Compose preview at `web.jetstart.site`, auto-opened on `jetstart dev --web` |
| **Release Security** | Dev-server credentials and session tokens auto-stripped on release builds |
| **Emulator Deployment** | `--emulator` flag on dev deploys via ADB then switches to hot reload automatically |
| **Live Log Streaming** | Device logs piped to terminal in real time via a dedicated WebSocket log server |

---

## Installation

```bash
npm install -g @jetstart/cli
```

Or run without installing:

```bash
npx jetstart create my-app
```

---

## Quick Start

### 1. Create a new project

```bash
npx jetstart create my-awesome-app --package com.example.app
cd my-awesome-app
```

The `create` command checks for Java 17+ and Android SDK and installs them interactively if missing.

### 2. Start the development server

```bash
npx jetstart dev
```

This starts three services:

| Service | Default Port | Purpose |
|---|---|---|
| HTTP server | `8765` | REST API, APK download, web emulator redirect |
| WebSocket server | `8766` | Real-time comms with device / browser |
| Logs server | `8767` | Live device log aggregation |

A QR code is printed in the terminal encoding `host|port|wsPort|sessionId|token|projectName`.

### 3. Connect your device

Scan the QR code with the JetStart Android app.

### 4. Edit and watch

Edit `MainActivity.kt` (or any `.kt` file) and the change appears on your device in under 100ms.

---

## CLI Reference

```bash
jetstart create <name>                  # Scaffold a new Android/Compose project
jetstart dev                            # Start dev server with hot reload
jetstart dev --emulator                 # Also deploy to a running AVD via ADB
jetstart dev --emulator --avd Pixel7    # Target a specific AVD by name
jetstart dev --web                      # Auto-open the browser web emulator
jetstart dev --no-qr                    # Skip printing the QR code
jetstart build                          # Debug APK build via Gradle
jetstart build --release                # Release APK (dev credentials stripped)
jetstart build --release --sign         # Signed release build
jetstart build --release --self-sign    # Auto-generate a test keystore and sign
jetstart build --bundle                 # Build AAB instead of APK
jetstart logs                           # Stream live device logs
jetstart clean                          # Remove build artifacts
```

---

## How Hot Reload Works

```
File change detected (chokidar, 300ms debounce)
  1. KotlinCompiler   — kotlinc + Compose compiler plugin → .class files
  2. OverrideGenerator — generates $Override companion classes (InstantRun-style)
  3. DexGenerator     — d8 tool → classes.dex  (minApi 24)
  4. WebSocketHandler.sendDexReload() — base64 DEX broadcast to connected Android devices
  5. Android runtime  — custom ClassLoader loads the new classes live, no reinstall
```

The web emulator uses a parallel path: `kotlinc-js` compiles the changed file to an ES module sent via `core:js-update`, which the browser imports dynamically.

---

## Development Setup

### Prerequisites

- Node.js 18+
- JDK 17+
- Android SDK (with `build-tools` and at least one `platform`)
- Gradle 8.2+ (or use the project `gradlew` wrapper)

### Setup

```bash
git clone https://github.com/dev-phantom/jetstart.git
cd jetstart
npm install
npm run build
```

### Scripts

```bash
npm run build        # Compile all TypeScript packages + web bundle
npm run dev          # Watch mode for all packages
npm run test         # Run tests across all workspaces
npm run lint         # ESLint all packages
npm run format       # Prettier format
npm run typecheck    # tsc --noEmit
```

### Environment Variables

| Variable | Purpose |
|---|---|
| `ANDROID_HOME` / `ANDROID_SDK_ROOT` | Path to Android SDK |
| `KOTLIN_HOME` | Path to Kotlin installation (for hot reload compiler) |
| `JAVA_HOME` | Path to JDK |
| `DEBUG` | Enable verbose debug logging |

---



## Monorepo Structure

```
sleepy-diffie
├─ .eslintrc.json
├─ .npmrc
├─ .prettierrc
├─ .releaserc.json
├─ assets
│  ├─ client
│  │  ├─ logo.png
│  │  └─ readme.png
│  └─ logos
│     └─ logo.png
├─ CHANGELOG.md
├─ CONTRIBUTING.md
├─ docs
│  ├─ .docusaurus
│  ├─ .eslintrc.json
│  ├─ blog
│  │  └─ authors.yml
│  ├─ build
│  ├─ docs
│  │  ├─ api
│  │  │  ├─ cli-api.md
│  │  │  ├─ core-api.md
│  │  │  ├─ rest-endpoints.md
│  │  │  ├─ types-reference.md
│  │  │  └─ websocket-protocol.md
│  │  ├─ architecture
│  │  │  ├─ build-system.md
│  │  │  ├─ dsl-rendering.md
│  │  │  ├─ file-watching.md
│  │  │  ├─ hot-reload-system.md
│  │  │  ├─ overview.md
│  │  │  ├─ package-structure.md
│  │  │  ├─ session-management.md
│  │  │  └─ websocket-protocol.md
│  │  ├─ cli
│  │  │  ├─ android-emulator.md
│  │  │  ├─ build.md
│  │  │  ├─ create.md
│  │  │  ├─ dev.md
│  │  │  ├─ install-audit.md
│  │  │  ├─ logs.md
│  │  │  └─ overview.md
│  │  ├─ contributing
│  │  │  ├─ coding-standards.md
│  │  │  ├─ development-workflow.md
│  │  │  ├─ getting-started.md
│  │  │  ├─ pull-requests.md
│  │  │  ├─ release-process.md
│  │  │  └─ testing.md
│  │  ├─ getting-started
│  │  │  ├─ installation.md
│  │  │  ├─ introduction.md
│  │  │  ├─ quick-start.md
│  │  │  ├─ system-requirements.md
│  │  │  └─ troubleshooting-setup.md
│  │  ├─ guides
│  │  │  ├─ creating-first-app.md
│  │  │  ├─ debugging-tips.md
│  │  │  ├─ hot-reload-explained.md
│  │  │  ├─ performance-optimization.md
│  │  │  ├─ production-deployment.md
│  │  │  ├─ using-qr-codes.md
│  │  │  └─ working-with-emulators.md
│  │  ├─ packages
│  │  │  ├─ cli.md
│  │  │  ├─ client.md
│  │  │  ├─ core.md
│  │  │  ├─ shared.md
│  │  │  └─ web.md
│  │  └─ troubleshooting
│  │     ├─ android-sdk-issues.md
│  │     ├─ build-errors.md
│  │     ├─ common-issues.md
│  │     ├─ connection-problems.md
│  │     └─ faq.md
│  ├─ docusaurus.config.ts
│  ├─ netlify.toml
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ README.md
│  ├─ scripts
│  ├─ sidebars.ts
│  ├─ src
│  │  ├─ components
│  │  │  ├─ BlogPost.tsx
│  │  │  └─ gradientBorderWrapper.tsx
│  │  ├─ css
│  │  │  └─ custom.css
│  │  ├─ pages
│  │  │  ├─ blogs.tsx
│  │  │  └─ index.tsx
│  │  └─ services
│  │     └─ sanity
│  │        ├─ imageUrl.js
│  │        ├─ imageUrl.ts
│  │        ├─ sanityClient.js
│  │        └─ sanityClient.ts
│  ├─ static
│  │  ├─ .htaccess
│  │  ├─ downloads
│  │  └─ img
│  │     └─ logos
│  │        └─ logo.png
│  ├─ tailwind.config.js
│  └─ tsconfig.json
├─ example
├─ global.d.ts
├─ jetstart.cmd
├─ LICENSE
├─ my-app
│  ├─ app
│  │  ├─ build
│  │  ├─ build.gradle
│  │  └─ src
│  │     └─ main
│  │        ├─ AndroidManifest.xml
│  │        ├─ java
│  │        │  └─ com
│  │        │     └─ jetstart
│  │        │        ├─ hotreload
│  │        │        │  └─ IncrementalChange.java
│  │        │        └─ myapp
│  │        │           ├─ data
│  │        │           │  ├─ AppDatabase.kt
│  │        │           │  ├─ Note.kt
│  │        │           │  └─ NoteDao.kt
│  │        │           ├─ JetStart.kt
│  │        │           ├─ logic
│  │        │           │  └─ TaggingEngine.kt
│  │        │           ├─ MainActivity.kt
│  │        │           └─ ui
│  │        │              ├─ NotesScreen.kt
│  │        │              ├─ NotesViewModel.kt
│  │        │              └─ TestScreen.kt
│  │        └─ res
│  │           ├─ drawable
│  │           ├─ values
│  │           │  ├─ colors.xml
│  │           │  ├─ strings.xml
│  │           │  └─ themes.xml
│  │           └─ xml
│  │              ├─ network_security_config.xml
│  │              └─ provider_paths.xml
│  ├─ build.gradle
│  ├─ gradle
│  │  └─ wrapper
│  │     ├─ gradle-wrapper.jar
│  │     └─ gradle-wrapper.properties
│  ├─ gradle.properties
│  ├─ gradlew
│  ├─ gradlew.bat
│  ├─ jetstart.config.json
│  ├─ README.md
│  └─ settings.gradle
├─ package-lock.json
├─ package.json
├─ packages
│  ├─ cli
│  │  ├─ .eslintrc.json
│  │  ├─ package.json
│  │  ├─ README.md
│  │  ├─ src
│  │  │  ├─ cli.ts
│  │  │  ├─ commands
│  │  │  │  ├─ android-emulator.ts
│  │  │  │  ├─ build.ts
│  │  │  │  ├─ clean.ts
│  │  │  │  ├─ create.ts
│  │  │  │  ├─ dev.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ install-audit.ts
│  │  │  │  └─ logs.ts
│  │  │  ├─ index.ts
│  │  │  ├─ types
│  │  │  │  └─ index.ts
│  │  │  └─ utils
│  │  │     ├─ android-sdk.ts
│  │  │     ├─ downloader.ts
│  │  │     ├─ emulator-deployer.ts
│  │  │     ├─ emulator.ts
│  │  │     ├─ index.ts
│  │  │     ├─ java.ts
│  │  │     ├─ logger.ts
│  │  │     ├─ open.ts
│  │  │     ├─ prompt.ts
│  │  │     ├─ spinner.ts
│  │  │     ├─ system-tools.ts
│  │  │     └─ template.ts
│  │  ├─ tests
│  │  │  ├─ create.test.ts
│  │  │  └─ utils.test.ts
│  │  └─ tsconfig.json
│  ├─ client
│  │  ├─ app
│  │  │  ├─ build.gradle
│  │  │  ├─ proguard-rules.pro
│  │  │  └─ src
│  │  │     └─ main
│  │  │        ├─ AndroidManifest.xml
│  │  │        ├─ java
│  │  │        │  └─ com
│  │  │        │     └─ jetstart
│  │  │        │        └─ client
│  │  │        │           ├─ data
│  │  │        │           │  ├─ ConnectionManager.kt
│  │  │        │           │  ├─ models
│  │  │        │           │  │  ├─ BuildStatus.kt
│  │  │        │           │  │  ├─ LogEntry.kt
│  │  │        │           │  │  └─ Session.kt
│  │  │        │           │  └─ repository
│  │  │        │           │     └─ SessionRepository.kt
│  │  │        │           ├─ MainActivity.kt
│  │  │        │           ├─ network
│  │  │        │           │  ├─ HttpClient.kt
│  │  │        │           │  ├─ MessageHandler.kt
│  │  │        │           │  └─ WebSocketClient.kt
│  │  │        │           ├─ SplashActivity.kt
│  │  │        │           ├─ ui
│  │  │        │           │  ├─ components
│  │  │        │           │  │  ├─ LogItem.kt
│  │  │        │           │  │  ├─ QRScanner.kt
│  │  │        │           │  │  └─ StatusCard.kt
│  │  │        │           │  ├─ screens
│  │  │        │           │  │  ├─ ConnectionScreen.kt
│  │  │        │           │  │  ├─ HomeScreen.kt
│  │  │        │           │  │  ├─ LogsScreen.kt
│  │  │        │           │  │  └─ ScannerScreen.kt
│  │  │        │           │  └─ theme
│  │  │        │           │     ├─ Color.kt
│  │  │        │           │     ├─ Theme.kt
│  │  │        │           │     └─ Type.kt
│  │  │        │           └─ utils
│  │  │        │              ├─ ApkInstaller.kt
│  │  │        │              ├─ DeviceInfo.kt
│  │  │        │              └─ Logger.kt
│  │  │        └─ res
│  │  │           ├─ drawable
│  │  │           │  ├─ ic_launcher_background.xml
│  │  │           │  ├─ ic_launcher_foreground.xml
│  │  │           │  ├─ logo.png
│  │  │           │  └─ splash_background.xml
│  │  │           ├─ mipmap-anydpi-v26
│  │  │           │  ├─ ic_launcher.xml
│  │  │           │  └─ ic_launcher_round.xml
│  │  │           ├─ mipmap-hdpi
│  │  │           │  ├─ ic_launcher.png
│  │  │           │  └─ ic_launcher_round.png
│  │  │           ├─ mipmap-mdpi
│  │  │           │  ├─ ic_launcher.png
│  │  │           │  └─ ic_launcher_round.png
│  │  │           ├─ mipmap-xhdpi
│  │  │           │  ├─ ic_launcher.png
│  │  │           │  └─ ic_launcher_round.png
│  │  │           ├─ mipmap-xxhdpi
│  │  │           │  ├─ ic_launcher.png
│  │  │           │  └─ ic_launcher_round.png
│  │  │           ├─ mipmap-xxxhdpi
│  │  │           │  ├─ ic_launcher.png
│  │  │           │  └─ ic_launcher_round.png
│  │  │           ├─ values
│  │  │           │  ├─ colors.xml
│  │  │           │  ├─ strings.xml
│  │  │           │  └─ themes.xml
│  │  │           └─ xml
│  │  │              ├─ backup_rules.xml
│  │  │              ├─ data_extraction_rules.xml
│  │  │              ├─ file_paths.xml
│  │  │              └─ network_security_config.xml
│  │  ├─ build.gradle
│  │  ├─ gradle
│  │  │  └─ wrapper
│  │  │     ├─ gradle-wrapper.jar
│  │  │     └─ gradle-wrapper.properties
│  │  ├─ gradle.properties
│  │  ├─ gradlew
│  │  ├─ gradlew.bat
│  │  ├─ README.md
│  │  └─ settings.gradle
│  ├─ core
│  │  ├─ .eslintrc.json
│  │  ├─ package.json
│  │  ├─ README.md
│  │  ├─ src
│  │  │  ├─ build
│  │  │  │  ├─ builder.ts
│  │  │  │  ├─ cache.ts
│  │  │  │  ├─ dex-generator.ts
│  │  │  │  ├─ dsl-parser.ts
│  │  │  │  ├─ dsl-types.ts
│  │  │  │  ├─ gradle-injector.ts
│  │  │  │  ├─ gradle.ts
│  │  │  │  ├─ hot-reload-service.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ js-compiler-service.ts
│  │  │  │  ├─ kotlin-compiler.ts
│  │  │  │  ├─ kotlin-parser.ts
│  │  │  │  ├─ override-generator.ts
│  │  │  │  ├─ parser.ts
│  │  │  │  └─ watcher.ts
│  │  │  ├─ index.ts
│  │  │  ├─ server
│  │  │  │  ├─ http.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ middleware.ts
│  │  │  │  └─ routes.ts
│  │  │  ├─ types
│  │  │  │  └─ index.ts
│  │  │  ├─ utils
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ logger.ts
│  │  │  │  ├─ qr.ts
│  │  │  │  └─ session.ts
│  │  │  └─ websocket
│  │  │     ├─ handler.ts
│  │  │     ├─ index.ts
│  │  │     └─ manager.ts
│  │  ├─ tests
│  │  │  ├─ build.test.ts
│  │  │  └─ server.test.ts
│  │  └─ tsconfig.json
│  ├─ gradle-plugin
│  │  ├─ build
│  │  ├─ build.gradle.kts
│  │  ├─ settings.gradle.kts
│  │  └─ src
│  │     └─ main
│  │        └─ kotlin
│  │           └─ com
│  │              └─ jetstart
│  │                 └─ gradle
│  │                    ├─ asm
│  │                    │  ├─ HotReloadClassVisitor.kt
│  │                    │  └─ HotReloadMethodVisitor.kt
│  │                    └─ JetStartPlugin.kt
│  ├─ hot-reload-runtime
│  │  ├─ build.gradle
│  │  ├─ consumer-rules.pro
│  │  ├─ proguard-rules.pro
│  │  └─ src
│  │     └─ main
│  │        ├─ AndroidManifest.xml
│  │        └─ java
│  │           └─ com
│  │              └─ jetstart
│  │                 └─ hotreload
│  │                    ├─ ComposeHotReload.kt
│  │                    ├─ HotReloadClient.java
│  │                    ├─ HotReloadRuntime.java
│  │                    └─ IncrementalChange.java
│  ├─ logs
│  │  ├─ .eslintrc.json
│  │  ├─ package.json
│  │  ├─ README.md
│  │  ├─ src
│  │  │  ├─ cli
│  │  │  │  ├─ formatter.ts
│  │  │  │  ├─ index.ts
│  │  │  │  └─ viewer.ts
│  │  │  ├─ filters
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ level.ts
│  │  │  │  ├─ search.ts
│  │  │  │  └─ source.ts
│  │  │  ├─ index.ts
│  │  │  ├─ server
│  │  │  │  ├─ index.ts
│  │  │  │  └─ storage.ts
│  │  │  ├─ types
│  │  │  │  └─ index.ts
│  │  │  └─ utils
│  │  │     ├─ colors.ts
│  │  │     └─ index.ts
│  │  ├─ tests
│  │  │  ├─ filters.test.ts
│  │  │  └─ storage.test.ts
│  │  └─ tsconfig.json
│  ├─ sanity-studio
│  │  ├─ .sanity
│  │  │  └─ runtime
│  │  │     ├─ app.js
│  │  │     └─ index.html
│  │  ├─ eslint.config.mjs
│  │  ├─ netlify.toml
│  │  ├─ package.json
│  │  ├─ README.md
│  │  ├─ sanity.cli.ts
│  │  ├─ sanity.config.ts
│  │  ├─ schemaTypes
│  │  │  ├─ author.ts
│  │  │  ├─ blockContent.ts
│  │  │  ├─ category.ts
│  │  │  ├─ index.ts
│  │  │  └─ post.ts
│  │  ├─ static
│  │  │  └─ .htaccess
│  │  └─ tsconfig.json
│  ├─ shared
│  │  ├─ .eslintrc.json
│  │  ├─ package.json
│  │  ├─ README.md
│  │  ├─ src
│  │  │  ├─ index.ts
│  │  │  ├─ protocols
│  │  │  │  ├─ events.ts
│  │  │  │  ├─ index.ts
│  │  │  │  └─ websocket.ts
│  │  │  ├─ types
│  │  │  │  ├─ build.ts
│  │  │  │  ├─ device.ts
│  │  │  │  ├─ index.ts
│  │  │  │  ├─ log.ts
│  │  │  │  └─ session.ts
│  │  │  └─ utils
│  │  │     ├─ colors.ts
│  │  │     ├─ constants.ts
│  │  │     ├─ index.ts
│  │  │     ├─ validation.ts
│  │  │     └─ version-compare.ts
│  │  ├─ tests
│  │  │  ├─ protocols.test.ts
│  │  │  ├─ setup.ts
│  │  │  ├─ types.test.ts
│  │  │  └─ validation.test.ts
│  │  └─ tsconfig.json
│  ├─ template
│  │  └─ base
│  │     ├─ app
│  │     │  ├─ build.gradle
│  │     │  ├─ proguard-rules.pro
│  │     │  └─ src
│  │     │     └─ main
│  │     │        ├─ AndroidManifest.xml
│  │     │        ├─ java
│  │     │        │  ├─ com
│  │     │        │  │  └─ jetstart
│  │     │        │  │     └─ hotreload
│  │     │        │  │        └─ IncrementalChange.java
│  │     │        │  └─ __PACKAGE_PATH__
│  │     │        │     ├─ data
│  │     │        │     │  ├─ AppDatabase.kt
│  │     │        │     │  ├─ Note.kt
│  │     │        │     │  └─ NoteDao.kt
│  │     │        │     ├─ JetStart.kt
│  │     │        │     ├─ logic
│  │     │        │     │  └─ TaggingEngine.kt
│  │     │        │     ├─ MainActivity.kt
│  │     │        │     └─ ui
│  │     │        │        ├─ NotesScreen.kt
│  │     │        │        ├─ NotesViewModel.kt
│  │     │        │        └─ TestScreen.kt
│  │     │        └─ res
│  │     │           ├─ drawable
│  │     │           ├─ values
│  │     │           │  ├─ colors.xml
│  │     │           │  ├─ strings.xml
│  │     │           │  └─ themes.xml
│  │     │           └─ xml
│  │     │              ├─ network_security_config.xml
│  │     │              └─ provider_paths.xml
│  │     ├─ build.gradle
│  │     ├─ gradle
│  │     │  └─ wrapper
│  │     │     ├─ gradle-wrapper.jar
│  │     │     └─ gradle-wrapper.properties
│  │     ├─ gradle.properties
│  │     ├─ gradlew
│  │     ├─ gradlew.bat
│  │     ├─ jetstart.config.json
│  │     ├─ README.md
│  │     └─ settings.gradle
│  └─ web
│     ├─ .eslintrc.json
│     ├─ index.html
│     ├─ netlify.toml
│     ├─ package.json
│     ├─ public
│     │  ├─ .htaccess
│     │  └─ logo.png
│     ├─ README.md
│     ├─ src
│     │  ├─ App.css
│     │  ├─ App.tsx
│     │  ├─ components
│     │  │  ├─ BuildProgress.css
│     │  │  ├─ BuildProgress.tsx
│     │  │  ├─ ConnectionPanel.css
│     │  │  ├─ ConnectionPanel.tsx
│     │  │  ├─ DeviceFrame.css
│     │  │  ├─ DeviceFrame.tsx
│     │  │  ├─ dsl
│     │  │  │  ├─ DSLBox.tsx
│     │  │  │  ├─ DSLButton.tsx
│     │  │  │  ├─ DSLColumn.tsx
│     │  │  │  ├─ DSLComponents.css
│     │  │  │  ├─ DSLRenderer.tsx
│     │  │  │  ├─ DSLRow.tsx
│     │  │  │  ├─ DSLSpacer.tsx
│     │  │  │  ├─ DSLText.tsx
│     │  │  │  └─ index.ts
│     │  │  ├─ index.ts
│     │  │  ├─ LogViewer.css
│     │  │  ├─ LogViewer.tsx
│     │  │  ├─ PerformancePanel.css
│     │  │  ├─ PerformancePanel.tsx
│     │  │  ├─ StatusBar.css
│     │  │  └─ StatusBar.tsx
│     │  ├─ hooks
│     │  │  ├─ index.ts
│     │  │  ├─ useLogs.ts
│     │  │  ├─ usePerformanceMetrics.ts
│     │  │  └─ useWebSocket.ts
│     │  ├─ index.css
│     │  ├─ main.tsx
│     │  ├─ services
│     │  │  ├─ ComposeRenderer.tsx
│     │  │  ├─ CoreClient.ts
│     │  │  └─ dsl
│     │  │     ├─ alignmentParser.ts
│     │  │     └─ modifierParser.ts
│     │  ├─ styles
│     │  │  └─ material-typography.css
│     │  ├─ types
│     │  │  └─ dsl.ts
│     │  └─ utils
│     │     ├─ dslParser.ts
│     │     └─ mockDSL.ts
│     ├─ tsconfig.json
│     └─ vite.config.ts
├─ PRODUCTION.md
├─ README.md
├─ release.config.js
├─ scripts
│  ├─ deploy-ftps.mjs
│  ├─ deploy-sftp.mjs
│  ├─ publish-packages.js
│  └─ update-versions.js
├─ test
│  ├─ test-dev.js
│  └─ test-ip.js
├─ tsconfig.json
└─ tsconfig.tests.json

```

## License

MIT — see [LICENSE](LICENSE)

---

**Made with by [phantom](https://github.com/dev-phantom)**