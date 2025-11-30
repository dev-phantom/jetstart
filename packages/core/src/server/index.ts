/**
 * Main Server Entry Point
 * Starts HTTP and WebSocket servers
 */

import * as path from 'path';
import * as os from 'os';
import { createHttpServer } from './http';
import { createWebSocketServer } from '../websocket';
import { WebSocketHandler } from '../websocket/handler';
import { log, success, error } from '../utils/logger';
import { DEFAULT_CORE_PORT, DEFAULT_WS_PORT } from '@jetstart/shared';
import { SessionManager } from '../utils/session';
import { BuildService } from '../build';
import { ServerSession } from '../types';

export interface ServerConfig {
  httpPort?: number;
  wsPort?: number;
  host?: string;
  displayHost?: string; // IP address to display in logs/QR codes (for client connections)
  projectPath?: string;
  projectName?: string;
}

export class JetStartServer {
  private httpServer: any;
  private wsServer: any;
  private wsHandler: WebSocketHandler | null = null;
  private config: Required<ServerConfig> & { displayHost: string };
  private sessionManager: SessionManager;
  private buildService: BuildService;
  private currentSession: ServerSession | null = null;
  private buildMutex: boolean = false;  // Prevent concurrent builds
  private latestApkPath: string | null = null;  // Store latest built APK path

  constructor(config: ServerConfig = {}) {
    const bindHost = config.host || '0.0.0.0';
    const displayHost = config.displayHost || bindHost;
    
    this.config = {
      httpPort: config.httpPort || DEFAULT_CORE_PORT,
      wsPort: config.wsPort || DEFAULT_WS_PORT,
      host: bindHost,
      displayHost: displayHost,
      projectPath: config.projectPath || process.cwd(),
      projectName: config.projectName || path.basename(config.projectPath || process.cwd()),
    };

    this.sessionManager = new SessionManager();
    this.buildService = new BuildService({
      cacheEnabled: true,
      cachePath: path.join(os.tmpdir(), 'jetstart-cache'),
      watchEnabled: true,
    });
  }

  async start(): Promise<ServerSession> {
    try {
      log('Starting JetStart Core server...');

      // Create development session
      this.currentSession = await this.sessionManager.createSession({
        projectName: this.config.projectName,
        projectPath: this.config.projectPath,
      });

      // Start HTTP server
      this.httpServer = await createHttpServer({
        port: this.config.httpPort,
        host: this.config.host,
        getLatestApk: () => this.latestApkPath,
      });

      // Start WebSocket server
      const wsResult = await createWebSocketServer({
        port: this.config.wsPort,
        onClientConnected: async (sessionId: string) => {
          // Trigger initial build when client connects
          log(`Triggering initial build for connected client (session: ${sessionId})`);
          await this.handleRebuild();
        },
      });
      this.wsServer = wsResult.server;
      this.wsHandler = wsResult.handler;

      // Setup build service event listeners
      this.setupBuildListeners();

      // Start watching for file changes
      this.buildService.startWatching(this.config.projectPath, async () => {
        log('Files changed, rebuilding...');
        await this.handleRebuild();
      });

      console.log();
      success('JetStart Core is running!');
      log(`HTTP Server: http://${this.config.displayHost}:${this.config.httpPort}`);
      log(`WebSocket Server: ws://${this.config.displayHost}:${this.config.wsPort}`);
      log(`Session ID: ${this.currentSession.id}`);
      log(`Session Token: ${this.currentSession.token}`);
      console.log();

      return this.currentSession;

    } catch (err: any) {
      error(`Failed to start server: ${err.message}`);
      throw err;
    }
  }

  async stop(): Promise<void> {
    log('Stopping JetStart Core server...');

    // Stop file watching
    this.buildService.stopWatching();

    if (this.wsServer) {
      await this.wsServer.close();
    }

    if (this.httpServer) {
      await new Promise<void>((resolve) => {
        this.httpServer.close(() => resolve());
      });
    }

    success('Server stopped');
  }

  getSession(): ServerSession | null {
    return this.currentSession;
  }

  private setupBuildListeners(): void {
    this.buildService.on('build:start', () => {
      log('Build started');
      if (this.wsHandler && this.currentSession) {
        this.wsHandler.sendBuildStart(this.currentSession.id);
      }
    });

    this.buildService.on('build:complete', (result) => {
      success(`Build completed in ${result.buildTime}ms`);
      if (this.wsHandler && this.currentSession) {
        // Store the APK path
        this.latestApkPath = result.apkPath || null;

        // Send download URL to client
        const downloadUrl = `/download/app.apk`;
        this.wsHandler.sendBuildComplete(this.currentSession.id, downloadUrl);
      }
    });

    this.buildService.on('build:error', (errorMsg, details) => {
      error(`Build failed: ${errorMsg}`);
      // TODO: Send build-error message via WebSocket
    });

    this.buildService.on('watch:change', (files) => {
      log(`Files changed: ${files.length} file(s)`);
    });
  }

  private async handleRebuild(): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    // Atomic mutex check - prevents race condition
    if (this.buildMutex) {
      log('Build already in progress, skipping duplicate build request');
      return;
    }

    // Set mutex immediately before any async operations
    this.buildMutex = true;

    try {
      // Trigger actual build using BuildService
      const result = await this.buildService.build({
        projectPath: this.config.projectPath,
        outputPath: path.join(this.config.projectPath, 'build/outputs/apk'),
        buildType: 'debug' as any, // BuildType.DEBUG
        minifyEnabled: false,
        debuggable: true,
        versionCode: 1,
        versionName: '1.0.0',
        applicationId: 'com.example.app',
      });

      if (result.success) {
        success(`Build completed successfully: ${result.apkPath || 'APK path not found'}`);
      } else {
        error(`Build failed: ${result.errors?.[0]?.message || 'Unknown error'}`);
      }
    } catch (err: any) {
      error(`Build failed: ${err.message}`);
    } finally {
      // Always release mutex
      this.buildMutex = false;
    }
  }
}
