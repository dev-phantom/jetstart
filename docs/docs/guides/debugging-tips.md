---
sidebar_position: 5
title: Debugging Tips
description: Master debugging JetStart applications efficiently
---

# Debugging Tips

Essential debugging techniques, tools, and workflows for JetStart development. Learn how to diagnose issues quickly and keep your development momentum.

## Debug Workflow Overview

```
Issue Detected
     │
     ▼
┌─────────────────┐
│ Check Logs      │ ← jetstart logs
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Identify Source │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Apply Fix       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Verify Hot      │ ← instant update
│ Reload Works    │
└─────────────────┘
```

## Using JetStart Logs

### Stream All Logs

```bash
# Terminal 1: Run dev server
jetstart dev

# Terminal 2: Stream logs
jetstart logs
```

**Output:**
```
12:34:56 INFO [CLI] [Command] Starting dev server
12:34:57 INFO [CORE] [Server] HTTP server started on :8765
12:34:58 INFO [CORE] [WebSocket] WebSocket server ready on :8766
12:35:00 INFO [CLIENT] [Connection] Connected to server
12:35:01 DEBUG [CLIENT] [UI] MainActivity rendered in 45ms
```

### Filter by Log Level

```bash
# Errors only
jetstart logs --level error

# Warnings and errors
jetstart logs --level warn

# Everything (verbose)
jetstart logs --level verbose
```

### Filter by Source

```bash
# Client logs only
jetstart logs --source client

# Core server logs
jetstart logs --source core

# Build system logs
jetstart logs --source build
```

### Combine Filters

```bash
# Client errors only
jetstart logs --source client --level error

# Core warnings and errors
jetstart logs --source core --level warn

# Last 50 build logs
jetstart logs --source build --lines 50
```

## Common Issues & Solutions

### Issue: Hot Reload Not Working

**Symptoms:**
- Save file, no update appears
- Or full Gradle build triggers (20s) instead of hot reload (\instant)

**Diagnosis:**
```bash
jetstart logs --source core

# Look for:
# ✓ "🔥 Hot reload starting for: MainActivity.kt" = hot reload working
# ✗ "📦 Non-UI changes detected" = Full build (not hot reload)
```

**Solution 1: Separate UI and logic**
```kotlin
// ✗ BAD: Logic and UI mixed
@Composable
fun MyScreen() {
    var count by remember { mutableStateOf(0) }  // State = full build
    Text("Count: $count")
}

// ✓ GOOD: Pure UI only
@Composable
fun MyScreen() {
    Text("Hello World")  // hot reload works!
}
```

**Solution 2: Check file is in watched directories**
```
✓ app/src/main/java/MainActivity.kt
✓ app/src/main/java/screens/HomeScreen.kt
✗ src/utils/Helper.kt (outside watched path)
```

### Issue: Connection Failed

**Symptoms:**
- QR code scans, but "Connecting..." times out
- Manual connection fails
- Dev server shows no connection

**Diagnosis:**
```bash
# Check dev server running
jetstart dev
# Should show: "✓ JetStart dev server is running!"

# Check network
ipconfig   # Windows
ifconfig   # macOS/Linux
# Phone and computer IPs must match first 3 octets:
# Computer: 192.168.1.100 ✓
# Phone:    192.168.1.101 ✓
```

**Solutions:**

**1. Same network:**
```bash
# Connect both to SAME WiFi
# Or create mobile hotspot
```

**2. Firewall:**
```bash
# Windows
netsh advfirewall firewall add rule name="JetStart" dir=in action=allow protocol=TCP localport=8765-8767

# macOS
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node

# Linux
sudo ufw allow 8765:8767/tcp
```

**3. Restart dev server:**
```bash
# Ctrl+C to stop
jetstart dev
```

### Issue: Build Errors

**Symptoms:**
```
✗ Build failed: Compilation error in MainActivity.kt
```

**Diagnosis:**
```bash
jetstart logs --source build --level error

# Shows detailed Gradle/Kotlin errors:
# MainActivity.kt:42: Unresolved reference: Text
```

**Solutions:**

**1. Check imports:**
```kotlin
import androidx.compose.material3.Text  // ← Add if missing
```

**2. Clean build:**
```bash
cd my-app
./gradlew clean
jetstart build
```

**3. Check Gradle syntax:**
```gradle
// app/build.gradle
dependencies {
    implementation "androidx.compose.material3:material3:1.1.0"  // ← Ensure present
}
```

