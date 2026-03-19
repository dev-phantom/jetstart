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
  /** Session ID this server owns — clients presenting a different ID are rejected. */
  expectedSessionId?: string;
  /** Token this server owns — clients presenting a different token are rejected. */
  expectedToken?: string;
  /** Project name shown in the core:connected response. */
  projectName?: string;
}

export interface WebSocketServerResult {
  server: WebSocketServer;
  handler: WebSocketHandler;
}

export async function createWebSocketServer(config: WebSocketConfig): Promise<WebSocketServerResult> {
  const wss = new WebSocketServer({ port: config.port });

  const connectionManager = new ConnectionManager();
  const handler = new WebSocketHandler(connectionManager, {
    logsServer:         config.logsServer,
    onClientConnected:  config.onClientConnected,
    expectedSessionId:  config.expectedSessionId,
    expectedToken:      config.expectedToken,
    projectName:        config.projectName,
  });

  wss.on('connection', (ws: WebSocket, request) => {
    const clientId = connectionManager.addConnection(ws);

    const clientIp = request.socket.remoteAddress || 'unknown';
    log(`WebSocket client connected: ${clientId} (IP: ${clientIp})`);

    // Auto-connect wireless ADB for real devices
    if (clientIp && clientIp !== 'localhost' && clientIp !== '127.0.0.1' && clientIp !== '::1') {
      const cleanIp = clientIp.replace(/^::ffff:/, '');
      if (config.adbHelper) {
        process.nextTick(() => config.adbHelper!.connectWireless(cleanIp));
      }
    }

    ws.on('message', (data: Buffer) => handler.handleMessage(clientId, data));

    ws.on('close', () => {
      log(`WebSocket client disconnected: ${clientId}`);
      connectionManager.removeConnection(clientId);
    });

    ws.on('error', (err: Error) => {
      console.error(`WebSocket error for ${clientId}:`, err.message);
    });
  });

  log(`WebSocket server listening on port ${config.port}`);
  return { server: wss, handler };
}
