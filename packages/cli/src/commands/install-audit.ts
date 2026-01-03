/**
 * Installation audit command - checks all required tools and dependencies
 */

import chalk from 'chalk';
import { AuditOptions } from '../types';
import {
  detectNode,
  detectNpm,
  detectJava,
  detectGradle,
  detectAndroidSDK,
  detectAndroidCmdlineTools,
  detectAndroidBuildTools,
  detectAndroidPlatformTools,
  detectAndroidEmulator,
  detectAndroidPlatform,
  checkJavaHome,
  checkAndroidHome,
  ToolInfo,
} from '../utils/system-tools';
import { warning } from '../utils/logger';

/**
 * Print tool status in table format
 */
function printToolStatus(tool: ToolInfo): void {
  const icon =
    tool.status === 'ok'
      ? chalk.green('✓')
      : tool.status === 'warning'
      ? chalk.yellow('⚠')
      : chalk.red('✗');

  const name = tool.name.padEnd(25);
  const version = (tool.version || (tool.installed ? 'Unknown' : 'Not installed')).padEnd(15);

  let statusText = '';
  if (tool.status === 'ok') {
    statusText = chalk.green('OK');
  } else if (tool.status === 'warning') {
    statusText = chalk.yellow(tool.message || 'Warning');
  } else {
    statusText = chalk.red(tool.message || 'ERROR');
  }

  console.log(`  ${icon} ${name} ${version} ${statusText}`);
}

/**
 * Print section header
 */
function printSection(title: string): void {
  console.log();
  console.log(chalk.bold(title + ':'));
  console.log('━'.repeat(70));
}

/**
 * Run audit in table format
 */
async function runAuditTable(): Promise<void> {
  console.log();
  console.log(chalk.cyan.bold('  JetStart Installation Audit'));
  console.log();

  const allTools: ToolInfo[] = [];

  // Development Tools
  printSection('Development Tools');

  const node = await detectNode();
  printToolStatus(node);
  allTools.push(node);

  const npm = await detectNpm();
  printToolStatus(npm);
  allTools.push(npm);

  const java = await detectJava();
  printToolStatus(java);
  allTools.push(java);

  const gradle = await detectGradle();
  printToolStatus(gradle);
  allTools.push(gradle);

  // Android SDK
  printSection('Android SDK');

  const sdk = await detectAndroidSDK();
  printToolStatus(sdk);
  allTools.push(sdk);

  const cmdlineTools = await detectAndroidCmdlineTools();
  printToolStatus(cmdlineTools);
  allTools.push(cmdlineTools);

  const buildTools = await detectAndroidBuildTools();
  printToolStatus(buildTools);
  allTools.push(buildTools);

  const platformTools = await detectAndroidPlatformTools();
  printToolStatus(platformTools);
  allTools.push(platformTools);

  const emulator = await detectAndroidEmulator();
  printToolStatus(emulator);
  allTools.push(emulator);

  // Android Platforms
  printSection('Android Platforms');

  const api34 = await detectAndroidPlatform(34);
  printToolStatus({ ...api34, name: 'API 34 (Target)' });
  allTools.push(api34);

  const api24 = await detectAndroidPlatform(24);
  printToolStatus({ ...api24, name: 'API 24 (Minimum)' });
  allTools.push(api24);

  // Environment Variables
  printSection('Environment Variables');

  const javaHome = await checkJavaHome();
  printToolStatus(javaHome);
  allTools.push(javaHome);

  const androidHome = await checkAndroidHome();
  printToolStatus(androidHome);
  allTools.push(androidHome);

  // Summary
  const summary = {
    ok: allTools.filter((t) => t.status === 'ok').length,
    warning: allTools.filter((t) => t.status === 'warning').length,
    error: allTools.filter((t) => t.status === 'error').length,
  };

  printSection('Summary');
  console.log(`  ${chalk.green('✓')} ${summary.ok} components OK`);
  if (summary.warning > 0) {
    console.log(`  ${chalk.yellow('⚠')} ${summary.warning} warning${summary.warning > 1 ? 's' : ''}`);
  }
  if (summary.error > 0) {
    console.log(`  ${chalk.red('✗')} ${summary.error} error${summary.error > 1 ? 's' : ''}`);
  }

  // Recommendations
  if (summary.error > 0) {
    console.log();
    warning('Recommendation:');
    console.log('  Run "jetstart create <project-name> --full-install" to install missing dependencies');
  }

  console.log();
}

/**
 * Run audit in JSON format
 */
async function runAuditJSON(): Promise<void> {
  const tools = {
    node: await detectNode(),
    npm: await detectNpm(),
    java: await detectJava(),
    gradle: await detectGradle(),
  };

  const androidComponents = {
    sdk: await detectAndroidSDK(),
    cmdlineTools: await detectAndroidCmdlineTools(),
    buildTools: await detectAndroidBuildTools(),
    platformTools: await detectAndroidPlatformTools(),
    emulator: await detectAndroidEmulator(),
    platforms: {
      api34: await detectAndroidPlatform(34),
      api24: await detectAndroidPlatform(24),
    },
  };

  const environment = {
    javaHome: await checkJavaHome(),
    androidHome: await checkAndroidHome(),
  };

  const allTools = [
    ...Object.values(tools),
    ...Object.values(androidComponents).filter((v) => typeof v === 'object' && 'status' in v),
    androidComponents.platforms.api34,
    androidComponents.platforms.api24,
    ...Object.values(environment),
  ] as ToolInfo[];

  const summary = {
    ok: allTools.filter((t) => t.status === 'ok').length,
    warning: allTools.filter((t) => t.status === 'warning').length,
    error: allTools.filter((t) => t.status === 'error').length,
  };

  const result = {
    timestamp: new Date().toISOString(),
    platform: process.platform,
    tools,
    androidComponents,
    environment,
    summary,
  };

  console.log(JSON.stringify(result, null, 2));
}

/**
 * Install audit command handler
 */
export async function installAuditCommand(options: AuditOptions): Promise<void> {
  try {
    if (options.json) {
      await runAuditJSON();
    } else {
      await runAuditTable();
    }
  } catch (err: any) {
    console.error(chalk.red(`\nAudit failed: ${err.message}`));
    process.exit(1);
  }
}
