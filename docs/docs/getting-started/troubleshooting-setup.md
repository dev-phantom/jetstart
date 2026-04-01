---
sidebar_position: 5
title: Troubleshooting Setup
description: Solutions to common setup issues
---

# Troubleshooting Setup

Having trouble getting JetStart set up? This guide covers common installation and setup issues.

## Common Setup Issues

### Node.js Issues

#### Problem: Wrong Node.js Version

**Error:**
```bash
Error: JetStart requires Node.js 18.0.0 or higher
Current version: 16.14.0
```

**Solution:**

Use nvm (Node Version Manager) to install the correct version:

```bash
# Install nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install Node 20
nvm install 20
nvm use 20

# Verify
node --version  # Should show v20.x.x
```

### Java Issues

#### Problem: Java Not Found

**Error:**
```bash
Error: Java (JDK) not found
JetStart requires Java 17 or higher
```

**Solution:**

Let JetStart install Java automatically:
```bash
jetstart create test-project --full-install
```

Or install manually:
- **Windows:** Download [Eclipse Temurin JDK 17](https://adoptium.net/)
- **macOS:** `brew install openjdk@17`
- **Linux:** `sudo apt install openjdk-17-jdk`

After installation, set JAVA_HOME:
```bash
# Linux/macOS
export JAVA_HOME=/path/to/jdk-17
export PATH=$JAVA_HOME/bin:$PATH

# Windows
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17
```

### Android SDK Issues

#### Problem: Android SDK Not Found

**Error:**
```bash
Error: Android SDK not found
Please set ANDROID_HOME environment variable
```

**Solution:**

1. Let JetStart install it:
```bash
jetstart create test-project --full-install
```

2. Or manually set ANDROID_HOME:
```bash
# If you have Android Studio installed
export ANDROID_HOME=~/Library/Android/sdk  # macOS
export ANDROID_HOME=/usr/local/android-sdk  # Linux
set ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk  # Windows
```

#### Problem: SDK Components Missing

**Error:**
```bash
Warning: Missing SDK components
- build-tools;34.0.0
- platforms;android-34
```

**Solution:**

Install required components:
```bash
# Using sdkmanager
sdkmanager "build-tools;34.0.0"
sdkmanager "platforms;android-34"
sdkmanager "platform-tools"

# Or let JetStart handle it
jetstart create test-project --full-install
```

### Permission Issues

#### Problem: Permission Denied (npm)

**Error:**
```bash
npm ERR! code EACCES
npm ERR! syscall mkdir
npm ERR! path /usr/local/lib/node_modules/@jetstart
npm ERR! errno -13
```

**Solution:**

```bash
# Option 1: Use sudo (quick but not recommended)
sudo npm install -g @jetstart/cli

# Option 2: Fix npm permissions (recommended)
mkdir ~/.npm-global
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH

# Add to ~/.bashrc or ~/.zshrc
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc

# Now install without sudo
npm install -g @jetstart/cli
```

### Network Issues

#### Problem: npm Install Timeout

**Error:**
```bash
npm ERR! network timeout
npm ERR! network This is a problem related to network connectivity.
```

**Solution:**

1. Check internet connection
2. Try with increased timeout:
```bash
npm install -g @jetstart/cli --timeout=60000
```

3. Use a different npm registry:
```bash
npm install -g @jetstart/cli --registry=https://registry.npmjs.org/
```

### Platform-Specific Issues

#### Windows: Command Not Found

**Problem:** `jetstart` command not recognized after installation

**Solution:**

1. Restart your terminal/PowerShell
2. Check if npm global bin is in PATH:
```powershell
npm bin -g
# Should return something like: C:\Users\YourName\AppData\Roaming\npm
```

3. Add to PATH if missing:
   - Open "Environment Variables"
   - Edit "Path" in User Variables
   - Add the npm global bin path
   - Restart terminal

#### macOS: Rosetta 2 Issues (Apple Silicon)

**Problem:** x86_64 emulator images not working on M1/M2 Macs

**Solution:**

1. Install Rosetta 2:
```bash
softwareupdate --install-rosetta
```

2. Use ARM64 system images instead:
```bash
sdkmanager "system-images;android-34;google_apis;arm64-v8a"
```

#### Linux: KVM Permission Denied

**Problem:** Can't run Android emulator

**Error:**
```bash
/dev/kvm permission denied
```

**Solution:**

```bash
# Add user to kvm group
sudo usermod -a -G kvm $USER

# Restart or re-login for changes to take effect
```

## Verification Steps

After fixing issues, verify your setup:

### 1. Check JetStart Installation

```bash
jetstart --version
```

Should output the version number (e.g., `1.0.0`).

### 2. Run Installation Audit

```bash
jetstart install-audit
```

All items should show ✓ OK.

### 3. Create Test Project

```bash
jetstart create test-project --package com.test.app
cd test-project
```

Should create project without errors.

## Getting More Help

If you're still experiencing issues:

1. **Run verbose mode:**
   ```bash
   DEBUG=1 jetstart create test-project --verbose
   ```

2. **Check system requirements:**
   - [System Requirements](./system-requirements.md)

3. **Search existing issues:**
   - [GitHub Issues](https://github.com/dev-phantom/jetstart/issues)

4. **Ask for help:**
   - [GitHub Discussions](https://github.com/dev-phantom/jetstart/discussions)

5. **Report a bug:**
   - Include output from `jetstart install-audit --json`
   - Include full error message
   - Include operating system and versions

## Next Steps

Once setup is complete:

- [Create your first project](./quick-start.md)
- [Learn about CLI commands](../cli/overview.md)
- [Explore architecture](../architecture/overview.md)
