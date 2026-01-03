import { BuildStatusInfo } from '../hooks/useWebSocket';
import './BuildProgress.css';

export interface BuildProgressProps {
  buildStatus: BuildStatusInfo;
}

export function BuildProgress({ buildStatus }: BuildProgressProps) {
  if (!buildStatus.isBuilding && !buildStatus.apkInfo) {
    return null;
  }

  if (buildStatus.isBuilding) {
    return (
      <div className="build-progress-panel">
        <h3 className="build-progress-title">Build in Progress</h3>

        <div className="build-phase">
          <span className="phase-label">Current Phase</span>
          <span className="phase-value">{buildStatus.phase}</span>
        </div>

        <div className="progress-bar-container">
          <div
            className="progress-bar-fill"
            style={{ width: `${buildStatus.progress}%` }}
          >
            <span className="progress-text">{buildStatus.progress}%</span>
          </div>
        </div>
      </div>
    );
  }

  if (buildStatus.apkInfo) {
    return (
      <div className="build-progress-panel success">
        <h3 className="build-progress-title">Build Complete</h3>

        <div className="build-info-grid">
          <div className="info-item">
            <span className="info-label">Version</span>
            <span className="info-value">
              {buildStatus.apkInfo.versionName} ({buildStatus.apkInfo.versionCode})
            </span>
          </div>

          <div className="info-item">
            <span className="info-label">Size</span>
            <span className="info-value">{formatFileSize(buildStatus.apkInfo.size)}</span>
          </div>

          <div className="info-item">
            <span className="info-label">Package</span>
            <span className="info-value package-id">
              {buildStatus.apkInfo.applicationId}
            </span>
          </div>
        </div>

        {buildStatus.downloadUrl && (
          <a
            href={buildStatus.downloadUrl}
            download
            className="download-link"
          >
            Download APK
          </a>
        )}
      </div>
    );
  }

  return null;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
