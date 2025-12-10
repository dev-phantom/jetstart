/**
 * CoreClient - WebSocket client for connecting to JetStart Core server
 */

import {
  ClientMessage,
  CoreMessage,
  WSState,
  DeviceInfo,
  Platform,
  Architecture,
  SessionStatus,
  LogEntry,
  DEFAULT_WS_PORT,
  WS_HEARTBEAT_INTERVAL,
  WS_RECONNECT_DELAY,
  WS_MAX_RECONNECT_ATTEMPTS,
} from '@jetstart/shared';

export interface CoreClientConfig {
  wsUrl?: string;
  sessionId: string;
  token: string;
  onConnected?: (sessionId: string, projectName: string) => void;
  onBuildStart?: () => void;
  onBuildComplete?: (apkInfo: any, downloadUrl: string) => void;
  onBuildError?: (error: string) => void;
  onBuildStatus?: (status: any) => void;
  onUIUpdate?: (dslContent: string, screens?: string[], hash?: string) => void;
  onReload?: (reloadType: 'full' | 'hot') => void;
  onDisconnect?: (reason: string) => void;
  onLog?: (log: LogEntry) => void;
  onStateChange?: (state: WSState) => void;
  onError?: (error: Error) => void;
}

export class CoreClient {
  private ws: WebSocket | null = null;
  private config: CoreClientConfig;
  private state: WSState = WSState.DISCONNECTED;
  private heartbeatInterval: number | null = null;
  private reconnectAttempts = 0;
  private reconnectTimeout: number | null = null;
  private shouldReconnect = true;

  constructor(config: CoreClientConfig) {
    this.config = config;
  }

  /**
   * Connect to the Core server
   */
  public connect(): void {
    if (this.state === WSState.CONNECTED || this.state === WSState.CONNECTING) {
      console.warn('Already connected or connecting');
      return;
    }

    this.updateState(WSState.CONNECTING);

    const wsUrl = this.config.wsUrl || this.getDefaultWsUrl();

    try {
      this.ws = new WebSocket(wsUrl);
      this.setupEventListeners();
    } catch (error) {
      this.handleError(new Error(`Failed to create WebSocket: ${error}`));
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from the Core server
   */
  public disconnect(): void {
    this.shouldReconnect = false;
    this.cleanup();
    this.sendMessage({
      type: 'client:disconnect',
      timestamp: Date.now(),
      reason: 'User disconnected',
    });
    this.updateState(WSState.DISCONNECTED);
  }

  /**
   * Send a status update to the Core server
   */
  public sendStatus(status: SessionStatus, message?: string): void {
    this.sendMessage({
      type: 'client:status',
      timestamp: Date.now(),
      status,
      message,
    });
  }

  /**
   * Send a log entry to the Core server
   */
  public sendLog(log: LogEntry): void {
    this.sendMessage({
      type: 'client:log',
      timestamp: Date.now(),
      log,
    });
  }

  /**
   * Get current connection state
   */
  public getState(): WSState {
    return this.state;
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.state === WSState.CONNECTED;
  }

  // Private methods

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.onopen = () => this.handleOpen();
    this.ws.onmessage = (event) => this.handleMessage(event);
    this.ws.onerror = (event) => this.handleWebSocketError(event);
    this.ws.onclose = (event) => this.handleClose(event);
  }

  private handleOpen(): void {
    console.log('WebSocket connected');
    this.updateState(WSState.CONNECTED);
    this.reconnectAttempts = 0;

    // Send connection message with device info
    const deviceInfo = this.getWebDeviceInfo();
    this.sendMessage({
      type: 'client:connect',
      timestamp: Date.now(),
      sessionId: this.config.sessionId,
      token: this.config.token,
      deviceInfo,
    });

    // Start heartbeat
    this.startHeartbeat();
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message: CoreMessage = JSON.parse(event.data);

      switch (message.type) {
        case 'core:connected':
          this.config.onConnected?.(message.sessionId, message.projectName);
          break;

        case 'core:build-start':
          this.config.onBuildStart?.();
          break;

        case 'core:build-status':
          this.config.onBuildStatus?.(message.status);
          break;

        case 'core:build-complete':
          this.config.onBuildComplete?.(message.apkInfo, message.downloadUrl);
          break;

        case 'core:build-error':
          this.config.onBuildError?.(message.error);
          break;

        case 'core:ui-update':
          this.config.onUIUpdate?.(
            message.dslContent,
            message.screens,
            message.hash
          );
          break;

        case 'core:reload':
          this.config.onReload?.(message.reloadType);
          break;

        case 'core:disconnect':
          this.config.onDisconnect?.(message.reason);
          this.disconnect();
          break;

        default:
          console.warn('Unknown message type:', message);
      }
    } catch (error) {
      this.handleError(new Error(`Failed to parse message: ${error}`));
    }
  }

