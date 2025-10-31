import React, { useRef, useEffect, useState } from "react";
import { Service, ErrorState } from "../types/service";
import { ServiceTableRow } from "./ServiceTableRow";
import { ErrorBoundary } from "./ErrorBoundary";
import { useVirtualScrolling } from "../hooks/useVirtualScrolling";
import styles from "./ServiceTable.module.css";




/**
 * ServiceTable Component Props
 * 
 * ACCESSIBILITY FEATURES:
 * - Semantic table structure with proper ARIA roles and labels
 * - Column headers with scope attributes for screen readers
 * - Row and column count information for assistive technology
 * - Live regions for dynamic content updates
 * - Error boundaries with accessible fallback content
 * - Empty state with proper status announcements
 */
export interface ServiceTableProps {
  services: Service[];
  onStart: (serviceName: string) => Promise<void>;
  onStop: (serviceName: string) => Promise<void>;
  onRestart: (serviceName: string) => Promise<void>;
  onToggleStartup?: (serviceName: string) => Promise<void>;
  onError?: (error: ErrorState) => void;
}

export const ServiceTable: React.FC<ServiceTableProps> = ({
  services,
  onStart,
  onStop,
  onRestart,
  onToggleStartup,
  onError,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(600); // Default height

  // Measure container height for virtual scrolling
  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const availableHeight = window.innerHeight - rect.top - 100; // Leave some margin
        setContainerHeight(Math.max(400, Math.min(800, availableHeight)));
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  // Virtual scrolling configuration
  const ROW_HEIGHT = 60; // Approximate height of each table row
  const virtualScrolling = useVirtualScrolling(services.length, {
    itemHeight: ROW_HEIGHT,
    containerHeight: containerHeight - 60, // Account for header height
    overscan: 5,
    threshold: 100, // Enable virtual scrolling for 100+ items
  });

  // Create memoized handlers for individual services to prevent unnecessary re-renders
  const createServiceHandlers = React.useCallback((service: Service) => ({
    onStart: () => onStart(service.Name),
    onStop: () => onStop(service.Name),
    onRestart: () => onRestart(service.Name),
    onToggleStartup: onToggleStartup ? () => onToggleStartup(service.Name) : undefined,
  }), [onStart, onStop, onRestart, onToggleStartup]);

  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('ServiceTable error:', error, errorInfo);
        if (onError) {
          onError({
            message: `Table rendering error: ${error.message}`,
            serviceName: undefined,
          });
        }
      }}
    >
      <div 
        ref={containerRef}
        className={`${styles.tableContainer} glass-panel`} 
        role="region" 
        aria-label="Database services table"
      >
        {virtualScrolling.isVirtualized ? (
          // Virtual scrolling implementation for large lists
          <div className={styles.virtualScrollContainer}>
            <table 
              className={styles.serviceTable}
              role="table"
              aria-label="Database services"
              aria-rowcount={services.length + 1}
              aria-colcount={4}
            >
              <thead role="rowgroup" className={styles.stickyHeader}>
                <tr className={styles.headerRow} role="row">
                  <th 
                    className={styles.nameHeader}
                    role="columnheader"
                    aria-sort="none"
                    scope="col"
                    id="name-header"
                  >
                    Name
                  </th>
                  <th 
                    className={styles.statusHeader}
                    role="columnheader"
                    aria-sort="none"
                    scope="col"
                    id="status-header"
                  >
                    Status
                  </th>
                  <th 
                    className={styles.startupHeader}
                    role="columnheader"
                    aria-sort="none"
                    scope="col"
                    id="startup-header"
                  >
                    Startup Type
                  </th>
                  <th 
                    className={styles.actionsHeader}
                    role="columnheader"
                    scope="col"
                    id="actions-header"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
            </table>
            
            <div 
              className={styles.virtualScrollViewport}
              {...virtualScrolling.scrollElementProps}
            >
              <div 
                className={styles.virtualScrollContent}
                style={{ height: virtualScrolling.totalHeight }}
              >
                <table className={styles.serviceTable}>
                  <tbody role="rowgroup">
                    {virtualScrolling.virtualItems.map((virtualItem) => {
                      const service = services[virtualItem.index];
                      if (!service) return null;
                      
                      return (
                        <ErrorBoundary
                          key={service.Name}
                          onError={(error, errorInfo) => {
                            console.error(`ServiceTableRow error for ${service.Name}:`, error, errorInfo);
                            if (onError) {
                              onError({
                                message: `Row rendering error for ${service.DisplayName}: ${error.message}`,
                                serviceName: service.Name,
                              });
                            }
                          }}
                          fallback={
                            <tr 
                              className={styles.errorRow} 
                              role="row" 
                              aria-rowindex={virtualItem.index + 2}
                              style={{
                                position: 'absolute',
                                top: virtualItem.start,
                                height: ROW_HEIGHT,
                                width: '100%',
                                display: 'table',
                                tableLayout: 'fixed',
                              }}
                            >
                              <td colSpan={4} className={styles.errorCell} role="cell">
                                <div className={styles.errorMessage} role="alert" aria-live="polite">
                                  <span>Error loading service: {service.DisplayName}</span>
                                </div>
                              </td>
                            </tr>
                          }
                        >
                          <div
                            className={styles.virtualRow}
                            style={{
                              position: 'absolute',
                              top: virtualItem.start,
                              height: ROW_HEIGHT,
                              width: '100%',
                            }}
                          >
                            <ServiceTableRow
                              service={service}
                              rowIndex={virtualItem.index + 2}
                              {...createServiceHandlers(service)}
                              onError={onError}
                            />
                          </div>
                        </ErrorBoundary>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          // Standard table implementation for smaller lists
          <table 
            className={styles.serviceTable}
            role="table"
            aria-label="Database services"
            aria-rowcount={services.length + 1}
            aria-colcount={4}
          >
            <thead role="rowgroup">
              <tr className={styles.headerRow} role="row">
                <th 
                  className={styles.nameHeader}
                  role="columnheader"
                  aria-sort="none"
                  scope="col"
                  id="name-header"
                >
                  Name
                </th>
                <th 
                  className={styles.statusHeader}
                  role="columnheader"
                  aria-sort="none"
                  scope="col"
                  id="status-header"
                >
                  Status
                </th>
                <th 
                  className={styles.startupHeader}
                  role="columnheader"
                  aria-sort="none"
                  scope="col"
                  id="startup-header"
                >
                  Startup Type
                </th>
                <th 
                  className={styles.actionsHeader}
                  role="columnheader"
                  scope="col"
                  id="actions-header"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody role="rowgroup">
              {services.map((service, index) => (
                <ErrorBoundary
                  key={service.Name}
                  onError={(error, errorInfo) => {
                    console.error(`ServiceTableRow error for ${service.Name}:`, error, errorInfo);
                    if (onError) {
                      onError({
                        message: `Row rendering error for ${service.DisplayName}: ${error.message}`,
                        serviceName: service.Name,
                      });
                    }
                  }}
                  fallback={
                    <tr className={styles.errorRow} role="row" aria-rowindex={index + 2}>
                      <td colSpan={4} className={styles.errorCell} role="cell">
                        <div className={styles.errorMessage} role="alert" aria-live="polite">
                          <span>Error loading service: {service.DisplayName}</span>
                        </div>
                      </td>
                    </tr>
                  }
                >
                  <ServiceTableRow
                    service={service}
                    rowIndex={index + 2}
                    {...createServiceHandlers(service)}
                    onError={onError}
                  />
                </ErrorBoundary>
              ))}
            </tbody>
          </table>
        )}

        {/* Empty State */}
        {services.length === 0 && (
          <div className={styles.emptyState} role="status" aria-live="polite">
            <div className={styles.emptyIcon} aria-hidden="true">🔍</div>
            <p className={styles.emptyTitle}>No services found</p>
            <p className={styles.emptySubtext}>
              No database services are currently detected or match your search criteria
            </p>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default ServiceTable;