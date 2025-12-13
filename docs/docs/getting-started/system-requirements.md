---
sidebar_position: 4
title: System Requirements
description: Hardware and software requirements for running JetStart
---

# System Requirements

This page outlines the hardware and software requirements for developing with JetStart.

## Supported Operating Systems

JetStart works on all major operating systems:

- **Windows** 10 or later
- **macOS** 11 (Big Sur) or later
- **Linux** - Most modern distributions (Ubuntu 20.04+, Fedora 34+, Arch, etc.)

## Software Requirements

### Required

These tools are **required** for JetStart to function:

| Tool | Minimum Version | Recommended Version | Purpose |
|------|----------------|---------------------|---------|
| **Node.js** | 18.0.0 | 20.0.0+ | Run JetStart CLI and server |
| **npm** | 9.0.0 | 10.0.0+ | Package management |
| **Java (JDK)** | 17.0.0 | 17.0.0 | Android build tools |
| **Android SDK** | API 24+ | API 34 | Android development |
| **Gradle** | 8.0.0 | 8.5.0+ | Build automation |

:::tip Auto-Installation
JetStart can automatically install missing dependencies! Run `jetstart create my-app --full-install` to let JetStart set everything up for you.
:::

### Optional

These tools enhance your development experience:

| Tool | Purpose |
|------|---------|
| **Android Studio** | Full IDE with emulator support |
| **VS Code** | Lightweight code editor |
| **Git** | Version control |
| **adb** | Android Debug Bridge (included with Android SDK) |

## Hardware Requirements

### Minimum

- **CPU:** Dual-core processor (2GHz+)
- **RAM:** 4 GB
- **Storage:** 10 GB free space
- **Network:** Wi-Fi or Ethernet connection

### Recommended

- **CPU:** Quad-core processor (3GHz+)
- **RAM:** 8 GB or more
- **Storage:** 20 GB free space (SSD preferred)
- **Network:** Fast Wi-Fi (5GHz) or Ethernet

:::info Why These Requirements?
JetStart runs a local development server and Gradle builds, which benefit from faster processors and more RAM. The storage requirement is mainly for the Android SDK and build cache.
:::

## Android SDK Requirements

### SDK Components

JetStart requires these SDK components (auto-installed with `--full-install`):

#### Platform Tools
- `platform-tools` - adb, fastboot

#### Build Tools
- `build-tools;34.0.0` or later

#### Android Platforms
- `platforms;android-34` - Target platform (Android 14)
- `platforms;android-24` - Minimum platform (Android 7.0)

#### Command Line Tools
- `cmdline-tools;latest` - SDK management

#### Emulator (Optional)
- `emulator` - Android Virtual Device support
- `system-images;android-34;google_apis;x86_64` - System image for AVD

### Environment Variables

Set these environment variables for JetStart to detect your Android SDK:

**Windows:**
```powershell
ANDROID_HOME=C:\Android
JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot
```

**macOS/Linux:**
```bash
export ANDROID_HOME=~/Android
export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## Android Device Requirements

### Physical Device

To use a physical Android device:

- **Android Version:** 7.0 (API 24) or later
- **Developer Options:** Enabled
- **USB Debugging:** Enabled (for USB connection)
- **Wi-Fi:** Connected to same network as development computer

### Android Emulator

For virtual device testing:

- **RAM:** Additional 2-4 GB for emulator
- **Virtualization:** Hardware virtualization enabled (Intel VT-x, AMD-V)
- **Graphics:** Hardware acceleration support

### Web Emulator

The built-in web emulator requires:

- **Modern Browser:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **WebSocket Support:** Enabled (default in modern browsers)

## Network Requirements

### Local Development

For development on the same Wi-Fi network:

- **Router:** Standard Wi-Fi router with DHCP
- **Ports:** Ports 8765 and 8766 available
- **Firewall:** Allow Node.js through firewall
- **Network Type:** Local network (not guest network)

### Port Requirements

JetStart uses these ports by default:

| Port | Protocol | Purpose | Configurable |
|------|----------|---------|--------------|
| 8765 | HTTP | Development server | Yes (`--port`) |
| 8766 | WebSocket | Real-time updates | Yes (auto-increments) |

:::warning Firewall Configuration
Make sure your firewall allows incoming connections on ports 8765 and 8766. JetStart will prompt you to allow access on first run.
:::

## Checking Your System

Run the installation audit to check if your system meets all requirements:

```bash
jetstart install-audit
```

### Sample Output

```bash
🔍 Auditing development environment...

