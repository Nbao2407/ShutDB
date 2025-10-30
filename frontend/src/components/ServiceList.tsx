import { useState } from 'react';
import { Service } from '../types/service';
import { ServiceRow } from './ServiceRow';
import styles from './ServiceList.module.css';

interface ServiceListProps {
  services: Service[];
  onStart: (name: string) => Promise<void>;
  onStop: (name: string) => Promise<void>;
  onRestart: (name: string) => Promise<void>;
}

interface ServiceGroup {
  name: string;
  services: Service[];
}

// Helper function to group SQL Server services by instance
function groupSQLServerServices(services: Service[]): ServiceGroup[] {
  const groups = new Map<string, Service[]>();
  
  services.forEach(service => {
    if (service.Type === 'mssql') {
      // Extract instance name from service name
      const instanceMatch = service.Name.match(/\$([A-Z0-9_]+)/i);
      const instanceName = instanceMatch ? instanceMatch[1] : 'DEFAULT';
      
      if (!groups.has(instanceName)) {
        groups.set(instanceName, []);
      }
      groups.get(instanceName)!.push(service);
    }
  });
  
  return Array.from(groups.entries()).map(([name, services]) => ({
    name: name === 'DEFAULT' ? 'SQL Server (Default Instance)' : `SQL Server (${name})`,
    services
  }));
}

function ServiceGroupComponent({ group, onStart, onStop, onRestart }: { 
  group: ServiceGroup;
  onStart: (name: string) => Promise<void>;
  onStop: (name: string) => Promise<void>;
  onRestart: (name: string) => Promise<void>;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const runningCount = group.services.filter(s => s.Status === 'running').length;
  const stoppedCount = group.services.filter(s => s.Status === 'stopped').length;
  
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
          <span className={styles.groupTitle}>{group.name}</span>
          <span className={styles.serviceCount}>({group.services.length})</span>
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
          {group.services.map((service) => (
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

export function ServiceList({ services, onStart, onStop, onRestart }: ServiceListProps) {
  if (services.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No database services detected</p>
        <p className={styles.emptyStateSubtext}>
          Install PostgreSQL, MySQL, MongoDB, or SQL Server to manage services
        </p>
      </div>
    );
  }

  // Separate SQL Server services from others
  const sqlServerServices = services.filter(s => s.Type === 'mssql');
  const otherServices = services.filter(s => s.Type !== 'mssql');
  
  // Group SQL Server services by instance
  const sqlServerGroups = groupSQLServerServices(sqlServerServices);

  return (
    <div className={styles.serviceListContainer}>
      {/* SQL Server groups */}
      {sqlServerGroups.map((group) => (
        <ServiceGroupComponent
          key={group.name}
          group={group}
          onStart={onStart}
          onStop={onStop}
          onRestart={onRestart}
        />
      ))}

      {/* Other services (not grouped) */}
      {otherServices.map((service) => (
        <ServiceRow
          key={service.Name}
          service={service}
          onStart={() => onStart(service.Name)}
          onStop={() => onStop(service.Name)}
          onRestart={() => onRestart(service.Name)}
        />
      ))}
    </div>
  );
}
