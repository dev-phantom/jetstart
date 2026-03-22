---
sidebar_position: 7
title: Performance Optimization
description: Optimize JetStart development workflow and app performance
---

# Performance Optimization

Comprehensive guide to optimizing every aspect of JetStart development - from \<50ms hot reload to production app performance and developer experience improvements.

## Optimization Areas

```
┌────────────────────────────────────────┐
│         Performance Targets            │
├────────────────────────────────────────┤
│ Hot Reload:        <100ms             │
│ Build Time:        <20s               │
│ Connection:        <2s                │
│ App Launch:        <1s                │
│ UI Responsiveness: 60 FPS             │
└────────────────────────────────────────┘
```

## Hot Reload Optimization

### Maximize Hot Reload Usage

**Goal:** \<100ms updates instead of 20s Gradle builds

**Strategy:** Keep UI and logic separate

**✓ Optimized structure:**
```
my-app/src/main/java/
├── MainActivity.kt          ← Pure UI (hot reload)
├── screens/
│   ├── HomeScreen.kt       ← Pure UI (hot reload)
│   └── ProfileScreen.kt    ← Pure UI (hot reload)
├── components/
│   └── CustomButton.kt     ← Pure UI (hot reload)
└── viewmodels/
    └── HomeViewModel.kt    ← Logic (Gradle build)
```

**✗ Slow structure:**
```
my-app/src/main/java/
└── MainActivity.kt          ← UI + logic mixed (always Gradle build)
```

**Impact:**
- Before: 20s per change (full Gradle build)
- After: 87ms per change (hot reload)
- **230x faster iteration**

### File Organization Best Practices

**DO:**
```kotlin
// screens/HomeScreen.kt (hot reload)
@Composable
fun HomeScreen() {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text("Welcome to JetStart!")
        Button(onClick = { /* ... */ }) {
            Text("Get Started")
        }
    }
}
```

**DON'T:**
```kotlin
// MainActivity.kt (forces Gradle build)
@Composable
fun HomeScreen() {
    var count by remember { mutableStateOf(0) }  // State management
    val viewModel = hiltViewModel<HomeViewModel>()  // Dependency injection

    LaunchedEffect(Unit) {  // Side effects
        viewModel.loadData()
    }

    Text("Count: $count")  // Mixed concerns
}
```

### Monitor Hot Reload Performance

**Track reload type:**
```bash
jetstart logs --source core

# Hot reload (fast):
🔥 Hot reload starting for: MainActivity.kt
UI hot reload sent in <100ms ⚡

# Gradle build (slow):
📦 Non-UI changes detected, triggering full Gradle build
Build completed in 18,432ms
```

**Metrics to track:**
- Hot reload percentage (target: >80%)
- Average hot reload time (target: \<100ms)
- Gradle build frequency (minimize)

## Build Performance

### Gradle Optimization

**1. Enable Gradle daemon:**
```gradle
// gradle.properties
org.gradle.daemon=true
org.gradle.parallel=true
org.gradle.configureondemand=true
org.gradle.caching=true
```

**2. Increase heap size:**
```gradle
// gradle.properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
```

**3. Use latest Gradle version:**
```gradle
// gradle/wrapper/gradle-wrapper.properties
distributionUrl=https\://services.gradle.org/distributions/gradle-8.2-bin.zip
```

**Impact:**
- Before: 30s builds
- After: 15-20s builds
- **40-50% faster**

### Dependency Optimization

**1. Use implementation instead of api:**
```gradle
dependencies {
    // ✗ SLOW: Forces recompilation of dependent modules
    api 'androidx.compose.material3:material3:1.1.0'

    // ✓ FAST: Hides dependency from dependent modules
    implementation 'androidx.compose.material3:material3:1.1.0'
}
```

**2. Avoid unnecessary dependencies:**
```gradle
dependencies {
    // Only include what you actually use
    implementation 'androidx.compose.material3:material3:1.1.0'
    implementation 'androidx.compose.ui:ui-tooling-preview:1.5.4'

    // ✗ Don't include entire suite if only using one component
    // implementation 'com.google.android.gms:play-services:12.0.1'
}
```

