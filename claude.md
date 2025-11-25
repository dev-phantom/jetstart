# JetStart Project Context

## Project Overview

**JetStart** is an open-source Android development tool that brings a Vite/Expo-like developer experience to Kotlin and Jetpack Compose development. It enables wireless development with sub-10-second feedback loops, eliminating the need for Android Studio.

### Core Value Proposition
- **No Android Studio Required**: Developers use VS Code (or any editor) + CLI
- **Wireless Development**: QR code device pairing via WebSocket
- **Hot Reload**: Fast feedback loops for Jetpack Compose
- **Lightweight**: No heavy IDE dependencies

### License
Apache 2.0

---

## Project Status

### ✅ Completed & Tested (54 tests passing)

1. **`packages/shared`** (34 tests ✅)
   - Core types, protocols, and utilities
   - WebSocket message definitions
   - Validation functions
   - Constants and shared logic
   - **Status**: Complete, all tests passing

2. **`packages/cli`** (6 tests ✅)
   - Command-line interface
   - Commands: `create`, `dev`, `build`, `logs`
   - Template generation
   - Interactive prompts
   - **Status**: Complete, all tests passing

3. **`packages/core`** (4 tests ✅)
   - Build server (HTTP + WebSocket)
   - Build orchestration
   - Session management
   - QR code generation
   - File watching
   - **Status**: Complete, all tests passing

4. **`packages/logs`** (10 tests ✅)
   - Logging service
   - WebSocket log streaming
   - CLI log viewer
   - Log filtering (by level, source, search)
   - **Status**: Complete, all tests passing

### 📱 Completed (Build Issues)

5. **`packages/client`**
   - Android app (Kotlin + Jetpack Compose)
   - QR scanner, connection management
   - WebSocket client, log viewer
   - **Status**: Code complete, but has build/runtime issues
   - **Issue**: Requires Android SDK to build, may have implementation bugs

### 🔜 Not Started

6. **`packages/web`**
   - React-based browser emulator
   - Alternative to physical device testing
   - **Status**: Not implemented yet
   - **Priority**: High (completes the dev workflow)

---

## Architecture

### Monorepo Structure
```
JetStart/
├── packages/
│   ├── shared/     # Core types & protocols (TypeScript)
│   ├── cli/        # CLI commands (TypeScript + Node.js)
│   ├── core/       # Build server (TypeScript + Express + WebSocket)
│   ├── logs/       # Logging service (TypeScript + WebSocket)
│   ├── client/     # Android client (Kotlin + Jetpack Compose)
│   └── web/        # Web emulator (React - NOT STARTED)
├── docs/
├── examples/
├── package.json    # Root workspace config
├── tsconfig.json   # Root TypeScript config
└── README.md
```

### Technology Stack

**Node.js Packages:**
- TypeScript 5.3
- Node.js 18+
- npm workspaces
- Express (HTTP server)
- ws (WebSocket)
- Jest (testing)
- Chalk (CLI colors)

**Android Client:**
- Kotlin 1.9.20
- Jetpack Compose 1.5.4
- Material 3
- OkHttp (networking)
- Gradle 8.2

**Web Emulator (To Build):**
- React 18
- TypeScript
- Material UI or similar
- WebSocket client

### TypeScript Configuration

**Important:** Using `moduleResolution: "node"` (not "bundler") for Node.js compatibility.

All packages use:
- CommonJS modules (`module: "commonjs"`)
- Node module resolution
- TypeScript project references for build order
- Composite builds for incremental compilation

### Package Dependencies

```
shared (no dependencies)
  ↓
├─ cli (depends on shared)
├─ core (depends on shared)
└─ logs (depends on shared)

client (depends on shared types, communicates with core)
web (depends on shared types, communicates with core)
```

---

## Development Workflow

### How JetStart Works

1. **Developer Environment:**
   ```bash
   # Developer writes Kotlin code in VS Code
   code ~/MyKotlinApp
   
   # Start JetStart dev server
   jetstart dev
   ```

2. **Device Connection:**
   - CLI displays QR code in terminal
   - User scans with JetStart Client app on phone
   - Client connects via WebSocket to Core server

3. **Development Loop:**
   - Developer edits `.kt` files in VS Code
   - File watcher triggers rebuild
   - Core compiles Kotlin → APK
   - WebSocket pushes update to Client
   - Client installs & relaunches app
   - **Total time: <10 seconds**

### Commands Available

```bash
# CLI Commands (all working)
jetstart create <name>      # Scaffold new Kotlin project
jetstart dev                # Start dev server with hot reload
jetstart build              # Build production APK
jetstart logs               # Stream application logs

# Development
npm run build              # Build all packages
npm test                   # Run all tests
npm run cli:dev            # Watch mode for CLI
npm run core:dev           # Watch mode for Core
npm run logs:dev           # Watch mode for Logs
```

---

## Known Issues

### 1. Android Client Build Issues

