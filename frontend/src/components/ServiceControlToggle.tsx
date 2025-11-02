import { FC, useState } from 'react';
import styles from './ServiceControlToggle.module.css';

interface ServiceControlToggleProps {
  onStopAll: () => Promise<void>;
  onStartAll: () => Promise<void>;
  isProcessing?: boolean;
  isTableDisabled?: boolean;
  onToggleTableState?: () => void;
}

export const ServiceControlToggle: FC<ServiceControlToggleProps> = ({
  onStopAll,
  onStartAll,
  isProcessing = false,
  isTableDisabled = false,
  onToggleTableState
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
      {onToggleTableState && (
        <button
          className={`${styles.button} ${styles.toggleButton} ${isTableDisabled ? styles.enableButton : styles.disableButton}`}
          onClick={onToggleTableState}
          disabled={loadingStart || loadingStop || isProcessing}
          title={isTableDisabled ? "Enable Table" : "Disable Table"}
          aria-label={isTableDisabled ? "Enable Table" : "Disable Table"}
          type="button"
        >
          {isTableDisabled ? (
            <>
              <svg className={styles.icon} width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 3C13.866 3 17 6.134 17 10s-3.134 7-7 7-7-3.134-7-7 3.134-7 7-7zm0 1.5c-3.038 0-5.5 2.462-5.5 5.5s2.462 5.5 5.5 5.5 5.5-2.462 5.5-5.5-2.462-5.5-5.5-5.5zM10 7l.09.008a.5.5 0 01.402.402L10.5 7.5v2h2l.09.008a.5.5 0 010 .984L12.5 10.5h-2v2l-.008.09a.5.5 0 01-.984 0L9.5 12.5v-2h-2l-.09-.008a.5.5 0 010-.984L7.5 9.5h2v-2l.008-.09A.5.5 0 0110 7z"
                  fill="currentColor"
                />
              </svg>
              Enable
            </>
          ) : (
            <>
              <svg className={styles.icon} width="14" height="14" viewBox="0 0 20 20" fill="none">
                <path
                  d="M10 2c4.418 0 8 3.582 8 8s-3.582 8-8 8-8-3.582-8-8 3.582-8 8-8zm0 1.5c-3.59 0-6.5 2.91-6.5 6.5s2.91 6.5 6.5 6.5 6.5-2.91 6.5-6.5-2.91-6.5-6.5-6.5zM7 9.5h6a.5.5 0 110 1H7a.5.5 0 110-1z"
                  fill="currentColor"
                />
              </svg>
              Disable
            </>
          )}
        </button>
      )}
      
      <button
        className={`${styles.button} ${styles.startButton} ${loadingStart ? styles.loading : ''}`}
        onClick={handleStartAll}
        disabled={loadingStart || loadingStop || isProcessing || isTableDisabled}
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
        disabled={loadingStart || loadingStop || isProcessing || isTableDisabled}
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
