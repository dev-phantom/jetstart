/**
 * ConnectionPanel - Panel for connecting to JetStart Core server
 */

import { useState } from 'react';
import './ConnectionPanel.css';

export interface ConnectionPanelProps {
  onConnect: (sessionId: string, token: string, wsUrl?: string) => void;
  isConnected: boolean;
}

export function ConnectionPanel({ onConnect, isConnected }: ConnectionPanelProps) {
  const [sessionId, setSessionId] = useState('');
  const [token, setToken] = useState('');
  const [wsUrl, setWsUrl] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sessionId && token) {
      onConnect(sessionId, token, wsUrl || undefined);
    }
  };

  if (isConnected) {
    return null;
  }

  return (
    <div className="connection-panel-overlay">
      <div className="connection-panel">
        <div className="connection-panel-header">
          <h2>Connect to JetStart</h2>
          <p>Enter your session details to connect to the development server</p>
        </div>

        <form onSubmit={handleSubmit} className="connection-form">
          <div className="form-group">
            <label htmlFor="sessionId">Session ID</label>
            <input
              id="sessionId"
              type="text"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              placeholder="Enter session ID from CLI"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="token">Token</label>
            <input
              id="token"
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter session token from CLI"
              required
            />
          </div>

          <div className="form-group">
            <button
              type="button"
              className="advanced-toggle"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? '▼' : '▶'} Advanced Settings
            </button>
          </div>

          {showAdvanced && (
            <div className="advanced-settings">
              <div className="form-group">
                <label htmlFor="wsUrl">WebSocket URL (optional)</label>
                <input
                  id="wsUrl"
                  type="text"
                  value={wsUrl}
                  onChange={(e) => setWsUrl(e.target.value)}
                  placeholder="ws://localhost:8766"
                />
                <small>Leave empty to use default</small>
              </div>
            </div>
          )}

          <button type="submit" className="connect-button" disabled={!sessionId || !token}>
            Connect
          </button>
        </form>

        <div className="connection-help">
          <h3>How to connect:</h3>
          <ol>
            <li>Run <code>jetstart dev</code> in your project directory</li>
            <li>Copy the Session ID and Token from the terminal</li>
            <li>Paste them in the fields above and click Connect</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
