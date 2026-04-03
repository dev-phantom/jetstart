/**
 * Java/JDK detection and installation utilities
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import axios from 'axios';
import { downloadWithRetry } from './downloader';
import { startSpinner, stopSpinner } from './spinner';
import { success, error as warning, info } from './logger';

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
  const versionMatch =
    output.match(/version\s+"?(\d+)\.(\d+)\.(\d+)/i) ||
    output.match(/openjdk\s+(\d+)\.(\d+)\.(\d+)/i);

  if (!versionMatch) return null;

  let major = versionMatch[1];
  if (major === '1') major = versionMatch[2]; // 1.8 → 8

  const version = `${major}.${versionMatch[2]}.${versionMatch[3]}`;

  let vendor = 'Unknown';
  if (output.includes('OpenJDK') || output.includes('openjdk')) vendor = 'OpenJDK';
  else if (output.includes('Oracle')) vendor = 'Oracle';
  else if (output.includes('Eclipse Adoptium') || output.includes('Temurin')) vendor = 'Eclipse Adoptium';

  return { version, vendor };
}

/**
 * Detect Java/JDK installation
 */
export async function detectJava(): Promise<JavaInfo | null> {
  // Try java in PATH first
  try {
    const { stdout } = await execAsync('java -version 2>&1');
    const parsed = parseJavaVersion(stdout);
    if (parsed) {
      return { version: parsed.version, path: process.env.JAVA_HOME || '', vendor: parsed.vendor };
    }
  } catch { /* not in PATH */ }

  // Try known install locations (Windows)
  if (os.platform() === 'win32') {
    const javaFromPath = await findJavaOnWindows();
    if (javaFromPath) {
      try {
        const { stdout } = await execAsync(`"${javaFromPath}" -version 2>&1`);
        const parsed = parseJavaVersion(stdout);
        if (parsed) {
          const javaHome = path.dirname(path.dirname(javaFromPath));
          return { version: parsed.version, path: javaHome, vendor: parsed.vendor };
        }
      } catch { /* ignore */ }
    }
  }

  return null;
}

/** Scan Eclipse Adoptium and standard Windows JDK locations for java.exe */
async function findJavaOnWindows(): Promise<string | null> {
  const searchRoots = [
    process.env.JAVA_HOME,
    'C:\\Program Files\\Eclipse Adoptium',
    'C:\\Program Files\\Java',
    'C:\\Program Files\\Microsoft',
    path.join(os.homedir(), 'AppData', 'Local', 'Programs', 'Eclipse Adoptium'),
    path.join(os.homedir(), '.jdks'),
  ].filter(Boolean) as string[];

  for (const root of searchRoots) {
    if (!(await fs.pathExists(root))) continue;
    try {
      const entries = await fs.readdir(root);
      for (const entry of entries) {
        const candidate = path.join(root, entry, 'bin', 'java.exe');
        if (await fs.pathExists(candidate)) return candidate;
        // Handle path like JAVA_HOME pointing directly to the JDK root
        const directCandidate = path.join(root, 'bin', 'java.exe');
        if (await fs.pathExists(directCandidate)) return directCandidate;
      }
    } catch { /* ignore permission errors */ }
  }
  return null;
}

export async function isJavaCompatible(version: string): Promise<boolean> {
  return parseInt(version.split('.')[0], 10) >= 17;
}

export function getDefaultJDKPath(): string {
  const homeDir = os.homedir();
  const platform = os.platform();
  if (platform === 'win32') return path.join(homeDir, '.jdks', 'temurin-17');
  if (platform === 'darwin') return '/Library/Java/JavaVirtualMachines';
  return path.join(homeDir, '.jdks');
}

// Environment variable helpers

export async function setJavaHomeWindows(javaPath: string): Promise<void> {
  try {
    // Set for future sessions (system-wide where possible, else user-level)
    await execAsync(`setx JAVA_HOME "${javaPath}"`).catch(() =>
      execAsync(`setx JAVA_HOME "${javaPath}" /M`)
    );
    info('JAVA_HOME environment variable set');
  } catch {
    warning('Could not set JAVA_HOME automatically. Set it manually: JAVA_HOME=' + javaPath);
  }
}

