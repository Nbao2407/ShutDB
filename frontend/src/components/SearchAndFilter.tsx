import React, { useEffect, useState } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { SearchInputWithButton } from "./SearchInputWithButton";
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
  
  // Local state for the input value
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  
  // Debounce the local search term
  const debouncedSearchTerm = useDebounce(localSearchTerm, debounceDelay);

  // Update local state when external searchTerm prop changes
  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  // Call parent's onSearchChange when debounced value changes
  useEffect(() => {
    onSearchChange(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearchChange]);
  return (
    <div className={styles.searchAndFilter}>
      {/* Search Container */}
      <SearchInputWithButton
        placeholder="Search services..."
        icon="search"
        value={localSearchTerm}
        onChange={(e) => setLocalSearchTerm(e.target.value)}
        onSearch={(value) => onSearchChange(value)}
        aria-label="Search services"
        title="Search services"
      />
    </div>
  );
};

export default SearchAndFilter;
