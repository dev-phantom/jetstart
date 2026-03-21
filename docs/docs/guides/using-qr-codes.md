---
sidebar_position: 3
title: Using QR Codes
description: Master QR code pairing for instant device connection
---

# Using QR Codes

Master JetStart's QR code pairing system for instant, secure device connection. Learn the format, best practices, and troubleshooting tips.

## Why QR Codes?

**Traditional connection methods:**
- Manual IP entry (error-prone)
- Typing session ID and token (tedious)
- Remembering port numbers (unreliable)

**QR code benefits:**
- ✅ **Instant connection** (2 seconds vs 30 seconds)
- ✅ **Zero typos** (camera reads data)
- ✅ **Automatic pairing** (all credentials in one scan)
- ✅ **Session security** (tokens embedded)

## QR Code Format

### Data Structure

JetStart QR codes use **ultra-compact pipe-delimited format**:

```
host|port|wsPort|sessionId|token|projectName
```

**Example:**
```
192.168.1.100|8765|8766|a1b2c3|xyz789|my-app
```

### Field Breakdown

| Field | Type | Example | Purpose |
|-------|------|---------|---------|
| **host** | IP address | 192.168.1.100 | Server IP for HTTP/WebSocket |
| **port** | number | 8765 | HTTP server port |
| **wsPort** | number | 8766 | WebSocket server port |
| **sessionId** | string | a1b2c3 | Session identifier (6 chars) |
| **token** | string | xyz789 | Authentication token (6 chars) |
| **projectName** | string | my-app | Project name for display |

### Why Pipe-Delimited?

**Smaller QR code = faster scanning**

**JSON format (123 bytes):**
```json
{"host":"192.168.1.100","port":8765,"wsPort":8766,"sessionId":"a1b2c3","token":"xyz789","projectName":"my-app"}
```

**Pipe format (48 bytes):**
```
192.168.1.100|8765|8766|a1b2c3|xyz789|my-app
```

**Result:** 61% smaller → Less dense QR code → Faster, more reliable scanning

## Scanning QR Codes

### Step-by-Step

**1. Start dev server**
```bash
cd my-app
jetstart dev
```

**2. Locate QR code in terminal**
```
✓ JetStart dev server is running!

ℹ Local:    http://localhost:8765
ℹ Network:  http://192.168.1.100:8765
ℹ Project:  my-app

Scan QR or connect manually:

███████████████████████████
██ ▄▄▄▄▄ █▀ ██▀▄█ ▄▄▄▄▄ ██
██ █   █ █▀▀▀ ▄ █ █   █ ██
██ █▄▄▄█ █ ▄█▀▀██ █▄▄▄█ ██
██▄▄▄▄▄▄▄█ ▀ █ ▀ ▄▄▄▄▄▄▄██
██  ▄▄ ▄▄ █▄▀█▀▀ ▄█▄▀  ▀██
██▄▄█  ▄▄▀██▄ ▀  ▄  ▄▀▄ ██
███████████████████████████

ℹ IP: 192.168.1.100
ℹ Session: a1b2c3
ℹ Token: xyz789
```

**3. Open JetStart Android app**
- Launch JetStart app on your device
- Tap **"Create Connection"** button

**4. Align camera with QR code**
- Hold phone 6-12 inches from screen
- Ensure good lighting
- Wait for automatic recognition (1-2 seconds)

**5. Connection established!**
```
✓ Connected to my-app
✓ Session: a1b2c3
✓ Ready for hot reload
```

### Camera Permissions

**First time setup:**

Android will request camera permission:

```
"JetStart" would like to access your camera
[Deny] [Allow]
```

**Tap "Allow"** for QR code scanning.

**If denied by mistake:**
1. Go to Settings → Apps → JetStart
2. Permissions → Camera → Allow
3. Restart JetStart app

## QR Code Display Options

### Show QR Code (Default)

```bash
jetstart dev
# QR code displays automatically
```

### Hide QR Code

```bash
jetstart dev --no-qr
```

**Output (QR hidden):**
```
✓ JetStart dev server is running!

ℹ Local:    http://localhost:8765
ℹ Network:  http://192.168.1.100:8765
ℹ Project:  my-app

ℹ IP: 192.168.1.100
ℹ Session: a1b2c3
ℹ Token: xyz789

Watching for file changes...
```

**When to use `--no-qr`:**
- Terminal doesn't support QR rendering
- Using manual connection method
- Scripting/CI environments
- Screen reader accessibility

### QR Code Size

JetStart uses **small QR codes** optimized for terminal display:

- **Version:** QR Version 2 (25×25 modules)
- **Error correction:** Medium (15% recovery)
- **Data capacity:** 47 alphanumeric characters
- **Terminal size:** 27 rows × 27 columns

