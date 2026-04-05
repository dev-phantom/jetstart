/**
 * Kotlin compiler detection and installation utilities
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { downloadWithRetry } from './downloader';
import { startSpinner, stopSpinner } from './spinner';
import { success, error as logWarning, info } from './logger';

const execAsync = promisify(exec);

// Latest stable Kotlin release to install when none is found
const KOTLIN_VERSION = '2.1.20';

export function getDefaultKotlinPath(): string {
  return path.join(os.homedir(), '.jetstart', 'kotlinc');
}

/**
 * Detect kotlinc on the system.
 * Returns the version string if found, null otherwise.
 */
export async function detectKotlinc(): Promise<string | null> {
  const isWin = os.platform() === 'win32';
  const kotlincBin = isWin ? 'kotlinc.bat' : 'kotlinc';

  // KOTLIN_HOME env var
  const kotlinHome = process.env.KOTLIN_HOME;
  if (kotlinHome) {
    const candidate = path.join(kotlinHome, 'bin', kotlincBin);
    if (await fs.pathExists(candidate)) {
      return await getKotlincVersion(candidate);
    }
  }

  // Try from PATH
  try {
    const { stdout } = await execAsync(`kotlinc -version 2>&1`);
    const match = stdout.match(/kotlinc-jvm\s+([\d.]+)/i) || stdout.match(/([\d]+\.[\d]+\.[\d]+)/);
    if (match) return match[1];
  } catch { /* not in PATH */ }

  // Probe common install locations
  const probeLocations: string[] = [];
  const homeDir = os.homedir();
  if (isWin) {
    probeLocations.push(
      path.join(homeDir, '.jetstart', 'kotlinc', 'bin', 'kotlinc.bat'),
      'C:\\kotlinc\\bin\\kotlinc.bat',
      path.join(homeDir, 'scoop', 'apps', 'kotlin', 'current', 'bin', 'kotlinc.bat'),
      'C:\\ProgramData\\chocolatey\\bin\\kotlinc.bat',
      path.join('C:\\Program Files', 'kotlinc', 'bin', 'kotlinc.bat'),
    );
  } else {
    probeLocations.push(
      path.join(homeDir, '.jetstart', 'kotlinc', 'bin', 'kotlinc'),
      '/usr/local/bin/kotlinc',
      '/usr/bin/kotlinc',
      '/opt/homebrew/bin/kotlinc',
      path.join(homeDir, '.sdkman', 'candidates', 'kotlin', 'current', 'bin', 'kotlinc'),
    );
  }

  for (const loc of probeLocations) {
    if (await fs.pathExists(loc)) {
      const version = await getKotlincVersion(loc);
      if (version) return version;
    }
  }

  return null;
}

async function getKotlincVersion(binaryPath: string): Promise<string | null> {
  try {
    const { stdout } = await execAsync(`"${binaryPath}" -version 2>&1`);
    const match = stdout.match(/kotlinc-jvm\s+([\d.]+)/i) || stdout.match(/([\d]+\.[\d]+\.[\d]+)/);
    return match ? match[1] : 'unknown';
  } catch {
    return null;
  }
}

/**
 * Install the Kotlin compiler by downloading the standalone zip from GitHub.
 * Installs to ~/.jetstart/kotlinc and sets KOTLIN_HOME for the current process.
 */
export async function installKotlin(): Promise<void> {
  const platform = os.platform();
  const isWin = platform === 'win32';

  info(`Installing Kotlin compiler ${KOTLIN_VERSION}...`);
  console.log();

  // Check if already installed
  const existing = await detectKotlinc();
  if (existing) {
    success(`Kotlin compiler ${existing} is already installed`);
    return;
  }

  const zipUrl = `https://github.com/JetBrains/kotlin/releases/download/v${KOTLIN_VERSION}/kotlin-compiler-${KOTLIN_VERSION}.zip`;
  const tempDir = os.tmpdir();
  const zipPath = path.join(tempDir, `kotlin-compiler-${KOTLIN_VERSION}.zip`);
  const extractDir = path.join(tempDir, `kotlin-extract-${KOTLIN_VERSION}`);
  const installDir = getDefaultKotlinPath();

  info(`Downloading Kotlin compiler (~75 MB)...`);

  try {
    await downloadWithRetry({ url: zipUrl, destination: zipPath, progressLabel: `Downloading Kotlin ${KOTLIN_VERSION}` });
  } catch (err) {
    logWarning(`Failed to download Kotlin: ${(err as Error).message}`);
    info('Install manually: https://kotlinlang.org/docs/command-line.html');
    return;
  }

  // Extract
  const extractSpinner = startSpinner('Extracting Kotlin compiler...');
  try {
    await fs.remove(extractDir);
    await fs.ensureDir(extractDir);
    const extractZip = await import('extract-zip');
    await extractZip.default(zipPath, { dir: path.resolve(extractDir) });
    stopSpinner(extractSpinner, true, 'Kotlin compiler extracted');
  } catch (err) {
    stopSpinner(extractSpinner, false, 'Extraction failed');
    logWarning(`Failed to extract Kotlin zip: ${(err as Error).message}`);
    return;
  }

  // The zip extracts to a "kotlinc" top-level folder
  const extractedKotlinc = path.join(extractDir, 'kotlinc');
  if (!(await fs.pathExists(extractedKotlinc))) {
    logWarning('Unexpected zip structure — could not find kotlinc folder after extraction');
    return;
  }

  // Move to permanent location
  await fs.ensureDir(path.dirname(installDir));
  if (await fs.pathExists(installDir)) await fs.remove(installDir);
  await fs.move(extractedKotlinc, installDir);

  // Cleanup
  await fs.remove(zipPath).catch(() => {});
  await fs.remove(extractDir).catch(() => {});

  // Make kotlinc executable on Unix
  if (!isWin) {
    const kotlincBin = path.join(installDir, 'bin', 'kotlinc');
    await execAsync(`chmod +x "${kotlincBin}"`).catch(() => {});
  }

  // Set KOTLIN_HOME for the current process
  process.env.KOTLIN_HOME = installDir;
  process.env.PATH = `${path.join(installDir, 'bin')}${path.delimiter}${process.env.PATH || ''}`;

  // Persist for future terminal sessions (Windows only via setx)
  if (isWin) {
    try {
      await execAsync(`setx KOTLIN_HOME "${installDir}"`);
      info('KOTLIN_HOME environment variable set');
    } catch {
      logWarning(`Could not set KOTLIN_HOME automatically. Set it manually: KOTLIN_HOME=${installDir}`);
    }
  } else {
    info(`Add to your shell profile: export KOTLIN_HOME="${installDir}"`);
    info(`export PATH=\\$KOTLIN_HOME/bin:\\$PATH`);
  }

  success(`Kotlin compiler ${KOTLIN_VERSION} installed to: ${installDir}`);
}
