---
sidebar_position: 4
title: jetstart logs
description: Stream real-time application logs
---

# jetstart logs

Stream real-time application logs from all sources (CLI, Core server, Android client, build system) with filtering options. Essential for debugging and monitoring your development workflow.

## Prerequisites

:::warning Dev Server Required
**The `jetstart dev` server must be running** before you can stream logs. Logs are transmitted via WebSocket on port 8767.
:::

1. Start dev server: `jetstart dev`
2. In a separate terminal: `jetstart logs`

## Usage

```bash
jetstart logs [options]
```

## Quick Start

```bash
# Stream all logs
jetstart logs

# Stream only errors
jetstart logs --level error

# Stream client logs only
jetstart logs --source client

# Show last 50 historical logs then continue streaming
jetstart logs --lines 50
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `-f, --follow` | boolean | true | Stream logs continuously |
| `-l, --level <level>` | string | all | Filter by exact log level |
| `-s, --source <source>` | string | all | Filter by log source |
| `-n, --lines <number>` | number | 100 | Number of historical lines to replay on connect |

:::info Filtering is Exact Match
`--level` filters by **exact match** only. For example, `--level info` shows only `INFO` logs — it does **not** include `WARN`, `ERROR`, or `FATAL`. To see all logs, omit `--level` entirely.
:::

:::caution Source Filtering
`--source` accepts a **single source** only (e.g. `--source core`). Comma-separated values like `--source core,build` will not work. To see multiple sources, omit `--source` entirely.
:::

## Log Sources

JetStart aggregates logs from 6 different sources:

### CLI
Command-line interface operations

**Examples:**
```
12:34:56 INFO [cli] [Command] Starting dev server
12:34:57 INFO [cli] [Validation] Project structure valid
12:34:58 INFO [cli] [Network] IP detected: 192.168.43.220
```

**Use cases:**
- Command execution
- User input validation
- Configuration loading

### CORE
Development server and orchestration

**Examples:**
```
12:35:00 INFO [core] [Server] HTTP server started on :8765
12:35:01 INFO [core] [WebSocket] WebSocket server ready on :8766
12:35:02 INFO [core] [Session] Created session: GrX2yCBQ
```

**Use cases:**
- Server lifecycle
- Session management
- File watching events

### CLIENT
Android application logs

**Examples:**
```
12:35:10 INFO [client] [Connection] Connected to server
12:35:11 DEBUG [client] [UI] MainActivity rendered in 45ms
12:35:12 WARN [client] [Network] Slow connection detected
```

**Use cases:**
- App behavior
- UI rendering
- Runtime errors
- User interactions

### BUILD
Gradle build system

**Examples:**
```
12:35:20 INFO [build] [Gradle] Starting compilation
12:35:22 DEBUG [build] [Compiler] Processing 42 Kotlin files
12:35:25 INFO [build] [Gradle] Build completed in 5.2s
```

**Use cases:**
- Build progress
- Compilation errors
- APK packaging

### NETWORK
WebSocket and HTTP communication

**Examples:**
```
12:35:30 DEBUG [network] [WebSocket] Client connected: device-xyz
12:35:31 DEBUG [network] [WebSocket] Sent ui-update message (312 bytes)
12:35:32 WARN [network] [HTTP] Slow response: 250ms
```

**Use cases:**
- Connection status
- Message traffic
- Latency issues

### SYSTEM
System-level operations

**Examples:**
```
12:35:40 INFO [system] [FileWatcher] Watching 152 files
12:35:41 DEBUG [system] [Cache] Cache hit for build config
12:35:42 WARN [system] [Memory] High memory usage: 85%
```

**Use cases:**
- File system operations
- Resource monitoring
- System health

## Log Levels

Six log levels from most to least verbose:

| Level | Color | Use Case |
|-------|-------|----------|
| `verbose` | Gray | Deep debugging, protocol inspection |
| `debug` | Blue | Development debugging, tracking flow |
| `info` | Green | Normal operation tracking |
| `warn` | Yellow | Non-critical issues, performance warnings |
| `error` | Red | Operation failures, exceptions |
| `fatal` | Red (background) | Unrecoverable errors, crashes |

## Output Format

### Standard Format (Default)

```
[timestamp] [level] [source] [tag] message

Example:
17:32:00 INFO [core] [Core] WebSocket Server: ws://192.168.43.220:8766
```

**Components:**
- **Timestamp**: HH:MM:SS format (local time)
- **Level**: Log severity (color-coded in terminal)
- **Source**: Origin of log (cli, core, client, build, network, system)
- **Tag**: Specific component
- **Message**: Log content

## Filtering

### By Log Level

```bash
# Only error logs
jetstart logs --level error

# Only info logs
jetstart logs --level info

# Only warnings
jetstart logs --level warn
```

### By Source

```bash
# Only build logs
jetstart logs --source build

# Only client logs
jetstart logs --source client

# Only core server logs
jetstart logs --source core
```

### Combined Filters

```bash
# Build errors only
jetstart logs --source build --level error

