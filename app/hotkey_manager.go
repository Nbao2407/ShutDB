package app

import (
	"context"
	"fmt"
	"strconv"
	"strings"
	"sync"
	"syscall"
	"time"
	"unsafe"
)

// Windows API constants for hotkey registration
const (
	WM_HOTKEY = 0x0312

	// Modifier key constants
	MOD_ALT     = 0x0001
	MOD_CONTROL = 0x0002
	MOD_SHIFT   = 0x0004
	MOD_WIN     = 0x0008

	// Virtual key codes for common keys
	VK_A      = 0x41
	VK_Z      = 0x5A
	VK_0      = 0x30
	VK_9      = 0x39
	VK_F1     = 0x70
	VK_F12    = 0x7B
	VK_SPACE  = 0x20
	VK_RETURN = 0x0D
	VK_TAB    = 0x09
	VK_ESCAPE = 0x1B
	VK_HOME   = 0x24
	VK_END    = 0x23
	VK_PRIOR  = 0x21 // Page Up
	VK_NEXT   = 0x22 // Page Down
	VK_INSERT = 0x2D
	VK_DELETE = 0x2E
	VK_BACK   = 0x08 // Backspace
	VK_UP     = 0x26
	VK_DOWN   = 0x28
	VK_LEFT   = 0x25
	VK_RIGHT  = 0x27
)

// Windows API function declarations
var (
	user32   = syscall.NewLazyDLL("user32.dll")
	kernel32 = syscall.NewLazyDLL("kernel32.dll")

	procRegisterHotKey     = user32.NewProc("RegisterHotKey")
	procUnregisterHotKey   = user32.NewProc("UnregisterHotKey")
	procGetMessage         = user32.NewProc("GetMessageW")
	procPeekMessage        = user32.NewProc("PeekMessageW")
	procTranslateMessage   = user32.NewProc("TranslateMessage")
	procDispatchMessage    = user32.NewProc("DispatchMessageW")
	procGetCurrentThreadId = kernel32.NewProc("GetCurrentThreadId")
)

// MSG represents a Windows message structure
type MSG struct {
	Hwnd    uintptr
	Message uint32
	WParam  uintptr
	LParam  uintptr
	Time    uint32
	Pt      struct{ X, Y int32 }
}

// HotkeyManager manages global keyboard shortcuts for window restoration
type HotkeyManager struct {
	ctx                context.Context
	configManager      *ConfigManager
	windowManager      *WindowManager
	registeredKeys     map[string]int32 // combination -> hotkey ID
	keyIDCounter       int32
	mutex              sync.RWMutex
	messageLoopRunning bool
	stopMessageLoop    chan bool
}

// NewHotkeyManager creates a new HotkeyManager instance
func NewHotkeyManager(configManager *ConfigManager, windowManager *WindowManager) *HotkeyManager {
	return &HotkeyManager{
		configManager:   configManager,
		windowManager:   windowManager,
		registeredKeys:  make(map[string]int32),
		keyIDCounter:    1000, // Start with a high number to avoid conflicts
		stopMessageLoop: make(chan bool, 1),
	}
}

// OnStartup initializes the hotkey manager and registers default hotkey
func (hm *HotkeyManager) OnStartup(ctx context.Context) error {
	hm.ctx = ctx

	// Register the default hotkey from configuration
	defaultHotkey := hm.configManager.GetHotkey()
	if err := hm.RegisterHotkey(defaultHotkey); err != nil {
		// Log error but don't fail startup - hotkey is optional
		return fmt.Errorf("failed to register default hotkey %s: %w", defaultHotkey, err)
	}

	// Start the message loop in a separate goroutine
	go hm.startMessageLoop()

	return nil
}

