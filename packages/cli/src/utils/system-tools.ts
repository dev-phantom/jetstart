/**
 * System tool detection utilities
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { compareVersions } from '@jetstart/shared';
import which from 'which';

const execAsync = promisify(exec);

export interface ToolInfo {
  name: string;
  installed: boolean;
  version?: string;
  path?: string;
  status: 'ok' | 'warning' | 'error';
  message?: string;
}

/**
 * Version requirements for different tools
 */
export const VERSION_REQUIREMENTS = {
  node: { min: '18.0.0', recommended: '20.0.0' },
  npm: { min: '9.0.0', recommended: '10.0.0' },
  java: { min: '17.0.0', recommended: '17.0.0' },
  gradle: { min: '8.0.0', recommended: '8.5.0' },
  buildTools: { min: '33.0.0', recommended: '34.0.0' },
};

/**
 * Check version compatibility status
 */
function checkVersionCompatibility(
  tool: keyof typeof VERSION_REQUIREMENTS,
  version: string
): { status: 'ok' | 'warning' | 'error'; message?: string } {
  const req = VERSION_REQUIREMENTS[tool];
  if (!req) return { status: 'ok' };

  if (compareVersions(version, req.min) < 0) {
    return {
      status: 'error',
      message: `Version ${version} is below minimum ${req.min}`,
    };
  }

  if (compareVersions(version, req.recommended) < 0) {
    return {
      status: 'warning',
      message: `Version ${version} is outdated (${req.recommended} recommended)`,
    };
  }

  return { status: 'ok' };
}

/**
 * Detect Node.js installation
 */
export async function detectNode(): Promise<ToolInfo> {
  try {
    const { stdout } = await execAsync('node --version');
    const version = stdout.trim().replace('v', '');
    const toolPath = await which('node').catch(() => undefined);

    const compat = checkVersionCompatibility('node', version);

    return {
      name: 'Node.js',
      installed: true,
      version,
      path: toolPath,
      status: compat.status,
      message: compat.message,
    };
  } catch (error) {
    return {
      name: 'Node.js',
      installed: false,
      status: 'error',
      message: 'Node.js not found. Install from https://nodejs.org',
    };
  }
}

/**
 * Detect npm installation
 */
export async function detectNpm(): Promise<ToolInfo> {
  try {
    const { stdout } = await execAsync('npm --version');
    const version = stdout.trim();
    const toolPath = await which('npm').catch(() => undefined);

    const compat = checkVersionCompatibility('npm', version);

    return {
      name: 'npm',
      installed: true,
      version,
      path: toolPath,
      status: compat.status,
      message: compat.message,
    };
  } catch (error) {
    return {
      name: 'npm',
      installed: false,
      status: 'error',
      message: 'npm not found. Install from https://nodejs.org',
    };
  }
}

/**
 * Parse Java version from command output
 */
