---
title: Development Workflow
description: How to work on JetStart packages
---

# Development Workflow

## Project Structure

JetStart is a monorepo managed by npm workspaces:

- **`packages/shared`**: Types, protocols, and utilities shared across all packages.
- **`packages/core`**: The build server, file watcher, and architecture logic.
- **`packages/cli`**: The command-line interface.
- **`packages/client`**: The Android client application (Kotlin).
- **`packages/web`**: The web-based emulator/dashboard.

## Branching Strategy

- `master`: Main development branch.
- `feature/*`: New features (e.g., `feature/hot-reload-optimization`).
- `fix/*`: Bug fixes (e.g., `fix/websocket-timeout`).
- `docs/*`: Documentation updates.

## Making Changes

1. **Create a branch**:
   ```bash
   git checkout -b feature/my-awesome-feature
   ```

2. **Work on specific packages**:
   You can run scripts for specific workspaces to save time.

   ```bash
   # Development mode for Core
   npm run dev --workspace=packages/core

   # Watch mode for CLI
   npm run dev --workspace=packages/cli
   ```

3. **Testing local changes**:
   To test the CLI against a real project:

   ```bash
   # In packages/cli
   npm link
   
   # In a test folder
   jetstart create test-app
   ```
