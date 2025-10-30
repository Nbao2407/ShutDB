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
  const [isStopped, setIsStopped] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    if (loading || isProcessing) return;

    setLoading(true);
    try {
      if (isStopped) {
        await onStartAll();
        setIsStopped(false);
      } else {
        await onStopAll();
        setIsStopped(true);
      }
    } catch (error) {
      console.error('Service control error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`${styles.toggle} ${isStopped ? styles.stopped : styles.running} ${
        loading ? styles.loading : ''
      }`}
      onClick={handleToggle}
      disabled={loading || isProcessing}
      title={isStopped ? 'Start All Services' : 'Stop All Services'}
      aria-label={isStopped ? 'Start All Services' : 'Stop All Services'}
      type="button"
    >
      {loading ? (
        <div className={styles.spinner} />
      ) : (
        <>
          <svg className={styles.icon} width="20" height="20" viewBox="0 0 20 20" fill="none">
            {isStopped ? (
              <path
                d="M6 4L15 10L6 16V4Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinejoin="round"
              />
            ) : (
              <>
                <rect x="4" y="4" width="4.5" height="12" rx="1" fill="currentColor" />
                <rect x="11.5" y="4" width="4.5" height="12" rx="1" fill="currentColor" />
              </>
            )}
          </svg>
          <span className={styles.label}>
            {isStopped ? 'Start All' : 'Stop All'}
          </span>
        </>
      )}
    </button>
  );
};
