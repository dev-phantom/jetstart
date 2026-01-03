/**
 * Logger Utility
 * Formatted console output with colors
 */

import chalk from 'chalk';

export function log(message: string) {
  console.log(message);
}

export function info(message: string) {
  console.log(chalk.blue('ℹ'), message);
}

export function success(message: string) {
  console.log(chalk.green('✔'), message);
}

export function warning(message: string) {
  console.log(chalk.yellow('⚠'), message);
}

export function error(message: string) {
  console.error(chalk.red('✖'), message);
}

export function debug(message: string) {
  if (process.env.DEBUG) {
    console.log(chalk.gray('[DEBUG]'), message);
  }
}

export function banner() {
  console.log();
  console.log(chalk.cyan.bold('  ╔═╗┌─┐┌┬┐╔═╗┌┬┐┌─┐┬─┐┌┬┐'));
  console.log(chalk.cyan.bold('    ║├┤  │ ╚═╗ │ ├─┤├┬┘ │ '));
  console.log(chalk.cyan.bold('  ╚═╝└─┘ ┴ ╚═╝ ┴ ┴ ┴┴└─ ┴ '));
  console.log();
  console.log(chalk.gray('  Fast, wireless Android development'));
  console.log();
}