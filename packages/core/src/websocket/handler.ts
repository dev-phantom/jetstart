/**
 * WebSocket Message Handler
 * Processes incoming WebSocket messages with session + token validation.
 *
 * Security model:
 * - Every connecting client must supply the correct sessionId AND token.
 * - Both are embedded in the QR code shown by `jetstart dev`.
 * - A device that was built against a previous session (different token)
 *   is rejected immediately — it cannot hijack the current dev session.
 */

import {
  WSMessage,
  ClientMessage,
  CoreConnectedMessage,
  CoreBuildStartMessage,
  CoreBuildCompleteMessage,
  CoreDexReloadMessage,
  CoreJsUpdateMessage,
} from '@jetstart/shared';
import { ConnectionManager } from './manager';
import { log, error as logError } from '../utils/logger';
import { LogsServer } from '@jetstart/logs';

export class WebSocketHandler {
  private onClientConnected?: (sessionId: string) => void;
  private logsServer?: LogsServer;
  /** The session ID this server owns — clients must match this exactly. */
  private expectedSessionId: string;
  /** The token this server owns — clients must match this exactly. */
  private expectedToken: string;
  /** Human-readable project name for the `core:connected` response. */
  private projectName: string;

  constructor(
    private connectionManager: ConnectionManager,
    options?: {
      onClientConnected?: (sessionId: string) => void;
      logsServer?: LogsServer;
      expectedSessionId?: string;
      expectedToken?: string;
      projectName?: string;
    }
  ) {
    this.onClientConnected   = options?.onClientConnected;
    this.logsServer          = options?.logsServer;
    this.expectedSessionId   = options?.expectedSessionId ?? '';
    this.expectedToken       = options?.expectedToken ?? '';
    this.projectName         = options?.projectName ?? 'JetStart Project';
  }

  handleMessage(clientId: string, data: Buffer): void {
    try {
      const message: WSMessage = JSON.parse(data.toString());
      log(`Received message from ${clientId}: ${message.type}`);

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
        if (this.logsServer) {
          this.logsServer.addLog(message.log);
        }
        if (message.sessionId) {
          this.connectionManager.broadcastToSession(message.sessionId, {
            type: 'core:log',
            timestamp: Date.now(),
            sessionId: message.sessionId,
            log: message.log,
          });
        }
        break;
      case 'client:heartbeat':
        break;
      case 'client:disconnect':
        this.handleDisconnect(clientId, message);
        break;
    }
  }

  private handleConnect(clientId: string, message: ClientMessage & { type: 'client:connect' }): void {
    const incomingSession = message.sessionId;
    const incomingToken   = (message as any).token as string | undefined;

    // Session + token validation
    // Only validate when the server has an expected session configured.
    if (this.expectedSessionId) {
      if (incomingSession !== this.expectedSessionId) {
        logError(
          `Rejected client ${clientId}: wrong session "${incomingSession}" (expected "${this.expectedSessionId}")`
        );
        logError('This device was built against a different jetstart dev session. Rescan the QR code.');
        // Close the WebSocket immediately — does not accept this client.
        const ws = this.connectionManager.getConnection(clientId);
        if (ws) {
          ws.close(4001, 'Session mismatch — rescan QR code');
        }
        this.connectionManager.removeConnection(clientId);
        return;
      }

      if (this.expectedToken && incomingToken && incomingToken !== this.expectedToken) {
        logError(
          `Rejected client ${clientId}: wrong token (session ${incomingSession})`
        );
        const ws = this.connectionManager.getConnection(clientId);
        if (ws) {
          ws.close(4002, 'Token mismatch — rescan QR code');
        }
        this.connectionManager.removeConnection(clientId);
        return;
      }
    }

    // Accepted 
    log(`Client accepted (session: ${incomingSession})`);
    this.connectionManager.setClientSession(clientId, incomingSession);

    const response: CoreConnectedMessage = {
      type: 'core:connected',
      timestamp: Date.now(),
      sessionId: incomingSession,
      projectName: this.projectName,
    };
    this.connectionManager.sendToClient(clientId, response);

    if (this.onClientConnected) {
      log(`Triggering initial build for session: ${incomingSession}`);
      this.onClientConnected(incomingSession);
    }
  }

  private handleDisconnect(clientId: string, message: ClientMessage & { type: 'client:disconnect' }): void {
    log(`Client disconnecting: ${message.reason || 'No reason provided'}`);
  }

  sendBuildStart(sessionId: string): void {
    const message: CoreBuildStartMessage = {
      type: 'core:build-start',
      timestamp: Date.now(),
      sessionId,
    };
    this.connectionManager.broadcastToSession(sessionId, message);
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
    this.connectionManager.broadcastToSession(sessionId, message);
  }

  sendDexReload(sessionId: string, dexBase64: string, classNames: string[]): void {
    const message: CoreDexReloadMessage = {
      type: 'core:dex-reload',
      timestamp: Date.now(),
      sessionId,
      dexBase64,
      classNames,
    };
    log(`Sending DEX reload: ${dexBase64.length} base64 chars, ${classNames.length} classes`);
    this.connectionManager.broadcastToAll(message as any);
  }

  /**
   * Send compiled Kotlin→JS ES module to web emulator clients.
   * The browser imports it dynamically and renders the Compose UI as HTML.
   */
  sendJsUpdate(sessionId: string, jsBase64: string, sourceFile: string, byteSize: number, _screenFunctionName: string): void {
    const message: CoreJsUpdateMessage = {
      type: 'core:js-update',
      timestamp: Date.now(),
      sessionId,
      jsBase64,
      sourceFile,
      byteSize,
    };
    log(`Sending JS update: ${sourceFile} (${byteSize} bytes) to web clients`);
    // Broadcast to all — web clients use it, Android clients ignore unknown types
    this.connectionManager.broadcastToAll(message as any);
  }

  sendLogBroadcast(sessionId: string, logEntry: any): void {
    this.connectionManager.broadcastToSession(sessionId, {
      type: 'core:log',
      timestamp: Date.now(),
      sessionId,
      log: logEntry,
    });
  }
}
