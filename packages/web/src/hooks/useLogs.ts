/**
 * useLogs - React hook for managing log entries and filtering
 */

import { useState, useCallback, useMemo } from 'react';
import { LogEntry, LogFilter } from '@jetstart/shared';

export interface UseLogsReturn {
  logs: LogEntry[];
  filteredLogs: LogEntry[];
  filter: LogFilter;
  addLog: (log: LogEntry) => void;
  clearLogs: () => void;
  setFilter: (filter: Partial<LogFilter>) => void;
  resetFilter: () => void;
}

const DEFAULT_FILTER: LogFilter = {
  levels: undefined,
  sources: undefined,
  tags: undefined,
  searchQuery: undefined,
};

export function useLogs(maxLogs: number = 1000): UseLogsReturn {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilterState] = useState<LogFilter>(DEFAULT_FILTER);

  const addLog = useCallback(
    (log: LogEntry) => {
      setLogs((prevLogs) => {
        const newLogs = [...prevLogs, log];
        // Keep only the last maxLogs entries
        if (newLogs.length > maxLogs) {
          return newLogs.slice(newLogs.length - maxLogs);
        }
        return newLogs;
      });
    },
    [maxLogs]
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, []);

  const setFilter = useCallback((newFilter: Partial<LogFilter>) => {
    setFilterState((prev) => ({
      ...prev,
      ...newFilter,
    }));
  }, []);

  const resetFilter = useCallback(() => {
    setFilterState(DEFAULT_FILTER);
  }, []);

  // Filter logs based on current filter settings
  const filteredLogs = useMemo(() => {
    let result = logs;

    // Filter by levels
    if (filter.levels && filter.levels.length > 0) {
      result = result.filter((log) => filter.levels!.includes(log.level));
    }

    // Filter by sources
    if (filter.sources && filter.sources.length > 0) {
      result = result.filter((log) => filter.sources!.includes(log.source));
    }

    // Filter by tags
    if (filter.tags && filter.tags.length > 0) {
      result = result.filter((log) => filter.tags!.includes(log.tag));
    }

    // Filter by search query
    if (filter.searchQuery) {
      const query = filter.searchQuery.toLowerCase();
      result = result.filter(
        (log) =>
          log.message.toLowerCase().includes(query) ||
          log.tag.toLowerCase().includes(query)
      );
    }

    // Filter by time range
    if (filter.startTime) {
      result = result.filter((log) => log.timestamp >= filter.startTime!);
    }

    if (filter.endTime) {
      result = result.filter((log) => log.timestamp <= filter.endTime!);
    }

    return result;
  }, [logs, filter]);

  return {
    logs,
    filteredLogs,
    filter,
    addLog,
    clearLogs,
    setFilter,
    resetFilter,
  };
}
