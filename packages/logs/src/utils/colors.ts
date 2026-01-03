/**
 * Color Utilities
 * Colors for different log levels and sources
 */

import chalk from 'chalk';
import { LogLevel, LogSource } from '@jetstart/shared';

export function getColorForLevel(level: LogLevel): chalk.Chalk {
  switch (level) {
    case LogLevel.VERBOSE:
      return chalk.gray;
    case LogLevel.DEBUG:
      return chalk.blue;
    case LogLevel.INFO:
      return chalk.green;
    case LogLevel.WARN:
      return chalk.yellow;
    case LogLevel.ERROR:
      return chalk.red;
    case LogLevel.FATAL:
      return chalk.bgRed.white;
    default:
      return chalk.white;
  }
}

export function getColorForSource(source: LogSource): chalk.Chalk {
  switch (source) {
    case LogSource.CLI:
      return chalk.cyan;
    case LogSource.CORE:
      return chalk.magenta;
    case LogSource.CLIENT:
      return chalk.green;
    case LogSource.BUILD:
      return chalk.yellow;
    case LogSource.NETWORK:
      return chalk.blue;
    case LogSource.SYSTEM:
      return chalk.gray;
    default:
      return chalk.white;
  }
}