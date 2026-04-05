# @jetstart/cli

Command-line interface for JetStart — instant hot reload for Android Jetpack Compose.

## Installation

```bash
npm install -g @jetstart/cli
```

Or use without installing:

```bash
npx jetstart <command>
```

---

## Commands

### `jetstart create <n>`

Scaffolds a new Android/Compose project. Checks for Java 17+ and Android SDK and installs them interactively if missing.

```bash
jetstart create my-app
jetstart create my-app --package com.example.myapp
jetstart create my-app --full-install   # Non-interactive, installs all deps automatically
```

**Options:**

| Flag | Description |
|---|---|
| `-p, --package <n>` | Android package name (e.g. `com.example.app`) |
| `-t, --template <n>` | Template to use (default: `default`) |
| `--full-install` | Non-interactive: auto-install Java + Android SDK |

---

### `jetstart dev`

Starts the JetStart development server. Watches for Kotlin file changes, compiles them to DEX, and pushes hot reload patches to connected devices over WebSocket.

```bash
jetstart dev
jetstart dev --port 9000
jetstart dev --emulator               # Deploy to a running AVD then switch to hot reload
jetstart dev --emulator --avd Pixel7  # Target a specific AVD by name
jetstart dev --web                    # Auto-open the browser web emulator
jetstart dev --no-qr                  # Skip printing the QR code
```

**Options:**

| Flag | Description |
|---|---|
| `-p, --port <port>` | HTTP port (default: `8765`) |
| `-H, --host <host>` | Host override (default: auto-detected LAN IP) |
| `--emulator` | Deploy APK to a running AVD via ADB on first build, then use hot reload |
| `--avd <n>` | Target AVD name when using `--emulator` |
| `--web` | Open the web emulator in a browser on start |
| `--no-qr` | Do not print the QR code |

**Ports used:**

| Port | Service |
|---|---|
| `8765` | HTTP server (REST API, APK download, web emulator redirect) |
| `8766` | WebSocket server (device/browser to core comms) |
| `8767` | Logs server (device log aggregation) |

The QR code encodes `host|port|wsPort|sessionId|token|projectName`. Each `jetstart dev` session generates a fresh `sessionId` and `token`; devices built against an older session are rejected with WebSocket close code `4001` or `4002`.

The host detection logic skips virtual network interfaces (Hyper-V, WSL, Docker, VMware) and prefers real Wi-Fi/Ethernet addresses in the `192.168.*`, `10.*`, or `172.*` ranges.

---

### `jetstart build`

Builds an APK (or AAB) via Gradle. Release builds automatically strip the dev-server URL and session token from `BuildConfig` and set `debuggable=false`, then restore `build.gradle` to its original state even if the build fails.

```bash
jetstart build                          # Debug APK
jetstart build --release                # Unsigned release APK
jetstart build --release --sign         # Signed release APK (requires keystore.properties)
jetstart build --release --self-sign    # Auto-generate a test keystore and sign
jetstart build --bundle                 # Build AAB (Android App Bundle)
jetstart build --release --bundle       # Signed release AAB
jetstart build --output ./dist          # Custom output directory
jetstart build --flavor staging         # Build a specific product flavor
```

**Options:**

| Flag | Description |
|---|---|
| `-o, --output <path>` | Output directory (default: `./build`) |
| `-r, --release` | Release build — R8 enabled, `debuggable=false`, dev credentials stripped |
| `--sign` | Sign with `keystore.properties` in the project root |
| `--self-sign` | Auto-generate a test keystore via `keytool` and sign (not for Play Store) |
| `--bundle` | Produce an AAB instead of an APK |
| `--flavor <n>` | Build a specific product flavor |

**`keystore.properties` format (required for `--sign`):**

```properties
storeFile=path/to/release.jks
storePassword=your-store-password
keyAlias=your-key-alias
keyPassword=your-key-password
```

Generate a keystore:

```bash
keytool -genkey -v -keystore release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias key
```

---

### `jetstart logs`

Connects to the JetStart logs server (`port 8767`) and streams live device logs to the terminal.

```bash
jetstart logs
jetstart logs --level error
jetstart logs --source build
jetstart logs --lines 200
```

**Options:**

| Flag | Description |
|---|---|
| `-f, --follow` | Follow log output in real time (default: `true`) |
| `-l, --level <level>` | Filter by level: `verbose`, `debug`, `info`, `warn`, `error`, `fatal` |
| `-s, --source <source>` | Filter by source: `cli`, `core`, `client`, `build`, `network`, `system` |
| `-n, --lines <n>` | Number of historical lines to replay on connect (default: `100`) |

---

### `jetstart clean`

Removes build artifacts and caches.

```bash
jetstart clean
```

---

## Programmatic Usage

```typescript
import { createCommand, devCommand, buildCommand } from '@jetstart/cli';

await createCommand('my-app', { package: 'com.example.myapp' });
await devCommand({ port: '8765', emulator: true });
await buildCommand({ release: true, sign: true, output: './dist' });
```

---

## Environment Variables

| Variable | Description |
|---|---|
| `ANDROID_HOME` / `ANDROID_SDK_ROOT` | Android SDK path |
| `KOTLIN_HOME` | Kotlin installation path (used by hot reload compiler) |
| `JAVA_HOME` | JDK path |
| `DEBUG` | Enable verbose logging |
| `JETSTART_PORT` | Default HTTP port |
| `JETSTART_HOST` | Default host override |

---

## License

MIT

