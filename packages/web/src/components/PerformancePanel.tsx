import { PerformanceMetrics } from '../hooks/usePerformanceMetrics';
import './PerformancePanel.css';

export interface PerformancePanelProps {
  metrics: PerformanceMetrics;
}

export function PerformancePanel({ metrics }: PerformancePanelProps) {
  return (
    <div className="performance-panel">
      <h3 className="performance-title">Performance Metrics</h3>

      <div className="performance-grid">
        <div className="metric-item">
          <span className="metric-label">Build Time</span>
          <span className="metric-value">
            {metrics.buildDuration !== null
              ? formatDuration(metrics.buildDuration)
              : '—'}
          </span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Last Hot Reload</span>
          <span className="metric-value">
            {metrics.hotReloadDuration !== null
              ? formatDuration(metrics.hotReloadDuration)
              : '—'}
          </span>
        </div>

        <div className="metric-item">
          <span className="metric-label">Total Hot Reloads</span>
          <span className="metric-value">{metrics.totalHotReloads}</span>
        </div>

        <div className="metric-item">
          <span className="metric-label">File Changes</span>
          <span className="metric-value">{metrics.fileChanges}</span>
        </div>
      </div>
    </div>
  );
}

function formatDuration(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }

  const seconds = (ms / 1000).toFixed(2);
  return `${seconds}s`;
}
