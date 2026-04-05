---
sidebar_position: 7
title: jetstart clean
description: Release file locks and delete project folders on Windows
---

# jetstart clean

Stop Gradle daemons, kill Java language server processes, and remove build caches so that a project folder can be deleted on Windows. Optionally deletes the folder itself.

## Why This Command Exists

On Windows, several background processes hold open file handles on an Android project folder after `jetstart dev` is stopped:

1. **Gradle daemons** — background JVM processes that stay alive between builds
2. **Editor Java language servers** — the Kotlin Language Server, Gradle for Java, and Java Language Support extensions all run as `java.exe` and hold handles on `.gradle/` and `.kotlin/`
3. **Node.js file watchers** — JetStart's `chokidar` watcher may linger if `dev` was killed abruptly

Without cleaning these up first, Windows will show **"Folder In Use"** or **EBUSY** errors when you try to delete the project folder.

## Usage

```bash
jetstart clean [path] [options]
```

You can run it from **inside** the project folder or pass the path **from anywhere**:

```bash
# From inside the project
cd my-app
jetstart clean

# From the parent directory — no need to cd in
jetstart clean my-app

# From anywhere with a full or relative path
jetstart clean C:\Users\PC\Documents\my-app
jetstart clean ../projects/my-app
```

## Options

| Option | Description |
|--------|-------------|
| `[path]` | Path to the project folder. Defaults to the current directory if omitted. |
| `--build` | Also remove `app/build/` and `build/` directories to free disk space. The next build will be slower as Gradle rebuilds from scratch. |
| `--daemons-only` | Only stop Gradle daemons. Skips cache removal and Node.js watcher cleanup — faster but less thorough. |
| `--delete` | Delete the project folder itself after releasing all locks. Uses `rd /s /q` on Windows, which bypasses shell-level locks that regular `rm` cannot. |

## What It Does

Running `jetstart clean` executes these steps in order:

1. **Stops Gradle daemons** gracefully via `gradle --stop`, then falls back to the project's `gradlew` wrapper
2. **Kills all `java.exe` processes** — this removes Gradle daemons and editor language servers (Kotlin LS, Gradle for Java, Java LS). They restart automatically when your editor next needs them
3. **Kills Node.js file watchers** whose command line references this project path
4. **Removes `.gradle/` and `.kotlin/`** cache directories (primary sources of VS Code/editor locks)
5. **Removes `.jetstart/`** build cache
6. *(If `--build`)* Removes `app/build/` and `build/`
7. *(If `--delete`)* Deletes the entire project folder using `rd /s /q`

## Common Workflows

### Delete a project after stopping dev

```bash
# 1. Stop the dev server (Ctrl+C in the terminal running jetstart dev)

# 2. Clean and delete from the parent folder
jetstart clean my-app --delete
```

### Free disk space after a build

```bash
cd my-app
jetstart clean --build
```

### Only stop Gradle (fastest)

```bash
cd my-app
jetstart clean --daemons-only
```

## If the Folder Is Still Locked

If `jetstart clean` runs successfully but you still can't delete the folder, your **editor has it open in its Explorer panel**. The editor itself (Electron-based apps like VS Code, Antigravity, Cursor) holds a directory handle on open workspace folders.

**Fix:**

In your editor, press `Ctrl+Shift+P` → type `Close Folder` → `Enter`

Then either delete the folder manually or run:

```bash
jetstart clean my-app --delete
```

:::tip
`--delete` uses `cmd /c rd /s /q` internally, which can delete folders that a normal `rm -rf` or File Explorer cannot, because it bypasses the shell namespace layer.
:::

## Troubleshooting

### "No Android project found in the current directory"

You ran `jetstart clean` without a path argument and the current directory is not a JetStart project. Either `cd` into the project first, or pass the path:

```bash
# Wrong
cd ..
jetstart clean        # ← no path, not in a project

# Right
jetstart clean my-app
```

### The folder still can't be deleted after --delete

Your editor window has the folder open. Close the folder in your editor (see above), then run `jetstart clean my-app --delete` again.

## See Also

- [Troubleshooting — Common Issues](../troubleshooting/common-issues.md)
- [.env file — override build tool paths](../getting-started/troubleshooting-setup.md#overriding-build-tool-paths-with-a-env-file)
