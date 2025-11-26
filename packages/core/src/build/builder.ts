/**
 * Build Service
 * Main orchestrator for build operations, caching, and file watching
 */

import { BuildConfig, BuildResult, BuildPhase, BuildStatus } from '@jetstart/shared';
import { GradleExecutor, GradleExecutorOptions } from './gradle';
import { BuildCache, BuildCacheOptions } from './cache';
import { FileWatcher } from './watcher';
import { EventEmitter } from 'events';

export interface BuildServiceOptions {
  cacheEnabled?: boolean;
  cachePath?: string;
  watchEnabled?: boolean;
  javaHome?: string;
  androidHome?: string;
}

export interface BuildServiceEvents {
  'build:start': () => void;
  'build:progress': (status: BuildStatus) => void;
  'build:complete': (result: BuildResult) => void;
  'build:error': (error: string, details?: any) => void;
  'watch:change': (files: string[]) => void;
}

export declare interface BuildService {
  on<K extends keyof BuildServiceEvents>(
    event: K,
    listener: BuildServiceEvents[K]
  ): this;
  emit<K extends keyof BuildServiceEvents>(
    event: K,
    ...args: Parameters<BuildServiceEvents[K]>
  ): boolean;
}

export class BuildService extends EventEmitter {
  private gradle: GradleExecutor;
  private cache: BuildCache;
  private watcher: FileWatcher | null = null;
  private watchEnabled: boolean;
  private isBuilding: boolean = false;

  constructor(options: BuildServiceOptions = {}) {
    super();

    // Initialize Gradle executor
    const gradleOptions: GradleExecutorOptions = {
      javaHome: options.javaHome,
      androidHome: options.androidHome,
    };
    this.gradle = new GradleExecutor(gradleOptions);

    // Initialize cache
    const cacheOptions: BuildCacheOptions = {
      enabled: options.cacheEnabled ?? true,
      cachePath: options.cachePath || require('os').tmpdir() + '/jetstart-cache',
    };
    this.cache = new BuildCache(cacheOptions);

    this.watchEnabled = options.watchEnabled ?? true;
  }

  /**
   * Build project
   */
  async build(config: BuildConfig): Promise<BuildResult> {
    if (this.isBuilding) {
      return {
        success: false,
        buildTime: 0,
        errors: [{
          file: '',
          line: 0,
          column: 0,
          message: 'Build already in progress',
          severity: 'error' as any,
        }],
      };
    }

    this.isBuilding = true;

    try {
      // Check cache
      const cached = this.cache.get(config);
      if (cached) {
        this.emit('build:complete', cached.result);
        return cached.result;
      }

      // Emit build start
      this.emit('build:start');
      this.emitProgress(BuildPhase.INITIALIZING, 0, 'Initializing build...');

      // Execute Gradle build
      this.emitProgress(BuildPhase.COMPILING, 20, 'Compiling Kotlin sources...');
      const result = await this.gradle.execute(config);

      // Cache successful builds
      if (result.success) {
        this.cache.set(config, result);
        this.emitProgress(BuildPhase.COMPLETE, 100, 'Build complete');
        this.emit('build:complete', result);
      } else {
        this.emitProgress(BuildPhase.FAILED, 0, 'Build failed');
        this.emit('build:error', 'Build failed', result.errors);
      }

      return result;
    } catch (err: any) {
      const errorResult: BuildResult = {
        success: false,
        buildTime: 0,
        errors: [{
          file: '',
          line: 0,
          column: 0,
          message: err.message || 'Unknown build error',
          severity: 'error' as any,
        }],
      };

      this.emit('build:error', err.message, err);
      return errorResult;
    } finally {
      this.isBuilding = false;
    }
  }

  /**
   * Start watching for file changes
   */
  startWatching(projectPath: string, callback: (files: string[]) => void): void {
    if (!this.watchEnabled) {
      return;
    }

    if (this.watcher) {
      this.stopWatching();
    }

    this.watcher = new FileWatcher({
      projectPath,
      callback: (files: string[]) => {
        this.emit('watch:change', files);
        callback(files);
      },
    });

    this.watcher.watch(projectPath);
  }

  /**
   * Stop watching for file changes
   */
  stopWatching(): void {
    if (this.watcher) {
      this.watcher.stop();
      this.watcher = null;
    }
  }

  /**
   * Clear build cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Check if currently building
   */
  isBuildInProgress(): boolean {
    return this.isBuilding;
  }

  /**
   * Emit build progress
   */
  private emitProgress(phase: BuildPhase, progress: number, message: string): void {
    const status: BuildStatus = {
      phase,
      progress,
      message,
      timestamp: Date.now(),
    };
    this.emit('build:progress', status);
  }
}
