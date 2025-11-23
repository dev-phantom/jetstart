/**
 * Logger Utility
 * Colored logging for Core
 */

import chalk from 'chalk';

export function log(message: string) {
  console.log(chalk.cyan('[Core]'), message);
}

export function success(message: string) {
  console.log(chalk.green('✔'), chalk.cyan('[Core]'), message);
}

export function error(message: string) {
  console.error(chalk.red('✖'), chalk.cyan('[Core]'), message);
}

export function warn(message: string) {
  console.log(chalk.yellow('⚠'), chalk.cyan('[Core]'), message);
}

export function debug(message: string) {
  if (process.env.DEBUG) {
    console.log(chalk.gray('[DEBUG]'), chalk.cyan('[Core]'), message);
  }
}