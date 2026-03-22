---
title: Android SDK Issues
description: Problems related to the Android SDK and build environment
---

# Android SDK Issues

## "ANDROID_HOME not set"

JetStart and Gradle cannot find the Android SDK.

**Fix — set the environment variable permanently:**

**Windows:**
1. Search "Edit the system environment variables" → Environment Variables
2. Under User variables, click New:
   - Variable name: `ANDROID_HOME`
   - Variable value: `C:\Android` (or wherever your SDK is)
3. Also add to the `Path` variable:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\cmdline-tools\latest\bin`
4. Restart your terminal

**macOS/Linux — add to `~/.zshrc` or `~/.bashrc`:**
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

Then reload:
```bash
source ~/.zshrc   # or source ~/.bashrc
```

**Common SDK locations:**

| Platform | Default path |
|---|---|
| Windows | `C:\Users\<User>\AppData\Local\Android\Sdk` |
| Windows (manual install) | `C:\Android` |
| macOS | `~/Library/Android/sdk` |
| Linux | `~/Android/Sdk` |

---

## "d8 not found" or "build-tools not installed"

`d8` is part of Android build-tools. JetStart needs it for the hot reload DEX pipeline.

**Fix:**
```bash
sdkmanager "build-tools;34.0.0"
```

Verify it was installed:
```bash
ls $ANDROID_HOME/build-tools/
# Should show at least one version folder, e.g. 34.0.0
```

---

## "android.jar not found" / classpath build fails

The Kotlin compiler needs `android.jar` from the SDK platforms directory.

**Fix:**
```bash
sdkmanager "platforms;android-34"
```

Verify:
```bash
ls $ANDROID_HOME/platforms/
# Should show: android-34 (or another version)
```

---

## Gradle Build Fails with "License not accepted"

```
Failed to install the following Android SDK packages as some licenses have not been accepted.
```

**Fix:**
```bash
sdkmanager --licenses
# Press 'y' to accept each license
```

Or non-interactively:
```bash
yes | sdkmanager --licenses
```

---

## "Gradle build failed" — Java version mismatch

JetStart requires **JDK 17**. Using JDK 8, 11, or 21 with certain Gradle/AGP versions causes incompatibilities.

**Check your Java version:**
```bash
java -version
# Should show: openjdk version "17.x.x"
```

**Install JDK 17:**

```bash
# macOS (Homebrew)
brew install --cask temurin@17

# Linux (Debian/Ubuntu)
sudo apt install openjdk-17-jdk

# Linux (SDKMAN)
sdk install java 17.0.9-tem
```

Download for Windows: [Eclipse Temurin 17](https://adoptium.net/temurin/releases/?version=17)

**Set JAVA_HOME:**
```bash
export JAVA_HOME=/path/to/jdk17   # macOS/Linux
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot   # Windows
```

---

## SDK Manager Not Found

```
'sdkmanager' is not recognized as an internal or external command
```

**Cause:** `cmdline-tools` is not installed or not in `PATH`.

**Fix — install command-line tools:**

1. Download from [developer.android.com/studio#command-tools](https://developer.android.com/studio#command-tools)
2. Extract to `$ANDROID_HOME/cmdline-tools/latest/`

Directory structure should be:
```
$ANDROID_HOME/
  cmdline-tools/
    latest/
      bin/
        sdkmanager
        avdmanager
```

3. Add to PATH:
```bash
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
```

---

## Emulator Hardware Acceleration Not Available

```
Your CPU does not support required features (VT-x or AMD-V)
```

**Windows — enable in BIOS:**
1. Restart and enter BIOS (usually F2, Del, or F12 during boot)
2. Find "Intel Virtualization Technology" (VT-x) or "AMD-V"
3. Enable it and save

**Windows — HAXM vs WHPX:**
- If Hyper-V is enabled, HAXM will not work. Use WHPX instead:
  ```powershell
  Enable-WindowsOptionalFeature -Online -FeatureName HypervisorPlatform
  ```

**Linux — enable KVM:**
```bash
# Install KVM
sudo apt install qemu-kvm

# Add current user to kvm group
sudo usermod -aG kvm $USER

# Log out and back in, then verify
ls -la /dev/kvm
```

---

## ADB Device Not Detected

```
adb: no devices/emulators found
```

**For physical devices:**
1. Enable **Developer Options**: Settings → About phone → tap "Build number" 7 times
2. Enable **USB Debugging**: Developer Options → USB Debugging
3. Connect via USB and accept the "Allow USB debugging" prompt on the device
4. Verify: `adb devices` should list the device

**For wireless ADB (JetStart --emulator):**
ADB wireless connection is handled automatically by JetStart. If it fails:
```bash
# Reset ADB
adb kill-server
adb start-server

# Manually connect
adb connect <device-ip>:5555
```

---

## Running `jetstart install-audit`

The fastest way to diagnose Android SDK issues is to run the built-in audit:

```bash
jetstart install-audit
```

This checks:
- Node.js version
- npm version
- Java/JDK version and `JAVA_HOME`
- Gradle version
- `ANDROID_HOME` presence
- Android SDK components (platform-tools, build-tools, platforms)

Use `--json` for machine-readable output suitable for CI/CD:
```bash
jetstart install-audit --json
```

