/**
 * App - Main application component for JetStart Web Emulator
 */

import { useState, useEffect } from 'react';
import { useWebSocket } from './hooks/useWebSocket';
import { useLogs } from './hooks/useLogs';
import { usePerformanceMetrics } from './hooks/usePerformanceMetrics';
import { StatusBar } from './components/StatusBar';
import { LogViewer } from './components/LogViewer';
import { ConnectionPanel } from './components/ConnectionPanel';
import { DeviceFrame } from './components/DeviceFrame';
import { PerformancePanel } from './components/PerformancePanel';
import { BuildProgress } from './components/BuildProgress';
import { LogLevel, LogSource } from '@jetstart/shared';
import './App.css';
import './styles/material-typography.css';

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
    currentDSL,
    dslHash,
    connect,
  } = useWebSocket({
    sessionId,
    token,
    wsUrl,
    autoConnect: false,
    onLog: (log) => addLog(log),
  });

  const { filteredLogs, addLog, clearLogs } = useLogs(1000);
  const { metrics, onBuildStart, onBuildComplete, onUIUpdate } = usePerformanceMetrics();

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

  // Removed mock logs
  useEffect(() => {
    if (isConnected && projectName) {
        // Optional: Manual log if needed
    }
  }, [isConnected, projectName]);

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

  // Track build performance
  useEffect(() => {
    if (buildStatus.isBuilding) {
      onBuildStart();
    } else if (buildStatus.apkInfo || buildStatus.error) {
      onBuildComplete();
    }
  }, [buildStatus.isBuilding, buildStatus.apkInfo, buildStatus.error, onBuildStart, onBuildComplete]);

  // Track UI updates (hot reload)
  useEffect(() => {
    if (currentDSL && dslHash) {
      onUIUpdate();
    }
  }, [dslHash, onUIUpdate]);

  return (
    <div className="app">
      <StatusBar
        connectionState={state}
        projectName={projectName}
        buildStatus={buildStatus}
      />

      <div className="app-content">
        <div className="main-panel">
          <DeviceFrame
            buildStatus={buildStatus}
            projectName={projectName}
            currentDSL={currentDSL}
            dslHash={dslHash}
          />
        </div>

        <div className="side-panel">
          <PerformancePanel metrics={metrics} />
          <BuildProgress buildStatus={buildStatus} />
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
