---
sidebar_position: 2
title: Installation
description: Install JetStart and set up your development environment
---

# Installation

Get JetStart up and running in minutes. This guide will walk you through installing JetStart and all required dependencies.

## Quick Install

Install JetStart globally using npm:

```bash
npm install -g @jetstart/cli
```

Or use it directly with npx (no installation required):

```bash
npx jetstart create my-app
```

:::tip Recommended
We recommend installing globally for the best experience. This allows you to use the `jetstart` command from anywhere.
:::

## Verify Installation

Verify that JetStart is installed correctly:

```bash
jetstart --version
```

You should see the version number printed to the console.

## Check Dependencies

JetStart requires several dependencies to work properly. Check what's installed and what's missing:

```bash
jetstart install-audit
```

This command will check for:

- **Node.js** (18.0.0+)
- **npm** (9.0.0+)
- **Java/JDK** (17.0.0+)
- **Gradle** (8.0.0+)
- **Android SDK**
- **Android SDK Components**

### Sample Output

```bash
$ jetstart install-audit

🔍 Auditing development environment...

Development Tools
┌──────────┬────────────┬──────────────┬────────┐
│ Tool     │ Required   │ Installed    │ Status │
├──────────┼────────────┼──────────────┼────────┤
│ Node.js  │ 18.0.0+    │ 20.11.0      │ ✓ OK   │
│ npm      │ 9.0.0+     │ 10.4.0       │ ✓ OK   │
│ Java     │ 17.0.0+    │ Not found    │ ✗ ERR  │
│ Gradle   │ 8.0.0+     │ 8.5.0        │ ✓ OK   │
└──────────┴────────────┴──────────────┴────────┘

⚠️  Missing dependencies detected
```

## Install Missing Dependencies

### Installing Java (JDK 17)

JetStart can help you install Java automatically:

```bash
jetstart create my-app --full-install
```

The `--full-install` flag will:
1. Detect missing dependencies
2. Offer to install them automatically
3. Set up environment variables

#### Manual Installation

If you prefer to install Java manually:

