---
sidebar_position: 4
title: jetstart logs
description: Stream real-time application logs
---

# jetstart logs

Stream real-time application logs from all sources (CLI, Core server, Android client, build system) with powerful filtering and formatting options. Essential for debugging and monitoring your development workflow.

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

# Get last 50 logs without streaming
jetstart logs --lines 50 --no-follow
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `-f, --follow` | boolean | true | Stream logs continuously |
| `-l, --level <level>` | string | all | Filter by log level |
| `-s, --source <source>` | string | all | Filter by log source |
| `-n, --lines <number>` | number | 100 | Number of historical lines |

## Log Sources

JetStart aggregates logs from 6 different sources:

### CLI
Command-line interface operations

**Examples:**
```
12:34:56 INFO [CLI] [Command] Starting dev server
12:34:57 INFO [CLI] [Validation] Project structure valid
12:34:58 INFO [CLI] [Network] IP detected: 192.168.1.100
```

**Use cases:**
- Command execution
- User input validation
- Configuration loading

### CORE
Development server and orchestration

**Examples:**
```
12:35:00 INFO [CORE] [Server] HTTP server started on :8765
12:35:01 INFO [CORE] [WebSocket] WebSocket server ready on :8766
12:35:02 INFO [CORE] [Session] Created session: a1b2c3
```

**Use cases:**
- Server lifecycle
- Session management
- File watching events

### CLIENT
Android application logs

**Examples:**
```
12:35:10 INFO [CLIENT] [Connection] Connected to server
12:35:11 DEBUG [CLIENT] [UI] MainActivity rendered in 45ms
12:35:12 WARN [CLIENT] [Network] Slow connection detected
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
12:35:20 INFO [BUILD] [Gradle] Starting compilation
12:35:22 DEBUG [BUILD] [Compiler] Processing 42 Kotlin files
12:35:25 INFO [BUILD] [Gradle] Build completed in 5.2s
```

**Use cases:**
- Build progress
- Compilation errors
- APK packaging

### NETWORK
WebSocket and HTTP communication

**Examples:**
```
12:35:30 DEBUG [NETWORK] [WebSocket] Client connected: device-xyz
12:35:31 DEBUG [NETWORK] [WebSocket] Sent ui-update message (312 bytes)
12:35:32 WARN [NETWORK] [HTTP] Slow response: 250ms
```

**Use cases:**
- Connection status
- Message traffic
- Latency issues

### SYSTEM
System-level operations

**Examples:**
```
12:35:40 INFO [SYSTEM] [FileWatcher] Watching 152 files
12:35:41 DEBUG [SYSTEM] [Cache] Cache hit for build config
12:35:42 WARN [SYSTEM] [Memory] High memory usage: 85%
```

**Use cases:**
- File system operations
- Resource monitoring
- System health

## Log Levels

Hierarchical filtering from most to least verbose:

### VERBOSE
Extremely detailed diagnostic information

**Color:** Gray
**Use case:** Deep debugging, protocol inspection
**Example:**
```
12:34:56 VERBOSE [NETWORK] [WebSocket] Raw message: {"type":"core:ui-update","data"...}
```

### DEBUG
Detailed information for debugging

**Color:** Blue
**Use case:** Development debugging, tracking flow
**Example:**
```
12:34:57 DEBUG [BUILD] [DSL] Parsing MainActivity.kt
```

### INFO
General informational messages

**Color:** Green
**Use case:** Normal operation tracking
**Example:**
```
12:34:58 INFO [CORE] [Session] Client connected successfully
```

### WARN
Warning messages (potential issues)

**Color:** Yellow
**Use case:** Non-critical issues, performance warnings
**Example:**
```
12:34:59 WARN [CLIENT] [UI] Slow render detected: 120ms
```

### ERROR
Error messages (failures)

**Color:** Red
**Use case:** Operation failures, exceptions
**Example:**
```
12:35:00 ERROR [BUILD] [Gradle] Compilation failed: syntax error
```

### FATAL
Critical errors (crashes)

