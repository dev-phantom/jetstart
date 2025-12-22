/**
 * Log Storage
 * In-memory log storage with size limits
 */

import { LogEntry, LogLevel, LogSource, LogStats } from '@jetstart/shared';

export class LogStorage {
  private logs: LogEntry[] = [];
  private maxEntries: number;

  constructor(maxEntries: number = 10000) {
    this.maxEntries = maxEntries;
  }

  add(entry: LogEntry): void {
    this.logs.push(entry);

    // Trim if exceeds max
    if (this.logs.length > this.maxEntries) {
      this.logs.shift();
    }
  }

  getAll(): LogEntry[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }

  getStats(): LogStats {
    const stats: LogStats = {
      totalLogs: this.logs.length,
      errorCount: 0,
      warningCount: 0,
      lastLogTime: this.logs.length > 0 ? this.logs[this.logs.length - 1].timestamp : 0,
      logsByLevel: {
        [LogLevel.VERBOSE]: 0,
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 0,
        [LogLevel.WARN]: 0,
        [LogLevel.ERROR]: 0,
        [LogLevel.FATAL]: 0,
      },
      logsBySource: {
        [LogSource.CLI]: 0,
        [LogSource.CORE]: 0,
        [LogSource.CLIENT]: 0,
        [LogSource.BUILD]: 0,
        [LogSource.NETWORK]: 0,
        [LogSource.SYSTEM]: 0,
      },
    };

    this.logs.forEach(log => {
      // Count by level
      stats.logsByLevel[log.level]++;

      // Count errors and warnings
      if (log.level === LogLevel.ERROR || log.level === LogLevel.FATAL) {
        stats.errorCount++;
      }
      if (log.level === LogLevel.WARN) {
        stats.warningCount++;
      }

      // Count by source
      if (log.source in stats.logsBySource) {
        stats.logsBySource[log.source]++;
      }
    });

    return stats;
  }
}