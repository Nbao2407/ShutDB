import { FC, useState } from 'react';
import styles from './FluentTabBar.module.css';

interface Tab {
  id: string;
  title: string;
  icon?: string;
}

interface FluentTabBarProps {
  tabs?: Tab[];
  activeTabId?: string;
  onTabChange?: (tabId: string) => void;
  onTabClose?: (tabId: string) => void;
  onNewTab?: () => void;
}

export const FluentTabBar: FC<FluentTabBarProps> = ({
  tabs = [{ id: 'default', title: 'Services', icon: '📊' }],
  activeTabId,
  onTabChange,
  onTabClose,
  onNewTab
}) => {
  const [activeTab, setActiveTab] = useState(activeTabId || tabs[0]?.id);

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange?.(tabId);
  };

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    onTabClose?.(tabId);
  };

  return (
    <div className={styles.tabbar}>
      <div className={styles.tabs}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.active : ''} fluent-reveal`}
            onClick={() => handleTabClick(tab.id)}
            role="tab"
            aria-selected={activeTab === tab.id}
            tabIndex={0}
          >
            {tab.icon && <span className={styles.tabIcon}>{tab.icon}</span>}
            <span className={styles.tabTitle}>{tab.title}</span>
            {tabs.length > 1 && (
              <button
                className={styles.tabClose}
                onClick={(e) => handleTabClose(e, tab.id)}
                aria-label={`Close ${tab.title}`}
                title="Close"
              >
                <svg width="10" height="10" viewBox="0 0 10 10">
                  <path
                    d="M1 1L9 9M9 1L1 9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </div>
        ))}
      </div>
      <button
        className={styles.newTabButton}
        onClick={onNewTab}
        title="New tab"
        aria-label="New tab"
      >
        <svg width="12" height="12" viewBox="0 0 12 12">
          <path
            d="M6 1V11M1 6H11"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
};
