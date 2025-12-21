---
sidebar_position: 5
title: jetstart install-audit
description: Audit development environment dependencies
---

# jetstart install-audit

Comprehensive audit of your development environment to verify all required tools and dependencies for JetStart are properly installed and configured. Essential for troubleshooting setup issues and CI/CD validation.

## Usage

```bash
jetstart install-audit [options]
```

## Quick Start

```bash
# Table output (human-readable)
jetstart install-audit

# JSON output (for CI/CD)
jetstart install-audit --json
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--json` | boolean | false | Output results in JSON format for CI/CD integration |

## What Gets Checked

### Development Tools

**Node.js** (v18.0.0+)
- Required for JetStart CLI
- Checks version compatibility
- Verifies npm is also installed

**npm** (v9.0.0+)
- Package manager for JetStart
- Required for dependencies
- Checks global installation capability

**Java/JDK** (v17.0.0+)
- Required for Gradle and Android builds
- Checks JDK (not just JRE)
- Verifies compilation capabilities

**Gradle** (v8.0.0+)
- Android build system
- Checks for wrapper or global install
- Validates Kotlin support

### Android SDK Components

**Android SDK**
- Base SDK installation
- ANDROID_HOME environment variable
- SDK licenses accepted

**Command Line Tools**
- SDK Manager (sdkmanager)
- AVD Manager (avdmanager)
- Package installer

**Build Tools**
- Version 34.0.0+
- Required for APK compilation
- DEX compilation support

**Platform Tools**
- ADB (Android Debug Bridge)
- Fastboot
- APK Analyzer

**Android Emulator**
- Emulator binary
- System image support
- Hardware acceleration

### Android Platforms

**API 34** (Target, Android 14)
- Recommended target platform
- Latest features
- Google Play services support

**API 24** (Minimum, Android 7.0)
- Minimum supported version
- Backwards compatibility
- Widest device coverage

### Environment Variables

**JAVA_HOME**
- Points to JDK installation
- Required for Gradle
- Validates path exists

**ANDROID_HOME** (or ANDROID_SDK_ROOT)
- Points to Android SDK
- Required for all Android tools
- Validates SDK structure

## Output Format

### Table Format (Default)

```bash
$ jetstart install-audit

  JetStart Installation Audit

Development Tools:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ Node.js                 v20.11.0        OK
  ✓ npm                     v10.4.0         OK
  ✓ Java/JDK                v17.0.8         OK
  ✓ Gradle                  v8.5.0          OK

Android SDK:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ Android SDK             Installed       OK
  ✓ Command Line Tools      9.0             OK
  ✓ Build Tools             34.0.0          OK
  ✓ Platform Tools          35.0.1          OK
  ✓ Android Emulator        33.1.24         OK

Android Platforms:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ API 34 (Target)         android-34      OK
  ✓ API 24 (Minimum)        android-24      OK

Environment Variables:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ JAVA_HOME               Set             OK
  ✓ ANDROID_HOME            Set             OK

Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ 13 components OK
```

### With Warnings/Errors

```bash
$ jetstart install-audit

Development Tools:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ Node.js                 v20.11.0        OK
  ✓ npm                     v10.4.0         OK
  ✗ Java/JDK                Not installed   ERROR
  ⚠ Gradle                  v7.6.0          Upgrade recommended (need 8.0+)

Android SDK:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✗ Android SDK             Not found       ERROR
  ✗ Command Line Tools      Not installed   ERROR

Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ✓ 2 components OK
  ⚠ 1 warning
  ✗ 4 errors

⚠ Recommendation:
  Run "jetstart create <project-name> --full-install" to install missing dependencies
```

### JSON Format

```bash
$ jetstart install-audit --json
```

```json
{
  "timestamp": "2025-01-15T12:00:00.000Z",
  "platform": "win32",
  "tools": {
    "node": {
      "name": "Node.js",
      "installed": true,
      "version": "v20.11.0",
      "status": "ok",
      "path": "/usr/local/bin/node"
    },
    "npm": {
      "name": "npm",
      "installed": true,
      "version": "v10.4.0",
      "status": "ok",
      "path": "/usr/local/bin/npm"
    },
    "java": {
      "name": "Java/JDK",
      "installed": false,
      "version": null,
      "status": "error",
      "message": "JDK 17+ required",
      "path": null
    }
  },
  "androidComponents": {
    "sdk": {
      "name": "Android SDK",
      "installed": true,
      "version": null,
      "status": "ok",
      "path": "C:\\Android"
    }
  },
  "environment": {
    "javaHome": {
      "name": "JAVA_HOME",
      "installed": false,
      "status": "error",
      "message": "Not set"
    },
    "androidHome": {
      "name": "ANDROID_HOME",
      "installed": true,
      "status": "ok",
      "value": "C:\\Android"
    }
  },
  "summary": {
    "ok": 4,
    "warning": 1,
    "error": 3
  }
}
```

## Installation Guides

### Install Node.js

**Windows:**
```powershell
# Using Chocolatey
choco install nodejs-lts

# Or download from nodejs.org
https://nodejs.org/
```

**macOS:**
```bash
# Using Homebrew
brew install node@20

# Or using nvm
nvm install 20
nvm use 20
```

**Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Fedora
sudo dnf install nodejs

# Or using nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 20
```

### Install Java JDK 17

**Windows:**
```powershell
# Using Chocolatey
choco install temurin17

# Set JAVA_HOME
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.8"
```

**macOS:**
```bash
# Using Homebrew
brew install openjdk@17

