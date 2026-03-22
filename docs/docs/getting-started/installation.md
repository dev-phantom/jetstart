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
- **Kotlin compiler** (`kotlinc`) — required for the hot reload DEX pipeline

### Sample Output

```bash
$ jetstart install-audit

JetStart Installation Audit

Development Tools:
------------------------------------------
✓ Node.js        24.11.1    OK
✓ npm            11.6.2     OK
✓ Java/JDK       17.0.17    OK
⚠ Gradle         8.2.1      Version 8.2.1 is outdated (8.5.0 recommended)

Android SDK:
------------------------------------------
✓ Android SDK    Unknown    OK
✓ cmdline-tools  19.0       OK
✓ build-tools    34.0.0     OK
✓ platform-tools 1.0.41     OK
✓ emulator       36.3.10    OK

Android Platforms:
------------------------------------------
✓ API 34 (Target) Unknown    OK
✗ API 24 (Minimum) Not installed   Install with: sdkmanager "platforms;android-24"

Environment Variables:
------------------------------------------
⚠ JAVA_HOME      Not installed   JAVA_HOME environment variable not set
✓ ANDROID_HOME   Unknown         OK

Summary:
------------------------------------------
✓ 10 components OK
⚠ 2 warnings
✗ 1 error

⚠ Recommendation:
Run "jetstart create <project-name> --full-install" to install missing dependencies
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


### Installing Kotlin (Required for Hot Reload)

JetStart's hot reload pipeline compiles your changed `.kt` files using `kotlinc`. You must have Kotlin installed and `KOTLIN_HOME` set for hot reload to work.

**macOS (Homebrew):**
```bash
brew install kotlin
# KOTLIN_HOME is set automatically
```

**Linux (SDKMAN):**
```bash
sdk install kotlin
export KOTLIN_HOME=$HOME/.sdkman/candidates/kotlin/current
```

**Windows:**
1. Download the [Kotlin compiler](https://github.com/JetBrains/kotlin/releases/latest) (the `kotlin-compiler-*.zip` asset)
2. Extract to e.g. `C:\kotlinc`
3. Set environment variable: `KOTLIN_HOME=C:\kotlinc`
4. Add `%KOTLIN_HOME%\bin` to your `Path`

**Via Android Studio (if already installed):**
```bash
# The Kotlin compiler is bundled inside Android Studio
# Set KOTLIN_HOME to the bundled kotlinc:
export KOTLIN_HOME="/Applications/Android Studio.app/Contents/plugins/Kotlin/kotlinc"  # macOS
# Windows: %LOCALAPPDATA%\Android\Sdk\...\plugins\Kotlin\kotlinc
```

**Verify:**
```bash
kotlinc -version
# Should print: kotlinc-jvm 1.x.x (JRE ...)
```

:::tip
If `kotlinc` is in your system `PATH` (e.g. installed via Homebrew), JetStart will find it automatically. `KOTLIN_HOME` is only needed if `kotlinc` is not on your `PATH`.
:::

## Install Mobile Client App

To connect your Android device to the JetStart development server, you'll need to install the JetStart Client app on your device.

### Download Options

#### Option 1: Direct Download from Docs (Recommended)

Download the latest JetStart Client APK directly:

<a href="/downloads/jetstart-client.apk" download className="">
  📥 Download JetStart Client APK
</a>

**Quick Steps:**
1. Click the download button above on your Android device
2. Once downloaded, tap the APK file to install
3. Follow the installation steps below

#### Option 2: Download from GitHub Releases

The JetStart Client app is also available from GitHub Releases:

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

**Issue:** `jetstart: command not found` or `The term 'jetstart' is not recognized`

:::note PowerShell Users
If you see **"The command jetstart was not found, but does exist in the current location"**, it means you are in the project folder but the global command is not in your PATH. You can:
- Run the local script: `.\jetstart`
- Or fix your PATH to use the global command (recommended below)
:::

**Solution:**
1. **Find your npm global path:**
   ```bash
   npm config get prefix
   ```
   - **Windows:** Usually `%APPDATA%\npm` (e.g., `C:\Users\<User>\AppData\Roaming\npm`)
   - **macOS/Linux:** Often `/usr/local` or `~/.npm-global`

2. **Add to PATH:**
   - **Windows:**
     - Search for "Edit the system environment variables"
     - Click "Environment Variables"
     - Under "User variables", find `Path` and click "Edit"
     - Click "New" and add the path from step 1
     - Click OK to save
   - **macOS/Linux:**
     - Add this to your shell config (`.zshrc` or `.bashrc`):
       ```bash
       export PATH=$PATH:$(npm config get prefix)/bin
       ```

3. **Restart your terminal** for changes to take effect.

### Java Not Detected

**Issue:** Java is installed but JetStart doesn't detect it

**Solution:**
1. Verify Java installation: `java -version`
2. Check JAVA_HOME: `echo $JAVA_HOME`
3. Set JAVA_HOME to JDK installation directory

### Kotlin Compiler Not Found (hot reload fails)

**Issue:** `kotlinc not found` in `jetstart dev` output

**Solution:**
1. Install Kotlin: `brew install kotlin` (macOS) or `sdk install kotlin` (SDKMAN)
2. Set `KOTLIN_HOME` to your Kotlin installation directory
3. Verify: `kotlinc -version`

See the [Kotlin installation section](#installing-kotlin-required-for-hot-reload) above for platform-specific instructions.

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
