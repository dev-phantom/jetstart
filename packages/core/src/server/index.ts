/**
 * Main Server Entry Point
 * Starts HTTP and WebSocket servers
 */

import * as path from 'path';
import * as os from 'os';
import { EventEmitter } from 'events';
import { createHttpServer } from './http';
import { createWebSocketServer } from '../websocket';
import { WebSocketHandler } from '../websocket/handler';
import { log, success, error, loggerEvents } from '../utils/logger';
import { DEFAULT_CORE_PORT, DEFAULT_WS_PORT } from '@jetstart/shared';
import { SessionManager } from '../utils/session';
import { BuildService } from '../build';
import { ServerSession } from '../types';
import { DSLParser } from '../build/dsl-parser';
import { injectBuildConfigFields } from '../build/gradle-injector';
import { HotReloadService } from '../build/hot-reload-service';
import { AdbHelper } from '../build/gradle';

export interface ServerConfig {
  httpPort?: number;
  wsPort?: number;
  host?: string;
  displayHost?: string; // IP address to display in logs/QR codes (for client connections)
  projectPath?: string;
  projectName?: string;
}

import { LogsServer } from '@jetstart/logs';

export class JetStartServer extends EventEmitter {
  private httpServer: any;
  private wsServer: any;
  private logsServer: LogsServer;
  private wsHandler: WebSocketHandler | null = null;
  private config: Required<ServerConfig> & { displayHost: string };
  private sessionManager: SessionManager;
  private buildService: BuildService;
  private hotReloadService: HotReloadService | null = null;
  private currentSession: ServerSession | null = null;
  private buildMutex: boolean = false;  // Prevent concurrent builds
  private latestApkPath: string | null = null;  // Store latest built APK path
  private useTrueHotReload: boolean = true;  // Use DEX-based hot reload
  private adbHelper: AdbHelper;  // Auto-install APKs via ADB
  private autoInstall: boolean = true;  // Auto-install APK after build
  private isFileChangeBuild: boolean = false;  // Track if build is from file change

  constructor(config: ServerConfig = {}) {
    super();
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
    this.logsServer = new LogsServer();
    this.buildService = new BuildService({
      cacheEnabled: true,
      cachePath: path.join(os.tmpdir(), 'jetstart-cache'),
      watchEnabled: true,
    });
    this.adbHelper = new AdbHelper();

    // Hook into logger events
    // This creates a circular import if we import logger here, but we imported 'log' etc.
    // We need to import loggerEvents.
    // The previous tool replacement added loggerEvents export.
  }

