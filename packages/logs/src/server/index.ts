/**
 * Logs Server
 * WebSocket server for streaming logs
 */

import { WebSocketServer, WebSocket } from 'ws';
import { LogStorage } from './storage';
import { LogEntry, LogFilter, DEFAULT_LOGS_PORT } from '@jetstart/shared';
import { applyFilters } from '../filters';
import chalk from 'chalk';

export interface LogsServerConfig {
  port?: number;
  maxLogEntries?: number;
}

export class LogsServer {
  private wss?: WebSocketServer;
  private storage: LogStorage;
  private clients: Set<WebSocket> = new Set();
  private config: Required<LogsServerConfig>;

  constructor(config: LogsServerConfig = {}) {
    this.config = {
      port: config.port || DEFAULT_LOGS_PORT,
      maxLogEntries: config.maxLogEntries || 10000,
    };
    this.storage = new LogStorage(this.config.maxLogEntries);
  }

  async start(): Promise<void> {
    this.wss = new WebSocketServer({ port: this.config.port });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log(chalk.green('✔'), 'Client connected to logs service');
      this.clients.add(ws);

      ws.on('message', (data: Buffer) => {
        this.handleMessage(ws, data);
      });

      ws.on('close', () => {
        console.log(chalk.yellow('⚠'), 'Client disconnected from logs service');
        this.clients.delete(ws);
      });

      ws.on('error', (err: Error) => {
        console.error(chalk.red('✖'), 'WebSocket error:', err.message);
        this.clients.delete(ws);
      });
    });

    console.log(chalk.cyan('[Logs]'), `Server listening on port ${this.config.port}`);
  }

  async stop(): Promise<void> {
    if (this.wss) {
      this.wss.close();
      console.log(chalk.cyan('[Logs]'), 'Server stopped');
    }
  }

  addLog(entry: LogEntry): void {
    this.storage.add(entry);
    this.broadcast(entry);
  }

  getLogs(filter?: LogFilter): LogEntry[] {
    const logs = this.storage.getAll();
    return filter ? applyFilters(logs, filter) : logs;
  }

  getStats(): any {
    return this.storage.getStats();
  }

  private handleMessage(ws: WebSocket, data: Buffer): void {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
        case 'subscribe':
          this.handleSubscribe(ws, message.filter, message.maxLines);
          break;
        case 'log':
          this.addLog(message.log);
          break;
        case 'clear':
          this.storage.clear();
          break;
        case 'stats':
          this.sendStats(ws);
          break;
      }
    } catch (err: any) {
      console.error(chalk.red('✖'), 'Failed to parse message:', err.message);
    }
  }

  private handleSubscribe(ws: WebSocket, filter?: LogFilter, maxLines?: number): void {
    const logs = this.getLogs(filter);
    const recentLogs = maxLines ? logs.slice(-maxLines) : logs;

    // Send existing logs
    recentLogs.forEach(log => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(log));
      }
    });
  }

  private broadcast(entry: LogEntry): void {
    const data = JSON.stringify(entry);

    this.clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(data);
        } catch (err) {
          console.error(chalk.red('✖'), 'Failed to broadcast log');
        }
      }
    });
  }

  private sendStats(ws: WebSocket): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'stats',
        stats: this.storage.getStats(),
      }));
    }
  }
}
