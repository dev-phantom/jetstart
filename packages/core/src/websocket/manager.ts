/**
 * Connection Manager
 * Manages WebSocket connections
 */

import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { CoreMessage } from '@jetstart/shared';

export class ConnectionManager {
  private connections: Map<string, WebSocket> = new Map();

  addConnection(ws: WebSocket): string {
    const id = uuidv4();
    this.connections.set(id, ws);
    return id;
  }

  removeConnection(id: string): void {
    this.connections.delete(id);
  }

  getConnection(id: string): WebSocket | undefined {
    return this.connections.get(id);
  }

  sendToClient(clientId: string, message: CoreMessage): boolean {
    const ws = this.connections.get(clientId);
    
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      return false;
    }

    try {
      ws.send(JSON.stringify(message));
      return true;
    } catch (err) {
      console.error(`Failed to send message to ${clientId}:`, err);
      return false;
    }
  }

  broadcast(message: CoreMessage): void {
    const data = JSON.stringify(message);

    this.connections.forEach((ws, clientId) => {
      if (ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(data);
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