**Color:** Red (bold/background)
**Use case:** Unrecoverable errors
**Example:**
```
12:35:01 FATAL [CORE] [Server] Server crashed: Out of memory
```

## Output Format

### Standard Format (Default)

```
[timestamp] [level] [source] [tag] message

Example:
12:34:56 INFO [CORE] [Session] Client connected: device-abc123
```

**Components:**
- **Timestamp**: HH:MM:SS format
- **Level**: Log severity (color-coded)
- **Source**: Origin of log (CLI, CORE, etc.)
- **Tag**: Specific component (Session, Build, etc.)
- **Message**: Log content

### JSON Format

```bash
jetstart logs --json
```

```json
{
  "id": "log-1234",
  "timestamp": 1705334400000,
  "level": "INFO",
  "source": "CORE",
  "tag": "Session",
  "message": "Client connected: device-abc123",
  "sessionId": "a1b2c3",
  "metadata": {
    "deviceId": "xyz789",
    "ip": "192.168.1.50"
  }
}
```

## Filtering

### By Log Level

```bash
# Only errors and fatal
jetstart logs --level error

# Info and above (info, warn, error, fatal)
jetstart logs --level info
```

**Level hierarchy:**
```
--level verbose  →  All logs
--level debug    →  DEBUG, INFO, WARN, ERROR, FATAL
--level info     →  INFO, WARN, ERROR, FATAL
--level warn     →  WARN, ERROR, FATAL
--level error    →  ERROR, FATAL
--level fatal    →  FATAL only
```

### By Source

```bash
# Only build logs
jetstart logs --source build

# Only client logs
jetstart logs --source client

# Multiple sources (comma-separated)
jetstart logs --source core,build,network
```

### Combined Filters

```bash
# Build errors only
jetstart logs --source build --level error

# Recent 50 client warnings
jetstart logs --source client --level warn --lines 50

# All errors from any source
jetstart logs --level error --follow
```

## Live Streaming

### Following Logs

Stream logs in real-time:

```bash
jetstart logs --follow
```

**Output:**
```
12:34:56 INFO [CORE] [Server] Starting...
12:34:57 INFO [CORE] [Server] Ready
[live stream continues...]
^C  # Press Ctrl+C to stop
```

**Use case:** Active development monitoring

### Historical Logs

View past logs without streaming:

```bash
jetstart logs --no-follow --lines 200
```

**Output:**
```
[Shows last 200 log entries]
[Exits immediately]
```

**Use case:** Post-mortem debugging, log review

## WebSocket Connection

### How It Works

```
jetstart logs
     │
     ▼
Connect to ws://localhost:8767
     │
     ▼
Send subscription message
     │
     ▼
Receive log stream
     │
     ▼
Format and display
```

### Connection Details

**Default port:** 8767 (DEFAULT_LOGS_PORT)
**Protocol:** WebSocket
**Auto-reconnect:** Yes (on disconnect)

**Subscription message:**
```json
{
  "type": "subscribe",
  "filter": {
    "levels": ["info", "warn", "error"],
    "sources": ["core", "build"]
  },
  "maxLines": 100
}
```

### Disconnection Handling

If connection drops:

```
⚠ Connection lost to logs service
🔄 Attempting to reconnect...
✓ Reconnected successfully
```

**Auto-retry:**
- Retry interval: 2 seconds
- Max retries: Infinite
- Exponential backoff: No (constant 2s)

## Integration with Dev Server

### Dual Terminal Workflow

**Terminal 1: Dev server**
```bash
jetstart dev
```

**Terminal 2: Log monitoring**
```bash
jetstart logs --follow --source client,build
```

### Coordinated Debugging

**Scenario: Debug build issue**

```bash
# Terminal 1: Start dev server
jetstart dev

# Terminal 2: Watch build logs
jetstart logs --source build --level debug --follow
```

