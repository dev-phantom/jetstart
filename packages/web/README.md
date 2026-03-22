# @jetstart/web (Experimental)

Browser-based development interface and web emulator for JetStart.

## Overview

`@jetstart/web` is a React + Vite application hosted at `https://web.jetstart.site`. When you run `jetstart dev`, the HTTP server automatically redirects `http://localhost:8765` there, passing your session credentials as query parameters so the emulator connects without any manual input.

It gives you a real-time window into your running dev session — live build status, a visual device frame that previews your Compose UI, a filterable log feed, and performance metrics for hot reload events.

```
src/
├── App.tsx                        # Root component — orchestrates all panels and auto-connects from URL params
├── components/
│   ├── StatusBar                  # Connection state + build status header bar
│   ├── DeviceFrame                # Simulated Android phone frame rendering the Compose preview
│   ├── ConnectionPanel            # Manual session ID / token / host input form
│   ├── LogViewer                  # Filterable, clearable real-time log feed (1000-entry cap)
│   ├── BuildProgress              # Animated build phase tracker with progress percentage
│   ├── PerformancePanel           # Hot reload and build timing metrics
│   └── dsl/
│       ├── DSLRenderer            # Parses DSL component tree and renders to React
│       ├── DSLColumn / DSLRow / DSLBox
│       ├── DSLText / DSLButton / DSLSpacer
│       └── DSLComponents.css
├── hooks/
│   ├── useWebSocket.ts            # WS connection lifecycle, auth, message routing, reconnect
│   ├── useLogs.ts                 # Log entry store with configurable cap
│   └── usePerformanceMetrics.ts   # Tracks build start/complete and hot reload timing
├── services/
│   ├── CoreClient.ts              # Low-level WebSocket client for @jetstart/core protocol
│   ├── ComposeRenderer.tsx        # Renders core:js-update ES module payloads as live UI
│   └── dsl/
│       ├── alignmentParser.ts     # Parses Compose alignment values from DSL
│       └── modifierParser.ts      # Parses Compose modifier chains from DSL
├── styles/
│   └── material-typography.css   # Material You / Material 3 type scale
├── types/
│   └── dsl.ts                    # DSL component tree TypeScript types
└── utils/
    ├── dslParser.ts              # Full DSL string parser
    └── mockDSL.ts                # Mock DSL data for development
```

---

## Auto-Connection

When `jetstart dev --web` redirects to the web emulator, it appends these query parameters:

| Parameter | Description |
|---|---|
| `host` | Server LAN IP address |
| `port` | HTTP port (default `8765`) |
| `wsPort` | WebSocket port (default `8766`) |
| `sessionId` | Current session ID |
| `token` | Session authentication token |
| `version` | JetStart version |
| `projectName` | Name of the active project |

`App.tsx` reads these on load, constructs the WebSocket URL (`ws://host:wsPort` for LAN, `wss:` for remote HTTPS), and connects automatically. The URL is then cleared from the address bar.

---

## Manual Connection

If you open the emulator directly without being redirected, the `ConnectionPanel` component provides fields to enter the server host, port, session ID, and token manually. These values are displayed in the terminal when `jetstart dev` starts.

---

## Live Features

### Device Frame
Renders a simulated Android phone outline with a live content area. Displays:
- Build progress and status while a Gradle build is running
- The Compose UI preview once a `core:js-update` message arrives (ES module imported dynamically)
- A DEX reload indicator when `core:dex-reload` is received

### Log Viewer
- Receives all `core:log` messages forwarded from the Android device
- Maintains up to 1000 entries in memory
- Filterable by log level and source
- Clearable with a single button

### Performance Panel
Tracks and displays:
- Last build duration (Gradle build start → complete)
- Last hot reload round-trip time (file change → DEX received)
- Count of hot reload events in the session

### Build Progress
Shows the active Gradle build phase and progress percentage derived from `core:build-status` messages.

---

## Development

```bash
# Install dependencies (from monorepo root)
npm install

# Start Vite dev server
npm run dev --workspace=packages/web
# Opens at http://localhost:3000

# Production build
npm run build --workspace=packages/web
# Output in packages/web/dist/

# Preview production build
npm run preview --workspace=packages/web
```

---

## Technology Stack

| Technology | Purpose |
|---|---|
| React 18 | UI framework |
| TypeScript | Type-safe application code |
| Vite | Dev server and production bundler |
| WebSocket API | Real-time connection to `@jetstart/core` |
| Material You CSS | Typography and design tokens |

---

## License

MIT

