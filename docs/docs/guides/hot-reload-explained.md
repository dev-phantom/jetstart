---
sidebar_position: 2
title: Hot Reload Explained
description: Deep dive into JetStart's two-tier hot reload system
---

# Hot Reload Explained

Understanding JetStart's blazing-fast hot reload system and how it achieves \<100ms UI updates without compromising on development experience.

## The Two-Tier System

JetStart uses **two distinct reload strategies** depending on what changed:

```
File Change Detected
        │
        ▼
  ┌─────────────┐
  │ What type?  │
  └─────┬───────┘
        │
   ┌────┴────┐
   │         │
  UI       Non-UI
   │         │
   ▼         ▼
┌──────┐  ┌──────────┐
│ DSL  │  │  Gradle  │
│ <100ms│  │ 10-30s  │
└──────┘  └──────────┘
```

### Tier 1: DSL Hot Reload (\<100ms)

**When:** UI-only changes (layouts, text, colors, styling)

**How it works:**
1. File watcher detects change in MainActivity.kt or screens/
2. DSL Parser extracts Compose UI structure from Kotlin code
3. Converts to JSON DSL representation
4. Sends JSON via WebSocket to client
5. Client re-renders UI instantly

**Performance:** \<100ms from save to screen update

### Tier 2: Full Gradle Build (10-30s)

**When:** Non-UI changes (business logic, dependencies, resources)

**How it works:**
1. File watcher detects change
2. Clears build cache
3. Runs full Gradle compilation
4. Packages new APK
5. Sends download URL to client
6. Client downloads and installs APK
7. Relaunches app

**Performance:** 10-30 seconds depending on project size

## DSL Hot Reload Deep Dive

### What is DSL?

**DSL = Domain-Specific Language**

JetStart's DSL is a JSON representation of Jetpack Compose UI:

**Kotlin Compose:**
```kotlin
@Composable
fun MyScreen() {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = "Hello JetStart!",
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            color = Color.Blue
        )
        Button(onClick = { /* ... */ }) {
            Text("Click Me")
        }
    }
}
```

**Converted to DSL JSON:**
```json
{
  "version": "1.0",
  "screen": {
    "type": "Column",
    "horizontalAlignment": "Center",
    "children": [
      {
        "type": "Text",
        "text": "Hello JetStart!",
        "style": "h4",
        "color": "#0000FF"
      },
      {
        "type": "Button",
        "text": "Click Me",
        "onClick": "handleClick"
      }
    ]
  }
}
```

### DSL Parser Workflow

```
┌───────────────────┐
│  MainActivity.kt  │
└─────────┬─────────┘
          │
          ▼
┌─────────────────────┐
│    DSL Parser       │
│  ┌───────────────┐  │
│  │ 1. Read file  │  │
│  │ 2. Find @Composable │
│  │ 3. Extract UI │  │
│  │ 4. Convert to JSON │
│  └───────────────┘  │
└─────────┬───────────┘
          │
          ▼
┌───────────────────┐
│   DSL JSON        │
│   (342 bytes)     │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   WebSocket       │
│   Send to client  │
└─────────┬─────────┘
          │
          ▼
┌───────────────────┐
│   Android Client  │
│   Re-render UI    │
│   in <100ms       │
└───────────────────┘
```

### Supported UI Elements

**Layouts:**
- Column (vertical stacking)
- Row (horizontal stacking)
- Box (layered positioning)

**Text:**
- Text (with fontSize, fontWeight, color)
- Styles: h1, h2, h3, h4, body1, body2, caption

**Interactive:**
- Button (with onClick handlers)
- TextField (future)
- Switch (future)

**Styling:**
- Colors: hex codes or named colors
- Modifiers: fillMaxSize, padding, size
- Alignment: Start, Center, End, Top, Bottom

### What Triggers DSL Reload

**✓ These trigger DSL hot reload:**

```kotlin
// Text changes
Text("Hello") → Text("Hello World")

// Color changes
color = Color.Red → color = Color.Blue

// Layout changes
Column(...) → Row(...)

// Style changes
fontSize = 16.sp → fontSize = 24.sp

// Component additions
Column { Text("A") } → Column { Text("A"); Button {} }
```

**✗ These trigger full Gradle build:**

```kotlin
// State management
var count by remember { mutableStateOf(0) }

// Function logic
fun calculate() { /* logic */ }

// Imports
import androidx.compose.material3.*

// Dependencies
implementation "androidx.compose.material3:material3"

// Resources
R.drawable.icon
R.string.app_name
```

## File Watching System

### What Gets Watched

