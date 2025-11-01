import React, { useState, useRef, useEffect } from "react";
import { ServiceType } from "../types/service";
import {
  SERVICE_TYPE_INFO,
  groupServiceTypesByCategory,
  getServiceTypeInfo,
} from "../types/serviceTypeFilter";
import { FluentIcons } from "./FluentIcons";
import styles from "./ServiceTypeFilter.module.css";

interface ServiceTypeFilterProps {
  selectedType: ServiceType | "all";
  onTypeChange: (type: ServiceType | "all") => void;
  typeCounts: Record<ServiceType | "all", number>;
}

export const ServiceTypeFilter: React.FC<ServiceTypeFilterProps> = ({
  selectedType,
  onTypeChange,
  typeCounts,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (type: ServiceType | "all") => {
    onTypeChange(type);
    setIsOpen(false);
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

  // Helper component to render Fluent icons
  const FluentIcon: React.FC<{ name: string; className?: string }> = ({ name, className }) => {
    const IconComponent = (FluentIcons as any)[name];
    return IconComponent ? <IconComponent className={className} /> : <span>{name}</span>;
  };

  const getSelectedInfo = () => {
    if (selectedType === "all") {
      return {
        icon: "chartLine",
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

  return (
    <div className={styles.serviceTypeFilter} ref={dropdownRef}>
      <button
        className={`${styles.dropdownButton} ${isOpen ? styles.active : ""}`}
        onClick={handleToggle}
        aria-label="Filter by service type"
        aria-expanded={isOpen}
        type="button"
      >
        <FluentIcon name={selectedInfo.icon} className={styles.serviceIcon} />
        <span className={styles.dropdownText}>{selectedInfo.name}</span>
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
        <div className={styles.dropdownMenu} role="menu">
          {/* All Services */}
          <div
            className={`${styles.menuItem} ${styles.allServicesItem} ${
              selectedType === "all" ? styles.selected : ""
            }`}
            onClick={() => handleSelect("all")}
            role="menuitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                handleSelect("all");
              }
            }}
          >
            <FluentIcon name="chartLine" className={styles.itemIcon} />
            <div className={styles.itemContent}>
              <div className={styles.itemName}>All Services</div>
            </div>
            <span className={styles.itemCount}>{typeCounts.all || 0}</span>
          </div>

          <div className={styles.divider} />

          {/* Grouped Service Types */}
          {Object.entries(groupedTypes).map(([category, types]) => (
            <div key={category} className={styles.categoryGroup}>
              <div className={styles.categoryHeader}>{category}</div>
              {types.map((type) => {
                const info = SERVICE_TYPE_INFO[type];
                const count = typeCounts[type] || 0;

                // Only show if there are services of this type
                if (count === 0) return null;

                return (
                  <div
                    key={type}
                    className={`${styles.menuItem} ${
                      selectedType === type ? styles.selected : ""
                    }`}
                    onClick={() => handleSelect(type)}
                    role="menuitem"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        handleSelect(type);
                      }
                    }}
                  >
                    <FluentIcon name={info.icon} className={styles.itemIcon} />
                    <div className={styles.itemContent}>
                      <div className={styles.itemName}>{info.name}</div>
                      <div className={styles.itemCategory}>{info.category}</div>
                    </div>
                    <span className={styles.itemCount}>{count}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
