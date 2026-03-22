---
title: Core
description: Core build server and orchestration package
---

# Core

The Core package (`@jetstart/core`) is the central hub of JetStart, responsible for build management, HTTP/WebSocket servers, session management, and file watching.

## Overview

The Core package provides:

- 🏗️ **Build Management** - Compiling Kotlin/Compose projects
- 🌐 **HTTP Server** - Serving APKs and REST API
- 🔌 **WebSocket Server** - Real-time communication
- 📦 **Build Caching** - Faster incremental builds
- 👀 **File Watching** - Auto-rebuild on file changes
- 🔐 **Session Management** - Secure device pairing and authentication
- 📱 **QR Code Generation** - Generate QR codes for easy device connection

## Installation

```bash
npm install @jetstart/core
```

## Usage

### As a Library

The Core package can be used as a library to embed the JetStart server in your own application:

```typescript
import { JetStartServer } from '@jetstart/core';

const server = new JetStartServer({
  httpPort: 8765,
  wsPort: 8766,
  host: '0.0.0.0',
  displayHost: '192.168.1.100', // IP to show in QR codes
  projectPath: '/path/to/project',
  projectName: 'my-app',
});

await server.start();
```

### Server Configuration

**`ServerConfig` Interface:**

```typescript
interface ServerConfig {
  httpPort?: number;        // HTTP server port (default: 8765)
  wsPort?: number;          // WebSocket server port (default: 8766)
  host?: string;            // Host to bind to (default: '0.0.0.0')
  displayHost?: string;     // IP address for QR codes/logs
  projectPath?: string;     // Path to Android project
  projectName?: string;     // Project name
}
```

### Starting the Server

```typescript
const session = await server.start();

console.log('Server started:', {
  sessionId: session.id,
  httpPort: server.config.httpPort,
  wsPort: server.config.wsPort,
});
```

The `start()` method returns a `ServerSession` object with session details.

### Stopping the Server

```typescript
await server.stop();
```

## Main Components

### JetStartServer

The main server class that orchestrates all Core functionality.

```typescript
import { JetStartServer } from '@jetstart/core';

const server = new JetStartServer(config);
```

**Methods:**
- `start()` - Start all servers and begin watching for file changes
- `stop()` - Gracefully shut down all servers
- `on(event, handler)` - Listen for server events
- `getSession()` - Get current session

**Events:**
- `build:start` - Build started
- `build:complete` - Build completed
- `build:error` - Build failed
- `client:connected` - Client connected
- `client:disconnected` - Client disconnected

### HotReloadService

Orchestrates the Kotlin → DEX hot reload pipeline: `kotlinc` compilation, `$Override` class generation, and `d8` DEX conversion.

```typescript
import { HotReloadService } from '@jetstart/core';

const service = new HotReloadService(projectPath);
const result = await service.hotReload(filePath);
// result.dexBase64, result.classNames, result.compileTime, result.dexTime
```

**Methods:**
- `hotReload(filePath)` - Compile file and return DEX payload
- `checkEnvironment()` - Verify kotlinc, d8, and classpath are available

### SessionManager

Manages development sessions.

```typescript
import { SessionManager } from '@jetstart/core';

const sessionManager = new SessionManager();

const session = await sessionManager.createSession({
  projectName: 'my-app',
  projectPath: '/path/to/project',
});
```

### HotReloadService

Orchestrates the full hot reload pipeline for a changed Kotlin file: kotlinc compilation, $Override class generation, and DEX conversion via d8.

```typescript
import { HotReloadService } from '@jetstart/core';

const service = new HotReloadService(projectPath);
const result = await service.hotReload('/path/to/MainActivity.kt');
// result.dexBase64 - send as core:dex-reload
// result.classNames - list of patched class names
// result.compileTime, result.dexTime - timing metrics
```

## HTTP Server

The Core package includes an Express HTTP server with the following endpoints:

- `GET /health` - Health check
- `GET /version` - Server version
- `POST /session/create` - Create session
- `GET /session/:sessionId` - Get session
- `GET /download/:filename` - Download APK

See [REST Endpoints](../api/rest-endpoints.md) for detailed API documentation.

## WebSocket Server

The WebSocket server handles real-time communication with clients. See [WebSocket Protocol](../api/websocket-protocol.md) for message formats.

**Default Port:** 8766

## Build System

### Build Configuration

```typescript
const result = await buildService.build({
  projectPath: '/path/to/project',
  buildType: 'debug', // or 'release'
  clean: false,       // Clean before build
});
```

