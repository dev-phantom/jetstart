# @jetstart/web

Web-based emulator and development interface for JetStart.

## Overview

The JetStart Web package provides a browser-based development interface that allows developers to:

- Connect to the JetStart Core server via WebSocket
- View real-time build status and progress
- Monitor application logs
- Download built APK files
- Simulate an Android device display

## Features

- **Real-time Connection**: WebSocket-based communication with JetStart Core
- **Build Monitoring**: Live build status updates with progress tracking
- **Log Streaming**: Real-time log viewing with filtering capabilities
- **Device Emulation**: Visual device frame showing build status
- **Responsive Design**: Works on desktop and mobile browsers

## Usage

### Development Mode

```bash
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

1. Start your JetStart development server:
   ```bash
   jetstart dev
   ```

2. Open the web emulator in your browser

3. Enter the Session ID and Token displayed in the terminal

4. Click "Connect"

## Architecture

### Components

- **App**: Main application component
- **StatusBar**: Displays connection and build status
- **DeviceFrame**: Simulates an Android device screen
- **LogViewer**: Displays and filters log entries
- **ConnectionPanel**: Handles user authentication

### Hooks

- **useWebSocket**: Manages WebSocket connection to Core server
- **useLogs**: Manages log entries and filtering

### Services

- **CoreClient**: WebSocket client for communicating with JetStart Core

## Technology Stack

- React 18
- TypeScript
- Vite
- WebSocket API

## License

Apache-2.0