function parseJavaVersion(output: string): string | null {
  // Handles various formats:
  // openjdk version "17.0.9" 2023-10-17
  // java version "1.8.0_291"
  // openjdk 11.0.12 2021-07-20
  const match = output.match(/version\s+"?(\d+)\.(\d+)\.(\d+)/i) ||
                 output.match(/openjdk\s+(\d+)\.(\d+)\.(\d+)/i);

  if (match) {
    // Handle old Java versioning (1.8 = Java 8)
    if (match[1] === '1') {
      return match[2]; // Return 8 from 1.8
    }
    return `${match[1]}.${match[2]}.${match[3]}`;
  }

  return null;
}

/**
 * Detect Java/JDK installation
 */
export async function detectJava(): Promise<ToolInfo> {
  const isWin = os.platform() === 'win32';
  const javaBin = isWin ? 'java.exe' : 'java';

  // Helper: run java -version from a specific binary path
  async function tryJavaAt(javaBinPath: string): Promise<string | null> {
    try {
      const { stdout } = await execAsync(`"${javaBinPath}" -version 2>&1`);
      return parseJavaVersion(stdout) ?? null;
    } catch {
      return null;
    }
  }

  // 1. Try java from PATH
  try {
    const { stdout } = await execAsync('java -version 2>&1');
    const version = parseJavaVersion(stdout);
    if (version) {
      const toolPath = process.env.JAVA_HOME || (await which('java').catch(() => undefined));
      const compat = checkVersionCompatibility('java', version);
      return { name: 'Java/JDK', installed: true, version, path: toolPath, status: compat.status, message: compat.message };
    }
  } catch { /* not in PATH */ }

  // 2. Try via JAVA_HOME
  const javaHome = process.env.JAVA_HOME;
  if (javaHome) {
    const candidate = path.join(javaHome, 'bin', javaBin);
    if (await fs.pathExists(candidate)) {
      const version = await tryJavaAt(candidate);
      if (version) {
        const compat = checkVersionCompatibility('java', version);
        return { name: 'Java/JDK', installed: true, version, path: javaHome, status: compat.status, message: compat.message };
      }
    }
  }

  // 3. Probe common install locations (Windows only)
  if (isWin) {
    const homeDir = os.homedir();
    const roots = [
      'C:\\Program Files\\Eclipse Adoptium',
      'C:\\Program Files\\Java',
      'C:\\Program Files\\Microsoft',
      path.join(homeDir, 'AppData', 'Local', 'Programs', 'Eclipse Adoptium'),
      path.join(homeDir, '.jdks'),
    ];
    for (const root of roots) {
      if (!(await fs.pathExists(root))) continue;
      // root itself might be the JDK
      const direct = path.join(root, 'bin', javaBin);
      if (await fs.pathExists(direct)) {
        const version = await tryJavaAt(direct);
        if (version) {
          const compat = checkVersionCompatibility('java', version);
          return { name: 'Java/JDK', installed: true, version, path: root, status: compat.status, message: compat.message };
        }
      }
      // root contains versioned subdirectories
      try {
        const entries = await fs.readdir(root);
        for (const entry of entries) {
          const candidate = path.join(root, entry, 'bin', javaBin);
          if (await fs.pathExists(candidate)) {
            const version = await tryJavaAt(candidate);
            if (version) {
              const compat = checkVersionCompatibility('java', version);
              return { name: 'Java/JDK', installed: true, version, path: path.join(root, entry), status: compat.status, message: compat.message };
            }
          }
        }
      } catch { /* ignore */ }
    }
  }

  return {
    name: 'Java/JDK',
    installed: false,
    status: 'error',
    message: 'Java not found. Install JDK 17+ from https://adoptium.net',
  };
}

/**
 * Detect Gradle installation
 */
export async function detectGradle(): Promise<ToolInfo> {
  try {
    const { stdout } = await execAsync('gradle --version');
    const match = stdout.match(/Gradle\s+(\d+\.\d+(?:\.\d+)?)/);
    const version = match ? match[1] : undefined;

    if (!version) {
      return {
        name: 'Gradle',
        installed: true,
        status: 'warning',
        message: 'Gradle found but version could not be determined',
      };
    }

    const toolPath = await which('gradle').catch(() => undefined);
    const compat = checkVersionCompatibility('gradle', version);

    return {
      name: 'Gradle',
      installed: true,
      version,
      path: toolPath,
      status: compat.status,
      message: compat.message,
    };
  } catch (error) {
    return {
      name: 'Gradle',
      installed: false,
      status: 'warning',
      message: 'Gradle not found (Gradle wrapper will be used)',
    };
  }
}

/**
 * Get default Android SDK path based on platform
 */
export function getDefaultSDKPath(): string {
  const homeDir = os.homedir();
  const platform = os.platform();

  switch (platform) {
    case 'win32':
      return path.join(homeDir, 'AppData', 'Local', 'Android', 'Sdk');
    case 'darwin':
      return path.join(homeDir, 'Library', 'Android', 'sdk');
    default: // Linux
      return path.join(homeDir, 'Android', 'Sdk');
  }
}

/**
 * Find Android SDK location
 */
export async function findAndroidSDK(): Promise<string | null> {
  // Check environment variables first
  const envPaths = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
  ].filter(Boolean);

  for (const envPath of envPaths) {
    if (envPath && await fs.pathExists(envPath)) {
      return envPath;
    }
  }

  // Check default path
  const defaultPath = getDefaultSDKPath();
  if (await fs.pathExists(defaultPath)) {
    return defaultPath;
  }

  // Check alternative paths
  const platform = os.platform();
  const homeDir = os.homedir();
  const altPaths: string[] = [];

  if (platform === 'win32') {
    altPaths.push(
      'C:\\Android\\Sdk',
      'C:\\Android',
      path.join(homeDir, 'AppData', 'Local', 'Android', 'Sdk'),
      'C:\\Program Files (x86)\\Android\\android-sdk'
    );
  } else if (platform === 'darwin') {
    altPaths.push(
      path.join(homeDir, 'Library', 'Android', 'sdk'),
      '/opt/android-sdk'
    );
  } else {
    altPaths.push(
      path.join(homeDir, 'Android', 'Sdk'),
      '/opt/android-sdk'
    );
  }

  for (const altPath of altPaths) {
    if (await fs.pathExists(altPath)) {
      return altPath;
    }
  }

  return null;
}

