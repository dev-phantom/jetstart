---
sidebar_position: 6
title: VS Code Extension
description: Speed up your development with the JetStart Kotlin & Compose Snippets extension
---

# JetStart VS Code Extension

The **JetStart Kotlin & Compose Snippets** extension is designed to give Android developers a fast, React-like scaffolding experience directly in VS Code. It provides robust, package-aware, and import-aware snippets for Kotlin and Jetpack Compose.

## Features

- **🚀 Smart Snippets**: Quick templates for Classes, ViewModels, Composables, Room Entities, and more.
- **📦 Package Awareness**: Automatically detects and inserts the correct `package` declaration based on your folder structure.
- **📥 Auto-Imports**: Automatically adds required imports to the top of the file when you use a snippet.
- **🔍 Compose Import Helper**: Quick suggestions for missing Compose and AndroidX imports.

---

## Installation

Since the extension is currently in beta, you can install it directly by downloading the `.vsix` package.

### 1. Download the Extension
Download the latest version of the JetStart extension:

<a href="/downloads/jetstart-kotlin-snippets.vsix" download className="button button--primary button--lg">
  📥 Download JetStart VS Code Extension (.vsix)
</a>

### 2. Install in VS Code
1. Open **Visual Studio Code**.
2. Go to the **Extensions** view (`Ctrl+Shift+X`).
3. Click the **More Actions** (...) menu in the top-right corner of the Extensions bar.
4. Select **Install from VSIX...**
5. Locate and select the `jetstart-kotlin-snippets.vsix` file you just downloaded.
6. Restart VS Code if prompted.

---

## Common Snippets

Type these prefixes in any `.kt` file to trigger the snippets:

| Prefix | What you get |
|--------|-------------|
| `ktc` | Class with auto-detected package name |
| `ktdc` | Data class |
| `ktsc` | Sealed class (Success/Error/Loading) |
| `ktec` | Enum class |
| `ktvm` | ViewModel + StateFlow + coroutine scope |
| `kthiltvm` | Hilt ViewModel + @Inject |
| `ktrep` | Repository class |
| `ktent` | Room @Entity |
| `ktdao` | Room @Dao |
| `ktdb` | Room Database singleton |
| `ktcf` | @Composable function |
| `ktcfs` | @Composable + remember state |
| `ktprev` | @Preview composable |
| `ktscaffold` | Full Scaffold + TopAppBar + FAB |
| `ktlazycol` | LazyColumn with items |
| `ktlazyr` | LazyRow with items |
| `ktlazysgrid` | LazyVerticalStaggeredGrid |
| `ktcard` | Material3 Card |
| `ktrow` / `ktcol` | Row / Column |
| `ktalertd` | AlertDialog |
| `ktbottomsheet` | ModalBottomSheet |
| `kttab` | TopAppBar |
| `ktnav` | NavHost setup |
| `ktstate` | `var x by remember { mutableStateOf(...) }` |
| `ktsflow` | MutableStateFlow + StateFlow pair |
| `ktcollect` | collectAsState() |
| `ktlaunch` / `ktsideef` / `ktdisposable` / `ktderived` | Effects |
| `ktcoro` / `ktio` / `ktasync` | Coroutines |
| `ktfun` / `ktsfun` / `ktef` / `ktlambda` | Functions |
| `ktwhen` / `ktwhenresult` | when expressions |

## Auto-features

- **Smart Package Insertion**: Open a new empty `.kt` file and the package name is auto-inserted based on the directory structure.
- **Instant Auto-Imports**: Type an identifier like `mutableStateOf` and the import suggestion appears immediately.
- **Deep Support**: Works for 150+ Compose/Kotlin identifiers across Room, Hilt, Navigation, Coroutines, and more.

---

## How it Works (and Automation)

A common question is: **Why use a manual import map instead of an official source?**

Unlike Android Studio, which builds a heavy local index of all your dependencies (often consuming significant RAM), JetStart's VS Code extension is designed for **instant, zero-latency feedback**.

1.  **The "Official" Way**: Standard IDEs use the Language Server Protocol (LSP) to scan your Gradle dependencies. While powerful, this can be slow and often fails in complex environments.
2.  **The JetStart Way**: We use a curated high-performance map of over 150 common Compose and Kotlin identifiers. This gives you *instant* suggestions the moment you type, without waiting for a background indexer.

### Automating Updates
To keep this map up-to-date without manual effort, we are working on a **Sync Runner** script that will:
- Automatically scan the `build.gradle` classpath.
- Extract public identifiers from AndroidX and Kotlin libraries.
- Regenerate the mapping files for the extension.

This ensures you always have the latest Material3 and Compose symbols without the performance cost of a full IDE indexer.

---

## Recommended Configuration

For the best experience, we recommend using this extension alongside other Kotlin tools for full IDE features like go-to-definition and linting.

### Complementary Extensions

JetStart's extension works perfectly alongside the following popular Kotlin extensions:

- **[Kotlin Language Server](https://github.com/Kotlin/kotlin-lsp)**: Provides the core IDE engine (diagnostics, formatting, etc.).
- **[Kotlin on VSCode (sethjones)](https://marketplace.visualstudio.com/items?itemName=sethjones.kotlin-on-vscode)**: A popular extension pack that bundles essential Kotlin tools.

**Why use JetStart's extension?**  
While the extensions above provide great language support, JetStart's extension is uniquely focused on **Android/Compose speed**:
- **Instant Imports**: No waiting for the Language Server to index; imports are added instantly.
- **Android-First Snippets**: Tailored templates for M3 Scaffold, ViewModels, and Room that aren't available in generic Kotlin packs.
