/**
 * Logger Utility
 * Colored logging for Core with log level support
 *
 * Environment Variables:
 * - JETSTART_LOG_LEVEL: error | warn | info | debug (default: info)
 * - DEBUG: Set to enable all debug logs
 */

import chalk from 'chalk';

type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

function getLogLevel(): LogLevel {
  const level = process.env.JETSTART_LOG_LEVEL?.toLowerCase() as LogLevel;
  return LOG_LEVELS[level] !== undefined ? level : 'info';
}

function shouldLog(level: LogLevel): boolean {
  const currentLevel = getLogLevel();
  return LOG_LEVELS[level] <= LOG_LEVELS[currentLevel];
}

export function log(message: string) {
  if (shouldLog('info')) {
    console.log(chalk.cyan('[Core]'), message);
  }
}

export function success(message: string) {
  if (shouldLog('info')) {
    console.log(chalk.green('✔'), chalk.cyan('[Core]'), message);
  }
}

export function error(message: string) {
  if (shouldLog('error')) {
    console.error(chalk.red('✖'), chalk.cyan('[Core]'), message);
  }
}

export function warn(message: string) {
  if (shouldLog('warn')) {
    console.log(chalk.yellow('⚠'), chalk.cyan('[Core]'), message);
  }
}

export function debug(message: string) {
  if (process.env.DEBUG || shouldLog('debug')) {
    console.log(chalk.gray('[DEBUG]'), chalk.cyan('[Core]'), message);
  }
}

export function verbose(message: string) {
  // Only log if DEBUG is set or log level is debug
  debug(message);
}