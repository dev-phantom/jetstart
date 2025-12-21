---
sidebar_position: 2
title: jetstart dev
description: Start the development server with hot reload
---

# jetstart dev

Start the JetStart development server with instant hot reload, QR code pairing, and optional emulator deployment. This is your primary command during active development.

## Prerequisites

:::warning Network Requirement
**Your development machine and Android device MUST be on the same network** (same WiFi/hotspot). QR code connection will not work if they're on different networks or if your phone is using cellular data.
:::

For emulator deployment (`--emulator` flag):
1. First create an Android Virtual Device: `jetstart android-emulator`
2. Select "Create JetStart-Optimized Emulator" or "Create Custom Emulator"
3. Then run `jetstart dev --emulator`

## Usage

```bash
jetstart dev [options]
```

## Quick Start

```bash
# Start dev server with default settings
jetstart dev

# Start on custom port
jetstart dev --port 9000

# Start with automatic emulator deployment
jetstart dev --emulator

# Disable QR code display
jetstart dev --no-qr
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `-p, --port <port>` | number | 8765 | HTTP server port |
| `-H, --host <host>` | string | auto-detected | Host address for client connections |
| `--qr / --no-qr` | boolean | true | Display QR code for device pairing |
| `--open / --no-open` | boolean | true | Open browser automatically |
| `--emulator` | boolean | false | Deploy to running Android emulator |
| `--avd <name>` | string | - | Target specific emulator by AVD name |

## How It Works

### Startup Sequence

When you run `jetstart dev`, the following happens:

```
1. Read project configuration
   └─ Validate project path and name

2. Setup emulator (if --emulator flag present)
   ├─ Detect or prompt for AVD selection
   └─ Read package name from app/build.gradle

3. Initialize Core Server
   ├─ Create HTTP server (port 8765)
   ├─ Create WebSocket server (port 8766)
   ├─ Bind to 0.0.0.0 (all interfaces)
   └─ Create development session

4. Inject build configuration
   └─ Add server URL to BuildConfig

5. Start file watcher
   ├─ Watch *.kt files
   ├─ Watch resource files
   └─ Debounce changes (100ms)

6. Display connection info
   ├─ Local URL (localhost)
   ├─ Network URL (LAN IP)
   ├─ QR code (if enabled)
   └─ Manual connection details

7. Wait for client connection
   └─ Trigger initial build when client connects
```

### Architecture Diagram

```
┌─────────────────┐
│   Dev Command   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────┐
│  Core Server    │────▶│ File Watcher │
│  - HTTP :8765   │     │ (chokidar)   │
│  - WS :8766     │     └──────┬───────┘
└────────┬────────┘            │
         │                     │
         ▼                     ▼
┌─────────────────┐     ┌──────────────┐
│   QR Code Gen   │     │ Change       │
│   Connection    │     │ Detection    │
└─────────────────┘     └──────┬───────┘
                               │
         ┌─────────────────────┴──────────────┐
         │                                    │
         ▼                                    ▼
┌──────────────────┐              ┌──────────────────┐
│ DSL Hot Reload   │              │  Gradle Build    │
│ (&lt;100ms)      │              │  (10-30s)        │
└────────┬─────────┘              └────────┬─────────┘
         │                                 │
         └────────────┬────────────────────┘
                      │
                      ▼
              ┌───────────────┐
              │ Client Update │
              │ (Android/Web) │
              └───────────────┘
```

## Connection Methods

### 1. QR Code Connection (Recommended)

The fastest way to connect your Android device:

**Step 1: Start dev server**
```bash
jetstart dev
```

**Step 2: Output shows QR code**
```
✓ JetStart dev server is running!

ℹ Local:    http://localhost:8765
ℹ Network:  http://192.168.1.100:8765
ℹ Project:  my-app

Scan QR or connect manually:

