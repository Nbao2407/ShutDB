import React, { useState, useRef, useEffect } from "react";
import { ServiceCategory, CATEGORY_INFO, ALL_CATEGORIES, getCategoryInfo } from "../types/category";
import styles from "./CategoryFilter.module.css";

interface CategoryFilterProps {
  selectedCategory: ServiceCategory | "all";
  onCategoryChange: (category: ServiceCategory | "all") => void;
  categoryCounts: Record<ServiceCategory | "all", number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onCategoryChange,
  categoryCounts,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (category: ServiceCategory | "all") => {
    onCategoryChange(category);
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

  const getSelectedInfo = () => {
    if (selectedCategory === "all") {
      return {
        icon: "📊",
        name: "All Services",
        count: categoryCounts.all || 0,
      };
    }
    const info = getCategoryInfo(selectedCategory);
    return {
      icon: info.icon,
      name: info.name,
      count: categoryCounts[selectedCategory] || 0,
    };
  };

  const selectedInfo = getSelectedInfo();

  return (
    <div className={styles.categoryFilter} ref={dropdownRef}>
      <button
        className={`${styles.dropdownButton} ${isOpen ? styles.active : ""}`}
        onClick={handleToggle}
        aria-label="Filter by category"
        aria-expanded={isOpen}
        type="button"
      >
        <span className={styles.categoryIcon}>{selectedInfo.icon}</span>
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
              selectedCategory === "all" ? styles.selected : ""
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
            <span className={styles.itemIcon}>📊</span>
            <div className={styles.itemContent}>
              <div className={styles.itemName}>All Services</div>
            </div>
            <span className={styles.itemCount}>{categoryCounts.all || 0}</span>
          </div>

          <div className={styles.divider} />

          {/* Categories */}
          {ALL_CATEGORIES.map((categoryId) => {
            const info = CATEGORY_INFO[categoryId];
            const count = categoryCounts[categoryId] || 0;

            return (
              <div
                key={categoryId}
                className={`${styles.menuItem} ${
                  selectedCategory === categoryId ? styles.selected : ""
                }`}
                onClick={() => handleSelect(categoryId)}
                role="menuitem"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelect(categoryId);
                  }
                }}
              >
                <span className={styles.itemIcon}>{info.icon}</span>
                <div className={styles.itemContent}>
                  <div className={styles.itemName}>{info.name}</div>
                  <div className={styles.itemDescription}>{info.description}</div>
                </div>
                <span className={styles.itemCount}>{count}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
