import { FC, useState } from 'react';
import styles from './ServiceControlToggle.module.css';

interface ServiceControlToggleProps {
  onStopAll: () => Promise<void>;
  onStartAll: () => Promise<void>;
  isProcessing?: boolean;
}

export const ServiceControlToggle: FC<ServiceControlToggleProps> = ({
  onStopAll,
  onStartAll,
  isProcessing = false
}) => {
  const [loadingStart, setLoadingStart] = useState(false);
  const [loadingStop, setLoadingStop] = useState(false);

  const handleStartAll = async () => {
    if (loadingStart || loadingStop || isProcessing) return;

    setLoadingStart(true);
    try {
      await onStartAll();
    } catch (error) {
      console.error('Start all services error:', error);
    } finally {
      setLoadingStart(false);
    }
  };

  const handleStopAll = async () => {
    if (loadingStart || loadingStop || isProcessing) return;

    setLoadingStop(true);
    try {
      await onStopAll();
    } catch (error) {
      console.error('Stop all services error:', error);
    } finally {
      setLoadingStop(false);
    }
  };

  return (
    <div className={styles.controlButtons}>
      <button
        className={`${styles.button} ${styles.startButton} ${loadingStart ? styles.loading : ''}`}
        onClick={handleStartAll}
        disabled={loadingStart || loadingStop || isProcessing}
        title="Start All Services"
        aria-label="Start All Services"
        type="button"
      >
        {loadingStart ? (
          <div className={styles.spinner} />
        ) : (
          <>
            <svg className={styles.icon} width="14" height="14" viewBox="0 0 20 20" fill="none">
              <path
                d="M6 4L15 10L6 16V4Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            </svg>
            Start All
          </>
        )}
      </button>

      <button
        className={`${styles.button} ${styles.stopButton} ${loadingStop ? styles.loading : ''}`}
        onClick={handleStopAll}
        disabled={loadingStart || loadingStop || isProcessing}
        title="Stop All Services"
        aria-label="Stop All Services"
        type="button"
      >
        {loadingStop ? (
          <div className={styles.spinner} />
        ) : (
          <>
            <svg className={styles.icon} width="14" height="14" viewBox="0 0 20 20" fill="none">
              <rect x="4" y="4" width="4.5" height="12" rx="1" fill="currentColor" />
              <rect x="11.5" y="4" width="4.5" height="12" rx="1" fill="currentColor" />
            </svg>
            Stop All
          </>
        )}
      </button>
    </div>
  );
};