███████████████████████████
██ ▄▄▄▄▄ █▀ ██▀▄█ ▄▄▄▄▄ ██
██ █   █ █▀▀▀ ▄ █ █   █ ██
██ █▄▄▄█ █ ▄█▀▀██ █▄▄▄█ ██
██▄▄▄▄▄▄▄█ ▀ █ ▀ ▄▄▄▄▄▄▄██
██  ▄▄ ▄▄ █▄▀█▀▀ ▄█▄▀  ▀██
██▄▄█  ▄▄▀██▄ ▀  ▄  ▄▀▄ ██
███████████████████████████

ℹ IP: 192.168.1.100
ℹ Session: a1b2c3
ℹ Token: xyz789
```

**Step 3: Scan with JetStart Android app**
1. Open JetStart app on your device
2. Tap "Scan QR Code"
3. Point camera at terminal
4. Connection established automatically!

### QR Code Format

The QR code contains connection data in ultra-compact format:

```
host|port|wsPort|sessionId|token|projectName
```

Example:
```
192.168.1.100|8765|8766|a1b2c3|xyz789|my-app
```

This minimizes QR code size for faster scanning and better terminal display.

### 2. Manual Connection

If QR code scanning doesn't work:

1. Start dev server: `jetstart dev`
2. Note the connection details from output
3. Open JetStart app → "Manual Connection"
4. Enter:
   - **Host**: 192.168.1.100
   - **Port**: 8765
   - **Session ID**: a1b2c3
   - **Token**: xyz789

### 3. Emulator Auto-Deployment

Deploy directly to Android emulator:

```bash
jetstart dev --emulator
```

**What happens:**
1. Detects running emulators
2. Prompts you to select one (or use --avd flag)
3. Reads package name from `app/build.gradle`
4. Triggers initial APK build when you connect
5. Automatically installs APK via ADB
6. Launches app on emulator
7. Future changes use hot reload (no reinstall!)

**Specify emulator by name:**
```bash
jetstart dev --emulator --avd Pixel_7_API_34
```

**Package name detection:**
The emulator deployer reads your package name from:
```gradle
// app/build.gradle
android {
    defaultConfig {
        applicationId "com.example.myapp" // ← Detected automatically
    }
}
```

## File Watching

### Smart Change Detection

JetStart watches for file changes and intelligently determines the best update strategy:

```
File Changed
     │
     ▼
┌─────────────────────────┐
│ Is it a UI-only change? │
└──────────┬──────────────┘
           │
    ┌──────┴──────┐
    │             │
   YES            NO
    │             │
    ▼             ▼
