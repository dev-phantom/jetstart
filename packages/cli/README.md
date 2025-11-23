# @jetstart/cli

Command-line interface for JetStart - Fast, wireless Android development.

## Installation
```bash
npm install -g @jetstart/cli
```

## Commands

### `jetstart create <name>`

Create a new JetStart project.
```bash
jetstart create myApp
jetstart create myApp --package com.example.myapp
jetstart create myApp --skip-install
```

**Options:**
- `-p, --package <name>` - Package name (e.g., com.example.app)
- `-t, --template <name>` - Template to use (default: "default")
- `--skip-install` - Skip npm install

### `jetstart dev`

Start development server with hot reload.
```bash
jetstart dev
jetstart dev --port 8080
jetstart dev --no-qr
```

**Options:**
- `-p, --port <port>` - Port for dev server (default: 8765)
- `-H, --host <host>` - Host address (default: 0.0.0.0)
- `--no-qr` - Do not show QR code
- `--no-open` - Do not open browser

### `jetstart build`

Build production APK.
```bash
jetstart build
jetstart build --release
jetstart build --output ./dist
```

**Options:**
- `-o, --output <path>` - Output directory (default: ./build)
- `-r, --release` - Build release version
- `--sign` - Sign the APK

### `jetstart logs`

Stream application logs.
```bash
jetstart logs
jetstart logs --level error
jetstart logs --source build
```

**Options:**
- `-f, --follow` - Follow log output (default: true)
- `-l, --level <level>` - Filter by log level
- `-s, --source <source>` - Filter by log source
- `-n, --lines <number>` - Number of lines to show (default: 100)

## Programmatic Usage
```typescript
import { createCommand, devCommand, buildCommand } from '@jetstart/cli';

// Create a project
await createCommand('myApp', { package: 'com.example.myapp' });

// Start dev server
await devCommand({ port: '8765', host: '0.0.0.0' });

// Build APK
await buildCommand({ release: true, output: './dist' });
```

## Environment Variables

- `DEBUG` - Enable debug logging
- `JETSTART_PORT` - Default port for dev server
- `JETSTART_HOST` - Default host for dev server

## License

Apache-2.0