---
sidebar_position: 3
title: jetstart build
description: Build production Android APKs
---

# jetstart build

Build production-ready Android APK files with optional release optimization and signing. This command handles the entire build process from Kotlin compilation to final APK packaging.

## Usage

```bash
jetstart build [options]
```

## Quick Start

```bash
# Debug build (unsigned, debuggable)
jetstart build

# Release build (optimized, unsigned)
jetstart build --release

# Release build with signing
jetstart build --release --sign

# Custom output directory
jetstart build --output ./dist
```

## Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `-o, --output <path>` | string | `./build` | Output directory for APK files |
| `-r, --release` | boolean | false | Build release variant (optimized) |
| `--sign` | boolean | false | Sign the APK (requires keystore) |
| `--self-sign` | boolean | false | Auto-generate a test keystore and sign (not for Play Store) |
| `--bundle` | boolean | false | Build AAB (Android App Bundle) instead of APK |
| `--flavor <n>` | string | - | Build a specific product flavor |

## Build Types

### Debug Build (Default)

Debug builds are optimized for development and testing:

```bash
jetstart build
```

**Characteristics:**
- **Debuggable**: Can attach debugger
- **Unsigned**: Uses debug certificate
- **No obfuscation**: Code is readable
- **Larger size**: ~30-40% larger than release
- **Faster build**: No ProGuard/R8 optimization

**Use cases:**
- Local testing
- Internal QA
- Development debugging
- Emulator testing

**Output:**
```
build/outputs/apk/debug/app-debug.apk
```

### Release Build

Release builds are optimized for production distribution:

```bash
jetstart build --release
```

**Characteristics:**
- **Not debuggable**: Debugging disabled
- **Unsigned** (unless `--sign` flag used)
- **Obfuscated**: ProGuard/R8 minification
- **Smaller size**: 30-40% smaller than debug
- **Slower build**: Optimization takes time

**Use cases:**
- Play Store submission (with signing)
- Production deployment
- Public distribution
- Performance testing

**Output:**
```
build/outputs/apk/release/app-release-unsigned.apk
```

## Build Process

### Step-by-Step Flow

```
1. Project Validation
   ├─ Check for build.gradle
   ├─ Verify Android SDK installation
   └─ Validate package name and version

2. Dependency Resolution
   ├─ Download required libraries
   ├─ Resolve version conflicts
   └─ Cache dependencies

3. Kotlin Compilation
   ├─ Compile *.kt source files
   ├─ Generate Java bytecode
   └─ Process annotations

4. Resource Processing
   ├─ Compile XML layouts
   ├─ Process strings and drawables
   ├─ Generate R.java resource file
   └─ Merge manifests

5. DEX Conversion
   ├─ Convert Java bytecode to Dalvik
   ├─ Merge multiple DEX files
   └─ Optimize DEX bytecode

6. APK Packaging
   ├─ Combine DEX, resources, assets
   ├─ Compress into ZIP archive
   └─ Align bytecode (zipalign)

7. Signing (if --sign flag)
   ├─ Load keystore
   ├─ Sign APK with certificate
   └─ Verify signature

8. Output
   └─ Save APK to output directory
```

### Build Timeline

**Debug Build:**
```
Validation:      0.5s    ████
Dependencies:    2.0s    ████████████████
Compilation:     8.0s    ████████████████████████████████
Resources:       3.0s    ████████████
DEX:             4.0s    ████████████████
Packaging:       1.5s    ██████
────────────────────────────────────────
Total:          ~19s
```

**Release Build (with R8):**
```
Validation:      0.5s    ██
Dependencies:    2.0s    ████████
Compilation:    10.0s    ████████████████████████
Resources:       3.5s    ██████████
R8 Optimization: 12.0s   ████████████████████████████████
DEX:             5.0s    ████████████
Packaging:       2.0s    ████████
Signing:         1.0s    ████
────────────────────────────────────────
Total:          ~36s
```

## APK Signing

### Why Sign APKs?

Android requires all APKs to be digitally signed before installation:

- **Debug signing**: Automatic, uses debug keystore
- **Release signing**: Manual, uses your production keystore
- **Play Store**: Requires release signing

### Keystore Setup

Create a keystore for production signing:

```bash
keytool -genkey -v \
  -keystore my-release-key.jks \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -alias my-key-alias
```

**Interactive prompts:**
```
Enter keystore password: ********
Re-enter password: ********
What is your first and last name? John Doe
What is your name of your organizational unit? Development
What is the name of your organization? MyCompany Inc
What is the name of your City or Locality? San Francisco
What is the name of your State or Province? CA
What is the two-letter country code? US
Is CN=John Doe, OU=Development, O=MyCompany Inc, L=San Francisco, ST=CA, C=US correct? yes
```

### Keystore Configuration

Create `keystore.properties` in project root:

```properties
storeFile=path/to/my-release-key.jks
storePassword=myStorePassword
keyAlias=my-key-alias
keyPassword=myKeyPassword
```

**IMPORTANT: Add to .gitignore**
```gitignore
# Never commit keystore credentials!
keystore.properties
*.jks
*.keystore
```

### Configure build.gradle

Update `app/build.gradle`:

```gradle
android {
    // Load keystore properties
    def keystorePropertiesFile = rootProject.file("keystore.properties")
    def keystoreProperties = new Properties()

    if (keystorePropertiesFile.exists()) {
        keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
    }

    signingConfigs {
        release {
            storeFile keystoreProperties['storeFile'] ? file(keystoreProperties['storeFile']) : null
            storePassword keystoreProperties['storePassword']
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Signed Release Build

With keystore configured:

```bash
jetstart build --release --sign
```

**Output:**
```
✓ Project validated
✓ Kotlin compiled
✓ APK packaged
✓ APK signed

Build completed successfully!

Output: /path/to/project/build/outputs/apk/release/app-release.apk
Size: 3.8 MB
Type: RELEASE (signed)
```

## ProGuard/R8 Optimization

Release builds use R8 (ProGuard successor) for code optimization:

### What R8 Does

**1. Shrinking**: Removes unused code
```kotlin
// Before R8
class Util {
    fun used() { }
    fun unused() { }  // ← Removed by R8
}
```

**2. Obfuscation**: Renames classes/methods
```kotlin
// Before R8
class UserRepository {
    fun fetchUser(id: Int): User { }
}

// After R8
class a {
    fun b(c: Int): d { }
}
```

**3. Optimization**: Improves performance
- Inline methods
- Remove dead code
- Optimize control flow

### ProGuard Rules

Create `proguard-rules.pro`:

```proguard
# Keep public APIs
-keep public class * {
    public protected *;
}

# Keep Compose
-keep class androidx.compose.** { *; }

# Keep serialization models
-keep class com.example.app.models.** { *; }

# Keep WebSocket messages
-keepclassmembers class * {
    @com.google.gson.annotations.SerializedName <fields>;
}

# Keep enum names
-keepclassmembers enum * { *; }
```

### Debugging R8 Issues

If release build crashes but debug works:

**1. Check R8 logs:**
```
build/outputs/mapping/release/usage.txt    # Removed code
build/outputs/mapping/release/mapping.txt  # Name mappings
```

**2. Disable R8 temporarily:**
```gradle
buildTypes {
    release {
        minifyEnabled false  // ← Disable to test
    }
}
```

**3. Add specific keep rules:**
```proguard
# If specific class crashes
-keep class com.example.CrashingClass { *; }
```

## Build Variants & Flavors

### Product Flavors

Define different app versions in `build.gradle`:

```gradle
android {
    flavorDimensions "version"

    productFlavors {
        free {
            dimension "version"
            applicationIdSuffix ".free"
            versionNameSuffix "-free"
        }

        pro {
            dimension "version"
            applicationIdSuffix ".pro"
            versionNameSuffix "-pro"
        }
    }
}
```

**Build specific flavor:**
```bash
jetstart build --flavor pro --release
```

### Build Variants

Combinations of build types and flavors:

```
Build Types: debug, release
Flavors: free, pro

Variants:
- freeDebug
- freeRelease
- proDebug
- proRelease
```

## Build Cache

JetStart uses intelligent caching to speed up builds:

### How Caching Works

```
Build Request
     │
     ▼