┌─────────┐  ┌─────────┐
│ DSL Hot │  │  Full   │
│ Reload  │  │ Gradle  │
│ <100ms  │  │  Build  │
└─────────┘  └─────────┘
```

### UI-Only Changes (Fast Path)

Files that trigger **DSL hot reload**:
- `MainActivity.kt`
- `**/screens/*.kt`
- `**/components/*.kt`

**Performance:** `<100ms` from file save to device update

**Example:**
```kotlin
// Edit MainActivity.kt
@Composable
fun HelloScreen() {
    Text("Hello World") // Change this text
}
```

```bash
# Console output
Files changed: MainActivity.kt
🚀 UI-only changes detected, using DSL hot reload
✓ DSL generated: 245 bytes
✓ UI hot reload sent in `<100ms`⚡
```

### Full Rebuild (Slow Path)

Files that trigger **full Gradle build**:
- Build configuration (`build.gradle`, `settings.gradle`)
- Resource files (`strings.xml`, `colors.xml`, etc.)
- Non-UI Kotlin files (data models, repositories, etc.)
- Assets and images

**Performance:** 10-30 seconds (first build), 5-15s (incremental)

**Example:**
```kotlin
// Edit app/build.gradle
dependencies {
    implementation("com.new.library:1.0.0") // ← Requires full rebuild
}
```

```bash
# Console output
Files changed: build.gradle
📦 Non-UI changes detected, triggering full Gradle build
Build started...
Build completed in 12.5s
✓ APK ready: app/build/outputs/apk/debug/app-debug.apk
```

### Debouncing

File changes are debounced by **100ms** to batch multiple rapid edits:

```
File Save #1 ────┐
File Save #2 ─────┤
File Save #3 ──────┤── 100ms ──> Trigger Build
                   │
            (Waiting period)
```

## Network Configuration

### Local Development

The dev server binds to **0.0.0.0** (all network interfaces) for maximum compatibility:

- **localhost:8765** - Access from same machine
- **192.168.x.x:8765** - Access from devices on same network
- **[your-ip]:8765** - Access from any network interface

### IP Detection

JetStart automatically detects your local network IP:

**Preferred:** 192.168.x.x (typical home/WiFi hotspot)
**Fallback:** First available non-internal IPv4 address

```typescript
// Automatic IP detection logic
function getLocalIP(): string {
  // 1. Check for 192.168.x.x addresses (home networks)
  // 2. Check for other non-internal IPv4
  // 3. Fallback to 'localhost'
}
```

**Override with custom host:**
```bash
jetstart dev --host 10.0.0.5
```

### Firewall Configuration

**Windows:**
```powershell
# Allow ports through Windows Firewall
New-NetFirewallRule -DisplayName "JetStart HTTP" -Direction Inbound -Protocol TCP -LocalPort 8765 -Action Allow
New-NetFirewallRule -DisplayName "JetStart WebSocket" -Direction Inbound -Protocol TCP -LocalPort 8766 -Action Allow
```

**macOS:**
```bash
# Add firewall rules (System Preferences → Security)
# Or use socketfilterfw:
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp node
```

**Linux (ufw):**
```bash
sudo ufw allow 8765/tcp
sudo ufw allow 8766/tcp
```

### WiFi Hotspot

For best connection stability, create a WiFi hotspot:

**Why hotspot?**
- Direct device-to-laptop connection
- No corporate firewall restrictions
- Stable IP addresses
- Lower latency

**Windows:** Settings → Network → Mobile Hotspot
**macOS:** System Preferences → Sharing → Internet Sharing
**Linux:** Network Manager → Create Hotspot

## Server Output Explained

### Typical Output

```bash
$ jetstart dev

Starting JetStart development server...

✓ Emulator deployment enabled
Starting JetStart Core server...
Injected server URL: ws://192.168.1.100:8766

✓ JetStart Core is running!
HTTP Server: http://192.168.1.100:8765
WebSocket Server: ws://192.168.1.100:8766
Session ID: a1b2c3
Session Token: xyz789

✓ JetStart dev server is running!

ℹ Local:    http://localhost:8765
ℹ Network:  http://192.168.1.100:8765
ℹ Project:  my-app

[QR Code displayed here]

ℹ Watching for file changes...
ℹ Press Ctrl+C to stop
```

### What Each Line Means

| Output | Explanation |
|--------|-------------|
| `Starting JetStart development server...` | CLI command initializing |
| `✓ Emulator deployment enabled` | Emulator detected and configured |
| `Injected server URL: ws://...` | BuildConfig updated with server URL |
| `HTTP Server: http://...` | REST API and APK download endpoint |
| `WebSocket Server: ws://...` | Real-time communication channel |
| `Session ID: a1b2c3` | Unique session identifier |
| `Session Token: xyz789` | Security token for this session |
| `Watching for file changes...` | File watcher active |

## Real-Time Features

### Hot Reload Events

When you save a UI file:

```bash
Files changed: MainActivity.kt
🚀 UI-only changes detected, using DSL hot reload
Parsing UI file: MainActivity.kt
DSL generated: 312 bytes
✓ UI hot reload sent in <100ms ⚡
```

**Timeline:**
1. **0ms** - File saved
2. **5-10ms** - Change detected
3. **10-30ms** - DSL parsed
4. **35-45ms** - WebSocket broadcast
5. **50-80ms** - Client receives update
6. **80-100ms** - UI re-rendered

### Build Events

When full rebuild is needed:

```bash
Files changed: strings.xml
📦 Non-UI changes detected, triggering full Gradle build
Build started
Executing Gradle: ./gradlew assembleDebug
Compiling Kotlin sources...
Processing resources...
Creating DEX files...
Packaging APK...
✓ Build completed in 14.2s
APK download URL: http://192.168.1.100:8765/download/app.apk
```

### Client Connection

When a device connects:

```bash
Client connected: device-abc123
Triggering initial build for connected client (session: a1b2c3)
Build started
[... build output ...]
✓ Build completed successfully: app/build/outputs/apk/debug/app-debug.apk
Initial deployment complete. Future builds will be sent via hot reload.
```

### Log Streaming

Live logs appear in real-time (use separate terminal for `jetstart logs`):

```bash
12:34:56 INFO [CORE] [Session] Client connected: device-abc123
12:34:57 DEBUG [BUILD] [Gradle] Starting incremental build
12:34:58 INFO [CLIENT] [UI] MainActivity rendered
12:35:00 WARN [NETWORK] [WebSocket] High latency detected: 150ms
```

## Troubleshooting

### Port Already in Use

**Symptom:**
```
✗ Error: Port 8765 is already in use
```

**Solutions:**

**1. Find process using port:**
```bash
# Windows
netstat -ano | findstr :8765

# macOS/Linux
lsof -i :8765
```

**2. Kill the process:**
```bash
# Windows
taskkill /PID <pid> /F

# macOS/Linux
kill -9 <pid>
```

**3. Use different port:**
```bash
jetstart dev --port 9000
```

### QR Code Won't Scan

**Symptom:** Camera can't read QR code in terminal

**Solutions:**

**1. Increase terminal font size:**
- Windows Terminal: `Ctrl + +`
- macOS Terminal: `⌘ + +`
- iTerm2: `⌘ + +`

**2. Maximize terminal window:**
- QR codes need space to render properly
- Full screen recommended

**3. Better lighting:**
- Ensure good lighting on screen
- Adjust screen brightness

**4. Clean camera lens:**
- Fingerprints reduce scan accuracy

**5. Use manual connection:**
```bash
jetstart dev --no-qr
# Then manually enter connection details in app
```

### Device Can't Connect

**Symptom:** Device shows "Connection failed" or "Cannot reach server"

**Common Causes & Solutions:**

**1. Different networks:**
- **Problem:** Laptop on WiFi, phone on cellular
- **Solution:** Connect both to same WiFi network

**2. Firewall blocking:**
- **Problem:** Firewall blocks ports 8765/8766
- **Solution:** Allow ports (see [Firewall Configuration](#firewall-configuration))

**3. VPN active:**
- **Problem:** VPN routes traffic elsewhere
- **Solution:** Disable VPN or use manual IP

**4. IP address mismatch:**
- **Problem:** Auto-detected wrong IP
- **Solution:** Manually specify IP:
  ```bash
  jetstart dev --host 192.168.1.100
  ```

**5. Corporate network isolation:**
- **Problem:** Network blocks device-to-device communication
- **Solution:** Create WiFi hotspot

### Hot Reload Not Working

**Symptom:** Save file, but device doesn't update

**Checks:**

**1. File watcher status:**
```bash
# Look for this in console:
ℹ Watching for file changes...
```

**2. File type supported:**
- ✓ `*.kt` files
- ✗ `*.java` files (not monitored)

**3. WebSocket connection:**
```bash
# Check for disconnection messages:
⚠ WebSocket connection lost
```

**4. Session expired:**
- Restart dev server
- Reconnect client

**5. Gradle sync needed:**
- Full rebuild required for certain changes
- Wait for build to complete

### File Watcher Not Detecting Changes

**Symptom:** Edit file, no "Files changed" message

**Solutions:**

**1. Check ignore patterns:**
```javascript
// File watcher ignores:
- build/
- .gradle/
- .idea/
- node_modules/
```

**2. Increase watch limit (Linux):**
```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

**3. Restart dev server:**
```bash
# Ctrl+C to stop
jetstart dev
```

**4. Check file permissions:**
```bash
ls -la app/src/main/java/com/example/MainActivity.kt
# Should be readable by current user
```

### WebSocket Connection Dropped

**Symptom:**
```
⚠ WebSocket connection lost
🔄 Attempting to reconnect...
```

**Causes:**
- Network instability
- Phone went to sleep
- IP address changed

**Solutions:**
- Client will auto-reconnect
- Keep phone screen on during development
- Use WiFi hotspot for stability

## Advanced Usage

### Environment Variables

Override defaults with environment variables:

```bash
# Custom port
JETSTART_PORT=9000 jetstart dev

# Disable QR code
JETSTART_NO_QR=true jetstart dev

# Debug mode
DEBUG=1 jetstart dev

# Custom host
JETSTART_HOST=10.0.0.5 jetstart dev
```

### CI/CD Integration

While dev server is primarily for local development, you can use it for automated testing:

```yaml
# .github/workflows/test.yml
- name: Start dev server
  run: |
    jetstart dev --port 8765 &
    DEV_PID=$!
    sleep 5  # Wait for server to start

- name: Run integration tests
  run: npm test

- name: Stop dev server
  run: kill $DEV_PID
```

### Multiple Projects

Run multiple dev servers simultaneously:

```bash
# Terminal 1: Project A
cd project-a
jetstart dev --port 8765

# Terminal 2: Project B
cd project-b
jetstart dev --port 8766

# Terminal 3: Project C
cd project-c
jetstart dev --port 8767
```

### Docker Development

Run dev server in Docker:

```dockerfile
FROM node:20

WORKDIR /app
COPY . .

RUN npm install -g @jetstart/cli

EXPOSE 8765 8766

CMD ["jetstart", "dev", "--host", "0.0.0.0"]
```

```bash
docker run -p 8765:8765 -p 8766:8766 -v $(pwd):/app jetstart-dev
```

## Performance Optimization

### Large Projects

For projects with many files:

**1. Exclude unnecessary directories:**

Create `.jetstartignore`:
```
# Ignore patterns
node_modules/
build/
.gradle/
.idea/
*.test.kt
test/
```

**2. Increase debounce time:**
```json
// jetstart.config.json
{
  "fileWatcher": {
    "debounceMs": 300  // Default: 100ms
  }
}
```

### Network Optimization

**1. Use WiFi hotspot instead of shared WiFi:**
- Lower latency
- More stable connection

**2. Keep devices close:**
- Signal strength affects WebSocket performance
- Ideal: &lt;3 meters

**3. Disable VPN:**
- VPN adds latency and routing complexity

## Best Practices

1. **Leave dev server running**
   - Start once, develop all day
   - Restart only when needed (Gradle changes, etc.)

2. **Use --emulator for testing**
   - Faster than physical device for quick checks
   - Automated APK deployment

3. **Monitor logs in separate terminal**
   ```bash
   # Terminal 1
   jetstart dev

   # Terminal 2
   jetstart logs --follow --source client
   ```

4. **Restart after Gradle changes**
   - Build configuration changes
   - Dependency additions
   - `Ctrl+C` then `jetstart dev`

5. **Use QR codes for initial setup**
   - Fastest connection method
   - Manual entry as fallback

6. **Keep phone awake**
   - Enable "Stay awake" in Developer Options
   - Prevents WebSocket disconnections

## Related Commands

- [jetstart build](./build.md) - Build production APKs
- [jetstart logs](./logs.md) - Stream application logs
- [jetstart android-emulator](./android-emulator.md) - Manage Android emulators
- [jetstart create](./create.md) - Create new projects

## See Also

- [Hot Reload Explained](../guides/hot-reload-explained.md) - Deep dive into hot reload system
- [Using QR Codes](../guides/using-qr-codes.md) - QR code connection guide
- [Working with Emulators](../guides/working-with-emulators.md) - Emulator setup
- [WebSocket Protocol](../architecture/websocket-protocol.md) - Technical protocol details
- [Connection Problems](../troubleshooting/connection-problems.md) - Network troubleshooting