  async start(): Promise<ServerSession> {
    try {
      log('Starting JetStart Core server...');

      // Start Logs Server
      await this.logsServer.start();

      // Subscribe to internal logs
      loggerEvents.on('log', (entry) => {
        // Forward to Logs Server (for CLI)
        this.logsServer.addLog(entry);

        // Broadcast to Dashboard/Client
        if (this.currentSession && this.wsHandler) {
           this.wsHandler.sendLogBroadcast(this.currentSession.id, entry);
        }
      });

      // Create development session
      this.currentSession = await this.sessionManager.createSession({
        projectName: this.config.projectName,
        projectPath: this.config.projectPath,
      });

      // Inject server URL into build.gradle for hot reload
      const serverUrl = `ws://${this.config.displayHost}:${this.config.wsPort}`;
      await injectBuildConfigFields(this.config.projectPath, [
        { type: 'String', name: 'JETSTART_SERVER_URL', value: serverUrl },
        { type: 'String', name: 'JETSTART_SESSION_ID', value: this.currentSession.id }
      ]);
      log(`Injected server URL: ${serverUrl}`);

      // Initialize Hot Reload Service
      this.hotReloadService = new HotReloadService(this.config.projectPath);
      const envCheck = await this.hotReloadService.checkEnvironment();
      if (envCheck.ready) {
        log('🔥 True hot reload enabled (DEX-based)');
      } else {
        log('⚠️ True hot reload not available, falling back to DSL');
        log(`Issues: ${envCheck.issues.join(', ')}`);
        this.useTrueHotReload = false;
      }

      // Start HTTP server
      this.httpServer = await createHttpServer({
        port: this.config.httpPort,
        host: this.config.host,
        getLatestApk: () => this.latestApkPath,
        getCurrentSession: () => this.currentSession,
      });

      // Start WebSocket server
      const wsResult = await createWebSocketServer({
        port: this.config.wsPort,
        logsServer: this.logsServer,
        onClientConnected: async (sessionId: string) => {
          log(`Client connected (session: ${sessionId}). Triggering initial build...`);
          // Trigger initial build when client connects
          this.isFileChangeBuild = false; // Don't auto-install for initial build
          await this.handleRebuild();
        },
      });
      this.wsServer = wsResult.server;
      this.wsHandler = wsResult.handler;

      // Setup build service event listeners
      this.setupBuildListeners();

      // Start watching for file changes
      this.buildService.startWatching(this.config.projectPath, async (files) => {
        log(`Files changed: ${files.map(f => f.split(/[/\\]/).pop()).join(', ')}`);

        // For now, always use full Gradle build + ADB install for reliable updates
        // TRUE hot reload ($change instrumentation) can be enabled later
        log('📦 File changes detected, triggering Gradle build + ADB install');
        this.buildService.clearCache();
        this.isFileChangeBuild = true;  // Mark as file change build for auto-install
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

    if (this.logsServer) {
      await this.logsServer.stop();
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
      // Re-emit for external listeners (e.g., dev command)
      this.emit('build:start');
    });

    this.buildService.on('build:complete', async (result) => {
      success(`Build completed in ${result.buildTime}ms`);
      if (this.wsHandler && this.currentSession) {
        // Store the APK path
        this.latestApkPath = result.apkPath || null;

        // Send full download URL to client (not just relative path)
        const downloadUrl = `http://${this.config.displayHost}:${this.config.httpPort}/download/app.apk`;
        this.wsHandler.sendBuildComplete(this.currentSession.id, downloadUrl);
        log(`APK download URL: ${downloadUrl}`);

        // Auto-install APK via ADB only for file change builds (not initial builds)
        if (this.autoInstall && this.latestApkPath && this.isFileChangeBuild) {
          const devices = this.adbHelper.getDevices();
          if (devices.length > 0) {
            log(`📱 Auto-installing APK on ${devices.length} device(s)...`);
            const installResult = await this.adbHelper.installApk(this.latestApkPath);
            if (installResult.success) {
              success('📱 APK auto-installed! App will restart with new code.');
              // Launch the app
              await this.adbHelper.launchApp('com.jetstart.myapp', '.MainActivity');
            } else {
              error(`Auto-install failed: ${installResult.error}`);
            }
          } else {
            log('No devices connected for auto-install. Scan QR or download APK manually.');
          }
          // Reset flag after handling
          this.isFileChangeBuild = false;
        }
      }
      // Re-emit for external listeners (e.g., dev command) with result
      this.emit('build:complete', result);
    });

    this.buildService.on('build:error', (errorMsg, details) => {
      error(`Build failed: ${errorMsg}`);
      // TODO: Send build-error message via WebSocket
      // Re-emit for external listeners
      this.emit('build:error', errorMsg, details);
    });

    this.buildService.on('watch:change', (files) => {
      // This event is just for logging/monitoring
      // Actual build logic is handled in startWatching callback
      this.emit('watch:change', files);
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

  /**
   * Handle UI file updates - uses TRUE hot reload (DEX-based) when available
   */
  private async handleUIUpdate(filePath: string): Promise<void> {
    if (!this.currentSession || !this.wsHandler) {
      return;
    }

    // Try TRUE hot reload first (DEX-based)
    if (this.useTrueHotReload && this.hotReloadService) {
      try {
        log(`🔥 True hot reload: Compiling ${path.basename(filePath)}...`);
        const result = await this.hotReloadService.hotReload(filePath);

        if (result.success && result.dexBase64) {
          // Send DEX to app via WebSocket
          this.wsHandler.sendDexReload(
            this.currentSession.id,
            result.dexBase64,
            result.classNames
          );
          success(`🔥 True hot reload complete! (${result.compileTime + result.dexTime}ms)`);
          return;
        } else {
          error(`True hot reload failed: ${result.errors.join(', ')}`);
          log('Falling back to DSL hot reload...');
        }
      } catch (err: any) {
        error(`True hot reload error: ${err.message}`);
        log('Falling back to DSL hot reload...');
      }
    }

    // Fallback to DSL-based hot reload
    try {
      log(`Parsing UI file: ${path.basename(filePath)}`);
      const parseResult = DSLParser.parseFile(filePath);

      if (parseResult.success && parseResult.dsl) {
        const dslContent = JSON.stringify(parseResult.dsl);
        log(`DSL generated: ${dslContent.length} bytes`);

        // Send DSL update via WebSocket (instant hot reload!)
        this.wsHandler.sendUIUpdate(
          this.currentSession.id,
          dslContent,
          [path.basename(filePath)]
        );

        success(`DSL hot reload sent in <100ms ⚡`);
      } else {
        error(`Failed to parse UI file: ${parseResult.errors?.join(', ')}`);
        // Fallback to full build
        log('Falling back to full Gradle build...');
        this.handleRebuild();
      }
    } catch (err: any) {
      error(`UI update failed: ${err.message}`);
      // Fallback to full build
      this.handleRebuild();
    }
  }
}
