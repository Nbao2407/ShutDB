import { useState, useMemo, useCallback } from 'react';

export interface VirtualScrollingOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number; // Number of items to render outside visible area
  threshold?: number; // Minimum number of items to enable virtual scrolling
}

export interface VirtualScrollingResult {
  virtualItems: Array<{
    index: number;
    start: number;
    end: number;
  }>;
  totalHeight: number;
  scrollElementProps: {
    style: React.CSSProperties;
    onScroll: (event: React.UIEvent<HTMLDivElement>) => void;
  };
  isVirtualized: boolean;
}

/**
 * Custom hook for virtual scrolling implementation
 * Only activates when item count exceeds threshold (default: 100)
 */
export function useVirtualScrolling(
  itemCount: number,
  options: VirtualScrollingOptions
): VirtualScrollingResult {
  const {
    itemHeight,
    containerHeight,
    overscan = 5,
    threshold = 100
  } = options;

  const [scrollTop, setScrollTop] = useState(0);

  // Only enable virtual scrolling if item count exceeds threshold
  const isVirtualized = itemCount > threshold;

  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    if (!isVirtualized) return;
    setScrollTop(event.currentTarget.scrollTop);
  }, [isVirtualized]);

  const virtualItems = useMemo(() => {
    if (!isVirtualized) {
      // Return all items if not virtualized
      return Array.from({ length: itemCount }, (_, index) => ({
        index,
        start: index * itemHeight,
        end: (index + 1) * itemHeight,
      }));
    }

    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      itemCount - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight)
    );

    const start = Math.max(0, visibleStart - overscan);
    const end = Math.min(itemCount - 1, visibleEnd + overscan);

    return Array.from({ length: end - start + 1 }, (_, i) => {
      const index = start + i;
      return {
        index,
        start: index * itemHeight,
        end: (index + 1) * itemHeight,
      };
    });
  }, [scrollTop, itemHeight, containerHeight, itemCount, overscan, isVirtualized]);

  const totalHeight = itemCount * itemHeight;

  const scrollElementProps = {
    style: {
      height: containerHeight,
      overflow: 'auto' as const,
    },
    onScroll: handleScroll,
  };

  return {
    virtualItems,
    totalHeight,
    scrollElementProps,
    isVirtualized,
  };
}