```
project/
├── app/src/main/java/           ✓ Watched
│   ├── MainActivity.kt          ✓ DSL candidate
│   ├── screens/                 ✓ DSL candidates
│   └── components/              ✓ DSL candidates
├── app/src/main/res/            ✓ Watched → Full build
│   ├── values/                  ✓ Full build
│   ├── drawable/                ✓ Full build
│   └── layout/                  ✓ Full build
├── build.gradle                 ✓ Watched → Full build
└── jetstart.config.json         ✓ Watched → Full build
```

### File Change Detection

JetStart uses **Chokidar** for file watching:

**Features:**
- **Debouncing:** 300ms delay to batch rapid changes
- **Cross-platform:** Works on Windows, macOS, Linux
- **Efficient:** Uses native OS file watchers (inotify, FSEvents, ReadDirectoryChangesW)
- **Ignore patterns:** Skips node_modules, .git, build, .gradle

**Implementation (from server/index.ts:102-124):**
```typescript
// Watch for file changes
this.buildService.startWatching(projectPath, async (files) => {
  // Check if only UI files changed
  const uiFiles = files.filter(f =>
    f.includes('MainActivity.kt') ||
    f.includes('/screens/') ||
    f.includes('/components/')
  );

  // ALL changed files are UI files → DSL reload
  if (uiFiles.length > 0 && uiFiles.length === files.length) {
    log('🚀 UI-only changes detected, using DSL hot reload');
    this.handleUIUpdate(uiFiles[0]);
  } else {
    // Otherwise → Full Gradle build
    log('📦 Non-UI changes detected, triggering full Gradle build');
    await this.handleRebuild();
  }
});
```

## WebSocket Communication

### Protocol Messages

**1. Build Start**
```json
{
  "type": "build-start",
  "sessionId": "a1b2c3",
  "timestamp": 1699564320000
}
```

**2. UI Update (DSL)**
```json
{
  "type": "ui-update",
  "sessionId": "a1b2c3",
  "dslContent": "{\"version\":\"1.0\",\"screen\":{...}}",
  "affectedFiles": ["MainActivity.kt"],
  "timestamp": 1699564320000
}
```

**3. Build Complete (APK)**
```json
{
  "type": "build-complete",
  "sessionId": "a1b2c3",
  "downloadUrl": "http://192.168.1.100:8765/download/app.apk",
  "timestamp": 1699564350000
}
```

**4. Build Error**
```json
{
  "type": "build-error",
  "sessionId": "a1b2c3",
  "error": "Compilation failed",
  "details": [...],
  "timestamp": 1699564350000
}
```

### Connection Flow

```
┌──────────────┐                    ┌──────────────┐
│   Dev Server │                    │ Android App  │
│   Port 8766  │                    │   Client     │
└──────┬───────┘                    └──────┬───────┘
       │                                   │
       │◄──────── WebSocket Connect ───────│
       │         ws://192.168.1.100:8766   │
       │                                   │
       │──────── build-start ─────────────►│
       │                                   │
       │──────── ui-update (DSL) ─────────►│
       │         87ms from file save       │
       │                                   │
       │◄──────── update-applied ──────────│
       │         "UI updated successfully" │
       │                                   │
```

## Performance Benchmarks

### DSL Hot Reload

| Step | Duration | Notes |
|------|----------|-------|
| File save → Detection | 10-20ms | Chokidar debounce (300ms config, but immediate for single changes) |
| Parse Kotlin → DSL JSON | 5-15ms | Simple regex parsing |
| JSON stringify | 1-2ms | ~500 bytes typical |
| WebSocket send | 2-5ms | Local network |
| Client receive → Parse | 5-10ms | JSON.parse() |
| UI re-render | 40-60ms | Jetpack Compose recomposition |
| **Total** | **63-112ms** | **Average: 87ms** |

### Full Gradle Build

| Step | Duration | Notes |
|------|----------|-------|
| File save → Detection | 10-20ms | Same as DSL |
| Cache clear | 50-100ms | Delete build artifacts |
| Gradle compilation | 8-25s | Depends on project size |
| APK packaging | 1-3s | DEX, resources, signing |
| WebSocket send URL | 2-5ms | Just sends HTTP URL |
| Client download APK | 500-2000ms | ~5-10 MB APK over WiFi |
| APK installation | 2-5s | Android package manager |
| App relaunch | 1-2s | Cold start |
| **Total** | **13-38s** | **Average: 22s** |

## When DSL Falls Back to Gradle

DSL hot reload will **automatically fall back** to full Gradle build if:

1. **Parse error:** DSL Parser can't extract UI structure
2. **Non-composable changes:** State, logic, or resources changed
3. **Mixed file changes:** Both UI and non-UI files changed simultaneously
4. **Complex Compose:** Advanced features DSL doesn't support yet

