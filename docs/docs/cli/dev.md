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
| `--web` | boolean | false | Open Web Emulator automatically |
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
   └─ Debounce changes (instant)

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
│ DEX Hot Reload   │              │  Gradle Build    │
│ (instant)      │              │  (10-30s)        │
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
2. Tap "Create Connection"
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
│ instant  │  │  Build  │
└─────────┘  └─────────┘
```

### Kotlin File Changes (Fast Path — DEX Hot Reload)

Files that trigger **DEX hot reload** (Kotlin → .class → DEX):
- `MainActivity.kt`
- `**/screens/*.kt`
- `**/components/*.kt`

**Performance:** `instant` from file save to device update

**Example:**
```kotlin
// Edit MainActivity.kt
@Composable
fun HelloScreen() {
    Text("Hello World") // Change this text
}
```

```bash
[Core] Files changed: NotesScreen.kt
[Core] 🔥 Kotlin files changed, using TRUE hot reload (DEX via WebSocket)
[Core] Hot reloading: NotesScreen.kt...
[Core] 🔥 Hot reload starting for: NotesScreen.kt
[Core] Compiling NotesScreen.kt...
[Core] Found bundled Compose compiler (Kotlin 2.0+)
[Core] Using Compose compiler plugin
[Core] Using argument file: C:\Users\PC\AppData\Local\Temp\jetstart-compile\1774108403280\kotlinc-args.txt
(node:24468) [DEP0190] DeprecationWarning: Passing args to a child process with shell option true can lead to security vulnerabilities, as the arguments are not escaped, only concatenated.
(Use `node --trace-deprecation ...` to show where the warning was created)
[Core] Compiled 8 class files
[Core] Compilation completed in 21061ms (8 classes)
[Core] ℹ️ No classes found in C:\Users\PC\Documents\test-app\app\src\main\java\com\jetstart\testapp\ui\NotesScreen.kt - using direct class hot reload
[Core] Generated 0 override classes
[Core] Generating DEX from 8 class files...
[Core] Generated DEX: 56748 bytes
[Core] DEX generated in 5493ms (56748 bytes)
✔ [Core] 🔥 Hot reload complete in 26570ms (compile: 21061ms, dex: 5493ms)
[Core] Sending DEX reload: 75664 base64 chars, 8 classes
[ConnectionManager] Broadcasting core:dex-reload to 0 connected clients
✔ [Core] Hot reload complete! (26554ms)
```

### Non-Kotlin Changes (Slow Path — Full Gradle Build)

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
[Core] Files changed: build.gradle
[Core] 📦 Build files changed, triggering Gradle build + ADB install
[Core] Build started
[Gradle] Using system Gradle (faster than wrapper)
[Gradle] Running: C:\Gradle\gradle-8.2.1\bin\gradle.bat assembleDebug --parallel --build-cache --configure-on-demand --daemon --console=plain
[Gradle] Working directory: C:\Users\PC\Documents\my-app
...

...
BUILD SUCCESSFUL in 2m 44s
36 actionable tasks: 18 executed, 18 from cache

[Gradle] Process exited with code: 0
[Gradle] Found APK at: C:\Users\PC\Documents\test-app\app\build\outputs\apk\debug\app-debug.apk (12.35 MB)
✔ [Core] Build completed in 166480ms
[Core] APK download URL: http://192.168.43.220:8765/download/app.apk
* daemon not running; starting now at tcp:5037
* daemon started successfully
[Core] ⏳ Devices found but not ready: 06148330AU135735 (unauthorized)
[Core] ℹ️  Device may need user authorization on the phone.
[Core] ℹ️  Auto-install will retry on the next file change.
✔ [Core] Build completed successfully: C:\Users\PC\Documents\test-app\app\build\outputs\apk\debug\app-debug.apk
```

### Debouncing

File changes are debounced by **instant** to batch multiple rapid edits:

```
File Save #1 ────┐
File Save #2 ────┤
File Save #3 ────┤── instant ──> Trigger Build
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

Starting JetStart development server...

[ADB] Found at: C:\Android\platform-tools\adb.exe
[Core] Starting JetStart Core server...
[Logs] Server listening on port 8767
[Core] Injected buildConfigFields into build.gradle
[Core] Injected server URL: ws://192.168.43.220:8766
[Core] [JsCompiler] kotlinc-js ready: kotlinc-js.bat
[Core] Found kotlinc at: C:\kotlinc\bin\kotlinc.bat
[Core] Found d8 at: C:\Android\build-tools\34.0.0\d8.bat (build-tools 34.0.0)
[Core] Using Android SDK: android-34
[Core] Added 242 transforms-3 JARs to classpath
[Core] Built static classpath with 242 entries + 1 project entries
[Core] 🔥 True hot reload enabled (DEX-based)
[Core] HTTP server listening on 0.0.0.0:8765
[Core] WebSocket server listening on port 8766

✔ [Core] JetStart Core is running!
[Core] HTTP Server: http://192.168.43.220:8765   
[Core] WebSocket Server: ws://192.168.43.220:8766
[Core] Session ID: YZj0l1Ms
[Core] Session Token: fMLoUwp6w3Cm

ℹ Emulator deployment not configured: deployer=false, packageName=null

✔ JetStart dev server is running!

ℹ Local:    http://localhost:8765
ℹ Network:  http://192.168.43.220:8765
ℹ Project:  test-app

Scan QR or connect manually:
▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄
█ ▄▄▄▄▄ █▀█ █▄   ▀▀▀▄▀██▄▀█ ▄▄▄▄▄ █
█ █   █ █▀▀▀█ ▄▀ ███▄ ▄█ ▄█ █   █ █
█ █▄▄▄█ █▀ █▀▀██▄▄▀ ▄▄ ▄███ █▄▄▄█ █
█▄▄▄▄▄▄▄█▄▀ ▀▄█ █ █▄▀ ▀▄█ █▄▄▄▄▄▄▄█
█▄ ▄  ▀▄ ▄▄▀▄▀▀▀▀▄ ▀▀▄█▄▄█ ▀ █▄▀ ▀█
█  ▄█▄▄▄▀▀█▄█▀ ▄ ▄████ ▄█▄█▄▄▀▄ █▀█
█▄ █ ▄█▄▀▄ ▄█▄█▄ ▀ █▀ ▀▀ █▀▀█▄ ▀▄ █
█▀▀▀█▄█▄ █▀█ ▄█▀█▀█▀▀  ▀▀▄ ▀ ██▀█▀█
█ ▄▄▄▄▄ █▄ ██▀ ▄ ▄▄▄█▀ ▄▄ █▄█ █ ▀▀█
█ █   █ █ ▄▄█▄█▄▄▀▄█▄▀▀▄█  ▄▄ ▄▀ ▀█
█ █▄▄▄█ █ ▄▄ ▄█▀  █▀█ ▀▄▀█   ▀▄▀███
█▄▄▄▄▄▄▄█▄▄▄▄█████▄▄▄█▄▄█▄███▄██▄██


ℹ IP: 192.168.43.220
ℹ Session: YZj0l1Ms
ℹ Token: fMLoUwp6w3Cm
ℹ Watching for file changes...
ℹ Press Ctrl+C to stop
```



### What Each Line Means

| Output | Explanation |
|--------|-------------|
| `Starting JetStart development server...` | CLI command initializing |
| `[ADB] Found at: ...` | ADB detected for auto-install support |
| `[Logs] Server listening on port 8767` | Log aggregation server started |
| `[Core] Injected buildConfigFields into build.gradle` | Server URL and session ID written into your app's `BuildConfig` |
| `[Core] Injected server URL: ws://...` | The WebSocket URL the app will connect to |
| `[Core] Found kotlinc at: ...` | Kotlin compiler located (required for hot reload) |
| `[Core] Found d8 at: ...` | Android DEX tool located (converts `.class` → `.dex`) |
| `[Core] Using Android SDK: android-34` | Target platform detected from your SDK |
| `[Core] 🔥 True hot reload enabled (DEX-based)` | All tools present — Live hot reload is active |
| `[Core] HTTP server listening on 0.0.0.0:8765` | REST API bound to all interfaces |
| `[Core] WebSocket server listening on port 8766` | Real-time communication channel open |
| `✔ [Core] JetStart Core is running!` | Core engine fully initialized |
| `[Core] Session ID / Token` | Unique session credentials for client pairing |
| `ℹ Emulator deployment not configured` | No `--emulator` flag; use QR code or manual connect |
| `Scan QR or connect manually:` | QR code rendered for the JetStart Client app |
| `ℹ Watching for file changes...` | File watcher active — save a `.kt` file to trigger hot reload |

## Real-Time Features

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
