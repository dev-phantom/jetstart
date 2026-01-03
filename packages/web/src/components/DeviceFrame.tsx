/**
 * DeviceFrame - Simulated Android device frame for app preview
 */

import { useState, useEffect, useCallback } from 'react';
import { BuildStatusInfo } from '../hooks/useWebSocket';
import { DSLRenderer } from './dsl';
import { parseUIDefinition } from '../utils/dslParser';
import { UIDefinition } from '../types/dsl';
import './DeviceFrame.css';

export interface DeviceFrameProps {
  buildStatus: BuildStatusInfo;
  projectName: string | null;
  currentDSL: string | null;
  dslHash: string | null;
}

export function DeviceFrame({ buildStatus, projectName, currentDSL, dslHash }: DeviceFrameProps) {
  const [uiDefinition, setUIDefinition] = useState<UIDefinition | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);

  // Parse DSL when it changes
  useEffect(() => {
    if (currentDSL) {
      try {
        const parsed = parseUIDefinition(currentDSL);
        setUIDefinition(parsed);
        setParseError(null);
        console.log('DSL parsed successfully:', parsed);
      } catch (error) {
        console.error('Failed to parse DSL:', error);
        setParseError((error as Error).message);
        setUIDefinition(null);
      }
    }
  }, [currentDSL, dslHash]);

  const handleButtonClick = useCallback((action: string) => {
    console.log('Button action:', action);
    // TODO: Implement action handling (could send back to server)
  }, []);
  const renderContent = () => {
    // Error states first
    if (parseError) {
      return (
        <div className="device-content-message error">
          <h3>DSL Parse Error</h3>
          <p>{parseError}</p>
        </div>
      );
    }

    if (buildStatus.error) {
      return (
        <div className="device-content-message error">
          <h3>Build Failed</h3>
          <p>{buildStatus.error}</p>
        </div>
      );
    }

    // Building state
    if (buildStatus.isBuilding) {
      return (
        <div className="device-content-message building">
          <div className="spinner"></div>
          <h3>{buildStatus.phase}</h3>
          <p>{buildStatus.progress}% complete</p>
        </div>
      );
    }

    // DSL UI rendering (PRIORITY - show live preview)
    if (uiDefinition) {
      return (
        <div className="dsl-preview-container">
          <DSLRenderer
            element={uiDefinition.screen}
            onButtonClick={handleButtonClick}
          />
        </div>
      );
    }

    // Build complete (fallback - show download option)
    if (buildStatus.apkInfo) {
      return (
        <div className="device-content-message success">
          <h3>Build Complete</h3>
          <div className="apk-info">
            <p><strong>Version:</strong> {buildStatus.apkInfo.versionName} ({buildStatus.apkInfo.versionCode})</p>
            <p><strong>Size:</strong> {formatFileSize(buildStatus.apkInfo.size)}</p>
            <p><strong>Package:</strong> {buildStatus.apkInfo.applicationId}</p>
          </div>
          {buildStatus.downloadUrl && (
            <a
              href={buildStatus.downloadUrl}
              download
              className="download-button"
            >
              Download APK
            </a>
          )}
          <p className="install-instructions">
            Scan the QR code with your device to install the app
          </p>
        </div>
      );
    }

    // Idle state
    return (
      <div className="device-content-message idle">
        <h3>Ready</h3>
        <p>Waiting for build...</p>
        {projectName && <p className="project-name-display">{projectName}</p>}
      </div>
    );
  };

  return (
    <div className="device-frame-container">
      <div className="device-frame">
        <div className="device-notch"></div>
        <div className="device-screen">
          <div className="status-bar-phone">
            <span className="time">{getCurrentTime()}</span>
            <div className="status-icons">
              <span className="icon">📶</span>
              <span className="icon">📶</span>
              <span className="icon">🔋</span>
            </div>
          </div>
          <div className="device-content">
            {renderContent()}
          </div>
        </div>
        <div className="device-home-button"></div>
      </div>
      <div className="device-label">
        JetStart Web Emulator
        {dslHash && <span className="dsl-hash"> • {dslHash.slice(0, 8)}</span>}
      </div>
    </div>
  );
}

function getCurrentTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