// OnShutdown cleans up registered hotkeys
func (hm *HotkeyManager) OnShutdown(ctx context.Context) {
	// Stop the message loop
	select {
	case hm.stopMessageLoop <- true:
	default:
		// Channel might be full or closed, that's okay
	}

	// Wait a moment for message loop to stop gracefully
waitLoop:
	for i := 0; i < 10 && hm.messageLoopRunning; i++ {
		select {
		case <-ctx.Done():
			// Context cancelled, exit immediately
			break waitLoop
		default:
			// Small delay to allow message loop to stop
			time.Sleep(100 * time.Millisecond)
		}
	}

	// Unregister all hotkeys
	hm.mutex.Lock()
	defer hm.mutex.Unlock()

	hotkeyCount := len(hm.registeredKeys)
	if hotkeyCount > 0 {
		// Unregister each hotkey individually
		for combination := range hm.registeredKeys {
			if err := hm.unregisterHotkeyInternal(combination); err != nil {
				// Log error but continue with cleanup
				// In production, this would go to a proper logger
			}
		}

		// Clear the registry
		hm.registeredKeys = make(map[string]int32)
	}
}

// RegisterHotkey registers a global hotkey combination
func (hm *HotkeyManager) RegisterHotkey(combination string) error {
	if combination == "" {
		return fmt.Errorf("hotkey combination cannot be empty")
	}

	// Validate the hotkey combination
	if err := hm.ValidateHotkey(combination); err != nil {
		return fmt.Errorf("invalid hotkey combination: %w", err)
	}

	hm.mutex.Lock()
	defer hm.mutex.Unlock()

	// Check if already registered
	if _, exists := hm.registeredKeys[combination]; exists {
		return fmt.Errorf("hotkey %s is already registered", combination)
	}

	// Parse the combination into modifiers and key
	modifiers, vkCode, err := hm.parseHotkeyCombo(combination)
	if err != nil {
		return fmt.Errorf("failed to parse hotkey combination: %w", err)
	}

	// Generate unique hotkey ID
	hotkeyID := hm.keyIDCounter
	hm.keyIDCounter++

	// Register the hotkey with Windows
	ret, _, err := procRegisterHotKey.Call(
		0,                  // hWnd (0 for current thread)
		uintptr(hotkeyID),  // id
		uintptr(modifiers), // fsModifiers
		uintptr(vkCode),    // vk
	)

	if ret == 0 {
		return fmt.Errorf("failed to register hotkey %s: %w", combination, err)
	}

	// Store the registration
	hm.registeredKeys[combination] = hotkeyID

	return nil
}

// UnregisterHotkey unregisters a global hotkey combination
func (hm *HotkeyManager) UnregisterHotkey(combination string) error {
	hm.mutex.Lock()
	defer hm.mutex.Unlock()

	return hm.unregisterHotkeyInternal(combination)
}

// unregisterHotkeyInternal unregisters a hotkey without locking (internal use)
func (hm *HotkeyManager) unregisterHotkeyInternal(combination string) error {
	hotkeyID, exists := hm.registeredKeys[combination]
	if !exists {
		return fmt.Errorf("hotkey %s is not registered", combination)
	}

	// Unregister from Windows
	ret, _, err := procUnregisterHotKey.Call(
		0,                 // hWnd
		uintptr(hotkeyID), // id
	)

	if ret == 0 {
		return fmt.Errorf("failed to unregister hotkey %s: %w", combination, err)
	}

	// Remove from our tracking
	delete(hm.registeredKeys, combination)

	return nil
}

// UpdateHotkey changes the registered hotkey from old combination to new combination
func (hm *HotkeyManager) UpdateHotkey(oldCombo, newCombo string) error {
	// Validate new combination first
	if err := hm.ValidateHotkey(newCombo); err != nil {
		return fmt.Errorf("invalid new hotkey combination: %w", err)
	}

	// Unregister old hotkey if it exists
	if oldCombo != "" {
		if err := hm.UnregisterHotkey(oldCombo); err != nil {
			// Log but don't fail if old hotkey wasn't registered
		}
	}

	// Register new hotkey
	if err := hm.RegisterHotkey(newCombo); err != nil {
		return fmt.Errorf("failed to register new hotkey: %w", err)
	}

	return nil
}

// ValidateHotkey validates that a hotkey combination is valid and not reserved
func (hm *HotkeyManager) ValidateHotkey(combination string) error {
	if combination == "" {
		return fmt.Errorf("hotkey combination cannot be empty")
	}

	// Use ConfigManager's validation which includes system reserved key checks
	return hm.configManager.ValidateHotkey(combination)
}

