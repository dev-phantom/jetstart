---
title: Web (Experimental)
description: Web-based emulator and development interface for JetStart
---

# Web (Experimental)

The Web package (`@jetstart/web`) provides a browser-based development interface that allows developers to preview their apps, monitor builds, and view logs without needing a physical Android device.

:::caution
The Web package is currently **experimental** and under active development. Some features may be unstable or subject to significant changes. Use with caution in production environments.
:::

## Overview

The JetStart Web package provides:

- **Web-based Emulator** - Preview your app in the browser
- **Real-time Connection** - WebSocket-based communication with JetStart Core
- **Build Monitoring** - Live build status updates with progress tracking
- **Log Streaming** - Real-time log viewing with filtering capabilities
- **Device Emulation** - Visual device frame showing build status and UI preview
- **Responsive Design** - Works on desktop and mobile browsers

## Features

### Real-time Connection

The web interface connects to the JetStart Core server via WebSocket, providing real-time updates for builds, logs, and connection status.

### Build Monitoring

Monitor your build progress in real-time:
- Build start/completion notifications
- Build error messages
- APK download links
- Progress indicators

### Log Streaming

View application logs with advanced filtering:
- Filter by log level (DEBUG, INFO, WARN, ERROR)
- Filter by source (CLI, CORE, CLIENT, BUILD)
- Real-time log updates
- Scrollable log history

### Device Emulation

Visual device frame that simulates an Android device:
- Device frame with status display
- Build status indicators
- Connection status
- UI preview area (future feature)

## Usage

### Development Mode

```bash
cd packages/web
npm run dev
```

This starts the Vite development server on `http://localhost:3000`.

### Production Build

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Running Tests

```bash
npm test
```

## Connecting to JetStart Core

1. **Start your JetStart development server:**
   ```bash
   jetstart dev
   ```

2. **Open the web emulator** — the HTTP server at `http://localhost:8765` automatically redirects to `https://web.jetstart.site` with your session credentials as URL parameters, so the emulator connects without any manual input.

   Alternatively open `http://localhost:8765` directly in your browser.

3. **Manual connection** (if redirect is not used): enter the IP, port, Session ID and Token displayed in the terminal into the `ConnectionPanel`.

The web emulator reads `sessionId`, `token`, `host`, `wsPort`, `version`, and `projectName` from URL parameters on load, constructs the WebSocket URL, and connects automatically. The URL is then cleared from the address bar.

## Architecture

### Components

**App** - Main application component that orchestrates all features

**StatusBar** - Displays connection and build status at the top

**DeviceFrame** - Simulates an Android device screen with visual frame

**LogViewer** - Displays and filters log entries in a scrollable view

**ConnectionPanel** - Handles user authentication and connection setup

### Hooks

**`useWebSocket`** - Manages WebSocket connection to Core server
- Handles connection lifecycle
- Sends and receives messages
- Manages connection state

**`useLogs`** - Manages log entries and filtering
- Stores up to 1000 log entries in memory
- Provides filtering by level and source
- Handles live log updates

**`usePerformanceMetrics`** - Tracks hot reload and build timing
- Build start/complete timing
- Hot reload round-trip duration
- Count of hot reload events in the session

### Services

**CoreClient** - WebSocket client for communicating with JetStart Core
- Establishes WebSocket connection
- Sends client messages
- Receives core messages
- Handles reconnection logic

## Technology Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **WebSocket API** - Real-time communication
- **CSS Modules** - Scoped styling

## Project Structure

```
src/
├── App.tsx              # Main application component
├── App.css              # Application styles
├── main.tsx             # Entry point
├── components/          # React components
│   ├── StatusBar.tsx    # Status bar component
│   ├── DeviceFrame.tsx  # Device frame component
│   ├── LogViewer.tsx    # Log viewer component
│   ├── ConnectionPanel.tsx # Connection panel
│   └── ...
├── hooks/               # Custom React hooks
│   ├── useWebSocket.ts  # WebSocket hook
│   ├── useLogs.ts       # Logs management hook
│   └── ...
├── services/            # Service layer
│   ├── CoreClient.ts    # Core server client
│   └── ...
├── types/               # TypeScript types
└── utils/               # Utility functions
```

## WebSocket Integration

The web package implements the JetStart WebSocket protocol to communicate with the Core server:

**Sent Messages:**
- `client:connect` - Initial connection
- `client:status` - Status updates
- `client:heartbeat` - Keep-alive

**Received Messages:**
- `core:connected` - Connection confirmed
- `core:build-start` - Build started
- `core:build-status` - Mid-build progress update
- `core:build-complete` - Build completed with APK download URL
- `core:build-error` - Build failed
- `core:dex-reload` - Hot reload DEX payload for Android devices (web client ignores this)
- `core:js-update` - **Primary hot reload message for the web emulator**: base64-encoded Kotlin/JS ES module, dynamically imported and rendered by `ComposeRenderer`
- `core:ui-update` - DSL JSON fallback for static UI preview
- `core:log` - Device log broadcast
- `core:reload` - Explicit reload trigger

See [WebSocket Protocol](../api/websocket-protocol.md) for detailed message formats.

## Usage Examples

### Custom Integration

```typescript
import { CoreClient } from '@jetstart/web/services/CoreClient';

const client = new CoreClient({
  wsUrl: 'ws://localhost:8766',
  sessionId: 'a1b2c3d4',
  token: 'xyz789abc123',
});

client.on('connected', () => {
  console.log('Connected to Core server');
});

client.on('build:complete', (result) => {
  console.log('Build completed:', result.apkUrl);
});

client.connect();
```

### Log Filtering

The LogViewer component supports filtering:

```typescript
// Filter by level
<LogViewer level="error" />

// Filter by source
<LogViewer source="BUILD" />

// Multiple filters
<LogViewer level="error" source="BUILD" />
```

## Development

### Setup

```bash
cd packages/web
npm install
npm run dev
```

### Build

```bash
npm run build
```

### Testing

```bash
npm test
```

## Deployment

The web package can be deployed as a static site:

1. Build the production bundle:
   ```bash
   npm run build
   ```

2. Deploy the `dist/` directory to any static hosting service:
   - Netlify
   - Vercel
   - GitHub Pages
   - Any static file server

## Configuration

The web interface automatically connects to the JetStart Core server. Configuration options:

- **WebSocket URL** - Automatically detected from Core server
- **Session ID** - Entered by user or passed via URL params
- **Token** - Entered by user or passed via URL params

## Browser Support

The web package works in modern browsers that support:
- ES6+ JavaScript
- WebSocket API
- CSS Grid and Flexbox

**Supported Browsers:**
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Related Documentation

- [Core Package](./core.md) - Server implementation
- [WebSocket Protocol](../api/websocket-protocol.md) - Communication protocol
- [Quick Start Guide](../getting-started/quick-start.md) - Getting started
- [Working with Emulators](../guides/working-with-emulators.md) - Emulator usage

## License

MIT
