---
title: Build System
description: How JetStart manages Kotlin compilation, DEX generation, and full Gradle builds
---

# Build System

JetStart runs two distinct build paths depending on what changed: the **hot reload pipeline** for Kotlin file changes, and the **Gradle executor** for everything else.

## Hot Reload Pipeline

Triggered when one or more `.kt` files change and none of the changed files are resources or Gradle configs.

### KotlinCompiler

Invokes `kotlinc` as a child process to compile the changed file to JVM `.class` files.

**Classpath construction** (cached per session, project outputs always fetched fresh):

```
android.jar                   ($ANDROID_HOME/platforms/<latest>)
Compose + AndroidX JARs       (~/.gradle/caches/modules-2/files-2.1/androidx.compose.*/...)
Kotlin stdlib JARs             (~/.gradle/caches/modules-2/files-2.1/org.jetbrains.kotlin/*)
transforms-3 classes.jar      (~/.gradle/caches/transforms-3/**/jars/classes.jar)
Project build outputs          (app/build/tmp/kotlin-classes/debug, R.jar ΓÇö always fresh)
```

**Compose compiler plugin:**
- Kotlin 2.0+: bundled at `<kotlinc>/lib/compose-compiler-plugin.jar`
- Older Kotlin: looked up from the Gradle module cache

**Windows compatibility:** All arguments are written to a temp `@argfile` to stay within the OS command-line length limit.

### OverrideGenerator

Generates **`$Override` companion classes** for each modified class using the InstantRun pattern. These allow individual methods to be patched at runtime without reloading the entire class ΓÇö the custom ClassLoader checks for an `$Override` companion before dispatching any method call.

If override generation fails, it falls back to direct class replacement (loads the whole updated class instead of just patching methods).

### DexGenerator

Runs Android's `d8` tool to convert all `.class` files ΓÇö including `$Override` companions ΓÇö to a single `classes.dex`:

```bash
d8 --output <tmpDir> --min-api 24 <class files...>
```

`d8` is discovered from `$ANDROID_HOME/build-tools/<latest version>`.

### WebSocket Dispatch

`HotReloadService` returns the DEX as a `Buffer`. `WebSocketHandler.sendDexReload()` base64-encodes it and broadcasts `core:dex-reload` to all authenticated Android clients in the session.

---

## Full Gradle Build

Triggered by resource changes, `build.gradle` edits, or when `kotlinc` compilation fails.

### GradleExecutor

Finds and runs Gradle with `assembleDebug` (or `assembleRelease`):

**Gradle discovery order:**
1. System Gradle in `PATH` (`gradle` / `gradle.bat`) ΓÇö preferred for speed
2. Project `gradlew` wrapper ΓÇö falls back, may download Gradle on first run

**Build flags applied:**
```
--parallel --build-cache --configure-on-demand --daemon --console=plain
```

**Auto-configuration:** If `local.properties` does not exist, `GradleExecutor` creates it automatically by detecting the Android SDK from `ANDROID_HOME`, `ANDROID_SDK_ROOT`, or common default paths (`C:\Android`, `~/AppData/Local/Android/Sdk`).

### AdbHelper

Handles wireless ADB connections for the `--emulator` flag:

- Connects via `adb connect <ip>:5555`
- Polls for device readiness (state: `connecting` ΓåÆ `offline` ΓåÆ `device`)
- Up to 5 retry attempts with escalating delays (0, 1, 2, 3, 5 seconds)
- Installs APK with `adb install -r`
- Launches app with `adb shell am start`

### Build Output

On success, `GradleExecutor` searches standard APK output paths:

```
app/build/outputs/apk/debug/app-debug.apk
app/build/outputs/apk/<flavor><variant>/app-<variant>.apk
app/build/intermediates/apk/debug/app-debug.apk
```

The found APK path is stored and served via `GET /download/:filename`. `core:build-complete` is broadcast to all clients with the download URL and `APKInfo` metadata.

### Error Handling

If Gradle exits with a non-zero code:

1. stderr is captured and reported in the console output
2. `core:build-error` is broadcast with a short summary and details
3. The client shows an error state
4. `build.gradle` is always restored to its original content (for release builds that injected signing config or cleared dev fields)

---

## Release Build Security

`jetstart build --release` applies these hardening steps before invoking Gradle:

1. **Strip dev credentials** ΓÇö clears `JETSTART_SERVER_URL` and `JETSTART_SESSION_ID` from `BuildConfig` fields in `app/build.gradle`
2. **Inject signing config** ΓÇö if `--sign` or `--self-sign` is used, adds a `signingConfigs.release` block
3. **R8 minification** ΓÇö enabled by default in release variants
4. **`debuggable=false`** ΓÇö set by the release Gradle variant

After the build completes (success or failure), `build.gradle` is restored to its exact original content.

---

## Build Caching

JetStart uses Gradle's standard incremental build infrastructure:

- **Gradle daemon** ΓÇö kept alive between builds (`--daemon`) to avoid JVM startup cost
- **Gradle build cache** ΓÇö enabled with `--build-cache`; unchanged tasks are skipped
- **KotlinCompiler classpath cache** ΓÇö the SDK + Gradle JAR classpath is built once per session and reused; only project build outputs are re-scanned on each hot reload

---

## Environment Variables

| Variable | Used by |
|---|---|
| `ANDROID_HOME` / `ANDROID_SDK_ROOT` | `KotlinCompiler`, `DexGenerator`, `GradleExecutor`, `AdbHelper` |
| `KOTLIN_HOME` | `KotlinCompiler` ΓÇö path to `kotlinc` |
| `JAVA_HOME` | `GradleExecutor` ΓÇö passed as env to Gradle child process |

