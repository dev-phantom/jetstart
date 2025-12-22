---
title: Hot Reload System
description: How JetStart achieves sub-100ms updates
---

# Hot Reload System

JetStart's hot reload system is designed to bypass the traditional Gradle build process for UI changes. It works by serializing the Kotlin Compose UI structure into a JSON-based Domain Specific Language (DSL), transmitting it over WebSockets, and reconstructing the UI on the Android client dynamically.

## Architecture

```mermaid
graph TD
    A[File Watcher] -->|Detects Change| B[DSL Parser]
    B -->|Analyzes Code| C{UI Only?}
    
    C -->|Yes| D[Generate JSON DSL]
    D -->|Describe UI| E[Core Server]
    E -->|WebSocket 'core:ui-update'| F[Android Client]
    F -->|Dynamic Composition| G[Render UI]
    
    C -->|No (Logic/Deps)| H[Gradle Build]
    H -->|Full Rebuild| I[New APK]
```

## The DSL Parser

The key component is the custom parser in `@jetstart/core`. It parses Kotlin source files using a lightweight AST traversal to identify Composable functions.

### Transformation Process

1. **Source Analysis**: The parser scans `MainActivity.kt` and other files for `@Composable` annotations.
2. **Structure Extraction**: It maps Kotlin Compose primitives (`Column`, `Row`, `Text`, `Button`) to a JSON definition.
3. **Property Mapping**: Attributes like `modifier`, `color`, and `fontSize` are extracted.

**Kotlin Code:**
```kotlin
Column(modifier = Modifier.padding(16.dp)) {
    Text(text = "Hello World", color = Color.Red)
}
```

**Generated DSL (Simplified):**
```json
{
  "type": "Column",
  "modifiers": { "padding": 16 },
  "children": [
    {
      "type": "Text",
      "props": {
        "text": "Hello World",
        "color": "#FF0000"
      }
    }
  ]
}
```

## Client-Side Rendering

On the Android side, the `JetStartRenderer` component listens for `core:ui-update` messages.

1. **Receive JSON**: The client receives the JSON payload.
2. **Map to Composables**: A recursive function maps the JSON types back to actual Compose functions.
3. **Recomposition**: The root `JetStartSurface` triggers a recomposition with the new component tree.

This process happens entirely in memory without restarting the Activity, resulting in updates under 100ms.

## Limitations

Hot reload is currently supported for:
- ✅ UI Structure (Columns, Rows, Boxes)
- ✅ Basic Components (Text, Buttons, Images)
- ✅ Modifiers (Padding, Background, Size)
- ✅ Simple State (MutableState within the Composable)

It falls back to a full build for:
- ❌ New dependencies
- ❌ Changes to logic outside Composables
- ❌ Manifest changes
- ❌ Resource additions (new drawables/strings)
