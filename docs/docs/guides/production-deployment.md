---
sidebar_position: 6
title: Production Deployment
description: Build, sign, and publish JetStart apps to Google Play Store
---

# Production Deployment

Complete guide to building production-ready APKs, signing for release, optimizing for the Play Store, and publishing your JetStart application.

## Build Process Overview

```
Development → Testing → Build → Sign → Optimize → Upload → Publish
     ↓           ↓         ↓       ↓        ↓         ↓        ↓
 jetstart    Manual     APK    Keystore  ProGuard   Play    Review
   dev       testing   build   signing    R8       Console  (1-7 days)
```

## Production Build

### Build Release APK

```bash
cd my-app
jetstart build --release
```

**Output:**
```
✓ Build completed successfully!

Output: /my-app/build/outputs/apk/release/app-release-unsigned.apk
Size: 5.2 MB
Type: release
```

**What happened:**
- Kotlin compilation (optimized)
- ProGuard/R8 code shrinking & obfuscation
- Resource optimization
- APK packaging
- **NOT signed** (need to sign manually)

### Build vs Development

| Feature | Development (debug) | Production (release) |
|---------|---------------------|----------------------|
| **Debuggable** | Yes | No |
| **Obfuscation** | No | Yes (ProGuard/R8) |
| **Size** | ~8 MB | ~5 MB (30-40% smaller) |
| **Performance** | Good | Optimized |
| **Signing** | Debug cert | Release keystore required |
| **Build time** | Fast (5-10s) | Slower (15-30s) |
| **Play Store** | ✗ Not allowed | ✓ Required |

## APK Signing

### Why Sign APKs?

**Google Play Store requirements:**
- ✓ All APKs must be signed with release keystore
- ✓ Proves app authenticity and ownership
- ✓ Enables app updates (same signature)
- ✗ Debug certificates rejected

### Create Keystore (One-Time)

```bash
keytool -genkey -v -keystore my-release-key.keystore -alias my-app -keyalg RSA -keysize 2048 -validity 10000
```

**Prompts:**
```
Enter keystore password: [create strong password]
Re-enter new password: [confirm password]
What is your first and last name?
  [Unknown]:  John Doe
What is the name of your organizational unit?
  [Unknown]:  Development
What is the name of your organization?
  [Unknown]:  My Company
What is the name of your City or Locality?
  [Unknown]:  San Francisco
What is the name of your State or Province?
  [Unknown]:  California
What is the two-letter country code for this unit?
  [Unknown]:  US
Is CN=John Doe, OU=Development, O=My Company, L=San Francisco, ST=California, C=US correct?
  [no]:  yes

Enter key password for <my-app>
        (RETURN if same as keystore password): [press RETURN]
```

**Output:** `my-release-key.keystore`

:::danger CRITICAL
**NEVER lose this file or password!**
- Store securely (encrypted backup, password manager)
- Cannot publish updates without original keystore
- Losing it = cannot update app ever
:::

### Sign APK Manually

```bash
# Build unsigned APK
jetstart build --release

# Sign with jarsigner
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore my-release-key.keystore build/outputs/apk/release/app-release-unsigned.apk my-app

# Verify signature
jarsigner -verify -verbose -certs build/outputs/apk/release/app-release-unsigned.apk

# Align APK (optimize for Play Store)
zipalign -v 4 build/outputs/apk/release/app-release-unsigned.apk build/outputs/apk/release/app-release-signed.apk
```

### Automated Signing (Gradle)

**Configure `app/build.gradle`:**

```gradle
android {
    signingConfigs {
        release {
            storeFile file("../my-release-key.keystore")
            storePassword "YOUR_KEYSTORE_PASSWORD"
            keyAlias "my-app"
            keyPassword "YOUR_KEY_PASSWORD"
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

**Build signed APK:**
```bash
jetstart build --release --sign
```

**Output:**
```
build/outputs/apk/release/app-release-signed.apk
```

:::warning Security
**Don't commit passwords to Git!** Use environment variables:

```gradle
signingConfigs {
    release {
        storeFile file(System.getenv("KEYSTORE_FILE") ?: "../my-release-key.keystore")
        storePassword System.getenv("KEYSTORE_PASSWORD")
        keyAlias System.getenv("KEY_ALIAS")
        keyPassword System.getenv("KEY_PASSWORD")
    }
}
```

Set environment variables:
```bash
# Windows
set KEYSTORE_PASSWORD=mypassword
set KEY_ALIAS=my-app
set KEY_PASSWORD=mypassword

