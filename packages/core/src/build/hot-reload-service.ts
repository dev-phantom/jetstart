/**
 * Hot Reload Service
 * Orchestrates Kotlin compilation, DEX generation, and sending to app
 */

import * as path from 'path';
import { KotlinCompiler } from './kotlin-compiler';
import { DexGenerator } from './dex-generator';
import { log, error as logError, success } from '../utils/logger';

export interface HotReloadResult {
  success: boolean;
  dexBase64: string | null;
  classNames: string[];
  errors: string[];
  compileTime: number;
  dexTime: number;
}

export class HotReloadService {
  private kotlinCompiler: KotlinCompiler;
  private dexGenerator: DexGenerator;

  constructor(projectPath: string) {
    this.kotlinCompiler = new KotlinCompiler(projectPath);
    this.dexGenerator = new DexGenerator();
  }

  /**
   * Perform hot reload for a changed Kotlin file
   * Returns DEX bytes ready to be sent to the app
   */
  async hotReload(filePath: string): Promise<HotReloadResult> {
    const startTime = Date.now();

    log(`🔥 Hot reload starting for: ${path.basename(filePath)}`);

    // Step 1: Compile Kotlin to .class
    const compileStart = Date.now();
    const compileResult = await this.kotlinCompiler.compileFile(filePath);
    const compileTime = Date.now() - compileStart;

    if (!compileResult.success) {
      logError(`Compilation failed: ${compileResult.errors.join(', ')}`);
      return {
        success: false,
        dexBase64: null,
        classNames: [],
        errors: compileResult.errors,
        compileTime,
        dexTime: 0
      };
    }

    log(`Compilation completed in ${compileTime}ms (${compileResult.classFiles.length} classes)`);

    // Step 2: Convert .class to .dex
    const dexStart = Date.now();
    const dexResult = await this.dexGenerator.generateDex(compileResult.classFiles);
    const dexTime = Date.now() - dexStart;

    if (!dexResult.success || !dexResult.dexBytes) {
      logError(`DEX generation failed: ${dexResult.errors.join(', ')}`);
      return {
        success: false,
        dexBase64: null,
        classNames: [],
        errors: dexResult.errors,
        compileTime,
        dexTime
      };
    }

    log(`DEX generated in ${dexTime}ms (${dexResult.dexBytes.length} bytes)`);

    // Extract class names from file paths
    const classNames = this.extractClassNames(compileResult.classFiles, compileResult.outputDir);

    const totalTime = Date.now() - startTime;
    success(`🔥 Hot reload complete in ${totalTime}ms (compile: ${compileTime}ms, dex: ${dexTime}ms)`);

    return {
      success: true,
      dexBase64: dexResult.dexBytes.toString('base64'),
      classNames,
      errors: [],
      compileTime,
      dexTime
    };
  }

  /**
   * Extract fully qualified class names from class file paths
   */
  private extractClassNames(classFiles: string[], outputDir: string): string[] {
    return classFiles.map(classFile => {
      // Remove output dir prefix and .class suffix
      let relativePath = classFile
        .replace(outputDir, '')
        .replace(/^[\/\\]/, '')
        .replace('.class', '');

      // Convert path separators to dots
      return relativePath.replace(/[\/\\]/g, '.');
    });
  }

  /**
   * Check if the environment is properly set up for hot reload
   */
  async checkEnvironment(): Promise<{ ready: boolean; issues: string[] }> {
    const issues: string[] = [];

    // Check kotlinc
    const kotlinc = await this.kotlinCompiler.findKotlinc();
    if (!kotlinc) {
      issues.push('kotlinc not found - install Kotlin or set KOTLIN_HOME');
    }

    // Check d8
    const d8 = await this.dexGenerator.findD8();
    if (!d8) {
      issues.push('d8 not found - set ANDROID_HOME and install build-tools');
    }

    // Check classpath
    const classpath = await this.kotlinCompiler.buildClasspath();
    if (classpath.length === 0) {
      issues.push('Cannot build classpath - ANDROID_HOME not set or SDK not installed');
    }

    return {
      ready: issues.length === 0,
      issues
    };
  }
}
