/**
 * Performance Dashboard Utilities
 * Provides hooks and components for displaying performance metrics
 */

import { useState, useEffect } from 'react';
import { getPerformanceMetrics as getComponentMetrics } from '../hooks/usePerformance';
import { getWebVitals, getVitalsAverage } from './webVitals';

export interface PerformanceStats {
  componentMetrics: Record<string, number[]>;
  webVitals: Record<string, { average: number; rating: string }>;
  totalComponents: number;
  averageRenderTime: number;
}

interface PerformanceMetric {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

/**
 * Calculate performance statistics
 */
export const calculatePerformanceStats = (): PerformanceStats => {
  const metrics = getComponentMetrics();
  const vitals = getWebVitals();
  const vitalsAverage = getVitalsAverage();

  // Group metrics by component
  const componentMetrics: Record<string, number[]> = {};
  (metrics as PerformanceMetric[]).forEach((metric) => {
    if (!componentMetrics[metric.componentName]) {
      componentMetrics[metric.componentName] = [];
    }
    componentMetrics[metric.componentName].push(metric.renderTime);
  });

  // Calculate average render time across all components
  const allRenderTimes = Object.values(componentMetrics).flat();
  const averageRenderTime = allRenderTimes.length
    ? allRenderTimes.reduce((a, b) => a + b, 0) / allRenderTimes.length
    : 0;

  // Format vitals data
  const formattedVitals: Record<string, { average: number; rating: string }> = {};
  vitals.forEach((vital) => {
    if (!formattedVitals[vital.name]) {
      formattedVitals[vital.name] = { average: vitalsAverage[vital.name] || 0, rating: vital.rating };
    }
  });

  return {
    componentMetrics,
    webVitals: formattedVitals,
    totalComponents: Object.keys(componentMetrics).length,
    averageRenderTime,
  };
};

/**
 * Hook for performance dashboard data
 */
export const usePerformanceDashboard = () => {
  const [stats, setStats] = useState<PerformanceStats>(() => calculatePerformanceStats());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(calculatePerformanceStats());
    }, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return stats;
};

/**
 * Format bytes to readable size
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Format milliseconds to readable time
 */
export const formatTime = (ms: number): string => {
  if (ms < 1000) return `${ms.toFixed(0)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
};

/**
 * Get rating color
 */
export const getRatingColor = (rating: string): string => {
  switch (rating) {
    case 'good':
      return '#34d399'; // Green
    case 'needs-improvement':
      return '#fb923c'; // Orange
    case 'poor':
      return '#ef4444'; // Red
    default:
      return '#999';
  }
};

/**
 * Get performance health status
 */
export const getHealthStatus = (stats: PerformanceStats): 'excellent' | 'good' | 'fair' | 'poor' => {
  const slowComponents = Object.values(stats.componentMetrics).filter(
    (times) => times.some((time) => time > 16)
  ).length;

  const slowVitals = Object.values(stats.webVitals).filter(
    (vital) => vital.rating !== 'good'
  ).length;

  const slowComponentPercentage = (slowComponents / stats.totalComponents) * 100;

  if (slowComponentPercentage === 0 && slowVitals === 0) return 'excellent';
  if (slowComponentPercentage < 25 && slowVitals < 2) return 'good';
  if (slowComponentPercentage < 50 && slowVitals < 4) return 'fair';
  return 'poor';
};

/**
 * Export performance report as JSON
 */
export const exportPerformanceReport = (): string => {
  const stats = calculatePerformanceStats();
  return JSON.stringify(
    {
      timestamp: new Date().toISOString(),
      stats,
      health: getHealthStatus(stats),
    },
    null,
    2
  );
};

/**
 * Log performance summary to console
 */
export const logPerformanceSummary = (): void => {
  const stats = calculatePerformanceStats();
  const health = getHealthStatus(stats);

  console.group('📊 Performance Summary');
  console.log(`Health Status: ${health.toUpperCase()}`);
  console.log(`Total Components: ${stats.totalComponents}`);
  console.log(`Average Render Time: ${formatTime(stats.averageRenderTime)}`);
  console.table(stats.webVitals);
  console.groupEnd();
};

export default {
  calculatePerformanceStats,
  usePerformanceDashboard,
  formatBytes,
  formatTime,
  getRatingColor,
  getHealthStatus,
  exportPerformanceReport,
  logPerformanceSummary,
};
