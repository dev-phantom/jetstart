---
title: CLI Reference
description: Command-line interface commands and options
---

# CLI Reference

The JetStart CLI (`@jetstart/cli`) is the primary tool for managing JetStart projects.

## Commands

### `create`
Scaffolds a new JetStart Android project.

```bash
jetstart create <project-name> [options]
```

**Options:**
- `--package <name>`: Set the Android package name (e.g., `com.example.app`).
- `--template <template>`: Choose a template (default: `default`).

**Example:**
```bash
jetstart create my-app --package com.example.myapp
```

### `dev`
Starts the development server, file watchers, and interactive session.

```bash
jetstart dev [options]
```

**Options:**
- `--port <number>`: Specify the HTTP port (default: 8765).
- `--ws-port <number>`: Specify the WebSocket port (default: 8766).
- `--qr`: Force display of QR code.

### `build`
Triggers a full rebuild of the project (Gradle build).

```bash
jetstart build
```

### `logs`
Streams logs from connected devices to the terminal.

```bash
jetstart logs
```

### `android-emulator`
Manages local Android emulators.

```bash
jetstart android-emulator <list|start>
```

**Subcommands:**
- `list`: Lists available AVDs (Android Virtual Devices).
- `start <avd-name>`: Launches the specified emulator.

### `install-audit`
Checks the local environment for required dependencies (Node, Java, Gradle, Android SDK).

```bash
jetstart install-audit
```
