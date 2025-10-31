import { ErrorState } from '../types/service';
import { getErrorGuidance } from '../utils/errorHandler';
import styles from './ErrorNotification.module.css';

interface ErrorNotificationProps {
  error: ErrorState;
  onDismiss: () => void;
}

function ErrorNotification({ error, onDismiss }: ErrorNotificationProps) {
  const guidance = getErrorGuidance(error);

  return (
    <div className={styles.errorContainer}>
      <div className={styles.errorHeader}>
        <span className={styles.errorIcon}>⚠️</span>
        <span className={styles.errorTitle}>Error</span>
        <button 
          type="button"
          className={styles.dismissButton}
          onClick={onDismiss}
          aria-label="Dismiss error"
        >
          ✕
        </button>
      </div>
      <div className={styles.errorMessage}>
        {error.message}
      </div>
      {guidance && (
        <div className={styles.errorGuidance}>
          💡 {guidance}
        </div>
      )}
    </div>
  );
}

export default ErrorNotification;
