---
title: Common Issues
description: Frequently encountered problems and their solutions
---

# Common Issues

## "Command not found: jetstart"

**Cause:** The CLI is not in your system PATH after global install.

**Solutions:**

1. Find your npm global prefix:
   ```bash
   npm config get prefix
   ```

2. Add the `bin` folder to PATH:
   - **Windows:** Add `%APPDATA%\npm` to your User PATH via System Environment Variables, then restart your terminal.
   - **macOS/Linux:** Add `export PATH=$PATH:$(npm config get prefix)/bin` to `~/.zshrc` or `~/.bashrc`.

3. If you see _"The command jetstart was not found, but does exist in the current location"_ in PowerShell, you are running the local script instead of the global one. Fix your PATH as above, or run `.\jetstart` as a temporary workaround.

---

## "WebSocket connection failed" / device shows "Connection failed"

**Cause:** Most commonly the device and development machine are on different networks, or a firewall is blocking the WebSocket port.

**Checklist:**

1. **Same network** — phone and laptop must be on the same Wi-Fi or hotspot. Mobile data will not work.

2. **Firewall** — allow inbound TCP on ports `8765` and `8766`:
   ```powershell
   # Windows
   New-NetFirewallRule -DisplayName "JetStart" -Direction Inbound -Protocol TCP -LocalPort 8765-8766 -Action Allow
   ```
   ```bash
   # macOS
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp node
   # Linux (ufw)
   sudo ufw allow 8765/tcp && sudo ufw allow 8766/tcp
   ```

3. **VPN active** — VPN tunnels re-route traffic and often prevent LAN device discovery. Disable VPN while developing, or use a hotspot.

4. **Wrong IP detected** — if `jetstart dev` printed the wrong LAN IP, override it:
   ```bash
   jetstart dev --host 192.168.1.100
   ```

5. **Corporate network** — some enterprise networks block device-to-device communication. Create a phone hotspot and connect your laptop to it instead.

---

## "kotlinc not found" / hot reload not working

**Cause:** JetStart cannot find the Kotlin compiler to run the hot reload pipeline.

**Solutions:**

1. Set `KOTLIN_HOME` to your Kotlin installation directory:
   ```bash
   export KOTLIN_HOME=/usr/local/kotlinc
   ```

2. On macOS with Homebrew:
   ```bash
   brew install kotlin
   ```

3. Install Kotlin through [sdkman](https://sdkman.io/):
   ```bash
   sdk install kotlin
   ```

4. If using Android Studio, set `KOTLIN_HOME` to the bundled Kotlin:
   ```
   KOTLIN_HOME=<Android Studio>/plugins/Kotlin/kotlinc
   ```

---

## "d8 not found" / DEX generation fails

**Cause:** Android build-tools are not installed or `ANDROID_HOME` is not set.

**Solutions:**

1. Set `ANDROID_HOME`:
   ```bash
   export ANDROID_HOME=~/Android/Sdk     # macOS/Linux
   set ANDROID_HOME=C:\Android           # Windows
   ```

2. Install build-tools via `sdkmanager`:
   ```bash
   sdkmanager "build-tools;34.0.0"
   ```

3. Run `jetstart install-audit` to get a full dependency check.

---

## "Cannot build classpath" / compilation fails with unresolved references

**Cause:** The Compose and AndroidX JARs that `kotlinc` needs are not in the Gradle cache.

**Solution:** Build the project with Gradle at least once to populate `~/.gradle/caches`:
```bash
./gradlew assembleDebug
```

After the Gradle build completes, `jetstart dev` will find all required JARs automatically.

---

## Every change triggers a full Gradle build (hot reload never fires)

**Cause:** The changed file is either not a `.kt` file, or it is being changed alongside a non-Kotlin file (resource, Gradle config).

**What to check:**

1. Look at the `jetstart dev` console output. You should see either:
   - `🔥 Hot reload starting for: MainActivity.kt` — hot reload is working
   - `Non-UI changes detected` — falling back to Gradle

2. Ensure you are editing `.kt` files and not `.xml` or `build.gradle` at the same time.

3. Check that the file is not under an ignored path (`build/`, `.gradle/`, `dist/`).

---

## QR code will not scan

**Cause:** Terminal font is too small, or the QR code is too dense.

**Solutions:**

1. Make the terminal window larger and increase font size (`Ctrl +` in most terminals).
2. Use the `--no-qr` flag and connect manually:
   ```bash
   jetstart dev --no-qr
   ```
   Then enter the IP, port, Session ID and Token shown in the terminal manually in the JetStart app.

---

## "Session mismatch" / device reconnects but is rejected

**Cause:** The Android app was installed during a previous `jetstart dev` session and has the old `sessionId` baked into its `BuildConfig`. The current server has a new session.

**Solution:** Rescan the QR code. The new QR code encodes the current session's credentials. Once the app reconnects successfully it will be updated for future connections.

---

## "Port already in use"

**Cause:** Another process is using port `8765` or `8766`.

**Solutions:**

1. Find and kill the process:
   ```bash
   # Windows
   netstat -ano | findstr :8765
   taskkill /PID <pid> /F

   # macOS/Linux
   lsof -i :8765
   kill -9 <pid>
   ```

2. Or use a different port:
   ```bash
   jetstart dev --port 9000
   ```

---

## App installs but immediately crashes

**Cause:** The app was built against a different `minSdkVersion` than your device, or there is a Kotlin version mismatch.

**Solutions:**

1. Verify your device is running Android 7.0 (API 24) or higher.
2. Run a clean Gradle build:
   ```bash
   jetstart clean
   jetstart build
   ```
3. Check your `app/build.gradle` for `minSdk` and ensure it matches the project template default (`24`).

---

## Logs server not receiving device logs (`jetstart logs` shows nothing)

**Cause:** The logs server runs on port `8767` and must be started as part of `jetstart dev`. If you run `jetstart logs` without an active dev session, there is nothing to connect to.

**Solutions:**

1. Make sure `jetstart dev` is running in another terminal.
2. Verify port `8767` is not blocked by your firewall.
3. Run with the `--follow` flag to wait for new entries:
   ```bash
   jetstart logs --follow
   ```

---

## Still stuck?

- Run `jetstart install-audit` for a full environment check
- Check [Connection Problems](./connection-problems.md) for network-specific issues
- Check [Build Errors](./build-errors.md) for Gradle and compilation errors
- Ask on [GitHub Discussions](https://github.com/dev-phantom/jetstart/discussions)

