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
  onLog?: (log: any) => void;
}

export interface UseWebSocketReturn {
  state: WSState;
  isConnected: boolean;
  projectName: string | null;
  buildStatus: BuildStatusInfo;
  error: Error | null;
  currentDSL: string | null;
  dslHash: string | null;
  /** Last DEX hot reload info — null until a Kotlin file is hot-reloaded. */
  dexReloadInfo: { classNames: string[]; count: number; timestamp: number } | null;
  /** Latest compiled JS module for web live preview — null until first hot reload. */
  jsUpdate: { jsBase64: string; sourceFile: string; byteSize: number; timestamp: number } | null;
  reloadTrigger: number;
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
  const [currentDSL, setCurrentDSL] = useState<string | null>(null);
  const [dslHash, setDslHash] = useState<string | null>(null);
  const [dexReloadInfo, setDexReloadInfo] = useState<UseWebSocketReturn['dexReloadInfo']>(null);
  const [jsUpdate, setJsUpdate] = useState<UseWebSocketReturn['jsUpdate']>(null);
  const [reloadTrigger, setReloadTrigger] = useState<number>(0);

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

      onJsUpdate: (jsBase64, sourceFile, byteSize) => {
        console.log('[JsPreview] Received JS module:', sourceFile, byteSize, 'bytes');
        setJsUpdate({ jsBase64, sourceFile, byteSize, timestamp: Date.now() });
      },

      onDexReload: (classNames, dexBase64Length) => {
        console.log('DEX hot reload:', classNames.length, 'classes,', dexBase64Length, 'bytes');
        setDexReloadInfo({ classNames, count: classNames.length, timestamp: Date.now() });
      },

      onUIUpdate: (dslContent, _screens, hash) => {
        console.log('UI update received:', dslContent.length, 'bytes');
        setCurrentDSL(dslContent);
        setDslHash(hash || null);
      },

      onReload: (reloadType) => {
        console.log('Reload requested:', reloadType);
        if (reloadType === 'full') {
          setReloadTrigger((prev) => prev + 1);
        }
        // For both 'full' and 'hot', we want to force re-evaluation of the current JS module
        setJsUpdate((prev) => (prev ? { ...prev, timestamp: Date.now() } : null));
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

      onLog: options.onLog,
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
    currentDSL,
    dslHash,
    dexReloadInfo,
    jsUpdate,
    reloadTrigger,
    connect,
    disconnect,
    sendStatus,
  };
}
