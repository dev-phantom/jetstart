---
title: Release Process
description: How versions are published
---

# Release Process

JetStart uses **semantic-release** to fully automate the release process.

## How it works

1. **Triggers**: When code is pushed to `master` (usually via PR merge).
2. **Analysis**: The system analyzes the commit messages since the last release.
3. **Versioning**:
   - `fix` commits -> Patch version bump (0.1.0 -> 0.1.1)
   - `feat` commits -> Minor version bump (0.1.0 -> 0.2.0)
   - `BREAKING CHANGE` footer -> Major version bump (0.1.0 -> 1.0.0)
4. **Publishing**:
   - Updates `package.json` versions.
   - Generates `CHANGELOG.md`.
   - Creates a specific Git tag.
   - Publishes npm packages to the registry.
   - Creates a GitHub Release.

## Manual Releases

We generally avoid manual releases. If you strictly need to release a version manually, consult with the project maintainers.
