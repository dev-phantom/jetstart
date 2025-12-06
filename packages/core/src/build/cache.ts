/**
 * Build Cache
 * Simple file-based caching for successful builds
 */

import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { BuildConfig, BuildResult } from '@jetstart/shared';

export interface CachedBuild {
  config: BuildConfig;
  result: BuildResult;
  timestamp: number;
}

export interface BuildCacheOptions {
  enabled: boolean;
  cachePath: string;
  maxAge?: number; // milliseconds
}

export class BuildCache {
  private enabled: boolean;
  private cachePath: string;
  private maxAge: number;
  private cache: Map<string, CachedBuild> = new Map();

  constructor(options: BuildCacheOptions) {
    this.enabled = options.enabled;
    this.cachePath = options.cachePath;
    this.maxAge = options.maxAge || 24 * 60 * 60 * 1000; // 24 hours default

    if (this.enabled) {
      this.ensureCacheDir();
      this.loadCache();
    }
  }

  /**
   * Get cached build by config
   */
  get(config: BuildConfig): CachedBuild | null {
    if (!this.enabled) {
      return null;
    }

    const hash = this.hashConfig(config);
    const cached = this.cache.get(hash);

    if (!cached) {
      return null;
    }

    // Check if cache is stale
    if (Date.now() - cached.timestamp > this.maxAge) {
      this.cache.delete(hash);
      return null;
    }

    // Validate APK still exists
    if (cached.result.apkPath && !fs.existsSync(cached.result.apkPath)) {
      this.cache.delete(hash);
      return null;
    }

    return cached;
  }

  /**
   * Set cached build
   */
  set(config: BuildConfig, result: BuildResult): void {
    if (!this.enabled || !result.success) {
      return;
    }

    const hash = this.hashConfig(config);
    const cached: CachedBuild = {
      config,
      result,
      timestamp: Date.now(),
    };

    this.cache.set(hash, cached);
    this.saveCache();
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.saveCache();
  }

  /**
   * Hash build config for cache key
   */
  private hashConfig(config: BuildConfig): string {
    const data = JSON.stringify({
      projectPath: config.projectPath,
      buildType: config.buildType,
      minifyEnabled: config.minifyEnabled,
      debuggable: config.debuggable,
      applicationId: config.applicationId,
    });
    return crypto.createHash('md5').update(data).digest('hex');
  }

  /**
   * Ensure cache directory exists
   */
  private ensureCacheDir(): void {
    if (!fs.existsSync(this.cachePath)) {
      fs.mkdirSync(this.cachePath, { recursive: true });
    }
  }

  /**
   * Load cache from disk
   */
  private loadCache(): void {
    const cacheFile = path.join(this.cachePath, 'build-cache.json');
    if (fs.existsSync(cacheFile)) {
      try {
        const data = fs.readFileSync(cacheFile, 'utf-8');
        const cacheData = JSON.parse(data);
        this.cache = new Map(Object.entries(cacheData));
      } catch (err) {
        // Ignore corrupted cache
      }
    }
  }

  /**
   * Save cache to disk
   */
  private saveCache(): void {
    const cacheFile = path.join(this.cachePath, 'build-cache.json');
    const cacheData = Object.fromEntries(this.cache);
    fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2));
  }
}
