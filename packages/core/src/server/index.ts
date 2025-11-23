/**
 * Main Server Entry Point
 * Starts HTTP and WebSocket servers
 */

import { createHttpServer } from './http';
import { createWebSocketServer } from '../websocket';
import { log, success, error } from '../utils/logger';
import { DEFAULT_CORE_PORT, DEFAULT_WS_PORT } from '@jetstart/shared';

export interface ServerConfig {
  httpPort?: number;
  wsPort?: number;
  host?: string;
}

export class JetStartServer {
  private httpServer: any;
  private wsServer: any;
  private config: Required<ServerConfig>;

  constructor(config: ServerConfig = {}) {
    this.config = {
      httpPort: config.httpPort || DEFAULT_CORE_PORT,
      wsPort: config.wsPort || DEFAULT_WS_PORT,
      host: config.host || '0.0.0.0',
    };
  }

  async start(): Promise<void> {
    try {
      log('Starting JetStart Core server...');

      // Start HTTP server
      this.httpServer = await createHttpServer({
        port: this.config.httpPort,
        host: this.config.host,
      });

      // Start WebSocket server
      this.wsServer = await createWebSocketServer({
        port: this.config.wsPort,
      });

      console.log();
      success('JetStart Core is running!');
      log(`HTTP Server: http://${this.config.host}:${this.config.httpPort}`);
      log(`WebSocket Server: ws://${this.config.host}:${this.config.wsPort}`);
      console.log();

    } catch (err: any) {
      error(`Failed to start server: ${err.message}`);
      throw err;
    }
  }

  async stop(): Promise<void> {
    log('Stopping JetStart Core server...');

    if (this.wsServer) {
      await this.wsServer.close();
    }

    if (this.httpServer) {
      await new Promise<void>((resolve) => {
        this.httpServer.close(() => resolve());
      });
    }

    success('Server stopped');
  }
}