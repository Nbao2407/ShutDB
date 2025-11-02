/**
 * Lazy-loaded component wrapper with Suspense fallback
 * Reduces initial bundle by code-splitting heavy components
 */

import React, { Suspense, lazy, ComponentType } from 'react';
import styles from './lazyLoad.module.css';

interface LazyComponentProps {
  [key: string]: any;
}

interface LazyLoadConfig {
  fallback?: React.ReactNode;
  timeout?: number;
}

/**
 * Lazy load a component with custom fallback UI
 * Usage: const LazyModal = createLazyComponent(() => import('./MyModal'), { fallback: <LoadingSpinner /> })
 */
export const createLazyComponent = <P extends LazyComponentProps = LazyComponentProps>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  config: LazyLoadConfig = {}
) => {
  const LazyComponent = lazy(importFn);

  return (props: P) => (
    <Suspense fallback={config.fallback || <LazyLoadingFallback />}>
      <LazyComponent {...(props as any)} />
    </Suspense>
  );
};

/**
 * Default loading fallback component
 */
const LazyLoadingFallback: React.FC = () => (
  <div className={styles.lazyLoadingContainer}>
    <span className={styles.lazyLoadingText}>⏳ Loading...</span>
  </div>
);

/**
 * Pre-load a component for faster display
 * Useful for modals that user might open
 */
export const preloadComponent = (
  importFn: () => Promise<{ default: ComponentType }>
) => {
  importFn().catch((err) => {
    console.warn('Failed to preload component:', err);
  });
};

export default createLazyComponent;