### Build Result

```typescript
interface BuildResult {
  success: boolean;
  apkPath?: string;
  error?: string;
  duration: number;
}
```

### Build Caching

The build system uses Gradle's incremental compilation and caches build outputs for faster subsequent builds.

## File Watching

The Core package watches for file changes and automatically triggers rebuilds:

```typescript
// File watching is enabled by default
buildService.startWatching();

// Configure watch patterns (optional)
buildService.startWatching({
  ignored: ['**/build/**', '**/node_modules/**'],
});
```

## Session Management

Sessions provide secure pairing between clients and the dev server:

```typescript
// Create a session
const session = await sessionManager.createSession({
  projectName: 'my-app',
  projectPath: '/path/to/project',
});

// Session includes:
// - id: Unique session ID (8 chars)
// - token: Authentication token (12 chars)
// - projectName: Project name
// - projectPath: Project path
// - createdAt: Creation timestamp
// - lastActivity: Last activity timestamp
```

## QR Code Generation

The Core package can generate QR codes for easy device pairing:

```typescript
import { generateQRCode } from '@jetstart/core';

const qrCode = await generateQRCode({
  sessionId: 'a1b2c3d4',
  serverUrl: 'http://192.168.1.100:8765',
  wsUrl: 'ws://192.168.1.100:8766',
  token: 'xyz789abc123',
  projectName: 'my-app',
});
// Returns: 'data:image/png;base64,...'
```

## Utilities

### Logger

```typescript
import { log, success, error, warn } from '@jetstart/core';

log('Info message');
success('Success message');
error('Error message');
warn('Warning message');
```

### Session Utilities

```typescript
import { SessionManager } from '@jetstart/core';

const manager = new SessionManager();

// Get session
const session = manager.getSession(sessionId);

// Update activity
manager.updateActivity(sessionId);

// Delete session
manager.deleteSession(sessionId);

// Cleanup expired sessions
manager.cleanupExpiredSessions();
```

## Exports

The Core package exports the following:

**Main Classes:**
- `JetStartServer` - Main server class
- `BuildService` - Build manager
- `SessionManager` - Session manager
- `HotReloadService` - Hot reload pipeline
- `KotlinCompiler` - Kotlin to .class compiler
- `DexGenerator` - .class to DEX converter
- `WebSocketHandler` - WebSocket handler

**Functions:**
- `createHttpServer()` - Create HTTP server
- `createWebSocketServer()` - Create WebSocket server
- `generateQRCode()` - Generate QR code

**Types:**
- `ServerConfig` - Server configuration
- `ServerSession` - Session information
- `BuildResult` - Build result
- All types from `@jetstart/shared`

## Dependencies

The Core package depends on:

- `@jetstart/shared` - Shared types and utilities
- `express` - HTTP server
- `ws` - WebSocket server
- `chokidar` - File watching
- `qrcode` - QR code generation
- `uuid` - UUID generation
- `cors` - CORS middleware

## Examples

### Basic Server

```typescript
import { JetStartServer } from '@jetstart/core';

async function main() {
  const server = new JetStartServer({
    httpPort: 8765,
    wsPort: 8766,
    projectPath: './my-app',
    projectName: 'my-app',
  });

  await server.start();
  console.log('Server started!');
}

main();
```

### Custom Build Service

```typescript
import { BuildService } from '@jetstart/core';

const buildService = new BuildService({
  projectPath: '/path/to/project',
  watchEnabled: true,
});

buildService.on('build:start', () => {
  console.log('Build started');
});

buildService.on('build:complete', (result) => {
  console.log('Build completed:', result.apkPath);
});

await buildService.build({ buildType: 'debug' });
```

### Event Handling

```typescript
const server = new JetStartServer(config);

server.on('build:start', () => {
  console.log('Build started');
});

server.on('build:complete', (result) => {
  console.log('Build completed:', result);
});

server.on('client:connected', (sessionId) => {
  console.log('Client connected:', sessionId);
});

await server.start();
```

## Related Documentation

- [REST Endpoints](../api/rest-endpoints.md) - HTTP API reference
- [WebSocket Protocol](../api/websocket-protocol.md) - WebSocket message protocol
- [Core API](../api/core-api.md) - Detailed API reference
- [Build System](../architecture/build-system.md) - Build process details
- [Session Management](../architecture/session-management.md) - Session lifecycle

## License

MIT