# macOS/Linux
export KEYSTORE_PASSWORD=mypassword
export KEY_ALIAS=my-app
export KEY_PASSWORD=mypassword
```
:::

## Code Optimization

### ProGuard/R8 Configuration

**Default optimization** (already enabled in JetStart templates):

```gradle
buildTypes {
    release {
        minifyEnabled true  // Enable code shrinking
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

**What ProGuard/R8 does:**
- **Shrinks:** Removes unused code and resources (30-50% size reduction)
- **Obfuscates:** Renames classes/methods to short names (harder to reverse-engineer)
- **Optimizes:** Inline methods, remove dead code, simplify bytecode

**Custom rules** (`proguard-rules.pro`):

```proguard
# Keep JetStart classes
-keep class com.jetstart.** { *; }

# Keep Compose classes
-keep class androidx.compose.** { *; }

# Keep data classes
-keep class com.myapp.models.** { *; }

# Keep serialization
-keepclassmembers class * implements java.io.Serializable {
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
}
```

### Size Optimization

**Before optimization:** ~8 MB
**After ProGuard/R8:** ~5 MB
**After resource optimization:** ~4 MB

**Additional techniques:**

**1. Enable resource shrinking:**
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true  // Remove unused resources
    }
}
```

**2. Use WebP images:**
```bash
# Convert PNG to WebP (smaller, same quality)
cwebp input.png -q 80 -o output.webp
```

**3. Enable vector drawables:**
```gradle
defaultConfig {
    vectorDrawables.useSupportLibrary = true
}
```

**4. Split APKs by ABI:**
```gradle
android {
    splits {
        abi {
            enable true
            reset()
            include 'armeabi-v7a', 'arm64-v8a', 'x86', 'x86_64'
            universalApk false
        }
    }
}
```

Results in 4 smaller APKs instead of 1 large universal APK.

## App Bundle (AAB)

### What is AAB?

**Android App Bundle** = Modern distribution format

**Advantages over APK:**
- Google Play generates optimized APKs per device
- User downloads only what they need
- 15% smaller average download size
- Required for new apps on Play Store (since August 2021)

### Build AAB

```bash
./gradlew bundleRelease
```

**Output:**
```
build/outputs/bundle/release/app-release.aab
```

### Sign AAB

**Play App Signing (recommended):**
1. Upload AAB to Play Console
2. Google manages signing keys
3. Automatic optimization per device

**Manual signing:**
```bash
jarsigner -verbose -sigalg SHA256withRSA -digestalg SHA-256 -keystore my-release-key.keystore build/outputs/bundle/release/app-release.aab my-app
```

## Google Play Store Submission

### Prerequisites Checklist

**Code:**
- [ ] Tested on multiple devices/Android versions
- [ ] No crashes or critical bugs
- [ ] Performance acceptable
- [ ] Network errors handled gracefully

**Build:**
- [ ] Release build created
- [ ] APK/AAB signed with release keystore
- [ ] ProGuard/R8 enabled and tested
- [ ] Version code incremented

**Assets:**
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots (2-8 images, phone + tablet)
- [ ] Promotional video (optional, YouTube link)

**Legal:**
- [ ] Privacy policy URL
- [ ] Content rating questionnaire completed
- [ ] Target audience selected

### Create Play Console Account

1. Go to [play.google.com/console](https://play.google.com/console)
2. Pay $25 one-time registration fee
3. Accept Developer Distribution Agreement
4. Complete account details

### Create App Listing

**1. Create app:**
- Play Console → Create app
- Name, default language, app/game type
- Free or paid

**2. App content:**
- Privacy policy (required)
- App access (full access or restricted)
- Ads (does app contain ads?)
- Content rating
- Target audience
- News app designation

**3. Store listing:**
- **App name:** 30 characters max
- **Short description:** 80 characters
- **Full description:** 4000 characters max
- **App icon:** 512x512 PNG
- **Feature graphic:** 1024x500 PNG
- **Screenshots:** Min 2, max 8 per device type

**4. Pricing & distribution:**
- Free or paid
- Countries/regions
- Content guidelines compliance

### Upload APK/AAB

**1. Production track:**
```
Play Console → Your app → Production → Create new release
```

**2. Upload APK or AAB:**
- Drag and drop `app-release-signed.apk` or `app-release.aab`
- Google scans for issues
- Fix any warnings

**3. Release notes:**
```
What's new:
- Initial release
- Material 3 design
- Fast hot reload development
- Optimized performance
```

**4. Review and rollout:**
- Review all fields
- Click "Start rollout to Production"
- Confirm release

### Review Process

**Timeline:**
- **Typical:** 1-3 days
- **First app:** Up to 7 days
- **Major updates:** 1-3 days

**Status tracking:**
```
Play Console → Your app → Dashboard → Publishing overview
```

**Possible outcomes:**
- ✓ **Approved:** App goes live
- ⚠ **Rejected:** Fix issues and resubmit
- 🔍 **In review:** Wait for Google

## Version Management

### Version Code vs Version Name

```gradle
// app/build.gradle
defaultConfig {
    versionCode 1       // Integer, auto-incremented (1, 2, 3, ...)
    versionName "1.0.0" // String, user-visible (1.0.0, 1.0.1, 1.1.0, ...)
}
```

**Version code:** Internal Google Play tracking
**Version name:** Shown to users in Play Store

### Semantic Versioning

**Format:** `MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes (1.0.0 → 2.0.0)
- **MINOR:** New features, backward compatible (1.0.0 → 1.1.0)
- **PATCH:** Bug fixes (1.0.0 → 1.0.1)

