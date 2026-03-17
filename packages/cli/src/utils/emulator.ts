/**
 * Android AVD and Emulator management utilities
 */

import { spawn, ChildProcess, exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { findAndroidSDK } from './system-tools';
import { AndroidSDKManager } from './android-sdk';
import { startSpinner, stopSpinner } from './spinner';
import { success, error as info } from './logger';

const execAsync = promisify(exec);

export interface AVDInfo {
  name: string;
  device: string;
  path: string;
  target: string;
  basedOn?: string;
  skin?: string;
  sdcard?: string;
  snapshot: boolean;
  running?: boolean;
}

export interface CreateAVDOptions {
  name: string;
  device?: string;
  apiLevel?: number;
  abi?: string;
  force?: boolean;
}

export interface EmulatorOptions {
  avdName: string;
  gpu?: 'auto' | 'host' | 'swiftshader_indirect' | 'angle_indirect' | 'guest';
  noSnapshot?: boolean;
  noBootAnim?: boolean;
  wipeData?: boolean;
}

/**
 * AVD Manager class
 */
export class AVDManager {
  private sdkRoot: string;

  constructor(sdkRoot?: string) {
    this.sdkRoot = sdkRoot || '';
  }

  /**
   * Ensure SDK root is set
   */
  private async ensureSDKRoot(): Promise<void> {
    if (this.sdkRoot && await fs.pathExists(this.sdkRoot)) {
      return;
    }

    const existingSDK = await findAndroidSDK();
    if (!existingSDK) {
      throw new Error('Android SDK not found. Run "jetstart install-audit" to check installation.');
    }

    this.sdkRoot = existingSDK;
  }

  /**
   * Get path to avdmanager executable
   */
  private getAVDManagerPath(): string {
    const avdmanagerName = os.platform() === 'win32' ? 'avdmanager.bat' : 'avdmanager';
    return path.join(this.sdkRoot, 'cmdline-tools', 'latest', 'bin', avdmanagerName);
  }

  /**
   * Get path to emulator executable
   */
  private getEmulatorPath(): string {
    const emulatorName = os.platform() === 'win32' ? 'emulator.exe' : 'emulator';
    return path.join(this.sdkRoot, 'emulator', emulatorName);
  }

  /**
   * Get path to adb executable
   */
  private getADBPath(): string {
    const adbName = os.platform() === 'win32' ? 'adb.exe' : 'adb';
    return path.join(this.sdkRoot, 'platform-tools', adbName);
  }

  /**
   * Run avdmanager command
   */
  private async runAVDManager(args: string[]): Promise<string> {
    await this.ensureSDKRoot();

    const avdmanagerPath = this.getAVDManagerPath();

    if (!await fs.pathExists(avdmanagerPath)) {
      throw new Error('avdmanager not found. Install Android cmdline-tools first.');
    }

    return new Promise((resolve, reject) => {
      const proc = spawn(avdmanagerPath, args, {
        env: {
          ...process.env,
          ANDROID_HOME: this.sdkRoot,
          ANDROID_SDK_ROOT: this.sdkRoot,
        },
        shell: true,
      });

      let output = '';
      let errorOutput = '';

      proc.stdout?.on('data', (data) => {
        output += data.toString();
      });

      proc.stderr?.on('data', (data) => {
        errorOutput += data.toString();
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(`avdmanager exited with code ${code}: ${errorOutput || output}`));
        }
      });

      proc.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * List all AVDs
   */
  async listAVDs(): Promise<AVDInfo[]> {
    try {
      const output = await this.runAVDManager(['list', 'avd']);
      const avds = this.parseAVDList(output);

      // Check which AVDs are running
      for (const avd of avds) {
        avd.running = await this.isEmulatorRunning(avd.name);
      }

      return avds;
    } catch (error) {
      return [];
    }
  }

  /**
   * Parse avdmanager list avd output
   */
  private parseAVDList(output: string): AVDInfo[] {
    const avds: AVDInfo[] = [];
    const lines = output.split('\n');

    let currentAVD: Partial<AVDInfo> = {};

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('Name:')) {
        if (currentAVD.name) {
          avds.push(currentAVD as AVDInfo);
        }
        currentAVD = {
          name: trimmed.split(':')[1]?.trim() || '',
          snapshot: false,
        };
      } else if (trimmed.startsWith('Device:')) {
        currentAVD.device = trimmed.split(':')[1]?.trim() || '';
      } else if (trimmed.startsWith('Path:')) {
        currentAVD.path = trimmed.split(':')[1]?.trim() || '';
      } else if (trimmed.startsWith('Target:')) {
        currentAVD.target = trimmed.split(':')[1]?.trim() || '';
      } else if (trimmed.startsWith('Based on:')) {
        currentAVD.basedOn = trimmed.split(':')[1]?.trim() || '';
      } else if (trimmed.startsWith('Skin:')) {
        currentAVD.skin = trimmed.split(':')[1]?.trim() || '';
      } else if (trimmed.startsWith('Sdcard:')) {
        currentAVD.sdcard = trimmed.split(':')[1]?.trim() || '';
      } else if (trimmed.includes('Snapshot')) {
        currentAVD.snapshot = true;
      }
    }

    if (currentAVD.name) {
      avds.push(currentAVD as AVDInfo);
    }

    return avds;
  }

  /**
   * Create a new AVD
   */
  async createAVD(options: CreateAVDOptions): Promise<void> {
    const {
      name,
      device = 'pixel_5',
      apiLevel = 34,
      abi = os.arch() === 'arm64' ? 'arm64-v8a' : 'x86_64',
      force = false,
    } = options;

    const spinner = startSpinner(`Creating AVD: ${name}...`);

    try {
      // Check if system image is installed
      const systemImagePackage = `system-images;android-${apiLevel};google_apis;${abi}`;
      const sdkManager = new AndroidSDKManager(this.sdkRoot);

      const isInstalled = await sdkManager.isComponentInstalled(systemImagePackage);
      if (!isInstalled) {
        stopSpinner(spinner, false, 'System image not installed');
        info(`Installing system image: ${systemImagePackage}`);
        await sdkManager.installComponent(systemImagePackage);
      }

      // Create AVD
      const args = [
        'create', 'avd',
        '--name', name,
        '--package', systemImagePackage,
        '--device', device,
      ];

      if (force) {
        args.push('--force');
      }

      // Use spawn for interactive input
      await new Promise<void>((resolve, reject) => {
        const avdmanagerPath = this.getAVDManagerPath();
        const proc = spawn(avdmanagerPath, args, {
          env: {
            ...process.env,
            ANDROID_HOME: this.sdkRoot,
            ANDROID_SDK_ROOT: this.sdkRoot,
          },
          shell: true,
        });

        // Auto-answer prompts with defaults
        proc.stdin?.write('no\n'); // Hardware profile
        proc.stdin?.end();

        let output = '';

        proc.stdout?.on('data', (data) => {
          output += data.toString();
        });

        proc.stderr?.on('data', (data) => {
          output += data.toString();
        });

        proc.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`Failed to create AVD: ${output}`));
          }
        });

        proc.on('error', (err) => {
          reject(err);
        });
      });

      stopSpinner(spinner, true, `AVD "${name}" created successfully`);
    } catch (error) {
      stopSpinner(spinner, false, `Failed to create AVD: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Delete an AVD
   */
  async deleteAVD(name: string): Promise<void> {
    const spinner = startSpinner(`Deleting AVD: ${name}...`);

    try {
      await this.runAVDManager(['delete', 'avd', '--name', name]);
      stopSpinner(spinner, true, `AVD "${name}" deleted`);
    } catch (error) {
      stopSpinner(spinner, false, `Failed to delete AVD`);
      throw error;
    }
  }

  /**
   * Start an emulator
   */
  async startEmulator(options: EmulatorOptions): Promise<ChildProcess> {
    await this.ensureSDKRoot();

    const emulatorPath = this.getEmulatorPath();

    if (!await fs.pathExists(emulatorPath)) {
      throw new Error('Emulator not found. Install Android emulator package first.');
    }

    const {
      avdName,
      gpu = 'auto',
      noSnapshot = true,
      noBootAnim = true,
      wipeData = false,
    } = options;

    const args = ['-avd', avdName];

    if (gpu) args.push('-gpu', gpu);
    if (noSnapshot) args.push('-no-snapshot-load');
    if (noBootAnim) args.push('-no-boot-anim');
    if (wipeData) args.push('-wipe-data');

    info(`Starting emulator: ${avdName}...`);

    const proc = spawn(emulatorPath, args, {
      env: {
        ...process.env,
        ANDROID_HOME: this.sdkRoot,
        ANDROID_SDK_ROOT: this.sdkRoot,
      },
      detached: true,
      stdio: 'ignore',
      shell: false,
    });

    proc.unref();

    // Wait a moment for emulator to start
    await new Promise(resolve => setTimeout(resolve, 2000));

    success(`Emulator "${avdName}" started`);
    info('Emulator is booting. This may take a few minutes...');

    return proc;
  }

  /**
   * Stop an emulator
   */
  async stopEmulator(avdName: string): Promise<void> {
    const serial = await this.findEmulatorSerial(avdName);

    if (!serial) {
      throw new Error(`Emulator "${avdName}" is not running`);
    }

    const spinner = startSpinner(`Stopping emulator: ${avdName}...`);

    try {
      const adbPath = this.getADBPath();
      await execAsync(`"${adbPath}" -s ${serial} emu kill`);
      stopSpinner(spinner, true, `Emulator "${avdName}" stopped`);
    } catch (error) {
      stopSpinner(spinner, false, 'Failed to stop emulator');
      throw error;
    }
  }

  /**
   * Check if an emulator is running
   */
  async isEmulatorRunning(avdName: string): Promise<boolean> {
    const serial = await this.findEmulatorSerial(avdName);
    return serial !== null;
  }

  /**
   * Find emulator serial number by AVD name
   */
  private async findEmulatorSerial(avdName: string): Promise<string | null> {
    try {
      const adbPath = this.getADBPath();
      const { stdout } = await execAsync(`"${adbPath}" devices`);
      const lines = stdout.split('\n');

      for (const line of lines) {
        const match = line.match(/^(emulator-\d+)\s+device$/);
        if (match) {
          const serial = match[1];

          // Check AVD name
          try {
            const { stdout: nameOutput } = await execAsync(`"${adbPath}" -s ${serial} emu avd name`);
            if (nameOutput.trim() === avdName) {
              return serial;
            }
          } catch {
            continue;
          }
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Get list of available system images for emulator
   */
  async listSystemImages(): Promise<string[]> {
    try {
      const sdkManager = new AndroidSDKManager(this.sdkRoot);
      const output = await sdkManager.listInstalled();

      return output
        .filter(c => c.name.startsWith('system-images;'))
        .map(c => c.name);
    } catch {
      return [];
    }
  }

  /**
   * Create JetStart-optimized AVD
   */
  async createJetStartAVD(): Promise<void> {
    const avdName = 'JetStart-Pixel5-API34';

    // Check if already exists
    const avds = await this.listAVDs();
    if (avds.some(a => a.name === avdName)) {
      info(`AVD "${avdName}" already exists`);
      return;
    }

    await this.createAVD({
      name: avdName,
      device: 'pixel_5',
      apiLevel: 34,
      abi: os.arch() === 'arm64' ? 'arm64-v8a' : 'x86_64',
      force: false,
    });

    success(`JetStart-optimized AVD created: ${avdName}`);
  }
}

/**
 * Create an AVD manager instance
 */
export function createAVDManager(sdkRoot?: string): AVDManager {
  return new AVDManager(sdkRoot);
}
