/**
 * Gradle Executor
 * Spawns and manages Gradle build processes
 */

import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { BuildConfig, BuildResult } from '@jetstart/shared';
import { BuildOutputParser } from './parser';

export interface GradleExecutorOptions {
  javaHome?: string;
  androidHome?: string;
}

export class GradleExecutor {
  private javaHome: string | undefined;
  private androidHome: string | undefined;

  constructor(options: GradleExecutorOptions = {}) {
    this.javaHome = options.javaHome || process.env.JAVA_HOME;
    this.androidHome = options.androidHome || process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;
  }

  /**
   * Execute Gradle build
   */
  async execute(config: BuildConfig): Promise<BuildResult> {
    const startTime = Date.now();
    const gradlePath = this.findGradle(config.projectPath);

    if (!gradlePath) {
      return {
        success: false,
        buildTime: Date.now() - startTime,
        errors: [{
          file: '',
          line: 0,
          column: 0,
          message: 'Gradle not found. Please ensure Gradle is installed or gradlew exists in project.',
          severity: 'error' as any,
        }],
      };
    }

    const args = this.buildGradleArgs(config);
    const env = this.buildEnv();

    return this.runGradle(gradlePath, args, config.projectPath, env, startTime);
  }

  /**
   * Find Gradle executable (gradlew or system gradle)
   */
  private findGradle(projectPath: string): string | null {
    // Check for gradlew in project
    const isWindows = os.platform() === 'win32';
    const gradlewName = isWindows ? 'gradlew.bat' : 'gradlew';
    const gradlewPath = path.join(projectPath, gradlewName);

    if (fs.existsSync(gradlewPath)) {
      return gradlewPath;
    }

    // Check for system gradle
    const gradleName = isWindows ? 'gradle.bat' : 'gradle';
    const systemGradle = this.findInPath(gradleName);

    if (systemGradle) {
      return systemGradle;
    }

    return null;
  }

  /**
   * Find executable in PATH
   */
  private findInPath(executableName: string): string | null {
    const pathEnv = process.env.PATH || '';
    const pathSeparator = os.platform() === 'win32' ? ';' : ':';
    const paths = pathEnv.split(pathSeparator);

    for (const dir of paths) {
      const fullPath = path.join(dir, executableName);
      if (fs.existsSync(fullPath)) {
        return fullPath;
      }
    }

    return null;
  }

  /**
   * Build Gradle arguments
   */
  private buildGradleArgs(config: BuildConfig): string[] {
    const args: string[] = [];

    // Task based on build type
    if (config.buildType === 'debug') {
      args.push('assembleDebug');
    } else {
      args.push('assembleRelease');
    }

    // Performance optimizations
    args.push('--parallel');
    args.push('--build-cache');
    args.push('--configure-on-demand');

    // Single ABI for faster builds (arm64-v8a is most common)
    args.push('-Pandroid.injected.build.abi=arm64-v8a');

    // Daemon for faster subsequent builds
    args.push('--daemon');

    // Console output
    args.push('--console=plain');

    return args;
  }

  /**
   * Build environment variables
   */
  private buildEnv(): NodeJS.ProcessEnv {
    const env = { ...process.env };

    if (this.javaHome) {
      env.JAVA_HOME = this.javaHome;
    }

    if (this.androidHome) {
      env.ANDROID_HOME = this.androidHome;
      env.ANDROID_SDK_ROOT = this.androidHome;
    }

    return env;
  }

  /**
   * Run Gradle process and collect output
   */
  private runGradle(
    gradlePath: string,
    args: string[],
    cwd: string,
    env: NodeJS.ProcessEnv,
    startTime: number
  ): Promise<BuildResult> {
    return new Promise((resolve) => {
      let output = '';

      const process = spawn(gradlePath, args, {
        cwd,
        env,
        shell: true,
      });

      process.stdout.on('data', (data: Buffer) => {
        output += data.toString();
      });

      process.stderr.on('data', (data: Buffer) => {
        output += data.toString();
      });

      process.on('close', (code: number) => {
        const result = BuildOutputParser.parse(output, startTime);

        // If process exited with error but no errors were parsed, add generic error
        if (code !== 0 && (!result.errors || result.errors.length === 0)) {
          result.errors = [{
            file: '',
            line: 0,
            column: 0,
            message: `Gradle process exited with code ${code}`,
            severity: 'error' as any,
          }];
          result.success = false;
        }

        resolve(result);
      });

      process.on('error', (err: Error) => {
        resolve({
          success: false,
          buildTime: Date.now() - startTime,
          errors: [{
            file: '',
            line: 0,
            column: 0,
            message: `Failed to spawn Gradle process: ${err.message}`,
            severity: 'error' as any,
          }],
        });
      });
    });
  }
}