**Comparison:**

| QR Size | Terminal Lines | Scan Distance |
|---------|----------------|---------------|
| Small (JetStart) | 27 lines | 6-12 inches |
| Medium | 50 lines | 12-18 inches |
| Large | 100 lines | 18-24 inches |

## Network Requirements

### Same Network Requirement

:::warning Critical
**Your phone and computer MUST be on the same WiFi network.** QR code connection will fail if they're on different networks.
:::

**Checklist:**

- [ ] Computer connected to WiFi (not Ethernet)
- [ ] Phone connected to **same WiFi** (not cellular)
- [ ] Same network name (SSID)
- [ ] Both on 2.4GHz or both on 5GHz (if dual-band)

### WiFi vs Mobile Hotspot

**WiFi (Shared Network):**
```
Internet
   │
   └─── WiFi Router
          ├─── Computer (192.168.1.100)
          └─── Phone (192.168.1.101)
```

**Pros:**
- No configuration needed
- Stable connection
- Good for home/office

**Cons:**
- Firewall may block ports
- Corporate networks may isolate devices
- More latency

**Mobile Hotspot (Dedicated):**
```
Computer (192.168.43.100)
   │
   └─── Phone Hotspot (192.168.43.1)
        └─── Internet (optional)
```

**Pros:**
- Direct connection (lowest latency)
- No firewall issues
- Works anywhere
- Perfect for demos/travel

**Cons:**
- Drains phone battery
- Uses mobile data (if enabled)
- Need to configure hotspot

### Setting Up Hotspot

**Android:**
1. Settings → Network & Internet → Hotspot & tethering
2. Wi-Fi hotspot → Turn on
3. Note network name and password
4. Connect computer to this hotspot

**iPhone:**
1. Settings → Personal Hotspot
2. Allow Others to Join → On
3. Note WiFi password
4. Connect computer to this hotspot

## Troubleshooting QR Codes

### Issue: "QR code not scanning"

**Symptoms:**
- Camera opens but doesn't recognize QR code
- Scanning takes 10+ seconds
- Multiple scan attempts fail

**Causes & Solutions:**

**1. Poor lighting**
- **Problem:** Dark room, screen glare
- **Solution:** Increase screen brightness, add desk lamp

**2. QR code too small**
- **Problem:** High-DPI screen, small terminal window
- **Solution:** Zoom terminal (Ctrl/Cmd +), increase font size

**3. QR code corrupted**
- **Problem:** Terminal doesn't support box-drawing characters
- **Solution:** Use different terminal (Windows Terminal, iTerm2, GNOME Terminal)

**4. Camera focus issues**
- **Problem:** Too close or too far
- **Solution:** Hold phone 8-10 inches from screen

**5. Network changed**
- **Problem:** IP address changed, QR code outdated
- **Solution:** Restart dev server (`jetstart dev`)

### Issue: "Scanned successfully, but connection fails"

**Symptoms:**
- QR code scans
- App says "Connecting..."
- Connection times out after 30 seconds

**Causes & Solutions:**

**1. Different networks**
```bash
# Check computer IP
ipconfig  # Windows
ifconfig  # macOS/Linux

# Check phone IP (Android)
# Settings → Wi-Fi → [Network] → IP address

# First 3 octets must match:
# Computer: 192.168.1.100 ✓
# Phone:    192.168.1.101 ✓
#
# Computer: 192.168.1.100 ✗
# Phone:    192.168.43.101 ✗ (different network!)
```

**Solution:** Connect both to same WiFi

**2. Firewall blocking**
```bash
# Windows - Allow JetStart ports
netsh advfirewall firewall add rule name="JetStart HTTP" dir=in action=allow protocol=TCP localport=8765
netsh advfirewall firewall add rule name="JetStart WS" dir=in action=allow protocol=TCP localport=8766
netsh advfirewall firewall add rule name="JetStart Logs" dir=in action=allow protocol=TCP localport=8767

# macOS - Allow Node.js
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/local/bin/node

# Linux - Allow ports (ufw)
sudo ufw allow 8765:8767/tcp
```

**3. Dev server not running**
- **Solution:** Check terminal shows "JetStart dev server is running!"

**4. Port conflict**
- **Problem:** Another app using port 8765
- **Solution:** Use different port: `jetstart dev --port 9000`

### Issue: "QR code not displaying in terminal"

**Symptoms:**
- Dev server starts successfully
- No QR code appears
- Just see text output

**Causes & Solutions:**

**1. Used `--no-qr` flag**
- **Solution:** Restart without flag: `jetstart dev`

**2. Terminal doesn't support Unicode**
- **Problem:** Older Windows CMD
- **Solution:** Use Windows Terminal, PowerShell 7+, or Git Bash

