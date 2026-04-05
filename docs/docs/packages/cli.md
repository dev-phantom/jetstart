---
title: CLI
description: Command-line interface package for JetStart
---

# CLI

The CLI package (`@jetstart/cli`) provides the command-line interface for JetStart, enabling developers to create projects, start development servers, build APKs, and manage the development environment.

## Overview

The CLI package provides:

- **Project Creation** - Scaffold new JetStart projects
- **Development Server** - Start the Core server with hot reload
- **Build Commands** - Build debug and release APKs
- **Log Management** - Stream and filter application logs
- **Environment Audit** - Check and install dependencies
- **Emulator Management** - Create and manage Android emulators

## Installation

```bash
npm install -g @jetstart/cli
```

Or use directly with npx:
```bash
npx jetstart <command>
```

## Commands

### `jetstart create <name>`

Create a new JetStart project.

```bash
jetstart create myApp
jetstart create myApp --package com.example.myapp
```

**Options:**
- `-p, --package <name>` - Android package name (e.g., `com.example.app`)
- `-t, --template <name>` - Template to use (default: "default")
- `--full-install` - Install all missing dependencies automatically

**Example:**
```bash
jetstart create my-awesome-app --package com.example.myapp
```

### `jetstart dev`

Start development server with hot reload.

```bash
jetstart dev
jetstart dev --port 8080
jetstart dev --no-qr
```

**Options:**
- `-p, --port <port>` - Port for HTTP server (default: 8765)
- `-H, --host <host>` - Host address (default: auto-detected)
- `--ws-port <port>` - WebSocket port (default: 8766)
- `--no-qr` - Do not show QR code
- `--no-open` - Do not open browser
- `--emulator` - Auto-deploy to emulator

**Example:**
```bash
jetstart dev --port 9000
```

### `jetstart build`

Build production APK.

```bash
jetstart build
jetstart build --release
jetstart build --output ./dist
```

**Options:**
- `-o, --output <path>` - Output directory (default: `./build`)
- `-r, --release` - Release build: R8 minification, `debuggable=false`, dev credentials stripped
- `--sign` - Sign with `keystore.properties` in project root (required for Play Store)
- `--self-sign` - Auto-generate a test keystore via `keytool` and sign (not for Play Store)
- `--bundle` - Build AAB (Android App Bundle) instead of APK
- `--flavor <n>` - Build a specific product flavor

**Examples:**
```bash
jetstart build --release --sign
jetstart build --release --self-sign
jetstart build --release --bundle
jetstart build --release --flavor staging
```

### `jetstart logs`

Stream application logs.

```bash
jetstart logs
jetstart logs --level error
jetstart logs --source build
```

**Options:**
- `-f, --follow` - Follow log output (default: true)
- `-l, --level <level>` - Filter by log level (`debug`, `info`, `warn`, `error`)
- `-s, --source <source>` - Filter by source (`CLI`, `CORE`, `CLIENT`, `BUILD`)
- `-n, --lines <number>` - Number of lines to show (default: 100)

**Example:**
```bash
jetstart logs --level error --source BUILD
```

### `jetstart install-audit`

Check development environment and dependencies.

```bash
jetstart install-audit
```

This command checks for:
- Node.js (18.0.0+)
- npm (9.0.0+)
- Java/JDK (17.0.0+)
- Gradle (8.0.0+)
- Android SDK
- Android SDK components

### `jetstart android-emulator`

Manage Android emulators.

```bash
jetstart android-emulator
```

Interactive menu for:
- Creating JetStart-optimized emulator
- Starting emulator
- Listing emulators
- Deleting emulator

## Programmatic Usage

The CLI package can be used programmatically in your own scripts:

```typescript
import { createCommand, devCommand, buildCommand } from '@jetstart/cli';

// Create a project
await createCommand('myApp', {
  package: 'com.example.myapp',
});

// Start dev server
await devCommand({
  port: '8765',
  host: '0.0.0.0',
  noQR: false,
});

// Build APK
await buildCommand({
  release: true,
  output: './dist',
  sign: false,
});
```

### Available Command Functions

**`createCommand(name: string, options: CreateOptions)`**
- Create a new JetStart project

