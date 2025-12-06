/**
 * File Watcher
 * Watches for file changes using chokidar
 */

import * as chokidar from 'chokidar';
import * as path from 'path';

export interface FileWatcherOptions {
  projectPath: string;
  callback: (files: string[]) => void;
  debounceMs?: number;
}

export class FileWatcher {
  private watcher: chokidar.FSWatcher | null = null;
  private callback: (files: string[]) => void;
  private debounceTimer: NodeJS.Timeout | null = null;
  private debounceMs: number;
  private changedFiles: Set<string> = new Set();

  constructor(options: FileWatcherOptions) {
    this.callback = options.callback;
    this.debounceMs = options.debounceMs || 300; // 300ms default
  }

  /**
   * Start watching for file changes
   */
  watch(projectPath: string): void {
    if (this.watcher) {
      this.stop();
    }

    // Watch .kt, .xml, .gradle files
    const patterns = [
      path.join(projectPath, '**/*.kt'),
      path.join(projectPath, '**/*.xml'),
      path.join(projectPath, '**/*.gradle'),
      path.join(projectPath, '**/*.gradle.kts'),
    ];

    this.watcher = chokidar.watch(patterns, {
      ignored: [
        '**/node_modules/**',
        '**/build/**',
        '**/.gradle/**',
        '**/.git/**',
        '**/dist/**',
      ],
      persistent: true,
      ignoreInitial: true,
    });

    this.watcher.on('change', (filePath: string) => {
      this.onFileChange(filePath);
    });

    this.watcher.on('add', (filePath: string) => {
      this.onFileChange(filePath);
    });

    this.watcher.on('unlink', (filePath: string) => {
      this.onFileChange(filePath);
    });
  }

  /**
   * Stop watching
   */
  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    this.changedFiles.clear();
  }

  /**
   * Handle file change with debouncing
   */
  private onFileChange(filePath: string): void {
    this.changedFiles.add(filePath);

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer
    this.debounceTimer = setTimeout(() => {
      const files = Array.from(this.changedFiles);
      this.changedFiles.clear();
      this.callback(files);
    }, this.debounceMs);
  }
}
