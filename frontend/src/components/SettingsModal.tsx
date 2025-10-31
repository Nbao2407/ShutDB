import { FC, useEffect, useState } from 'react';
import { HotkeySettings } from './HotkeySettings';
import { ServiceControl } from './ServiceControl';
import { TraySettings } from './TraySettings';
import styles from './SettingsModal.module.css';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'service' | 'hotkey' | 'tray';

export const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('service');
  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Settings</h2>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close settings"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M15 5L5 15M5 5l10 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        
        <div className={styles.tabs}>
          <button
            type="button"
            onClick={() => setActiveTab('service')}
            className={`${styles.tab} ${activeTab === 'service' ? styles.tabActive : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2L3 7v11a1 1 0 001 1h3v-8h6v8h3a1 1 0 001-1V7l-7-5z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Service Control
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('hotkey')}
            className={`${styles.tab} ${activeTab === 'hotkey' ? styles.tabActive : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <rect
                x="2"
                y="4"
                width="16"
                height="12"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M6 8h.01M10 8h.01M14 8h.01M8 12h4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
            Hotkey
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('tray')}
            className={`${styles.tab} ${activeTab === 'tray' ? styles.tabActive : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
              <rect
                x="3"
                y="3"
                width="14"
                height="14"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M9 9h2v2H9V9z"
                fill="currentColor"
              />
            </svg>
            System Tray
          </button>
        </div>
        
        <div className={styles.content}>
          {activeTab === 'service' && <ServiceControl />}
          {activeTab === 'hotkey' && <HotkeySettings />}
          {activeTab === 'tray' && <TraySettings />}
        </div>
      </div>
    </div>
  );
};