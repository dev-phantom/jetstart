/**
 * Android SDK Manager wrapper
 */

import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { downloadAndExtract } from './downloader';
import { findAndroidSDK, getDefaultSDKPath } from './system-tools';
import { startSpinner, stopSpinner, updateSpinner } from './spinner';
import { success, error as logError, warning, info } from './logger';

export interface SDKComponent {
  name: string;
  path: string;
  version?: string;
  installed: boolean;
}

/**
 * Required SDK components for JetStart
 */
export const REQUIRED_SDK_COMPONENTS = [
  'platform-tools',                              // adb, fastboot
  'platforms;android-34',                        // Target API
  'platforms;android-24',                        // Minimum API
  'build-tools;34.0.0',                         // Latest build tools
  'emulator',                                    // Android Emulator
  'system-images;android-34;google_apis;x86_64', // For AVD
];

/**
 * Android cmdline-tools download URLs
 */
const CMDLINE_TOOLS_URLS = {
  win32: 'https://dl.google.com/android/repository/commandlinetools-win-11076708_latest.zip',
  darwin: 'https://dl.google.com/android/repository/commandlinetools-mac-11076708_latest.zip',
  linux: 'https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip',
};

/**
 * Android SDK Manager class
 */
export class AndroidSDKManager {
  private sdkRoot: string;

  constructor(sdkRoot?: string) {
    this.sdkRoot = sdkRoot || '';
  }

  /**
   * Initialize SDK root, detecting or creating as needed
   */
  async ensureSDKRoot(): Promise<string> {
    if (this.sdkRoot && await fs.pathExists(this.sdkRoot)) {
      return this.sdkRoot;
    }

    // Try to find existing SDK
    const existingSDK = await findAndroidSDK();
    if (existingSDK) {
      this.sdkRoot = existingSDK;
      return this.sdkRoot;
    }

    // Create new SDK at default location
    this.sdkRoot = getDefaultSDKPath();
    await fs.ensureDir(this.sdkRoot);

    info(`Creating Android SDK at: ${this.sdkRoot}`);

    return this.sdkRoot;
  }

  /**
   * Install Android cmdline-tools
   */
  async installCmdlineTools(): Promise<void> {
    const sdkRoot = await this.ensureSDKRoot();
    const platform = os.platform() as 'win32' | 'darwin' | 'linux';

    const url = CMDLINE_TOOLS_URLS[platform];
    if (!url) {
      throw new Error(`Unsupported platform: ${platform}`);
    }

    const extractPath = path.join(sdkRoot, 'cmdline-tools');
    const latestPath = path.join(extractPath, 'latest');

    // Check if already installed
    if (await fs.pathExists(latestPath)) {
      success('Android cmdline-tools already installed');
      return;
    }

    // Download and extract
    await downloadAndExtract(url, extractPath, 'Downloading Android cmdline-tools');

    // The extracted folder is named 'cmdline-tools', need to move it to 'latest'
    const extractedPath = path.join(extractPath, 'cmdline-tools');
    if (await fs.pathExists(extractedPath)) {
      await fs.move(extractedPath, latestPath);
    }

    // Set environment variables for this process
    process.env.ANDROID_HOME = sdkRoot;
    process.env.ANDROID_SDK_ROOT = sdkRoot;

    success('Android cmdline-tools installed');
  }

  /**
   * Get path to sdkmanager executable
   */
  private getSDKManagerPath(): string {
    const sdkmanagerName = os.platform() === 'win32' ? 'sdkmanager.bat' : 'sdkmanager';
    return path.join(this.sdkRoot, 'cmdline-tools', 'latest', 'bin', sdkmanagerName);
  }

  /**
   * Get path to avdmanager executable
   */
  private getAVDManagerPath(): string {
    const avdmanagerName = os.platform() === 'win32' ? 'avdmanager.bat' : 'avdmanager';
    return path.join(this.sdkRoot, 'cmdline-tools', 'latest', 'bin', avdmanagerName);
  }