# Core info logs with last 50 lines
jetstart logs --source core --level info --lines 50
```

## Live Streaming

### Following Logs

Stream logs in real-time (default behavior):

```bash
jetstart logs
```

**Output:**
```
Connecting to JetStart logs service...

ℹ Connected to logs service

17:32:00 INFO [core] [Core] WebSocket Server: ws://192.168.43.220:8766
17:32:00 INFO [core] [Core] Session ID: GrX2yCBQ
17:32:00 INFO [core] [Core] Session Token: TPjDcvY9rA4X
[live stream continues...]
^C  # Press Ctrl+C to stop
```

## WebSocket Connection

### How It Works

```
jetstart logs
     │
     ▼
Connect to ws://localhost:8767
     │
     ▼
Send subscription message with filters
     │
     ▼
Receive historical logs (up to --lines)
     │
     ▼
Stream new logs in real-time
```

### Connection Details

**Default port:** 8767 (`DEFAULT_LOGS_PORT`)
**Protocol:** WebSocket

**Subscription message sent on connect:**
```json
{
  "type": "subscribe",
  "filter": {
    "levels": ["info"],
    "sources": ["core"]
  },
  "maxLines": 100
}
```

### Disconnection Handling

When the connection drops, the command exits:

```
Closing connection...

ℹ Disconnected from logs service
```

You will need to re-run `jetstart logs` to reconnect.

## Integration with Dev Server

### Dual Terminal Workflow

**Terminal 1: Dev server**
```bash
jetstart dev
```

**Terminal 2: Log monitoring**
```bash
jetstart logs --source core
```

### Automatic Log Routing

Dev server automatically routes logs to the appropriate source:

**Server logs** → `core` source
**Build logs** → `build` source
**Client logs** → `client` source (via WebSocket)
**Network logs** → `network` source

All aggregated in logs service on port 8767.

## Advanced Usage

### Piping to Files

```bash
# Save all logs to a file
jetstart logs > app.log 2>&1
```

### Grep Integration

```bash
# Search for specific text
jetstart logs | grep "connection"

# Case-insensitive search
jetstart logs | grep -i "ERROR"

# Multiple patterns
jetstart logs | grep -E "error|warning|failed"
```

## Debugging Workflows

### Debug Build Failures

```bash
jetstart logs --source build --level error
```

**What to look for:**
```
ERROR [build] [Gradle] Compilation failed
ERROR [build] [Compiler] NotesScreen.kt:42: Syntax error
ERROR [build] [Gradle] Build exited with code 1
```

### Monitor Hot Reload

```bash
jetstart logs --source core | grep -i "reload"
```

**What to look for:**
```
INFO [core] [HotReload] Hot reload starting for: NotesScreen.kt
INFO [core] [HotReload] Hot reload complete in 84ms
```

### Track Client Connection

```bash
jetstart logs --source client
```

## Troubleshooting

### Can't Connect to Logs Service

**Symptom:**
```
✗ Error: Failed to connect to logs service
```

**Causes & Solutions:**

**1. Dev server not running:**
```bash
# Start dev server first
jetstart dev

# Then in another terminal
jetstart logs
```

**2. Port 8767 blocked:**
```bash
# Check if port is in use
netstat -ano | findstr :8767  # Windows
lsof -i :8767                  # macOS/Linux
```

### Missing Logs

**Symptom:** Expected logs don't appear

**Checks:**

**1. Level filter too restrictive:**
```bash
# --level is exact match, not hierarchical
# Solution: Remove filter to see all logs
jetstart logs
```

**2. Source filter excluding logs:**
```bash
# --source only accepts one source at a time
# Solution: Remove filter to see all sources
jetstart logs
```

**3. Buffer overflow:**
```bash
# Default buffer: 10,000 log entries
# Old logs get dropped
# Solution: Save to file
jetstart logs > all.log
```

### Garbled Output

**Symptom:** Weird characters, broken colors

**Solutions:**

**1. Terminal encoding:**
```bash
# Windows CMD
chcp 65001

# PowerShell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
```

## Buffer Management

The logs server uses a circular buffer:
- Max size: 10,000 entries
- Oldest logs are dropped when the buffer is full
- Use `--lines` to control how many historical logs are replayed on connect

**Persist logs to disk:**
```bash
jetstart logs > persistent.log
```

## Best Practices

1. **Use a separate terminal for logs** — keep dev server output clean

2. **Filter to what matters**
   ```bash
   jetstart logs --source client --level warn
   ```

3. **Save logs for bug reports**
   ```bash
   jetstart logs > bug-report-logs.txt
   ```

4. **Grep for specific events**
   ```bash
   jetstart logs | grep -i "connect\|disconnect"
   ```

## Related Commands

- [jetstart dev](./dev.md) - Primary log source
- [jetstart build](./build.md) - Build log source

## See Also

- [Debugging Tips](../guides/debugging-tips.md) - Debugging workflows
- [WebSocket Protocol](../architecture/websocket-protocol.md) - Protocol details
- [Connection Problems](../troubleshooting/connection-problems.md) - Connection troubleshooting
