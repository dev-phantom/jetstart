---
title: REST API Endpoints
description: HTTP endpoints provided by the Core Server
---

# REST API Endpoints

The Core Server exposes a REST API for session management, health checks, and file downloads.

**Base URL:** `http://localhost:8765` (Default)

## System

### Get Health Status
`GET /health`

Returns the current status of the server.

**Response:**
```json
{
  "status": "ok",
  "version": "1.1.0",
  "uptime": 123.45
}
```

### Get Version
`GET /version`

Returns the installed version of JetStart Core.

**Response:**
```json
{
  "version": "1.1.0"
}
```

## Sessions

### Create Session
`POST /session/create`

Initializes a new development session and generates a QR code.

**Body:**
```json
{
  "projectName": "My App",
  "projectPath": "/absolute/path/to/project"
}
```

**Response:**
```json
{
  "session": {
    "id": "uuid-string",
    "token": "auth-token",
    "createdAt": 1700000000
  },
  "qrCode": "data:image/png;base64,..."
}
```

### Get Session Details
`GET /session/:sessionId`

Retrieves information about an active session.

**Response:**
```json
{
  "id": "uuid-string",
  "projectName": "My App",
  "status": "active",
  "connectedClients": 1
}
```

## Downloads

### Download APK
`GET /download/:filename`

Downloads the built APK file.

- `filename`: Usually `app-debug.apk`

**Response:**
- Binary file stream (application/vnd.android.package-archive)
- 404 if build not found
