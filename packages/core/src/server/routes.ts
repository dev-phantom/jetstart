/**
 * HTTP Routes
 * REST API endpoints
 */
import { Express, Request, Response } from 'express';
import fs from 'fs';
import { SessionManager } from '../utils/session';
import { generateQRCode } from '../utils/qr';
import { JETSTART_VERSION, DEFAULT_WS_PORT } from '@jetstart/shared';
import { ServerSession } from '../types';

const sessionManager = new SessionManager();

export function setupRoutes(
  app: Express, 
  getLatestApk?: () => string | null,
  getCurrentSession?: () => ServerSession | null
): void {
  // Root Redirect -> Web Emulator
  app.get('/', (req: Request, res: Response) => {
    const isProduction = process.env.IS_PROD
    try {
      const session = getCurrentSession?.();
      
      // If no session active, just show simple status
      if (!session) {
        return res.send(`
          <h1>JetStart Core Running</h1>
          <p>No active session found. Please restart 'jetstart dev'.</p>
        `);
      }

      // Construct redirect URL
      const webUrl = isProduction ? 'https://web.jetstart.site': 'http://localhost:8000';
      const host = req.hostname;
      const port = req.socket.localPort || 8765;
      const wsPort = DEFAULT_WS_PORT;
      
      const queryParams = new URLSearchParams({
        host: host,
        port: String(port),
        wsPort: String(wsPort), // Typically 8766
        sessionId: session.id,
        token: session.token,
        version: JETSTART_VERSION,
        projectName: session.projectName || 'JetStart Project'
      });

      const redirectUrl = `${webUrl}?${queryParams.toString()}`;
      
      // Redirect to web emulator
      res.redirect(redirectUrl);
      
    } catch (err: any) {
      console.error('Redirect error:', err);
      res.status(500).send('Failed to redirect to emulator');
    }
  });
  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'ok',
      version: JETSTART_VERSION,
      uptime: process.uptime(),
    });
  });

  // Get version
  app.get('/version', (req: Request, res: Response) => {
    res.json({
      version: JETSTART_VERSION,
    });
  });

  // Create new session
  app.post('/session/create', async (req: Request, res: Response) => {
    try {
      const { projectName, projectPath } = req.body;

      if (!projectName || !projectPath) {
        return res.status(400).json({
          error: 'Missing required fields: projectName, projectPath',
        });
      }

      const session = await sessionManager.createSession({
        projectName,
        projectPath,
      });

      // Generate QR code
      const qrCode = await generateQRCode({
        sessionId: session.id,
        serverUrl: `http://${req.hostname}:${req.socket.localPort}`,
        wsUrl: `ws://${req.hostname}:${req.socket.localPort}`,
        token: session.token,
        projectName,
        version: JETSTART_VERSION,
      });

      res.json({
        session,
        qrCode,
      });

    } catch (err: any) {
      res.status(500).json({
        error: 'Failed to create session',
        message: err.message,
      });
    }
  });

  // Get session
  app.get('/session/:sessionId', (req: Request, res: Response) => {
    const session = sessionManager.getSession(req.params.sessionId);

    if (!session) {
      return res.status(404).json({
        error: 'Session not found',
      });
    }

    res.json(session);
  });

  // Download APK
  app.get('/download/:filename', async (req: Request, res: Response) => {
    // Get latest built APK path
    const apkPath = getLatestApk?.();

    if (!apkPath) {
      return res.status(404).json({ error: 'No APK available. Build the app first.' });
    }

    // Check if file exists
    if (!fs.existsSync(apkPath)) {
      return res.status(404).json({ error: 'APK file not found at expected location' });
    }

    // Send the APK file
    res.download(apkPath, req.params.filename || 'app-debug.apk', (err) => {
      if (err) {
        console.error(`Failed to send APK: ${err.message}`);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Failed to send APK file' });
        }
      }
    });
  });

  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Not found',
      path: req.path,
    });
  });
}