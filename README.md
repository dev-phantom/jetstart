# JetStart

<div align="center">
  <h3>⚡ Fast, Wireless Android Development</h3>
  <p>Build, preview, and debug Kotlin + Jetpack Compose apps directly from VS Code</p>
</div>

---

## 🎯 What is JetStart?

JetStart brings the **Vite/Expo developer experience** to Android development with Kotlin and Jetpack Compose. 

Say goodbye to:
- ❌ Heavy IDE dependencies (Android Studio)
- ❌ Slow build-deploy-test cycles
- ❌ Cable-tethered development
- ❌ Complex setup processes

Say hello to:
- ✅ **Sub-10-second feedback loops**
- ✅ **Wireless development** via QR code pairing
- ✅ **Lightweight CLI** that works with any editor
- ✅ **Hot reload** for Jetpack Compose
- ✅ **Integrated logging** without Logcat

---

## 🚀 Quick Start

### Installation
```bash
npm install -g jetstart
```

### Create a New Project
```bash
jetstart create myApp
cd myApp
```

### Start Development
```bash
jetstart dev
```

This will:
1. Build your Kotlin/Compose project
2. Start a local development server
3. Display a **QR code** in your terminal

### Connect Your Device

1. Install the **JetStart Client** app on your Android device
2. Open the app and scan the QR code
3. Your app will install and launch automatically
4. Make changes to your code → see updates in seconds!

---

## 📦 Architecture

JetStart consists of five main components:

### 1. **JetStart CLI** (`packages/cli`)
Command-line interface for project management and development.
```bash
jetstart create <name>    # Create a new project
jetstart dev              # Start development server
jetstart build            # Build production APK
jetstart logs             # Stream application logs
```

### 2. **JetStart Core** (`packages/core`)
The central build and communication service.

- Compiles Kotlin/Compose projects
- Manages WebSocket connections
- Generates QR codes for device pairing
- Serves APKs and incremental updates
- Handles build caching

### 3. **JetStart Client** (`packages/client`)
Android app for wireless development.

- Scans QR codes to connect to Core
- Downloads and installs developer APKs
- Displays live build status
- Streams logs to Core
- Applies hot reload updates

### 4. **JetStart Web** (`packages/web`)
Browser-based emulator (optional).

- Preview apps without a physical device
- Stream logs and build status
- Test responsive layouts

### 5. **JetStart Logs** (`packages/logs`)
Unified logging service.

- Replaces Android Studio's Logcat
- Streams logs from Client and Core
- Filter by level (info, warn, error, build)
- Beautiful CLI output
- WebSocket-based real-time streaming

---

## 🔧 Two Development Flows

### Minimal Flow (Default)
**No ADB required** — great for quick testing and broader device compatibility.

1. Client downloads APK from Core
2. Android's native installer prompts user
3. User confirms installation
4. App launches automatically

**Pros:** Simple, works everywhere  
**Cons:** Manual confirmation needed for each update

### Faster Flow (Advanced)
**ADB over TCP** — for rapid iteration cycles.

1. Enable wireless debugging on device (one-time setup)
2. Client installs APKs silently
3. Logs stream continuously
4. Auto-relaunch on updates

**Pros:** Fully automated, fastest feedback loop  
**Cons:** Requires ADB setup and wireless debugging

---

## 🛠️ Development

### Monorepo Structure
```
JetStart/
├── packages/
│   ├── cli/          # Command-line interface
│   ├── core/         # Build server & WebSocket hub
│   ├── client/       # Android client app (Kotlin)
│   ├── web/          # Web-based emulator (React)
│   ├── logs/         # Logging service
│   └── shared/       # Shared types & protocols
├── docs/             # Documentation
├── examples/         # Example projects
└── README.md
```

### Setup for Contributors
```bash
# Clone the repository
git clone https://github.com/phantom/jetstart.git
cd jetstart

# Install dependencies
npm run bootstrap

# Build all packages
npm run build

# Run tests
npm run test

# Start development mode
npm run dev
```

### Building Individual Packages
```bash
# CLI development
npm run cli:dev

# Core server development
npm run core:dev

# Logs service development
npm run logs:dev

# Web emulator development
npm run web:dev
```

---

## 🌐 WebSocket Protocol

JetStart uses WebSocket for real-time communication between Core, Client, and Logs.

### Message Types
```typescript
// Client → Core
type ClientMessage =
  | { type: 'connect'; sessionId: string; deviceInfo: DeviceInfo }
  | { type: 'status'; status: 'installing' | 'launching' | 'running' }
  | { type: 'log'; level: LogLevel; message: string; timestamp: number }

// Core → Client
type CoreMessage =
  | { type: 'connected'; sessionId: string }
  | { type: 'build-start'; timestamp: number }
  | { type: 'build-complete'; apkUrl: string; size: number }
  | { type: 'build-error'; error: string }
  | { type: 'reload'; type: 'full' | 'hot' }
```

---

## 🎨 Key Features

### ⚡ Fast Feedback Loops
Incremental builds with intelligent caching ensure updates reach your device in under 10 seconds.

### 📱 Wireless Everything
No USB cables needed. Pair once with a QR code, develop from anywhere on your local network.

### 🪶 Lightweight
No Android Studio required. Use VS Code, Vim, or any editor you love.

### 🔥 Hot Reload
Change your Compose UI code and see updates instantly without restarting your app.

### 📊 Integrated Logging
Built-in log viewer with filtering, color coding, and real-time streaming.

### 🧩 Composable Architecture
Each component works independently. Use only what you need.

---

## 🗺️ Roadmap

### Phase 1: Foundation ✅
- [x] Monorepo structure
- [x] Core package scaffolding
- [x] CLI command structure
- [x] Client app foundation

### Phase 2: Build System (In Progress)
- [ ] Kotlin compilation pipeline
- [ ] Incremental build system
- [ ] APK generation and signing
- [ ] Build caching

### Phase 3: Connectivity
- [ ] WebSocket protocol implementation
- [ ] QR code generation and scanning
- [ ] Session management
- [ ] Wireless file transfer

### Phase 4: Developer Experience
- [ ] Hot reload for Compose
- [ ] Log streaming and filtering
- [ ] Error reporting and diagnostics
- [ ] Web-based emulator

### Phase 5: Polish
- [ ] VS Code extension
- [ ] Plugin system
- [ ] Performance profiling
- [ ] Analytics dashboard

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

Please read our [Contributing Guide](./CONTRIBUTING.md) for more details.

---

## 📄 License

JetStart is licensed under the **Apache License 2.0**. See [LICENSE](./LICENSE) for more information.

---

## 🙏 Acknowledgments

Inspired by:
- [Vite](https://vitejs.dev/) — Fast web development
- [Expo](https://expo.dev/) — React Native development platform
- [Metro](https://facebook.github.io/metro/) — React Native bundler

Special thanks to the Kotlin and Jetpack Compose communities.


## 📬 Contact

- **Issues:** [GitHub Issues](https://github.com/phantom/jetstart/issues)
- **Discussions:** [GitHub Discussions](https://github.com/phantom/jetstart/discussions)
- **Twitter:** [@phantomdev](https://twitter.com/phantomdev)

---

<div align="center">
  <p>Made with ❤️ by Phantom</p>
  <p>⭐ Star us on GitHub if you find JetStart useful!</p>
</div>

```

```