### Issue: Emulator Not Detected

**Symptoms:**
```bash
jetstart dev --emulator
✗ Error: No emulators detected
```

**Diagnosis:**
```bash
adb devices
# Should show: emulator-5554  device
# If empty, emulator not running
```

**Solutions:**

**1. Start emulator:**
```bash
jetstart android-emulator
# → Start emulator → Choose emulator
```

**2. Restart ADB:**
```bash
adb kill-server
adb start-server
adb devices
```

**3. Check emulator actually booted:**
- Emulator window should show Android home screen
- Wait 30-60 seconds after launching

### Issue: Hot Reload Compilation Fails

**Symptoms:**
```
WARN [CORE] [HotReload] Compilation failed: Unresolved reference: SomeClass
INFO [CORE] Falling back to full Gradle build...
```

**Cause:** The changed `.kt` file references a class that `kotlinc` cannot resolve from the cached classpath. This usually means a new dependency was added, or a class from another module changed.

**Solutions:**

1. Run a full Gradle build to refresh the classpath cache:
   ```bash
   ./gradlew assembleDebug
   ```
   After the Gradle build, `jetstart dev` will pick up any new JARs automatically.

2. If using a recently added dependency, make sure it was compiled into the Gradle cache first:
   ```bash
   ./gradlew dependencies
   ```

3. If you see consistent `kotlinc` failures on a file that should compile fine, check `KOTLIN_HOME` points to a compatible version:
   ```bash
   kotlinc -version
   # Should match or be compatible with your project's Kotlin version in build.gradle
   ```

## Debugging Tools

### ADB (Android Debug Bridge)

**Check connected devices:**
```bash
adb devices
```

**View logcat (Android system logs):**
```bash
adb logcat

# Filter by tag
adb logcat -s JetStart

# Clear logs
adb logcat -c
```

**Inspect app state:**
```bash
# Check if app installed
adb shell pm list packages | grep jetstart

# Check app permissions
adb shell dumpsys package com.jetstart.myapp | grep permission

# Force stop app
adb shell am force-stop com.jetstart.myapp
```

**File system access:**
```bash
# List app files
adb shell run-as com.jetstart.myapp ls /data/data/com.jetstart.myapp

# Pull file from device
adb pull /sdcard/Download/app.apk ./
```

### Chrome DevTools (WebSocket Debugging)

**Inspect WebSocket traffic:**

1. Open Chrome: `chrome://inspect`
2. Find your device/emulator
3. Click **"Inspect"**
4. Go to **Network** tab
5. Filter: **WS** (WebSocket)
6. See real-time messages:
   - `build-start`
   - `core:dex-reload` (compiled DEX bytecode)
   - `build-complete`

**Useful for:**
- Debugging connection issues
- Inspecting `core:dex-reload` DEX payloads and `core:js-update` messages
- Monitoring hot reload messages
- Checking session tokens

### Android Studio Logcat

**If you have Android Studio:**

1. View → Tool Windows → Logcat
2. Filter by package: `com.jetstart.myapp`
3. See app crashes, exceptions, logs

**Useful for:**
- Runtime exceptions
- Native crashes
- System-level errors

### JetStart CLI Verbosity

**Environment variable for debug logs:**
```bash
# Windows
set DEBUG=jetstart:*
jetstart dev

# macOS/Linux
DEBUG=jetstart:* jetstart dev
```

**Shows internal operations:**
```
jetstart:cli Starting dev command +0ms
jetstart:core Creating session +10ms
jetstart:core Starting HTTP server +5ms
jetstart:websocket Client connected +2s
jetstart:build File change detected +5s
jetstart:build Hot reload starting for: MainActivity.kt +2ms
```

## Debug Strategies

### Strategy 1: Isolate the Problem

**Narrow down scope:**

1. **Does it work in a new project?**
   ```bash
   npx jetstart create test-app
   cd test-app
   jetstart dev
   ```
   - Works → Issue is in your project code
   - Fails → Issue is in JetStart setup/environment

2. **Does it work with minimal code?**
   - Comment out all code
   - Add back piece by piece
   - Find which code triggers issue

3. **Does it work on different device?**
   - Physical device vs emulator
   - Different Android version
   - Different network

### Strategy 2: Binary Search

**For large codebases:**

1. Comment out 50% of code
2. Test if issue persists
3. If persists → Issue in remaining 50%
4. If gone → Issue in commented code
5. Repeat until found