# Set JAVA_HOME (add to ~/.zshrc or ~/.bash_profile)
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install openjdk-17-jdk

# Set JAVA_HOME (add to ~/.bashrc)
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

### Install Android SDK

**Using JetStart (Recommended):**
```bash
jetstart create my-app --full-install
# Automatically installs Android SDK and dependencies
```

**Manual Installation:**

**Windows:**
```powershell
# Download Command Line Tools
https://developer.android.com/studio#command-line-tools-only

# Extract to C:\Android\cmdline-tools\latest

# Set ANDROID_HOME
setx ANDROID_HOME "C:\Android"
setx PATH "%PATH%;%ANDROID_HOME%\cmdline-tools\latest\bin"

# Install required components
sdkmanager "platform-tools" "platforms;android-34" "platforms;android-24" "build-tools;34.0.0"
```

**macOS/Linux:**
```bash
# Download Command Line Tools
cd ~/Downloads
wget https://dl.google.com/android/repository/commandlinetools-mac-latest.zip

# Extract
mkdir -p ~/Android/cmdline-tools
unzip commandlinetools-mac-latest.zip -d ~/Android/cmdline-tools
mv ~/Android/cmdline-tools/cmdline-tools ~/Android/cmdline-tools/latest

# Set ANDROID_HOME (add to ~/.zshrc or ~/.bashrc)
export ANDROID_HOME=$HOME/Android
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Install components
sdkmanager "platform-tools" "platforms;android-34" "platforms;android-24" "build-tools;34.0.0"
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Audit Environment

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v2

      - name: Install JetStart
        run: npm install -g @jetstart/cli

      - name: Run Audit
        run: jetstart install-audit --json > audit.json

      - name: Check Audit Results
        run: |
          STATUS=$(jq -r '.summary.error' audit.json)
          if [ "$STATUS" != "0" ]; then
            echo "Environment audit failed"
            jq '.' audit.json
            exit 1
          fi

      - name: Upload Audit Report
        uses: actions/upload-artifact@v3
        with:
          name: audit-report
          path: audit.json
```

### GitLab CI

```yaml
audit:
  stage: test
  image: node:20
  script:
    - npm install -g @jetstart/cli
    - jetstart install-audit --json > audit.json
  artifacts:
    paths:
      - audit.json
    when: always
```

## Troubleshooting

### Java Not Found

**Symptom:**
```
✗ Java/JDK    Not installed   ERROR
```

**Check:**
```bash
java -version
```

**Solutions:**
1. Install JDK 17+ (see [Install Java](#install-java-jdk-17))
2. Set JAVA_HOME environment variable
3. Ensure JDK (not just JRE) is installed

### Wrong Java Version

**Symptom:**
```
⚠ Java/JDK    v11.0.2    Upgrade to 17+ recommended
```

**Solution:**
```bash
# Install Java 17
# See platform-specific instructions above

# Verify installation
java -version

# Should show: openjdk version "17.0.x"
```

### Android SDK Not Found

**Symptom:**
```
✗ Android SDK    Not found    ERROR
```

**Checks:**
```bash
# Check ANDROID_HOME
echo $ANDROID_HOME  # macOS/Linux
echo %ANDROID_HOME%  # Windows

# Check if SDK exists
ls $ANDROID_HOME  # Should show platforms/, build-tools/, etc.
```

**Solutions:**
1. Install Android SDK (see [Install Android SDK](#install-android-sdk))
2. Set ANDROID_HOME environment variable
3. Accept SDK licenses: `sdkmanager --licenses`

### Missing Platform API

**Symptom:**
```
✗ API 34 (Target)    Not installed    ERROR
```

**Solution:**
```bash
sdkmanager "platforms;android-34"
```

### Build Tools Not Found

**Symptom:**
```
✗ Build Tools    Not installed    ERROR
```

**Solution:**
```bash
sdkmanager "build-tools;34.0.0"
```

### Environment Variable Not Set

**Symptom:**
```
✗ JAVA_HOME    Not set    ERROR
```

**Solutions:**

**Windows:**
```powershell
# System-wide
setx JAVA_HOME "C:\Program Files\Eclipse Adoptium\jdk-17.0.8"

# Verify
echo %JAVA_HOME%
```

**macOS/Linux:**
```bash
# Add to ~/.zshrc or ~/.bashrc
export JAVA_HOME=/path/to/jdk-17

# Reload
source ~/.zshrc  # or source ~/.bashrc

# Verify
echo $JAVA_HOME
```

## Best Practices

1. **Run before creating projects**
   ```bash
   jetstart install-audit
   jetstart create my-app
   ```

2. **Include in CI/CD pipeline**
   - Validate environment before builds
   - Catch setup issues early

3. **Save audit results**
   ```bash
   jetstart install-audit --json > audit-$(date +%Y%m%d).json
   ```

4. **Use --full-install for auto-setup**
   ```bash
   jetstart create my-app --full-install
   # Automatically installs missing dependencies
   ```

5. **Keep dependencies updated**
   ```bash
   # Update Node.js via nvm
   nvm install 20
   nvm use 20

   # Update Android SDK components
   sdkmanager --update
   ```

## Related Commands

- [jetstart create](./create.md) - Uses audit during project creation
- [jetstart dev](./dev.md) - Requires properly configured environment
- [jetstart build](./build.md) - Depends on build tools

## See Also

- [System Requirements](../getting-started/system-requirements.md) - Detailed requirements
- [Installation Guide](../getting-started/installation.md) - Step-by-step setup
- [Android SDK Issues](../troubleshooting/android-sdk-issues.md) - Troubleshooting