**Example fallback scenario:**
```kotlin
// Initially: DSL reload works ✓
@Composable
fun MyScreen() {
    Text("Hello")
}

// Add state: Fallback to Gradle build ✗
@Composable
fun MyScreen() {
    var count by remember { mutableStateOf(0) }
    Text("Count: $count")
}
```

## Optimizing for Fast Reload

### Best Practices

**✓ DO:**
- Keep UI code in separate files (MainActivity.kt, screens/*)
- Use simple Compose structures (Column, Row, Text, Button)
- Change only text, colors, sizes, layouts
- Save files individually (not bulk save)

**✗ DON'T:**
- Mix UI and business logic in same file
- Use complex state management in UI files
- Edit build.gradle and MainActivity.kt simultaneously
- Save 10+ files at once (triggers multiple builds)

### File Organization

**Good structure (optimized for DSL):**
```
app/src/main/java/com/myapp/
├── MainActivity.kt          ← Entry point only
├── screens/
│   ├── HomeScreen.kt        ← Pure UI, DSL reload
│   ├── ProfileScreen.kt     ← Pure UI, DSL reload
│   └── SettingsScreen.kt    ← Pure UI, DSL reload
├── components/
│   ├── CustomButton.kt      ← Pure UI, DSL reload
│   └── Header.kt            ← Pure UI, DSL reload
└── viewmodels/
    └── HomeViewModel.kt     ← Logic, triggers Gradle build
```

**Bad structure (forces full builds):**
```
app/src/main/java/com/myapp/
├── MainActivity.kt          ← UI + logic mixed
└── Utils.kt                 ← UI + helpers mixed
```

## Troubleshooting

### Issue: "DSL reload not working"

**Symptoms:**
- Every change triggers 20s Gradle build
- Never see "UI hot reload sent in \<100ms"

**Causes:**
1. File not in watched directories
2. Non-UI code in same file
3. Parse errors

**Solution:**
```bash
# Check logs
jetstart logs --source core

# Look for:
# "🚀 UI-only changes detected" ← DSL reload
# "📦 Non-UI changes detected"   ← Gradle build
```

### Issue: "Changes appear, but break app"

**Cause:** DSL doesn't support advanced Compose features

**Solution:**
Add explicit DSL JSON:

```kotlin
fun getDefaultDSL(): String {
    return """
    {
      "version": "1.0",
      "screen": {
        "type": "Column",
        "children": [
          {"type": "Text", "text": "Hello"}
        ]
      }
    }
    """.trimIndent()
}
```

### Issue: "Slow hot reload (5+ seconds)"

**Causes:**
- Network latency (phone on cellular)
- Large APK download (full build triggered)
- Multiple concurrent builds

**Solution:**
```bash
# Use WiFi hotspot for lowest latency
# Check which reload type is being used
jetstart logs --level debug

# If seeing full builds, separate UI and logic files
```

## Under the Hood

### DSL Parser Source

From `packages/core/src/build/dsl-parser.ts:15-32`:

```typescript
static parseFile(filePath: string): ParseResult {
  try {
    if (!fs.existsSync(filePath)) {
      return { success: false, errors: [`File not found`] };
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return this.parseContent(content, filePath);
  } catch (error) {
    return { success: false, errors: [`Failed to read file`] };
  }
}
```

### Hot Reload Decision Logic

From `packages/core/src/server/index.ts:105-123`:

```typescript
// Check if ALL changed files are UI files
const uiFiles = files.filter(f =>
  f.includes('MainActivity.kt') ||
  f.includes('/screens/') ||
  f.includes('/components/')
);

if (uiFiles.length > 0 && uiFiles.length === files.length) {
  // DSL hot reload (FAST)
  log('🚀 UI-only changes detected, using DSL hot reload');
  this.handleUIUpdate(uiFiles[0]);
} else {
  // Full Gradle build (SLOW)
  log('📦 Non-UI changes detected, triggering full Gradle build');
  this.buildService.clearCache();
  await this.handleRebuild();
}
```

## Next Steps

**Learn more:**
- [DSL Rendering Architecture](../architecture/dsl-rendering.md) - How Android client renders DSL
- [WebSocket Protocol](../architecture/websocket-protocol.md) - Communication protocol details
- [Build System Architecture](../architecture/build-system.md) - Gradle integration
- [Performance Optimization](./performance-optimization.md) - Speed up your workflow

**Related:**
- [Creating First App](./creating-first-app.md) - See hot reload in action
- [Debugging Tips](./debugging-tips.md) - Debug hot reload issues
- [File Watching](../architecture/file-watching.md) - Technical details
