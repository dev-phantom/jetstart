---
sidebar_position: 6
title: jetstart android-emulator
description: Manage Android Virtual Devices (AVDs)
---

# jetstart android-emulator

Interactive Android Virtual Device (AVD) management — create, start, stop, and delete emulators without Android Studio. Fully integrated with `jetstart dev --emulator` for automated deployment.

## Usage

```bash
jetstart android-emulator
```

**No options** — interactive menu-driven interface.

## Quick Start

```bash
# Launch interactive manager
jetstart android-emulator

# Follow prompts to:
# - List existing emulators
# - Start/stop emulators
# - Create new emulators
# - Delete emulators
```

## Interactive Menu

### Main Menu

```
JetStart Android Emulator Manager

What would you like to do?
❯ List existing emulators
  Start emulator
  Stop emulator
  ─────────────────────────
  Create JetStart-optimized emulator
  Create custom emulator
  Delete emulator
  ─────────────────────────
  Exit
```

### Navigation

- **Arrow keys**: Move selection
- **Enter**: Confirm choice
- **Ctrl+C**: Exit anytime

## Operations

### 1. List Existing Emulators

Shows all AVDs with running status:

```
Available Android Virtual Devices:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✓ JetStart-Pixel5-API34 (Running)
    - Device: Pixel 5
    - Target: Android 14 (API 34)
    - Based on: Android 14.0 x86_64

  ○ my-test-emulator
    - Device: Pixel 6
    - Target: Android 13 (API 33)
```

**Status icons:**
- ✓ Green = Running
- ○ Gray = Stopped

If no emulators are found, you'll be prompted to create a JetStart-optimized one.

### 2. Start Emulator

Select from stopped emulators:

```
Select emulator to start:
❯ JetStart-Pixel5-API34 (Android 14)
  my-test-emulator (Android 13)
```

The emulator launches in the background and boots. This may take 20–60 seconds.

### 3. Stop Emulator

Select from running emulators:

```
Select emulator to stop:
❯ JetStart-Pixel5-API34 (Android 14)
```

Uses `adb emu kill` for a graceful shutdown.

### 4. Create JetStart-Optimized Emulator

One-click creation with fixed settings:

| Setting | Value |
|---------|-------|
| **Name** | `JetStart-Pixel5-API34` |
| **Device** | Pixel 5 |
| **API Level** | 34 (Android 14) |
| **ABI** | `x86_64` (Intel/AMD) or `arm64-v8a` (ARM) — auto-detected |

If the system image isn't installed, it will be downloaded automatically via `sdkmanager`.

If the AVD already exists, the creation is skipped.

### 5. Create Custom Emulator

Wizard-style creation with four prompts:

**Step 1: AVD Name**
```
? Enter AVD name: my-test-emulator
```
Names can contain letters, numbers, hyphens, and underscores.

**Step 2: Device Profile**
```
? Select device profile:
❯ Pixel 5
  Pixel 6
  Pixel 8
  Nexus 5
```

**Step 3: API Level**
```
? Select API level:
❯ API 34 (Android 14) - Recommended
  API 33 (Android 13)
  API 31 (Android 12)
  API 29 (Android 10)
  API 24 (Android 7.0) - Minimum
```

**Step 4: ABI (Architecture)**
```
? Select ABI (architecture):
❯ x86_64 (Intel/AMD 64-bit)
  arm64-v8a (ARM 64-bit)
```

Auto-defaults to `arm64-v8a` on ARM machines (e.g. Apple M1/M2) and `x86_64` otherwise.

**Step 5: Automated Installation**
If the selected system image isn't installed, JetStart downloads it automatically via `sdkmanager` before creating the AVD:
```
✕ System image not installed
✕ Installing system image: system-images;android-33;google_apis;x86_64
✓ SDK licenses accepted
✓ system-images;android-33;google_apis;x86_64 installed
✓ AVD "my-test-emulator" created successfully
```

### 6. Delete Emulator

Select and confirm:

```
? Select emulator to delete: my-test-emulator (Google APIs (Google Inc.))
? Are you sure you want to delete "my-test-emulator"? Yes
✓ AVD "my-test-emulator" deleted
```

Deletion requires confirmation.

## Integration with Dev Command

### Automatic Deployment

```bash
jetstart dev --emulator
```

**Flow:**
1. Detects a running emulator
2. Triggers initial APK build
3. Installs APK via ADB
4. Launches app
5. Future file changes use hot reload

### Specify Emulator by Name

```bash
jetstart dev --emulator --avd JetStart-Pixel5-API34
```

Skips selection, directly targets the specified AVD.

## System Images

### Architecture Selection

| ABI | Best for | Notes |
|-----|----------|-------|
| `x86_64` | Intel/AMD processors | Fastest, requires hardware acceleration |
| `arm64-v8a` | ARM Macs (M1/M2/M3) | Native performance on ARM |

System images are downloaded as `system-images;android-{apiLevel};google_apis;{abi}` via `sdkmanager`.

## Hardware Acceleration

Hardware acceleration is **required** for usable emulator performance.

| Platform | Technology |
|----------|-----------|
| Windows (Intel) | HAXM |
| Windows (AMD) | WHPX (Windows Hypervisor Platform) |
| macOS (Intel) | Hypervisor Framework (built-in) |
| macOS (ARM M1/M2) | Native virtualization |
| Linux | KVM |

### Enable on Windows
```powershell
# For AMD / Hyper-V compatible systems
Enable-WindowsOptionalFeature -Online -FeatureName HypervisorPlatform
```

### Enable on Linux
```bash
sudo apt install qemu-kvm
sudo usermod -aG kvm $USER
# Log out and back in
```

## Troubleshooting

### Emulator Won't Start

1. **Check hardware acceleration:**
   ```bash
   emulator -accel-check
   ```
2. **Enable VT-x / AMD-V in BIOS** — restart, enter BIOS (F2/Del), enable virtualization
3. **Conflicting hypervisors** — cannot run HAXM + VirtualBox + Hyper-V simultaneously

### ADB Connection Issues

```bash
# Restart ADB
adb kill-server
adb start-server

# Verify device is listed
adb devices
# Should show: emulator-5554  device
```

### Black Screen

Try changing GPU mode:
```bash
emulator -avd JetStart-Pixel5-API34 -gpu swiftshader_indirect
```

## Best Practices

1. **Use JetStart-optimized emulator** for development — pre-configured for best results
2. **Use x86_64 when possible** — fastest emulation on Intel/AMD
3. **Keep system images updated** — `sdkmanager --update`
4. **Clean up unused emulators** — saves disk space

## Related Commands

- [jetstart dev](./dev.md) — uses `--emulator` flag for auto-deployment
- [jetstart install-audit](./install-audit.md) — checks emulator installation

## See Also

- [Working with Emulators](../guides/working-with-emulators.md) — detailed guide
- [System Requirements](../getting-started/system-requirements.md) — hardware requirements
- [Android SDK Issues](../troubleshooting/android-sdk-issues.md) — troubleshooting
