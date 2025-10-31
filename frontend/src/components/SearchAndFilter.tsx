import React, { useEffect } from "react";
import { ServiceControlToggle } from "./ServiceControlToggle";
import { useDebouncedSearch } from "../hooks/useDebounce";
import styles from "./SearchAndFilter.module.css";

// Extended ServiceCategory type for filtering (includes "all")
export type ServiceCategory =
  | "all"
  | "database"
  | "web"
  | "cache"
  | "message"
  | "application"
  | "other";

export interface SearchAndFilterProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedCategory: ServiceCategory;
  onCategoryChange: (category: ServiceCategory) => void;
  categoryCounts: Record<ServiceCategory, number>;
  onStartAll: () => Promise<void>;
  onStopAll: () => Promise<void>;
  isProcessing?: boolean;
  debounceDelay?: number; // Optional debounce delay configuration
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory, // TODO: Implement category filtering
  onCategoryChange, // TODO: Implement category filtering
  categoryCounts, // TODO: Implement category filtering
  onStartAll,
  onStopAll,
  isProcessing = false,
  debounceDelay = 300,
}) => {
  // Suppress unused variable warnings for future implementation
  void selectedCategory;
  void onCategoryChange;
  void categoryCounts;
  // Use internal debounced search state
  const {
    searchTerm: internalSearchTerm,
    debouncedSearchTerm,
    setSearchTerm: setInternalSearchTerm,
  } = useDebouncedSearch(searchTerm, debounceDelay);

  // Sync external search term changes with internal state
  useEffect(() => {
    if (searchTerm !== internalSearchTerm) {
      setInternalSearchTerm(searchTerm);
    }
  }, [searchTerm, internalSearchTerm, setInternalSearchTerm]);

  // Call parent's onSearchChange when debounced value changes
  useEffect(() => {
    if (debouncedSearchTerm !== searchTerm) {
      onSearchChange(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, searchTerm, onSearchChange]);
  return (
    <div className={styles.searchAndFilter}>
      {/* Search Container */}
      <div className={styles.searchContainer}>
        <svg
          className={styles.searchIcon}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search server services..."
          value={internalSearchTerm}
          onChange={(e) => setInternalSearchTerm(e.target.value)}
          aria-label="Search server services"
          title="Search server services"
        />
      </div>

      {/* Filter Button */}
      <button
        className={styles.filterButton}
        title="Filter services by category"
        aria-label="Filter services by category"
        type="button"
      >
        <svg
          className={styles.filterIcon}
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
        </svg>
        Filter
      </button>

      {/* Service Control Toggle */}
      <ServiceControlToggle
        onStopAll={onStopAll}
        onStartAll={onStartAll}
        isProcessing={isProcessing}
      />
    </div>
  );
};

export default SearchAndFilter;