When file changes:
```
Terminal 1:                    Terminal 2:
Files changed: MainActivity.kt
                              → 12:35:00 DEBUG [BUILD] [Gradle] Starting build
                              → 12:35:01 DEBUG [BUILD] [Compiler] Processing...
                              → 12:35:02 ERROR [BUILD] [Gradle] Syntax error line 42
Build failed!                 → 12:35:02 ERROR [BUILD] [Gradle] Build failed
```

### Automatic Log Routing

Dev server automatically routes logs:

**Server logs** → CORE source
**Build logs** → BUILD source
**Client logs** → CLIENT source (via WebSocket)
**Network logs** → NETWORK source

All aggregated in logs service on port 8767.

## Advanced Usage

### JSON Output Processing

```bash
# Parse with jq
jetstart logs --json | jq 'select(.level == "ERROR")'

# Filter errors to file
jetstart logs --json | jq 'select(.level == "ERROR")' > errors.json

# Count logs by source
jetstart logs --json --no-follow --lines 1000 | \
  jq -r '.source' | sort | uniq -c
```

### Piping to Files

```bash
# Save all logs
jetstart logs > app.log 2>&1

# Save with timestamps
jetstart logs --follow | ts '[%Y-%m-%d %H:%M:%S]' > timestamped.log

# Rotate logs
jetstart logs >> "logs-$(date +%Y%m%d).log" 2>&1
```

### Grep Integration

```bash
# Search for specific text
jetstart logs | grep "connection"

# Case-insensitive search
jetstart logs | grep -i "ERROR"

# Multiple patterns
jetstart logs | grep -E "error|warning|failed"

# Context lines
jetstart logs | grep -A 3 -B 3 "Exception"
```

### Custom Formatting

```bash
# Extract just messages
jetstart logs --json | jq -r '.message'

# Custom format
jetstart logs --json | jq -r '"\(.timestamp) [\(.source)] \(.message)"'

# Color-coded custom format
jetstart logs --json | jq -r 'if .level == "ERROR" then "\u001b[31m\(.message)\u001b[0m" else .message end'
```

## Debugging Workflows

### Track Client Connection

```bash
jetstart logs --source network,client --level debug --follow
```

**What to look for:**
```
DEBUG [NETWORK] [WebSocket] Client handshake initiated
DEBUG [NETWORK] [WebSocket] Auth token validated
INFO [CLIENT] [Connection] Connected to 192.168.1.100:8766
```

### Debug Build Failures

```bash
jetstart logs --source build --level error --follow
```

**What to look for:**
```
ERROR [BUILD] [Gradle] Compilation failed
ERROR [BUILD] [Compiler] MainActivity.kt:42: Syntax error
ERROR [BUILD] [Gradle] Build exited with code 1
```

### Monitor Hot Reload

```bash
jetstart logs --source core --level debug | grep -i "reload\|dsl"
```

**What to look for:**
```
DEBUG [CORE] [FileWatcher] MainActivity.kt changed
DEBUG [CORE] [DSL] Parsing UI file
DEBUG [CORE] [DSL] Generated 312 bytes DSL
INFO [CORE] [HotReload] UI update sent in 85ms
```

### Track Performance

```bash
jetstart logs --source client | grep -i "render\|latency\|slow"
```

**What to look for:**
```
WARN [CLIENT] [UI] Slow render: 120ms (threshold: 100ms)
WARN [NETWORK] [WebSocket] High latency: 250ms
INFO [CLIENT] [Performance] Frame rate: 58 FPS
```

### Monitor Memory/Resources

```bash
jetstart logs --source system --level warn --follow
```

**What to look for:**
```
WARN [SYSTEM] [Memory] High memory usage: 85%
WARN [SYSTEM] [Disk] Low disk space: 5GB remaining
WARN [SYSTEM] [CPU] High CPU usage: 95%
```

## Troubleshooting

### Can't Connect to Logs Service

**Symptom:**
```
✗ Error: Failed to connect to logs service
Connection refused at ws://localhost:8767
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

# Kill conflicting process or use different port
```

