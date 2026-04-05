---
title: CLI API Reference
description: Complete command and option reference for the JetStart CLI
---

# CLI API Reference

Full reference for every `jetstart` command. For usage examples and workflows, see the individual command pages under [CLI](../cli/overview.md).

---

## `jetstart create`

Scaffold a new Android/Compose project.

```bash
jetstart create <n> [options]
```

| Option | Type | Default | Description |
|---|---|---|---|
| `<n>` | string | — | Project directory name |
| `-p, --package <n>` | string | prompted | Android package name (`com.example.app`) |
| `-t, --template <n>` | string | `default` | Project template |
| `--full-install` | boolean | `false` | Non-interactive: auto-install all missing deps |

---

## `jetstart dev`

Start the development server with hot reload.

```bash
jetstart dev [options]
```

| Option | Type | Default | Description |
|---|---|---|---|
| `-p, --port <port>` | number | `8765` | HTTP server port |
| `-H, --host <host>` | string | auto-detected LAN IP | Host for QR code and client connections |
| `--qr / --no-qr` | boolean | `true` | Show QR code in terminal |
| `--open / --no-open` | boolean | `true` | Open browser automatically |
| `--web` | boolean | `false` | Auto-open web emulator in browser |
| `--emulator` | boolean | `false` | Deploy to a running AVD on first build, then hot reload |
| `--avd <n>` | string | — | Target a specific AVD by name (requires `--emulator`) |

**Ports always used:**

| Port | Service |
|---|---|
| `8765` | HTTP (REST API, APK download, web emulator redirect) |
| `8766` | WebSocket (device Γåö core real-time comms) |
| `8767` | Logs WebSocket server |

**QR code format** (compact pipe-separated):
```
host|port|wsPort|sessionId|token|projectName
```

---

## `jetstart build`

Build an APK or AAB via Gradle.

```bash
jetstart build [options]
```

| Option | Type | Default | Description |
|---|---|---|---|
| `-o, --output <path>` | string | `./build` | Output directory |
| `-r, --release` | boolean | `false` | Release build — R8, `debuggable=false`, dev credentials stripped from `BuildConfig` |
| `--sign` | boolean | `false` | Sign with `keystore.properties` in project root |
| `--self-sign` | boolean | `false` | Auto-generate a test keystore via `keytool` and sign |
| `--bundle` | boolean | `false` | Build AAB instead of APK |
| `--flavor <n>` | string | — | Build a specific product flavor |

**`keystore.properties` format** (required for `--sign`):
```properties
storeFile=path/to/release.jks
storePassword=your-store-password
keyAlias=your-key-alias
keyPassword=your-key-password
```

**Release security hardening** (applied automatically when `--release` is used):
- Dev-server URL and session token cleared from `BuildConfig`
- `build.gradle` restored to original content after build (even on failure)
- `debuggable=false` enforced by the release Gradle variant
- R8 minification and resource shrinking enabled

---

## `jetstart logs`

Connect to the Logs server and stream device logs to the terminal.

```bash
jetstart logs [options]
```

| Option | Type | Default | Description |
|---|---|---|---|
| `-f, --follow` | boolean | `true` | Stream live updates |
| `-l, --level <level>` | string | all | Exact log level filter: `verbose`, `debug`, `info`, `warn`, `error`, `fatal` (exact match only — `info` shows only INFO, not WARN/ERROR) |
| `-s, --source <source>` | string | all | Filter by source: `cli`, `core`, `client`, `build`, `network`, `system` |
| `-n, --lines <n>` | number | `100` | Historical lines to replay on connect |

Connects to `ws://localhost:8767`. Requires `jetstart dev` to be running.

---

## `jetstart install-audit`

Check the development environment for all required dependencies.

```bash
jetstart install-audit [options]
```

| Option | Type | Default | Description |
|---|---|---|---|
| `--json` | boolean | `false` | Output results as JSON (for CI/CD) |

**Checks performed:**
- Node.js ΓëÑ 18.0.0
- npm ΓëÑ 9.0.0
- Java/JDK ΓëÑ 17.0.0
- Gradle ΓëÑ 8.0.0
- `ANDROID_HOME` / `ANDROID_SDK_ROOT` set and valid
- Android SDK components: `platform-tools`, `build-tools`, `platforms;android-34`
- `KOTLIN_HOME` (for hot reload pipeline)

---

## `jetstart android-emulator`

Interactive AVD manager — no subcommands or flags.

```bash
jetstart android-emulator
```

Opens a menu to:
- List existing AVDs with running/stopped status
- Start / stop an AVD
- Create a JetStart-optimized AVD (Pixel 7, API 34, x86_64, 2 GB RAM)
- Create a custom AVD (choose device, API level, ABI)
- Delete an AVD

---

## `jetstart clean`

Stop Gradle daemons, release all file locks, and optionally delete the project folder. Run from inside the project or pass the path from anywhere.

```bash
jetstart clean [path] [options]
```

| Option | Type | Default | Description |
|---|---|---|---|
| `[path]` | string | `cwd` | Path to the project folder (optional — defaults to current directory) |
| `--build` | boolean | `false` | Also delete `app/build/` to free disk space (next build will be slower) |
| `--daemons-only` | boolean | `false` | Only stop Gradle daemons, skip cache removal |
| `--delete` | boolean | `false` | Delete the project folder itself after releasing all locks |

**Examples:**

```bash
# From inside the project
cd my-app
jetstart clean

# From the parent directory (no need to cd in)
jetstart clean my-app

# Clean and delete the folder in one step
jetstart clean my-app --delete

# Also remove build output (saves disk space)
jetstart clean my-app --build --delete
```

---

## Global Options

These flags work with all commands:

| Flag | Description |
|---|---|
| `--version` / `-v` | Print JetStart version |
| `--help` / `-h` | Show help for the command |

---

## Environment Variables

| Variable | Used by | Description |
|---|---|---|
| `ANDROID_HOME` / `ANDROID_SDK_ROOT` | `build`, `dev`, `install-audit` | Android SDK path |
| `KOTLIN_HOME` | `dev` (hot reload) | Path to `kotlinc` installation |
| `JAVA_HOME` | `build`, `dev` | JDK path (passed to Gradle) |
| `DEBUG` | all | Enable verbose debug logging |
| `JETSTART_PORT` | `dev` | Default HTTP port override |
| `JETSTART_HOST` | `dev` | Default host override |

---

## Exit Codes

| Code | Meaning |
|---|---|
| `0` | Success |
| `1` | General error (invalid project, build failure, etc.) |
| `2` | Invalid arguments |

