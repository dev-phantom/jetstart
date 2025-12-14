/**
 * Connection Manager
 * Manages WebSocket connections with session isolation
 */

import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { CoreMessage } from '@jetstart/shared';

interface ClientConnection {
  ws: WebSocket;
  sessionId?: string; // Session ID for isolation
}

export class ConnectionManager {
  private connections: Map<string, ClientConnection> = new Map();

  addConnection(ws: WebSocket): string {
    const id = uuidv4();
    this.connections.set(id, { ws, sessionId: undefined });
    return id;
  }

  removeConnection(id: string): void {
    this.connections.delete(id);
  }

  getConnection(id: string): WebSocket | undefined {
    return this.connections.get(id)?.ws;
  }

  /**
   * Associate a client with a session for isolation
   */
  setClientSession(clientId: string, sessionId: string): void {
    const connection = this.connections.get(clientId);
    if (connection) {
      connection.sessionId = sessionId;
      if (process.env.DEBUG) {
        console.log(`[ConnectionManager] Client ${clientId} joined session ${sessionId}`);
      }
    }
  }

  sendToClient(clientId: string, message: CoreMessage): boolean {
    const connection = this.connections.get(clientId);

    if (!connection || connection.ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      connection.ws.send(JSON.stringify(message));
      return true;
    } catch (err) {
      console.error(`Failed to send message to ${clientId}:`, err);
      return false;
    }
  }

  /**
   * Broadcast to all clients (UNSAFE - use broadcastToSession instead)
   * @deprecated Use broadcastToSession for session isolation
   */
  broadcast(message: CoreMessage): void {
    console.warn('[ConnectionManager] WARNING: Using unsafe broadcast() - use broadcastToSession() instead');
    this.broadcastToAll(message);
  }

  /**
   * Broadcast to all clients in a specific session (SECURE)
   */
  broadcastToSession(sessionId: string, message: CoreMessage): void {
    const data = JSON.stringify(message);
    let sentCount = 0;

    this.connections.forEach((connection, clientId) => {
      // Only send to clients in the same session
      if (connection.sessionId === sessionId && connection.ws.readyState === WebSocket.OPEN) {
        try {
          connection.ws.send(data);
          sentCount++;
          if (process.env.DEBUG) {
            console.log(`[ConnectionManager] Sent ${message.type} to client ${clientId} in session ${sessionId.slice(0, 8)}...`);
          }
        } catch (err) {
          console.error(`Failed to send to ${clientId}:`, err);
        }
      }
    });

    if (process.env.DEBUG) {
      console.log(`[ConnectionManager] Broadcasted ${message.type} to ${sentCount} clients in session ${sessionId.slice(0, 8)}...`);
    }
  }

  /**
   * Broadcast to ALL clients regardless of session (use with caution)
   */
  private broadcastToAll(message: CoreMessage): void {
    const data = JSON.stringify(message);
    const connectionCount = Array.from(this.connections.values()).filter(c => c.ws.readyState === WebSocket.OPEN).length;
    console.log(`[ConnectionManager] Broadcasting ${message.type} to ${connectionCount} connected clients`);

    this.connections.forEach((connection, clientId) => {
      if (connection.ws.readyState === WebSocket.OPEN) {
        try {
          connection.ws.send(data);
          console.log(`[ConnectionManager] Sent ${message.type} to client ${clientId}`);
        } catch (err) {
          console.error(`Failed to broadcast to ${clientId}:`, err);
        }
      }
    });
  }

  getConnectionCount(): number {
    return this.connections.size;
  }
}