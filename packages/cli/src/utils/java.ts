/**
 * Java/JDK detection and installation utilities
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { downloadWithRetry } from './downloader';
import { startSpinner, stopSpinner } from './spinner';
import { success, error as logError, warning, info } from './logger';

const execAsync = promisify(exec);

export interface JavaInfo {
  version: string;
  path: string;
  vendor: string;
}

/**
 * Parse Java version from command output
 */
function parseJavaVersion(output: string): { version: string; vendor: string } | null {
  // Example outputs:
  // openjdk version "17.0.9" 2023-10-17
  // java version "1.8.0_291"
  // openjdk 11.0.12 2021-07-20

  const versionMatch = output.match(/version\s+"?(\d+)\.(\d+)\.(\d+)/i) ||
                        output.match(/openjdk\s+(\d+)\.(\d+)\.(\d+)/i);

  if (!versionMatch) {
    return null;
  }

  // Handle old Java versioning (1.8 = Java 8)
  let major = versionMatch[1];
  if (major === '1') {
    major = versionMatch[2]; // Use 8 from 1.8
  }

  const version = `${major}.${versionMatch[2]}.${versionMatch[3]}`;

  // Detect vendor
  let vendor = 'Unknown';
  if (output.includes('OpenJDK') || output.includes('openjdk')) {
    vendor = 'OpenJDK';
  } else if (output.includes('Oracle')) {
    vendor = 'Oracle';
  } else if (output.includes('Eclipse Adoptium') || output.includes('Temurin')) {
    vendor = 'Eclipse Adoptium';
  }

  return { version, vendor };
}

/**
 * Detect Java/JDK installation
 */
export async function detectJava(): Promise<JavaInfo | null> {
  try {
    const { stdout } = await execAsync('java -version 2>&1');
    const parsed = parseJavaVersion(stdout);

    if (!parsed) {
      return null;
    }

    const javaPath = process.env.JAVA_HOME || '';

    return {
      version: parsed.version,
      path: javaPath,
      vendor: parsed.vendor,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Check if Java version is compatible (>= 17)
 */
export async function isJavaCompatible(version: string): Promise<boolean> {
  const major = parseInt(version.split('.')[0], 10);
  return major >= 17;
}

/**
 * Download URLs for Eclipse Adoptium Temurin JDK 17
 */
const JDK_DOWNLOAD_URLS = {
  win32: {
    x64: 'https://api.adoptium.net/v3/binary/latest/17/ga/windows/x64/jdk/hotspot/normal/eclipse',
  },
  darwin: {
    x64: 'https://api.adoptium.net/v3/binary/latest/17/ga/mac/x64/jdk/hotspot/normal/eclipse',
    arm64: 'https://api.adoptium.net/v3/binary/latest/17/ga/mac/aarch64/jdk/hotspot/normal/eclipse',
  },
  linux: {
    x64: 'https://api.adoptium.net/v3/binary/latest/17/ga/linux/x64/jdk/hotspot/normal/eclipse',
    arm64: 'https://api.adoptium.net/v3/binary/latest/17/ga/linux/aarch64/jdk/hotspot/normal/eclipse',
  },
};

/**
 * Get JDK download URL for current platform
 */
function getJDKDownloadURL(): string | null {
  const platform = os.platform();
  const arch = os.arch();

  if (platform === 'win32') {
    return JDK_DOWNLOAD_URLS.win32.x64;
  }

  if (platform === 'darwin') {
    return arch === 'arm64' ? JDK_DOWNLOAD_URLS.darwin.arm64 : JDK_DOWNLOAD_URLS.darwin.x64;
  }

  if (platform === 'linux') {
    return arch === 'arm64' ? JDK_DOWNLOAD_URLS.linux.arm64 : JDK_DOWNLOAD_URLS.linux.x64;
  }

  return null;
}

/**
 * Get default JDK installation path
 */
function getDefaultJDKPath(): string {
  const homeDir = os.homedir();
  const platform = os.platform();

  if (platform === 'win32') {
    return path.join(homeDir, 'AppData', 'Local', 'Programs', 'Eclipse Adoptium');
  }

  if (platform === 'darwin') {
    return '/Library/Java/JavaVirtualMachines';
  }

  // Linux
  return path.join(homeDir, '.jdks');
}

/**
 * Set JAVA_HOME environment variable (Windows only, via registry)
 */
async function setJavaHomeWindows(javaPath: string): Promise<void> {
  try {
    const command = `setx JAVA_HOME "${javaPath}" /M`;
    await execAsync(command);
    info('JAVA_HOME environment variable set');
  } catch (error) {
    warning('Failed to set JAVA_HOME. You may need to set it manually.');
  }
}

/**
 * Install Java/JDK
 */
export async function installJava(): Promise<void> {
  const platform = os.platform();

  info('Installing Java/JDK 17...');
  console.log();

  // Check if already installed
  const existing = await detectJava();
  if (existing && await isJavaCompatible(existing.version)) {
    success(`Java ${existing.version} is already installed`);
    return;
  }

  if (platform === 'win32') {
    await installJavaWindows();
  } else if (platform === 'darwin') {
    await installJavaMacOS();
  } else if (platform === 'linux') {
    await installJavaLinux();
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
  }

  success('Java/JDK 17 installed successfully');
}

/**
 * Install Java on Windows
 */
async function installJavaWindows(): Promise<void> {
  const url = getJDKDownloadURL();
  if (!url) {
    throw new Error('Could not determine JDK download URL');
  }

  info('Downloading Eclipse Adoptium Temurin JDK 17...');
  info('Note: On Windows, you may need to install manually from:');
  info('https://adoptium.net/temurin/releases/?version=17');
  console.log();

  const tempDir = os.tmpdir();
  const installerPath = path.join(tempDir, 'temurin-17-installer.msi');

  // Download installer
  await downloadWithRetry({
    url,
    destination: installerPath,
    progressLabel: 'Downloading JDK installer',
  });

  // Run installer
  info('Please complete the Java installation wizard...');
  try {
    await execAsync(`msiexec /i "${installerPath}" /passive`);
  } catch (error) {
    warning('Automated installation failed. Please install manually.');
    info(`Installer saved to: ${installerPath}`);
    throw error;
  }

  // Clean up
  await fs.remove(installerPath);
}

/**
 * Install Java on macOS
 */
async function installJavaMacOS(): Promise<void> {
  // Check if Homebrew is available
  try {
    await execAsync('which brew');
    info('Installing Java via Homebrew...');

    const spinner = startSpinner('Installing openjdk@17...');
    try {
      await execAsync('brew install openjdk@17');
      stopSpinner(spinner, true, 'Java installed via Homebrew');

      // Link Java
      info('Linking Java...');
      await execAsync('sudo ln -sfn $(brew --prefix)/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk');

      info('Add to your shell profile:');
      info('export JAVA_HOME=$(/usr/libexec/java_home -v 17)');
    } catch (error) {
      stopSpinner(spinner, false, 'Failed to install via Homebrew');
      throw error;
    }
  } catch {
    // Homebrew not available, download manually
    info('Homebrew not found. Downloading JDK manually...');
    info('Alternatively, install with: brew install openjdk@17');
    console.log();

    const url = getJDKDownloadURL();
    if (!url) {
      throw new Error('Could not determine JDK download URL');
    }

    const tempDir = os.tmpdir();
    const pkgPath = path.join(tempDir, 'temurin-17.pkg');

    await downloadWithRetry({
      url,
      destination: pkgPath,
      progressLabel: 'Downloading JDK package',
    });

    info('Please install the downloaded package:');
    info(`open "${pkgPath}"`);

    // Try to open installer
    try {
      await execAsync(`open "${pkgPath}"`);
    } catch {
      warning('Could not open installer automatically');
    }
  }
}

/**
 * Install Java on Linux
 */
async function installJavaLinux(): Promise<void> {
  // Detect package manager
  let packageManager: 'apt' | 'dnf' | 'yum' | 'pacman' | null = null;

  try {
    await execAsync('which apt');
    packageManager = 'apt';
  } catch {
    try {
      await execAsync('which dnf');
      packageManager = 'dnf';
    } catch {
      try {
        await execAsync('which yum');
        packageManager = 'yum';
      } catch {
        try {
          await execAsync('which pacman');
          packageManager = 'pacman';
        } catch {
          // No package manager found
        }
      }
    }
  }

  if (!packageManager) {
    info('Could not detect package manager. Please install Java 17+ manually:');
    info('https://adoptium.net/temurin/releases/?version=17');
    return;
  }

  info(`Installing Java via ${packageManager}...`);
  const spinner = startSpinner('Installing openjdk-17-jdk...');

  try {
    switch (packageManager) {
      case 'apt':
        await execAsync('sudo apt update && sudo apt install -y openjdk-17-jdk');
        break;
      case 'dnf':
        await execAsync('sudo dnf install -y java-17-openjdk-devel');
        break;
      case 'yum':
        await execAsync('sudo yum install -y java-17-openjdk-devel');
        break;
      case 'pacman':
        await execAsync('sudo pacman -S --noconfirm jdk17-openjdk');
        break;
    }

    stopSpinner(spinner, true, 'Java installed successfully');

    // Try to set JAVA_HOME
    info('Add to your shell profile (~/.bashrc or ~/.zshrc):');
    info('export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64');
    info('export PATH=$JAVA_HOME/bin:$PATH');
  } catch (error) {
    stopSpinner(spinner, false, 'Installation failed');
    warning('You may need to run the install command manually with sudo');
    throw error;
  }
}

/**
 * Verify Java installation
 */
export async function verifyJavaInstallation(): Promise<boolean> {
  const java = await detectJava();

  if (!java) {
    return false;
  }

  const compatible = await isJavaCompatible(java.version);
  if (!compatible) {
    warning(`Java ${java.version} is installed but version 17+ is required`);
    return false;
  }

  return true;
}
