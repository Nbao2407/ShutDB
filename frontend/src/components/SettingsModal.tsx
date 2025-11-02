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

const TABS = [
  {
    id: 'service' as const,
    label: 'Service',
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 6a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm2 0v8h10V6H5z"/>
        <path d="M7 8h6v2H7V8zm0 3h4v2H7v-2z"/>
      </svg>
    ),
  },
  {
    id: 'hotkey' as const,
    label: 'Hotkeys',
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
        <path d="M3 6a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V6zm2 0v8h10V6H5z"/>
        <circle cx="6.5" cy="8.5" r="0.5"/>
        <circle cx="8.5" cy="8.5" r="0.5"/>
        <circle cx="10.5" cy="8.5" r="0.5"/>
        <path d="M7 11h6v1H7v-1z"/>
      </svg>
    ),
  },
  {
    id: 'tray' as const,
    label: 'Tray',
    icon: (
      <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z"/>
        <path d="M8 8h4v4H8V8z"/>
      </svg>
    ),
  },
];

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
        {/* Compact Header */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>Settings</h2>
            <div className={styles.tabIndicator} />
          </div>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close settings"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M12.854 4.354a.5.5 0 0 0-.708-.708L8 7.793 3.854 3.646a.5.5 0 1 0-.708.708L7.293 8l-4.147 4.146a.5.5 0 0 0 .708.708L8 8.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 8l4.147-4.146z"/>
            </svg>
          </button>
        </div>
        
        {/* Compact Tab Navigation */}
        <div className={styles.tabNavigation}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
              aria-label={`${tab.label} settings`}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
              {activeTab === tab.id && <div className={styles.tabActiveIndicator} />}
            </button>
          ))}
        </div>
        
        {/* Content Area with Smooth Transitions */}
        <div className={styles.contentWrapper}>
          <div 
            className={styles.content}
            key={activeTab} // Force re-render for smooth transitions
          >
            {activeTab === 'service' && <ServiceControl />}
            {activeTab === 'hotkey' && <HotkeySettings />}
            {activeTab === 'tray' && <TraySettings />}
          </div>
        </div>
      </div>
    </div>
  );
};