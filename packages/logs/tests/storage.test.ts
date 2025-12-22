/**
 * Tests for log storage
 */

import { LogStorage } from '../src/server/storage';
import { LogEntry, LogLevel, LogSource } from '@jetstart/shared';

describe('LogStorage', () => {
  let storage: LogStorage;

  beforeEach(() => {
    storage = new LogStorage(100);
  });

  it('should add and retrieve logs', () => {
    const log: LogEntry = {
      id: '1',
      timestamp: Date.now(),
      level: LogLevel.INFO,
      tag: 'Test',
      message: 'Test message',
      source: LogSource.CLI,
    };

    storage.add(log);
    const logs = storage.getAll();

    expect(logs.length).toBe(1);
    expect(logs[0]).toEqual(log);
  });

  it('should enforce max entries limit', () => {
    const smallStorage = new LogStorage(5);

    for (let i = 0; i < 10; i++) {
      smallStorage.add({
        id: String(i),
        timestamp: Date.now(),
        level: LogLevel.INFO,
        tag: 'Test',
        message: `Message ${i}`,
        source: LogSource.CLI,
      });
    }

    const logs = smallStorage.getAll();
    expect(logs.length).toBe(5);
    expect(logs[0].id).toBe('5'); // First 5 removed
  });

  it('should clear all logs', () => {
    storage.add({
      id: '1',
      timestamp: Date.now(),
      level: LogLevel.INFO,
      tag: 'Test',
      message: 'Test',
      source: LogSource.CLI,
    });

    storage.clear();
    expect(storage.getAll().length).toBe(0);
  });

  it('should generate statistics', () => {
    storage.add({
      id: '1',
      timestamp: Date.now(),
      level: LogLevel.ERROR,
      tag: 'Test',
      message: 'Error',
      source: LogSource.BUILD,
    });

    storage.add({
      id: '2',
      timestamp: Date.now(),
      level: LogLevel.WARN,
      tag: 'Test',
      message: 'Warning',
      source: LogSource.CORE,
    });

    const stats = storage.getStats();
    expect(stats.totalLogs).toBe(2);
    expect(stats.errorCount).toBe(1);
    expect(stats.warningCount).toBe(1);
  });
});