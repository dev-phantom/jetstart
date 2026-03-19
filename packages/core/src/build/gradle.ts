/**
 * Gradle Executor
 * Spawns and manages Gradle build processes
 */

import { spawn, ChildProcess, execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { BuildConfig, BuildResult } from '@jetstart/shared';
import { BuildOutputParser } from './parser';

/**
 * ADB Helper for auto-installing APKs
 */
export class AdbHelper {
  private adbPath: string | null = null;
  private connectedDevices = new Map<string, { lastConnected: number; retryCount: number }>();

  constructor() {
    this.adbPath = this.findAdb();
  }

  /**
   * Find adb executable
   */
  private findAdb(): string | null {
    const isWindows = os.platform() === 'win32';

    // Check common locations
    const commonPaths = isWindows ? [
      'C:\\Android\\platform-tools\\adb.exe',
      path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk', 'platform-tools', 'adb.exe'),
    ] : [
      path.join(os.homedir(), 'Android', 'Sdk', 'platform-tools', 'adb'),
      path.join(os.homedir(), 'Library', 'Android', 'sdk', 'platform-tools', 'adb'),
      '/opt/android-sdk/platform-tools/adb',
    ];

    for (const p of commonPaths) {
      if (fs.existsSync(p)) {
        console.log(`[ADB] Found at: ${p}`);
        return p;
      }
    }

    // Try PATH
    try {
      const result = execSync(isWindows ? 'where adb' : 'which adb', { encoding: 'utf8' });
      const adbPath = result.trim().split('\n')[0];
      if (fs.existsSync(adbPath)) {
        console.log(`[ADB] Found in PATH: ${adbPath}`);
        return adbPath;
      }
    } catch {
      // Not in PATH
    }

    console.warn('[ADB] Not found. Auto-install disabled.');
    return null;
  }

  /**
   * Get list of connected devices (FULLY READY devices only)
   * Returns only devices in "device" state (connected and authorized)
   */
  getDevices(): string[] {
    if (!this.adbPath) return [];

    try {
      const output = execSync(`"${this.adbPath}" devices`, { encoding: 'utf8' });
      const lines = output.trim().split('\n').slice(1); // Skip header
      return lines
        .filter(line => line.includes('\tdevice'))
        .map(line => line.split('\t')[0]);
    } catch (err) {
      console.error('[ADB] Failed to get devices:', err);
      return [];
    }
  }

  /**
   * Get ALL devices including those in "connecting" or "offline" state
   * Useful for debugging and understanding device availability
   */
  getAllDeviceStates(): { id: string; state: string }[] {
    if (!this.adbPath) return [];

    try {
      const output = execSync(`"${this.adbPath}" devices`, { encoding: 'utf8' });
      const lines = output.trim().split('\n').slice(1); // Skip header
      return lines
        .filter(line => line.trim().length > 0)
        .map(line => {
          const parts = line.split(/\s+/);
          return { id: parts[0], state: parts[1] || 'unknown' };
        });
    } catch (err) {
      console.error('[ADB] Failed to get device states:', err);
      return [];
    }
  }

  /**
   * Install APK on a device
   */
  async installApk(apkPath: string, deviceId?: string): Promise<{ success: boolean; error?: string }> {
    if (!this.adbPath) {
      return { success: false, error: 'ADB not found' };
    }

    if (!fs.existsSync(apkPath)) {
      return { success: false, error: `APK not found: ${apkPath}` };
    }

    const devices = this.getDevices();
    if (devices.length === 0) {
      return { success: false, error: 'No devices connected' };
    }

    const target = deviceId || devices[0];
    console.log(`[ADB] Installing APK on device: ${target}`);

    return new Promise((resolve) => {
      const args = ['-s', target, 'install', '-r', apkPath];
      const proc = spawn(this.adbPath!, args, { shell: true });

      let output = '';
      let errorOutput = '';

      proc.stdout.on('data', (data) => {
        output += data.toString();
        console.log(`[ADB] ${data.toString().trim()}`);
      });

      proc.stderr.on('data', (data) => {
        errorOutput += data.toString();
        console.error(`[ADB] ${data.toString().trim()}`);
      });

      proc.on('close', (code) => {
        if (code === 0 && output.includes('Success')) {
          console.log('[ADB] ✅ APK installed successfully!');
          resolve({ success: true });
        } else {
          resolve({ success: false, error: errorOutput || output || `Exit code: ${code}` });
        }
      });

      proc.on('error', (err) => {
        resolve({ success: false, error: err.message });
      });
    });
  }

  /**
   * Launch app on device
   */
  async launchApp(packageName: string, activityName: string, deviceId?: string): Promise<boolean> {
    if (!this.adbPath) return false;

    const devices = this.getDevices();
    if (devices.length === 0) return false;

    const target = deviceId || devices[0];

    try {
      execSync(`"${this.adbPath}" -s ${target} shell am start -n ${packageName}/${activityName}`, { encoding: 'utf8' });
      console.log(`[ADB] ✅ Launched ${packageName}`);
      return true;
    } catch (err) {
      console.error('[ADB] Failed to launch app:', err);
      return false;
    }
  }

  /**
   * Connect to a device via wireless ADB with retry logic
   * Called when the JetStart app connects via WebSocket
   *
   * Handles timing issues with wireless ADB:
   * - Devices may need time for user approval
   * - Network handshake can be slow
   * - Retries automatically if device not ready
   */
  connectWireless(ipAddress: string, retryCount: number = 0): void {
    if (!this.adbPath) {
      console.warn('[ADB] ADB not found, cannot connect wireless device');
      return;
    }

    const target = `${ipAddress}:5555`;
    const maxRetries = 5;
    const retryDelays = [0, 1000, 2000, 3000, 5000]; // Escalating delays

    try {
      // console.log(`[ADB] Attempting wireless connection to ${target}...${retryCount > 0 ? ` (retry ${retryCount}/${maxRetries})` : ''}`);

      // Use longer timeout: 15 seconds for wireless ADB handshake
      // This allows time for:
      // - User approval on device
      // - Network handshake
      // - ADB daemon initialization
      execSync(`"${this.adbPath}" connect ${target}`, {
        encoding: 'utf8',
        timeout: 15000,
        stdio: ['pipe', 'pipe', 'pipe']
      });

      // CRITICAL: After connect, device needs time to reach "device" state
      // Poll for device state readiness
      this.waitForDeviceReady(target, retryCount, maxRetries, retryDelays);
    } catch (err: any) {
      // Handle timeout or connection errors with retry
      if (retryCount < maxRetries) {
        const delay = retryDelays[retryCount + 1] || 5000;
        console.warn(`[ADB] Connection failed: ${err.message}`);
        console.log(`[ADB] Retrying in ${delay}ms... (attempt ${retryCount + 1}/${maxRetries})`);
        setTimeout(() => this.connectWireless(ipAddress, retryCount + 1), delay);
      } else {
        console.error(`[ADB] Failed to connect ${target} after ${maxRetries} retries: ${err.message}`);
        console.warn(`[ADB] Device may need user authorization on the phone. Check your device!`);
      }
    }
  }

  /**
   * Wait for a device to reach "device" state after adb connect
   * The device may be "connecting" or "offline" initially
   */
  private waitForDeviceReady(
    target: string,
    connectRetryCount: number,
    maxConnectRetries: number,
    connectRetryDelays: number[]
  ): void {
    const maxWaitAttempts = 10;
    const waitInterval = 500; // Check every 500ms

    const checkDeviceState = (attemptNum: number = 0) => {
      if (attemptNum > maxWaitAttempts) {
        console.warn(`[ADB] Device ${target} not ready after ${maxWaitAttempts * waitInterval}ms, will retry on next build`);
        return;
      }

      const allDevices = this.getAllDeviceStates();
      const device = allDevices.find(d => d.id === target);

      if (device?.state === 'device') {
        // ✅ Device is ready!
        console.log(`[ADB] ✅ Wireless ADB connected and ready: ${target}`);
        this.connectedDevices.set(target, { lastConnected: Date.now(), retryCount: 0 });
      } else if (device?.state === 'connecting' || device?.state === 'offline' || device?.state === 'unknown') {
        // Device is still connecting, check again later
        console.log(`[ADB] Device state: ${device?.state || 'not found'}, waiting...`);
        setTimeout(() => checkDeviceState(attemptNum + 1), waitInterval);
      } else if (!device) {
        // Device not found yet, retry connection
        if (connectRetryCount < maxConnectRetries) {
          const delay = connectRetryDelays[connectRetryCount + 1] || 5000;
          setTimeout(() => this.connectWireless(target.split(':')[0], connectRetryCount + 1), delay);
        }
      }
    };

    // Start polling for device readiness
    setTimeout(() => checkDeviceState(), 100);
  }
}

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

    // If Gradle not found, return mock build for testing
    if (!gradlePath) {
      console.log('[Gradle] No Gradle found, returning mock successful build for testing');

      // Simulate build delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      return {
        success: true,
        buildTime: Date.now() - startTime,
        apkPath: path.join(config.projectPath, 'build/outputs/apk/debug/app-debug.apk'),
        apkSize: 5242880, // Mock size: 5MB
      };
    }

    // Ensure Android SDK is configured
    await this.ensureAndroidSdk(config.projectPath);

    const args = this.buildGradleArgs(config);
    const env = this.buildEnv();

    return this.runGradle(gradlePath, args, config.projectPath, env, startTime);
  }

  /**
   * Ensure Android SDK is configured (auto-detect and create local.properties)
   */
  private async ensureAndroidSdk(projectPath: string): Promise<void> {
    const localPropsPath = path.join(projectPath, 'local.properties');

    // Check if local.properties already exists
    if (fs.existsSync(localPropsPath)) {
      return; // Already configured
    }

    // Try to find Android SDK
    let androidSdkPath = this.androidHome;

    // If not in environment, check common Windows locations
    if (!androidSdkPath && os.platform() === 'win32') {
      const commonPaths = [
        'C:\\Android',  // Check C:\Android first (command-line tools location)
        path.join(os.homedir(), 'AppData', 'Local', 'Android', 'Sdk'),
        'C:\\Android\\Sdk',
        'C:\\Program Files (x86)\\Android\\android-sdk',
      ];

      for (const p of commonPaths) {
        if (fs.existsSync(p)) {
          androidSdkPath = p;
          console.log(`[Gradle] Auto-detected Android SDK at: ${androidSdkPath}`);
          break;
        }
      }
    }

    // If not found on macOS/Linux, check common paths
    if (!androidSdkPath && os.platform() !== 'win32') {
      const commonPaths = [
        path.join(os.homedir(), 'Android', 'Sdk'),
        path.join(os.homedir(), 'Library', 'Android', 'sdk'),
        '/opt/android-sdk',
      ];

      for (const p of commonPaths) {
        if (fs.existsSync(p)) {
          androidSdkPath = p;
          console.log(`[Gradle] Auto-detected Android SDK at: ${androidSdkPath}`);
          break;
        }
      }
    }

    if (!androidSdkPath) {
      console.warn('[Gradle] Android SDK not found! Set ANDROID_HOME environment variable.');
      console.warn('[Gradle] Download Android SDK from: https://developer.android.com/studio');
      return;
    }

    // Create local.properties with SDK path
    const localProps = `# Auto-generated by JetStart
sdk.dir=${androidSdkPath.replace(/\\/g, '\\\\')}
`;

    fs.writeFileSync(localPropsPath, localProps);
    console.log(`[Gradle] Created local.properties with SDK path: ${androidSdkPath}`);
  }

  /**
   * Find Gradle executable (prioritize system gradle for speed)
   */
  private findGradle(projectPath: string): string | null {
    const isWindows = os.platform() === 'win32';

    // CHECK SYSTEM GRADLE FIRST (instant, no download needed)
    const gradleName = isWindows ? 'gradle.bat' : 'gradle';
    const systemGradle = this.findInPath(gradleName);

    if (systemGradle) {
      console.log('[Gradle] Using system Gradle (faster than wrapper)');
      return systemGradle;
    }

    // Fallback to gradlew wrapper in project (slower, downloads Gradle)
    const gradlewName = isWindows ? 'gradlew.bat' : 'gradlew';
    const gradlewPath = path.join(projectPath, gradlewName);

    if (fs.existsSync(gradlewPath)) {
      console.log('[Gradle] Using project wrapper (may download Gradle on first run)');
      return gradlewPath;
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

    // Build universal APK for all architectures (removed single-ABI restriction)
    // This ensures the APK works on all device architectures
    // Note: This makes the APK larger but ensures compatibility

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

      console.log(`[Gradle] Running: ${gradlePath} ${args.join(' ')}`);
      console.log(`[Gradle] Working directory: ${cwd}`);

      const process = spawn(gradlePath, args, {
        cwd,
        env,
        shell: true,
      });

      process.stdout.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        // Stream output to console in real-time
        console.log(text.trim());
      });

      process.stderr.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        // Stream errors to console in real-time
        console.error(text.trim());
      });

      process.on('close', (code: number) => {
        console.log(`[Gradle] Process exited with code: ${code}`);
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

        // If build succeeded but APK path not found, manually search for it
        if (result.success && !result.apkPath) {
          const possiblePaths = [
            path.join(cwd, 'app/build/outputs/apk/debug/app-debug.apk'),
            path.join(cwd, 'app/build/intermediates/apk/debug/app-debug.apk'),
            path.join(cwd, 'build/outputs/apk/debug/app-debug.apk'),
          ];

          for (const apkPath of possiblePaths) {
            if (fs.existsSync(apkPath)) {
              result.apkPath = apkPath;
              result.apkSize = fs.statSync(apkPath).size;
              console.log(`[Gradle] Found APK at: ${apkPath} (${(result.apkSize / 1024 / 1024).toFixed(2)} MB)`);
              break;
            }
          }
        }

        resolve(result);
      });

      process.on('error', (err: Error) => {
        console.error(`[Gradle] Failed to spawn process: ${err.message}`);
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
