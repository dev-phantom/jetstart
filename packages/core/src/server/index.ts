/**
 * Main Server Entry Point
 * Starts HTTP and WebSocket servers
 */

import * as path from 'path';
import * as os from 'os';
import { createHttpServer } from './http';
import { createWebSocketServer } from '../websocket';
import { log, success, error } from '../utils/logger';
import { DEFAULT_CORE_PORT, DEFAULT_WS_PORT } from '@jetstart/shared';
import { SessionManager } from '../utils/session';
import { BuildService } from '../build';
import { ServerSession } from '../types';

export interface ServerConfig {
  httpPort?: number;
  wsPort?: number;
  host?: string;
  projectPath?: string;
  projectName?: string;
}

export class JetStartServer {
  private httpServer: any;
  private wsServer: any;
  private config: Required<ServerConfig>;
  private sessionManager: SessionManager;
  private buildService: BuildService;
  private currentSession: ServerSession | null = null;

  constructor(config: ServerConfig = {}) {
    this.config = {
      httpPort: config.httpPort || DEFAULT_CORE_PORT,
      wsPort: config.wsPort || DEFAULT_WS_PORT,
      host: config.host || '0.0.0.0',
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
      });

      // Start WebSocket server
      this.wsServer = await createWebSocketServer({
        port: this.config.wsPort,
      });

      // Setup build service event listeners
      this.setupBuildListeners();

      // Start watching for file changes
      this.buildService.startWatching(this.config.projectPath, async () => {
        log('Files changed, rebuilding...');
        await this.handleRebuild();
      });

      console.log();
      success('JetStart Core is running!');
      log(`HTTP Server: http://${this.config.host}:${this.config.httpPort}`);
      log(`WebSocket Server: ws://${this.config.host}:${this.config.wsPort}`);
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
      // WebSocket handler will send build-start message
    });

    this.buildService.on('build:complete', (result) => {
      success(`Build completed in ${result.buildTime}ms`);
      // WebSocket handler will send build-complete message
    });

    this.buildService.on('build:error', (errorMsg, details) => {
      error(`Build failed: ${errorMsg}`);
      // WebSocket handler will send build-error message
    });

    this.buildService.on('watch:change', (files) => {
      log(`Files changed: ${files.length} file(s)`);
    });
  }

  private async handleRebuild(): Promise<void> {
    if (!this.currentSession) {
      return;
    }

    // Trigger build with current project configuration
    // This would be implemented based on project's build.gradle
    log('Rebuild triggered (implementation pending)');
  }
}
