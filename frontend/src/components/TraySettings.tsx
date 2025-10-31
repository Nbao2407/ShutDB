import { FC, useState, useEffect, useCallback } from 'react';
import { 
  GetMinimizeToTray, 
  SetMinimizeToTray, 
  GetStartMinimized, 
  SetStartMinimized,
  GetTrayNotifications,
  SetTrayNotifications
} from '../wailsjs/go/app/ConfigManager';
import { Toast } from './Toast';
import styles from './TraySettings.module.css';

interface TraySettingsProps {
  className?: string;
}

interface TrayConfig {
  minimizeToTray: boolean;
  startMinimized: boolean;
  trayNotifications: boolean;
}

export const TraySettings: FC<TraySettingsProps> = ({ className }) => {
  const [config, setConfig] = useState<TrayConfig>({
    minimizeToTray: true,
    startMinimized: false,
    trayNotifications: true,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  });

  // Load current tray settings on component mount
  useEffect(() => {
    const loadTraySettings = async () => {
      setIsLoading(true);
      try {
        const [minimizeToTray, startMinimized, trayNotifications] = await Promise.all([
          GetMinimizeToTray(),
          GetStartMinimized(),
          GetTrayNotifications(),
        ]);

        setConfig({
          minimizeToTray,
          startMinimized,
          trayNotifications,
        });
        setError('');
      } catch (err) {
        console.error('Failed to load tray settings:', err);
        setError('Failed to load tray settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadTraySettings();
  }, []);

  // Handle setting toggle with immediate persistence
  const handleToggle = useCallback(async (setting: keyof TrayConfig, value: boolean) => {
    if (isSaving) return;

    setIsSaving(true);
    setError('');

    try {
      // Update backend immediately
      switch (setting) {
        case 'minimizeToTray':
          await SetMinimizeToTray(value);
          break;
        case 'startMinimized':
          await SetStartMinimized(value);
          break;
        case 'trayNotifications':
          await SetTrayNotifications(value);
          break;
      }

      // Update local state after successful backend update
      setConfig(prev => ({ ...prev, [setting]: value }));
      
      // Show success toast
      const settingNames = {
        minimizeToTray: 'Minimize to Tray',
        startMinimized: 'Start Minimized',
        trayNotifications: 'Tray Notifications',
      };
      
      setToast({
        message: `${settingNames[setting]} ${value ? 'enabled' : 'disabled'} successfully`,
        type: 'success',
        visible: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Failed to update ${setting}`;
      setError(errorMessage);
      
      // Show error toast
      setToast({
        message: `Failed to update setting: ${errorMessage}`,
        type: 'error',
        visible: true,
      });
      
      console.error(`Failed to update ${setting}:`, err);
    } finally {
      setIsSaving(false);
    }
  }, [isSaving]);

  if (isLoading) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Loading tray settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>System Tray Settings</h3>
        <p className={styles.description}>
          Configure how the application behaves with the system tray and window management.
        </p>
      </div>

      <div className={styles.settingsGroup}>
        {/* Minimize to Tray Setting */}
        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <label className={styles.settingLabel} htmlFor="minimize-to-tray">
              Minimize to System Tray
            </label>
            <p className={styles.settingDescription}>
              When enabled, minimizing the window will hide it to the system tray instead of the taskbar.
            </p>
          </div>
          <button
            id="minimize-to-tray"
            type="button"
            onClick={() => handleToggle('minimizeToTray', !config.minimizeToTray)}
            disabled={isSaving}
            className={`${styles.toggle} ${config.minimizeToTray ? styles.toggleEnabled : styles.toggleDisabled}`}
            aria-label={`${config.minimizeToTray ? 'Disable' : 'Enable'} minimize to tray`}
          >
            <div className={styles.toggleSlider}>
              <div className={styles.toggleThumb} />
            </div>
          </button>
        </div>

        {/* Start Minimized Setting */}
        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <label className={styles.settingLabel} htmlFor="start-minimized">
              Start Minimized
            </label>
            <p className={styles.settingDescription}>
              When enabled, the application will start minimized to the system tray.
            </p>
          </div>
          <button
            id="start-minimized"
            type="button"
            onClick={() => handleToggle('startMinimized', !config.startMinimized)}
            disabled={isSaving}
            className={`${styles.toggle} ${config.startMinimized ? styles.toggleEnabled : styles.toggleDisabled}`}
            aria-label={`${config.startMinimized ? 'Disable' : 'Enable'} start minimized`}
          >
            <div className={styles.toggleSlider}>
              <div className={styles.toggleThumb} />
            </div>
          </button>
        </div>

        {/* Tray Notifications Setting */}
        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <label className={styles.settingLabel} htmlFor="tray-notifications">
              Tray Notifications
            </label>
            <p className={styles.settingDescription}>
              Show notifications from the system tray icon for important events and status changes.
            </p>
          </div>
          <button
            id="tray-notifications"
            type="button"
            onClick={() => handleToggle('trayNotifications', !config.trayNotifications)}
            disabled={isSaving}
            className={`${styles.toggle} ${config.trayNotifications ? styles.toggleEnabled : styles.toggleDisabled}`}
            aria-label={`${config.trayNotifications ? 'Disable' : 'Enable'} tray notifications`}
          >
            <div className={styles.toggleSlider}>
              <div className={styles.toggleThumb} />
            </div>
          </button>
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
            <strong>Configuration Error:</strong> {error}
            <br />
            <small>Settings will be restored to their previous values.</small>
          </div>
        </div>
      )}

      {isSaving && (
        <div className={styles.savingIndicator}>
          <div className={styles.spinner} />
          <span>Saving settings...</span>
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