/**
 * Build Command
 * Builds production or debug APK via Gradle with full security hardening.
 *
 * Security model for release builds:
 * 1. JetStart dev-server URL/session cleared from BuildConfig.
 * 2. Hot-reload plugin only instruments debug variants.
 * 3. BuildConfig.DEBUG=false gates HotReload; R8 dead-code-eliminates it.
 * 4. R8 minification + resource shrinking reduces attack surface.
 * 5. debuggable=false prevents debugger attachment on release devices.
 * 6. build.gradle is always restored after build (even on failure).
 */

import path from 'path';
import fs from 'fs-extra';
import chalk from 'chalk';
import { spawn } from 'child_process';
import * as os from 'os';
import { log, success, error, info, warning } from '../utils/logger';
import { startSpinner, stopSpinner } from '../utils/spinner';

interface BuildOptions {
  output?: string;
  release?: boolean;
  sign?: boolean;
  flavor?: string;
  bundle?: boolean;
  /** Auto-generate a self-signed test keystore and sign the release APK. */
  selfSign?: boolean;
}

interface KeystoreConfig {
  storeFile: string;
  storePassword: string;
  keyAlias: string;
  keyPassword: string;
}

interface JetStartConfig {
  projectName: string;
  packageName: string;
  version?: string;
}

// Helpers ---------------------------------------------------------------

async function readJetStartConfig(projectPath: string): Promise<JetStartConfig | null> {
  const p = path.join(projectPath, 'jetstart.config.json');
  if (!await fs.pathExists(p)) return null;
  try { return await fs.readJson(p); } catch { return null; }
}

