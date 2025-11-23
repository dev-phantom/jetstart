/**
 * Core-specific types
 */

export interface ServerSession {
  id: string;
  token: string;
  projectName: string;
  projectPath: string;
  createdAt: number;
  lastActivity: number;
}

export interface QRCodeOptions {
  sessionId: string;
  serverUrl: string;
  wsUrl: string;
  token: string;
  projectName: string;
  version: string;
}