/**
 * StatusBar - Display connection status and build information
 */

import { WSState } from '@jetstart/shared';
import { BuildStatusInfo } from '../hooks/useWebSocket';
import './StatusBar.css';

export interface StatusBarProps {
  connectionState: WSState;
  projectName: string | null;
  buildStatus: BuildStatusInfo;
}

export function StatusBar({ connectionState, projectName, buildStatus }: StatusBarProps) {
  const getConnectionStatusClass = () => {
    switch (connectionState) {
      case WSState.CONNECTED:
        return 'status-connected';
      case WSState.CONNECTING:
        return 'status-connecting';
      case WSState.ERROR:
        return 'status-error';
      default:
        return 'status-disconnected';
    }
  };

  const getConnectionStatusText = () => {
    switch (connectionState) {
      case WSState.CONNECTED:
        return 'Connected';
      case WSState.CONNECTING:
        return 'Connecting...';
      case WSState.ERROR:
        return 'Error';
      default:
        return 'Disconnected';
    }
  };

  const getBuildStatusClass = () => {
    if (buildStatus.error) return 'build-error';
    if (buildStatus.isBuilding) return 'build-building';
    if (buildStatus.apkInfo) return 'build-success';
    return 'build-idle';
  };

  const getBuildStatusText = () => {
    if (buildStatus.error) return `Build Failed: ${buildStatus.error}`;
    if (buildStatus.isBuilding) return `Building: ${buildStatus.phase} (${buildStatus.progress}%)`;
    if (buildStatus.apkInfo) return 'Build Complete';
    return 'Ready';
  };

  return (
    <div className="status-bar">
      <div className="status-bar-section">
        <div className={`connection-status ${getConnectionStatusClass()}`}>
          <span className="status-indicator"></span>
          <span className="status-text">{getConnectionStatusText()}</span>
        </div>
        {projectName && (
          <div className="project-name">
            <span className="label">Project:</span>
            <span className="value">{projectName}</span>
          </div>
        )}
      </div>

      <div className="status-bar-section">
        <div className={`build-status ${getBuildStatusClass()}`}>
          <span className="status-text">{getBuildStatusText()}</span>
        </div>
      </div>

      {buildStatus.isBuilding && (
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${buildStatus.progress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}
