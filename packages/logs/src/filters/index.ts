/**
 * Log Filters
 * Filter logs by level, source, tag, or search query
 */


import { LogEntry, LogFilter } from '@jetstart/shared';
import { filterByLevel } from './level';
import { filterBySource } from './source';
import { filterBySearch } from './search';

export function applyFilters(logs: LogEntry[], filter: LogFilter): LogEntry[] {
  let filtered = logs;

  // Filter by level
  if (filter.levels && filter.levels.length > 0) {
    filtered = filterByLevel(filtered, filter.levels);
  }

  // Filter by source
  if (filter.sources && filter.sources.length > 0) {
    filtered = filterBySource(filtered, filter.sources);
  }

  // Filter by tags
  if (filter.tags && filter.tags.length > 0) {
    filtered = filtered.filter(log => 
      filter.tags!.includes(log.tag)
    );
  }

  // Filter by search query
  if (filter.searchQuery) {
    filtered = filterBySearch(filtered, filter.searchQuery);
  }

  // Filter by time range
  if (filter.startTime) {
    filtered = filtered.filter(log => log.timestamp >= filter.startTime!);
  }

  if (filter.endTime) {
    filtered = filtered.filter(log => log.timestamp <= filter.endTime!);
  }

  return filtered;
}

export { filterByLevel } from './level';
export { filterBySource } from './source';
export { filterBySearch } from './search';