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
import { JETSTART_VERSION } from '@jetstart/shared';

const program = new Command();

program
  .name('jetstart')
  .description('Fast, wireless Android development with Kotlin and Jetpack Compose')
  .version(JETSTART_VERSION);

// Create command
program
  .command('create <name>')
  .description('Create a new JetStart project')
  .option('-p, --package <name>', 'Package name (e.g., com.example.app)')
  .option('-t, --template <name>', 'Template to use', 'default')
  .option('--skip-install', 'Skip npm install')
  .action(createCommand);

// Dev command
program
  .command('dev')
  .description('Start development server')
  .option('-p, --port <port>', 'Port for dev server', '8765')
  .option('-H, --host <host>', 'Host address', '0.0.0.0')
  .option('--no-qr', 'Do not show QR code')
  .option('--no-open', 'Do not open browser')
  .action(devCommand);

// Build command
program
  .command('build')
  .description('Build production APK')
  .option('-o, --output <path>', 'Output directory', './build')
  .option('-r, --release', 'Build release version', false)
  .option('--sign', 'Sign the APK')
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