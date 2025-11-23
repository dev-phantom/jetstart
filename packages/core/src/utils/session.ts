/**
 * Session Manager
 * Manages development sessions
 */

import { v4 as uuidv4 } from 'uuid';
import { ServerSession } from '../types';
import { SESSION_TOKEN_EXPIRY } from '@jetstart/shared';

export class SessionManager {
  private sessions: Map<string, ServerSession> = new Map();

  async createSession(data: {
    projectName: string;
    projectPath: string;
  }): Promise<ServerSession> {
    const session: ServerSession = {
      id: uuidv4(),
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

  private generateToken(): string {
    return uuidv4().replace(/-/g, '');
  }
}