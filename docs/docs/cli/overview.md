---
sidebar_position: 1
title: CLI Overview
description: Overview of JetStart command-line interface
---

# CLI Overview

The JetStart CLI provides a simple yet powerful interface for Android development. With just 6 commands, you can create projects, run development servers, build APKs, and manage your development environment.

## Quick Command Reference

| Command | Description | Example |
|---------|-------------|---------|
| **[create](./create.md)** | Create a new JetStart project | `jetstart create my-app --package com.example.app` |
| **[dev](./dev.md)** | Start development server with hot reload | `jetstart dev --port 8765` |
| **[build](./build.md)** | Build production APK | `jetstart build --release --sign` |
| **[logs](./logs.md)** | Stream application logs | `jetstart logs --follow --level info` |
| **[install-audit](./install-audit.md)** | Check development dependencies | `jetstart install-audit --json` |
| **[android-emulator](./android-emulator.md)** | Manage Android Virtual Devices | `jetstart android-emulator` |

## Global Options

These options work with all commands:

```bash
--version, -v      # Show version number
--help, -h         # Show help information
--no-color         # Disable colored output
--verbose          # Enable verbose logging
```

## Common Workflows

### Creating a New Project

```bash
# Basic project creation
jetstart create my-app --package com.example.app

# With automatic dependency installation
jetstart create my-app --package com.example.app --full-install

# Skip dependency checks
jetstart create my-app --package com.example.app --skip-install
```

### Development Workflow

```bash
# Terminal 1: Start dev server
jetstart dev

# Terminal 2: Watch logs
jetstart logs --follow

# Make changes to your code...
# See them update in <100ms on your device!
```

### Building for Production

```bash
# Debug build (unsigned)
jetstart build

# Release build (unsigned)
jetstart build --release

# Release build (signed)
jetstart build --release --sign
```

### Managing Dependencies

```bash
# Check what's installed
jetstart install-audit

# Get JSON output for CI/CD
jetstart install-audit --json

# Create project with auto-install
jetstart create test-app --package com.test --full-install
```

### Working with Emulators

```bash
# Interactive emulator management
jetstart android-emulator

# This opens a menu where you can:
# - List existing emulators
# - Start/stop emulators
# - Create new emulators
# - Delete emulators
```

## Command Structure

All JetStart commands follow a consistent structure:

```bash
jetstart <command> [arguments] [options]
```

**Example:**
```bash
jetstart create my-app --package com.example.app --full-install
         │      │       └─────────────┬──────────────────────┘
      command   │               options/flags
             argument
```

## Output Formatting

JetStart uses consistent, colorful output for better readability:

- **✓ Green** - Success messages
- **⚠ Yellow** - Warnings
- **✗ Red** - Errors
- **🚀 Orange** - Progress/status
- **ℹ Blue** - Information

### Example Output

```bash
$ jetstart create my-app --package com.example.app

🚀 Creating JetStart project...

✓ Project structure created
✓ Gradle configuration generated
✓ Android manifest created
✓ Dependencies configured

📦 Installing npm dependencies...

✓ Dependencies installed (12.5s)

✅ Project created successfully!

Next steps:
  cd my-app
  jetstart dev
```

## Configuration

### Project-Level Configuration

Create `jetstart.config.json` in your project root:

```json
{
  "name": "my-app",
  "package": "com.example.app",
  "minSdkVersion": 24,
  "targetSdkVersion": 34,
  "port": 8765,
  "wsPort": 8766,
  "logLevel": "info",
  "autoOpenBrowser": true,
  "enableQRCode": true
}
```

### User-Level Configuration

Create `~/.jetstart/config.json` for global defaults:

```json
{
  "defaultPort": 8765,
  "defaultPackage": "com.mycompany",
  "logLevel": "info",
  "autoOpenBrowser": true,
  "theme": "dark"
}
```

### Environment Variables

Override settings with environment variables:

```bash
JETSTART_PORT=8765           # Development server port
JETSTART_LOG_LEVEL=debug     # Log verbosity
JETSTART_NO_QR=true         # Disable QR code display
DEBUG=1                      # Enable debug mode
```

## Error Handling

JetStart provides clear error messages with solutions:

```bash
$ jetstart dev

✗ Error: No jetstart.config.json found

This doesn't look like a JetStart project.

Solutions:
  • Run this command from a JetStart project directory
  • Create a new project: jetstart create my-app
  • Check if jetstart.config.json exists in current directory

For more help: jetstart --help
```

## Exit Codes

JetStart uses standard exit codes for scripting:

| Code | Meaning |
|------|---------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 126 | Command cannot execute |
| 127 | Command not found |

Use in scripts:

```bash
#!/bin/bash

if jetstart build --release; then
  echo "Build successful!"
  exit 0
else
  echo "Build failed!"
  exit 1
fi
```

## Shell Completion

Enable tab completion for your shell:

### Bash

```bash
# Add to ~/.bashrc
eval "$(jetstart completion bash)"
```

### Zsh

```bash
# Add to ~/.zshrc
eval "$(jetstart completion zsh)"
```

### Fish

```bash
# Add to ~/.config/fish/config.fish
jetstart completion fish | source
```

## Scripting with JetStart

JetStart works great in automated workflows:

### CI/CD Example

```yaml
# .github/workflows/build.yml
name: Build APK

on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install JetStart
        run: npm install -g @jetstart/cli

      - name: Check dependencies
        run: jetstart install-audit --json

      - name: Build APK
        run: jetstart build --release
```

### Automated Testing

```bash
#!/bin/bash
# test.sh

# Check environment
jetstart install-audit || exit 1

# Build app
jetstart build || exit 1

# Run tests
./gradlew test || exit 1

echo "All tests passed!"
```

## Getting Help

### Command-Specific Help

```bash
# General help
jetstart --help

# Command-specific help
jetstart create --help
jetstart dev --help
jetstart build --help
```

### Verbose Mode

Get detailed output for debugging:

```bash
jetstart dev --verbose
```

### Debug Mode

Enable full debug logging:

```bash
DEBUG=1 jetstart dev
```

## Next Steps

Explore individual commands:

- **[create](./create.md)** - Learn about project creation options
- **[dev](./dev.md)** - Master the development server
- **[build](./build.md)** - Build production APKs
- **[logs](./logs.md)** - Work with application logs
- **[install-audit](./install-audit.md)** - Manage dependencies
- **[android-emulator](./android-emulator.md)** - Control Android emulators

## Additional Resources

- [Configuration Reference](./configuration.md) - Detailed configuration options
- [Troubleshooting](../troubleshooting/common-issues.md) - Solutions to common problems
- [GitHub Issues](https://github.com/dev-phantom/jetstart/issues) - Report bugs