**Problem:** Client requires Android SDK to build

**Error:**
```
SDK location not found. Define a valid SDK location with an ANDROID_HOME 
environment variable or by setting the sdk.dir path in your project's 
local properties file
```

**Cause:** Building Android apps requires Android SDK command-line tools

**Options:**
- Install Android SDK command-line tools (lightweight, no IDE)
- Use cloud build (GitHub Actions)
- Provide pre-built APK to users

**Note:** Client is a **companion app** users install once. Developers don't need to build it during development.

### 2. Client Runtime Issues

User reported "client has issues when i tried to run it" - specific issues unknown.

**Possible Issues:**
- QR scanner not working (CameraX implementation incomplete)
- WebSocket connection failures
- APK installation issues
- UI bugs in Compose screens

**Needs Investigation:**
- Test client on physical device or emulator
- Debug WebSocket connection flow
- Verify QR scanning functionality
- Check APK installation permissions

### 3. ESLint Warnings

Some ESLint parsing errors in packages (can be ignored for now):
- `tsconfig.tests.json` references not found
- Not critical for functionality

---

## Next Steps

### Priority 1: Build Web Package 🌐

**Why Web First:**
- No Android SDK needed
- Works in any browser
- Easier to test and demo
- Completes the core development workflow
- Developers can test WITHOUT a phone

**Web Package Requirements:**
- React app with TypeScript
- WebSocket client to connect to Core
- Display QR code or connection UI
- Show build status in real-time
- Display logs stream
- Simulate device screen for app preview

**File Structure:**
```
packages/web/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── App.tsx
│   ├── components/
│   │   ├── DeviceFrame.tsx
│   │   ├── LogViewer.tsx
│   │   ├── StatusBar.tsx
│   │   └── ConnectionPanel.tsx
│   ├── hooks/
│   │   ├── useWebSocket.ts
│   │   └── useLogs.ts
│   ├── services/
│   │   └── CoreClient.ts
│   └── types/
│       └── index.ts
└── public/
```

### Priority 2: Fix Client Issues 📱

**After Web is working, investigate client:**
- Debug on physical device or emulator
- Fix QR scanner implementation
- Verify WebSocket connection
- Test APK installation flow
- Polish UI/UX

### Priority 3: Documentation 📚

- User guide for `jetstart` CLI
- Setup instructions (minimal)
- Architecture documentation
- API documentation for Core server
- Contributing guidelines (already have basic one)

---

## Coding Conventions

### TypeScript Style

```typescript
// File structure
export * from './submodules';  // Re-exports
export { SpecificThing } from './module';

// Naming
ClassName, InterfaceName, TypeName  // PascalCase
functionName, variableName          // camelCase
CONSTANT_NAME                       // UPPER_SNAKE_CASE

// Async/await preferred over promises
async function doThing() {
  const result = await asyncOperation();
  return result;
}

// Error handling
try {
  await riskyOperation();
} catch (err: any) {
  logger.error(`Operation failed: ${err.message}`);
}
```

### Kotlin Style

```kotlin
// Compose naming
@Composable
fun ScreenName() { }        // Screens
fun ComponentName() { }      // Components

// Class naming
class ServiceName { }        // Services
data class ModelName { }     // Data classes

// Coroutines
lifecycleScope.launch {
  // Async work
}
```

### Testing

```typescript
describe('Feature Name', () => {
  it('should do specific thing', () => {
    // Arrange
    const input = setupTest();
    
    // Act
    const result = functionUnderTest(input);
    
    // Assert
    expect(result).toBe(expected);
  });
});
```

### File Organization

**Each package has:**
```
package/
├── src/
│   ├── index.ts           # Main exports
│   ├── [feature]/         # Feature folders
│   │   ├── index.ts       # Feature exports
│   │   └── module.ts      # Implementation
│   └── types/
│       └── index.ts       # Type definitions
├── tests/                 # Tests mirror src/
├── package.json
├── tsconfig.json
└── README.md
```

---

## Important Technical Details

### WebSocket Protocol

**Messages flow between Core ↔ Client/Web:**

```typescript
// Client/Web → Core
type ClientMessage =
  | { type: 'client:connect'; sessionId: string; token: string; deviceInfo: DeviceInfo }
  | { type: 'client:status'; status: SessionStatus }
  | { type: 'client:log'; log: LogEntry }
  | { type: 'client:heartbeat' }

// Core → Client/Web
type CoreMessage =
  | { type: 'core:connected'; sessionId: string; projectName: string }
  | { type: 'core:build-start' }
  | { type: 'core:build-complete'; apkInfo: APKInfo; downloadUrl: string }
  | { type: 'core:build-error'; error: string }
  | { type: 'core:reload'; reloadType: 'full' | 'hot' }
```

### Session Management

