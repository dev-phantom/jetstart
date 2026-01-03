import { useState, useCallback } from 'react';

export interface PerformanceMetrics {
  buildStartTime: number | null;
  buildEndTime: number | null;
  buildDuration: number | null;
  lastHotReloadTime: number | null;
  hotReloadDuration: number | null;
  totalHotReloads: number;
  fileChanges: number;
}

export function usePerformanceMetrics() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    buildStartTime: null,
    buildEndTime: null,
    buildDuration: null,
    lastHotReloadTime: null,
    hotReloadDuration: null,
    totalHotReloads: 0,
    fileChanges: 0,
  });

  const onBuildStart = useCallback(() => {
    const now = Date.now();
    setMetrics((prev) => ({
      ...prev,
      buildStartTime: now,
      buildEndTime: null,
      buildDuration: null,
    }));
  }, []);

  const onBuildComplete = useCallback(() => {
    const now = Date.now();
    setMetrics((prev) => {
      const duration = prev.buildStartTime ? now - prev.buildStartTime : null;
      return {
        ...prev,
        buildEndTime: now,
        buildDuration: duration,
      };
    });
  }, []);

  const onUIUpdate = useCallback(() => {
    const now = Date.now();
    setMetrics((prev) => {
      const hotReloadDuration = prev.lastHotReloadTime
        ? now - prev.lastHotReloadTime
        : null;
      return {
        ...prev,
        lastHotReloadTime: now,
        hotReloadDuration,
        totalHotReloads: prev.totalHotReloads + 1,
        fileChanges: prev.fileChanges + 1,
      };
    });
  }, []);

  const reset = useCallback(() => {
    setMetrics({
      buildStartTime: null,
      buildEndTime: null,
      buildDuration: null,
      lastHotReloadTime: null,
      hotReloadDuration: null,
      totalHotReloads: 0,
      fileChanges: 0,
    });
  }, []);

  return {
    metrics,
    onBuildStart,
    onBuildComplete,
    onUIUpdate,
    reset,
  };
}
