/**
 * DEX Generator Service
 * Converts .class files to .dex using d8 (Android DEX compiler)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { spawn } from 'child_process';
import { log, error as logError } from '../utils/logger';

export interface DexResult {
  success: boolean;
  dexPath: string;
  dexBytes: Buffer | null;
  errors: string[];
}

export class DexGenerator {
  private static readonly TAG = 'DexGenerator';
  private d8Path: string | null = null;

  /**
   * Find d8 executable in Android SDK
   */
  async findD8(): Promise<string | null> {
    if (this.d8Path) return this.d8Path;

    // Check multiple locations for Android SDK
    let androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;

    // Fallback to common Windows locations
    if (!androidHome) {
      const commonLocations = [
        'C:\\Android',
        path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk'),
        'C:\\Users\\Public\\Android\\Sdk',
      ];
      for (const loc of commonLocations) {
        if (fs.existsSync(path.join(loc, 'build-tools'))) {
          androidHome = loc;
          log(`Found Android SDK at: ${loc}`);
          break;
        }
      }
    }

    if (!androidHome) {
      logError('ANDROID_HOME or ANDROID_SDK_ROOT not set');
      return null;
    }

    // d8 is in build-tools
    const buildToolsDir = path.join(androidHome, 'build-tools');
    if (!fs.existsSync(buildToolsDir)) {
      logError('Android build-tools not found');
      return null;
    }

    // Find latest build-tools version
    const versions = fs.readdirSync(buildToolsDir)
      .filter(v => /^\d+\.\d+\.\d+$/.test(v))
      .sort((a, b) => {
        const aParts = a.split('.').map(Number);
        const bParts = b.split('.').map(Number);
        for (let i = 0; i < 3; i++) {
          if (aParts[i] !== bParts[i]) return bParts[i] - aParts[i];
        }
        return 0;
      });

    if (versions.length === 0) {
      logError('No Android build-tools version found');
      return null;
    }

    const d8Name = os.platform() === 'win32' ? 'd8.bat' : 'd8';
    const d8Path = path.join(buildToolsDir, versions[0], d8Name);

    if (!fs.existsSync(d8Path)) {
      logError(`d8 not found at: ${d8Path}`);
      return null;
    }

    this.d8Path = d8Path;
    log(`Found d8 at: ${d8Path} (build-tools ${versions[0]})`);
    return d8Path;
  }

  /**
   * Convert .class files to a single .dex file
   */
  async generateDex(classFiles: string[], outputDir?: string): Promise<DexResult> {
    const d8 = await this.findD8();
    if (!d8) {
      return {
        success: false,
        dexPath: '',
        dexBytes: null,
        errors: ['d8 not found - Android SDK build-tools not installed']
      };
    }

    if (classFiles.length === 0) {
      return {
        success: false,
        dexPath: '',
        dexBytes: null,
        errors: ['No class files provided']
      };
    }

    // Create output directory
    const dexOutputDir = outputDir || path.join(os.tmpdir(), 'jetstart-dex', Date.now().toString());
    fs.mkdirSync(dexOutputDir, { recursive: true });

    log(`Generating DEX from ${classFiles.length} class files...`);

    // Build d8 arguments
    const args = [
      '--output', dexOutputDir,
      '--min-api', '24',
      ...classFiles
    ];

    const result = await this.runCommand(d8, args);

    if (!result.success) {
      return {
        success: false,
        dexPath: '',
        dexBytes: null,
        errors: [result.stderr || 'DEX generation failed']
      };
    }

    // Find generated dex file
    const dexPath = path.join(dexOutputDir, 'classes.dex');
    if (!fs.existsSync(dexPath)) {
      return {
        success: false,
        dexPath: '',
        dexBytes: null,
        errors: ['DEX file not generated']
      };
    }

    const dexBytes = fs.readFileSync(dexPath);
    log(`Generated DEX: ${dexBytes.length} bytes`);

    return {
      success: true,
      dexPath,
      dexBytes,
      errors: []
    };
  }

  /**
   * Run a command and return result
   */
  private runCommand(cmd: string, args: string[]): Promise<{ success: boolean; stdout: string; stderr: string }> {
    return new Promise((resolve) => {
      const proc = spawn(cmd, args, {
        shell: os.platform() === 'win32',
        env: process.env
      });

      let stdout = '';
      let stderr = '';

      proc.stdout?.on('data', (data) => {
        stdout += data.toString();
      });

      proc.stderr?.on('data', (data) => {
        stderr += data.toString();
      });

      proc.on('close', (code) => {
        resolve({
          success: code === 0,
          stdout,
          stderr
        });
      });

      proc.on('error', (err) => {
        resolve({
          success: false,
          stdout: '',
          stderr: err.message
        });
      });
    });
  }
}