// parseHotkeyCombo parses a hotkey combination string into Windows API values
func (hm *HotkeyManager) parseHotkeyCombo(combination string) (uint32, uint32, error) {
	parts := strings.Split(combination, "+")
	if len(parts) < 2 {
		return 0, 0, fmt.Errorf("hotkey must contain at least one modifier and one key")
	}

	var modifiers uint32
	var key string

	// Process all parts except the last one as modifiers
	for i := 0; i < len(parts)-1; i++ {
		modifier := strings.TrimSpace(parts[i])
		switch strings.ToLower(modifier) {
		case "ctrl":
			modifiers |= MOD_CONTROL
		case "alt":
			modifiers |= MOD_ALT
		case "shift":
			modifiers |= MOD_SHIFT
		case "win":
			modifiers |= MOD_WIN
		default:
			return 0, 0, fmt.Errorf("invalid modifier: %s", modifier)
		}
	}

	// Last part is the key
	key = strings.TrimSpace(parts[len(parts)-1])

	// Convert key to virtual key code
	vkCode, err := hm.keyToVirtualKeyCode(key)
	if err != nil {
		return 0, 0, fmt.Errorf("invalid key: %w", err)
	}

	return modifiers, vkCode, nil
}

// keyToVirtualKeyCode converts a key string to Windows virtual key code
func (hm *HotkeyManager) keyToVirtualKeyCode(key string) (uint32, error) {
	key = strings.ToUpper(key)

	// Handle single letters A-Z
	if len(key) == 1 && key[0] >= 'A' && key[0] <= 'Z' {
		return uint32(key[0]), nil
	}

	// Handle single digits 0-9
	if len(key) == 1 && key[0] >= '0' && key[0] <= '9' {
		return uint32(key[0]), nil
	}

	// Handle function keys F1-F12
	if strings.HasPrefix(key, "F") && len(key) <= 3 {
		if fNum, err := strconv.Atoi(key[1:]); err == nil && fNum >= 1 && fNum <= 12 {
			return VK_F1 + uint32(fNum-1), nil
		}
	}

	// Handle special keys
	switch key {
	case "SPACE":
		return VK_SPACE, nil
	case "ENTER":
		return VK_RETURN, nil
	case "TAB":
		return VK_TAB, nil
	case "ESCAPE":
		return VK_ESCAPE, nil
	case "HOME":
		return VK_HOME, nil
	case "END":
		return VK_END, nil
	case "PAGEUP":
		return VK_PRIOR, nil
	case "PAGEDOWN":
		return VK_NEXT, nil
	case "INSERT":
		return VK_INSERT, nil
	case "DELETE":
		return VK_DELETE, nil
	case "BACKSPACE":
		return VK_BACK, nil
	case "UP":
		return VK_UP, nil
	case "DOWN":
		return VK_DOWN, nil
	case "LEFT":
		return VK_LEFT, nil
	case "RIGHT":
		return VK_RIGHT, nil
	default:
		return 0, fmt.Errorf("unsupported key: %s", key)
	}
}

// startMessageLoop runs the Windows message loop to handle hotkey events
func (hm *HotkeyManager) startMessageLoop() {
	hm.mutex.Lock()
	hm.messageLoopRunning = true
	hm.mutex.Unlock()

	defer func() {
		hm.mutex.Lock()
		hm.messageLoopRunning = false
		hm.mutex.Unlock()

		// Recover from any panics in the message loop
		if r := recover(); r != nil {
			// In a production app, this would go to a proper logger
			// For now, we just ensure the loop doesn't crash the app
		}
	}()

	var msg MSG

	for {
		select {
		case <-hm.stopMessageLoop:
			return
		case <-hm.ctx.Done():
			return
		default:
			// Use PeekMessage to avoid blocking and allow for clean shutdown
			ret, _, _ := procPeekMessage.Call(
				uintptr(unsafe.Pointer(&msg)),
				0, // hWnd (0 for any window)
				0, // wMsgFilterMin
				0, // wMsgFilterMax
				1, // PM_REMOVE
			)

			if ret == 0 { // No message available
				// Small sleep to prevent busy waiting while allowing responsive shutdown
				select {
				case <-hm.stopMessageLoop:
					return
				case <-hm.ctx.Done():
					return
				default:
					// Brief pause to prevent excessive CPU usage
					continue
				}
			}

			// Process hotkey messages
			if msg.Message == WM_HOTKEY {
				hm.handleHotkeyMessage(int32(msg.WParam))
			} else {
				// For non-hotkey messages, still translate and dispatch
				// This ensures proper Windows message handling
				procTranslateMessage.Call(uintptr(unsafe.Pointer(&msg)))
				procDispatchMessage.Call(uintptr(unsafe.Pointer(&msg)))
			}
		}
	}
}

