---
sidebar_position: 2
title: create
description: Create a new JetStart project
---

# jetstart create

Create a new JetStart project with complete Android/Kotlin/Jetpack Compose setup.

## Usage

```bash
jetstart create <name> [options]
```

## Arguments

- `<name>` - Project name (required)

## Options

| Option | Description | Default |
|--------|-------------|---------|
| `-p, --package <name>` | Package name (e.g., com.example.app) | Required |
| `-t, --template <name>` | Template to use | `default` |
| `--skip-install` | Skip npm install | `false` |
| `--full-install` | Auto-install all dependencies | `false` |

## Examples

```bash
# Basic project creation
jetstart create my-app --package com.example.app

# With automatic dependency installation
jetstart create my-app --package com.example.app --full-install

# Skip dependency checks
jetstart create my-app --package com.example.app --skip-install
```

[Full documentation coming soon]