/**
 * Detect Android SDK installation
 */
export async function detectAndroidSDK(): Promise<ToolInfo> {
  const sdkPath = await findAndroidSDK();

  if (!sdkPath) {
    return {
      name: 'Android SDK',
      installed: false,
      status: 'error',
      message: 'Android SDK not found. Run "jetstart create --full-install" to install',
    };
  }

  // Verify it's a valid SDK
  const platformsPath = path.join(sdkPath, 'platforms');
  const buildToolsPath = path.join(sdkPath, 'build-tools');

  const isValid = (await fs.pathExists(platformsPath)) || (await fs.pathExists(buildToolsPath));

  if (!isValid) {
    return {
      name: 'Android SDK',
      installed: true,
      path: sdkPath,
      status: 'warning',
      message: 'SDK found but appears incomplete',
    };
  }

  return {
    name: 'Android SDK',
    installed: true,
    path: sdkPath,
    status: 'ok',
  };
}

/**
 * Detect Android cmdline-tools
 */
export async function detectAndroidCmdlineTools(): Promise<ToolInfo> {
  const sdkPath = await findAndroidSDK();

  if (!sdkPath) {
    return {
      name: 'cmdline-tools',
      installed: false,
      status: 'error',
      message: 'Android SDK not found',
    };
  }

  const sdkmanagerName = os.platform() === 'win32' ? 'sdkmanager.bat' : 'sdkmanager';
  const candidates = [
    path.join(sdkPath, 'cmdline-tools', 'latest', 'bin', sdkmanagerName),
    path.join(sdkPath, 'cmdline-tools', 'bin', sdkmanagerName),
    path.join(sdkPath, 'tools', 'bin', sdkmanagerName),
  ];

  let foundPath: string | undefined;
  for (const candidate of candidates) {
    if (await fs.pathExists(candidate)) {
      foundPath = path.dirname(path.dirname(candidate));
      break;
    }
  }

  if (!foundPath) {
    return {
      name: 'cmdline-tools',
      installed: false,
      status: 'error',
      message: 'Android cmdline-tools not installed. Run "jetstart create --full-install" to install',
    };
  }

  // Try to get version
  try {
    const sdkmanagerPath = path.join(
      foundPath,
      'bin',
      sdkmanagerName
    );
    const { stdout } = await execAsync(`"${sdkmanagerPath}" --version`);
    const version = stdout.trim();

    return {
      name: 'cmdline-tools',
      installed: true,
      version,
      path: foundPath,
      status: 'ok',
    };
  } catch {
    return {
      name: 'cmdline-tools',
      installed: true,
      path: foundPath,
      status: 'ok',
    };
  }
}

/**
 * Detect Android build-tools
 */
export async function detectAndroidBuildTools(): Promise<ToolInfo> {
  const sdkPath = await findAndroidSDK();

  if (!sdkPath) {
    return {
      name: 'build-tools',
      installed: false,
      status: 'error',
      message: 'Android SDK not found',
    };
  }

  const buildToolsPath = path.join(sdkPath, 'build-tools');
  const exists = await fs.pathExists(buildToolsPath);

  if (!exists) {
    return {
      name: 'build-tools',
      installed: false,
      status: 'error',
      message: 'Android build-tools not installed',
    };
  }

  // Find latest version
  try {
    const versions = await fs.readdir(buildToolsPath);
    if (versions.length === 0) {
      return {
        name: 'build-tools',
        installed: false,
        status: 'error',
        message: 'No build-tools versions found',
      };
    }

    // Sort versions and get latest
    const latest = versions.sort((a, b) => compareVersions(b, a))[0];
    const compat = checkVersionCompatibility('buildTools', latest);

    return {
      name: 'build-tools',
      installed: true,
      version: latest,
      path: path.join(buildToolsPath, latest),
      status: compat.status,
      message: compat.message,
    };
  } catch {
    return {
      name: 'build-tools',
      installed: true,
      path: buildToolsPath,
      status: 'ok',
    };
  }
}

/**
 * Detect Android platform-tools (adb, fastboot)
 */
