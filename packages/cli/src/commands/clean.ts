/**
 * Clean Command
 * Releases all file locks on the project folder so it can be deleted.
 *
 * What locks an Android project folder on Windows
 * ─────────────────────────────────────────────────
 * 1. Gradle daemons — background JVMs watching build outputs
 * 2. VS Code language servers — Kotlin LS, Gradle for Java, Java LS
 *    (all run as java.exe and open file handles inside .gradle / .kotlin)
 * 3. Node.js / npx watchers — jetstart dev file watcher (chokidar)
 *
 * Fixes 1+2 by killing every java.exe (they restart automatically when
 * VS Code needs them).  Fix 3 by killing Node processes whose command line
 * contains the project path.  If VS Code has the folder open in its Explorer
 * panel the user also needs to run  File → Close Folder  in VS Code.
 */

import path from 'path';
import fs from 'fs-extra';
import { execSync, spawnSync } from 'child_process';
import { log, success, error, info, warning } from '../utils/logger';
import { startSpinner, stopSpinner } from '../utils/spinner';

interface CleanOptions {
  build?: boolean;
  daemonsOnly?: boolean;
}

function findGradle(projectPath: string): string | null {
  const isWin = process.platform === 'win32';
  const name = isWin ? 'gradle.bat' : 'gradle';
  for (const dir of (process.env.PATH || '').split(isWin ? ';' : ':')) {
    const full = path.join(dir, name);
    if (fs.existsSync(full)) return full;
  }
  if (isWin) {
    for (const c of [
      'C:\\Gradle\\gradle-8.2.1\\bin\\gradle.bat',
      'C:\\Gradle\\bin\\gradle.bat',
    ]) {
      if (fs.existsSync(c)) return c;
    }
  }
  const wrapper = path.join(projectPath, isWin ? 'gradlew.bat' : 'gradlew');
  return fs.existsSync(wrapper) ? wrapper : null;
}

/**
 * Kill every java.exe on Windows.
 * VS Code language servers (Kotlin LS, Gradle for Java, Java LS) all run as
 * java.exe and hold handles on the project folder.  They restart automatically
 * when VS Code next needs them — this is safe.
 */
function killAllJavaProcesses(): number {
  if (process.platform !== 'win32') return 0;
  try {
    execSync('taskkill /F /IM java.exe', { stdio: 'ignore', timeout: 8000 });
    return 1; // at least 1 killed 
  } catch {
    return 0; // none running
  }
}

/**
 * Kill Node.js processes whose command line references this project path.
 * Uses PowerShell Get-CimInstance (works on Win 10+) with a fallback to WMIC.
 */