**3. Use BOM for version management:**
```gradle
dependencies {
    implementation platform('androidx.compose:compose-bom:2023.10.01')
    implementation 'androidx.compose.material3:material3'  // Version from BOM
    implementation 'androidx.compose.ui:ui'                // Version from BOM
}
```

### Incremental Builds

**Enable in `gradle.properties`:**
```properties
kotlin.incremental=true
kotlin.incremental.java=true
kotlin.incremental.js=true
```

**Result:** Only changed files recompile

**Impact:**
- Full build: 20s
- Incremental build: 5-8s
- **60-75% faster for subsequent builds**

## Network Optimization

### Connection Speed

**Use WiFi hotspot for lowest latency:**

| Connection Type | Latency | Recommended |
|----------------|---------|-------------|
| Shared WiFi | 10-50ms | Good |
| WiFi Hotspot | 2-10ms | **Best** |
| Ethernet + WiFi | 10-30ms | Good |
| Cellular | 50-200ms | Avoid |

**Setup hotspot:**

**Windows:**
1. Settings → Network → Mobile Hotspot
2. Turn on, connect phone

**macOS:**
1. System Preferences → Sharing
2. Internet Sharing → Create Network

**Linux:**
1. Network Manager → Create Hotspot
2. Connect phone

**Impact:**
- Before: 50ms network latency
- After: 5ms network latency
- **10x faster connection**

### QR Code Optimization

**Reduce scan time:**

**1. High screen brightness:**
- Dim screen: 5-10s scan time
- Bright screen: 1-2s scan time

**2. Maximize QR code size:**
```bash
# Zoom terminal
Ctrl + (Windows/Linux)
Cmd + (macOS)
```

**3. Clean terminal background:**
- Dark background: Faster scan
- Light background: Slower scan

**4. Good lighting:**
- Desk lamp: 1-2s scan
- Dark room: 5-10s scan

## App Performance

### Compose Performance

**1. Use remember for expensive calculations:**
```kotlin
@Composable
fun MyScreen(data: List<String>) {
    // ✗ BAD: Recalculates on every recomposition
    val filtered = data.filter { it.contains("keyword") }

    // ✓ GOOD: Cached, only recalculates when data changes
    val filtered = remember(data) {
        data.filter { it.contains("keyword") }
    }
}
```

**2. Avoid unnecessary recompositions:**
```kotlin
@Composable
fun MyScreen() {
    // ✗ BAD: Creates new lambda on every recomposition
    Button(onClick = { doSomething() }) {
        Text("Click")
    }

    // ✓ GOOD: Stable reference
    val onClick = remember { { doSomething() } }
    Button(onClick = onClick) {
        Text("Click")
    }
}
```

**3. Use LazyColumn for long lists:**
```kotlin
// ✗ BAD: Renders all 1000 items (slow)
Column {
    items.forEach { item ->
        Text(item.name)
    }
}

// ✓ GOOD: Only renders visible items (fast)
LazyColumn {
    items(items) { item ->
        Text(item.name)
    }
}
```

### Image Optimization

**1. Use appropriate formats:**
```
PNG: Lossless, large size (use for icons, logos)
JPEG: Lossy, smaller size (use for photos)
WebP: Best compression, smallest size (recommended for all)
Vector: Scalable, tiny size (use for simple graphics)
```

**2. Resize images appropriately:**
```kotlin
// ✗ BAD: 4000x4000 image displayed at 200x200
Image(
    painter = painterResource(R.drawable.large_image),
    modifier = Modifier.size(200.dp)
)

// ✓ GOOD: Provide 200x200 version
Image(
    painter = painterResource(R.drawable.small_image),
    modifier = Modifier.size(200.dp)
)
```

**3. Use coil for network images:**
```kotlin
implementation("io.coil-kt:coil-compose:2.4.0")

AsyncImage(
    model = "https://example.com/image.jpg",
    contentDescription = null,
    modifier = Modifier.size(200.dp)
)
```

### Memory Management

**1. Avoid memory leaks:**
```kotlin
// ✗ BAD: Leaks MainActivity reference
class MyViewModel : ViewModel() {
    lateinit var activity: MainActivity  // Holds activity reference
}

// ✓ GOOD: Use Application context or ViewModel scope
class MyViewModel(application: Application) : AndroidViewModel(application) {
    private val context = application.applicationContext
}
```

