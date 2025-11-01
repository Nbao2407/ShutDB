import React, { useEffect } from "react";
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
  debounceDelay?: number; // Optional debounce delay configuration
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  onSearchChange,
  selectedCategory, // TODO: Implement category filtering
  onCategoryChange, // TODO: Implement category filtering
  categoryCounts, // TODO: Implement category filtering
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
          placeholder="Search services..."
          value={internalSearchTerm}
          onChange={(e) => setInternalSearchTerm(e.target.value)}
          aria-label="Search services"
          title="Search services"
        />
      </div>

    </div>
  );
};

export default SearchAndFilter;
