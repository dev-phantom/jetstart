/**
 * Logs-specific types
 */

export interface LogViewerOptions {
  follow?: boolean;
  tail?: number;
  filter?: any;
}

export interface LogServerStats {
  totalLogs: number;
  activeClients: number;
  uptime: number;
}