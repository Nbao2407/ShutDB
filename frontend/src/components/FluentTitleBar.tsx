import { FC } from 'react';
import styles from './FluentTitleBar.module.css';

interface FluentTitleBarProps {
  title?: string;
}

export const FluentTitleBar: FC<FluentTitleBarProps> = ({ title = 'Service Database Dashboard' }) => {
  return (
    <div className={styles.titlebar}>
      <div className={styles.titlebarLeft}>
        <div className={styles.appIcon}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="2" y="2" width="5" height="5" rx="1" fill="currentColor" opacity="0.8"/>
            <rect x="9" y="2" width="5" height="5" rx="1" fill="currentColor" opacity="0.6"/>
            <rect x="2" y="9" width="5" height="5" rx="1" fill="currentColor" opacity="0.6"/>
            <rect x="9" y="9" width="5" height="5" rx="1" fill="currentColor" opacity="0.9"/>
          </svg>
        </div>
        <span className={styles.title}>{title}</span>
      </div>
      <div className={styles.titlebarControls}>
        <button className={styles.controlButton} title="Minimize" aria-label="Minimize">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="0" y="5" width="12" height="2" fill="currentColor"/>
          </svg>
        </button>
        <button className={styles.controlButton} title="Maximize" aria-label="Maximize">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <rect x="0" y="0" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </button>
        <button className={`${styles.controlButton} ${styles.closeButton}`} title="Close" aria-label="Close">
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
};