```typescript
interface Session {
  id: string;              // UUID
  token: string;           // Auth token
  projectName: string;     // Project being developed
  projectPath: string;     // Local path to project
  createdAt: number;       // Timestamp
  lastActivity: number;    // Last heartbeat
  status: SessionStatus;   // Connection state
}
```

### QR Code Data Format

```typescript
interface QRCodeData {
  sessionId: string;       // Session UUID
  serverUrl: string;       // http://192.168.1.100:8765
  wsUrl: string;           // ws://192.168.1.100:8766
  token: string;           // Auth token
  projectName: string;     // Display name
  version: string;         // JetStart version
}
```

### Port Assignments

```typescript
const DEFAULT_CORE_PORT = 8765;    // HTTP server
const DEFAULT_WS_PORT = 8766;      // WebSocket server
const DEFAULT_LOGS_PORT = 8767;    // Logs service
```

---

## Testing Strategy

### Unit Tests (Jest)

All Node.js packages have Jest tests:
```bash
npm test                          # All tests
npm test --workspace=packages/cli # Specific package
```

### Integration Testing

**Manual workflow test:**
1. Run `jetstart create testapp`
2. Run `jetstart dev`
3. Verify QR code displays
4. Test WebSocket connection
5. Verify log streaming

### End-to-End Testing (Future)

- Automated testing with Playwright
- Mock WebSocket connections
- Simulate device connections

---

## Build & Release

### Publishing Packages

```bash
# Build all packages
npm run build

# Test before publish
npm test

# Publish to npm (when ready)
npm publish --workspace=packages/shared
npm publish --workspace=packages/cli
npm publish --workspace=packages/core
npm publish --workspace=packages/logs
```

### Client Distribution

**Options:**
1. **Pre-built APK** - Build once, share via GitHub releases
2. **Google Play Store** - Submit to Play Store for easy installation
3. **F-Droid** - Open source Android app store

---

## Environment Variables

```bash
# Development
DEBUG=true                    # Enable debug logging
JETSTART_PORT=8765           # Override default port
JETSTART_HOST=0.0.0.0        # Server host

# Production
NODE_ENV=production          # Production mode
```

---

## Resources

### Documentation
- TypeScript: https://www.typescriptlang.org/docs/
- Jetpack Compose: https://developer.android.com/jetpack/compose
- WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket

### Similar Projects (Inspiration)
- Vite: https://vitejs.dev/
- Expo: https://expo.dev/
- Metro: https://facebook.github.io/metro/

---

## Common Tasks for Claude Code

### Adding a New Feature

1. Determine which package(s) need changes
2. Update shared types if adding new messages/types
3. Implement feature in appropriate package
4. Add tests
5. Update README for that package
6. Build and test

### Debugging Issues

1. Check test output: `npm test`
2. Check TypeScript errors: `npm run typecheck`
3. Add debug logging using provided logger utilities
4. Test in isolation before integration

### Adding Dependencies

```bash
# Add to specific package
npm install <package> --workspace=packages/<name>

# Add to root (dev tools only)
npm install <package> -D
```

---

## Current User Context

- User is developing on Windows (PowerShell)
- Using VS Code
- npm workspaces configured
- All Node.js packages (shared, cli, core, logs) are working
- Client has build issues (Android SDK not installed)
- Moving to Claude Code for continued development
- **Next task: Build the Web package**

---

## What Claude Code Should Do Next

1. **Create the Web package** (`packages/web`)
   - React + TypeScript + Vite
   - WebSocket connection to Core
   - Device frame UI for app preview
   - Log viewer component
   - Status display
   - Connection panel

2. **Test the complete workflow**
   - Start Core server
   - Open Web emulator in browser
   - Connect via WebSocket
   - Verify log streaming
   - Test build notifications

3. **Fix any issues found in existing packages**

4. **Improve documentation**

---

## Questions to Consider

1. Should Web package use Material UI, Chakra UI, or Tailwind?
2. How should the "device frame" render the developer's app?
3. Should Web support multiple simultaneous connections?
4. How to handle APK download/installation from web?

---

## Success Criteria

**Project is complete when:**
- ✅ All Node.js packages have tests passing (DONE)
- ✅ CLI commands work (DONE)
- ✅ Core server runs and accepts connections (DONE)
- ✅ Logs stream properly (DONE)
- 🔜 Web emulator connects and displays status
- 📱 Client works on physical device (needs fixing)
- 📚 Documentation is complete

**MVP is usable when:**
- Developer can run `jetstart dev` in VS Code
- Web emulator opens in browser
- Developer can see build status and logs
- (Client is optional for MVP - Web can substitute)

---

## End Notes

This is an ambitious project that solves a real problem: **making Android development accessible without requiring Android Studio**. The core architecture is solid and the Node.js packages are working well. 

The Web package is the final piece needed for a complete development workflow. Once that's done, JetStart will be a viable tool for developers who want a lightweight, fast, wireless Android development experience.

Focus on getting the Web emulator working first, then circle back to fix the Android client if needed.
```

