/**
 * WebSocket Message Handler
 * Processes incoming WebSocket messages
 */

import {
  WSMessage,
  ClientMessage,
  CoreConnectedMessage,
  CoreBuildStartMessage,
  CoreBuildCompleteMessage,
} from '@jetstart/shared';
import { ConnectionManager } from './manager';
import { log, error as logError } from '../utils/logger';

export class WebSocketHandler {
  private onClientConnected?: (sessionId: string) => void;

  constructor(
    private connectionManager: ConnectionManager,
    options?: { onClientConnected?: (sessionId: string) => void }
  ) {
    this.onClientConnected = options?.onClientConnected;
  }

  handleMessage(clientId: string, data: Buffer): void {
    try {
      const message: WSMessage = JSON.parse(data.toString());
      log(`Received message from ${clientId}: ${message.type}`);

      // Route message based on type
      if (this.isClientMessage(message)) {
        this.handleClientMessage(clientId, message);
      }

    } catch (err: any) {
      logError(`Failed to parse message from ${clientId}: ${err.message}`);
    }
  }

  private isClientMessage(message: WSMessage): message is ClientMessage {
    return message.type.startsWith('client:');
  }

  private handleClientMessage(clientId: string, message: ClientMessage): void {
    switch (message.type) {
      case 'client:connect':
        this.handleConnect(clientId, message);
        break;
      case 'client:status':
        log(`Client ${clientId} status: ${message.status}`);
        break;
      case 'client:log':
        // Forward to logs service
        break;
      case 'client:heartbeat':
        // Update last activity
        break;
      case 'client:disconnect':
        this.handleDisconnect(clientId, message);
        break;
    }
  }

  private handleConnect(clientId: string, message: ClientMessage & { type: 'client:connect' }): void {
    log(`Client connecting with session: ${message.sessionId}`);

    // Send connected confirmation
    const response: CoreConnectedMessage = {
      type: 'core:connected',
      timestamp: Date.now(),
      sessionId: message.sessionId,
      projectName: 'DemoProject', // In real implementation, get from session
    };

    this.connectionManager.sendToClient(clientId, response);

    // Trigger initial build for the client
    if (this.onClientConnected) {
      log(`Triggering initial build for session: ${message.sessionId}`);
      this.onClientConnected(message.sessionId);
    }
  }

  private handleDisconnect(clientId: string, message: ClientMessage & { type: 'client:disconnect' }): void {
    log(`Client disconnecting: ${message.reason || 'No reason provided'}`);
  }

  // Send build notifications
  sendBuildStart(sessionId: string): void {
    const message: CoreBuildStartMessage = {
      type: 'core:build-start',
      timestamp: Date.now(),
      sessionId,
    };

    this.connectionManager.broadcast(message);
  }

  sendBuildComplete(sessionId: string, apkUrl: string): void {
    const message: CoreBuildCompleteMessage = {
      type: 'core:build-complete',
      timestamp: Date.now(),
      sessionId,
      apkInfo: {
        path: '/path/to/app.apk',
        size: 5242880,
        hash: 'abc123',
        versionCode: 1,
        versionName: '1.0.0',
        minSdkVersion: 24,
        targetSdkVersion: 34,
        applicationId: 'com.example.app',
      },
      downloadUrl: apkUrl,
    };

    this.connectionManager.broadcast(message);
  }
}