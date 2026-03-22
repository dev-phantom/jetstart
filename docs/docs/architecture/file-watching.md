---
title: File Watching
description: How JetStart detects changes and decides what to do with them
---

# File Watching

`FileWatcher` is a thin wrapper around **chokidar** that monitors your Android project for changes and feeds them into the hot reload or full-build pipeline.

## What Gets Watched

```
project/
├── app/src/main/java/
│   └── **/*.kt          ΓåÉ Hot reload candidates
├── app/src/main/res/
│   └── **/*.xml         ΓåÉ Full Gradle build
├── build.gradle         ΓåÉ Full Gradle build
├── build.gradle.kts     ΓåÉ Full Gradle build
└── settings.gradle      ΓåÉ Full Gradle build
```

Patterns watched:

| Glob | Action on change |
|---|---|
| `**/*.kt` | Hot reload pipeline (Kotlin → DEX) |
| `**/*.xml` | Full Gradle build |
| `**/*.gradle` | Full Gradle build |
| `**/*.gradle.kts` | Full Gradle build |

## Ignored Paths

Changes inside these paths are never reported:

- `**/node_modules/**`
- `**/build/**`
- `**/.gradle/**`
- `**/.git/**`
- `**/dist/**`

## Debouncing

A 300ms debounce batches rapid consecutive saves into a single event. This is especially important for editors that write a temp file before the final save, or when auto-format-on-save fires immediately after a manual save.

```
Save #1 ──────ΓöÉ
Save #2 ────────────ΓöÉ
Save #3 ───────────────────ΓöÉ
                            └── 300ms of silence
                                    │
                                    ▼
                            callback([file1, file2, file3])
```

The `FileWatcher` collects changed paths in a `Set` during the debounce window, then delivers them all at once.

## Events

The watcher listens for three chokidar events and funnels them all through the same debounce logic:

| Event | Description |
|---|---|
| `change` | File content modified |
| `add` | New file created in watched tree |
| `unlink` | File deleted |

All three trigger the same callback — the hot reload pipeline or full build is responsible for deciding what to do with the changed paths.

## API

```typescript
import { FileWatcher } from '@jetstart/core';

const watcher = new FileWatcher({
  projectPath: '/path/to/my-app',
  callback: (changedFiles: string[]) => {
    // changedFiles: absolute paths of everything that changed
    console.log('Changed:', changedFiles);
  },
  debounceMs: 300, // optional, default 300
});

watcher.watch('/path/to/my-app');

// Later:
watcher.stop();
```

## How Changes Route to Hot Reload vs Full Build

After the debounce fires, `JetStartServer` inspects the changed paths:

```
Changed files received
        │
        ├── Any .gradle or .xml file?
        │         └── Yes → Full Gradle build
        │
        └── All files are .kt?
                  ├── Yes → HotReloadService.hotReload(file)
                  └── No  → Full Gradle build
```

If multiple `.kt` files changed simultaneously, the server triggers a hot reload for each one sequentially. If the set is mixed (e.g., `.kt` and `.xml` changed together), it falls back to a full Gradle build.

## Platform Notes

Chokidar uses the most efficient native watcher available on each platform:

| OS | Native watcher |
|---|---|
| Linux | `inotify` |
| macOS | `FSEvents` |
| Windows | `ReadDirectoryChangesW` |

### Linux inotify Limit

On Linux, if you see the error `ENOSPC: System limit for number of file watchers reached`, increase the kernel limit:

```bash
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

This sets a persistent limit of ~500k watched files.

