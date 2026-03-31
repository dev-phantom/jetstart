---
title: FAQ
description: Frequently asked questions about JetStart
---

# FAQ

## General

### What is JetStart?

JetStart is a development tool that brings instant hot reload to Android Jetpack Compose. It compiles changed Kotlin files to DEX bytecode and pushes the patch to a running Android app over WebSocket — no rebuild, no reinstall. Changes appear on your device in instantly.

### Does JetStart replace Android Studio?

No. JetStart is a development-speed tool, not a full IDE. You still write Kotlin in whatever editor you prefer (VS Code, IntelliJ, Android Studio, Neovim) and use Gradle for full builds. JetStart sits alongside your normal workflow and eliminates the wait on every small UI change.

### Does it work on iOS?

No. JetStart is Android-only. It compiles Kotlin to DEX bytecode using Android's toolchain. There is no iOS equivalent.

### What Android versions are supported?

Android 7.0 (API 24) and above. The minimum is set by the `d8` DEX compilation flag `--min-api 24`.

### Is JetStart open source?

Yes — MIT license. See [github.com/dev-phantom/jetstart](https://github.com/dev-phantom/jetstart).

---

## Hot Reload

### How does hot reload actually work? Is it DSL-based?

No. JetStart hot reload on Android devices is **DEX-based**, not DSL-based. When you save a `.kt` file:

1. `kotlinc` compiles the file to `.class` files
2. `OverrideGenerator` creates `$Override` companion classes (InstantRun pattern)
3. `d8` converts all `.class` files to `classes.dex`
4. The DEX is sent to your device via WebSocket (`core:dex-reload`)
5. A custom ClassLoader loads the new classes into the running app

No JSON parsing. No DSL. Real compiled Kotlin bytecode, loaded live.

### What is the DSL I see mentioned?

The DSL (JSON representation of Compose UI) is used **only in the web browser emulator** as a fallback preview renderer. It has nothing to do with hot reload on Android devices.

### Why does hot reload sometimes trigger a full Gradle build?

Hot reload requires `kotlinc` to compile the changed file independently. If the change involves a new `import` that references a class not in the cached classpath, or if a resource file (`.xml`, drawable) changed, or if `build.gradle` changed, JetStart falls back to a full Gradle build.

### How do I make hot reload as fast as possible?

- Run `./gradlew assembleDebug` once before starting `jetstart dev` — this populates the `~/.gradle/caches` JARs that `kotlinc` needs for classpath construction.
- Keep each `.kt` file focused on UI code with minimal external references.
- Use Kotlin 2.0+ for the bundled Compose compiler plugin (avoids a cache lookup).

### Can I hot reload logic changes, not just UI?

Yes. JetStart hot reload compiles the entire changed Kotlin file — it is not limited to `@Composable` functions. Any class that `kotlinc` can compile in isolation (without unresolved external references) can be hot reloaded. Business logic, utility classes, and view models can all be patched this way.

---

## Connection & Devices

### My phone can't reach the server even though they're on the same Wi-Fi.

Some Wi-Fi networks (especially corporate or hotel networks) enable AP isolation, which blocks device-to-device communication. Use a personal hotspot instead: enable Mobile Hotspot on your phone and connect your laptop to it, or vice versa.

### Do I need a USB cable?

No. JetStart is entirely wireless. Everything happens over WebSocket on your local network. USB is not needed at any point.

### Can I connect multiple devices at the same time?

Yes. Multiple Android devices or browsers can connect to the same session simultaneously. All authenticated clients receive every hot reload update.

### The QR code is unreadable in my terminal.

Increase your terminal font size (`Ctrl +` in most terminals) and make the window larger. If scanning remains unreliable, use `--no-qr` and enter connection details manually in the JetStart app:
```bash
jetstart dev --no-qr
```

---

## Builds

### What does `jetstart build --release` do differently from `jetstart build`?

Release builds apply security hardening before invoking Gradle:
1. The dev-server URL and session token are cleared from `BuildConfig` — no server address is embedded in the production binary
2. `debuggable=false` is enforced
3. R8 minification and resource shrinking are enabled
4. `build.gradle` is restored to its original content after the build (even on failure)

### Can I sign a release build?

Yes. Create `keystore.properties` in the project root and run:
```bash
jetstart build --release --sign
```

For quick device testing without a real keystore:
```bash
jetstart build --release --self-sign
```

`--self-sign` auto-generates a test keystore via `keytool`. Do not use it for Play Store submissions.

### Can I build an AAB instead of an APK?

Yes:
```bash
jetstart build --release --bundle
```

### How do I build a specific product flavor?

```bash
jetstart build --release --flavor staging
```

---

## Web Emulator

### What is the web emulator?

A React app hosted at `https://web.jetstart.site` that shows a browser-based preview of your Compose UI. When you run `jetstart dev`, the server redirects `http://localhost:8765` to the web emulator with your session credentials pre-filled, so it connects automatically.

### Does the web emulator receive the same DEX patches as Android?

No. Android devices receive `core:dex-reload` (compiled DEX bytecode). The web emulator receives `core:js-update` (a compiled Kotlin/JS ES module). Both are generated from the same changed `.kt` file and sent simultaneously, but they are different compilation targets.

### The web emulator shows "Mixed Content" errors in my browser.

The page is HTTPS but tries to connect to your local machine over `ws://`. For local IPs (`192.168.x.x`, `localhost`), most browsers permit this. If blocked, try opening the emulator in a browser tab directly at `http://localhost:8765` — this avoids the HTTPS mixed-content restriction.

---

## Security

### Is it safe to use JetStart on a shared Wi-Fi network?

The session token provides basic authentication — a device without the correct `sessionId` and `token` cannot connect. However, the token is short-lived and transmitted in plain text over WebSocket. Do not use JetStart on untrusted networks. Use a personal hotspot for the most secure setup.

### Does JetStart send any data to external servers?

The `jetstart dev` server is entirely local. The only external connection is the web emulator at `web.jetstart.site`, which your browser opens. No source code, APKs, or session credentials are sent to any external server by JetStart itself.

---

## Still Have a Question?

- [GitHub Discussions](https://github.com/dev-phantom/jetstart/discussions) — ask the community
- [GitHub Issues](https://github.com/dev-phantom/jetstart/issues) — report bugs
- [Common Issues](./common-issues.md) — solutions to frequent problems