┌─────────────┐
│ Cache Check │
└──────┬──────┘
       │
   ┌───┴───┐
   │ Hit?  │
   └───┬───┘
       │
   ┌───┴───────────┐
   │               │
  YES              NO
   │               │
   ▼               ▼
Return       Execute Build
Cached   ──────────┤
Result             │
                   ▼
              Cache Result
```

### Cache Key

Cache is based on:
- Project path
- Build configuration
- Source file hashes
- Gradle version

**Example:**
```
Cache Hit: Build completed in 0.2s (cached)
Cache Miss: Build completed in 18.5s
```

### Clear Cache

```bash
# Gradle cache
./gradlew clean

# JetStart cache
rm -rf ~/.jetstart/cache

# Full clean rebuild
./gradlew clean && jetstart build
```

## Incremental Builds

Gradle only rebuilds changed components:

**First build:**
```
✓ All modules compiled (18.5s)
```

**Subsequent build (small change):**
```
✓ Only changed module compiled (4.2s)
```

### Maximize Incremental Performance

**1. Organize into modules:**
```
app/
  ├─ core/           # Rarely changes
  ├─ data/           # Occasionally changes
  ├─ ui/             # Frequently changes
  └─ app/            # Entry point
```

**2. Avoid API changes:**
- Internal changes don't trigger downstream rebuilds
- Public API changes rebuild dependent modules

**3. Use Gradle daemon:**
```bash
# Keep daemon running
./gradlew --daemon
```

## CI/CD Integration

### GitHub Actions

```yaml
name: Build APK

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v2

      - name: Install JetStart
        run: npm install -g @jetstart/cli

      - name: Build Debug APK
        run: jetstart build

      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: app-debug
          path: build/outputs/apk/debug/app-debug.apk
```

### GitLab CI

```yaml
build_apk:
  image: circleci/android:api-34
  stage: build
  script:
    - npm install -g @jetstart/cli
    - jetstart build --release
  artifacts:
    paths:
      - build/outputs/apk/release/app-release-unsigned.apk
    expire_in: 1 week
```

### Release Signing in CI

**Secure approach using environment variables:**

```yaml
- name: Decode Keystore
  run: |
    echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > release.jks

- name: Create keystore.properties
  run: |
    echo "storeFile=../release.jks" >> keystore.properties
    echo "storePassword=${{ secrets.STORE_PASSWORD }}" >> keystore.properties
    echo "keyAlias=${{ secrets.KEY_ALIAS }}" >> keystore.properties
    echo "keyPassword=${{ secrets.KEY_PASSWORD }}" >> keystore.properties

- name: Build Signed Release
  run: jetstart build --release --sign

- name: Clean up keystore
  if: always()
  run: rm -f release.jks keystore.properties
```

## APK Distribution

### Google Play Store

**1. Build signed release:**
```bash
jetstart build --release --sign
```

**2. Create App Bundle (recommended):**
```bash
jetstart build --release --bundle
```

**3. Upload to Play Console:**
- Navigate to [Play Console](https://play.google.com/console)
- Select app → Production → Create new release
- Upload APK or AAB
- Complete store listing

### Alternative Distribution

**Firebase App Distribution:**
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Build and upload
jetstart build --release
firebase appdistribution:distribute \
  build/outputs/apk/release/app-release.apk \
  --app 1:1234567890:android:abcdef \
  --groups testers
```

**Direct Download:**
```bash
# Build APK
jetstart build --release

# Host on static server
python -m http.server 8000

# Share download link
http://your-server.com/app-release.apk
```

## Troubleshooting

### Build Fails with "Gradle not found"

**Symptom:**
```
✗ Error: Gradle wrapper not found
```

**Solution:**

**1. Check for gradlew:**
```bash
ls gradlew
```

**2. If missing, create wrapper:**
```bash
gradle wrapper --gradle-version 8.2
```

**3. Ensure executable:**
```bash
chmod +x gradlew
```

### Out of Memory Error

**Symptom:**
```
FAILURE: Build failed with an exception.
java.lang.OutOfMemoryError: Java heap space
```

**Solution:**

