/**
 * Level Filter
 * Filter logs by severity level
 */

import { LogEntry, LogLevel } from '@jetstart/shared';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.VERBOSE]: 0,
  [LogLevel.DEBUG]: 1,
  [LogLevel.INFO]: 2,
  [LogLevel.WARN]: 3,
  [LogLevel.ERROR]: 4,
  [LogLevel.FATAL]: 5,
};

export function filterByLevel(logs: LogEntry[], levels: LogLevel[]): LogEntry[] {
  return logs.filter(log => levels.includes(log.level));
}

export function filterByMinLevel(logs: LogEntry[], minLevel: LogLevel): LogEntry[] {
  const minPriority = LEVEL_PRIORITY[minLevel];
  
  return logs.filter(log => {
    const logPriority = LEVEL_PRIORITY[log.level];
    return logPriority >= minPriority;
  });
}