**`devCommand(options: DevOptions)`**
- Start development server

**`buildCommand(options: BuildOptions)`**
- Build APK

**`logsCommand(options: LogsOptions)`**
- Stream logs

**`installAuditCommand()`**
- Audit dependencies

**`androidEmulatorCommand()`**
- Manage emulators

## Command Options Types

### CreateOptions

```typescript
interface CreateOptions {
  package?: string;
  template?: string;
  fullInstall?: boolean;
}
```

### DevOptions

```typescript
interface DevOptions {
  port?: string;
  host?: string;
  wsPort?: string;
  noQR?: boolean;
  noOpen?: boolean;
  emulator?: boolean;
}
```

### BuildOptions

```typescript
interface BuildOptions {
  output?: string;
  release?: boolean;
  sign?: boolean;
  selfSign?: boolean;
  bundle?: boolean;
  flavor?: string;
}
```

### LogsOptions

```typescript
interface LogsOptions {
  follow?: boolean;
  level?: 'debug' | 'info' | 'warn' | 'error';
  source?: 'CLI' | 'CORE' | 'CLIENT' | 'BUILD';
  lines?: number;
}
```

## Environment Variables

The CLI respects the following environment variables:

- `DEBUG` - Enable debug logging
- `JETSTART_PORT` - Default port for dev server
- `JETSTART_HOST` - Default host for dev server
- `JETSTART_WS_PORT` - Default WebSocket port
- `JAVA_HOME` - Java installation path
- `ANDROID_HOME` - Android SDK path

## Package Structure

```
src/
├── cli.ts              # CLI entry point
├── commands/           # Command implementations
│   ├── create.ts       # Create command
│   ├── dev.ts          # Dev command
│   ├── build.ts        # Build command
│   ├── logs.ts         # Logs command
│   ├── install-audit.ts # Install audit
│   └── android-emulator.ts # Emulator management
├── types/              # Type definitions
└── utils/              # Utility functions
    ├── logger.ts       # Logging utilities
    ├── prompt.ts       # User prompts
    ├── spinner.ts      # Loading spinners
    ├── android-sdk.ts  # Android SDK utilities
    ├── java.ts         # Java utilities
    ├── emulator.ts     # Emulator utilities
    └── ...
```

## Utilities

The CLI package includes various utility functions:

### Logger

```typescript
import { log, success, error, warn } from '@jetstart/cli';

log('Info message');
success('Success message');
error('Error message');
warn('Warning message');
```

### Prompts

```typescript
import { prompt, confirm, select } from '@jetstart/cli';

const name = await prompt('Project name:');
const confirmed = await confirm('Continue?');
const choice = await select('Choose option:', ['a', 'b', 'c']);
```

### Spinner

```typescript
import { spinner } from '@jetstart/cli';

const spin = spinner('Building...');
// ... do work
spin.stop();
```

## Examples

### Creating a Project Programmatically

```typescript
import { createCommand } from '@jetstart/cli';

await createCommand('my-app', {
  package: 'com.example.myapp',
  template: 'default',
});
```

### Starting Dev Server

```typescript
import { devCommand } from '@jetstart/cli';

await devCommand({
  port: '8765',
  host: '0.0.0.0',
  noQR: false,
});
```

### Building with Options

```typescript
import { buildCommand } from '@jetstart/cli';

await buildCommand({
  release: true,
  output: './dist',
  sign: false,
});
```

## Configuration Files

The CLI reads configuration from:

1. Project-level: `jetstart.config.json` in project root
2. User-level: `~/.jetstart/config.json`
3. Environment variables: `JETSTART_*` prefix

**Example `jetstart.config.json`:**
```json
{
  "projectName": "my-app",
  "packageName": "com.example.myapp",
  "jetstart": {
    "version": "0.1.0",
    "enableHotReload": true,
    "enableLogs": true,
    "port": 8765
  }
}
```

## Related Documentation

- [CLI Commands](../cli/overview.md) - Detailed command reference
- [Creating First App](../guides/creating-first-app.md) - Getting started guide
- [Core Package](./core.md) - Server implementation
- [Installation Guide](../getting-started/installation.md) - Setup instructions

## License

MIT
