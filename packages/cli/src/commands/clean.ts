/**
 * Clean Command
 * Stops Gradle daemons and removes build artifacts so the project folder
 * can be freely moved, renamed, or deleted.
 *
 * Run this if you see "Folder In Use" when trying to delete a project.
 */

import path from 'path';
import fs from 'fs-extra';
import { spawnSync } from 'child_process';
import { log, success, error, info, warning } from '../utils/logger';
import { startSpinner, stopSpinner } from '../utils/spinner';

interface CleanOptions {
  /** Also delete app/build — frees disk space but next build is slower. */
  build?: boolean;
  /** Only stop daemons, don't touch build output. */
  daemonsOnly?: boolean;
}

/**
 * Find a Gradle executable — system first, wrapper fallback.
 */
function findGradle(projectPath: string): string | null {
  const isWin = process.platform === 'win32';
  const name = isWin ? 'gradle.bat' : 'gradle';
  for (const dir of (process.env.PATH || '').split(isWin ? ';' : ':')) {
    const full = path.join(dir, name);
    if (fs.existsSync(full)) return full;
  }
  if (isWin) {
    for (const c of ['C:\\Gradle\\gradle-8.2.1\\bin\\gradle.bat', 'C:\\Gradle\\bin\\gradle.bat']) {
      if (fs.existsSync(c)) return c;
    }
  }
  const wrapper = path.join(projectPath, isWin ? 'gradlew.bat' : 'gradlew');
  return fs.existsSync(wrapper) ? wrapper : null;
}

export async function cleanCommand(options: CleanOptions = {}) {
  const projectPath = process.cwd();

  // Quick sanity check — make sure we're in a JetStart / Android project
  const buildGradleExists = await fs.pathExists(path.join(projectPath, 'app', 'build.gradle'));
  const settingsExists    = await fs.pathExists(path.join(projectPath, 'settings.gradle'));

  if (!buildGradleExists && !settingsExists) {
    error('No Android project found in the current directory.');
    error('Run jetstart clean from inside a JetStart project folder.');
    process.exit(1);
  }

  console.log();
  log('JetStart Clean');
  console.log();

  // ── 1. Stop Gradle daemons ───────────────────────────────────────────────
  const daemonSpinner = startSpinner('Stopping Gradle daemons...');
  const gradle = findGradle(projectPath);

  if (gradle) {
    try {
      // --stop tells ALL daemons compatible with this version to exit
      const result = spawnSync(gradle, ['--stop'], {
        cwd: projectPath,
        shell: true,
        encoding: 'utf8',
        timeout: 15000,
      });
      if (result.status === 0) {
        stopSpinner(daemonSpinner, true, 'Gradle daemons stopped');
      } else {
        stopSpinner(daemonSpinner, true, 'Gradle daemons already stopped (or none running)');
      }
    } catch {
      stopSpinner(daemonSpinner, true, 'Gradle daemons already stopped');
    }
  } else {
    stopSpinner(daemonSpinner, false, 'Gradle not found — skipping daemon stop');
    warning('Install Gradle or ensure gradlew exists to stop daemons.');
  }

  if (options.daemonsOnly) {
    console.log();
    success('Done. Project folder should now be deletable.');
    console.log();
    return;
  }

  // ── 2. Remove build output ───────────────────────────────────────────────
  if (options.build) {
    const buildSpinner = startSpinner('Removing build output...');
    const buildDirs = [
      path.join(projectPath, 'app', 'build'),
      path.join(projectPath, 'build'),
    ];
    let removed = 0;
    for (const dir of buildDirs) {
      if (await fs.pathExists(dir)) {
        await fs.remove(dir);
        removed++;
      }
    }
    stopSpinner(buildSpinner, true, `Removed ${removed} build director${removed === 1 ? 'y' : 'ies'}`);
  }

  // ── 3. Remove JetStart cache ─────────────────────────────────────────────
  const cacheSpinner = startSpinner('Removing JetStart cache...');
  const cacheDir = path.join(projectPath, '.jetstart');
  if (await fs.pathExists(cacheDir)) {
    await fs.remove(cacheDir);
    stopSpinner(cacheSpinner, true, '.jetstart cache removed');
  } else {
    stopSpinner(cacheSpinner, true, 'No JetStart cache found');
  }

  // ── 4. Summary ───────────────────────────────────────────────────────────
  console.log();
  success('Clean complete. The project folder can now be safely deleted or moved.');
  if (!options.build) {
    console.log();
    info('Tip: run with --build to also remove app/build/ and free up disk space.');
  }
  console.log();
}
