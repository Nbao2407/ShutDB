import React, { useState, useRef, useEffect } from "react";
import { ServiceType } from "../types/service";
import { 
  groupServiceTypesByCategory,
  getServiceTypeInfo 
} from "../types/serviceTypeFilter";
import { FluentIcons } from "./FluentIcons";
import styles from "./HierarchicalServiceFilter.module.css";

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
  };
  
  const IconComponent = iconMap[iconName] || FluentIcons.Server;
  return <IconComponent />;
};

interface HierarchicalServiceFilterProps {
  selectedType: ServiceType | "all";
  onTypeChange: (type: ServiceType | "all") => void;
  typeCounts: Record<ServiceType | "all", number>;
  className?: string;
}

export const HierarchicalServiceFilter: React.FC<HierarchicalServiceFilterProps> = ({
  selectedType,
  onTypeChange,
  typeCounts,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryStates, setCategoryStates] = useState<Record<string, boolean>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (type: ServiceType | "all") => {
    onTypeChange(type);
    setIsOpen(false);
  };

  const toggleCategory = (category: string, event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation();
    setCategoryStates(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const getSelectedInfo = () => {
    if (selectedType === "all") {
      return {
        icon: "apps",
        name: "All Services",
        count: typeCounts.all || 0,
      };
    }
    const info = getServiceTypeInfo(selectedType);
    return {
      icon: info.icon,
      name: info.name,
      count: typeCounts[selectedType] || 0,
    };
  };

  const selectedInfo = getSelectedInfo();
  const groupedTypes = groupServiceTypesByCategory();

  // Get category count
  const getCategoryCount = (types: ServiceType[]) => {
    return types.reduce((sum, type) => sum + (typeCounts[type] || 0), 0);
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      "SQL Databases": "database",
      "NoSQL Databases": "documentStack", 
      "Cache & Memory": "flash",
      "Search & Analytics": "search",
      "Message Brokers": "chatBubblesQuestion",
    };
    return icons[category] || "server";
  };

  return (
    <div className={`${styles.hierarchicalFilter} ${className || ""}`} ref={dropdownRef}>
      <button
        className={`${styles.dropdownButton} ${isOpen ? styles.active : ""}`}
        onClick={handleToggle}
        aria-label="Filter by database service"
        aria-expanded={isOpen}
        type="button"
      >
        <span className={styles.serviceIcon}>
          <FluentIcon iconName={selectedInfo.icon} />
        </span>
        <span className={styles.dropdownText}>{selectedInfo.name}</span>
        <span className={styles.serviceCount}>({selectedInfo.count})</span>
        <svg
          className={`${styles.chevron} ${isOpen ? styles.open : ""}`}
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M2 4 L6 8 L10 4" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu}>
          {/* All Services */}
          <div
            className={`${styles.menuItem} ${styles.allServicesItem} ${
              selectedType === "all" ? styles.selected : ""
            }`}
            onClick={() => handleSelect("all")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleSelect("all");
              }
            }}
          >
            <span className={styles.itemIcon}>
              <FluentIcon iconName="apps" />
            </span>
            <div className={styles.itemContent}>
              <div className={styles.itemName}>All Services</div>
            </div>
            <span className={styles.itemCount}>{typeCounts.all || 0}</span>
          </div>

          <div className={styles.divider} />

          {/* Hierarchical Categories */}
          {Object.entries(groupedTypes).map(([category, types]) => {
            const isExpanded = categoryStates[category] ?? false;
            const categoryCount = getCategoryCount(types);
            const categoryIcon = getCategoryIcon(category);

            return (
              <div key={category} className={styles.categoryGroup}>
                {/* Category Header */}
                <div
                  className={`${styles.categoryHeader} ${isExpanded ? styles.expanded : ""}`}
                  onClick={(e) => toggleCategory(category, e)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      toggleCategory(category, e);
                    }
                  }}
                >
                  <svg
                    className={`${styles.categoryChevron} ${isExpanded ? styles.open : ""}`}
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 2 L8 6 L4 10" />
                  </svg>
                  <span className={styles.categoryIcon}>
                  <FluentIcon iconName={categoryIcon} />
                </span>
                  <span className={styles.categoryName}>{category}</span>
                  <span className={styles.categoryCount}>({categoryCount})</span>
                </div>

                {/* Sub-services (shown when expanded) */}
                {isExpanded && (
                  <div className={styles.subServices}>
                    {types.map((type) => {
                      const info = getServiceTypeInfo(type);
                      const count = typeCounts[type] || 0;

                      return (
                        <div
                          key={type}
                          className={`${styles.subServiceItem} ${
                            selectedType === type ? styles.selected : ""
                          }`}
                          onClick={() => handleSelect(type)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handleSelect(type);
                            }
                          }}
                        >
                          <span className={styles.subServiceIcon}>
                            <FluentIcon iconName={info.icon} />
                          </span>
                          <div className={styles.subServiceContent}>
                            <div className={styles.subServiceName}>{info.name}</div>
                          </div>
                          <span className={styles.subServiceCount}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};