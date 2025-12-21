---
sidebar_position: 4
title: Working with Emulators
description: Master Android emulator workflows for JetStart development
---

# Working with Emulators

Complete guide to using Android emulators with JetStart - from creation to automated deployment and optimization for blazing-fast development.

## Why Use Emulators?

**Physical device advantages:**
- ✓ Real hardware performance
- ✓ Actual sensors (GPS, camera, etc.)
- ✓ True user experience

**Emulator advantages:**
- ✓ **No device needed** - develop anywhere
- ✓ **Instant deployment** - `jetstart dev --emulator`
- ✓ **Multiple configurations** - test different screen sizes/Android versions
- ✓ **Snapshot/restore** - save app state
- ✓ **Network simulation** - test offline scenarios
- ✓ **Faster iteration** - no USB cables/adb wireless setup

**Best of both worlds:** Use emulator for rapid development, physical device for final testing.

## Prerequisites

### System Requirements

**Minimum:**
- **RAM:** 8 GB (16 GB recommended)
- **CPU:** Intel VT-x / AMD-V support (hardware virtualization)
- **Disk:** 10 GB free space per emulator
- **OS:** Windows 10+, macOS 10.14+, Ubuntu 18.04+

**Check virtualization:**
```bash
# Windows (PowerShell)
Get-ComputerInfo | Select-Object -ExpandProperty HyperVRequirementVirtualizationFirmwareEnabled

# macOS
sysctl kern.hv_support

# Linux
egrep -c '(vmx|svm)' /proc/cpuinfo
# Output > 0 means supported
```

### Hardware Acceleration

**Required for acceptable performance** (<1s boot vs 5+ minutes)