// handleHotkeyMessage handles a hotkey activation message
func (hm *HotkeyManager) handleHotkeyMessage(hotkeyID int32) {
	hm.mutex.RLock()
	defer hm.mutex.RUnlock()

	// Find which combination was triggered
	var triggeredCombo string
	for combo, id := range hm.registeredKeys {
		if id == hotkeyID {
			triggeredCombo = combo
			break
		}
	}

	if triggeredCombo == "" {
		// Unknown hotkey ID - this shouldn't happen but handle gracefully
		return
	}

	// Execute hotkey action in a separate goroutine to avoid blocking the message loop
	go func() {
		// Toggle window visibility - show if hidden, hide if visible
		if hm.windowManager != nil {
			if err := hm.windowManager.ToggleVisibility(); err != nil {
				// Log error but don't crash - hotkey functionality should be resilient
				// In a production app, this would go to a proper logger
			}
		}
	}()
}

// GetRegisteredHotkeys returns a list of currently registered hotkey combinations
func (hm *HotkeyManager) GetRegisteredHotkeys() []string {
	hm.mutex.RLock()
	defer hm.mutex.RUnlock()

	combinations := make([]string, 0, len(hm.registeredKeys))
	for combo := range hm.registeredKeys {
		combinations = append(combinations, combo)
	}

	return combinations
}

// IsHotkeyRegistered checks if a specific hotkey combination is registered
func (hm *HotkeyManager) IsHotkeyRegistered(combination string) bool {
	hm.mutex.RLock()
	defer hm.mutex.RUnlock()

	_, exists := hm.registeredKeys[combination]
	return exists
}

// SetHotkey updates the configuration and re-registers the hotkey
func (hm *HotkeyManager) SetHotkey(combination string) error {
	// Get current hotkey from config
	currentHotkey := hm.configManager.GetHotkey()

	// Update the hotkey registration
	if err := hm.UpdateHotkey(currentHotkey, combination); err != nil {
		return fmt.Errorf("failed to update hotkey registration: %w", err)
	}

	// Save to configuration
	if err := hm.configManager.SetHotkey(combination); err != nil {
		// If config save fails, revert the hotkey registration
		hm.UpdateHotkey(combination, currentHotkey)
		return fmt.Errorf("failed to save hotkey to configuration: %w", err)
	}

	return nil
}

// GetCurrentHotkey returns the currently configured hotkey
func (hm *HotkeyManager) GetCurrentHotkey() string {
	return hm.configManager.GetHotkey()
}

// IsMessageLoopRunning returns whether the message loop is currently active
func (hm *HotkeyManager) IsMessageLoopRunning() bool {
	hm.mutex.RLock()
	defer hm.mutex.RUnlock()
	return hm.messageLoopRunning
}

// GetHotkeyCount returns the number of currently registered hotkeys
func (hm *HotkeyManager) GetHotkeyCount() int {
	hm.mutex.RLock()
	defer hm.mutex.RUnlock()
	return len(hm.registeredKeys)
}

// GetHotkeyStats returns statistics about the hotkey manager
func (hm *HotkeyManager) GetHotkeyStats() map[string]interface{} {
	hm.mutex.RLock()
	defer hm.mutex.RUnlock()

	return map[string]interface{}{
		"registered_count":     len(hm.registeredKeys),
		"message_loop_running": hm.messageLoopRunning,
		"registered_hotkeys":   hm.GetRegisteredHotkeys(),
	}
}
