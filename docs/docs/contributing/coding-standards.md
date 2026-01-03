---
title: Coding Standards
description: Guidelines for TypeScript and Kotlin code
---

# Coding Standards

## TypeScript (CLI/Core/Shared/Web)

- **Strict Mode**: All packages must execute in TypeScript strict mode.
- **Async/Await**: Prefer async/await over raw Promises.
- **Typing**:
  - Explicitly define return types for exported functions.
  - Use `interface` over `type` for object definitions where possible.
  - Avoid `any` - use `unknown` if type is truly uncertain.
- **Linting**: We use ESLint with Prettier. Run `npm run lint` before committing.

## Kotlin (Android Client)

- **Style**: Follow the [official Kotlin style guide](https://developer.android.com/kotlin/style-guide).
- **Compose**:
  - Composable functions should use PascalCase.
  - State should be hoisted where possible.
  - Use `Modifier` as the first optional parameter.
- **Async**: Use Coroutines for asynchronous operations.

## Commit Messages

We use **Conventional Commits** to automate versioning and changelogs.

Format: `<type>(<scope>): <subject>`

**Types:**
- `feat`: New feature (minor release)
- `fix`: Bug fix (patch release)
- `docs`: Documentation only
- `refactor`: Code change that neither fixes key nor adds feature
- `test`: Adding missing tests
- `chore`: Tooling/build changes

**Examples:**
- `feat(cli): add --verbose flag`
- `fix(core): handle disconnect race condition`
- `docs(readme): update installation steps`
