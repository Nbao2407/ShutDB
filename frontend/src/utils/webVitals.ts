/**
 * Web Vitals Monitoring and Reporting
 * Tracks Core Web Vitals (CWV): LCP, FID, CLS
 * Also tracks TTFB, FCP, INP
 */

export interface WebVital {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta?: number;
  timestamp: number;
  url?: string;
}

interface VitalsThresholds {
  good: number;
  needsImprovement: number;
}

// Web Vitals thresholds as per Google recommendations
const VITALS_THRESHOLDS: Record<string, VitalsThresholds> = {
  'CLS': { good: 0.1, needsImprovement: 0.25 },
  'FCP': { good: 1800, needsImprovement: 3000 },
  'LCP': { good: 2500, needsImprovement: 4000 },
  'FID': { good: 100, needsImprovement: 300 },
  'INP': { good: 200, needsImprovement: 500 },
  'TTFB': { good: 800, needsImprovement: 1800 },
};

const vitalsStorage: WebVital[] = [];
const MAX_VITALS = 50;

/**
 * Determine rating based on value and thresholds
 */
function getRating(
  value: number,
  thresholds: VitalsThresholds
): 'good' | 'needs-improvement' | 'poor' {
  if (value <= thresholds.good) return 'good';
  if (value <= thresholds.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Report a Web Vital metric
 */
export const reportWebVital = (
  name: string,
  value: number,
  delta?: number
): WebVital => {
  const thresholds = VITALS_THRESHOLDS[name] || { good: 0, needsImprovement: 0 };
  const rating = getRating(value, thresholds);

  const vital: WebVital = {
    name,
    value,
    rating,
    delta,
    timestamp: Date.now(),
    url: typeof window !== 'undefined' ? window.location.href : undefined,
  };

  vitalsStorage.push(vital);
  if (vitalsStorage.length > MAX_VITALS) {
    vitalsStorage.shift();
  }

  // Log to console with color coding
  const color = rating === 'good' ? '🟢' : rating === 'needs-improvement' ? '🟡' : '🔴';
  console.log(
    `${color} ${name}: ${value.toFixed(2)}${name === 'CLS' ? '' : 'ms'} (${rating})`
  );

  return vital;
};

/**
 * Send Web Vitals to analytics endpoint
 */
export const sendWebVitals = async (vital: WebVital, endpoint: string = '/api/vitals'): Promise<void> => {
  try {
    if (navigator.sendBeacon) {
      // Use sendBeacon for reliability (sends even if page is closing)
      navigator.sendBeacon(endpoint, JSON.stringify(vital));
    } else {
      // Fallback to fetch
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vital),
        keepalive: true,
      });
    }
  } catch (error) {
    console.error('Failed to send Web Vital:', error);
  }
};

/**
 * Initialize Web Vitals monitoring
 */
export const initWebVitals = (config?: { endpoint?: string; enabled?: boolean }): void => {
  if (import.meta.env.PROD && (config?.enabled ?? true)) {
    // Use PerformanceObserver if available
    if ('PerformanceObserver' in window) {
      try {
        // Monitor Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          const vital = reportWebVital('LCP', lastEntry.startTime);
          sendWebVitals(vital, config?.endpoint);
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

        // Monitor Cumulative Layout Shift (CLS)
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          const vital = reportWebVital('CLS', clsValue);
          sendWebVitals(vital, config?.endpoint);
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });

        // Monitor First Input Delay (FID) or Interaction to Next Paint (INP)
        if ('onactiveelementchange' in document) {
          const inpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            const duration = (lastEntry as any).processingDuration || (lastEntry as any).duration || 0;
            const vital = reportWebVital('INP', duration);
            sendWebVitals(vital, config?.endpoint);
          });
          inpObserver.observe({ entryTypes: ['first-input'] });
        }

        console.log('✅ Web Vitals monitoring initialized');
      } catch (error) {
        console.warn('Failed to initialize Web Vitals:', error);
      }
    }
  }
};

/**
 * Get all recorded vitals
 */
export const getWebVitals = (): WebVital[] => vitalsStorage;

/**
 * Get vitals by rating
 */
export const getVitalsByRating = (rating: 'good' | 'needs-improvement' | 'poor'): WebVital[] => {
  return vitalsStorage.filter((v) => v.rating === rating);
};

/**
 * Get average values for all vitals
 */
export const getVitalsAverage = (): Record<string, number> => {
  const averages: Record<string, number> = {};

  vitalsStorage.forEach((vital) => {
    if (!averages[vital.name]) {
      averages[vital.name] = 0;
    }
    averages[vital.name] += vital.value;
  });

  Object.keys(averages).forEach((key) => {
    averages[key] = averages[key] / vitalsStorage.length;
  });

  return averages;
};

/**
 * Clear all recorded vitals
 */
export const clearWebVitals = (): void => {
  vitalsStorage.length = 0;
};

export default {
  reportWebVital,
  sendWebVitals,
  initWebVitals,
  getWebVitals,
  getVitalsByRating,
  getVitalsAverage,
  clearWebVitals,
};
