import { useState } from 'react';
import { Service, ServiceStatus } from '../types/service';
import styles from './ServiceRow.module.css';

interface ServiceRowProps {
  service: Service;
  onStart: () => Promise<void>;
  onStop: () => Promise<void>;
  onRestart: () => Promise<void>;
}

export function ServiceRow({ service, onStart, onStop, onRestart }: ServiceRowProps) {
  const [loading, setLoading] = useState(false);

  const isTransitioning = 
    service.Status === 'starting' || 
    service.Status === 'stopping' || 
    service.Status === 'restarting';

  const isRunning = service.Status === 'running';
  const isStopped = service.Status === 'stopped';

  const handleStart = async () => {
    setLoading(true);
    try {
      await onStart();
    } finally {
      setLoading(false);
    }
  };

  const handleStop = async () => {
    setLoading(true);
    try {
      await onStop();
    } finally {
      setLoading(false);
    }
  };

  const handleRestart = async () => {
    setLoading(true);
    try {
      await onRestart();
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusText = (status: ServiceStatus): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const isButtonDisabled = loading || isTransitioning;

  return (
    <div className={styles.serviceRow}>
      <div className={styles.serviceInfo}>
        <div className={styles.serviceName}>{service.DisplayName}</div>
        <div className={styles.serviceSubtext}>{service.Name}</div>
      </div>
      
      <div className={styles.statusBadge}>
        <span className={`${styles.statusIndicator} ${getStatusClass(service.Status)}`}>
          {getStatusText(service.Status)}
        </span>
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          className={styles.button}
          onClick={handleStart}
          disabled={isButtonDisabled || isRunning}
          title="Start service"
        >
          Start
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={handleStop}
          disabled={isButtonDisabled || isStopped}
          title="Stop service"
        >
          Stop
        </button>
        <button
          type="button"
          className={styles.button}
          onClick={handleRestart}
          disabled={isButtonDisabled}
          title="Restart service"
        >
          Restart
        </button>
      </div>
    </div>
  );
}
