---
sidebar_position: 2
title: jetstart create
description: Scaffold a new Android/Compose project with JetStart
---

# jetstart create

Scaffold a complete Android Jetpack Compose project pre-configured for JetStart hot reload.

## Usage

```bash
jetstart create <name> [options]
```

## Arguments

| Argument | Required | Description |
|---|---|---|
| `<name>` | ✅ | Project directory name — letters, numbers, hyphens, underscores; must start with a letter; max 64 chars |

## Options

| Option | Default | Description |
|---|---|---|
| `-p, --package <name>` | prompted | Android package name (e.g. `com.example.app`) — reverse-domain format, at least two segments |
| `-t, --template <name>` | `default` | Project template to use |
| `--skip-install` | `false` | Skip all dependency checks |
| `--full-install` | `false` | Non-interactive: auto-install all missing dependencies (Java, Android SDK) |

## Examples

```bash
# Basic — prompts for package name, checks dependencies interactively
jetstart create my-app

# Provide package name up front
jetstart create my-app --package com.example.myapp

# Fully automated — no prompts, installs everything
jetstart create my-app --package com.example.myapp --full-install

# Skip dependency checks (assume everything is installed)
jetstart create my-app --package com.example.myapp --skip-install
```

## What Happens

### 1. Dependency Check

By default, `create` checks for:
- **Java/JDK 17+** — required for Gradle and hot reload compilation
- **Android SDK** — required for building APKs and running the hot reload DEX pipeline

If any dependency is missing, you are prompted to install it. Use `--full-install` to skip the prompts and install everything automatically.

### 2. Package Name

If `--package` is not provided, you are prompted:

```
Package name: (com.jetstart.myapp)
```

The default is generated from your project name. The value must follow Android package naming conventions (`com.company.app`).

### 3. Project Generation

JetStart generates a complete Android project:


```
my-awesome-app/
├── app/
│   ├── build.gradle              # App-level Gradle configuration
│   ├── proguard-rules.pro        # ProGuard rules
│   └── src/
│       └── main/
│           ├── AndroidManifest.xml
│           ├── java/
│           │   └── com/example/myapp/           # Your app package
│           │       ├── MainActivity.kt          # App entry point
│           │       ├── data/                    # Data models
│           │       ├── logic/                   # Business logic
│           │       └── ui/                      # UI screens & components
│           │           ├── NotesScreen.kt
│           │           └── NotesViewModel.kt
│           └── res/                              # Android resources
├── build.gradle                  # Root build file
├── settings.gradle
├── gradle.properties
├── jetstart.config.json         # JetStart configuration
├── gradlew                       # Gradle wrapper (Linux/macOS)
├── gradlew.bat                   # Gradle wrapper (Windows)
└── README.md
```



The generated app includes:
- Jetpack Compose with Material 3
- `hot-reload-runtime` library for loading DEX patches
- JetStart Gradle plugin configured for the debug variant
- `BuildConfig` fields for server URL and session token (injected by `jetstart dev`)

### 4. Next Steps Output

```
Successfully created project: my-app

Next steps:
  cd my-app
  jetstart dev
```

## Package Name Rules

The package name must:
- Use reverse-domain format: `com.company.appname`
- Contain at least two segments separated by dots
- Use only letters, numbers, and underscores in each segment
- Not start a segment with a number

Valid examples: `com.example.app`, `io.github.devphantom.jetstart`, `com.mycompany.myapp`

## Project Name Rules

The project name (directory name) must:
- Start with a letter
- Contain only letters, numbers, hyphens, and underscores
- Be 1–64 characters long

## After Creating

```bash
cd my-app

# Start the dev server
jetstart dev

# Or deploy directly to a running emulator
jetstart dev --emulator
```

See [Quick Start](../getting-started/quick-start.md) for the full walkthrough.

## Related Commands

- [jetstart dev](./dev.md) — start the development server
- [jetstart install-audit](./install-audit.md) — check dependencies separately
- [jetstart build](./build.md) — build a production APK

