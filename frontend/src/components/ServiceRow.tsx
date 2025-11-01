import { useState } from 'react';
import { Service, ServiceStatus } from '../types/service';
import { FluentIcons } from './FluentIcons';
import styles from './ServiceRow.module.css';

interface ServiceRowProps {
  service: Service;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onRestart: () => Promise<void>;
  onDisable?: () => Promise<void>;
  onEnable?: () => Promise<void>;
}

/**
 * ServiceRow Component
 *
 * Displays a single service with its status and control buttons.
 * Implements proper state management for enable/disable toggle functionality.
 *
 * Key Features:
 * - Toggle button that clearly shows current startup state (enabled/disabled)
 * - Button appearance updates based on service's StartupType
 * - Proper loading states during operations
 * - Accessibility-compliant with proper ARIA labels
 */
export function ServiceRow({ service, onStart, onStop, onRestart, onDisable, onEnable }: ServiceRowProps) {
  const [loading, setLoading] = useState(false);

  // Determine if service is in a transitioning state
  const isTransitioning =
    service.Status === 'starting' ||
    service.Status === 'stopping' ||
    service.Status === 'restarting';

  const isRunning = service.Status === 'running';
  const isStopped = service.Status === 'stopped';

  // Check if service is disabled based on StartupType
  const isDisabled = service.StartupType === 'disabled';

  // Start service handler
  const handleStart = async () => {
    setLoading(true);
    try {
      await onStart();
    } finally {
      setLoading(false);
    }
  };

  // Stop service handler
  const handleStop = async () => {
    setLoading(true);
    try {
      await onStop();
    } finally {
      setLoading(false);
    }
  };

  // Restart service handler
  const handleRestart = async () => {
    setLoading(true);
    try {
      await onRestart();
    } finally {
      setLoading(false);
    }
  };

  // Toggle handler - switches between enabled and disabled states
  const handleToggle = async () => {
    if (!onDisable || !onEnable) return;

    setLoading(true);
    try {
      if (isDisabled) {
        await onEnable();
      } else {
        await onDisable();
      }
    } finally {
      setLoading(false);
    }
  };

  // Get status badge class based on current status
  const getStatusClass = (status: ServiceStatus): string => {
    switch (status) {
      case 'running':
        return styles.statusRunning;
      case 'stopped':
        return styles.statusStopped;
      case 'starting':
      case 'stopping':
      case 'restarting':
        return styles.statusTransitioning;
      default:
        return '';
    }
  };

  // Get user-friendly status text
  const getStatusText = (status: ServiceStatus): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get startup type display text with color coding
  const getStartupTypeDisplay = () => {
    switch (service.StartupType) {
      case 'automatic':
        return { text: 'Auto', className: styles.startupAuto };
      case 'manual':
        return { text: 'Manual', className: styles.startupManual };
      case 'disabled':
        return { text: 'Disabled', className: styles.startupDisabled };
      default:
        return { text: 'Unknown', className: '' };
    }
  };

  const startupDisplay = getStartupTypeDisplay();
  const isButtonDisabled = loading || isTransitioning;

  return (
    <div className={`${styles.serviceRow} ${isDisabled ? styles.serviceRowDisabled : ''}`}>
      {/* Service Information */}
      <div className={styles.serviceInfo}>
        <div className={styles.serviceName}>{service.DisplayName}</div>
        <div className={styles.serviceSubtext}>
          {service.Name}
          <span className={styles.separator}>•</span>
          <span className={startupDisplay.className}>{startupDisplay.text}</span>
        </div>
      </div>

      {/* Status Badge */}
      <div className={styles.statusBadge}>
        <span className={`${styles.statusIndicator} ${getStatusClass(service.Status)}`}>
          {getStatusText(service.Status)}
        </span>
      </div>

      {/* Control Buttons */}
      <div className={styles.controls}>
        {/* Start/Stop/Restart Buttons */}
        <button
          type="button"
          className={styles.button}
          onClick={handleStart}
          disabled={isButtonDisabled || isRunning || isDisabled}
          title={isDisabled ? "Service is disabled" : "Start service"}
          aria-label={`Start ${service.DisplayName}`}
        >
          Start
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={handleStop}
          disabled={isButtonDisabled || isStopped}
          title="Stop service"
          aria-label={`Stop ${service.DisplayName}`}
        >
          Stop
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={handleRestart}
          disabled={isButtonDisabled || isDisabled}
          title={isDisabled ? "Service is disabled" : "Restart service"}
          aria-label={`Restart ${service.DisplayName}`}
        >
          Restart
        </button>

        {/* Toggle Enable/Disable Button */}
        {(onDisable && onEnable) && (
          <button
            type="button"
            className={`${styles.button} ${styles.toggleButton} ${
              isDisabled ? styles.enableButton : styles.disableButton
            }`}
            onClick={handleToggle}
            disabled={isButtonDisabled}
            title={isDisabled ? "Enable service startup" : "Disable service startup"}
            aria-label={`${isDisabled ? 'Enable' : 'Disable'} ${service.DisplayName}`}
            aria-pressed={!isDisabled}
          >
            <span className={styles.toggleIcon}>
              {isDisabled ? <FluentIcons.Flash /> : <FluentIcons.Stop />}
            </span>
            <span>{isDisabled ? 'Enable' : 'Disable'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
