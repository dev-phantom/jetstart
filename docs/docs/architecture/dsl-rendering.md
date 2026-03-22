---
title: DSL Rendering
description: How the web emulator renders Compose UI previews in the browser
---

# DSL Rendering

The web emulator (`@jetstart/web`) can display a visual preview of your Compose UI inside a browser without an Android device. It does this in two complementary ways: via compiled JavaScript modules and via a JSON DSL fallback.

## Two Rendering Modes

### Mode 1: JS Module (Primary)

When `jetstart dev` detects a `.kt` file change, `js-compiler-service.ts` compiles it with `kotlinc-js` to an ES module. This is sent to the browser as a `core:js-update` message.

The browser decodes the base64 payload, creates an object URL from the module bytes, and dynamically imports it:

```javascript
const blob = new Blob([moduleBytes], { type: 'application/javascript' });
const url = URL.createObjectURL(blob);
const module = await import(url);
module.renderScreen(); // returns a component tree
```

`ComposeRenderer.tsx` calls the exported `renderScreen()` function and renders the returned component tree as Material You HTML. This gives an accurate live preview of the actual Compose code.

### Mode 2: DSL JSON (Fallback)

When a compiled JS module is not available (e.g. before the first hot reload, or if `kotlinc-js` is not set up), the server may send a `core:ui-update` message with a JSON DSL representation of the UI:

```json
{
  "type": "core:ui-update",
  "dslContent": "{\"type\":\"Column\",\"children\":[{\"type\":\"Text\",\"text\":\"Hello\"}]}",
  "screens": ["MainActivity"],
  "hash": "abc-123"
}
```

`DSLRenderer` parses this JSON tree and maps each node to a React component.

## DSL Component Set

Each node in the DSL JSON corresponds to a React component in `src/components/dsl/`:

| DSL type | React component | Compose equivalent |
|---|---|---|
| `Column` | `DSLColumn` | `Column` |
| `Row` | `DSLRow` | `Row` |
| `Box` | `DSLBox` | `Box` |
| `Text` | `DSLText` | `Text` |
| `Button` | `DSLButton` | `Button` |
| `Spacer` | `DSLSpacer` | `Spacer` |

## DSL Node Structure

```typescript
interface DSLNode {
  type: string;          // Component type (e.g. "Column", "Text")
  props?: Record<string, unknown>;  // Component properties
  modifiers?: {          // Compose Modifier chain
    padding?: number;
    fillMaxSize?: boolean;
    size?: { width: number; height: number };
    background?: string;
    [key: string]: unknown;
  };
  children?: DSLNode[];  // Child nodes (for layout containers)
  text?: string;         // Shorthand for Text nodes
  color?: string;        // CSS color string or hex
}
```

## DSL Parser Services

Two utility services help parse Compose-specific values from DSL strings:

**`alignmentParser.ts`** — converts Compose alignment strings (`Alignment.CenterHorizontally`, `Arrangement.Center`, etc.) to CSS `align-items` / `justify-content` equivalents.

**`modifierParser.ts`** — parses Compose modifier chains and converts them to inline CSS styles. Handles `Modifier.fillMaxSize()`, `.padding(16.dp)`, `.background(Color.Red)`, `.size(100.dp)`, etc.

## Rendering Pipeline

```
core:ui-update received
        │
        ▼
DSLRenderer receives dslContent string
        │
        ▼
JSON.parse(dslContent) → root DSLNode
        │
        ▼
renderNode(node) — recursive function
  ├─ type === "Column" → <DSLColumn modifiers={...}>
  │     └─ children.map(renderNode)
  ├─ type === "Row"    → <DSLRow modifiers={...}>
  ├─ type === "Box"    → <DSLBox modifiers={...}>
  ├─ type === "Text"   → <DSLText text={...} style={...} />
  ├─ type === "Button" → <DSLButton text={...} onClick={...} />
  └─ type === "Spacer" → <DSLSpacer size={...} />
        │
        ▼
React component tree → rendered inside DeviceFrame
```

## Relationship to Android Hot Reload

The DSL system is **browser-only**. It plays no role in hot reload on real Android devices. Android hot reload uses the `core:dex-reload` message carrying compiled DEX bytecode.

The web emulator's primary rendering path is also DEX-independent — it uses compiled JS modules (`core:js-update`). DSL is a secondary fallback for static preview scenarios.

## Material You Styling

All DSL components use the Material You CSS variables defined in `src/styles/material-typography.css`. Color, shape, and typography tokens follow the Material 3 design specification, giving the browser preview an appearance close to a real Android Material 3 app.