function killProjectNodeProcesses(projectPath: string): number {
  if (process.platform !== 'win32') return 0;

  const needle = projectPath.replace(/\\/g, '\\\\').replace(/'/g, '');
  let killed = 0;

  try {
    // PowerShell approach — more reliable than WMIC
    // Build the PowerShell script as a plain string to avoid template-literal escaping issues
    const psLines = [
      'Get-CimInstance -ClassName Win32_Process |',
      "Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -like '*" + needle.replace(/\\/g, '\\') + "*' } |",
      'ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue; Write-Output $_.ProcessId }',
    ].join(' ');

    const out = execSync('powershell -NoProfile -Command "' + psLines + '"', {
      encoding: 'utf8',
      timeout: 10000,
    });
    killed = out.trim().split('\n').filter(Boolean).length;
  } catch {
    // (conservative: skip this fallback to avoid killing unrelated Node processes)
  }

  return killed;
}

export async function cleanCommand(options: CleanOptions = {}, projectArg?: string) {
  const projectPath = projectArg
    ? path.resolve(process.cwd(), projectArg)
    : process.cwd();

  const buildGradleExists = await fs.pathExists(path.join(projectPath, 'app', 'build.gradle'));
  const settingsExists    = await fs.pathExists(path.join(projectPath, 'settings.gradle'));

  if (!buildGradleExists && !settingsExists) {
    error('No Android project found in the current directory.');
    error('Run jetstart clean from inside a JetStart project folder.');
    process.exit(1);
  }

  console.log();
  log('JetStart Clean — releasing file locks');
  console.log();

  // Graceful Gradle daemon stop 
  const daemonSpinner = startSpinner('Stopping Gradle daemons gracefully...');
  const gradle = findGradle(projectPath);
    if (gradle) {
      try {
        const isWin = process.platform === 'win32';
        const spawnCmd = isWin ? 'cmd.exe' : gradle;
        const spawnArgs = isWin ? ['/c', gradle, '--stop'] : ['--stop'];

        spawnSync(spawnCmd, spawnArgs, {
          cwd: projectPath, 
          shell: false,
          encoding: 'utf8', 
          timeout: 12000,
        });
      } catch { /* ignore */ }
    }
  stopSpinner(daemonSpinner, true, 'Gradle daemons stopped');

  // Kill ALL java.exe (Gradle + VS Code language servers)
  const javaSpinner = startSpinner(
    'Killing Java processes (Gradle daemons + VS Code language servers)...'
  );
  const killedJava = killAllJavaProcesses();
  stopSpinner(
    javaSpinner,
    true,
    killedJava > 0
      ? 'All Java processes killed — VS Code language servers will restart automatically'
      : 'No Java processes were running'
  );

  if (options.daemonsOnly) {
    console.log();
    success('Done. Try deleting the folder now.');
    info('If still locked: in VS Code press  Ctrl+Shift+P  →  "Close Folder"  then retry.');
    console.log();
    return;
  }

  // Kill Node.js watchers for this project 
  const nodeSpinner = startSpinner('Stopping Node.js file watchers for this project...');
  const killedNode = killProjectNodeProcesses(projectPath);
  stopSpinner(
    nodeSpinner,
    true,
    killedNode > 0
      ? `Stopped ${killedNode} Node.js watcher process${killedNode > 1 ? 'es' : ''}`
      : 'No Node.js watchers found for this project'
  );

  // Remove build output 
  if (options.build) {
    const buildSpinner = startSpinner('Removing build output...');
    let removed = 0;
    for (const dir of [
      path.join(projectPath, 'app', 'build'),
      path.join(projectPath, 'build'),
    ]) {
      if (await fs.pathExists(dir)) { await fs.remove(dir); removed++; }
    }
    stopSpinner(buildSpinner, true,
      removed > 0
        ? `Removed ${removed} build director${removed === 1 ? 'y' : 'ies'}`
        : 'Build directories already clean');
  }

  // Remove .gradle and .kotlin cache dirs (VS Code lock sources
  const gradleCacheSpinner = startSpinner('Removing .gradle and .kotlin cache directories...');
  let cacheRemoved = 0;
  for (const dir of [
    path.join(projectPath, '.gradle'),
    path.join(projectPath, '.kotlin'),
  ]) {
    if (await fs.pathExists(dir)) {
      try { await fs.remove(dir); cacheRemoved++; } catch { /* may still be locked */ }
    }
  }
  stopSpinner(gradleCacheSpinner, true,
    cacheRemoved > 0
      ? `Removed ${cacheRemoved} cache director${cacheRemoved === 1 ? 'y' : 'ies'}`
      : 'Cache directories already clean');

  // Remove JetStart cache 
  const cacheDir = path.join(projectPath, '.jetstart');
  if (await fs.pathExists(cacheDir)) await fs.remove(cacheDir);

  // Summary 
  console.log();
  success('Clean complete. Try deleting the folder now.');
  console.log();
  warning('If the folder is still locked, VS Code has it open in the Explorer panel.');
  info('Fix: in VS Code press  Ctrl+Shift+P  →  type  "Close Folder"  →  Enter');
  info('     Then try deleting again. VS Code language servers will restart automatically.');
  console.log();
  if (!options.build) {
    info('Tip: run  jetstart clean --build  to also delete app/build/ and save disk space.');
    console.log();
  }
}
