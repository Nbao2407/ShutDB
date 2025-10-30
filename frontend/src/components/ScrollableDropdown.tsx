import { FC, useState, useRef, useEffect } from 'react';
import styles from './ScrollableDropdown.module.css';

interface DropdownOption {
  value: string;
  label: string;
  icon?: string;
}

interface ScrollableDropdownProps {
  options: DropdownOption[];
  value?: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  maxHeight?: number;
}

export const ScrollableDropdown: FC<ScrollableDropdownProps> = ({
  options,
  value,
  placeholder = 'Select an option',
  onChange,
  maxHeight = 300
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0, width: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(opt => opt.value === selectedValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width
      });
    }
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    setSelectedValue(optionValue);
    onChange?.(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsOpen(!isOpen);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={styles.dropdown} ref={dropdownRef}>
      <button
        ref={triggerRef}
        className={`${styles.trigger} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        type="button"
      >
        <span className={styles.triggerContent}>
          {selectedOption?.icon && (
            <span className={styles.triggerIcon}>{selectedOption.icon}</span>
          )}
          <span className={styles.triggerText}>
            {selectedOption?.label || placeholder}
          </span>
        </span>
        <svg
          className={styles.chevron}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
        >
          <path
            d="M2 4L6 8L10 4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          className={styles.menu}
          style={{
            maxHeight: `${maxHeight}px`,
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            width: `${menuPosition.width}px`
          }}
          role="listbox"
        >
          <div className={styles.menuScroll}>
            {options.map((option) => (
              <button
                key={option.value}
                className={`${styles.option} ${
                  selectedValue === option.value ? styles.selected : ''
                }`}
                onClick={() => handleSelect(option.value)}
                role="option"
                aria-selected={selectedValue === option.value}
                type="button"
              >
                {option.icon && (
                  <span className={styles.optionIcon}>{option.icon}</span>
                )}
                <span className={styles.optionLabel}>{option.label}</span>
                {selectedValue === option.value && (
                  <svg
                    className={styles.checkIcon}
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M3 8L6.5 11.5L13 5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
