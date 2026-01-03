/**
 * WebSocket Protocol
 * Message types for real-time communication between Core, Client, and Logs
 */

import {
  DeviceInfo,
  SessionStatus,
  BuildStatus,
  LogEntry,
  APKInfo,
} from '../types/index';

/**
 * Base message structure
 */
export interface BaseMessage {
  type: string;
  timestamp: number;
  sessionId?: string;
}

/**
 * Messages from Client to Core
 */
export type ClientMessage =
  | ClientConnectMessage
  | ClientStatusMessage
  | ClientLogMessage
  | ClientHeartbeatMessage
  | ClientDisconnectMessage
  | ClientClickEventMessage;

export interface ClientConnectMessage extends BaseMessage {
  type: 'client:connect';
  sessionId: string;
  token: string;
  deviceInfo: DeviceInfo;
}

export interface ClientStatusMessage extends BaseMessage {
  type: 'client:status';
  status: SessionStatus;
  message?: string;
}

export interface ClientLogMessage extends BaseMessage {
  type: 'client:log';
  log: LogEntry;
}

export interface ClientHeartbeatMessage extends BaseMessage {
  type: 'client:heartbeat';
}

export interface ClientDisconnectMessage extends BaseMessage {
  type: 'client:disconnect';
  reason?: string;
}

export interface ClientClickEventMessage extends BaseMessage {
  type: 'client:click';
  action: string;
  elementType: string;
  elementText?: string;
}

/**
 * Messages from Core to Client
 */
export type CoreMessage =
  | CoreConnectedMessage
  | CoreBuildStartMessage
  | CoreBuildStatusMessage
  | CoreBuildCompleteMessage
  | CoreBuildErrorMessage
  | CoreReloadMessage
  | CoreUIUpdateMessage
  | CoreDexReloadMessage
  | CoreDisconnectMessage
  | CoreLogMessage;

export interface CoreConnectedMessage extends BaseMessage {
  type: 'core:connected';
  sessionId: string;
  projectName: string;
}

export interface CoreBuildStartMessage extends BaseMessage {
  type: 'core:build-start';
}

export interface CoreBuildStatusMessage extends BaseMessage {
  type: 'core:build-status';
  status: BuildStatus;
}

export interface CoreBuildCompleteMessage extends BaseMessage {
  type: 'core:build-complete';
  apkInfo: APKInfo;
  downloadUrl: string;
}

export interface CoreBuildErrorMessage extends BaseMessage {
  type: 'core:build-error';
  error: string;
  details?: any;
}

export interface CoreReloadMessage extends BaseMessage {
  type: 'core:reload';
  reloadType: 'full' | 'hot';
}

export interface CoreUIUpdateMessage extends BaseMessage {
  type: 'core:ui-update';
  dslContent: string;
  screens?: string[];
  hash?: string;
}

export interface CoreDexReloadMessage extends BaseMessage {
  type: 'core:dex-reload';
  dexBase64: string;
  classNames: string[];
}

export interface CoreDisconnectMessage extends BaseMessage {
  type: 'core:disconnect';
  reason: string;
}

export interface CoreLogMessage extends BaseMessage {
  type: 'core:log';
  log: LogEntry;
}

/**
 * Union type of all messages
 */
export type WSMessage = ClientMessage | CoreMessage;

/**
 * WebSocket connection state
 */
export enum WSState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  DISCONNECTED = 'disconnected',
  ERROR = 'error',
}

/**
 * WebSocket error types
 */
export interface WSError {
  code: WSErrorCode;
  message: string;
  timestamp: number;
}

export enum WSErrorCode {
  CONNECTION_FAILED = 'connection_failed',
  AUTHENTICATION_FAILED = 'authentication_failed',
  TIMEOUT = 'timeout',
  INVALID_MESSAGE = 'invalid_message',
  SESSION_EXPIRED = 'session_expired',
  UNKNOWN = 'unknown',
}