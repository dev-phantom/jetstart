/**
 * Source Filter
 * Filter logs by source (CLI, Core, Client, etc.)
 */

import { LogEntry, LogSource } from '@jetstart/shared';

export function filterBySource(logs: LogEntry[], sources: LogSource[]): LogEntry[] {
  return logs.filter(log => sources.includes(log.source));
}