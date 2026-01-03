/**
 * Logging Types
 * Types for the logging system
 */

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  tag: string;
  message: string;
  source: LogSource;
  sessionId?: string;
  metadata?: Record<string, any>;
}

export enum LogLevel {
  VERBOSE = 'verbose',
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

export enum LogSource {
  CLI = 'cli',
  CORE = 'core',
  CLIENT = 'client',
  BUILD = 'build',
  NETWORK = 'network',
  SYSTEM = 'system',
}

export interface LogFilter {
  levels?: LogLevel[];
  sources?: LogSource[];
  tags?: string[];
  searchQuery?: string;
  startTime?: number;
  endTime?: number;
}

export interface LogStats {
  totalLogs: number;
  errorCount: number;
  warningCount: number;
  lastLogTime: number;
  logsByLevel: Record<LogLevel, number>;
  logsBySource: Record<LogSource, number>;
}