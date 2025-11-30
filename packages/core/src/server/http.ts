/**
 * HTTP Server
 * Serves APKs, handles REST endpoints
 */

import express, { Express } from 'express';
import { Server } from 'http';
import { setupMiddleware } from './middleware';
import { setupRoutes } from './routes';
import { log } from '../utils/logger';

export interface HttpServerConfig {
  port: number;
  host: string;
  getLatestApk?: () => string | null;
}

export async function createHttpServer(config: HttpServerConfig): Promise<Server> {
  const app: Express = express();

  // Setup middleware
  setupMiddleware(app);

  // Setup routes
  setupRoutes(app, config.getLatestApk);

  // Start server
  return new Promise((resolve, reject) => {
    const server = app.listen(config.port, config.host, () => {
      log(`HTTP server listening on ${config.host}:${config.port}`);
      resolve(server);
    });

    server.on('error', (err: Error) => {
      reject(err);
    });
  });
}