---
title: Gradle Plugin
description: JetStart Gradle plugin for Android project integration
---

# Gradle Plugin

The JetStart Gradle plugin (`com.jetstart.hot-reload`) is responsible for integrating JetStart's hot-reload capabilities into your Android application's build process.

## Overview

The Gradle plugin automates several key tasks:

1. **BuildConfig Injection** - It adds `JETSTART_SERVER_URL` and `JETSTART_SESSION_ID` fields to your app's `BuildConfig`. These fields are dynamically updated by `jetstart dev` to point to the current development session.
2. **Hot Reload Instrumentation** - It configures the debug build variant to support DEX hot-swapping.
3. **Dependency Management** - It ensures that the necessary hot-reload runtime libraries are correctly included in the debug build.

## Installation

The plugin is automatically included when you create a new project with `jetstart create`. It is applied in your app-level `build.gradle`:

```gradle
plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
    // ...
    id 'com.jetstart.hot-reload' version '1.0.0'
}
```

## How It Works

During a `jetstart dev` session, the CLI communicates with the Gradle plugin to inject the necessary connection details. This allows the mobile app to automatically discover and connect to the development server without manual configuration.

### Injected Fields

In your `MainActivity.kt`, you can access these fields to connect to the hot-reload server:

```kotlin
if (BuildConfig.DEBUG) {
    val serverUrl = BuildConfig.JETSTART_SERVER_URL
    val sessionId = BuildConfig.JETSTART_SESSION_ID
    HotReload.connect(this, serverUrl, sessionId)
}
```

## Security

The Gradle plugin is designed to be active **only in debug builds**. When you run a release build (`jetstart build --release`), the plugin:
- Does not inject any development credentials.
- Ensures that the hot-reload runtime is not included in the final production binary.
- Strips any `BuildConfig` fields related to JetStart.

## Configuration

Most configuration is handled automatically by the JetStart CLI. However, you can see the plugin's impact in your project's `build.gradle` and `gradle.properties`.

## Related Documentation

- [Hot Reload System](../architecture/hot-reload-system.md) - Technical deep dive
- [Hot Reload Runtime](./hot-reload-runtime.md) - The companion runtime library
- [CLI Reference](../cli/overview.md) - How to use `jetstart dev`
