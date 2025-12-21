---
sidebar_position: 6
title: jetstart android-emulator
description: Manage Android Virtual Devices (AVDs)
---

# jetstart android-emulator

Interactive Android Virtual Device (AVD) management - create, start, stop, and delete emulators without Android Studio. Fully integrated with `jetstart dev` for automated deployment.

## Usage

```bash
jetstart android-emulator
```

**No options** - Interactive menu-driven interface

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

Shows all AVDs with status and details:

```
Available Android Virtual Devices:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  ✓ Pixel_7_API_34 (Running)
    - Device: Pixel 7
    - Target: Android 14 (API 34)
    - Based on: Android 14.0 x86_64

  ○ Pixel_5_API_30
    - Device: Pixel 5
    - Target: Android 11 (API 30)
    - Based on: Android 11.0 x86_64

  ○ Tablet_API_33
    - Device: Medium Tablet
    - Target: Android 13 (API 33)
```

**Status icons:**
- ✓ Green = Running
- ○ Gray = Stopped

### 2. Start Emulator

Interactive selection from stopped emulators:

```
Select emulator to start:
❯ Pixel_7_API_34 (Android 14)
  Pixel_5_API_30 (Android 11)
  Tablet_API_33 (Android 13)
```

**Process:**
1. Select emulator
2. Emulator boots (20-60 seconds)
3. Waits for system ready
4. Verifies ADB connection

**Output:**
```
Starting emulator...
✓ Emulator booted
✓ ADB connected
✓ System ready

Emulator running at: emulator-5554
```

### 3. Stop Emulator

Interactive selection from running emulators:

```
Select emulator to stop:
❯ Pixel_7_API_34 (Android 14)
```

**Shutdown:**
- Graceful shutdown via ADB
- Saves emulator state
- Closes emulator window

### 4. Create JetStart-Optimized Emulator

One-click creation with optimal settings:

```
Creating JetStart-optimized emulator...

Configuration:
  Name: JetStart_Pixel_7_API_34
  Device: Pixel 7
  API Level: 34 (Android 14)
  ABI: x86_64
  RAM: 2048 MB
  Storage: 2048 MB

Downloading system image...
[████████████████] 100% (652 MB)

Creating AVD...
✓ AVD created successfully

Would you like to start it now? (Y/n)
```

**Optimized for:**
- Fast boot time
- Hardware acceleration
- JetStart hot reload
- Minimal resource usage

### 5. Create Custom Emulator

Wizard-style creation:

**Step 1: AVD Name**
```
Enter AVD name: my-test-emulator

✓ Name is valid
```

**Step 2: Device Profile**
```
Select device profile:
❯ Pixel 7
  Pixel 7 Pro
  Pixel 5
  Nexus 5X
  Generic Phone
  Generic Tablet
```

**Step 3: API Level**
```
Select API level:
❯ API 34 (Android 14) - Recommended
  API 33 (Android 13)
  API 31 (Android 12)
  API 29 (Android 10)
  API 24 (Android 7.0) - Minimum
```

**Step 4: ABI (Architecture)**
```
Select ABI (architecture):
❯ x86_64 (Intel/AMD 64-bit)
  arm64-v8a (ARM 64-bit)
```

**Auto-detection:**
- Intel/AMD Macs → x86_64
- ARM Macs (M1/M2) → arm64-v8a

**Step 5: Download & Create**
```
Downloading system image (if needed)...
Creating AVD...
✓ AVD created: my-test-emulator
```

### 6. Delete Emulator

Interactive selection with confirmation:

```
Select emulator to delete:
❯ old-test-device (Android 11)
  unused-emulator (Android 10)

Are you sure you want to delete "old-test-device"? (y/N)
```

**Safety:**
- Cannot delete running emulators
- Requires confirmation
- Removes all associated files

## Integration with Dev Command

### Automatic Deployment

```bash
jetstart dev --emulator
```

**Flow:**
1. Prompts to select emulator (if multiple)
2. Starts emulator if not running
3. Waits for boot complete
4. Triggers initial APK build
5. Installs APK via ADB
6. Launches app
7. Future changes use hot reload

### Specify Emulator by Name

```bash
jetstart dev --emulator --avd Pixel_7_API_34
```

Skips selection, directly uses specified AVD.

## System Images

### Architecture Selection

**x86_64** (Intel/AMD)
- Fastest on Intel/AMD processors
- Best for development
- Requires hardware acceleration

**arm64-v8a** (ARM)
- For ARM Macs (M1/M2/M3)
- Native performance on ARM
- Some Intel Macs with Rosetta

### Google Play vs AOSP

**With Google Play:**
- Includes Play Store
- Google Play Services
- Certified by Google
- Cannot root

**AOSP (Default):**
- Open source
- No proprietary apps
- Can root with `-writable-system`
- Faster downloads

## Hardware Acceleration

### Required for Performance

**Windows:**
- Intel: HAXM (Hardware Accelerated Execution Manager)
- AMD: WHPX (Windows Hypervisor Platform)

**macOS:**
- Intel: Hypervisor Framework (built-in)
- ARM (M1/M2): Native virtualization

**Linux:**
- KVM (Kernel Virtual Machine)
- Requires `/dev/kvm` access

### Enable Hardware Acceleration

**Windows (HAXM):**
```powershell
# Download from Android SDK Manager
sdkmanager "extras;intel;Hardware_Accelerated_Execution_Manager"

# Install
C:\Android\extras\intel\Hardware_Accelerated_Execution_Manager\intelhaxm-android.exe
```

**Windows (WHPX):**
```powershell
# Enable Windows feature
Enable-WindowsOptionalFeature -Online -FeatureName HypervisorPlatform
```

