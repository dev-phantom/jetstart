---
title: Common Issues
description: Frequently encountered problems and solutions
---

# Common Issues

## "Command not found: jetstart"

**Cause**: The CLI is not linked or installed in your path.

**Solution**:
Reinstall dependencies or link the package manually.
```bash
npm install
npm run build
cd packages/cli
npm link
```

## "WebSocket connection failed"

**Cause**: Firewall blocking port 8766 or device on different network.

**Solution**:
1. Ensure your computer and Android device are on the **same Wi-Fi network**.
2. Check if your firewall allows incoming connections on port 8766.
3. Try pinging your computer's IP from the Android device (if possible).

## "No device connected"

**Cause**: Android ADB not recognizing the device.

**Solution**:
1. Enable **USB Debugging** on your Android device.
2. Connect via USB cable first.
3. Run `adb devices` to verify connection.
