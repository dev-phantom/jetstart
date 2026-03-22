---
title: Build Errors
description: Diagnosing and fixing Gradle and hot reload compilation errors
---

# Build Errors

## Hot Reload Compilation Errors

### "kotlinc not found"

JetStart cannot find the Kotlin compiler to run the hot reload pipeline.

**Fix:**
```bash
# Set KOTLIN_HOME
export KOTLIN_HOME=/usr/local/kotlinc          # macOS/Linux
set KOTLIN_HOME=C:\kotlinc                      # Windows

# Or install Kotlin system-wide
brew install kotlin                             # macOS
sdk install kotlin                              # sdkman
```

If you are using Android Studio, the bundled Kotlin is at:
```
<Android Studio>/plugins/Kotlin/kotlinc
```

Set `KOTLIN_HOME` to that path and restart your terminal.

### "d8 not found" / DEX generation failed

`d8` lives inside Android `build-tools`. JetStart searches `$ANDROID_HOME/build-tools/<latest>`.

**Fix:**
```bash
# Install build-tools via sdkmanager
sdkmanager "build-tools;34.0.0"

# Verify ANDROID_HOME is set
echo $ANDROID_HOME        # macOS/Linux
echo %ANDROID_HOME%       # Windows
```

### "Cannot build classpath" / Unresolved reference during hot reload

The Compose and AndroidX JARs that `kotlinc` needs are not in the Gradle module cache yet.

**Fix:** Run a full Gradle build at least once to populate `~/.gradle/caches`:
```bash
./gradlew assembleDebug
```

After that, `jetstart dev` will find all JARs automatically.

### Hot reload compiles but classes don't update on device

**Possible causes:**

1. **WebSocket disconnected** ΓÇö check the `jetstart dev` console for disconnect messages. Rescan the QR code and reconnect.
2. **Wrong `ANDROID_HOME`** ΓÇö the `d8` used to generate the DEX is incompatible with the device's Android version. Ensure `build-tools;34.0.0` is installed.
3. **Custom ClassLoader conflict** ΓÇö if the app has its own ClassLoader setup it may interfere. Check the app logs with `jetstart logs --source client`.

---

## Full Gradle Build Errors

### "Gradle not found"

```
Error: Gradle wrapper not found
```

**Fix:** Run from the project root directory (where `settings.gradle` lives). If the wrapper is missing:
```bash
gradle wrapper --gradle-version 8.5
chmod +x gradlew         # macOS/Linux
```

### Java version mismatch

```
error: source release 17 requires target release 17
```
or
```
Unsupported class file major version 61
```

**Fix:** Ensure JDK 17 is installed and `JAVA_HOME` points to it:
```bash
java -version           # Should show 17.x
echo $JAVA_HOME         # Should be the JDK 17 path
```

Install JDK 17 if needed:
```bash
# macOS
brew install --cask temurin@17

# Linux (Debian/Ubuntu)
sudo apt install openjdk-17-jdk

# Windows ΓÇö download Eclipse Temurin 17 from https://adoptium.net/
```

### "SDK location not found"

```
SDK location not found. Define a valid SDK location with an ANDROID_HOME environment variable or by setting the sdk.dir path in your project's local properties file.
```

**Fix:** Either set `ANDROID_HOME` or create `local.properties` in the project root:
```properties
sdk.dir=C\:\\Android
```

JetStart creates `local.properties` automatically if it detects the SDK but the file is missing. Run `jetstart install-audit` to confirm SDK detection.

### "Failed to install the following Android SDK packages"

Gradle needs SDK components that are not installed.

**Fix:** Accept licenses and install the missing components:
```bash
sdkmanager --licenses
sdkmanager "platforms;android-34" "build-tools;34.0.0"
```

### Out of memory during build

```
java.lang.OutOfMemoryError: Java heap space
```

**Fix:** Increase Gradle JVM heap in `gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
```

### Kotlin compilation error in source code

```
e: MainActivity.kt: (42, 5): Unresolved reference: SomeClass
```

This is a code error in your Kotlin source. Fix the Kotlin error and save again. JetStart will automatically retry the hot reload or Gradle build.

### Duplicate class error

```
Duplicate class kotlin.collections.jdk8... found in modules kotlin-stdlib and kotlin-stdlib-jdk8
```

**Fix:** Force Kotlin stdlib version in `build.gradle`:
```gradle
configurations.all {
    resolutionStrategy {
        force "org.jetbrains.kotlin:kotlin-stdlib:1.9.0"
    }
}
```

### R8/ProGuard crash (release build works, app crashes)

Debug APK works but release APK crashes at runtime.

**Fix:** Add ProGuard keep rules for the crashing class:
```proguard
-keep class com.example.app.CrashingClass { *; }
-keepclassmembers class com.example.app.** { *; }
```

Check the R8 mapping file for class name changes:
```
app/build/outputs/mapping/release/mapping.txt
```

---

## APK Signing Errors

### "keystore.properties missing or incomplete"

```
Error: keystore.properties missing or incomplete
```

**Fix:** Create `keystore.properties` in the project root:
```properties
storeFile=path/to/release.jks
storePassword=your-store-password
keyAlias=your-key-alias
keyPassword=your-key-password
```

Generate a keystore if you don't have one:
```bash
keytool -genkey -v -keystore release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias key
```

Alternatively, use `--self-sign` for testing (not for Play Store):
```bash
jetstart build --release --self-sign
```

### "App not installed" after installing release APK

The APK is unsigned or self-signed and Android is blocking installation.

**Fix:** For Play Store distribution use a proper keystore with `--sign`. For device testing use `--self-sign` which auto-generates a valid test certificate.

---

## Diagnosing Build Issues

### Stream build logs in real time

```bash
# In a second terminal while jetstart dev is running
jetstart logs --source build --level debug --follow
```

### Run Gradle directly for verbose output

```bash
./gradlew assembleDebug --info
./gradlew assembleDebug --stacktrace   # Full stack trace on error
```

### Clean and rebuild

```bash
jetstart clean
./gradlew clean
jetstart build
```

### Check environment

```bash
jetstart install-audit
```

This checks Node.js, npm, Java, Gradle, Android SDK, and environment variables in one command.

