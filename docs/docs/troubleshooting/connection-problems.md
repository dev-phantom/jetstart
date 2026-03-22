---
title: Connection Problems
description: Debugging WebSocket and network issues
---

# Connection Problems

## Device Cannot Connect to Server

If scanning the QR code does nothing, or the app shows a connection timeout:

### 1. Wrong Network Interface Detected

JetStart auto-detects your LAN IP by scanning network interfaces. If your machine has multiple interfaces (Ethernet + Wi-Fi, or virtual adapters from WSL/Docker/Hyper-V), it might pick the wrong one.

**Check:** Look at the IP printed in the terminal when `jetstart dev` starts. Compare it against your actual Wi-Fi IP (`ipconfig` on Windows, `ifconfig`/`ip a` on macOS/Linux).

**Fix:** Override the host explicitly:
```bash
jetstart dev --host 192.168.1.100
```

### 2. Different Networks

The development machine and Android device must be on the **same local network**. Mobile data will not work.

Common traps:
- Laptop on office Ethernet, phone on office Wi-Fi — these may be isolated VLANs
- Laptop on Wi-Fi, phone on mobile data
- Phone connected to a guest Wi-Fi network that isolates clients

**Fix:** Connect both to the same Wi-Fi, or create a hotspot on your laptop and connect your phone to it.

### 3. Firewall Blocking Ports

JetStart needs inbound TCP on ports `8765` (HTTP) and `8766` (WebSocket).

**Windows:** When you first run `jetstart dev`, Windows Firewall may show a popup asking to allow Node.js. Allow access on both Private and Public networks.

To add rules manually:
```powershell
New-NetFirewallRule -DisplayName "JetStart HTTP" -Direction Inbound -Protocol TCP -LocalPort 8765 -Action Allow
New-NetFirewallRule -DisplayName "JetStart WS"   -Direction Inbound -Protocol TCP -LocalPort 8766 -Action Allow
```

**macOS:**
```bash
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp node
```

**Linux (ufw):**
```bash
sudo ufw allow 8765/tcp
sudo ufw allow 8766/tcp
```

### 4. AP / Client Isolation

Some corporate Wi-Fi networks and public hotspots block device-to-device communication (also called AP isolation or client isolation). Your phone cannot reach your laptop even on the same SSID.

**Fix:** Use a personal hotspot instead. Enable Mobile Hotspot on your phone and connect your laptop to it, or vice versa.

### 5. VPN Active

VPNs re-route traffic and often change the routing table so local devices cannot see each other.

**Fix:** Disconnect VPN while developing, or use a hotspot that bypasses the VPN interface.

---

## WebSocket Disconnects Immediately After Connecting

### Session Mismatch (Close Code 4001)

The Android app was installed during a previous `jetstart dev` session. The old `sessionId` is baked into `BuildConfig`. The current server has a new session and rejects the old credentials immediately.

**Fix:** Rescan the QR code. The new QR encodes the current session's `sessionId` and `token`. Once the app reconnects with the new credentials it will be updated for future runs.

### Token Mismatch (Close Code 4002)

Similar to session mismatch — the token embedded in the app does not match the running server.

**Fix:** Same as above — rescan the QR code.

### Session Expired

Sessions expire after 1 hour of inactivity. If `jetstart dev` has been running for a long time with no client activity, the session may be cleaned up.

**Fix:** Restart `jetstart dev` (Ctrl+C then `jetstart dev` again) and rescan the QR code.

---

## QR Code Scans but App Shows "Connection Refused"

The device reached the QR code successfully (session ID and token parsed), but the TCP connection to the server was refused.

**Causes:**
1. `jetstart dev` stopped running between scan and connect
2. The port printed in the QR is not the one the server actually bound to (rare — can happen if port was in use and server failed to start)
3. Firewall is blocking inbound TCP on port 8766

**Fix:** Verify `jetstart dev` is still running and check the firewall rules above.

---

## Connection Drops During Development

### Phone Screen Turned Off

Android aggressively closes background network connections when the screen is off.

**Fix:** Enable **"Stay awake"** in Developer Options on your Android device:
- Settings → Developer Options → Stay awake (while charging)

### Network Instability

If using shared Wi-Fi, packet loss or AP roaming can drop the WebSocket.

**Fix:** Use a dedicated hotspot for the most stable connection. The JetStart app will automatically attempt to reconnect — you should see a "Reconnecting..." indicator.

### IP Address Changed (DHCP Lease Renewed)

If your DHCP server assigns a new IP to your development machine, the connection details the phone has are stale.

**Fix:** Restart `jetstart dev` (it will detect the new IP) and rescan the QR code.

---

## Web Emulator Cannot Connect

The web emulator at `web.jetstart.site` connects via WebSocket to your local machine. The browser enforces mixed-content rules.

**Symptoms:**
- Browser console shows `Mixed Content` error
- Connection blocked by browser security policy

**Cause:** The page is served over HTTPS but tries to open a `ws://` (unencrypted) connection to your local IP.

**Fix for local addresses (192.168.x.x / localhost):** JetStart detects local IPs and uses `ws://` which browsers generally permit. If you see a mixed-content error on a local IP, try Chrome's `chrome://flags/#unsafely-treat-insecure-origin-as-secure` flag.

**Fix for non-local IPs:** Not recommended — do not expose the dev server to the internet.

---

## Checking What Is Actually Happening

Use `jetstart logs` in a second terminal to see connection events in real time:

```bash
jetstart logs --source network --level debug --follow
```

Look for:
- `Client handshake initiated` — TCP connection opened
- `Auth token validated` — credentials accepted
- `Rejected client: wrong session` — session mismatch, rescan QR
- `WebSocket connection lost` — unexpected drop

