# JetStart - Production Guide

## Log Level Control

JetStart supports different log levels to control verbosity:

### Environment Variables

```bash
# Set log level (default: info)
export JETSTART_LOG_LEVEL=warn

# Available levels:
# - error: Only errors
# - warn: Errors + warnings
# - info: Errors + warnings + info (default)
# - debug: All logs including debug info
```

### Example Usage

**Development (Verbose):**
```bash
# Show all logs including debug info
JETSTART_LOG_LEVEL=debug jetstart dev

# OR use DEBUG flag
DEBUG=1 jetstart dev
```

**Production (Quiet):**
```bash
# Only show warnings and errors
JETSTART_LOG_LEVEL=warn jetstart dev

# Only show errors
JETSTART_LOG_LEVEL=error jetstart dev
```

## WebSocket Connections in Production

### Normal Behavior
- WebSocket connections are **required** for hot reload
- Clients connect when:
  - Web browser opens emulator
  - Android app connects for hot reload
  - Any authorized client with session ID + token

### Connection Logging

**With default settings**, you'll see:
```
[Core] WebSocket client connected: abc123...
[Core] Client connecting with session: xyz789...
[Core] Received message from abc123...: client:heartbeat
```

**To reduce noise in production:**
```bash
# Minimal logging
JETSTART_LOG_LEVEL=warn jetstart dev
```

Now you'll only see warnings and errors, not every connection/heartbeat.

## Security Best Practices

### 1. Session Isolation ✅
- Each project has unique session ID
- Clients MUST provide correct session ID + token
- Sessions are isolated - no cross-project updates

### 2. Network Security
- **Development**: Use on local network only
- **Production**: Use HTTPS/WSS for WebSocket
- Never expose session tokens publicly
- Consider firewall rules for ports 8765 (HTTP) and 3001 (WebSocket)

### 3. Token Management
- Each `jetstart dev` generates unique tokens
- Tokens shown in terminal output
- Rotate by restarting dev server

## Performance Optimization

### Connection Cleanup
WebSocket connections auto-close when:
- Client disconnects
- Network timeout
- Process exits

### Resource Management
- Hot reload is instant (<100ms)
- Full Gradle builds cached when possible
- File watcher only watches relevant files (*.kt, *.xml, *.gradle)

## Deployment Checklist

- [ ] Set `JETSTART_LOG_LEVEL=warn` or `JETSTART_LOG_LEVEL=error`
- [ ] Use HTTPS/WSS if exposing over internet
- [ ] Configure firewall for required ports
- [ ] Document session IDs securely
- [ ] Monitor WebSocket connection count
- [ ] Set up log rotation if needed

## Monitoring

```bash
# Count active connections
netstat -an | grep 3001 | wc -l

# Monitor logs with filtering
jetstart dev 2>&1 | grep -E "error|warn"

# Production mode
JETSTART_LOG_LEVEL=warn jetstart dev
```

## FAQ

**Q: Too many WebSocket connections?**
A: Set `JETSTART_LOG_LEVEL=warn` to hide connection logs. Connections are normal - each client (web/phone) needs one.

**Q: Should I close WebSocket connections in production?**
A: No! WebSocket is required for hot reload. Just reduce log verbosity with `JETSTART_LOG_LEVEL=warn`.

**Q: Can multiple projects run simultaneously?**
A: Yes! Each project has isolated sessions. Use different ports if needed.

**Q: How to secure on public network?**
A: Use WSS (WebSocket Secure), configure firewall, and never share session tokens publicly.