// Main install entry point

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

  // Verify the installation actually worked
  const after = await detectJava();
  if (!after || !(await isJavaCompatible(after.version))) {
    throw new Error(
      'Java installation completed but java binary not detected afterwards.\n' +
      'Please install JDK 17 manually from https://adoptium.net/temurin/releases/?version=17\n' +
      'then restart your terminal.'
    );
  }

  success(`Java ${after.version} installed successfully`);
}

// Windows — ZIP extraction (no MSI wizard, no admin required)

async function installJavaWindows(): Promise<void> {
  info('Fetching JDK 17 download info from Adoptium...');

  const arch = os.arch() === 'ia32' ? 'x32' : 'x64';

  // Use the Adoptium assets API to find the latest ZIP for Windows
  let zipUrl: string | null = null;
  let zipName: string | null = null;

  try {
    const response = await axios.get(
      'https://api.adoptium.net/v3/assets/latest/17/hotspot',
      {
        params: { os: 'windows', architecture: arch, image_type: 'jdk' },
        timeout: 15000,
        headers: { 'User-Agent': 'JetStart-CLI' },
      }
    );

    const assets: any[] = response.data;
    if (assets && assets.length > 0) {
      const pkg = assets[0]?.binary?.package;
      if (pkg?.link && pkg.name.endsWith('.zip')) {
        zipUrl  = pkg.link;
        zipName = pkg.name;
      }
      // Some responses nest installer vs package; check installer too if package is an MSI
      if (!zipUrl) {
        const installer = assets[0]?.binary?.installer;
        if (installer?.link && installer.name.endsWith('.zip')) {
          zipUrl  = installer.link;
          zipName = installer.name;
        }
      }
    }
  } catch (err: any) {
    info(`Could not query Adoptium API (${err.message}), using fallback URL`);
  }

  // Hardcoded fallback — a known-good Temurin 17 ZIP
  if (!zipUrl) {
    zipUrl  = arch === 'x64'
      ? 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.10%2B7/OpenJDK17U-jdk_x64_windows_hotspot_17.0.10_7.zip'
      : 'https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.10%2B7/OpenJDK17U-jdk_x86-32_windows_hotspot_17.0.10_7.zip';
    zipName = arch === 'x64'
      ? 'OpenJDK17U-jdk_x64_windows_hotspot_17.0.10_7.zip'
      : 'OpenJDK17U-jdk_x86-32_windows_hotspot_17.0.10_7.zip';
  }

  info(`Downloading JDK 17 (${zipName})...`);
  info('This is ~175 MB — may take a few minutes on a slow connection.');
  console.log();

  const tempDir     = os.tmpdir();
  const zipPath     = path.join(tempDir, 'temurin-17.zip');
  const extractDir  = path.join(tempDir, 'temurin-17-extract');
  const installDir  = path.join(os.homedir(), '.jdks');
  const jdkDest     = path.join(installDir, 'temurin-17');

  // Download
  await downloadWithRetry({ url: zipUrl, destination: zipPath, progressLabel: 'Downloading JDK 17' });

  // Clean up any previous extraction
  await fs.remove(extractDir);
  await fs.ensureDir(extractDir);

  // Extract
  const extractSpinner = startSpinner('Extracting JDK 17...');
  try {
    const extractZip = await import('extract-zip');
    await extractZip.default(zipPath, { dir: path.resolve(extractDir) });
    stopSpinner(extractSpinner, true, 'JDK extracted');
  } catch (err) {
    stopSpinner(extractSpinner, false, 'Extraction failed');
    throw new Error(`Failed to extract JDK zip: ${(err as Error).message}`);
  }

  // The zip contains a single top-level folder like jdk-17.0.x+y
  let jdkRoot: string | null = null;
  try {
    const entries = await fs.readdir(extractDir);
    for (const entry of entries) {
      const candidate = path.join(extractDir, entry, 'bin', 'java.exe');
      if (await fs.pathExists(candidate)) {
        jdkRoot = path.join(extractDir, entry);
        break;
      }
    }
  } catch { /* ignore */ }

  if (!jdkRoot) {
    throw new Error('Could not locate java.exe in extracted JDK archive');
  }

  // Move to permanent location
  await fs.ensureDir(installDir);
  if (await fs.pathExists(jdkDest)) await fs.remove(jdkDest);
  await fs.move(jdkRoot, jdkDest);

  // Clean up temp files
  await fs.remove(zipPath).catch(() => {});
  await fs.remove(extractDir).catch(() => {});

  // Set JAVA_HOME
  const javaExe = path.join(jdkDest, 'bin', 'java.exe');
  if (!(await fs.pathExists(javaExe))) {
    throw new Error(`Installation moved but java.exe not found at ${javaExe}`);
  }

  // Update current process environment so subsequent code can run java
  process.env.JAVA_HOME = jdkDest;
  process.env.PATH      = `${path.join(jdkDest, 'bin')}${path.delimiter}${process.env.PATH || ''}`;

  // Persist for future terminal sessions
  await setJavaHomeWindows(jdkDest);

  info(`JDK 17 installed to: ${jdkDest}`);
  info(`JAVA_HOME=${jdkDest}`);
}

