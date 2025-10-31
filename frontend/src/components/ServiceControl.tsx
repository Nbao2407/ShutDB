import { FC, useState, useEffect, useCallback } from 'react';
import { GetServiceState, SetServiceState } from '../wailsjs/go/app/ConfigManager';
import { Toast } from './Toast';
import styles from './ServiceControl.module.css';

interface ServiceControlProps {
  className?: string;
}

export const ServiceControl: FC<ServiceControlProps> = ({ className }) => {
  const [serviceEnabled, setServiceEnabled] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isToggling, setIsToggling] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  });

  // Load current service state on component mount
  useEffect(() => {
    const loadServiceState = async () => {
      setIsLoading(true);
      try {
        const enabled = await GetServiceState();
        setServiceEnabled(enabled);
        setError('');
      } catch (err) {
        console.error('Failed to load service state:', err);
        setError('Failed to load service state');
      } finally {
        setIsLoading(false);
      }
    };

    loadServiceState();
  }, []);

  // Handle service toggle
  const handleToggle = useCallback(async () => {
    if (isToggling) return;

    setIsToggling(true);
    setError('');

    try {
      const newState = !serviceEnabled;
      await SetServiceState(newState);
      setServiceEnabled(newState);
      
      // Show success toast
      setToast({
        message: `Service ${newState ? 'enabled' : 'disabled'} successfully`,
        type: 'success',
        visible: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle service state';
      setError(errorMessage);
      
      // Show error toast
      setToast({
        message: `Failed to toggle service: ${errorMessage}`,
        type: 'error',
        visible: true,
      });
      
      console.error('Failed to toggle service state:', err);
    } finally {
      setIsToggling(false);
    }
  }, [serviceEnabled, isToggling]);

  if (isLoading) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Loading service settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Service Control</h3>
        <p className={styles.description}>
          Enable or disable the background service that manages database operations.
        </p>
      </div>

      <div className={styles.controlGroup}>
        <div className={styles.toggleWrapper}>
          <button
            type="button"
            onClick={handleToggle}
            disabled={isToggling}
            className={`${styles.toggleButton} ${serviceEnabled ? styles.toggleEnabled : styles.toggleDisabled}`}
            aria-label={`${serviceEnabled ? 'Disable' : 'Enable'} service`}
          >
            <div className={styles.toggleSlider}>
              <div className={styles.toggleThumb} />
            </div>
            <span className={styles.toggleLabel}>
              {isToggling ? 'Updating...' : serviceEnabled ? 'Service Enabled' : 'Service Disabled'}
            </span>
          </button>
        </div>

        <div className={styles.statusIndicator}>
          <div className={`${styles.statusDot} ${serviceEnabled ? styles.statusEnabled : styles.statusDisabled}`} />
          <span className={styles.statusText}>
            {serviceEnabled ? 'Background service is running' : 'Background service is stopped'}
          </span>
        </div>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          <svg className={styles.errorIcon} width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              fill="currentColor"
            />
          </svg>
          <div>
            <strong>Service Control Error:</strong> {error}
            <br />
            <small>Please try again or check your system permissions.</small>
          </div>
        </div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
        duration={3000}
      />
    </div>
  );
};