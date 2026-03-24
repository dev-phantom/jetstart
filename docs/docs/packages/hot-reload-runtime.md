---
title: Hot Reload Runtime
description: Android library for loading DEX patches at runtime
---

# Hot Reload Runtime

The `hot-reload-runtime` library is the core component that enables true hot-reloading on Android devices by loading dynamic DEX patches without restarting the application.

## Overview

When you make a change to a Kotlin file, the JetStart dev server compiles it into a DEX patch and sends it to your device. The `hot-reload-runtime` library handles:

1. **WebSocket Communication** - Receiving DEX payloads from the dev server.
2. **DEX Loading** - Using a custom `ClassLoader` to load the received bytecode into the running process.
3. **State Management** - Managing the `reloadVersion` state that triggers Jetpack Compose recomposition.
4. **Method Swapping** - Redirecting method calls from existing classes to the newly loaded `$Override` classes.

## Installation

The library is included as a dependency in your app-level `build.gradle`:

```gradle
dependencies {
    // ...
    implementation 'com.jetstart:hot-reload-runtime:1.0.0'
}
```

## Key Components

### `HotReload` Manager

The `HotReload` object is the primary API used in your `MainActivity.kt`:

- `HotReload.connect(context, url, sessionId)` - Establishes a connection to the dev server.
- `HotReload.reloadVersion` - A `StateFlow` that increments whenever a new hot-reload patch is applied.
- `HotReload.disconnect()` - Safely closes the connection.

### `HotReloadClassLoader`

A specialized `ClassLoader` that implements a child-first loading strategy for hot-reload patches. This allows it to prioritize newly received DEX bytecode over the original classes bundled in the APK.

### `IncrementalChange`

The interface used for method-level instrumentation, allowing the runtime to swap implementations at the method level (based on the InstantRun pattern).

## Usage in App

The runtime is designed to be nearly invisible. Its main usage is in the app's entry point:

```kotlin
// Observe the reload version
val reloadVersion by HotReload.reloadVersion.collectAsState()

// Use reloadVersion as a key to force recomposition
key(reloadVersion) {
    AppContent()
}
```

## Performance

The runtime is optimized for speed, typically applying updates and triggering recomposition in under 20ms once the DEX payload is received.

## Related Documentation

- [Hot Reload System](../architecture/hot-reload-system.md) - Detailed explanation of the DEX pipeline
- [Gradle Plugin](./gradle-plugin.md) - The plugin that configures this runtime
- [Client App](./client.md) - The companion app that also uses hot-reload technology
