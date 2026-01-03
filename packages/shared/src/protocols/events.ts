/**
 * Event System
 * Event types for internal communication within packages
 */

export interface JetStartEvent<T = any> {
  type: string;
  payload: T;
  timestamp: number;
}

/**
 * CLI Events
 */
export type CLIEvent =
  | { type: 'cli:command:start'; payload: { command: string; args: string[] } }
  | { type: 'cli:command:complete'; payload: { command: string; success: boolean } }
  | { type: 'cli:command:error'; payload: { command: string; error: string } };

/**
 * Core Events
 */
export type CoreEvent =
  | { type: 'core:server:start'; payload: { port: number } }
  | { type: 'core:server:stop'; payload: {} }
  | { type: 'core:session:created'; payload: { sessionId: string } }
  | { type: 'core:session:ended'; payload: { sessionId: string } }
  | { type: 'core:build:queued'; payload: { sessionId: string } }
  | { type: 'core:build:started'; payload: { sessionId: string } }
  | { type: 'core:build:completed'; payload: { sessionId: string; duration: number } }
  | { type: 'core:build:failed'; payload: { sessionId: string; error: string } };

/**
 * Client Events
 */
export type ClientEvent =
  | { type: 'client:connected'; payload: { sessionId: string } }
  | { type: 'client:disconnected'; payload: { sessionId: string } }
  | { type: 'client:apk:downloaded'; payload: { apkPath: string; size: number } }
  | { type: 'client:apk:installed'; payload: { packageName: string } }
  | { type: 'client:app:launched'; payload: { packageName: string } };

/**
 * Event emitter interface
 */
export interface EventEmitter {
  on(event: string, handler: (data: any) => void): void;
  off(event: string, handler: (data: any) => void): void;
  emit(event: string, data: any): void;
}