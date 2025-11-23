/**
 * WebSocket Server
 * Real-time communication with clients
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { WebSocketHandler } from './handler';
import { ConnectionManager } from './manager';
import { log } from '../utils/logger';

export interface WebSocketConfig {
  port: number;
  server?: Server;
}

export async function createWebSocketServer(config: WebSocketConfig): Promise<WebSocketServer> {
  const wss = new WebSocketServer({
    port: config.port,
  });

  const connectionManager = new ConnectionManager();
  const handler = new WebSocketHandler(connectionManager);

  wss.on('connection', (ws: WebSocket, _request) => {
    const clientId = connectionManager.addConnection(ws);
    log(`WebSocket client connected: ${clientId}`);

    // Handle messages
    ws.on('message', (data: Buffer) => {
      handler.handleMessage(clientId, data);
    });

    // Handle disconnection
    ws.on('close', () => {
      log(`WebSocket client disconnected: ${clientId}`);
      connectionManager.removeConnection(clientId);
    });

    // Handle errors
    ws.on('error', (err: Error) => {
      console.error(`WebSocket error for ${clientId}:`, err.message);
    });
  });

  log(`WebSocket server listening on port ${config.port}`);
  return wss;
}
