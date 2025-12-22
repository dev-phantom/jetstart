/**
 * Log Formatter
 * Formats log entries for terminal display
 */

import chalk from 'chalk';
import { format } from 'date-fns';
import { LogEntry, LogLevel, LogSource } from '@jetstart/shared';
import { getColorForLevel, getColorForSource } from '../utils/colors';

export function formatLog(entry: LogEntry): void {
  const timestamp = formatTimestamp(entry.timestamp);
  const level = formatLevel(entry.level);
  const source = formatSource(entry.source);
  const tag = formatTag(entry.tag);
  const message = entry.message;

  console.log(`${timestamp} ${level} ${source} ${tag} ${message}`);
}

function formatTimestamp(timestamp: number): string {
  return chalk.gray(format(timestamp, 'HH:mm:ss.SSS'));
}

function formatLevel(level: LogLevel): string {
  const color = getColorForLevel(level);
  const label = level.toUpperCase().padEnd(7);
  return color(label);
}

function formatSource(source: LogSource): string {
  const color = getColorForSource(source);
  const label = `[${source}]`.padEnd(10);
  return color(label);
}

function formatTag(tag: string): string {
  return chalk.gray(`[${tag}]`);
}

export function formatStats(stats: any): void {
  console.log();
  console.log(chalk.bold('Log Statistics:'));
  console.log();
  console.log(`Total Logs:    ${chalk.cyan(stats.totalLogs)}`);
  console.log(`Errors:        ${chalk.red(stats.errorCount)}`);
  console.log(`Warnings:      ${chalk.yellow(stats.warningCount)}`);
  console.log();
  
  console.log(chalk.bold('By Level:'));
  Object.entries(stats.logsByLevel).forEach(([level, count]) => {
    const color = getColorForLevel(level as LogLevel);
    console.log(`  ${level.padEnd(10)}: ${color(count)}`);
  });
  
  console.log();
  console.log(chalk.bold('By Source:'));
  Object.entries(stats.logsBySource).forEach(([source, count]) => {
    const color = getColorForSource(source as LogSource);
    console.log(`  ${source.padEnd(10)}: ${color(count)}`);
  });
  console.log();
}