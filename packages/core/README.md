# @jetstart/core

Core build server and orchestration for JetStart.

## Overview

The Core package is the central hub of JetStart, responsible for:

- 🏗️ **Build Management** - Compiling Kotlin/Compose projects
- 🌐 **HTTP Server** - Serving APKs and REST API
- 🔌 **WebSocket Server** - Real-time communication with clients
- 📦 **Build Caching** - Faster incremental builds
- 👀 **File Watching** - Auto-rebuild on changes
- 🔐 **Session Management** - Secure device pairing

## Usage

### As a Library
```typescript
import { JetStartServer } from '@jetstart/core';

const server = new JetStartServer({
  httpPort: 8765,
  wsPort: 8766,
  host: '0.0.0.0',
});

await server.start();
```

### As a Standalone Server
```bash
npm run start
```

## API Endpoints

### HTTP REST API

**Health Check**
```
GET /health
Response: { status: 'ok', version: '0.1.0', uptime: 123 }
```

**Create Session**
```
POST /session/create
Body: { projectName: 'MyApp', projectPath: '/path/to/project' }
Response: { session: {...}, qrCode: 'data:image/png;base64,...' }
```

**Get Session**
```
GET /session/:sessionId
Response: { id, token, projectName, ... }
```

**Download APK**
```
GET /download/:sessionId/:filename
Response: APK file download
```

### WebSocket Messages

**Client → Core:**
- `client:connect` - Initial connection with session
- `client:status` - Status update
- `client:log` - Log message
- `client:heartbeat` - Keep-alive ping

**Core → Client:**
- `core:connected` - Connection confirmed
- `core:build-start` - Build started
- `core:build-status` - Build progress update
- `core:build-complete` - Build finished
- `core:build-error` - Build failed
- `core:reload` - Trigger app reload

## Build System
```typescript
import { BuildManager } from '@jetstart/core';

const buildManager = new BuildManager();

const result = await buildManager.build({
  projectPath: '/path/to/project',
  outputPath: './build',
  buildType: 'debug',
  debuggable: true,
  minifyEnabled: false,
  versionCode: 1,
  versionName: '1.0.0',
  applicationId: 'com.example.app',
});

console.log(result.success, result.apkPath);
```

## File Watching
```typescript
import { FileWatcher } from '@jetstart/core';

const watcher = new FileWatcher('/path/to/project');

watcher.start(() => {
  console.log('Files changed, rebuilding...');
});

// Later
watcher.stop();
```

## Environment Variables

- `PORT` - HTTP server port (default: 8765)
- `WS_PORT` - WebSocket server port (default: 8766)
- `HOST` - Server host (default: 0.0.0.0)
- `DEBUG` - Enable debug logging

## License

Apache-2.0