# @jetstart/logs

Logging infrastructure for JetStart.

## Overview

The Logs package provides:

- 📊 **Log Server** - WebSocket-based log streaming
- 💾 **Log Storage** - In-memory log storage with size limits
- 🔍 **Filtering** - Filter by level, source, tag, or search query
- 🖥️  **CLI Viewer** - Terminal-based log viewer
- 📈 **Statistics** - Log metrics and analytics

## Usage

### Start Log Server
```typescript
import { LogsServer } from '@jetstart/logs';

const server = new LogsServer({ port: 8767 });
await server.start();
```

### View Logs in CLI
```typescript
import { viewLogs } from '@jetstart/logs';
import { LogLevel, LogSource } from '@jetstart/shared';

await viewLogs({
  levels: [LogLevel.ERROR, LogLevel.WARN],
  sources: [LogSource.BUILD],
});
```

### Add Logs
```typescript
import { LogsServer } from '@jetstart/logs';
import { LogLevel, LogSource } from '@jetstart/shared';

const server = new LogsServer();
await server.start();

server.addLog({
  id: '123',
  timestamp: Date.now(),
  level: LogLevel.INFO,
  tag: 'Build',
  message: 'Compilation complete',
  source: LogSource.BUILD,
});
```

### Filter Logs
```typescript
import { applyFilters } from '@jetstart/logs';
import { LogLevel } from '@jetstart/shared';

const filtered = applyFilters(logs, {
  levels: [LogLevel.ERROR],
  searchQuery: 'compilation',
  startTime: Date.now() - 3600000, // Last hour
});
```

## Log Levels

- `VERBOSE` - Very detailed information
- `DEBUG` - Debug information
- `INFO` - General information
- `WARN` - Warning messages
- `ERROR` - Error messages
- `FATAL` - Fatal errors

## Log Sources

- `CLI` - Command-line interface
- `CORE` - Build server
- `CLIENT` - Android client
- `BUILD` - Build system
- `NETWORK` - Network operations
- `SYSTEM` - System operations

## WebSocket Protocol

**Subscribe to logs:**
```json
{
  "type": "subscribe",
  "filter": {
    "levels": ["error", "warn"],
    "sources": ["build"]
  },
  "maxLines": 100
}
```

**Send log:**
```json
{
  "type": "log",
  "log": {
    "id": "123",
    "timestamp": 1234567890,
    "level": "info",
    "tag": "Build",
    "message": "Build complete",
    "source": "build"
  }
}
```

**Get statistics:**
```json
{
  "type": "stats"
}
```

## License

Apache-2.0