  private handleWebSocketError(event: Event): void {
    console.error('WebSocket error:', event);
    this.updateState(WSState.ERROR);
    this.handleError(new Error('WebSocket error occurred'));
  }

  private handleClose(event: CloseEvent): void {
    console.log('WebSocket closed:', event.code, event.reason);
    this.cleanup();

    if (this.shouldReconnect && this.reconnectAttempts < WS_MAX_RECONNECT_ATTEMPTS) {
      this.scheduleReconnect();
    } else {
      this.updateState(WSState.DISCONNECTED);
      this.config.onDisconnect?.(event.reason || 'Connection closed');
    }
  }

  private sendMessage(message: Partial<ClientMessage>): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }

    try {
      this.ws.send(JSON.stringify(message));
    } catch (error) {
      this.handleError(new Error(`Failed to send message: ${error}`));
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    this.heartbeatInterval = window.setInterval(() => {
      this.sendMessage({
        type: 'client:heartbeat',
        timestamp: Date.now(),
      });
    }, WS_HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval !== null) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimeout !== null) return;

    this.reconnectAttempts++;
    console.log(`Reconnecting in ${WS_RECONNECT_DELAY}ms (attempt ${this.reconnectAttempts}/${WS_MAX_RECONNECT_ATTEMPTS})`);

    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect();
    }, WS_RECONNECT_DELAY);
  }

  private cleanup(): void {
    this.stopHeartbeat();

    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;

      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.close();
      }

      this.ws = null;
    }
  }

  private updateState(newState: WSState): void {
    if (this.state !== newState) {
      this.state = newState;
      this.config.onStateChange?.(newState);
    }
  }

  private handleError(error: Error): void {
    console.error('CoreClient error:', error);
    this.config.onError?.(error);
  }

  private getDefaultWsUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const hostname = window.location.hostname || 'localhost';
    return `${protocol}//${hostname}:${DEFAULT_WS_PORT}`;
  }

  private getWebDeviceInfo(): DeviceInfo {
    const screen = window.screen;

    return {
      id: this.generateDeviceId(),
      name: 'Web Browser',
      model: this.getBrowserName(),
      manufacturer: 'Web',
      platform: Platform.WEB,
      osVersion: this.getOSVersion(),
      apiLevel: 0, // N/A for web
      screenResolution: {
        width: screen.width,
        height: screen.height,
      },
      density: window.devicePixelRatio || 1,
      isEmulator: true, // Web is always considered an emulator
      architecture: Architecture.X86_64, // Assume x86_64 for web
      locale: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  private generateDeviceId(): string {
    // Try to get a persistent ID from localStorage
    const storageKey = 'jetstart_device_id';
    let deviceId = localStorage.getItem(storageKey);

    if (!deviceId) {
      deviceId = `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem(storageKey, deviceId);
    }

    return deviceId;
  }

  private getBrowserName(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.indexOf('Firefox') > -1) return 'Firefox';
    if (userAgent.indexOf('Chrome') > -1) return 'Chrome';
    if (userAgent.indexOf('Safari') > -1) return 'Safari';
    if (userAgent.indexOf('Edge') > -1) return 'Edge';
    if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) return 'Opera';

    return 'Unknown Browser';
  }

  private getOSVersion(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.indexOf('Win') > -1) return 'Windows';
    if (userAgent.indexOf('Mac') > -1) return 'macOS';
    if (userAgent.indexOf('Linux') > -1) return 'Linux';
    if (userAgent.indexOf('Android') > -1) return 'Android';
    if (userAgent.indexOf('iOS') > -1) return 'iOS';

    return 'Unknown OS';
  }
}
