import { useComposeRenderer } from '../services/ComposeRenderer';
/**
 * DeviceFrame - Simulated Android device frame for app preview
 */

import { BuildStatusInfo } from '../hooks/useWebSocket';
import { formatFileSize } from '../utils/file';
import './DeviceFrame.css';

export interface DeviceFrameProps {
  buildStatus: BuildStatusInfo;
  projectName: string | null;
  currentDSL?: string | null;  // Unused — server now sends DEX not DSL
  dslHash?: string | null;       // Unused
  dexReloadInfo: { classNames: string[]; count: number; timestamp: number } | null;
  /** Compiled Kotlin→JS module from the server — drives live Compose rendering */
  jsUpdate: { jsBase64: string; sourceFile: string; byteSize: number; timestamp: number } | null;
}

export function DeviceFrame({ buildStatus, projectName, currentDSL: _currentDSL, dslHash: _dslHash, dexReloadInfo, jsUpdate }: DeviceFrameProps) {
  // server sends DEX hot reload + JS preview
  const { element: composeElement, isLoading: composeLoading, error: composeError, sourceFile: composeSource, compileMs } = useComposeRenderer(jsUpdate);

  const renderContent = () => {
    // Live Compose rendering (kotlinc-js pipeline)
    if (composeLoading) {
      return (
        <div className="device-content-message building">
          <div className="spinner"></div>
          <h3>Compiling Kotlin → JS</h3>
          <p style={{ fontSize: '12px', color: '#aaa' }}>Live preview loading...</p>
        </div>
      );
    }

    if (composeError) {
      return (
        <div className="device-content-message error">
          <h3>⚠ Preview Error</h3>
          <p style={{ fontSize: '11px', fontFamily: 'monospace', whiteSpace: 'pre-wrap', maxHeight: 200, overflowY: 'auto' }}>{composeError}</p>
        </div>
      );
    }

    if (composeElement) {
      return (
        <div style={{ width: '100%', height: '100%', overflowY: 'auto', fontFamily: 'Roboto, sans-serif' }}>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" />
          {composeElement}
          {compileMs !== null && (
            <div style={{ position: 'absolute', bottom: 4, right: 8, fontSize: 10, color: 'rgba(0,0,0,.3)', fontFamily: 'monospace', pointerEvents: 'none' }}>
              ⚡ {compileMs}ms · {composeSource}
            </div>
          )}
        </div>
      );
    }

    if (buildStatus.error) {
      return (
        <div className="device-content-message error">
          <h3>⚠ Build Failed</h3>
          <p>{buildStatus.error}</p>
        </div>
      );
    }

    if (buildStatus.isBuilding) {
      return (
        <div className="device-content-message building">
          <div className="spinner"></div>
          <h3>{buildStatus.phase}</h3>
          <p>{buildStatus.progress}% complete</p>
        </div>
      );
    }

    // DEX hot reload event received
    if (dexReloadInfo) {
      const secondsAgo = Math.round((Date.now() - dexReloadInfo.timestamp) / 1000);
      return (
        <div className="device-content-message success">
          <h3>⚡ Hot Reload Applied</h3>
          <p style={{ fontSize: '13px', color: '#aaa', marginTop: 4 }}>
            {secondsAgo === 0 ? 'Just now' : `${secondsAgo}s ago`}
          </p>
          <div className="apk-info" style={{ textAlign: 'left', marginTop: 12 }}>
            <p><strong>{dexReloadInfo.count} class{dexReloadInfo.count !== 1 ? 'es' : ''} updated:</strong></p>
            {dexReloadInfo.classNames.slice(0, 8).map((cls, i) => (
              <p key={i} style={{ fontSize: '11px', color: '#ccc', fontFamily: 'monospace', margin: '2px 0' }}>
                {cls.split('.').pop()}
              </p>
            ))}
            {dexReloadInfo.classNames.length > 8 && (
              <p style={{ fontSize: '11px', color: '#888' }}>+{dexReloadInfo.classNames.length - 8} more</p>
            )}
          </div>
          <p className="install-instructions" style={{ marginTop: 16 }}>
            Changes are live on your connected device
          </p>
        </div>
      );
    }

    // Build complete — show APK download
    if (buildStatus.apkInfo) {
      return (
        <div className="device-content-message success">
          <h3>✔ Build Complete</h3>
          <div className="apk-info">
            <p><strong>Version:</strong> {buildStatus.apkInfo.versionName} ({buildStatus.apkInfo.versionCode})</p>
            <p><strong>Size:</strong> {formatFileSize(buildStatus.apkInfo.size)}</p>
            <p><strong>Package:</strong> {buildStatus.apkInfo.applicationId}</p>
          </div>
          {buildStatus.downloadUrl && (
            <a href={buildStatus.downloadUrl} download className="download-button">
              ⬇ Download APK
            </a>
          )}
          <p className="install-instructions">
            Scan the QR code with your Android device to install and connect
          </p>
        </div>
      );
    }

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
        {composeSource && <span className="dsl-hash"> • ⚡ {composeSource}</span>}
        {dexReloadInfo && !composeSource && <span className="dsl-hash"> • {dexReloadInfo.count} class{dexReloadInfo.count !== 1 ? 'es' : ''}</span>}
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


