# @jetstart/logs

Log aggregation, streaming, filtering, and terminal display for JetStart.

## Overview

`@jetstart/logs` runs a lightweight WebSocket server on port `8767` that acts as the central log bus for a JetStart dev session. The Android companion app forwards device logs via the main WebSocket connection; `@jetstart/core` relays them to this server. The `jetstart logs` CLI command connects here and renders the stream in the terminal.

```
src/
├── server/
│   ├── index.ts     # LogsServer — WebSocket server + broadcast + message handling
│   └── storage.ts   # LogStorage — in-memory ring buffer with stats
├── cli/
│   ├── viewer.ts    # Terminal log viewer (connects to LogsServer, follows live)
│   ├── formatter.ts # Colorized log line rendering
│   └── index.ts
├── filters/
│   ├── index.ts     # applyFilters() — combines level, source, and search filters
│   ├── level.ts     # Filter by LogLevel
│   ├── source.ts    # Filter by LogSource
│   └── search.ts    # Full-text search across message and tag fields
└── utils/
    ├── colors.ts    # LogLevel → chalk color mapping
    └── index.ts
```

---

## Usage

### Start the log server (used internally by `@jetstart/core`)

```typescript
import { LogsServer } from '@jetstart/logs';
import { LogLevel, LogSource } from '@jetstart/shared';

const server = new LogsServer({
  port: 8767,
  maxLogEntries: 10_000,
});
await server.start();

// Add a log entry (called by core when it receives client:log messages)
server.addLog({
  id: crypto.randomUUID(),
  timestamp: Date.now(),
  level: LogLevel.INFO,
  tag: 'HotReload',
  message: 'DEX pushed in 72ms — 3 classes patched',
  source: LogSource.BUILD,
});

// Query stored logs with a filter
const errors = server.getLogs({ levels: [LogLevel.ERROR, LogLevel.FATAL] });

// Get statistics
const stats = server.getStats();
// { total: 412, byLevel: { info: 300, warn: 80, error: 32 }, bySource: { ... } }

await server.stop();
```

### Stream logs in the terminal (`jetstart logs`)

```typescript
import { viewLogs } from '@jetstart/logs';
import { LogLevel, LogSource } from '@jetstart/shared';

await viewLogs({
  port: 8767,
  follow: true,
  lines: 100,
  levels: [LogLevel.ERROR, LogLevel.WARN],
  sources: [LogSource.BUILD],
});
```

### Filter stored logs

```typescript
import { applyFilters } from '@jetstart/logs';
import { LogLevel, LogSource } from '@jetstart/shared';

const filtered = applyFilters(allLogs, {
  levels: [LogLevel.ERROR, LogLevel.FATAL],
  sources: [LogSource.BUILD, LogSource.NETWORK],
  searchQuery: 'compilation',
  startTime: Date.now() - 3_600_000,
  endTime: Date.now(),
});
```

---

## Log Levels

| Level | Description |
|---|---|
| `VERBOSE` | Highly detailed trace output |
| `DEBUG` | Developer debug information |
| `INFO` | General operational messages |
| `WARN` | Non-fatal warnings |
| `ERROR` | Errors that affect functionality |
| `FATAL` | Unrecoverable errors |

---

## Log Sources

| Source | Origin |
|---|---|
| `CLI` | `jetstart` CLI process |
| `CORE` | Build server (`@jetstart/core`) |
| `CLIENT` | Android companion app |
| `BUILD` | Gradle / Kotlin compiler / DEX pipeline |
| `NETWORK` | WebSocket and HTTP layer |
| `SYSTEM` | OS-level operations |

---

## WebSocket Protocol

The logs server speaks a simple JSON protocol on port `8767`.

### Subscribe — receive existing logs then follow live updates

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

On subscribe, the server immediately replays up to `maxLines` matching historical entries, then streams new entries as they arrive.

### Push a log entry

```json
{
  "type": "log",
  "log": {
    "id": "abc-123",
    "timestamp": 1711900000000,
    "level": "info",
    "tag": "HotReload",
    "message": "DEX pushed in 72ms",
    "source": "build"
  }
}
```

### Clear all stored logs

```json
{ "type": "clear" }
```

### Request statistics

```json
{ "type": "stats" }
```

Response:

```json
{
  "type": "stats",
  "stats": {
    "total": 412,
    "byLevel": { "info": 300, "warn": 80, "error": 32 },
    "bySource": { "build": 200, "client": 212 }
  }
}
```

---

## Storage

`LogStorage` is an in-memory ring buffer capped at `maxLogEntries` (default `10,000`). When the cap is reached, the oldest entries are discarded automatically. Logs are never written to disk and exist only for the lifetime of the `jetstart dev` session.

---

## Configuration

| Option | Default | Description |
|---|---|---|
| `port` | `8767` | WebSocket server port |
| `maxLogEntries` | `10,000` | Ring buffer capacity before oldest entries are dropped |

---

## License

MIT

