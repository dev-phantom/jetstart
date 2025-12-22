/**
 * Log Viewer
 * Connects to logs service and displays logs
 */

import WebSocket from 'ws';
import { LogEntry, LogFilter, DEFAULT_LOGS_PORT } from '@jetstart/shared';
import { formatLog } from './formatter';
import chalk from 'chalk';

export class LogViewer {
  private ws?: WebSocket;
  private connected: boolean = false;

  async connect(port: number = DEFAULT_LOGS_PORT): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(`ws://localhost:${port}`);

      this.ws.on('open', () => {
        this.connected = true;
        console.log(chalk.green('✔'), 'Connected to logs service');
        console.log();
        resolve();
      });

      this.ws.on('message', (data: Buffer) => {
        try {
          const log: LogEntry = JSON.parse(data.toString());
          formatLog(log);
        } catch (err) {
          console.log(data.toString());
        }
      });

      this.ws.on('error', (err: Error) => {
        reject(err);
      });

      this.ws.on('close', () => {
        this.connected = false;
        console.log();
        console.log(chalk.yellow('⚠'), 'Disconnected from logs service');
      });
    });
  }

  subscribe(filter?: LogFilter, maxLines?: number): void {
    if (!this.ws || !this.connected) {
      throw new Error('Not connected to logs service');
    }

    this.ws.send(JSON.stringify({
      type: 'subscribe',
      filter,
      maxLines,
    }));
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
    }
  }
}