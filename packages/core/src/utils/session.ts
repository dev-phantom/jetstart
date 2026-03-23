/**
 * Session Manager
 * Manages development sessions
 */

import { ServerSession } from '../types';
import { SESSION_TOKEN_EXPIRY } from '@jetstart/shared';

export class SessionManager {
  private sessions: Map<string, ServerSession> = new Map();

  async createSession(data: {
    projectName: string;
    projectPath: string;
  }): Promise<ServerSession> {
    const session: ServerSession = {
      id: this.generateShortId(),
      token: this.generateToken(),
      projectName: data.projectName,
      projectPath: data.projectPath,
      createdAt: Date.now(),
      lastActivity: Date.now(),
    };

    this.sessions.set(session.id, session);
    return session;
  }

  getSession(sessionId: string): ServerSession | undefined {
    return this.sessions.get(sessionId);
  }

  updateActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = Date.now();
    }
  }

  deleteSession(sessionId: string): void {
    this.sessions.delete(sessionId);
  }

  cleanupExpiredSessions(): void {
    const now = Date.now();
    
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastActivity > SESSION_TOKEN_EXPIRY) {
        this.sessions.delete(id);
      }
    }
  }

  private generateShortId(): string {
    // Generate a short random ID (8 chars) for QR code efficiency
    // Use base62 (alphanumeric) for better QR code density
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private generateToken(): string {
    // Generate a short random token (12 chars) for QR code efficiency
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}