**2. Clean up resources:**
```kotlin
@Composable
fun MyScreen() {
    DisposableEffect(Unit) {
        val listener = createListener()
        registerListener(listener)

        onDispose {
            unregisterListener(listener)  // Clean up
        }
    }
}
```

**3. Use derivedStateOf for computed values:**
```kotlin
@Composable
fun MyScreen(items: List<Item>) {
    // ✗ BAD: Recalculates on every recomposition
    val total = items.sumOf { it.price }

    // ✓ GOOD: Only recalculates when items change
    val total by remember {
        derivedStateOf { items.sumOf { it.price } }
    }
}
```

## Development Workflow

### Terminal Setup

**Use fast, modern terminals:**

| Terminal | Performance | Recommended |
|----------|-------------|-------------|
| Windows CMD | Slow | ✗ Avoid |
| Windows Terminal | Fast | ✓ **Best** |
| PowerShell 7+ | Fast | ✓ Good |
| iTerm2 (macOS) | Fast | ✓ **Best** |
| GNOME Terminal | Good | ✓ Good |
| Alacritty | Very Fast | ✓ Advanced |

**Why it matters:**
- Fast terminals: QR code renders instantly
- Slow terminals: QR code takes 1-2 seconds

### Editor Performance

**VS Code optimization:**

**settings.json:**
```json
{
  "files.watcherExclude": {
    "**/.git/**": true,
    "**/node_modules/**": true,
    "**/build/**": true,
    "**/.gradle/**": true,
    "**/.jetstart/**": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/build": true,
    "**/.gradle": true
  },
  "files.exclude": {
    "**/.git": true,
    "**/.gradle": true,
    "**/build": true
  }
}
```

**Impact:**
- Reduces file watching overhead
- Faster search
- Lower CPU usage

### Multiple Terminals

**Recommended setup:**

```
Terminal 1: jetstart dev
Terminal 2: jetstart logs
Terminal 3: git commands, file operations
```

**Benefits:**
- See logs while developing
- Don't interrupt dev server
- Better debugging workflow

## Hardware Optimization

### SSD vs HDD

**Build time comparison:**

| Storage | Gradle Build | Impact |
|---------|--------------|--------|
| HDD | 40-60s | Slow |
| SATA SSD | 15-20s | **3x faster** |
| NVMe SSD | 10-15s | **4x faster** |

**Recommendation:** Store Android SDK and projects on SSD

### RAM Allocation

**Recommended configuration:**

| Total RAM | Emulator RAM | Gradle Heap | IDE | System |
|-----------|--------------|-------------|-----|--------|
| 8 GB | 1 GB | 2 GB | 2 GB | 3 GB |
| 16 GB | 2 GB | 4 GB | 4 GB | 6 GB |
| 32 GB | 4 GB | 6 GB | 6 GB | 16 GB |

**Don't over-allocate:**
- Leaving RAM for system prevents swapping
- Swapping = 10-100x slower

### CPU Cores

**Gradle parallel builds:**

```gradle
// gradle.properties
org.gradle.parallel=true
org.gradle.workers.max=4  // Number of CPU cores
```

**Emulator CPU allocation:**
- 2 cores: Acceptable
- 4 cores: Recommended
- 6+ cores: Diminishing returns

## Monitoring Performance

### Measure Build Times

**Enable build scan:**
```bash
./gradlew build --scan
```

**Analyzes:**
- Task execution times
- Dependency resolution
- Configuration time
- Suggestions for improvement

**Example output:**
```
BUILD SUCCESSFUL in 18s
47 actionable tasks: 47 executed

Publishing build scan...
https://gradle.com/s/xyz123
```

### Profile App Performance

**Android Studio Profiler:**

1. Build → Profile 'app'
2. Select device/emulator
3. Monitor:
   - CPU usage
   - Memory allocations
   - Network activity
   - Frame rendering time

**Target metrics:**
- CPU < 50% average
- Memory stable (no leaks)
- Frame time < 16ms (60 FPS)

### JetStart Performance Metrics

