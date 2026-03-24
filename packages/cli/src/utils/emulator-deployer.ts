/**
 * Android Emulator Deployment utilities
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs-extra';
import inquirer from 'inquirer';
import { createAVDManager } from './emulator';
import { startSpinner, stopSpinner } from './spinner';
import { error as logError, info } from './logger';

const execAsync = promisify(exec);

export class EmulatorDeployer {
  private adbPath: string;
  private serial: string;

  constructor(adbPath: string, serial: string) {
    this.adbPath = adbPath;
    this.serial = serial;
  }

  /**
   * Install APK on emulator
   */
  async installAPK(apkPath: string, _packageName?: string): Promise<void> {
    const spinner = startSpinner('Installing APK on emulator...');

    try {
      // Verify APK exists
      if (!(await fs.pathExists(apkPath))) {
        throw new Error(`APK not found: ${apkPath}`);
      }

      // Use -r flag to reinstall if already exists
      const { stderr } = await execAsync(
        `"${this.adbPath}" -s ${this.serial} install -r "${apkPath}"`
      );

      if (stderr && stderr.includes('INSTALL_FAILED')) {
        throw new Error(stderr);
      }

      stopSpinner(spinner, true, 'APK installed on emulator');
    } catch (error) {
      stopSpinner(spinner, false, 'Failed to install APK');
      throw error;
    }
  }

  /**
   * Launch app on emulator
   */
  async launchApp(packageName: string, activityName: string = 'MainActivity'): Promise<void> {
    const spinner = startSpinner('Launching app on emulator...');

    try {
      await execAsync(
        `"${this.adbPath}" -s ${this.serial} shell am start -n ${packageName}/.${activityName}`
      );

      stopSpinner(spinner, true, 'App launched on emulator');
    } catch (error) {
      stopSpinner(spinner, false, 'Failed to launch app');
      // Don't throw - launching is optional
      logError(`Launch failed: ${(error as Error).message}`);
    }
  }

  /**
   * Check if device is ready
   */
  async isDeviceReady(): Promise<boolean> {
    try {
      const { stdout } = await execAsync(
        `"${this.adbPath}" -s ${this.serial} shell getprop sys.boot_completed`
      );
      return stdout.trim() === '1';
    } catch {
      return false;
    }
  }

  /**
   * Wait for device to be ready
   */
  async waitForDevice(timeout: number = 120000): Promise<void> {
    const spinner = startSpinner('Waiting for emulator to boot...');
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      if (await this.isDeviceReady()) {
        stopSpinner(spinner, true, 'Emulator ready');
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    stopSpinner(spinner, false, 'Emulator boot timeout');
    throw new Error('Emulator failed to boot within timeout');
  }

  /**
   * Find or select emulator
   */
  static async findOrSelectEmulator(targetAVD?: string): Promise<EmulatorDeployer> {
    const avdManager = createAVDManager();

    try {
      // First, try the AVD manager approach
      const avds = await avdManager.listAVDs();
      const runningAVDs = avds.filter((a) => a.running);

      if (runningAVDs.length > 0) {
        let selectedAVD;

        if (targetAVD) {
          // User specified a specific AVD
          selectedAVD = runningAVDs.find((a) => a.name === targetAVD);
          if (!selectedAVD) {
            throw new Error(`Emulator "${targetAVD}" is not running`);
          }
        } else if (runningAVDs.length === 1) {
          // Only one running - use it
          selectedAVD = runningAVDs[0];
          info(`Using emulator: ${selectedAVD.name}`);
        } else {
          // Multiple running - prompt user
          const { avdName } = await inquirer.prompt([
            {
              type: 'list',
              name: 'avdName',
              message: 'Multiple emulators running. Select one:',
              choices: runningAVDs.map((a) => ({
                name: `${a.name} (${a.target || 'Unknown'})`,
                value: a.name,
              })),
            },
          ]);
          selectedAVD = runningAVDs.find((a) => a.name === avdName)!;
        }

        // Get serial for this AVD
        const serial = await (avdManager as any).findEmulatorSerial(selectedAVD.name);
        if (serial) {
          const adbPath = (avdManager as any).getADBPath();
          return new EmulatorDeployer(adbPath, serial);
        }
      }
    } catch (err) {
      // Fallback to simpler ADB-based detection
      info('Falling back to ADB device detection...');
    }

    // Fallback: Just use adb devices directly
    const adbPath = (avdManager as any).getADBPath();
    info(`ADB path: ${adbPath}`);

    let stdout: string;
    try {
      const result = await execAsync(`"${adbPath}" devices`);
      stdout = result.stdout;
      info(`ADB devices output:\n${stdout}`);
    } catch (err: any) {
      logError(`Failed to run adb devices: ${err.message}`);
      throw new Error('Failed to detect emulators. Make sure ADB is accessible.');
    }

    const lines = stdout.split('\n');
    const devices: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      info(`Checking line: "${trimmedLine}"`);
      const match = trimmedLine.match(/^(emulator-\d+)\s+device$/);
      if (match) {
        devices.push(match[1]);
        info(`Found emulator: ${match[1]}`);
      }
    }

    if (devices.length === 0) {
      throw new Error('No running emulators found. Start one with "jetstart android-emulator"');
    }

    let selectedSerial: string;

    if (devices.length === 1) {
      selectedSerial = devices[0];
      info(`Using emulator: ${selectedSerial}`);
    } else {
      // Multiple running - prompt user
      const { serial } = await inquirer.prompt([
        {
          type: 'list',
          name: 'serial',
          message: 'Multiple emulators running. Select one:',
          choices: devices.map((d) => ({
            name: d,
            value: d,
          })),
        },
      ]);
      selectedSerial = serial;
    }

    return new EmulatorDeployer(adbPath, selectedSerial);
  }
}
