/**
 * Session Management Types
 * Used for tracking and managing development sessions between Core and Client
 */

import { DeviceInfo } from "./device";

export interface Session {
  id: string;
  projectName: string;
  projectPath: string;
  deviceId: string;
  deviceInfo: DeviceInfo;
  createdAt: number;
  lastActivity: number;
  status: SessionStatus;
  connectionType: ConnectionType;
}

export enum SessionStatus {
  PENDING = 'pending',
  CONNECTED = 'connected',
  BUILDING = 'building',
  READY = 'ready',
  ERROR = 'error',
  DISCONNECTED = 'disconnected',
}

export enum ConnectionType {
  MINIMAL = 'minimal', // Manual APK installation
  FASTER = 'faster', // ADB over TCP
}

export interface SessionConfig {
  enableHotReload: boolean;
  enableLogs: boolean;
  autoReconnect: boolean;
  buildOnSave: boolean;
  port: number;
}

export interface SessionToken {
  sessionId: string;
  token: string;
  expiresAt: number;
  serverUrl: string;
  wsUrl: string;
}

export interface QRCodeData {
  sessionId: string;
  serverUrl: string;
  wsUrl: string;
  token: string;
  projectName: string;
  version: string;
}