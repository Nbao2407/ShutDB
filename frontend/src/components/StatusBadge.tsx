import React from "react";
import styles from "./StatusBadge.module.css";
import { ServiceStatus } from "../types/service";

// Extended service status to include disabled state for UI purposes
export type ExtendedServiceStatus = ServiceStatus | "disabled";

export interface StatusBadgeProps {
  status: ExtendedServiceStatus;
  isTransitioning?: boolean;
  className?: string;
  'aria-label'?: string;
}

/**
 * Status badge component following srcff reference patterns
 * 
 * ACCESSIBILITY FEATURES:
 * - Role="status" for screen reader announcements
 * - Custom aria-label support for detailed status descriptions
 * - Live regions for transitioning states
 * - High contrast mode support
 * - Reduced motion support for animations
 * - Focus indicators for keyboard navigation
 * 
 * PERFORMANCE:
 * - Memoized to prevent unnecessary re-renders when props haven't changed
 */
const StatusBadgeComponent: React.FC<StatusBadgeProps> = ({
  status,
  isTransitioning = false,
  className = "",
  'aria-label': ariaLabel,
}) => {
  // Determine if status is in a transitioning state
  const isInTransition =
    isTransitioning ||
    status === "starting" ||
    status === "stopping" ||
    status === "restarting";

  // Get status variant for styling
  const getStatusVariant = (status: ExtendedServiceStatus): string => {
    switch (status) {
      case "running":
        return "success";
      case "stopped":
        return "destructive";
      case "disabled":
        return "muted";
      case "starting":
      case "stopping":
      case "restarting":
        return "info";
      default:
        return "muted";
    }
  };

  const variant = getStatusVariant(status);

  // Combine CSS classes
  const badgeClasses = [
    styles.statusBadge,
    styles[variant],
    isInTransition ? styles.transitioning : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div 
      className={badgeClasses}
      role="status"
      aria-label={ariaLabel || `Status: ${status}${isInTransition ? ' (transitioning)' : ''}`}
      aria-live={isInTransition ? "polite" : undefined}
    >
      <span className={styles.statusText}>{status}</span>
    </div>
  );
};

// Memoized export prevents re-renders when props are identical
export const StatusBadge = React.memo(StatusBadgeComponent);

export default StatusBadge;
