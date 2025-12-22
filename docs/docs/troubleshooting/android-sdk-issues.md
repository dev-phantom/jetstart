---
title: Android SDK Issues
description: Problems related to Android environment
---

# Android SDK Issues

## "ANDROID_HOME not set"

**Cause**: Examples or scripts cannot find your Android SDK.

**Solution**:
Set the environment variable.
- **Windows**: `set ANDROID_HOME=C:\Users\YOUR_USER\AppData\Local\Android\Sdk`
- **macOS/Linux**: `export ANDROID_HOME=$HOME/Library/Android/sdk`

Add it to your PATH as well:
`platform-tools`, `cmdline-tools/latest/bin`, `emulator`.

## "Gradle build failed"

**Cause**: Often due to Java version mismatch or missing licenses.

**Solution**:
1. **Java Version**: JetStart requires JDK 17. Verify with `java -version`.
2. **Licenses**: Run `flutter doctor --android-licenses` (if you have Flutter) or use `sdkmanager --licenses` to accept all agreements.
3. **Clean Build**: Run `cd packages/client && ./gradlew clean` to reset the build state.
