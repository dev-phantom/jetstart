/**
 * Logs Command
 * Streams application logs
 */

import chalk from 'chalk';
import WebSocket from 'ws';
import { log, error, info } from '../utils/logger';
import { LogLevel, LogSource, LogEntry, DEFAULT_LOGS_PORT } from '@jetstart/shared';

interface LogsOptions {
  follow?: boolean;
  level?: string;
  source?: string;
  lines?: string;
}

export async function logsCommand(options: LogsOptions) {
  try {
    // const follow = options.follow !== false;
    const maxLines = parseInt(options.lines || '100');

    log('Connecting to JetStart logs service...');
    console.log();

    // Connect to logs service via WebSocket
    const ws = new WebSocket(`ws://localhost:${DEFAULT_LOGS_PORT}`);

    ws.on('open', () => {
      info('Connected to logs service');
      console.log();

      // Send filter options
      ws.send(JSON.stringify({
        type: 'subscribe',
        filter: {
          levels: options.level ? [options.level] : undefined,
          sources: options.source ? [options.source] : undefined,
        },
        maxLines,
      }));
    });

    ws.on('message', (data: string) => {
      try {
        const logEntry: LogEntry = JSON.parse(data);
        formatLogEntry(logEntry);
      } catch (err) {
        console.log(data);
      }
    });

    ws.on('error', (err) => {
      error(`WebSocket error: ${err.message}`);
      process.exit(1);
    });

    ws.on('close', () => {
      console.log();
      info('Disconnected from logs service');
      process.exit(0);
    });

    // Handle Ctrl+C
    process.on('SIGINT', () => {
      console.log();
      log('Closing connection...');
      ws.close();
    });

  } catch (err: any) {
    error(`Failed to connect to logs: ${err.message}`);
    process.exit(1);
  }
}

function formatLogEntry(entry: LogEntry) {
  const timestamp = new Date(entry.timestamp).toLocaleTimeString();
  const level = formatLogLevel(entry.level);
  const source = formatLogSource(entry.source);
  const tag = chalk.gray(`[${entry.tag}]`);

  console.log(`${chalk.gray(timestamp)} ${level} ${source} ${tag} ${entry.message}`);
}

function formatLogLevel(level: LogLevel): string {
  switch (level) {
    case LogLevel.VERBOSE:
      return chalk.gray('VERBOSE');
    case LogLevel.DEBUG:
      return chalk.blue('DEBUG');
    case LogLevel.INFO:
      return chalk.green('INFO');
    case LogLevel.WARN:
      return chalk.yellow('WARN');
    case LogLevel.ERROR:
      return chalk.red('ERROR');
    case LogLevel.FATAL:
      return chalk.bgRed.white('FATAL');
    default:
      return level;
  }
}

function formatLogSource(source: LogSource): string {
  const sourceColors: Record<LogSource, (text: string) => string> = {
    [LogSource.CLI]: chalk.cyan,
    [LogSource.CORE]: chalk.magenta,
    [LogSource.CLIENT]: chalk.green,
    [LogSource.BUILD]: chalk.yellow,
    [LogSource.NETWORK]: chalk.blue,
    [LogSource.SYSTEM]: chalk.gray,
  };

  const colorFn = sourceColors[source] || chalk.white;
  return colorFn(`[${source}]`);
}