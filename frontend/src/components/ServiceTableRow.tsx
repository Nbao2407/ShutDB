import React, { useState, useRef } from "react";
import { Service, ErrorState } from "../types/service";
import { StatusBadge } from "./StatusBadge";
import { parseServiceError } from "../utils/errorHandler";
import styles from "./ServiceTableRow.module.css";

interface ServiceTableRowProps {
  service: Service;
  rowIndex: number;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onRestart: () => Promise<void>;
  onToggleStartup?: () => Promise<void>;
  onError?: (error: ErrorState) => void;
}

/**
 * ServiceTableRow Component
 *
 * Table row component for displaying service information in a modern table layout.
 * Based on the srcff reference implementation with glass morphism effects and
 * hierarchical name display.
 *
 * Enhanced with loading states and error handling for robust service operations.
 *
 * ACCESSIBILITY FEATURES:
 * - Full ARIA support with proper roles, labels, and descriptions
 * - Keyboard navigation with arrow keys between action buttons
 * - Screen reader announcements for service operations and status changes
 * - Focus management with enhanced focus indicators
 * - Error handling with live regions for immediate feedback
 * - Semantic HTML structure with proper table roles
 * - Support for high contrast mode and reduced motion preferences
 */
const ServiceTableRowComponent = ({
  service,
  rowIndex,
  onStart,
  onStop,
  onRestart,
  onToggleStartup,
  onError,
}: ServiceTableRowProps) => {
  const [operationState, setOperationState] = useState<
    "idle" | "starting" | "stopping" | "restarting"
  >("idle");
  const [rowError, setRowError] = useState<string | null>(null);
  const [announceMessage, setAnnounceMessage] = useState<string>("");
  const actionButtonsRef = useRef<HTMLDivElement>(null);
  const lastFocusedButtonRef = useRef<HTMLButtonElement | null>(null);

  // Get service icon based on type
  const getServiceIcon = (type: string): string => {
    const iconMap: Record<string, string> = {
      // Database services
      postgresql: "📊",
      mysql: "📊",
      mariadb: "📊",
      mssql: "📊",
      mongodb: "📊",
      oracle: "📊",
      cassandra: "📊",
      elasticsearch: "📊",
      couchdb: "📊",
      influxdb: "📊",
      neo4j: "📊",
      sqlite: "📊",
      db2: "📊",
      firebird: "📊",
      // Cache services
      redis: "⚡",
      memcached: "⚡",
      // Message brokers
      rabbitmq: "📨",
      // Default
      default: "🔧",
    };

    return iconMap[type.toLowerCase()] || iconMap.default;
  };

  // Get startup type display text
  const getStartupTypeText = (startupType: string): string => {
    switch (startupType.toLowerCase()) {
      case "automatic":
        return "Automatic";
      case "manual":
        return "Manual";
      case "disabled":
        return "Disabled";
      default:
        return "Unknown";
    }
  };

  // Enhanced action handlers with error handling and loading states
  const handleStart = async () => {
    if (isStartDisabled || operationState !== "idle") return;

    // Store current focus for restoration
    lastFocusedButtonRef.current = document.activeElement as HTMLButtonElement;

    setOperationState("starting");
    setRowError(null);
    setAnnounceMessage(`Starting ${service.DisplayName}...`);

    try {
      await onStart();
      setAnnounceMessage(`${service.DisplayName} started successfully`);
    } catch (error) {
      const errorState = parseServiceError(error, service.Name);
      setRowError(errorState.message);
      setAnnounceMessage(
        `Failed to start ${service.DisplayName}: ${errorState.message}`
      );
      if (onError) {
        onError(errorState);
      }
    } finally {
      setOperationState("idle");
      // Restore focus after operation
      setTimeout(() => {
        if (
          lastFocusedButtonRef.current &&
          document.contains(lastFocusedButtonRef.current)
        ) {
          lastFocusedButtonRef.current.focus();
        }
        setAnnounceMessage("");
      }, 100);
    }
  };

  const handleStop = async () => {
    if (isStopDisabled || operationState !== "idle") return;

    // Store current focus for restoration
    lastFocusedButtonRef.current = document.activeElement as HTMLButtonElement;

    setOperationState("stopping");
    setRowError(null);
    setAnnounceMessage(`Stopping ${service.DisplayName}...`);

    try {
      await onStop();
      setAnnounceMessage(`${service.DisplayName} stopped successfully`);
    } catch (error) {
      const errorState = parseServiceError(error, service.Name);
      setRowError(errorState.message);
      setAnnounceMessage(
        `Failed to stop ${service.DisplayName}: ${errorState.message}`
      );
      if (onError) {
        onError(errorState);
      }
    } finally {
      setOperationState("idle");
      // Restore focus after operation
      setTimeout(() => {
        if (
          lastFocusedButtonRef.current &&
          document.contains(lastFocusedButtonRef.current)
        ) {
          lastFocusedButtonRef.current.focus();
        }
        setAnnounceMessage("");
      }, 100);
    }
  };

  const handleRestart = async () => {
    if (isRestartDisabled || operationState !== "idle") return;

    // Store current focus for restoration
    lastFocusedButtonRef.current = document.activeElement as HTMLButtonElement;

    setOperationState("restarting");
    setRowError(null);
    setAnnounceMessage(`Restarting ${service.DisplayName}...`);

    try {
      await onRestart();
      setAnnounceMessage(`${service.DisplayName} restarted successfully`);
    } catch (error) {
      const errorState = parseServiceError(error, service.Name);
      setRowError(errorState.message);
      setAnnounceMessage(
        `Failed to restart ${service.DisplayName}: ${errorState.message}`
      );
      if (onError) {
        onError(errorState);
      }
    } finally {
      setOperationState("idle");
      // Restore focus after operation
      setTimeout(() => {
        if (
          lastFocusedButtonRef.current &&
          document.contains(lastFocusedButtonRef.current)
        ) {
          lastFocusedButtonRef.current.focus();
        }
        setAnnounceMessage("");
      }, 100);
    }
  };

  const handleToggleStartup = async () => {
    if (!onToggleStartup || operationState !== "idle") return;

    setRowError(null);
    setAnnounceMessage(`Changing startup type for ${service.DisplayName}...`);

    try {
      await onToggleStartup();
      setAnnounceMessage(`Startup type changed for ${service.DisplayName}`);
    } catch (error) {
      const errorState = parseServiceError(error, service.Name);
      setRowError(errorState.message);
      setAnnounceMessage(
        `Failed to change startup type for ${service.DisplayName}: ${errorState.message}`
      );
      if (onError) {
        onError(errorState);
      }
    } finally {
      // Clear announcement after a delay
      setTimeout(() => setAnnounceMessage(""), 3000);
    }
  };

  // Check if actions should be disabled
  const isOperationInProgress = operationState !== "idle";
  const isStartDisabled =
    service.Status === "running" ||
    service.Status === "starting" ||
    service.StartupType === "disabled" ||
    isOperationInProgress;
  const isStopDisabled =
    service.Status === "stopped" ||
    service.Status === "stopping" ||
    service.StartupType === "disabled" ||
    isOperationInProgress;
  const isRestartDisabled =
    service.Status !== "running" ||
    service.StartupType === "disabled" ||
    isOperationInProgress;
  const isTransitioning =
    service.Status === "starting" ||
    service.Status === "stopping" ||
    service.Status === "restarting" ||
    isOperationInProgress;

  // Keyboard navigation handler for action buttons
  const handleKeyDown = (
    event: React.KeyboardEvent,
    action: () => void,
    disabled: boolean
  ) => {
    if (disabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      action();
    }
  };

  // Arrow key navigation within action buttons
  const handleActionGroupKeyDown = (event: React.KeyboardEvent) => {
    if (!actionButtonsRef.current) return;

    const buttons = Array.from(
      actionButtonsRef.current.querySelectorAll("button:not(:disabled)")
    ) as HTMLButtonElement[];

    const currentIndex = buttons.findIndex(
      (button) => button === document.activeElement
    );

    if (currentIndex === -1) return;

    let nextIndex = currentIndex;

    switch (event.key) {
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        nextIndex = currentIndex > 0 ? currentIndex - 1 : buttons.length - 1;
        break;
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        nextIndex = currentIndex < buttons.length - 1 ? currentIndex + 1 : 0;
        break;
      case "Home":
        event.preventDefault();
        nextIndex = 0;
        break;
      case "End":
        event.preventDefault();
        nextIndex = buttons.length - 1;
        break;
      default:
        return;
    }

    buttons[nextIndex]?.focus();
  };

  // Generate unique IDs for accessibility
  const serviceId = `service-${service.Name.replace(/[^a-zA-Z0-9]/g, "-")}`;
  const statusId = `${serviceId}-status`;
  const actionsId = `${serviceId}-actions`;

  return (
    <>
      {/* Screen reader announcements */}
      {announceMessage && (
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {announceMessage}
        </div>
      )}

      <tr
        className={`${styles.tableRow} ${rowError ? styles.errorRow : ""}`}
        role="row"
        aria-rowindex={rowIndex}
        aria-describedby={rowError ? `${serviceId}-error` : undefined}
      >
        {/* Name Column */}
        <td className={styles.nameCell} role="cell" aria-describedby={statusId}>
          <div className={styles.nameContainer}>
            <div className={styles.serviceIcon} aria-hidden="true">
              {getServiceIcon(service.Type)}
            </div>
            <div className={styles.nameContent}>
              <div className={styles.displayName} id={serviceId}>
                {service.DisplayName}
              </div>
              <div className={styles.serviceName} aria-label="Service name">
                {service.Name}
              </div>
            </div>
          </div>
        </td>

        {/* Status Column */}
        <td className={styles.statusCell} role="cell">
          <div id={statusId}>
            <StatusBadge
              status={service.Status}
              isTransitioning={isTransitioning}
              aria-label={`Service status: ${service.Status}${
                isTransitioning ? " (transitioning)" : ""
              }`}
            />
          </div>
        </td>

        {/* Startup Type Column */}
        <td className={styles.startupTypeCell} role="cell">
          <span
            className={styles.startupTypeText}
            aria-label={`Startup type: ${getStartupTypeText(
              service.StartupType
            )}`}
          >
            {getStartupTypeText(service.StartupType)}
          </span>
        </td>

        {/* Actions Column */}
        <td className={styles.actionsCell} role="cell">
          <div
            ref={actionButtonsRef}
            className={styles.actionButtons}
            id={actionsId}
            role="group"
            aria-label={`Actions for ${service.DisplayName}`}
            onKeyDown={handleActionGroupKeyDown}
          >
            {/* Start Button */}
            <button
              type="button"
              className={`${styles.actionButton} ${styles.startButton} ${
                operationState === "starting" ? styles.loading : ""
              }`}
              onClick={handleStart}
              onKeyDown={(e) => handleKeyDown(e, handleStart, isStartDisabled)}
              disabled={isStartDisabled}
              title={
                operationState === "starting" ? "Starting..." : "Start service"
              }
              aria-label={`Start ${service.DisplayName}${
                isStartDisabled ? " (disabled)" : ""
              }`}
              aria-describedby={serviceId}
              tabIndex={isStartDisabled ? -1 : 0}
            >
              {operationState === "starting" ? (
                <svg
                  className={`${styles.buttonIcon} ${styles.spinner}`}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="31.416"
                    strokeDashoffset="31.416"
                  >
                    <animate
                      attributeName="stroke-dasharray"
                      dur="2s"
                      values="0 31.416;15.708 15.708;0 31.416;0 31.416"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="stroke-dashoffset"
                      dur="2s"
                      values="0;-15.708;-31.416;-31.416"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
              ) : (
                <svg
                  className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>

            {/* Stop Button */}
            <button
              type="button"
              className={`${styles.actionButton} ${styles.stopButton} ${
                operationState === "stopping" ? styles.loading : ""
              }`}
              onClick={handleStop}
              onKeyDown={(e) => handleKeyDown(e, handleStop, isStopDisabled)}
              disabled={isStopDisabled}
              title={
                operationState === "stopping" ? "Stopping..." : "Stop service"
              }
              aria-label={`Stop ${service.DisplayName}${
                isStopDisabled ? " (disabled)" : ""
              }`}
              aria-describedby={serviceId}
              tabIndex={isStopDisabled ? -1 : 0}
            >
              {operationState === "stopping" ? (
                <svg
                  className={`${styles.buttonIcon} ${styles.spinner}`}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="31.416"
                    strokeDashoffset="31.416"
                  >
                    <animate
                      attributeName="stroke-dasharray"
                      dur="2s"
                      values="0 31.416;15.708 15.708;0 31.416;0 31.416"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="stroke-dashoffset"
                      dur="2s"
                      values="0;-15.708;-31.416;-31.416"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
              ) : (
                <svg
                  className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="6" y="6" width="12" height="12" />
                </svg>
              )}
            </button>

            {/* Restart Button */}
            <button
              type="button"
              className={`${styles.actionButton} ${styles.restartButton} ${
                operationState === "restarting" ? styles.loading : ""
              }`}
              onClick={handleRestart}
              onKeyDown={(e) =>
                handleKeyDown(e, handleRestart, isRestartDisabled)
              }
              disabled={isRestartDisabled}
              title={
                operationState === "restarting"
                  ? "Restarting..."
                  : "Restart service"
              }
              aria-label={`Restart ${service.DisplayName}${
                isRestartDisabled ? " (disabled)" : ""
              }`}
              aria-describedby={serviceId}
              tabIndex={isRestartDisabled ? -1 : 0}
            >
              {operationState === "restarting" ? (
                <svg
                  className={`${styles.buttonIcon} ${styles.spinner}`}
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="31.416"
                    strokeDashoffset="31.416"
                  >
                    <animate
                      attributeName="stroke-dasharray"
                      dur="2s"
                      values="0 31.416;15.708 15.708;0 31.416;0 31.416"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="stroke-dashoffset"
                      dur="2s"
                      values="0;-15.708;-31.416;-31.416"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
              ) : (
                <svg
                  className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              )}
            </button>

            {/* Toggle Startup Button (if provided) */}
            {onToggleStartup && (
              <button
                type="button"
                className={`${styles.actionButton} ${styles.toggleButton}`}
                onClick={handleToggleStartup}
                onKeyDown={(e) =>
                  handleKeyDown(e, handleToggleStartup, isTransitioning)
                }
                disabled={isTransitioning}
                title="Change startup type"
                aria-label={`Change startup type for ${service.DisplayName}${
                  isTransitioning ? " (disabled)" : ""
                }`}
                aria-describedby={serviceId}
                tabIndex={isTransitioning ? -1 : 0}
              >
                <svg
                  className={styles.buttonIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12l2 2 4-4" />
                </svg>
              </button>
            )}
          </div>
        </td>
      </tr>

      {/* Error Row */}
      {rowError && (
        <tr
          className={styles.errorRowContainer}
          role="row"
          aria-rowindex={rowIndex + 0.5}
        >
          <td colSpan={4} className={styles.errorCell} role="cell">
            <div
              className={styles.errorMessage}
              id={`${serviceId}-error`}
              role="alert"
              aria-live="assertive"
              aria-atomic="true"
            >
              <svg
                className={styles.errorIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span className={styles.errorText}>{rowError}</span>
              <button
                type="button"
                className={styles.errorDismiss}
                onClick={() => {
                  setRowError(null);
                  setAnnounceMessage("Error dismissed");
                  setTimeout(() => setAnnounceMessage(""), 1000);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setRowError(null);
                    setAnnounceMessage("Error dismissed");
                    setTimeout(() => setAnnounceMessage(""), 1000);
                  }
                }}
                title="Dismiss error"
                aria-label={`Dismiss error for ${service.DisplayName}`}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};

// Memoize the component for efficient re-renders
// Only re-render when service data, handlers, or rowIndex changes
export const ServiceTableRow = React.memo(
  ServiceTableRowComponent,
  (prevProps, nextProps) => {
    // Custom comparison function for better performance
    return (
      prevProps.service.Name === nextProps.service.Name &&
      prevProps.service.Status === nextProps.service.Status &&
      prevProps.service.DisplayName === nextProps.service.DisplayName &&
      prevProps.service.Type === nextProps.service.Type &&
      prevProps.service.StartupType === nextProps.service.StartupType &&
      prevProps.rowIndex === nextProps.rowIndex &&
      prevProps.onStart === nextProps.onStart &&
      prevProps.onStop === nextProps.onStop &&
      prevProps.onRestart === nextProps.onRestart &&
      prevProps.onToggleStartup === nextProps.onToggleStartup &&
      prevProps.onError === nextProps.onError
    );
  }
);

ServiceTableRow.displayName = "ServiceTableRow";

export default ServiceTableRow;
