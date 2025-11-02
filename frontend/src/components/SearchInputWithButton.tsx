import React, { useState } from 'react';
import { FluentIcons } from './FluentIcons';
import styles from './SearchInputWithButton.module.css';

interface SearchInputWithButtonProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  onSearch?: (value: string) => void;
  placeholder?: string;
  icon?: 'search' | 'chevron' | 'none';
  disabled?: boolean;
}

/**
 * SearchInputWithButton Component
 * Combines TextInput with an action button on the right
 * Similar to Mantine's InputWithButton but using Fluent icons
 */
export const SearchInputWithButton: React.FC<SearchInputWithButtonProps> = ({
  onSearch,
  placeholder = 'Search...',
  icon = 'search',
  disabled = false,
  value,
  onChange,
  ...props
}) => {
  const [inputValue, setInputValue] = useState<string>(value as string || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(e);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(inputValue);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.inputWrapper}>
        {/* Left Icon */}
        <div className={styles.leftIcon}>
          {icon === 'search' && <FluentIcons.Search />}
          {icon === 'chevron' && <FluentIcons.ChevronRight />}
        </div>

        {/* Input */}
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          className={styles.input}
          {...props}
        />
      </div>
    </div>
  );
};

export default SearchInputWithButton;
