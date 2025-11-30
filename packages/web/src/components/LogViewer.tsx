/**
 * LogViewer - Display and filter log entries
 */

import { useEffect, useRef } from 'react';
import { LogEntry, LogLevel, LogSource } from '@jetstart/shared';
import './LogViewer.css';

export interface LogViewerProps {
  logs: LogEntry[];
  onClear?: () => void;
  autoScroll?: boolean;
}

export function LogViewer({ logs, onClear, autoScroll = true }: LogViewerProps) {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const getLevelClass = (level: LogLevel): string => {
    switch (level) {
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        return 'log-level-error';
      case LogLevel.WARN:
        return 'log-level-warn';
      case LogLevel.INFO:
        return 'log-level-info';
      case LogLevel.DEBUG:
        return 'log-level-debug';
      case LogLevel.VERBOSE:
        return 'log-level-verbose';
      default:
        return '';
    }
  };

  const getSourceBadgeClass = (source: LogSource): string => {
    return `source-badge source-${source.toLowerCase()}`;
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    const timeStr = date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${timeStr}.${ms}`;
  };

  return (
    <div className="log-viewer">
      <div className="log-viewer-header">
        <h3>Logs</h3>
        <div className="log-viewer-actions">
          <span className="log-count">{logs.length} entries</span>
          {onClear && (
            <button onClick={onClear} className="clear-button">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="log-container" ref={logContainerRef}>
        {logs.length === 0 ? (
          <div className="log-empty">
            <p>No logs yet. Waiting for activity...</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className={`log-entry ${getLevelClass(log.level)}`}>
              <span className="log-timestamp">{formatTimestamp(log.timestamp)}</span>
              <span className={getSourceBadgeClass(log.source)}>{log.source}</span>
              <span className="log-level">{log.level.toUpperCase()}</span>
              <span className="log-tag">[{log.tag}]</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
