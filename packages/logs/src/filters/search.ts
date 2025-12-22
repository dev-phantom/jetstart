/**
 * Search Filter
 * Filter logs by text search
 */

import { LogEntry } from '@jetstart/shared';

export function filterBySearch(logs: LogEntry[], query: string): LogEntry[] {
  const lowerQuery = query.toLowerCase();

  return logs.filter(log => {
    // Search in message
    if (log.message.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Search in tag
    if (log.tag.toLowerCase().includes(lowerQuery)) {
      return true;
    }

    // Search in metadata
    if (log.metadata) {
      const metadataStr = JSON.stringify(log.metadata).toLowerCase();
      if (metadataStr.includes(lowerQuery)) {
        return true;
      }
    }

    return false;
  });
}