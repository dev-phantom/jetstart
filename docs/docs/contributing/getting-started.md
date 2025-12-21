---
title: Getting Started
description: How to start contributing to JetStart
---

# Getting Started

Thank you for your interest in contributing to JetStart! This document provides guidelines and instructions for contributing.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18 or higher (v20+ recommended)
- **npm**: v9 or higher
- **Android SDK**: With Command Line Tools and Platform Tools
- **JDK**: Java 17 or higher
- **Gradle**: v8.2 or higher (usually managed by wrapper)

## Setting Up the Repository

1. **Fork the repository** on GitHub.

2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/jetstart.git
   cd jetstart
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/dev-phantom/jetstart.git
   ```

## Installation

Install all dependencies for the monorepo:

```bash
npm install
```

Build all packages to ensure everything is in order:

```bash
npm run build
```

Run tests to verify the initial state:

```bash
npm test
```
