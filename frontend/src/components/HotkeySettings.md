# HotkeySettings Component

A React component for configuring global keyboard shortcuts to restore the application window from the system tray.

## Features

- **Real-time validation**: Validates hotkey combinations as you type
- **Key capture**: Click in the input field and press key combinations to automatically capture them
- **Save/Cancel functionality**: Save changes or revert to the previous hotkey
- **Error handling**: Displays user-friendly error messages for invalid combinations
- **Loading states**: Shows loading indicators during operations
- **Responsive design**: Works on desktop and mobile devices

## Usage

```tsx
import { HotkeySettings } from './components/HotkeySettings';

function SettingsPage() {
  return (
    <div>
      <HotkeySettings />
    </div>
  );
}
```

### With custom styling

```tsx
import { HotkeySettings } from './components/HotkeySettings';

function SettingsPage() {
  return (
    <div>
      <HotkeySettings className="my-custom-class" />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `undefined` | Optional CSS class name for custom styling |

## Backend Integration

The component integrates with the following backend methods:

- `GetCurrentHotkey()`: Retrieves the currently configured hotkey
- `SetHotkey(combination: string)`: Saves a new hotkey combination
- `ValidateHotkey(combination: string)`: Validates a hotkey combination

## Supported Key Combinations

### Modifiers
- `Ctrl` - Control key
- `Alt` - Alt key  
- `Shift` - Shift key
- `Win` - Windows key

### Keys
- **Letters**: A-Z
- **Numbers**: 0-9
- **Function Keys**: F1-F12
- **Special Keys**: Space, Enter, Tab, Escape, Home, End, PageUp, PageDown, Insert, Delete, Backspace
- **Arrow Keys**: Up, Down, Left, Right

### Examples
- `Ctrl+Alt+R` - Control + Alt + R
- `Ctrl+Shift+F1` - Control + Shift + F1
- `Win+Space` - Windows key + Space

## Key Capture

The component supports automatic key capture:

1. Click in the input field
2. Press and hold modifier keys (Ctrl, Alt, Shift, Win)
3. Press a letter, number, or function key
4. The combination will be automatically entered

## Validation

The component validates hotkey combinations in real-time:

- ✅ Valid combinations show a green checkmark
- ❌ Invalid combinations show a red X with error message
- ⚠️ Reserved system combinations are rejected (e.g., Ctrl+Alt+Delete)

## Error Handling

The component handles various error scenarios:

- **Network errors**: When backend calls fail
- **Validation errors**: When hotkey combinations are invalid
- **System conflicts**: When hotkeys conflict with system shortcuts
- **Loading errors**: When initial hotkey loading fails

## Styling

The component uses CSS modules for styling. Key classes:

- `.container` - Main container
- `.input` - Hotkey input field
- `.validationMessage` - Validation feedback
- `.actions` - Button container
- `.saveButton` - Save button
- `.cancelButton` - Cancel button

## Accessibility

The component follows accessibility best practices:

- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- High contrast support

## Requirements Fulfilled

This component fulfills the following requirements from the system tray integration spec:

- **Requirement 4.4**: Allows modification of the keyboard combination through settings UI
- **Requirement 4.5**: Validates that chosen combinations are not already in use by the system