/**
 * HTTP Routes
 * REST API endpoints
 */

import { Express, Request, Response } from 'express';
import path from 'path';
import { SessionManager } from '../utils/session';
import { generateQRCode } from '../utils/qr';
import { JETSTART_VERSION } from '@jetstart/shared';

const sessionManager = new SessionManager();

export function setupRoutes(app: Express): void {
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
  app.get('/download/:sessionId/:filename', async (req: Request, res: Response) => {
    const { sessionId, filename } = req.params;

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // In real implementation, serve the actual APK file
    const apkPath = path.join(session.projectPath, 'build', filename);
    
    res.download(apkPath, (err) => {
      if (err) {
        res.status(404).json({ error: 'APK not found' });
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