**Track in logs:**
```bash
jetstart logs --source core --level debug

# Watch for:
# - File change detection time
# - kotlinc compilation time
# - d8 DEX generation time
# - WebSocket send time
# - Build completion time
```

**Example metrics:**
```
[CORE] [FileWatcher] Change detected in 12ms
[CORE] [HotReload] kotlinc compiled in 48ms
[CORE] [HotReload] d8 DEX generated in 15ms
[CORE] [WebSocket] core:dex-reload sent in 3ms
Total: 78ms (well under 100ms target)
```

## Optimization Checklist

**Development workflow:**
- [ ] Use WiFi hotspot for connection
- [ ] Keep UI and logic files separate
- [ ] Monitor hot reload vs Gradle build ratio
- [ ] Use modern terminal (Windows Terminal, iTerm2)
- [ ] Configure VS Code file exclusions

**Gradle/Build:**
- [ ] Enable Gradle daemon and parallel builds
- [ ] Increase Gradle heap size (4GB+)
- [ ] Use `implementation` instead of `api`
- [ ] Enable incremental compilation
- [ ] Projects on SSD, not HDD

**App performance:**
- [ ] Use `remember` for expensive calculations
- [ ] Optimize images (WebP, appropriate sizes)
- [ ] Use LazyColumn for long lists
- [ ] Clean up resources with DisposableEffect
- [ ] Profile with Android Studio

**Hardware:**
- [ ] 16GB+ RAM recommended
- [ ] SSD for Android SDK and projects
- [ ] Hardware virtualization enabled (HAXM/WHPX/KVM)
- [ ] Allocate 2-4GB RAM to emulator

## Benchmarks

### Hot Reload Performance

| Scenario | Time | Target | Status |
|----------|------|--------|--------|
| Hot reload (simple change) | 65ms | \<100ms | ✓ |
| Hot reload (complex change) | 95ms | \<100ms | ✓ |
| Gradle build (small change) | 12s | \<20s | ✓ |
| Gradle build (full rebuild) | 25s | \<30s | ✓ |

### Network Performance

| Connection | QR Scan | WebSocket | APK Download |
|------------|---------|-----------|--------------|
| WiFi Hotspot | 1.2s | 3ms | 800ms (5MB) |
| Shared WiFi | 2.1s | 12ms | 1.2s (5MB) |
| Ethernet + WiFi | 1.8s | 8ms | 1.0s (5MB) |

### Build Performance

| Hardware | Gradle Clean Build | Incremental Build |
|----------|-------------------|-------------------|
| i5 + HDD | 45s | 15s |
| i5 + SSD | 22s | 7s |
| i7 + NVMe | 15s | 4s |
| i9 + NVMe | 12s | 3s |

## Best Practices Summary

### ✓ DO:

**For fastest hot reload:**
- Separate UI files from logic files
- Use hot reload for 80%+ of changes
- Keep Compose code simple
- Monitor reload times

**For fastest builds:**
- Enable Gradle optimizations
- Use SSD storage
- Allocate adequate RAM
- Keep dependencies minimal

**For best developer experience:**
- Use WiFi hotspot
- Modern terminal
- Multiple terminal windows
- Monitor performance metrics

### ✗ DON'T:

**Avoid:**
- Mixing UI and logic in same file
- Over-allocating RAM to emulator
- Using HDD for projects
- Ignoring slow build warnings

**Don't:**
- Run multiple emulators simultaneously
- Keep unused dependencies
- Use cellular data for connection
- Skip performance monitoring

## Related Documentation

**Learn more:**
- [Hot Reload Explained](./hot-reload-explained.md) - hot reload vs Gradle optimization
- [Working with Emulators](./working-with-emulators.md) - Emulator performance
- [Debugging Tips](./debugging-tips.md) - Performance debugging

**Architecture:**
- [Hot Reload System](../architecture/hot-reload-system.md) - Technical details
- [Build System](../architecture/build-system.md) - Build optimization
- [File Watching](../architecture/file-watching.md) - Change detection

**External resources:**
- [Gradle Performance](https://docs.gradle.org/current/userguide/performance.html)
- [Jetpack Compose Performance](https://developer.android.com/jetpack/compose/performance)
- [Android Performance](https://developer.android.com/topic/performance)