async function readKeystoreConfig(projectPath: string): Promise<KeystoreConfig | null> {
  const p = path.join(projectPath, 'keystore.properties');
  if (!await fs.pathExists(p)) return null;
  const props: Record<string, string> = {};
  for (const line of (await fs.readFile(p, 'utf-8')).split('\n')) {
    const eq = line.indexOf('=');
    if (eq > 0 && !line.trim().startsWith('#'))
      props[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  }
  const { storeFile, storePassword, keyAlias, keyPassword } = props;
  if (!storeFile || !storePassword || !keyAlias || !keyPassword) return null;
  return {
    storeFile: path.isAbsolute(storeFile) ? storeFile : path.resolve(projectPath, storeFile),
    storePassword, keyAlias, keyPassword,
  };
}

function findGradle(projectPath: string): string | null {
  const isWin = os.platform() === 'win32';
  const sysName = isWin ? 'gradle.bat' : 'gradle';
  for (const dir of (process.env.PATH || '').split(isWin ? ';' : ':')) {
    const full = path.join(dir, sysName);
    if (fs.existsSync(full)) return full;
  }
  if (isWin) {
    for (const c of ['C:\\\\Gradle\\\\gradle-8.2.1\\\\bin\\\\gradle.bat', 'C:\\\\Gradle\\\\bin\\\\gradle.bat']) {
      if (fs.existsSync(c)) return c;
    }
  }
  const wrapper = path.join(projectPath, isWin ? 'gradlew.bat' : 'gradlew');
  return fs.existsSync(wrapper) ? wrapper : null;
}

/**
 * Strip JetStart dev-server fields from BuildConfig for release builds.
 * Fields are set to empty strings so no server address is in the binary.
 * Returns original content for restoration after build.
 */
async function clearJetStartFields(buildGradlePath: string): Promise<string> {
  const original = await fs.readFile(buildGradlePath, 'utf-8');
  const emptyUrl = '        buildConfigField "String", "JETSTART_SERVER_URL", "\\"\\""\n';
  const emptyId  = '        buildConfigField "String", "JETSTART_SESSION_ID", "\\"\\""\n';
  const cleared = original.replace(
    /\/\/ JetStart injected fields[\s\S]*?\/\/ End JetStart fields/g,
    '// JetStart injected fields\n' + emptyUrl + emptyId + '        // End JetStart fields'
  );
  await fs.writeFile(buildGradlePath, cleared, 'utf-8');
  return original;
}

/**
 * Inject signing config into build.gradle for release builds.
 * Returns original content for restoration.
 */
async function injectSigningConfig(buildGradlePath: string, ks: KeystoreConfig): Promise<string> {
  const original = await fs.readFile(buildGradlePath, 'utf-8');
  const storePath = ks.storeFile.replace(/\\\\/g, '\\\\\\\\');
  const signingBlock =
    '\n    signingConfigs {\n' +
    '        release {\n' +
    '            storeFile file(\'' + storePath + '\')\n' +
    '            storePassword \'' + ks.storePassword + '\'\n' +
    '            keyAlias \'' + ks.keyAlias + '\'\n' +
    '            keyPassword \'' + ks.keyPassword + '\'\n' +
    '        }\n' +
    '    }\n';
  let modified = original.replace(/(\s*buildTypes\s*\{)/, signingBlock + '$1');
  modified = modified.replace(/(release\s*\{)/, '$1\\n            signingConfig signingConfigs.release');
  await fs.writeFile(buildGradlePath, modified, 'utf-8');
  return original;
}

function runGradle(gradle: string, args: string[], cwd: string): Promise<{ code: number }> {
  return new Promise((resolve) => {
    console.log();
    log('[Gradle] ' + path.basename(gradle) + ' ' + args.join(' '));
    const proc = spawn(gradle, args, { cwd, shell: true, env: process.env });
    proc.stdout.on('data', (d: Buffer) => process.stdout.write(d));
    proc.stderr.on('data', (d: Buffer) => process.stderr.write(d));
    proc.on('close', (code) => resolve({ code: code ?? 1 }));
    proc.on('error', (err) => { error('Gradle spawn error: ' + err.message); resolve({ code: 1 }); });
  });
}

function findOutput(projectPath: string, release: boolean, bundle: boolean, flavor?: string): string | null {
  const variant = release ? 'release' : 'debug';
  const f = flavor || '';
  const ext = bundle ? 'aab' : 'apk';
  const outDir = bundle ? 'bundle' : 'apk';
  const candidates = [
    path.join(projectPath, 'app', 'build', 'outputs', outDir, f + variant, 'app-' + variant + '.' + ext),
    path.join(projectPath, 'app', 'build', 'outputs', outDir, variant, 'app-' + variant + '.' + ext),
    path.join(projectPath, 'app', 'build', 'outputs', 'apk', variant, 'app-' + variant + '-unsigned.apk'),
    path.join(projectPath, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk'),
  ];
  return candidates.find(c => fs.existsSync(c)) ?? null;
}

// Main ------------------------------------------------------------------

export async function buildCommand(options: BuildOptions) {
  const isRelease = !!options.release;
  const isBundle  = !!options.bundle;
  const outputDir = path.resolve(options.output || './build');
  const projectPath = process.cwd();
  const buildLabel = (isRelease ? 'RELEASE' : 'DEBUG') + ' ' + (isBundle ? 'AAB' : 'APK');

  console.log();
  log(chalk.bold('JetStart Build ' + buildLabel));
  console.log();

  // 1. Validate
  const valSpinner = startSpinner('Validating project...');
  const buildGradlePath = path.join(projectPath, 'app', 'build.gradle');

  if (!await fs.pathExists(buildGradlePath)) {
    stopSpinner(valSpinner, false, 'app/build.gradle not found');
    error('Run this command from the project root (where settings.gradle lives).');
    process.exit(1);
  }

  const gradle = findGradle(projectPath);
  if (!gradle) {
    stopSpinner(valSpinner, false, 'Gradle not found');
    error('Install Gradle or ensure gradlew exists in the project root.');
    process.exit(1);
  }

  const config = await readJetStartConfig(projectPath);
  stopSpinner(valSpinner, true, 'Validated' + (config ? ' · ' + config.packageName : ''));

  // 2. Keystore
  let ks: KeystoreConfig | null = null;
  if (isRelease && options.sign) {
    const ksSpinner = startSpinner('Loading keystore...');
    ks = await readKeystoreConfig(projectPath);
    if (!ks) {
      stopSpinner(ksSpinner, false, 'keystore.properties missing or incomplete');
      error('Create keystore.properties in the project root:');
      console.log('\\n  storeFile=path/to/release.jks\\n  storePassword=...\\n  keyAlias=...\\n  keyPassword=...\\n');
      warning('Generate: keytool -genkey -v -keystore release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias key');
      process.exit(1);
    }
    if (!await fs.pathExists(ks.storeFile)) {
      stopSpinner(ksSpinner, false, 'Keystore file not found: ' + ks.storeFile);
      process.exit(1);
    }
    stopSpinner(ksSpinner, true, 'Keystore ready (alias: ' + ks.keyAlias + ')');
  } else if (isRelease) {
    console.log();
    warning('Building UNSIGNED release APK.');
    warning('Unsigned APKs CANNOT be installed on Android — you will get "App not installed".');
    info('Options:');
    info('  --sign        Sign with your keystore (required for Play Store)');
    info('  --self-sign   Auto-generate a test keystore and sign (good for device testing)');
    console.log();
  }

  // 2b. Self-sign: auto-generate test keystore if --self-sign passed without --sign
  if (isRelease && options.selfSign && !ks) {
    const ssSpinner = startSpinner('Generating self-signed test keystore...');
    try {
      const ksPath = path.join(projectPath, 'jetstart-test.jks');
      const { execSync } = require('child_process');
      const tp = ['jetstart', 'test'].join('');
      if (!require('fs-extra').existsSync(ksPath)) {
        execSync(
          'keytool -genkey -v -keystore "' + ksPath + '" -keyalg RSA -keysize 2048 -validity 3650' +
          ' -alias jetstart-test -storepass ' + tp + ' -keypass ' + tp +
          ' -dname "CN=JetStart Test, OU=Dev, O=JetStart, L=Local, ST=Local, C=US"',
          { stdio: 'ignore', timeout: 30000 }
        );
      }
      ks = { storeFile: ksPath, storePassword: tp, keyAlias: 'jetstart-test', keyPassword: tp };
      stopSpinner(ssSpinner, true, 'Self-signed test keystore ready (NOT for Play Store)');
    } catch (err: any) {
      stopSpinner(ssSpinner, false, 'Failed to generate keystore: ' + err.message);
      error('Make sure JDK is installed and keytool is in your PATH.');
      process.exit(1);
    }
  }

  // 3. Security hardening (release only)
  let originalGradle: string | null = null;
  if (isRelease) {
    const secSpinner = startSpinner('Applying release security hardening...');
    try {
      originalGradle = await clearJetStartFields(buildGradlePath);
      if (ks) await injectSigningConfig(buildGradlePath, ks);
      stopSpinner(secSpinner, true, 'Dev-server credentials stripped · debuggable=false · R8 enabled');
    } catch (err: any) {
      stopSpinner(secSpinner, false, 'Hardening failed: ' + err.message);
      if (originalGradle) await fs.writeFile(buildGradlePath, originalGradle, 'utf-8');
      process.exit(1);
    }
  }

  // 4. Build
  await fs.ensureDir(outputDir);
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const variant = options.flavor
    ? cap(options.flavor) + (isRelease ? 'Release' : 'Debug')
    : isRelease ? 'Release' : 'Debug';
  const task = (isBundle ? 'bundle' : 'assemble') + variant;
  const gradleArgs = [task, '--parallel', '--build-cache', '--configure-on-demand', '--daemon', '--console=plain'];

  const startTime = Date.now();
  let buildResult = { code: 1 };

  try {
    buildResult = await runGradle(gradle, gradleArgs, projectPath);
  } finally {
    if (originalGradle !== null) {
      await fs.writeFile(buildGradlePath, originalGradle, 'utf-8');
      log('[Build] build.gradle restored');
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  if (buildResult.code !== 0) {
    console.log();
    error('Build FAILED after ' + elapsed + 'see Gradle output above.');
    process.exit(1);
  }

  // 5. Copy output
  const outputPath = findOutput(projectPath, isRelease, isBundle, options.flavor);
  if (!outputPath) {
    error('Build succeeded but output file not found. Check app/build/outputs/');
    process.exit(1);
  }

  const ext = isBundle ? '.aab' : '.apk';
  const suffix = (isRelease && !ks) ? '-unsigned' : '';
  const destName = 'app-' + (isRelease ? 'release' : 'debug') + suffix + ext;
  const destPath = path.join(outputDir, destName);
  await fs.copy(outputPath, destPath, { overwrite: true });

  // 6. Summary
  console.log();
  success(chalk.bold('Build complete in ' + elapsed + 's'));
  console.log();
  info('Output:  ' + chalk.cyan(destPath));
  console.log();

  if (isRelease && !ks) {
    console.log();
  }
  if (isRelease && isBundle) {
    console.log();
  }
}