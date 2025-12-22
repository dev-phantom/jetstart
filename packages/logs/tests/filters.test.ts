/**
 * Tests for log filters
 */

import { filterByLevel, filterBySource, filterBySearch, applyFilters } from '../src/filters';
import { LogEntry, LogLevel, LogSource } from '@jetstart/shared';

describe('Log Filters', () => {
  const sampleLogs: LogEntry[] = [
    {
      id: '1',
      timestamp: Date.now(),
      level: LogLevel.INFO,
      tag: 'Test',
      message: 'Info message',
      source: LogSource.CLI,
    },
    {
      id: '2',
      timestamp: Date.now(),
      level: LogLevel.ERROR,
      tag: 'Test',
      message: 'Error message',
      source: LogSource.BUILD,
    },
    {
      id: '3',
      timestamp: Date.now(),
      level: LogLevel.WARN,
      tag: 'Test',
      message: 'Warning message',
      source: LogSource.CORE,
    },
  ];

  describe('filterByLevel', () => {
    it('should filter logs by level', () => {
      const filtered = filterByLevel(sampleLogs, [LogLevel.ERROR]);
      expect(filtered.length).toBe(1);
      expect(filtered[0].level).toBe(LogLevel.ERROR);
    });

    it('should filter by multiple levels', () => {
      const filtered = filterByLevel(sampleLogs, [LogLevel.ERROR, LogLevel.WARN]);
      expect(filtered.length).toBe(2);
    });
  });

  describe('filterBySource', () => {
    it('should filter logs by source', () => {
      const filtered = filterBySource(sampleLogs, [LogSource.BUILD]);
      expect(filtered.length).toBe(1);
      expect(filtered[0].source).toBe(LogSource.BUILD);
    });
  });

  describe('filterBySearch', () => {
    it('should search in message', () => {
      const filtered = filterBySearch(sampleLogs, 'error');
      expect(filtered.length).toBe(1);
      expect(filtered[0].message).toContain('Error');
    });

    it('should be case-insensitive', () => {
      const filtered = filterBySearch(sampleLogs, 'ERROR');
      expect(filtered.length).toBe(1);
    });
  });

  describe('applyFilters', () => {
    it('should apply multiple filters', () => {
      const filtered = applyFilters(sampleLogs, {
        levels: [LogLevel.ERROR, LogLevel.WARN],
        sources: [LogSource.BUILD],
      });
      expect(filtered.length).toBe(1);
      expect(filtered[0].level).toBe(LogLevel.ERROR);
      expect(filtered[0].source).toBe(LogSource.BUILD);
    });
  });
});