**Examples:**
- 1.0.0 → Initial release
- 1.0.1 → Bug fix
- 1.1.0 → New feature added
- 2.0.0 → Major redesign, breaking changes

### Update Workflow

**1. Increment versions:**
```gradle
defaultConfig {
    versionCode 2       // Was 1
    versionName "1.0.1" // Was 1.0.0
}
```

**2. Build and sign:**
```bash
jetstart build --release --sign
```

**3. Upload to Play Console:**
- Production → Create new release
- Upload new APK/AAB
- Add release notes
- Start rollout

**4. Staged rollout (recommended):**
```
20% → Monitor for 24h
50% → Monitor for 24h
100% → Full rollout
```

Allows catching issues before affecting all users.

## CI/CD Integration

### GitHub Actions Example

**.github/workflows/release.yml:**

```yaml
name: Build and Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'

      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build release APK
        run: ./gradlew assembleRelease

      - name: Sign APK
        run: |
          echo "${{ secrets.KEYSTORE_BASE64 }}" | base64 -d > keystore.jks
          jarsigner -verbose -sigalg SHA256withRSA \
            -digestalg SHA-256 \
            -keystore keystore.jks \
            -storepass "${{ secrets.KEYSTORE_PASSWORD }}" \
            build/outputs/apk/release/app-release-unsigned.apk \
            "${{ secrets.KEY_ALIAS }}"

      - name: Upload to Play Store
        uses: r0adkll/upload-google-play@v1
        with:
          serviceAccountJsonPlainText: ${{ secrets.PLAY_SERVICE_ACCOUNT }}
          packageName: com.jetstart.myapp
          releaseFiles: build/outputs/apk/release/app-release-signed.apk
          track: production
```

## Best Practices

### ✓ DO:

**Security:**
- Use strong keystore passwords
- Store keystore in secure location (encrypted backup)
- Use environment variables for passwords
- Enable Play App Signing

**Testing:**
- Test on multiple devices before release
- Use staged rollouts (20% → 50% → 100%)
- Monitor crash reports
- Have rollback plan

**Optimization:**
- Enable ProGuard/R8
- Shrink resources
- Use App Bundle (AAB)
- Optimize images (WebP)

**Version management:**
- Increment version code on every release
- Use semantic versioning for version name
- Write clear release notes
- Tag Git releases

### ✗ DON'T:

**Avoid:**
- Committing keystore to Git
- Hardcoding passwords in build.gradle
- Releasing without testing
- Skipping ProGuard (larger APK, easier to decompile)

**Don't:**
- Lose your keystore (cannot update app)
- Reuse debug certificate for production
- Release with known crashes
- Forget to increment version code

## Monitoring & Analytics

### Firebase Crashlytics

**Setup:**
```gradle
// build.gradle (project level)
buildscript {
    dependencies {
        classpath 'com.google.gms:google-services:4.3.15'
        classpath 'com.google.firebase:firebase-crashlytics-gradle:2.9.5'
    }
}

// app/build.gradle
plugins {
    id 'com.google.gms.google-services'
    id 'com.google.firebase.crashlytics'
}

dependencies {
    implementation platform('com.google.firebase:firebase-bom:32.0.0')
    implementation 'com.google.firebase:firebase-crashlytics'
}
```

**Benefits:**
- Real-time crash reporting
- Stack traces with line numbers
- User impact metrics
- Crash-free users percentage

### Play Console Metrics

**Built-in analytics:**
- Installs, uninstalls, active users
- Crash rate and ANR (Application Not Responding) rate
- Ratings and reviews
- Pre-launch reports (automated testing)

**Access:**
```
Play Console → Your app → Quality → Android vitals
```

## Related Documentation

**Learn more:**
- [Building APKs](../cli/build.md) - Build command reference
- [Creating First App](./creating-first-app.md) - Development workflow
- [Performance Optimization](./performance-optimization.md) - Optimize for production

**External resources:**
- [Android Developer - Publish your app](https://developer.android.com/studio/publish)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer)
- [ProGuard Manual](https://www.guardsquare.com/manual/home)
