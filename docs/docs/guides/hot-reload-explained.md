---
sidebar_position: 2
title: Hot Reload Explained
description: Deep dive into JetStart's Kotlin-to-DEX hot reload pipeline
---

# Hot Reload Explained

Understanding exactly how JetStart achieves Live live updates on real Android devices — and why it is fundamentally different from Gradle-based workflows.

## The Core Idea

Traditional Android development compiles your entire project, packages it into an APK, installs that APK through the package manager, and restarts the app. That process takes 30 – 60 seconds even for a one-line change.

JetStart's hot reload compiles **only the changed file**, converts the result to DEX bytecode, and loads it directly into the already-running Android process. The app never stops. The Activity never restarts. You see the result in instantly.

## The Real Pipeline

```
You save MainActivity.kt
        │
        ▼
   KotlinCompiler
   ─────────────
   kotlinc + Compose compiler plugin
   Classpath: android.jar + Compose + AndroidX from ~/.gradle cache
   Output: .class files in a temp directory
        │
        ▼
   OverrideGenerator
   ─────────────────
   Generates $Override companion classes for each modified class
   (InstantRun pattern — patches at method level, not class level)
        │
        ▼
   DexGenerator
   ────────────
   Android's d8 tool: .class files → classes.dex  (--min-api 24)
        │
        ▼
   WebSocketHandler.sendDexReload()
   ────────────────────────────────
   Broadcasts core:dex-reload to all connected Android clients
   Payload: base64-encoded DEX + list of patched class names
        │
        ▼
   Android Custom ClassLoader
   ──────────────────────────
   Decodes DEX, loads new class definitions into the running process
   Jetpack Compose triggers recomposition with the updated code
        │
        ▼
   UI updated on device — typically 62–135ms from file save
```

## Two Reload Paths

### Path 1: DEX Hot Reload (Android devices)

Every `.kt` file change that compiles successfully goes through the full pipeline above. The result is a `core:dex-reload` WebSocket message carrying the real compiled bytecode:

```json
{
  "type": "core:dex-reload",
  "sessionId": "a1b2c3",
  "dexBase64": "ZGV4CjAzNQA...",
  "classNames": [
    "com.example.app.MainActivity",
    "com.example.app.MainActivity$Override"
  ]
}
```

The `$Override` suffix marks the InstantRun-style companion class that carries the new method implementations.

### Path 2: JS Module Update (Web Emulator)

Simultaneously, `kotlinc-js` compiles the same changed file to a JavaScript ES module. This is sent as `core:js-update` to browser-based web emulator clients:

```json
{
  "type": "core:js-update",
  "sessionId": "a1b2c3",
  "jsBase64": "aW1wb3J0IHt...",
  "sourceFile": "MainActivity.kt",
  "byteSize": 4096
}
```

The browser dynamically imports the module and re-renders the Compose UI preview in HTML. Android clients ignore this message entirely.

### Path 3: Full Gradle Build (fallback)

For changes the hot reload pipeline cannot handle:

| Trigger | Why it needs a full build |
|---|---|
| Resource file changed (`.xml`, drawable) | Not Kotlin bytecode — must be processed by AAPT |
| `build.gradle` changed | Dependency graph may have changed |
| New `import` statement | May reference a class not in the cached classpath |
| Compilation error | `kotlinc` failed — nothing to load |

Full builds produce an APK that the client downloads and installs. This is the only path that requires reinstallation.

## The $Override Pattern Explained

The standard JVM ClassLoader cannot replace a class that is already loaded. The `$Override` pattern works around this:

1. For a class `MainActivity`, the generator creates `MainActivity$Override` with the new method bodies.
2. The DEX is loaded by a custom ClassLoader that sits above the app's default loader.
3. When a patched method is called, the runtime checks for an `$Override` companion first and dispatches to it if found.

This means **individual methods can be patched** without reloading the entire class or restarting the Activity. It is the same technique Android Studio's older Instant Run feature used, reimplemented in the JetStart toolchain.

If `$Override` generation fails for a class, JetStart falls back to loading the updated class directly (replacing the whole class) — slightly less targeted but still correct.