Development Tools
┌──────────┬────────────┬──────────────┬────────┐
│ Tool     │ Required   │ Installed    │ Status │
├──────────┼────────────┼──────────────┼────────┤
│ Node.js  │ 18.0.0+    │ 20.11.0      │ ✓ OK   │
│ npm      │ 9.0.0+     │ 10.4.0       │ ✓ OK   │
│ Java     │ 17.0.0+    │ 17.0.9       │ ✓ OK   │
│ Gradle   │ 8.0.0+     │ 8.5.0        │ ✓ OK   │
└──────────┴────────────┴──────────────┴────────┘

Android SDK Components
┌────────────────────────┬────────────┬────────┐
│ Component              │ Installed  │ Status │
├────────────────────────┼────────────┼────────┤
│ cmdline-tools          │ Latest     │ ✓ OK   │
│ platform-tools         │ 34.0.5     │ ✓ OK   │
│ build-tools;34.0.0     │ 34.0.0     │ ✓ OK   │
│ platforms;android-34   │ 2          │ ✓ OK   │
│ platforms;android-24   │ 2          │ ✓ OK   │
└────────────────────────┴────────────┴────────┘

Environment Variables
┌──────────────────┬─────────────────────────┬────────┐
│ Variable         │ Value                   │ Status │
├──────────────────┼─────────────────────────┼────────┤
│ JAVA_HOME        │ C:\Program Files\...    │ ✓ OK   │
│ ANDROID_HOME     │ C:\Android              │ ✓ OK   │
└──────────────────┴─────────────────────────┴────────┘

✅ All requirements met!
```

## JSON Output

For automation or CI/CD, get machine-readable output:

```bash
jetstart install-audit --json
```

```json
{
  "timestamp": "2025-01-15T10:30:00.000Z",
  "status": "ok",
  "tools": {
    "node": {
      "required": "18.0.0",
      "installed": "20.11.0",
      "status": "ok"
    },
    "java": {
      "required": "17.0.0",
      "installed": "17.0.9",
      "status": "ok"
    }
  },
  "sdk": {
    "location": "C:\\Android",
    "components": [
      {"name": "platform-tools", "status": "installed"},
      {"name": "build-tools;34.0.0", "status": "installed"}
    ]
  },
  "summary": {
    "total": 10,
    "ok": 10,
    "warning": 0,
    "error": 0
  }
}
```

## Platform-Specific Notes

### Windows

- **PowerShell:** Use PowerShell 5.1+ or PowerShell Core 7+
- **PATH:** Add Android SDK and Java to system PATH
- **Admin Rights:** May be required for installing dependencies
- **Windows Defender:** Add Node.js to allowed apps

### macOS

- **Homebrew:** Recommended for installing dependencies
- **Xcode Command Line Tools:** Required for some build operations
- **Rosetta 2:** Required on Apple Silicon for x86_64 emulator images

### Linux

- **Package Manager:** Use system package manager for dependencies
- **KVM:** Required for hardware-accelerated Android emulator
- **udev Rules:** May need configuration for ADB device access
- **Libraries:** Install required graphics libraries for emulator

## Troubleshooting

### Node.js Version Issues

**Problem:** Wrong Node.js version

**Solution:**
```bash
# Install nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

# Install and use Node 20
nvm install 20
nvm use 20
```

### Java Not Found

**Problem:** JetStart can't find Java

**Solution:**
1. Install Java 17: `jetstart create test --full-install`
2. Set JAVA_HOME environment variable
3. Add Java bin directory to PATH
4. Restart terminal

### Android SDK Missing

**Problem:** Android SDK not detected

**Solution:**
1. Let JetStart install it: `jetstart create test --full-install`
2. Or manually download from [Android Developer site](https://developer.android.com/studio#command-tools)
3. Set ANDROID_HOME environment variable

## Next Steps

If your system meets all requirements:

1. [Install JetStart](./installation.md)
2. [Create your first project](./quick-start.md)
3. [Learn about CLI commands](../cli/overview.md)

If you're missing requirements:

1. Run `jetstart install-audit` to see what's missing
2. Use `jetstart create test --full-install` to auto-install
3. Check [Installation Guide](./installation.md) for manual installation