**Windows:**
- **Intel:** Install [Intel HAXM](https://github.com/intel/haxm/releases)
- **AMD:** Enable WHPX (Windows Hypervisor Platform)

**macOS:**
- Built-in Hypervisor.framework (macOS 10.10+)
- No additional installation needed

**Linux:**
- KVM (Kernel Virtual Machine)
```bash
sudo apt install qemu-kvm libvirt-daemon-system
sudo usermod -aG kvm $USER
```

## JetStart Emulator Manager

JetStart includes built-in emulator management - no Android Studio required!

### Launch Manager

```bash
jetstart android-emulator
```

**Interactive menu:**
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

### Create JetStart-Optimized Emulator

**One-time setup (recommended for beginners):**

1. Run `jetstart android-emulator`
2. Select **"Create JetStart-optimized emulator"**
3. Wait 2-5 minutes for download and creation

**Configuration:**
```
Name: JetStart_Pixel_7_API_34
Device: Pixel 7
API Level: 34 (Android 14)
ABI: x86_64
RAM: 2048 MB
Storage: 2048 MB
GPU: auto
```

**Optimized for:**
- Fast boot time (~10 seconds)
- Hot reload performance
- Balanced resource usage
- JetStart development workflow

### Create Custom Emulator

**For advanced users:**

1. Run `jetstart android-emulator`
2. Select **"Create custom emulator"**
3. Choose configuration interactively:
   - Device (Pixel 7, Pixel 5, Tablet, etc.)
   - API level (24-34)
   - RAM (1024-8192 MB)
   - Storage (2048-8192 MB)

**Example:**
```
Device: Pixel 5
API Level: 30 (Android 11)
ABI: x86_64
RAM: 4096 MB
Storage: 4096 MB
Name: My_Custom_Pixel5
```

## Automated Deployment Workflow

### Quick Start

**1. Create emulator (one-time):**
```bash
jetstart android-emulator
# Select "Create JetStart-optimized emulator"
```

**2. Start emulator:**
```bash
jetstart android-emulator
# Select "Start emulator" → Choose your emulator
```

**3. Deploy app automatically:**
```bash
cd my-app
jetstart dev --emulator
```

**What happens:**
1. Detects running emulator automatically
2. Reads package name from `app/build.gradle`
3. Waits for client connection
4. Triggers initial APK build
5. Installs APK via ADB
6. Launches app
7. **Future changes use hot reload** (no reinstall!)

### Specify Emulator by Name

**Multiple emulators running?**

```bash
jetstart dev --emulator --avd JetStart_Pixel_7_API_34
```

**Workflow:**
```bash
# Terminal 1: Start specific emulator
jetstart android-emulator
# → Start emulator → JetStart_Pixel_7_API_34

# Terminal 2: Deploy to that emulator
cd my-app
jetstart dev --emulator --avd JetStart_Pixel_7_API_34
```

## Manual Emulator Management

### Using Android SDK Tools

**If you prefer command-line:**

**List emulators:**
```bash
emulator -list-avds
```

**Start emulator:**
```bash
emulator @JetStart_Pixel_7_API_34
```

**Start in background:**
```bash
emulator @JetStart_Pixel_7_API_34 -no-window &
```

**Stop emulator:**
```bash
adb -s emulator-5554 emu kill
```

### Integration with JetStart

**After starting manually, connect:**
```bash
# Start emulator manually
emulator @My_Emulator &

# Deploy JetStart app
cd my-app
jetstart dev --emulator
# Will detect the running emulator automatically
```

## Performance Optimization

### Emulator Settings

**Fast boot (recommended):**
```
AVD Manager → Edit → Show Advanced Settings
Boot option: Quick Boot
```

**Saves emulator state on exit → 2-3 second boot vs 20-30 seconds**

**Graphics acceleration:**
```
Graphics: Automatic (ANGLE/SwiftShader based on hardware)
```

**Host GPU provides 10-50x better graphics performance**

### Resource Allocation

**Recommended settings:**

| Use Case | RAM | CPU Cores | Storage |
|----------|-----|-----------|---------|
| Basic testing | 2048 MB | 2 | 2048 MB |
| JetStart dev (recommended) | 2048 MB | 4 | 2048 MB |
| Heavy apps/games | 4096 MB | 4 | 4096 MB |
| Multiple emulators | 1024 MB each | 2 each | 2048 MB each |

**Don't over-allocate:**
- Emulator RAM < 50% of host RAM
- CPU cores < 75% of host cores
- Leave resources for IDE, dev server, browser

### Startup Time Optimization

**Cold boot benchmark:**
```
Standard emulator: 60-90 seconds
JetStart-optimized: 10-15 seconds
Quick Boot enabled: 2-3 seconds
```

**Optimization checklist:**
- [x] Use x86_64 ABI (not ARM)
- [x] Enable hardware acceleration (HAXM/WHPX/KVM)
- [x] Enable Quick Boot
- [x] Allocate 2-4 GB RAM (not more)
- [x] Use SSD for Android SDK location
- [x] Close other VMs/emulators

## Common Workflows

### Workflow 1: Single Emulator Development

**Setup:**
```bash
# One-time: Create emulator
jetstart android-emulator
# → Create JetStart-optimized emulator

# One-time: Start emulator
jetstart android-emulator
# → Start emulator → JetStart_Pixel_7_API_34
```

**Daily development:**
```bash
cd my-app
jetstart dev --emulator

# Leave emulator running
# Edit code → Instant hot reload
# No manual deployment needed
```

### Workflow 2: Multiple Device Testing

**Setup:**
```bash
# Create multiple emulators
jetstart android-emulator
# → Create custom: Pixel_5_API_30
# → Create custom: Tablet_API_34
```

**Testing:**
```bash
# Terminal 1: Start first emulator
emulator @Pixel_5_API_30 &

# Terminal 2: Start second emulator
emulator @Tablet_API_34 &

# Terminal 3: Deploy to both
cd my-app
jetstart dev --emulator
# Prompts to select which emulator or deploys to first detected
```

### Workflow 3: Physical + Emulator Hybrid

**Best for:** Final testing on real hardware

```bash
# Development: Emulator (fast iteration)
jetstart dev --emulator

# Testing: Physical device (real performance)
jetstart dev
# Scan QR code with phone
```

## Troubleshooting

### Issue: "No emulators running"

**Symptoms:**
```
jetstart dev --emulator
✗ Error: No emulators detected
```

**Solutions:**

**1. Start emulator first:**
```bash
jetstart android-emulator
# → Start emulator → Choose your emulator
```

**2. Check emulator is actually running:**
```bash
adb devices
# Should show:
# emulator-5554  device
```

**3. Restart ADB:**
```bash
adb kill-server
adb start-server
adb devices
```

### Issue: "Emulator extremely slow"

**Symptoms:**
- Boot takes 5+ minutes
- UI lags/stutters
- Hot reload takes 10+ seconds

**Solutions:**

**1. Enable hardware acceleration:**

**Windows (Intel):**
```powershell
# Download and install Intel HAXM
# https://github.com/intel/haxm/releases
```

**Windows (AMD):**
```powershell
# Enable WHPX
Enable-WindowsOptionalFeature -Online -FeatureName HypervisorPlatform
```

**Linux:**
```bash
# Enable KVM
sudo modprobe kvm-intel  # or kvm-amd
lsmod | grep kvm  # Verify loaded
```

**2. Use x86_64 emulator (not ARM):**
```bash
# Check ABI
emulator -list-avds

# Re-create with x86_64 if needed
jetstart android-emulator
# → Delete old ARM emulator
# → Create new x86_64 emulator
```

**3. Reduce RAM allocation:**
```
4096 MB → 2048 MB
# Less is often faster (reduces swapping)
```

### Issue: "APK installation failed"

**Symptoms:**
```
✗ Installation failed: INSTALL_FAILED_INSUFFICIENT_STORAGE
```

**Solutions:**

**1. Increase emulator storage:**
```bash
# Edit emulator config
~/.android/avd/[emulator-name]/config.ini

# Change:
disk.dataPartition.size=2048M
# To:
disk.dataPartition.size=4096M
```

**2. Wipe emulator data:**
```bash
emulator @My_Emulator -wipe-data
```

**3. Delete and recreate emulator:**
```bash
jetstart android-emulator
# → Delete emulator → [name]
# → Create new emulator
```

### Issue: "Emulator won't start"

**Symptoms:**
- Black screen
- Crashes on startup
- Error: "Cannot launch AVD"

**Solutions:**

**1. Check virtualization enabled:**
```bash
# Windows (PowerShell as Admin)
Get-WindowsOptionalFeature -Online -FeatureName Microsoft-Hyper-V

# Must show: State = Enabled
```

**2. Conflicting software:**
- **Disable:** VMware, VirtualBox, Docker Desktop (using Hyper-V)
- **Or:** Use Android Emulator hypervisor driver (alternative)

**3. Corrupted emulator:**
```bash
# Delete and recreate
jetstart android-emulator
# → Delete → [name]
# → Create new
```

### Issue: "`jetstart dev --emulator` doesn't auto-deploy"

**Symptoms:**
- Emulator starts
- No APK installation
- No app launch

**Causes & Solutions:**

**1. Package name not found:**
```bash
# Check build.gradle has applicationId
# app/build.gradle:
android {
    defaultConfig {
        applicationId "com.jetstart.myapp"  // ← Required
    }
}
```

**2. build.gradle syntax error:**
```bash
# Test Gradle manually
./gradlew assembleDebug
# Fix any errors
```

**3. First connection required:**
- Emulator deployment triggers on **first client connection**
- Wait for JetStart app to connect via WebSocket
- Then APK builds and installs automatically

## Advanced Topics

### Snapshots

**Save emulator state:**
```bash
# While emulator running
adb emu avd snapshot save my_snapshot

# Restore later
adb emu avd snapshot load my_snapshot
```

**Use cases:**
- Save app in specific state for testing
- Quick return to clean slate
- Reproduce bugs consistently

### Network Simulation

**Test offline scenarios:**
```bash
# Disable network
adb shell svc wifi disable
adb shell svc data disable

# Enable network
adb shell svc wifi enable
adb shell svc data enable
```

**Throttle bandwidth:**
```
Emulator UI → Extended Controls → Cellular → Network type
Select: EDGE (slow), 3G, LTE
```

### Screen Recording

**Record emulator screen:**
```bash
adb shell screenrecord /sdcard/demo.mp4

# Stop recording (Ctrl+C)

# Pull video
adb pull /sdcard/demo.mp4
```

### Multiple Instances

**Run 2+ emulators simultaneously:**

```bash
# Terminal 1
emulator @Emulator_1 -port 5554 &

# Terminal 2
emulator @Emulator_2 -port 5556 &

# Check both running
adb devices
# emulator-5554  device
# emulator-5556  device
```

**Deploy to specific emulator:**
```bash
# Install to first emulator
adb -s emulator-5554 install app.apk

# Install to second emulator
adb -s emulator-5556 install app.apk
```

## Best Practices

### ✓ DO:

**Emulator management:**
- Keep 1-2 emulators for daily use
- Use Quick Boot for instant startup
- Close emulator when done (saves resources)
- Update system images periodically

**Development:**
- Use `jetstart dev --emulator` for automated deployment
- Keep emulator running during development
- Test on emulator first, physical device for final QA
- Use snapshots for consistent test scenarios

**Performance:**
- Allocate 2-4 GB RAM (not more)
- Enable hardware acceleration
- Use x86_64 ABI
- Close other resource-intensive apps

### ✗ DON'T:

**Avoid:**
- Creating 10+ emulators (use 2-3 max)
- Running multiple emulators simultaneously (unless testing)
- Allocating too much RAM (causes swapping)
- Using ARM emulators (extremely slow without ARM hardware)
- Keeping emulator running 24/7

**Don't rely on:**
- Emulator for GPS accuracy (use physical device)
- Emulator for camera testing (use physical device)
- Emulator for performance benchmarks (use physical device)

## Comparison: Emulator vs Physical Device

| Feature | Emulator | Physical Device |
|---------|----------|-----------------|
| **Setup time** | 5 min (one-time) | Instant (if you have one) |
| **Deployment** | Automatic | QR code scan |
| **Boot time** | 2-10 seconds | N/A (always on) |
| **Hot reload speed** | Same (<100ms) | Same (<100ms) |
| **Hardware sensors** | Simulated | Real |
| **Performance** | 70-90% native | 100% native |
| **Screen sizes** | Any | Fixed |
| **Android versions** | Any (API 24-34) | Fixed |
| **Network control** | Full simulation | Limited |
| **Cost** | Free | $200-$1000 |

## Next Steps

**Learn more:**
- [Creating First App](./creating-first-app.md) - Setup project with emulator
- [Android Emulator Command](../cli/android-emulator.md) - CLI reference
- [Debugging Tips](./debugging-tips.md) - Debug emulator apps
- [Performance Optimization](./performance-optimization.md) - Optimize workflow

**Troubleshooting:**
- [Common Issues](../troubleshooting/common-issues.md) - General problems
- [Android SDK Issues](../troubleshooting/android-sdk-issues.md) - SDK/emulator problems
