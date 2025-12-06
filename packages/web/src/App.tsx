/**
 * App - Main application component for JetStart Web Emulator
 */

import { useState, useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { useLogs } from './hooks/useLogs';
import { StatusBar } from './components/StatusBar';
import { LogViewer } from './components/LogViewer';
import { ConnectionPanel } from './components/ConnectionPanel';
import { DeviceFrame } from './components/DeviceFrame';
import { LogLevel, LogSource } from '@jetstart/shared';
import './App.css';

function App() {
  const [sessionId, setSessionId] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [wsUrl, setWsUrl] = useState<string | undefined>(undefined);
  const [isConfigured, setIsConfigured] = useState(false);

  const {
    state,
    isConnected,
    projectName,
    buildStatus,
    error,
    connect,
  } = useWebSocket({
    sessionId,
    token,
    wsUrl,
    autoConnect: false,
  });

  const { filteredLogs, addLog, clearLogs } = useLogs(1000);

  // Handle connection
  const handleConnect = (newSessionId: string, newToken: string, newWsUrl?: string) => {
    setSessionId(newSessionId);
    setToken(newToken);
    setWsUrl(newWsUrl);
    setIsConfigured(true);
  };

  // Auto-connect when configured
  useEffect(() => {
    if (isConfigured && !isConnected) {
      connect();
    }
  }, [isConfigured, isConnected, connect]);

  // Add mock logs for demonstration
  useEffect(() => {
    if (isConnected && projectName) {
      addLog({
        id: `log-${Date.now()}-1`,
        timestamp: Date.now(),
        level: LogLevel.INFO,
        tag: 'jetstart:web',
        message: `Connected to project: ${projectName}`,
        source: LogSource.CLIENT,
      });
    }
  }, [isConnected, projectName, addLog]);

  // Add build status logs
  useEffect(() => {
    if (buildStatus.isBuilding && buildStatus.phase) {
      addLog({
        id: `log-${Date.now()}-build`,
        timestamp: Date.now(),
        level: LogLevel.INFO,
        tag: 'jetstart:build',
        message: `${buildStatus.phase} - ${buildStatus.progress}%`,
        source: LogSource.BUILD,
      });
    }

    if (buildStatus.error) {
      addLog({
        id: `log-${Date.now()}-error`,
        timestamp: Date.now(),
        level: LogLevel.ERROR,
        tag: 'jetstart:build',
        message: `Build failed: ${buildStatus.error}`,
        source: LogSource.BUILD,
      });
    }

    if (buildStatus.apkInfo) {
      addLog({
        id: `log-${Date.now()}-success`,
        timestamp: Date.now(),
        level: LogLevel.INFO,
        tag: 'jetstart:build',
        message: `Build complete: ${buildStatus.apkInfo.versionName}`,
        source: LogSource.BUILD,
      });
    }
  }, [buildStatus, addLog]);

  // Add error logs
  useEffect(() => {
    if (error) {
      addLog({
        id: `log-${Date.now()}-error`,
        timestamp: Date.now(),
        level: LogLevel.ERROR,
        tag: 'jetstart:network',
        message: error.message,
        source: LogSource.NETWORK,
      });
    }
  }, [error, addLog]);

  return (
    <div className="app">
      <StatusBar
        connectionState={state}
        projectName={projectName}
        buildStatus={buildStatus}
      />

      <div className="app-content">
        <div className="main-panel">
          <DeviceFrame buildStatus={buildStatus} projectName={projectName} />
        </div>

        <div className="side-panel">
          <LogViewer logs={filteredLogs} onClear={clearLogs} />
        </div>
      </div>

      <ConnectionPanel
        onConnect={handleConnect}
        isConnected={isConnected}
      />
    </div>
  );
}

export default App;
