/**
 * Performance monitoring and optimization hook
 * Provides utilities for tracking performance metrics and optimizing renders
 */

import { useEffect, useCallback, useRef } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

const performanceMetrics: PerformanceMetrics[] = [];
const MAX_METRICS = 100;

/**
 * Hook for monitoring component render performance
 * Use in development to identify performance bottlenecks
 */
export const usePerformanceMonitor = (componentName: string) => {
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    const renderTime = Date.now() - startTimeRef.current;
    
    const metric: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: Date.now(),
    };

    performanceMetrics.push(metric);
    if (performanceMetrics.length > MAX_METRICS) {
      performanceMetrics.shift();
    }

    // Log slow renders (> 16ms for 60fps)
    if (renderTime > 16 && import.meta.env.DEV) {
      console.warn(`⚠️ Slow render detected in ${componentName}: ${renderTime}ms`);
    }
  });

  return {
    getMetrics: () => performanceMetrics.filter(m => m.componentName === componentName),
  };
};

/**
 * Debounce hook for expensive operations
 */
export const useDebounceCallback = <T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 300
): T => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

  return useCallback(
    (...args: any[]) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;
};

/**
 * Throttle hook for event handlers
 */
export const useThrottleCallback = <T extends (...args: any[]) => void>(
  callback: T,
  limit: number = 300
): T => {
  const inThrottle = useRef(false);

  return useCallback(
    (...args: any[]) => {
      if (!inThrottle.current) {
        callback(...args);
        inThrottle.current = true;
        setTimeout(() => {
          inThrottle.current = false;
        }, limit);
      }
    },
    [callback, limit]
  ) as T;
};

/**
 * Report Web Vitals when available
 */
export const reportWebVitals = (metric: any) => {
  if (import.meta.env.DEV) {
    console.log('📊 Web Vital:', metric);
  }
};

export const getPerformanceMetrics = () => performanceMetrics;
export const clearPerformanceMetrics = () => {
  performanceMetrics.length = 0;
};