export async function detectAndroidPlatformTools(): Promise<ToolInfo> {
  const sdkPath = await findAndroidSDK();

  if (!sdkPath) {
    return {
      name: 'platform-tools',
      installed: false,
      status: 'error',
      message: 'Android SDK not found',
    };
  }

  const platformToolsPath = path.join(sdkPath, 'platform-tools');
  const exists = await fs.pathExists(platformToolsPath);

  if (!exists) {
    return {
      name: 'platform-tools',
      installed: false,
      status: 'error',
      message: 'Android platform-tools not installed',
    };
  }

  // Try to get adb version
  try {
    const adbPath = path.join(
      platformToolsPath,
      os.platform() === 'win32' ? 'adb.exe' : 'adb'
    );
    const { stdout } = await execAsync(`"${adbPath}" version`);
    const match = stdout.match(/version\s+(\d+\.\d+\.\d+)/);
    const version = match ? match[1] : undefined;

    return {
      name: 'platform-tools',
      installed: true,
      version,
      path: platformToolsPath,
      status: 'ok',
    };
  } catch {
    return {
      name: 'platform-tools',
      installed: true,
      path: platformToolsPath,
      status: 'ok',
    };
  }
}

/**
 * Detect Android emulator
 */
export async function detectAndroidEmulator(): Promise<ToolInfo> {
  const sdkPath = await findAndroidSDK();

  if (!sdkPath) {
    return {
      name: 'emulator',
      installed: false,
      status: 'error',
      message: 'Android SDK not found',
    };
  }

  const emulatorPath = path.join(sdkPath, 'emulator');
  const exists = await fs.pathExists(emulatorPath);

  if (!exists) {
    return {
      name: 'emulator',
      installed: false,
      status: 'warning',
      message: 'Android emulator not installed',
    };
  }

  // Try to get emulator version
  try {
    const emulatorBin = path.join(
      emulatorPath,
      os.platform() === 'win32' ? 'emulator.exe' : 'emulator'
    );
    const { stdout } = await execAsync(`"${emulatorBin}" -version`);
    const match = stdout.match(/version\s+(\d+\.\d+\.\d+)/);
    const version = match ? match[1] : undefined;

    return {
      name: 'emulator',
      installed: true,
      version,
      path: emulatorPath,
      status: 'ok',
    };
  } catch {
    return {
      name: 'emulator',
      installed: true,
      path: emulatorPath,
      status: 'ok',
    };
  }
}

/**
 * Detect specific Android platform API level
 */
export async function detectAndroidPlatform(apiLevel: number): Promise<ToolInfo> {
  const sdkPath = await findAndroidSDK();

  if (!sdkPath) {
    return {
      name: `API ${apiLevel}`,
      installed: false,
      status: 'error',
      message: 'Android SDK not found',
    };
  }

  const platformPath = path.join(sdkPath, 'platforms', `android-${apiLevel}`);
  const exists = await fs.pathExists(platformPath);

  return {
    name: `API ${apiLevel}`,
    installed: exists,
    path: exists ? platformPath : undefined,
    status: exists ? 'ok' : 'error',
    message: exists ? undefined : `Install with: sdkmanager "platforms;android-${apiLevel}"`,
  };
}

/**
 * Check JAVA_HOME environment variable
 */
export async function checkJavaHome(): Promise<ToolInfo> {
  const javaHome = process.env.JAVA_HOME;

  if (!javaHome) {
    return {
      name: 'JAVA_HOME',
      installed: false,
      status: 'warning',
      message: 'JAVA_HOME environment variable not set',
    };
  }

  const exists = await fs.pathExists(javaHome);

  if (!exists) {
    return {
      name: 'JAVA_HOME',
      installed: false,
      path: javaHome,
      status: 'error',
      message: `JAVA_HOME points to non-existent path: ${javaHome}`,
    };
  }

  return {
    name: 'JAVA_HOME',
    installed: true,
    path: javaHome,
    status: 'ok',
  };
}

/**
 * Check ANDROID_HOME environment variable
 */
export async function checkAndroidHome(): Promise<ToolInfo> {
  const androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;

  if (!androidHome) {
    // Env var not set — check if we can auto-detect the SDK anyway
    const detected = await findAndroidSDK();
    if (detected) {
      return {
        name: 'ANDROID_HOME',
        installed: true,
        path: detected,
        status: 'ok',
      };
    }
    return {
      name: 'ANDROID_HOME',
      installed: false,
      status: 'warning',
      message: 'ANDROID_HOME environment variable not set',
    };
  }

  const exists = await fs.pathExists(androidHome);

  if (!exists) {
    // Env var set but path is stale — fall back to auto-detection
    const detected = await findAndroidSDK();
    if (detected) {
      return {
        name: 'ANDROID_HOME',
        installed: true,
        path: detected,
        status: 'ok',
      };
    }
    return {
      name: 'ANDROID_HOME',
      installed: false,
      path: androidHome,
      status: 'error',
      message: `ANDROID_HOME points to non-existent path: ${androidHome}`,
    };
  }

  return {
    name: 'ANDROID_HOME',
    installed: true,
    path: androidHome,
    status: 'ok',
  };
}