// macOS installation

async function installJavaMacOS(): Promise<void> {
  try {
    await execAsync('which brew');
    info('Installing Java via Homebrew...');
    const spinner = startSpinner('Installing openjdk@17...');
    try {
      await execAsync('brew install openjdk@17');
      stopSpinner(spinner, true, 'Java installed via Homebrew');
      try {
        await execAsync(
          'sudo ln -sfn $(brew --prefix)/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk'
        );
      } catch { /* link may already exist */ }
      info('Add to your shell profile: export JAVA_HOME=$(/usr/libexec/java_home -v 17)');
    } catch (err) {
      stopSpinner(spinner, false, 'Failed to install via Homebrew');
      throw err;
    }
  } catch {
    // Homebrew not available — download pkg
    const url = 'https://api.adoptium.net/v3/binary/latest/17/ga/mac/x64/jdk/hotspot/normal/eclipse';
    const tempPkg = path.join(os.tmpdir(), 'temurin-17.pkg');
    await downloadWithRetry({ url, destination: tempPkg, progressLabel: 'Downloading JDK package' });
    info('Please install the downloaded package:');
    info(`open "${tempPkg}"`);
    try { await execAsync(`open "${tempPkg}"`); } catch { /* ignore */ }
  }
}

// Linux installation

async function installJavaLinux(): Promise<void> {
  let pkgManager: 'apt' | 'dnf' | 'yum' | 'pacman' | null = null;
  for (const pm of ['apt', 'dnf', 'yum', 'pacman'] as const) {
    try { await execAsync(`which ${pm}`); pkgManager = pm; break; } catch { /* next */ }
  }

  if (!pkgManager) {
    info('Package manager not detected. Install Java 17 manually:');
    info('https://adoptium.net/temurin/releases/?version=17');
    return;
  }

  info(`Installing Java via ${pkgManager}...`);
  const spinner = startSpinner('Installing openjdk-17-jdk...');
  try {
    const cmds: Record<string, string> = {
      apt:    'sudo apt update && sudo apt install -y openjdk-17-jdk',
      dnf:    'sudo dnf install -y java-17-openjdk-devel',
      yum:    'sudo yum install -y java-17-openjdk-devel',
      pacman: 'sudo pacman -S --noconfirm jdk17-openjdk',
    };
    await execAsync(cmds[pkgManager], { timeout: 300000 });
    stopSpinner(spinner, true, 'Java installed');
    info('Add to ~/.bashrc or ~/.zshrc:');
    info('export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64');
    info('export PATH=$JAVA_HOME/bin:$PATH');
  } catch (err) {
    stopSpinner(spinner, false, 'Installation failed');
    throw err;
  }
}

// Verify

export async function verifyJavaInstallation(): Promise<boolean> {
  const java = await detectJava();
  if (!java) return false;
  const compatible = await isJavaCompatible(java.version);
  if (!compatible) warning(`Java ${java.version} found but version 17+ is required`);
  return compatible;
}