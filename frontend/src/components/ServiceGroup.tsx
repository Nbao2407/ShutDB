import { useState } from 'react';
import { Service } from '../types/service';
import { ServiceTableRow } from './ServiceTableRow';
import styles from './ServiceGroup.module.css';

export type ServiceCategory = 'database' | 'web' | 'cache' | 'message' | 'application' | 'other';

interface ServiceGroupProps {
  title: string;
  category: ServiceCategory;
  services: Service[];
  defaultExpanded?: boolean;
  onStart: (name: string) => Promise<void>;
  onStop: (name: string) => Promise<void>;
  onRestart: (name: string) => Promise<void>;
}



// Category icon mapping
const getCategoryIcon = (category: ServiceCategory): string => {
  const iconMap: Record<ServiceCategory, string> = {
    database: 'database',
    web: 'apps',
    cache: 'flash',
    message: 'chatBubblesQuestion',
    application: 'settings',
    other: 'settings'
  };
  return iconMap[category];
};

// Utility function to categorize services - exported for use in other components
export const categorizeService = (serviceType: string): ServiceCategory => {
  const type = serviceType.toLowerCase();
  
  const dbTypes = ['postgresql', 'mysql', 'mariadb', 'mssql', 'mongodb', 'oracle', 'cassandra', 'elasticsearch', 'couchdb', 'influxdb', 'neo4j', 'sqlite', 'db2', 'firebird'];
  const cacheTypes = ['redis', 'memcached'];
  const messageTypes = ['rabbitmq'];
  
  if (cacheTypes.includes(type)) return 'cache';
  if (messageTypes.includes(type)) return 'message';
  if (dbTypes.includes(type)) return 'database';
  return 'other';
};

export function ServiceGroup({ 
  title, 
  category,
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
  const categoryIcon = getCategoryIcon(category);

  return (
    <>
      {/* Group Header Row */}
      <tr className={styles.groupHeaderRow}>
        <td colSpan={5} className={styles.groupHeaderCell}>
          <button
            type="button"
            className={styles.groupHeader}
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title} group`}
          >
            <div className={styles.groupHeaderLeft}>
              <span className={`${styles.expandIcon} ${isExpanded ? styles.expanded : ''}`}>
                {isExpanded ? '▼' : '▶'}
              </span>
              <span className={styles.categoryIcon}>{categoryIcon}</span>
              <div className={styles.groupTitleContainer}>
                <span className={styles.groupTitle}>{title}</span>
                <span className={styles.serviceCount}>
                  {services.length} service{services.length !== 1 ? 's' : ''} • 
                  <span className={styles.runningText}> {runningCount} running</span> • 
                  <span className={styles.stoppedText}> {stoppedCount} stopped</span>
                </span>
              </div>
            </div>
          </button>
        </td>
      </tr>
      
      {/* Service Rows */}
      {isExpanded && services.map((service, index) => (
        <ServiceTableRow
          key={service.Name}
          service={service}
          rowIndex={index + 2} // Add required rowIndex prop
          onStart={() => onStart(service.Name)}
          onStop={() => onStop(service.Name)}
          onRestart={() => onRestart(service.Name)}
        />
      ))}
    </>
  );
}
