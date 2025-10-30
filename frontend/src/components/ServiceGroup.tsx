import { useState } from 'react';
import { Service } from '../types/service';
import { ServiceRow } from './ServiceRow';
import styles from './ServiceGroup.module.css';

interface ServiceGroupProps {
  title: string;
  services: Service[];
  defaultExpanded?: boolean;
  onStart: (name: string) => Promise<void>;
  onStop: (name: string) => Promise<void>;
  onRestart: (name: string) => Promise<void>;
}

export function ServiceGroup({ 
  title, 
  services, 
  defaultExpanded = true,
  onStart, 
  onStop, 
  onRestart 
}: ServiceGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  if (services.length === 0) {
    return null;
  }

  const runningCount = services.filter(s => s.Status === 'running').length;
  const stoppedCount = services.filter(s => s.Status === 'stopped').length;

  return (
    <div className={styles.serviceGroup}>
      <div 
        className={styles.groupHeader}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={styles.groupHeaderLeft}>
          <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}>
            ▶
          </span>
          <span className={styles.groupTitle}>{title}</span>
          <span className={styles.serviceCount}>({services.length})</span>
        </div>
        <div className={styles.groupHeaderRight}>
          <span className={styles.statusBadge}>
            <span className={styles.runningBadge}>{runningCount} running</span>
            <span className={styles.stoppedBadge}>{stoppedCount} stopped</span>
          </span>
        </div>
      </div>
      
      {isExpanded && (
        <div className={styles.groupContent}>
          {services.map((service) => (
            <ServiceRow
              key={service.Name}
              service={service}
              onStart={() => onStart(service.Name)}
              onStop={() => onStop(service.Name)}
              onRestart={() => onRestart(service.Name)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
