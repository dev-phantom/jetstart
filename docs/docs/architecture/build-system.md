---
title: Build System
description: How JetStart manages full builds and APK generation
---

# Build System

While JetStart specializes in hot reloading, it also orchestrates full Android builds when necessary (e.g., initial install, logic changes, dependency updates).

## Build Orchestration

The Build System is managed by `@jetstart/core` and wraps the standard Gradle Wrapper.

### Workflow

1. **Trigger**: A build is triggered by:
   - Initial session start (`jetstart dev`)
   - `core:reload` with `type="full"` (fallback from hot reload)
   - CLI command `jetstart build`

2. **Gradle Execution**: The server spawns a child process to run `./gradlew assembleDebug`.
   - Output is streamed to the CLI via WebSocket/Console.
   - Errors are parsed and reported back.

3. **Artifact Discovery**:
   - Upon success, the server locates the generated APK in `app/build/outputs/apk/debug/`.
   - Metadata (size, version) is extracted.

4. **Distribution**:
   - The server creates a download route (`/download/app-debug.apk`).
   - A `core:build-complete` event is broadcast to clients with the URL.

## Caching Strategy

To minimize build times, JetStart leverages:

- **Gradle Daemon**: Kept alive between builds to avoid startup overhead.
- **Incremental Compilation**: Only changed files are recompiled by Kotlin compiler.
- **Dependency Caching**: Standard Gradle dependency cache is preserved.

## Handling Build Errors

If a build fails:
1. The stderr from Gradle is captured.
2. A `core:build-error` event is sent to the client/CLI.
3. The error is displayed in the CLI output with coloring for readability.
4. The client shows an error overlay (if connected).
