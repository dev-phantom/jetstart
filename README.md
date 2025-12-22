<div align="center">
  <img src="assets\client\readme.png" alt="JetStart Logo" width="400"/>

  <h3>Launch Android apps at warp speed</h3>

  [![npm version](https://badge.fury.io/js/@jetstart%2Fcli.svg)](https://www.npmjs.com/package/@jetstart/cli)
  [![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)
</div>

---

## What is JetStart?

JetStart is a blazing-fast development tool that brings **instant hot reload** to Android Jetpack Compose. Edit your UI code and see changes on your device in **under 100ms** - no rebuild, no reinstall required!

## ✨ Features

- **⚡ Sub-100ms Hot Reload** - DSL-based hot reload for instant UI updates
- **🎨 Real Kotlin Compose** - Write actual Compose code, not configuration
- **📱 QR Code Setup** - Scan to connect your device instantly
- **🔄 Automatic Builds** - Gradle integration with smart caching
- **🌐 WebSocket Communication** - Real-time updates via WebSocket
- **🛠️ CLI Tools** - Create, dev, and build with simple commands

## 📚 Documentation

**[View Full Documentation →](https://jetstart.dev)**

For now, see the guides below to get started.

## 📦 Installation

```bash
npm install -g @jetstart/cli
```

Or use directly with npx:
```bash
npx jetstart create my-app
```

## 🚀 Quick Start

1. **Create a new project:**
   ```bash
   npx jetstart create my-awesome-app --package com.example.app
   cd my-awesome-app
   ```

2. **Start development server:**
   ```bash
   npx jetstart dev
   ```
3. **Scan QR code** with your Android device or manually enter the connection details

4. **Edit your code** in `MainActivity.kt` and watch it update instantly! ⚡

## 🛠️ Development

### Prerequisites

- Node.js 18+
- Android SDK
- JDK 17+
- Gradle 8.2+

### Setup

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/JetStart.git
cd JetStart

# Install dependencies
npm install

# Build all packages
npm run build
```

## 📄 License

This project is licensed under the MIT License.

---

**Made with ❤️ by phantom**