**Windows:**
1. Download [Eclipse Temurin JDK 17](https://adoptium.net/)
2. Run the installer
3. Add `JAVA_HOME` to environment variables

**macOS:**
```bash
brew install openjdk@17
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt install openjdk-17-jdk

# Fedora/RHEL
sudo dnf install java-17-openjdk-devel

# Arch
sudo pacman -S jdk17-openjdk
```

### Installing Android SDK

JetStart can install Android SDK automatically during project creation:

```bash
jetstart create my-app --full-install
```

#### Manual Installation

**Windows:**
1. Download [Android Command Line Tools](https://developer.android.com/studio#command-tools)
2. Extract to `C:\Android\cmdline-tools\latest`
3. Set `ANDROID_HOME=C:\Android` environment variable

**macOS/Linux:**
```bash
# Download command line tools
mkdir -p ~/Android/cmdline-tools
cd ~/Android/cmdline-tools
wget https://dl.google.com/android/repository/commandlinetools-[OS]-[VERSION]_latest.zip
unzip commandlinetools-*.zip
mv cmdline-tools latest

# Add to .bashrc or .zshrc
export ANDROID_HOME=~/Android
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## Install Mobile Client App

To connect your Android device to the JetStart development server, you'll need to install the JetStart Client app on your device.

### Download from GitHub Releases

The JetStart Client app is available as an Android APK from GitHub Releases:

1. **Visit GitHub Releases:**
   - Go to [https://github.com/dev-phantom/jetstart/releases](https://github.com/dev-phantom/jetstart/releases)
   - Find the latest release (e.g., v1.2.0)
   - Download the APK file (e.g., `jetstart-client-v1.2.0.apk`)

2. **Transfer to Device:**
   - Download directly on your Android device, or
   - Transfer the APK file from your computer to your device

### Installation Steps

1. **Enable Unknown Sources** (if needed):
   - Settings → Security → Enable "Install unknown apps" or "Unknown sources"
   - Or allow your browser/file manager to install apps

2. **Disable Play Protect** (required):
   :::warning Important
   Since the JetStart Client app is not yet available on the Google Play Store, Android's Play Protect may block the installation. You'll need to temporarily disable Play Protect.
   :::

   **Quick Steps:**
   - Settings → Security → Google Play Protect
   - Tap Settings (gear icon)
   - Toggle off "Scan apps with Play Protect"
   - Confirm the change

   See [Client App Documentation](../packages/client.md#disabling-play-protect) for detailed instructions.

3. **Install the APK:**
   - Tap the downloaded APK file
   - Tap "Install" when prompted
   - Grant permissions (Camera, Install packages) when requested

4. **Re-enable Play Protect** (optional but recommended):
   - After installation, you can re-enable Play Protect for security

### Platform Support

**Supported:**
- ✅ Android 7.0+ (API 24+)
- ✅ Android APK format

**Not Supported:**
- ❌ iOS devices
- ❌ Android versions below 7.0

### Troubleshooting Installation

**Issue: "Install blocked" or "App not installed"**

**Solutions:**
- Ensure Play Protect is disabled (see above)
- Enable "Install from unknown sources" in Settings
- Check device storage space
- Try downloading the APK again

**Issue: "Play Protect warning"**

**Solution:**
- The app is safe - it's open source and distributed via GitHub
- Follow the Play Protect disabling steps above

For more details, see the [Client App Documentation](../packages/client.md).

## Installation Modes

JetStart offers different installation modes based on your needs:

### Interactive Mode (Default)

```bash
jetstart create my-app
```

- Prompts you for each missing dependency
- Lets you choose what to install
- Provides installation guidance

### Full Automated Mode

```bash
jetstart create my-app --full-install
```

- Installs all missing dependencies automatically
- No prompts or user interaction
- Fastest way to get started

### Skip Mode

```bash
jetstart create my-app --skip-install
```

- Skips all dependency checks
- Assumes you have everything installed
- Useful for experienced developers

## Updating JetStart

Keep JetStart up to date to get the latest features and bug fixes:

```bash
npm update -g @jetstart/cli
```

Check what version you're running:

```bash
jetstart --version
```

## Uninstalling

To remove JetStart from your system:

```bash
npm uninstall -g @jetstart/cli
```

## System-Wide Configuration

JetStart looks for configuration in these locations (in order):

1. Project-level: `jetstart.config.json` in project root
2. User-level: `~/.jetstart/config.json`
3. Environment variables: `JETSTART_*` prefix

Example `~/.jetstart/config.json`:

```json
{
  "defaultPort": 8765,
  "logLevel": "info",
  "autoOpenBrowser": true,
  "enableQRCode": true
}
```

## Troubleshooting Installation

### npm Install Fails

**Issue:** Permission denied during global install

**Solution:**
```bash
# Option 1: Use sudo (Linux/macOS)
sudo npm install -g @jetstart/cli

# Option 2: Configure npm to use different directory
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

### Command Not Found

**Issue:** `jetstart: command not found` after installation

**Solution:**
1. Check npm global bin path: `npm bin -g`
2. Add it to your PATH environment variable
3. Restart your terminal

### Java Not Detected

**Issue:** Java is installed but JetStart doesn't detect it

**Solution:**
1. Verify Java installation: `java -version`
2. Check JAVA_HOME: `echo $JAVA_HOME`
3. Set JAVA_HOME to JDK installation directory

## Recommended Tools
 
### Kotlin Language Server for VS Code
 
If you are developing your Android client using VS Code, we highly recommend installing the **Kotlin Language Server** extension for syntax highlighting, code completion, and diagnostics.
 
[**Download Kotlin VS Code Extension**](https://github.com/Kotlin/kotlin-lsp)
 
## Next Steps

Now that JetStart is installed, you're ready to:

1. [Create your first project](./quick-start.md)
2. [Learn about system requirements](./system-requirements.md)
3. [Explore CLI commands](../cli/overview.md)

Happy coding! 🚀