**3. Firewall blocking:**
```bash
# Allow port through firewall
# Windows
New-NetFirewallRule -DisplayName "JetStart Logs" -Direction Inbound -Protocol TCP -LocalPort 8767 -Action Allow

# Linux
sudo ufw allow 8767/tcp
```

### Missing Logs

**Symptom:** Expected logs don't appear

**Checks:**

**1. Level filter too restrictive:**
```bash
# If using --level error, you won't see info/debug logs
# Solution: Use lower level or remove filter
jetstart logs --level verbose
```

**2. Source filter excluding logs:**
```bash
# If using --source build, you won't see client logs
# Solution: Include all sources or add source
jetstart logs  # No filters = all logs
```

**3. Buffer overflow:**
```bash
# Default buffer: 10,000 log entries
# Old logs get dropped
# Solution: Increase --lines or save to file
jetstart logs --follow > all.log
```

**4. Timestamp range:**
```bash
# If logs are outside time range (API feature)
# Solution: Check log timestamps
jetstart logs --json | jq '.timestamp'
```

### Garbled Output

**Symptom:** Weird characters, broken colors

**Causes & Solutions:**

**1. Terminal encoding:**
```bash
# Set UTF-8 encoding
# Windows CMD
chcp 65001

# PowerShell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
```

**2. Color support:**
```bash
# Disable colors if terminal doesn't support
jetstart logs --no-color
```

**3. Locale issues:**
```bash
# Set locale
export LC_ALL=en_US.UTF-8
export LANG=en_US.UTF-8
```

### High Memory Usage

**Symptom:** Logs command consuming too much memory

**Solutions:**

**1. Reduce buffer size:**
```bash
# Default --lines 100
# Reduce for lower memory
jetstart logs --lines 50
```

**2. Use JSON streaming:**
```bash
# Process logs in chunks
jetstart logs --json | while read line; do
  echo "$line" | jq '.message'
done
```

**3. Filter aggressively:**
```bash
# Only subscribe to what you need
jetstart logs --source client --level warn
```

## Performance Considerations

### Network Bandwidth

**Typical rates:**
- Low activity: ~1-5 KB/s
- Active development: ~10-50 KB/s
- Heavy debugging: ~100-500 KB/s

**Reduce bandwidth:**
```bash
# Filter to specific source
jetstart logs --source build

# Higher log level
jetstart logs --level warn
```

### CPU Usage

**Impact:**
- Formatting: Low (`<5%` CPU)
- JSON parsing: Medium (5-15% CPU)
- Color rendering: Low (`<5%` CPU)

**Reduce CPU:**
```bash
# Disable colors
jetstart logs --no-color

# Use raw JSON
jetstart logs --json > logs.json
```

### Buffer Management

**Circular buffer:**
- Max size: 10,000 entries
- Oldest logs dropped when full
- Efficient memory usage

**Persist logs:**
```bash
# Save to disk instead of memory
jetstart logs --follow > persistent.log
```

## Best Practices

1. **Use separate terminal for logs**
   - Keep dev server output clean
   - Dedicated log monitoring window

2. **Filter aggressively during active dev**
   ```bash
   # Focus on what matters
   jetstart logs --source client --level warn
   ```

3. **Save logs for bug reports**
   ```bash
   # Capture complete session
   jetstart logs > bug-report-logs.txt
   ```

4. **Use JSON for automation**
   ```bash
   # Parse programmatically
   jetstart logs --json | node process-logs.js
   ```

5. **Grep for specific events**
   ```bash
   # Find connection issues
   jetstart logs | grep -i "connect\|disconnect"
   ```

6. **Monitor performance in production**
   ```bash
   # Track warnings and errors
   jetstart logs --level warn --follow
   ```

## Related Commands

- [jetstart dev](./dev.md) - Primary log source
- [jetstart build](./build.md) - Build log source

## See Also

- [Debugging Tips](../guides/debugging-tips.md) - Debugging workflows
- [WebSocket Protocol](../architecture/websocket-protocol.md) - Protocol details
- [Connection Problems](../troubleshooting/connection-problems.md) - Connection troubleshooting