## What kotlinc Needs to Compile Your File

The classpath for hot reload compilation is built once per session and cached:

```
android.jar          (from $ANDROID_HOME/platforms/<latest>)
Compose runtime JARs (from ~/.gradle/caches/modules-2/files-2.1/androidx.compose.*)
Compose UI JARs      (material3, foundation, animation, ...)
AndroidX JARs        (core, activity, lifecycle, savedstate, ...)
Kotlin stdlib JARs   (from ~/.gradle/caches/modules-2/files-2.1/org.jetbrains.kotlin/*)
transforms-3 JARs    (all classes.jar from ~/.gradle/caches/transforms-3/)
Project build outputs (app/build/tmp/kotlin-classes/debug — always fresh)
```

On Windows, all of these are written to an `@argfile` so the command line does not exceed the OS length limit.

## File Watching Details

**`FileWatcher`** uses chokidar with a 300ms debounce. It watches:

- `**/*.kt`
- `**/*.xml`
- `**/*.gradle`
- `**/*.gradle.kts`

Ignored paths: `node_modules`, `build`, `.gradle`, `.git`, `dist`.

The 300ms debounce batches rapid saves (e.g. auto-format on save) into a single build trigger. A single manual save typically fires well before the debounce window expires.

## Timing Breakdown

| Step | Typical time |
|---|---|
| File save → chokidar event | 5 – 15 ms |
| `kotlinc` compilation (1 file) | 30 – 60 ms |
| `$Override` class generation | 5 – 15 ms |
| `d8` DEX conversion | 10 – 20 ms |
| WebSocket broadcast (LAN) | 2 – 5 ms |
| Android ClassLoader + recomposition | 10 – 20 ms |
| **End-to-end** | **62 – 135 ms** |

The slowest step is almost always `kotlinc` — it starts a JVM process. Subsequent reloads in the same session reuse the cached classpath, keeping compilation fast.

## What Hot Reload Supports

✅ Any change to `@Composable` function bodies
✅ Text, color, size, modifier, layout changes
✅ Adding or removing composable children
✅ Logic changes inside composable functions
✅ Changes to any Kotlin class that compiles independently

❌ New external library dependencies
❌ `build.gradle` / `settings.gradle` changes
❌ Android resource file changes (`.xml`, drawables, strings)
❌ `AndroidManifest.xml` changes
❌ Files with compilation errors

## Checking Your Environment

Before the first hot reload, JetStart verifies the toolchain is present:

```bash
# Checked automatically on jetstart dev
# You can also check manually by looking at the startup output:
#   "kotlinc not found"   → install Kotlin or set KOTLIN_HOME
#   "d8 not found"        → install Android build-tools via sdkmanager
#   "Cannot build classpath" → set ANDROID_HOME
```

| Required tool | How to provide it |
|---|---|
| `kotlinc` | Set `KOTLIN_HOME` or install Kotlin system-wide |
| `d8` | Install Android build-tools: `sdkmanager "build-tools;34.0.0"` |
| `android.jar` | Install an Android platform: `sdkmanager "platforms;android-34"` |
| Compose JARs | Build the project with Gradle once — they land in `~/.gradle/caches` |

## Optimizing for Fastest Reloads

**Do:**
- Keep each `@Composable` file focused — only UI code, minimal imports
- Build with Gradle once before starting `jetstart dev` (populates the classpath cache)
- Stay on a stable LAN/hotspot connection to minimize WebSocket latency
- Use Kotlin 2.0+ for the bundled Compose compiler plugin (avoids a Gradle cache lookup)

**Avoid:**
- Editing `build.gradle` mid-session (forces a full Gradle build and server restart)
- Adding new dependencies while `jetstart dev` is running
- Bulk-saving 10+ files at once (triggers multiple concurrent compilations)

## See Also

- [Hot Reload System Architecture](../architecture/hot-reload-system.md) — internal component details
- [Build System](../architecture/build-system.md) — how full Gradle builds work
- [WebSocket Protocol](../architecture/websocket-protocol.md) — `core:dex-reload` and `core:js-update` message specs
- [Performance Optimization](./performance-optimization.md) — speed up your workflow

