---
title: Connection Problems
description: Debugging WebSocket and Network issues
---

# Connection Problems

## Device Cannot Connect to Server

If scanning the QR code does nothing or results in a timeout:

1. **IP Address Mismatch**: The QR code encodes your machine's local IP. If you have multiple network interfaces (e.g., Ethernet + Wi-Fi), it might pick the wrong one.
   - **Fix**: Check the console output when starting `jetstart dev`. It usually lists available IPs. Ensure the one in the QR code matches the Wi-Fi interface.

2. **Port Blocking**:
   - Ensure ports `8765` (HTTP) and `8766` (WS) are open.
   - On Windows, a popup usually asks to allow Node.js to access the network. Ensure both Private and Public networks are allowed if you move between them.

3. **AP Isolation**:
   - Some strict office/public Wi-Fi networks prevent devices from talking to each other (Client Isolation).
   - **Fix**: Use a personal hotspot or a dedicated router.

## WebSocket Disconnects Immediately

- **Session Expiry**: Sessions are valid for 1 hour. Regenerate a new session by restarting `jetstart dev`.
- **Version Mismatch**: Ensure the Client App version matches the Core version. (Currently, the app is auto-installed, but if you have an old one, uninstall it).
