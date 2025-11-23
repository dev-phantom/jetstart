# @jetstart/shared

Shared types, protocols, and utilities for the JetStart ecosystem.

## Overview

This package contains common code shared across all JetStart packages:

- **Types**: TypeScript interfaces and type definitions
- **Protocols**: WebSocket message protocols and event systems
- **Utils**: Validation functions and constants

## Usage
```typescript
import {
  Session,
  SessionStatus,
  BuildConfig,
  LogLevel,
  ClientMessage,
  CoreMessage,
  isValidSessionId,
  DEFAULT_CORE_PORT,
} from '@jetstart/shared';
```

## Structure
```
src/
├── types/          # Type definitions
│   ├── session.ts  # Session management types
│   ├── build.ts    # Build system types
│   ├── device.ts   # Device information types
│   └── log.ts      # Logging types
├── protocols/      # Communication protocols
│   ├── websocket.ts # WebSocket messages
│   └── events.ts   # Event system
└── utils/          # Utilities
    ├── validation.ts # Validation functions
    └── constants.ts  # Shared constants
```

## Key Types

### Session Management
- `Session` - Development session state
- `SessionStatus` - Connection status enum
- `SessionToken` - Authentication token
- `QRCodeData` - QR code payload

### Build System
- `BuildConfig` - Build configuration
- `BuildResult` - Build output
- `BuildStatus` - Build progress
- `APKInfo` - APK metadata

### Device Information
- `DeviceInfo` - Device details
- `Platform` - Platform enum
- `Architecture` - CPU architecture

### Logging
- `LogEntry` - Log message structure
- `LogLevel` - Log severity levels
- `LogSource` - Log origin

## Protocols

### WebSocket Messages

**Client → Core:**
- `client:connect` - Initial connection
- `client:status` - Status update
- `client:log` - Log message
- `client:heartbeat` - Keep-alive

**Core → Client:**
- `core:connected` - Connection confirmed
- `core:build-start` - Build started
- `core:build-status` - Build progress
- `core:build-complete` - Build finished
- `core:build-error` - Build failed
- `core:reload` - Trigger reload

## Validation
```typescript
import { isValidSessionId, isValidProjectName } from '@jetstart/shared';

if (isValidSessionId(sessionId)) {
  // Valid session ID
}

if (isValidProjectName(name)) {
  // Valid project name
}
```

## Constants
```typescript
import { DEFAULT_CORE_PORT, JETSTART_VERSION } from '@jetstart/shared';

console.log(`JetStart v${JETSTART_VERSION}`);
console.log(`Core server on port ${DEFAULT_CORE_PORT}`);
```

## License

Apache-2.0