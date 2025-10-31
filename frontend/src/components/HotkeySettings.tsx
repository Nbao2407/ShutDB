import { FC, useState, useEffect, useCallback } from 'react';
import { GetCurrentHotkey, SetHotkey, ValidateHotkey } from '../wailsjs/go/app/HotkeyManager';
import { Toast } from './Toast';
import styles from './HotkeySettings.module.css';

interface HotkeySettingsProps {
  className?: string;
}

interface ValidationState {
  isValid: boolean;
  message: string;
}

export const HotkeySettings: FC<HotkeySettingsProps> = ({ className }) => {
  const [currentHotkey, setCurrentHotkey] = useState<string>('');
  const [inputValue, setInputValue] = useState<string>('');
  const [validation, setValidation] = useState<ValidationState>({ isValid: true, message: '' });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info'; visible: boolean }>({
    message: '',
    type: 'info',
    visible: false,
  });

  // Load current hotkey on component mount
  useEffect(() => {
    const loadCurrentHotkey = async () => {
      setIsLoading(true);
      try {
        const hotkey = await GetCurrentHotkey();
        setCurrentHotkey(hotkey);
        setInputValue(hotkey);
        setError('');
      } catch (err) {
        console.error('Failed to load current hotkey:', err);
        setError('Failed to load current hotkey settings');
      } finally {
        setIsLoading(false);
      }
    };

    loadCurrentHotkey();
  }, []);

  // Validate hotkey combination in real-time
  const validateHotkeyCombo = useCallback(async (combination: string) => {
    if (!combination.trim()) {
      setValidation({ isValid: false, message: 'Hotkey combination cannot be empty' });
      return;
    }

    try {
      await ValidateHotkey(combination);
      setValidation({ isValid: true, message: 'Valid hotkey combination' });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid hotkey combination';
      setValidation({ isValid: false, message: errorMessage });
    }
  }, []);

  // Handle input change with real-time validation
  const handleInputChange = useCallback((value: string) => {
    setInputValue(value);
    setHasChanges(value !== currentHotkey);
    setError('');
    
    // Debounce validation to avoid excessive API calls
    const timeoutId = setTimeout(() => {
      validateHotkeyCombo(value);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [currentHotkey, validateHotkeyCombo]);

  // Handle save hotkey
  const handleSave = async () => {
    if (!validation.isValid || !hasChanges) {
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await SetHotkey(inputValue);
      setCurrentHotkey(inputValue);
      setHasChanges(false);
      setValidation({ isValid: true, message: 'Hotkey saved successfully' });
      
      // Show success toast
      setToast({
        message: `Hotkey updated to ${inputValue}`,
        type: 'success',
        visible: true,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save hotkey';
      setError(errorMessage);
      
      // Show error toast
      setToast({
        message: `Failed to save hotkey: ${errorMessage}`,
        type: 'error',
        visible: true,
      });
      
      console.error('Failed to save hotkey:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel changes
  const handleCancel = () => {
    setInputValue(currentHotkey);
    setHasChanges(false);
    setError('');
    setValidation({ isValid: true, message: '' });
  };

  // Handle key capture for easier hotkey input
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    
    const modifiers: string[] = [];
    let key = '';

    // Capture modifiers
    if (event.ctrlKey) modifiers.push('Ctrl');
    if (event.altKey) modifiers.push('Alt');
    if (event.shiftKey) modifiers.push('Shift');
    if (event.metaKey) modifiers.push('Win');

    // Capture the main key
    if (event.key.length === 1 && event.key.match(/[a-zA-Z0-9]/)) {
      key = event.key.toUpperCase();
    } else {
      // Handle special keys
      switch (event.key) {
        case ' ':
          key = 'Space';
          break;
        case 'Enter':
          key = 'Enter';
          break;
        case 'Tab':
          key = 'Tab';
          break;
        case 'Escape':
          key = 'Escape';
          break;
        case 'Home':
          key = 'Home';
          break;
        case 'End':
          key = 'End';
          break;
        case 'PageUp':
          key = 'PageUp';
          break;
        case 'PageDown':
          key = 'PageDown';
          break;
        case 'Insert':
          key = 'Insert';
          break;
        case 'Delete':
          key = 'Delete';
          break;
        case 'Backspace':
          key = 'Backspace';
          break;
        case 'ArrowUp':
          key = 'Up';
          break;
        case 'ArrowDown':
          key = 'Down';
          break;
        case 'ArrowLeft':
          key = 'Left';
          break;
        case 'ArrowRight':
          key = 'Right';
          break;
        default:
          // Handle function keys
          if (event.key.startsWith('F') && event.key.length <= 3) {
            const fNum = event.key.substring(1);
            if (/^\d{1,2}$/.test(fNum) && parseInt(fNum) >= 1 && parseInt(fNum) <= 12) {
              key = event.key;
            }
          }
          break;
      }
    }

    // Only create combination if we have modifiers and a key
    if (modifiers.length > 0 && key) {
      const combination = [...modifiers, key].join('+');
      handleInputChange(combination);
    }
  };

  if (isLoading) {
    return (
      <div className={`${styles.container} ${className || ''}`}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>Loading hotkey settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className || ''}`}>
      <div className={styles.header}>
        <h3 className={styles.title}>Global Hotkey Settings</h3>
        <p className={styles.description}>
          Configure a keyboard shortcut to restore the application window from the system tray.
        </p>
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="hotkey-input" className={styles.label}>
          Hotkey Combination
        </label>
        <div className={styles.inputWrapper}>
          <input
            id="hotkey-input"
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            className={`${styles.input} ${!validation.isValid ? styles.inputError : ''}`}
            placeholder="Press keys to capture combination (e.g., Ctrl+Alt+R)"
            disabled={isSaving}
          />
          <div className={styles.inputHint}>
            Press and hold modifier keys (Ctrl, Alt, Shift, Win) + a letter, number, or function key
          </div>
        </div>
      </div>

      {validation.message && (
        <div className={`${styles.validationMessage} ${validation.isValid ? styles.validationSuccess : styles.validationError}`}>
          <svg 
            className={styles.validationIcon} 
            width="16" 
            height="16" 
            viewBox="0 0 20 20" 
            fill="none"
          >
            {validation.isValid ? (
              <path
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                fill="currentColor"
              />
            ) : (
              <path
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                fill="currentColor"
              />
            )}
          </svg>
          {validation.message}
        </div>
      )}

      {error && (
        <div className={styles.errorMessage}>
          <svg className={styles.errorIcon} width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              fill="currentColor"
            />
          </svg>
          {error}
        </div>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          onClick={handleCancel}
          disabled={!hasChanges || isSaving}
          className={`${styles.button} ${styles.cancelButton}`}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!hasChanges || !validation.isValid || isSaving}
          className={`${styles.button} ${styles.saveButton}`}
        >
          {isSaving ? (
            <>
              <div className={styles.buttonSpinner} />
              Saving...
            </>
          ) : (
            'Save Hotkey'
          )}
        </button>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast(prev => ({ ...prev, visible: false }))}
        duration={3000}
      />
    </div>
  );
};