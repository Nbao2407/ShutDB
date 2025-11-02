import React, { useState, useMemo } from "react";
import { Service, ServiceType } from "../types/service";
import { ServiceTableRow } from "./ServiceTableRow";
import { getServiceTypeInfo } from "../types/serviceTypeFilter";
import { FluentIcons } from "./FluentIcons";
import styles from "./HierarchicalServiceTable.module.css";

// Helper component to render Fluent icons
const FluentIcon: React.FC<{ iconName: string }> = ({ iconName }) => {
  // Map icon names to components
  const iconMap: Record<string, () => JSX.Element> = {
    database: FluentIcons.Database,
    document: FluentIcons.Document,
    documentStack: FluentIcons.DocumentStack,
    flash: FluentIcons.Flash,
    search: FluentIcons.Search,
    chartLine: FluentIcons.ChartLine,
    chatBubblesQuestion: FluentIcons.ChatBubblesQuestion,
    apps: FluentIcons.Apps,
    server: FluentIcons.Server,
    play: FluentIcons.Play,
    stop: FluentIcons.Stop,
    restart: FluentIcons.ArrowClockwise,
    error: FluentIcons.Error,
    settings: FluentIcons.Settings,
  };
  
  const IconComponent = iconMap[iconName] || FluentIcons.Server;
  return <IconComponent />;
};

export interface HierarchicalServiceTableProps {
  services: Service[];
  onStart: (serviceName: string) => Promise<void>;
  onStop: (serviceName: string) => Promise<void>;
  onRestart: (serviceName: string) => Promise<void>;
}

interface DatabaseGroup {
  type: ServiceType;
  name: string;
  icon: string;
  color: string;
  services: Service[];
  expanded: boolean;
}

export const HierarchicalServiceTable: React.FC<HierarchicalServiceTableProps> = ({
  services,
  onStart,
  onStop,
  onRestart,
}) => {
  const [expandedGroups, setExpandedGroups] = useState<Partial<Record<ServiceType, boolean>>>({});

  // Group services by their database type
  const databaseGroups = useMemo(() => {
    const groups: Partial<Record<ServiceType, DatabaseGroup>> = {};

    services.forEach((service) => {
      const type = service.Type;
      if (!groups[type]) {
        const typeInfo = getServiceTypeInfo(type);
        groups[type] = {
          type,
          name: typeInfo.name,
          icon: typeInfo.icon,
          color: typeInfo.color,
          services: [],
          expanded: expandedGroups[type] ?? true, // Default to expanded
        };
      }
      groups[type].services.push(service);
    });

    // Sort groups by name and sort services within each group
    return Object.values(groups)
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((group) => ({
        ...group,
        services: group.services.sort((a, b) => a.DisplayName.localeCompare(b.DisplayName)),
      }));
  }, [services, expandedGroups]);

  const toggleGroup = (type: ServiceType) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };



  if (services.length === 0) {
    return (
      <div className={styles.emptyState} role="status" aria-live="polite">
        <div className={styles.emptyIcon}>
          <FluentIcon iconName="apps" />
        </div>
        <h3>No database services found</h3>
        <p>No database services are currently detected on this system.</p>
      </div>
    );
  }

  return (
    <div className={styles.hierarchicalTable}>
      {/* Hierarchical Groups */}
      <div className={styles.serviceGroups}>
        {databaseGroups.map((group) => (
          <div key={group.type} className={styles.databaseGroup}>
            {/* Group Header */}
            <button
              className={`${styles.groupHeader} ${group.expanded ? styles.expanded : ""}`}
              onClick={() => toggleGroup(group.type)}
              type="button"
              aria-expanded={group.expanded}
              aria-controls={`group-${group.type}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleGroup(group.type);
                }
              }}
            >
              <div className={styles.groupHeaderContent}>
                <svg
                  className={`${styles.expandIcon} ${group.expanded ? styles.expanded : ""}`}
                  viewBox="0 0 12 12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 2 L8 6 L4 10" />
                </svg>
                <span className={styles.groupIcon}>
                  <FluentIcon iconName={group.icon} />
                </span>
                <div className={styles.groupInfo}>
                  <h3 className={styles.groupName}>{group.name}</h3>
                  <span className={styles.groupStats}>
                    {group.services.length} service{group.services.length !== 1 ? 's' : ''} • {' '}
                    <span className={styles.running}>
                      {group.services.filter(s => s.Status === "running").length} running
                    </span> • {' '}
                    <span className={styles.stopped}>
                      {group.services.filter(s => s.Status === "stopped").length} stopped
                    </span>
                  </span>
                </div>
              </div>
              <div className={styles.groupActions}>
                <button
                  className={styles.groupActionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Start all stopped services in this group
                    group.services
                      .filter(s => s.Status === "stopped")
                      .forEach(s => onStart(s.Name));
                  }}
                  title={`Start all ${group.name} services`}
                  disabled={group.services.every(s => s.Status === "running")}
                >
                  <FluentIcon iconName="play" />
                </button>
                <button
                  className={styles.groupActionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Stop all running services in this group
                    group.services
                      .filter(s => s.Status === "running")
                      .forEach(s => onStop(s.Name));
                  }}
                  title={`Stop all ${group.name} services`}
                  disabled={group.services.every(s => s.Status === "stopped")}
                >
                  <FluentIcon iconName="stop" />
                </button>
              </div>
            </button>

            {/* Group Services */}
            {group.expanded && (
              <div id={`group-${group.type}`} className={styles.groupServices}>
                <table className={styles.servicesTable} role="table">
                  <thead className={styles.tableHeader}>
                    <tr role="row">
                      <th className={styles.nameColumn} scope="col">Service Name</th>
                      <th className={styles.statusColumn} scope="col">Status</th>
                      <th className={styles.startupColumn} scope="col">Startup Type</th>
                      <th className={styles.actionsColumn} scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.services.map((service, index) => (
                      <ServiceTableRow
                        key={service.Name}
                        service={service}
                        rowIndex={index}
                        onStart={() => onStart(service.Name)}
                        onStop={() => onStop(service.Name)}
                        onRestart={() => onRestart(service.Name)}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};