**Example:**
```kotlin
@Composable
fun MyScreen() {
    Column {
        // Half 1
        Text("A")
        Text("B")

        // Half 2 (comment this out first)
        // Text("C")
        // Text("D")
    }
}
```

### Strategy 3: Check Git Diff

**What changed since it last worked?**

```bash
# See recent changes
git diff HEAD~5

# Checkout previous commit
git checkout HEAD~1

# Test if works
jetstart dev

# If works, issue introduced in last commit
```

### Strategy 4: Clean Slate

**Reset everything:**

```bash
# Stop dev server
# Ctrl+C

# Clean build
./gradlew clean

# Delete build artifacts
rm -rf build/
rm -rf app/build/
rm -rf .gradle/

# Clear JetStart cache
rm -rf .jetstart/

# Restart dev server
jetstart dev
```

## Best Practices

### ✓ DO:

**Logging:**
- Use `jetstart logs` in separate terminal
- Filter logs by source/level for focus
- Save error logs for issue reports

**Development:**
- Test changes incrementally
- Keep UI code separate from logic
- Use Git commits frequently (easy rollback)
- Test on both emulator and physical device

**Debugging:**
- Read error messages carefully
- Check documentation first
- Search GitHub issues
- Ask for help with complete error logs

### ✗ DON'T:

**Avoid:**
- Ignoring warnings (they become errors later)
- Making 10 changes before testing
- Debugging without logs
- Assuming network "just works"

**Don't:**
- Edit Gradle files without backing up
- Force push to main branch
- Delete .gradle folder while build running
- Test on single device only

## Debugging Checklist

When stuck, go through this checklist:

**Environment:**
- [ ] Node.js 18+ installed
- [ ] Java 17+ installed
- [ ] Android SDK installed
- [ ] Emulator/device available

**Network:**
- [ ] Dev server running (`jetstart dev`)
- [ ] Phone and computer on same WiFi
- [ ] Firewall allows ports 8765-8767
- [ ] IP address hasn't changed

**Project:**
- [ ] `jetstart.config.json` exists
- [ ] `app/build.gradle` has `applicationId`
- [ ] No syntax errors in code
- [ ] Dependencies installed (`npm install`)

**Logs:**
- [ ] No errors in `jetstart logs`
- [ ] No build failures
- [ ] Hot reload working (check logs)

**Connection:**
- [ ] QR code displays correctly
- [ ] Client shows "Connected"
- [ ] WebSocket connection established

## Getting Help

### 1. Check Documentation

- [CLI Reference](../cli/) - Command options
- [Architecture](../architecture/) - How things work
- [Troubleshooting](../troubleshooting/) - Common issues

### 2. Search GitHub Issues

```
https://github.com/phantom/jetstart/issues
```

Search for error message or symptoms

### 3. Create Issue Report

**Include:**
- JetStart version: `jetstart --version`
- Node version: `node --version`
- OS: Windows/macOS/Linux
- Complete error logs from `jetstart logs`
- Steps to reproduce
- Expected vs actual behavior

**Example:**
```markdown
## Bug Report

**Environment:**
- JetStart: 0.1.0
- Node: 18.17.0
- OS: Windows 11

**Issue:**
Hot reload not working - always triggers full build

**Steps to reproduce:**
1. `jetstart create my-app`
2. `jetstart dev`
3. Edit MainActivity.kt
4. Save file
5. See full build instead of hot reload

**Logs:**
```
12:34:56 INFO [CORE] [FileWatcher] Change detected: MainActivity.kt
12:34:56 INFO [CORE] 📦 Non-UI changes detected, triggering full Gradle build
```

**Expected:** Hot reload (instant)
**Actual:** Full Gradle build (20s)
```

## Related Documentation

**Learn more:**
- [Hot Reload Explained](./hot-reload-explained.md) - Understand the hot reload pipeline
- [Using QR Codes](./using-qr-codes.md) - Connection debugging
- [Working with Emulators](./working-with-emulators.md) - Emulator issues
- [Performance Optimization](./performance-optimization.md) - Speed improvements

**Troubleshooting:**
- [Common Issues](../troubleshooting/common-issues.md) - Frequent problems
- [Connection Problems](../troubleshooting/connection-problems.md) - Network issues
- [Build Errors](../troubleshooting/build-errors.md) - Gradle/build failures

**CLI Reference:**
- [jetstart logs](../cli/logs.md) - Log streaming command
- [jetstart dev](../cli/dev.md) - Development server