**Linux (KVM):**
```bash
# Install KVM
sudo apt install qemu-kvm

# Add user to kvm group
sudo usermod -aG kvm $USER

# Verify
ls -la /dev/kvm
```

## Configuration

### AVD Location

**Default:** `~/.android/avd/`

**Contents:**
```
~/.android/avd/
├── Pixel_7_API_34.avd/
│   ├── config.ini
│   ├── hardware-qemu.ini
│   └── [system files]
└── Pixel_7_API_34.ini
```

### config.ini Options

```ini
# Essential settings
hw.ramSize=2048
hw.keyboard=yes
hw.gpu.enabled=yes
hw.gpu.mode=auto

# Camera
hw.camera.front=emulated
hw.camera.back=emulated

# Sensors
hw.sensors.orientation=yes
hw.sensors.proximity=yes

# Performance
disk.dataPartition.size=2048M
```

## Performance Optimization

### Resource Allocation

**RAM:**
- Minimum: 1024 MB
- Recommended: 2048 MB
- Max: 4096 MB (diminishing returns)

**CPU Cores:**
- Detected automatically
- Typically 2-4 cores

**Internal Storage:**
- Minimum: 2048 MB
- For large apps: 4096 MB+

### Boot Options

**Quick Boot (Snapshots):**
- Saves RAM state
- Boots in 3-5 seconds
- Default behavior

**Cold Boot:**
- Clean state every time
- Slower (20-60 seconds)
- Use for testing

## Troubleshooting

### Emulator Won't Start

**Symptom:**
```
✗ Failed to start emulator
```

**Checks:**

1. **Hardware acceleration:**
```bash
# Check if enabled
emulator -accel-check
```

2. **Virtualization in BIOS:**
- Restart computer
- Enter BIOS (F2/Del)
- Enable VT-x (Intel) or AMD-V (AMD)

3. **Conflicting hypervisors:**
- Cannot run HAXM + VirtualBox + Hyper-V simultaneously
- Choose one virtualization solution

4. **Disk space:**
```bash
df -h  # Linux/macOS
Get-PSDrive C | Select Used,Free  # Windows
```

### Black Screen

**Symptom:** Emulator boots but shows black screen

**Solutions:**

1. **Change GPU mode:**
```ini
# Edit config.ini
hw.gpu.mode=swiftshader_indirect
```

2. **Update graphics drivers:**
- Visit GPU manufacturer website
- Install latest drivers

3. **Disable GPU:**
```bash
emulator -avd Pixel_7_API_34 -gpu off
```

### Slow Performance

**Causes & Solutions:**

1. **No hardware acceleration:**
- Install HAXM/KVM
- Enable in BIOS

2. **Too much RAM allocated:**
- Reduce to 2048 MB

3. **Antivirus interference:**
- Add emulator to exclusions

4. **Multiple emulators running:**
- Stop unused emulators

### ADB Connection Issues

**Symptom:**
```
✗ ADB connection failed
```

**Solutions:**

1. **Restart ADB:**
```bash
adb kill-server
adb start-server
```

2. **Check ADB devices:**
```bash
adb devices
# Should show: emulator-5554 device
```

3. **Port conflict:**
```bash
# Emulator uses ports 5554, 5555
# Check for conflicts
netstat -ano | findstr :5554  # Windows
lsof -i :5554                  # macOS/Linux
```

## Platform-Specific Notes

### Windows

**Hyper-V Conflict:**
- HAXM incompatible with Hyper-V
- Use WHPX instead
- Or disable Hyper-V:
  ```powershell
  bcdedit /set hypervisorlaunchtype off
  ```

**WSL2:**
- Requires WHPX
- Cannot use HAXM

### macOS

**M1/M2/M3 Macs:**
- Use arm64-v8a system images
- Native virtualization (fast)
- No additional setup needed

**Intel Macs:**
- Use x86_64 images
- Hypervisor Framework automatic

**Security & Privacy:**
- Grant emulator terminal access
- Allow incoming connections

### Linux

**KVM Permissions:**
```bash
# Check group membership
groups

# Should include 'kvm'
# If not:
sudo usermod -aG kvm $USER
# Then log out and back in
```

**SELinux:**
```bash
# If using SELinux
sudo setenforce 0  # Temporarily disable
```

## Best Practices

1. **Create dedicated AVDs for testing**
   - Different API levels
   - Different screen sizes
   - Different configurations

2. **Use x86_64 when possible**
   - Fastest emulation
   - Best hardware support

3. **Allocate appropriate resources**
   - 2GB RAM standard
   - Don't over-allocate

4. **Keep system images updated**
```bash
sdkmanager --update
```

5. **Clean up unused emulators**
   - Save disk space
   - Easier management

6. **Use JetStart-optimized for development**
   - Pre-configured settings
   - Optimal performance

## Command-Line Alternative

For scripting, use `emulator` and `avdmanager` directly:

```bash
# List AVDs
avdmanager list avd

# Start emulator
emulator -avd Pixel_7_API_34

# Create AVD
avdmanager create avd \
  -n my-avd \
  -k "system-images;android-34;default;x86_64" \
  -d pixel_7

# Delete AVD
avdmanager delete avd -n my-avd
```

## Related Commands

- [jetstart dev](./dev.md) - Uses --emulator flag for auto-deployment
- [jetstart install-audit](./install-audit.md) - Checks emulator installation

## See Also

- [Working with Emulators](../guides/working-with-emulators.md) - Detailed guide
- [System Requirements](../getting-started/system-requirements.md) - Hardware requirements
- [Android SDK Issues](../troubleshooting/android-sdk-issues.md) - Troubleshooting