  /**
   * Run sdkmanager command
   */
  private async runSDKManager(args: string[]): Promise<string> {
    const sdkmanagerPath = this.getSDKManagerPath();

    if (!await fs.pathExists(sdkmanagerPath)) {
      throw new Error('sdkmanager not found. Install cmdline-tools first.');
    }

    return new Promise((resolve, reject) => {
      const proc = spawn(sdkmanagerPath, args, {
        env: {
          ...process.env,
          ANDROID_HOME: this.sdkRoot,
          ANDROID_SDK_ROOT: this.sdkRoot,
          // Accept licenses automatically
          JAVA_OPTS: '-Dcom.android.sdkmanager.toolsdir=' + path.join(this.sdkRoot, 'cmdline-tools', 'latest'),
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
          reject(new Error(`sdkmanager exited with code ${code}: ${errorOutput}`));
        }
      });

      proc.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Accept all SDK licenses
   */
  async acceptLicenses(): Promise<void> {
    const spinner = startSpinner('Accepting SDK licenses...');

    try {
      const sdkmanagerPath = this.getSDKManagerPath();

      await new Promise<void>((resolve, reject) => {
        const proc = spawn(sdkmanagerPath, ['--licenses'], {
          env: {
            ...process.env,
            ANDROID_HOME: this.sdkRoot,
            ANDROID_SDK_ROOT: this.sdkRoot,
          },
          shell: true,
        });

        // Auto-accept all licenses by sending 'y' repeatedly
        proc.stdin?.write('y\n'.repeat(100));
        proc.stdin?.end();

        proc.on('close', (code) => {
          if (code === 0 || code === null) {
            resolve();
          } else {
            reject(new Error(`Failed to accept licenses: exit code ${code}`));
          }
        });

        proc.on('error', (err) => {
          reject(err);
        });
      });

      stopSpinner(spinner, true, 'SDK licenses accepted');
    } catch (error) {
      stopSpinner(spinner, false, 'Failed to accept licenses');
      throw error;
    }
  }

  /**
   * Install an SDK component
   */
  async installComponent(component: string, progressLabel?: string): Promise<void> {
    const label = progressLabel || `Installing ${component}`;
    const spinner = startSpinner(label);

    try {
      // Accept licenses first
      await this.acceptLicenses();

      // Install component
      await this.runSDKManager(['--install', component]);

      stopSpinner(spinner, true, `${component} installed`);
    } catch (error) {
      stopSpinner(spinner, false, `Failed to install ${component}`);
      throw error;
    }
  }

  /**
   * List installed SDK components
   */
  async listInstalled(): Promise<SDKComponent[]> {
    try {
      const output = await this.runSDKManager(['--list_installed']);
      return this.parseSDKList(output);
    } catch (error) {
      return [];
    }
  }

  /**
   * Parse sdkmanager list output
   */
  private parseSDKList(output: string): SDKComponent[] {
    const components: SDKComponent[] = [];
    const lines = output.split('\n');

    for (const line of lines) {
      // Example: "build-tools;34.0.0 | 34.0.0 | Android SDK Build-Tools 34"
      const match = line.match(/^([^|]+)\|([^|]+)\|(.+)$/);
      if (match) {
        const name = match[1].trim();
        const version = match[2].trim();

        components.push({
          name,
          version,
          path: path.join(this.sdkRoot, name.replace(/;/g, path.sep)),
          installed: true,
        });
      }
    }

    return components;
  }

  /**
   * Update all installed components
   */
  async updateAll(): Promise<void> {
    const spinner = startSpinner('Updating SDK components...');

    try {
      await this.runSDKManager(['--update']);
      stopSpinner(spinner, true, 'SDK components updated');
    } catch (error) {
      stopSpinner(spinner, false, 'Failed to update components');
      throw error;
    }
  }

  /**
   * Check if a component is installed
   */
  async isComponentInstalled(component: string): Promise<boolean> {
    const installed = await this.listInstalled();
    return installed.some((c) => c.name === component);
  }

  /**
   * Install all required components for JetStart
   */
  async installRequiredComponents(): Promise<void> {
    info('Installing required Android SDK components...');
    console.log();

    for (const component of REQUIRED_SDK_COMPONENTS) {
      try {
        await this.installComponent(component);
      } catch (error) {
        warning(`Failed to install ${component}: ${(error as Error).message}`);
      }
    }

    console.log();
    success('All required SDK components installed');
  }

  /**
   * Detect missing required components
   */
  async detectMissingComponents(): Promise<string[]> {
    const installed = await this.listInstalled();
    const installedNames = installed.map((c) => c.name);

    return REQUIRED_SDK_COMPONENTS.filter((c) => !installedNames.includes(c));
  }

  /**
   * Create local.properties file with SDK path
   */
  async createLocalProperties(projectPath: string): Promise<void> {
    const localPropertiesPath = path.join(projectPath, 'local.properties');

    // Check if already exists
    if (await fs.pathExists(localPropertiesPath)) {
      return;
    }

    const sdkRoot = await this.ensureSDKRoot();

    // Escape backslashes for Windows paths
    const sdkPathEscaped = sdkRoot.replace(/\\/g, '\\\\');

    const content = `# Automatically generated by JetStart
sdk.dir=${sdkPathEscaped}
`;

    await fs.writeFile(localPropertiesPath, content, 'utf8');
    info(`Created local.properties with SDK path`);
  }
}

/**
 * Create an SDK manager instance
 */
export function createSDKManager(sdkRoot?: string): AndroidSDKManager {
  // Check for mock mode (for testing)
  if (process.env.JETSTART_MOCK_SDK === 'true') {
    return new MockAndroidSDKManager() as any;
  }

  return new AndroidSDKManager(sdkRoot);
}

/**
 * Mock SDK manager for testing
 */
class MockAndroidSDKManager {
  async ensureSDKRoot(): Promise<string> {
    return '/mock/android/sdk';
  }

  async installCmdlineTools(): Promise<void> {
    info('[MOCK] Installing cmdline-tools');
  }

  async acceptLicenses(): Promise<void> {
    info('[MOCK] Accepting licenses');
  }

  async installComponent(component: string): Promise<void> {
    info(`[MOCK] Installing ${component}`);
  }

  async listInstalled(): Promise<SDKComponent[]> {
    return [
      { name: 'platforms;android-34', version: '1', path: '/mock/platforms/android-34', installed: true },
      { name: 'build-tools;34.0.0', version: '34.0.0', path: '/mock/build-tools/34.0.0', installed: true },
    ];
  }

  async updateAll(): Promise<void> {
    info('[MOCK] Updating all components');
  }

  async isComponentInstalled(component: string): Promise<boolean> {
    return true;
  }

  async installRequiredComponents(): Promise<void> {
    info('[MOCK] Installing required components');
  }

  async detectMissingComponents(): Promise<string[]> {
    return [];
  }

  async createLocalProperties(projectPath: string): Promise<void> {
    info(`[MOCK] Creating local.properties at ${projectPath}`);
  }
}
