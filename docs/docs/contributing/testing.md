---
title: Testing
description: Running and writing tests
---

# Testing

## Running Tests

We use Jest for TypeScript packages.

```bash
# Run all tests
npm test

# Run tests for a specific package
npm test --workspace=packages/core

# Run in watch mode
npm run test:watch --workspace=packages/shared
```

## Writing Tests

- **Unit Tests**: Place test files alongside source files or in a `__tests__` directory (depending on package convention, usually `tests/` folder at package root).
- **Naming**: Use `.test.ts` extension.
- **Coverage**: Aim for high coverage on utility functions and protocol parsing.

## Integration Tests

Integration tests that involve the Android emulator or file system operations should be marked and possibly run separately (currently part of the main suite but mocked).
