/**
 * WebSocket Server
 * Real-time communication with clients
 */

import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { WebSocketHandler } from './handler';
import { ConnectionManager } from './manager';
import { log } from '../utils/logger';
import { AdbHelper } from '../build/gradle';

import { LogsServer } from '@jetstart/logs';

export interface WebSocketConfig {
  port: number;
  server?: Server;
  logsServer?: LogsServer;
  onClientConnected?: (sessionId: string) => void;
  adbHelper?: AdbHelper;
}

export interface WebSocketServerResult {
  server: WebSocketServer;
  handler: WebSocketHandler;
}

export async function createWebSocketServer(config: WebSocketConfig): Promise<WebSocketServerResult> {
  const wss = new WebSocketServer({
    port: config.port,
  });

  const connectionManager = new ConnectionManager();
  const handler = new WebSocketHandler(connectionManager, {
    logsServer: config.logsServer,
    onClientConnected: config.onClientConnected,
  });

  wss.on('connection', (ws: WebSocket, request) => {
    const clientId = connectionManager.addConnection(ws);

    // Extract client IP for wireless ADB connection
    const clientIp = request.socket.remoteAddress || 'unknown';
    log(`WebSocket client connected: ${clientId} (IP: ${clientIp})`);

    // Auto-connect via wireless ADB if this is a real device (not localhost)
    // Do this immediately so ADB connection starts right away
    if (clientIp && clientIp !== 'localhost' && clientIp !== '127.0.0.1' && clientIp !== '::1') {
      // Remove IPv6 prefix if present (e.g., "::ffff:192.168.1.100" -> "192.168.1.100")
      const cleanIp = clientIp.replace(/^::ffff:/, '');

      // Initiate wireless ADB connection immediately (without blocking WebSocket handler)
      // Use process.nextTick for proper timing without deferring
      if (config.adbHelper) {
        process.nextTick(() => {
          config.adbHelper!.connectWireless(cleanIp);
        });
      }
    }

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
  return { server: wss, handler };
}
