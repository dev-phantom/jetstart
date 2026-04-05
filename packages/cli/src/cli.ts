#!/usr/bin/env node

/**
 * CLI Entry Point
 * Defines all commands and handles command execution
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { createCommand } from './commands/create';
import { devCommand } from './commands/dev';
import { buildCommand } from './commands/build';
import { logsCommand } from './commands/logs';
import { installAuditCommand } from './commands/install-audit';
import { androidEmulatorCommand } from './commands/android-emulator';
import { JETSTART_VERSION } from '@jetstart/shared';
import {version} from '../package.json';
import { cleanCommand } from './commands/clean';
const program = new Command();

program
  .name('jetstart')
  .description('Fast, wireless Android development with Kotlin and Jetpack Compose')
  .version(version || JETSTART_VERSION);

// Create command
program
  .command('create <name>')
  .description('Create a new JetStart project')
  .option('-p, --package <name>', 'Package name (e.g., com.example.app)')
  .option('-t, --template <name>', 'Template to use', 'default')
  .option('--full-install', 'Automatically install all required Android dependencies')
  .action(createCommand);

// Dev command
program
  .command('dev')
  .description('Start development server')
  .option('-p, --port <port>', 'Port for dev server', '8765')
  .option('-H, --host <host>', 'Host address (defaults to auto-detected network IP)')
  .option('--no-qr', 'Do not show QR code')
  .option('--no-open', 'Do not open browser')
  .option('--web', 'Open Web Emulator automatically')
  .option('--emulator', 'Deploy to running Android emulator')
  .option('--avd <name>', 'Target specific emulator by name')
  .action(devCommand);

// Build command
program
  .command('build')
  .description('Build production APK')
  .option('-o, --output <path>', 'Output directory', './build')
  .option('-r, --release', 'Build release version', false)
  .option('--sign', 'Sign the APK')
  .option('--self-sign', 'Auto-generate a test keystore and sign (device testing, NOT for Play Store)')
  .option('--bundle', 'Build AAB (App Bundle) instead of APK — recommended for Play Store')
  .option('--flavor <name>', 'Build a specific product flavor')
  .action(buildCommand);

// Logs command
program
  .command('logs')
  .description('Stream application logs')
  .option('-f, --follow', 'Follow log output', true)
  .option('-l, --level <level>', 'Filter by log level')
  .option('-s, --source <source>', 'Filter by log source')
  .option('-n, --lines <number>', 'Number of lines to show', '100')
  .action(logsCommand);

// Install audit command
program
  .command('install-audit')
  .description('Audit installation of required tools and dependencies')
  .option('--json', 'Output results in JSON format')
  .action(installAuditCommand);

// Android emulator command
program
  .command('android-emulator')
  .description('Manage Android emulators (AVDs)')
  .action(androidEmulatorCommand);

// Clean command
program
  .command('clean [path]')
  .description('Stop Gradle daemons and remove build artifacts — fixes "Folder In Use" errors')
  .option('--build', 'Also delete app/build/ to free disk space (next build will be slower)')
  .option('--daemons-only', 'Only stop Gradle daemons, do not touch build output')
  .option('--delete', 'Delete the project folder itself after releasing locks')
  .action((projectArg, options) => cleanCommand(options, projectArg));

// Error handling
program.on('command:*', (operands) => {
  console.error(chalk.red(`Error: Unknown command '${operands[0]}'`));
  console.log(chalk.yellow('\nRun "jetstart --help" for available commands'));
  process.exit(1);
});

// Handle errors gracefully
process.on('unhandledRejection', (err: Error) => {
  console.error(chalk.red('Unhandled error:'), err.message);
  process.exit(1);
});

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}