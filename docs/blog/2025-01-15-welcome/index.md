---
slug: welcome
title: Welcome to JetStart Documentation
authors: [jetstart]
tags: [jetstart, android, hot-reload, documentation]
---

# Welcome to JetStart Documentation!

We're excited to launch the official JetStart documentation site! 🚀

<!--truncate-->

## What's New?

Today marks a major milestone for JetStart - our comprehensive documentation is now live! Whether you're a first-time user or an experienced Android developer, you'll find everything you need to get started and master JetStart.

## What You'll Find Here

### 📚 Getting Started
Complete guides to help you:
- Install JetStart and required dependencies
- Create your first project
- Understand hot reload
- Connect your Android device

### ⌨️ CLI Reference
Detailed documentation for all 6 JetStart commands:
- `create` - Project scaffolding
- `dev` - Development server
- `build` - APK building
- `logs` - Log streaming
- `install-audit` - Dependency checking
- `android-emulator` - AVD management

### 🏗️ Architecture
Deep dives into how JetStart works:
- Two-tier hot reload system
- DSL rendering engine
- WebSocket protocol
- Session management
- Build system integration

### 📖 Guides & Tutorials
Practical guides for common tasks:
- Creating your first app
- Working with QR codes
- Using the web emulator
- Debugging tips
- Production deployment

## Why JetStart?

JetStart is built on a simple philosophy: **Android development should be fast and enjoyable**.

Traditional Android development involves:
1. Edit code
2. Wait 30-60 seconds for Gradle build
3. Wait for APK installation
4. Wait for app restart
5. Finally see your changes

With JetStart, this becomes:
1. Edit code
2. **See changes in under 100ms**

That's it. No waiting, no rebuilds, no app restarts for UI changes.

## How It Works

JetStart uses a dual hot reload system:

### Tier 1: DSL Hot Reload (under 100ms)
For UI-only changes, JetStart parses your Kotlin Compose code into a JSON DSL and sends it via WebSocket to your running app. The app re-renders the UI instantly - no rebuild required.

### Tier 2: Full Gradle Build
For logic changes, dependencies, or resources, JetStart falls back to a full Gradle build with intelligent caching to minimize build time.

This gives you the best of both worlds: instant feedback when possible, complete rebuild when necessary.

## Real Kotlin Compose

Unlike other hot reload solutions that use configuration files or custom DSLs, JetStart works with **real Kotlin Compose code**. You get full IDE support:
- Autocomplete
- Type checking
- Refactoring
- Syntax highlighting

## What's Next?

We're constantly improving JetStart. Here's what's on the roadmap:
- Enhanced DSL coverage for more Compose components
- Improved build caching
- Better error messages
- More platform support
- Performance optimizations

## Get Started Today

Ready to experience instant Android development?

```bash
npm install -g @jetstart/cli
jetstart create my-app --package com.example.app
cd my-app
jetstart dev
```

That's all it takes to get started!

## Feedback Welcome

This documentation is a living document. If you find:
- Missing information
- Unclear explanations
- Broken examples
- Typos or errors

Please let us know! Open an issue on [GitHub](https://github.com/dev-phantom/jetstart/issues) or start a discussion.

## Thank You

Thank you to everyone who has contributed to JetStart, provided feedback, reported bugs, and supported this project. Your input has been invaluable in making JetStart what it is today.

Happy coding! ⚡

---

*The JetStart Team*
