/**
 * useWebSocket - React hook for managing WebSocket connection to Core server
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { CoreClient, CoreClientConfig } from '../services/CoreClient';
import { WSState, SessionStatus, APKInfo } from '@jetstart/shared';

export interface UseWebSocketOptions {
  sessionId: string;
  token: string;
  wsUrl?: string;
  autoConnect?: boolean;
}

export interface UseWebSocketReturn {
  state: WSState;
  isConnected: boolean;
  projectName: string | null;
  buildStatus: BuildStatusInfo;
  error: Error | null;
  connect: () => void;
  disconnect: () => void;
  sendStatus: (status: SessionStatus, message?: string) => void;
}

export interface BuildStatusInfo {
  isBuilding: boolean;
  phase: string | null;
  progress: number;
  error: string | null;
  apkInfo: APKInfo | null;
  downloadUrl: string | null;
}

export function useWebSocket(options: UseWebSocketOptions): UseWebSocketReturn {
  const [state, setState] = useState<WSState>(WSState.DISCONNECTED);
  const [projectName, setProjectName] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [buildStatus, setBuildStatus] = useState<BuildStatusInfo>({
    isBuilding: false,
    phase: null,
    progress: 0,
    error: null,
    apkInfo: null,
    downloadUrl: null,
  });

  const clientRef = useRef<CoreClient | null>(null);

  // Initialize CoreClient
  useEffect(() => {
    const config: CoreClientConfig = {
      sessionId: options.sessionId,
      token: options.token,
      wsUrl: options.wsUrl,

      onConnected: (sessionId, projectName) => {
        console.log('Connected to session:', sessionId, projectName);
        setProjectName(projectName);
        setError(null);
      },

      onBuildStart: () => {
        console.log('Build started');
        setBuildStatus({
          isBuilding: true,
          phase: 'Starting',
          progress: 0,
          error: null,
          apkInfo: null,
          downloadUrl: null,
        });
      },

      onBuildStatus: (status) => {
        console.log('Build status:', status);
        setBuildStatus((prev) => ({
          ...prev,
          phase: status.phase,
          progress: status.progress,
        }));
      },

      onBuildComplete: (apkInfo, downloadUrl) => {
        console.log('Build complete:', apkInfo);
        setBuildStatus({
          isBuilding: false,
          phase: 'Complete',
          progress: 100,
          error: null,
          apkInfo,
          downloadUrl,
        });
      },

      onBuildError: (buildError) => {
        console.error('Build error:', buildError);
        setBuildStatus({
          isBuilding: false,
          phase: 'Failed',
          progress: 0,
          error: buildError,
          apkInfo: null,
          downloadUrl: null,
        });
      },

      onReload: (reloadType) => {
        console.log('Reload requested:', reloadType);
        // In a real implementation, this would trigger a reload of the app preview
      },

      onDisconnect: (reason) => {
        console.log('Disconnected:', reason);
        setProjectName(null);
      },

      onStateChange: (newState) => {
        console.log('State changed:', newState);
        setState(newState);
      },

      onError: (err) => {
        console.error('WebSocket error:', err);
        setError(err);
      },
    };

    clientRef.current = new CoreClient(config);

    // Auto-connect if enabled
    if (options.autoConnect !== false) {
      clientRef.current.connect();
    }

    // Cleanup on unmount
    return () => {
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }
    };
  }, [options.sessionId, options.token, options.wsUrl, options.autoConnect]);

  const connect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      clientRef.current.disconnect();
    }
  }, []);

  const sendStatus = useCallback((status: SessionStatus, message?: string) => {
    if (clientRef.current) {
      clientRef.current.sendStatus(status, message);
    }
  }, []);

  return {
    state,
    isConnected: state === WSState.CONNECTED,
    projectName,
    buildStatus,
    error,
    connect,
    disconnect,
    sendStatus,
  };
}