**Create/edit `gradle.properties`:**
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
```

### Dependency Resolution Failure

**Symptom:**
```
Could not resolve com.example:library:1.0.0
```

**Solutions:**

**1. Check repositories:**
```gradle
repositories {
    google()
    mavenCentral()
    // Add if needed:
    maven { url 'https://jitpack.io' }
}
```

**2. Force dependency version:**
```gradle
configurations.all {
    resolutionStrategy {
        force 'com.example:library:1.0.0'
    }
}
```

**3. Clear Gradle cache:**
```bash
rm -rf ~/.gradle/caches
./gradlew build --refresh-dependencies
```

### R8/ProGuard Crashes

**Symptom:** Release APK crashes, debug works fine

**Solution:**

**1. Check crash logs:**
```bash
adb logcat
```

**2. Add ProGuard keep rules:**
```proguard
-keep class com.example.CrashingClass { *; }
```

**3. Retrace stack trace:**
```bash
retrace.bat \
  build/outputs/mapping/release/mapping.txt \
  stacktrace.txt
```

### APK Signing Failure

**Symptom:**
```
✗ Error: Failed to sign APK
jarsigner: unable to open jar file
```

**Solutions:**

**1. Verify keystore path:**
```bash
ls -la path/to/keystore.jks
```

**2. Test keystore:**
```bash
keytool -list -v -keystore my-release-key.jks
```

**3. Check keystore.properties:**
```properties
storeFile=../my-release-key.jks  # Relative path
storePassword=correct-password
keyAlias=my-key-alias
keyPassword=correct-password
```

## Build Optimization

### Speed Up Builds

**1. Use Gradle Daemon:**
```properties
# gradle.properties
org.gradle.daemon=true
```

**2. Enable parallel builds:**
```properties
org.gradle.parallel=true
org.gradle.workers.max=4
```

**3. Enable build cache:**
```properties
org.gradle.caching=true
```

**4. Use configuration cache:**
```bash
./gradlew build --configuration-cache
```

**5. Modularize project:**
- Split into feature modules
- Enable faster incremental builds

### Reduce APK Size

**1. Enable R8 shrinking:**
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
    }
}
```

**2. Use WebP images:**
```bash
# Convert PNG to WebP
cwebp input.png -o output.webp
```

**3. Enable APK splits:**
```gradle
splits {
    abi {
        enable true
        reset()
        include 'arm64-v8a', 'armeabi-v7a'
    }
}
```

**4. Remove unused resources:**
```gradle
android {
    defaultConfig {
        resConfigs "en", "es"  // Only include needed languages
    }
}
```

## Performance Profiling

### Analyze Build Time

```bash
./gradlew build --profile
```

**Output:** `build/reports/profile/profile-<timestamp>.html`

**Shows:**
- Task execution times
- Configuration time
- Dependency resolution time
- Slowest tasks

### Analyze APK Size

```bash
./gradlew :app:bundleRelease

# Install bundletool
java -jar bundletool.jar get-size total \
  --bundle=app/build/outputs/bundle/release/app-release.aab
```

**Use Android Studio APK Analyzer:**
- Build → Analyze APK
- View size breakdown by component

## Best Practices

1. **Always test release builds**
   - R8 obfuscation can cause issues
   - Test on real devices before publishing

2. **Secure your keystore**
   - Never commit to git
   - Use CI/CD secrets for automation
   - Back up to secure location

3. **Version your builds**
   ```gradle
   defaultConfig {
       versionCode 1
       versionName "1.0.0"
   }
   ```

4. **Automate versioning**
   ```gradle
   def versionCodeValue = System.getenv("BUILD_NUMBER")?.toInteger() ?: 1
   versionCode versionCodeValue
   ```

5. **Use App Bundles for Play Store**
   - Smaller download size
   - Dynamic feature delivery
   - Automatic APK splits

6. **Cache dependencies in CI**
   ```yaml
   - uses: actions/cache@v3
     with:
       path: ~/.gradle/caches
       key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*') }}
   ```

## Related Commands

- [jetstart dev](./dev.md) - Development server with hot reload
- [jetstart create](./create.md) - Create new projects
- [jetstart install-audit](./install-audit.md) - Verify build dependencies

## See Also

- [Production Deployment](../guides/production-deployment.md) - Deployment guide
- [Build System Architecture](../architecture/build-system.md) - Technical details
- [Build Errors](../troubleshooting/build-errors.md) - Troubleshooting guide
