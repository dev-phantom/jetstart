# Contributing to JetStart

Thank you for your interest in contributing to JetStart! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)

## Code of Conduct

Be respectful and constructive in all interactions. We're building a welcoming community for Android developers.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/jetstart.git
   cd jetstart
   ```
3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/dev-phantom/jetstart.git
   ```

## Development Setup

### Prerequisites

- Node.js 18+ and npm 9+
- Android SDK
- JDK 17+
- Gradle 8.2+

### Installation

```bash
# Install dependencies
npm install

# Build all packages
npm run build

# Run tests
npm test
```

### Package Structure

JetStart is a monorepo with the following packages:

- **`packages/shared`** - Shared types, protocols, and utilities
- **`packages/core`** - Build server and orchestration
- **`packages/cli`** - Command-line interface
- **`packages/client`** - Android client application
- **`packages/web`** - Web dashboard (optional)

## Project Structure

```
jetstart/
├── packages/
│   ├── shared/          # Shared TypeScript types
│   ├── core/           # Build server (Express + WebSocket)
│   ├── cli/            # CLI tool
│   ├── client/         # Android Kotlin app
│   └── web/            # Web dashboard
├── .github/
│   └── workflows/      # CI/CD workflows
└── package.json        # Root package.json
```

## Development Workflow

### Branch Naming

- `feature/your-feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

### Making Changes

1. **Create a branch** from `master`:
   ```bash
   git checkout master
   git pull upstream master
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards:
   - Use TypeScript for Node.js packages
   - Use Kotlin for Android code
   - Follow existing code style and patterns
   - Write clear, descriptive commit messages

3. **Build and test** your changes:
   ```bash
   # Build all packages
   npm run build

   # Run tests
   npm test

   # Type check
   npm run typecheck

   # Lint code
   npm run lint
   ```

### Coding Standards

#### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use async/await over promises
- Export types and interfaces
- Add JSDoc comments for public APIs

#### Kotlin

- Follow official Kotlin style guide
- Use Jetpack Compose best practices
- Prefer composable functions for UI
- Use meaningful variable names

### Commit Messages

Follow the conventional commits specification:

```
type(scope): subject

body (optional)

footer (optional)
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements

**Examples:**
```
feat(cli): add support for custom port configuration

fix(core): resolve WebSocket connection timeout issue

docs(readme): update installation instructions
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests for specific package
npm test --workspace=packages/core

# Run tests in watch mode
npm run test:watch --workspace=packages/shared

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

- Write unit tests for all new features
- Maintain test coverage above 70%
- Use Jest for TypeScript packages
- Mock external dependencies
- Test edge cases and error scenarios

## Submitting Changes

### Pull Request Process

1. **Update your branch** with latest master:
   ```bash
   git checkout master
   git pull upstream master
   git checkout your-branch
   git rebase master
   ```

2. **Push to your fork**:
   ```bash
   git push origin your-branch
   ```

3. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Description explaining what and why
   - Reference any related issues
   - Screenshots/videos for UI changes

### PR Requirements

- ✅ All CI checks pass
- ✅ Code is well-tested
- ✅ Documentation is updated
- ✅ Commit messages follow conventions
- ✅ No merge conflicts with master

### Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, a maintainer will merge

## Release Process

Only maintainers can publish releases.

### Publishing to npm

1. **Update version** in all package.json files
2. **Create a GitHub release** with tag `v{version}`
3. **CI automatically publishes** to npm via release workflow

### Versioning

We follow [Semantic Versioning](https://semver.org/):
- **MAJOR** - Breaking changes
- **MINOR** - New features (backward compatible)
- **PATCH** - Bug fixes

## Development Tips

### Working on a Single Package

```bash
# Build and watch a specific package
npm run dev --workspace=packages/core

# Run CLI locally
node packages/cli/bin/jetstart.js --help
```

### Testing Local Changes

```bash
# Link CLI globally for testing
cd packages/cli
npm link

# Test the CLI
jetstart create test-app --package com.test.app
```

### Debugging

#### Core Server
```bash
cd packages/core
npm run start:dev
```

#### CLI
```bash
cd packages/cli
node --inspect bin/jetstart.js dev
```

## Getting Help

- **Questions?** Open a [GitHub Discussion](https://github.com/dev-phantom/jetstart/discussions)
- **Bug Reports?** Open an [Issue](https://github.com/dev-phantom/jetstart/issues)
- **Ideas?** Share in [Discussions](https://github.com/dev-phantom/jetstart/discussions)

## License

By contributing to JetStart, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to JetStart!** 🚀