**3. Terminal too small**
- **Problem:** Window height < 40 lines
- **Solution:** Resize terminal window

**4. Output redirected**
- **Problem:** Using `jetstart dev > output.log`
- **Solution:** Run normally without redirection

## Security Considerations

### Session Tokens

**Token generation:**
- 6-character alphanumeric (a-z, 0-9)
- Generated on server start
- Unique per dev server instance

**Token lifespan:**
- Valid for 1 hour (3600 seconds)
- Refreshed on client connection
- Invalidated on server restart

**Token strength:**
```
Possible combinations: 36^6 = 2,176,782,336
Brute force time (1 req/sec): 69 years
Brute force time (1000 req/sec): 25 days
```

**Why short tokens?**
- QR code size optimization
- Local development only (not production)
- Auto-expires quickly
- Network already secured by WiFi

### Network Security

**QR codes contain:**
- ✓ IP address (local network only)
- ✓ Ports (standard dev ports)
- ✓ Session ID (public identifier)
- ✓ Token (secret, short-lived)
- ✗ No passwords
- ✗ No API keys
- ✗ No source code

**Exposure risks:**

**Low risk:**
- Someone on same WiFi scans your QR code
- They can connect to your dev server
- They see your app during development

**Mitigation:**
- Use mobile hotspot for demos
- Restart server to change tokens
- Don't scan unknown QR codes

**Not a risk:**
- QR code in screenshots (IP is local, token expires)
- Recording terminal (session ends when server stops)

## Advanced Usage

### Custom QR Code Generator

Generate QR codes programmatically:

```typescript
import qrcode from 'qrcode-terminal';

const qrData = `${host}|${port}|${wsPort}|${sessionId}|${token}|${projectName}`;

qrcode.generate(qrData, { small: true }, (qr) => {
  console.log(qr);
});
```

### Manual Connection (No QR Code)

If QR scanning fails, use manual connection:

**From QR data:**
```
192.168.1.100|8765|8766|a1b2c3|xyz789|my-app
```

**Enter in app:**
1. Open JetStart app
2. Tap "Manual Connection"
3. Fill fields:
   - **Host:** 192.168.1.100
   - **Port:** 8765
   - **Session ID:** a1b2c3
   - **Token:** xyz789
4. Tap "Connect"

### Sharing QR Codes

**Demo/presentation workflow:**

1. **Start dev server on laptop**
   ```bash
   jetstart dev
   ```

2. **Project QR code on screen**
   - Use screen sharing (Zoom, Teams, etc.)
   - QR code visible to audience

3. **Attendees scan QR code**
   - Each person scans with their phone
   - Everyone connects to same dev session
   - All see live updates simultaneously

**Perfect for:**
- Conference demos
- Team presentations
- Client previews
- Teaching/workshops

## Best Practices

### ✓ DO:

**Use QR codes for:**
- Initial connection
- Quick reconnection after disconnects
- Onboarding new team members
- Demo presentations

**Optimize scanning:**
- Clean, well-lit monitor
- Terminal window maximized
- High screen brightness
- Dark terminal background

**Security:**
- Restart server for new tokens
- Use mobile hotspot for sensitive work
- Don't share QR code screenshots publicly

### ✗ DON'T:

**Avoid:**
- Scanning QR codes from untrusted sources
- Using QR codes for production deployment
- Sharing session tokens via email/chat
- Keeping dev server running when not coding

**Issues:**
- Don't take photos of QR code (just scan directly)
- Don't expect QR to work across different networks
- Don't use QR codes for authentication (use proper auth)

## QR Code Alternatives

When QR codes don't work, use these alternatives:

### 1. Manual Connection

**Best for:** Accessibility, no camera, terminal issues

```
1. Note connection details from terminal
2. Open JetStart app → Manual Connection
3. Enter host, port, session ID, token
```

### 2. Deep Links

**Best for:** Sharing via chat/email

```
jetstart://connect?host=192.168.1.100&port=8765&wsPort=8766&sessionId=a1b2c3&token=xyz789
```

Copy and send link → Recipient taps → Auto-connects

### 3. NFC Tags (Future)

**Best for:** Permanent workstations

```
1. Write connection data to NFC tag
2. Stick tag on desk
3. Tap phone to tag → Auto-connect
```

## Related Documentation

**Learn more:**
- [Creating First App](./creating-first-app.md) - See QR codes in action
- [WebSocket Protocol](../architecture/websocket-protocol.md) - Connection internals
- [Session Management](../architecture/session-management.md) - Token lifecycle
- [Connection Problems](../troubleshooting/connection-problems.md) - Detailed troubleshooting

**CLI Reference:**
- [jetstart dev](../cli/dev.md) - Dev server with QR codes
