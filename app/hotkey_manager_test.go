package app

import (
	"context"
	"testing"
	"time"
)

// Test helper to create a test HotkeyManager with real dependencies
func createTestHotkeyManager(t *testing.T) (*HotkeyManager, *ConfigManager, *WindowManager) {
	// Create a temporary config manager for testing
	configManager, err := NewConfigManager()
	if err != nil {
		t.Fatalf("Failed to create config manager: %v", err)
	}
	
	// Create a window manager for testing
	windowManager := NewWindowManager()
	
	// Create hotkey manager
	hm := NewHotkeyManager(configManager, windowManager)
	
	// Add cleanup to ensure tests don't interfere with each other
	t.Cleanup(func() {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
		defer cancel()
		hm.OnShutdown(ctx)
	})
	
	return hm, configManager, windowManager
}

func TestNewHotkeyManager(t *testing.T) {
	hm, _, _ := createTestHotkeyManager(t)
	
	if hm == nil {
		t.Fatal("NewHotkeyManager returned nil")
	}
	
	if hm.registeredKeys == nil {
		t.Error("registeredKeys map not initialized")
	}
	
	if hm.keyIDCounter != 1000 {
		t.Errorf("Expected keyIDCounter to be 1000, got %d", hm.keyIDCounter)
	}
	
	if len(hm.registeredKeys) != 0 {
		t.Errorf("Expected empty registeredKeys map, got %d entries", len(hm.registeredKeys))
	}
}

func TestValidateHotkey(t *testing.T) {
	hm, _, _ := createTestHotkeyManager(t)
	
	tests := []struct {
		name        string
		combination string
		expectError bool
	}{
		{"Valid combination", "Ctrl+Alt+R", false},
		{"Valid with Shift", "Ctrl+Shift+S", false},
		{"Valid with Win", "Win+D", false},
		{"Valid function key", "Ctrl+F1", false},
		{"Valid number key", "Alt+1", false},
		{"Empty combination", "", true},
		{"No modifier", "R", true},
		{"Invalid modifier", "Super+R", true},
		{"Invalid key", "Ctrl+InvalidKey", true},
		{"Reserved combination", "Ctrl+Alt+Delete", true},
		{"Reserved Alt+Tab", "Alt+Tab", true},
		{"Reserved Win+L", "Win+L", true},
	}
	
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := hm.ValidateHotkey(tt.combination)
			if tt.expectError && err == nil {
				t.Errorf("Expected error for combination %s, but got none", tt.combination)
			}
			if !tt.expectError && err != nil {
				t.Errorf("Expected no error for combination %s, but got: %v", tt.combination, err)
			}
		})
	}
}

func TestParseHotkeyCombo(t *testing.T) {
	hm, _, _ := createTestHotkeyManager(t)
	
	tests := []struct {
		name           string
		combination    string
		expectedMod    uint32
		expectedVK     uint32
		expectError    bool
	}{
		{
			name:        "Ctrl+Alt+R",
			combination: "Ctrl+Alt+R",
			expectedMod: MOD_CONTROL | MOD_ALT,
			expectedVK:  uint32('R'),
			expectError: false,
		},
		{
			name:        "Shift+F1",
			combination: "Shift+F1",
			expectedMod: MOD_SHIFT,
			expectedVK:  VK_F1,
			expectError: false,
		},
		{
			name:        "Win+Space",
			combination: "Win+Space",
			expectedMod: MOD_WIN,
			expectedVK:  VK_SPACE,
			expectError: false,
		},
		{
			name:        "Invalid modifier",
			combination: "Super+R",
			expectError: true,
		},
		{
			name:        "No modifier",
			combination: "R",
			expectError: true,
		},
		{
			name:        "Invalid key",
			combination: "Ctrl+InvalidKey",
			expectError: true,
		},
	}
	
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			modifiers, vkCode, err := hm.parseHotkeyCombo(tt.combination)
			
			if tt.expectError {
				if err == nil {
					t.Errorf("Expected error for combination %s, but got none", tt.combination)
				}
				return
			}
			
			if err != nil {
				t.Errorf("Unexpected error for combination %s: %v", tt.combination, err)
				return
			}
			
			if modifiers != tt.expectedMod {
				t.Errorf("Expected modifiers %d, got %d", tt.expectedMod, modifiers)
			}
			
			if vkCode != tt.expectedVK {
				t.Errorf("Expected virtual key code %d, got %d", tt.expectedVK, vkCode)
			}
		})
	}
}

func TestKeyToVirtualKeyCode(t *testing.T) {
	hm, _, _ := createTestHotkeyManager(t)
	
	tests := []struct {
		name        string
		key         string
		expectedVK  uint32
		expectError bool
	}{
		{"Letter A", "A", uint32('A'), false},
		{"Letter Z", "Z", uint32('Z'), false},
		{"Lowercase a", "a", uint32('A'), false},
		{"Number 0", "0", uint32('0'), false},
		{"Number 9", "9", uint32('9'), false},
		{"Function F1", "F1", VK_F1, false},
		{"Function F12", "F12", VK_F12, false},
		{"Space", "SPACE", VK_SPACE, false},
		{"Enter", "ENTER", VK_RETURN, false},
		{"Tab", "TAB", VK_TAB, false},
		{"Escape", "ESCAPE", VK_ESCAPE, false},
		{"Home", "HOME", VK_HOME, false},
		{"End", "END", VK_END, false},
		{"PageUp", "PAGEUP", VK_PRIOR, false},
		{"PageDown", "PAGEDOWN", VK_NEXT, false},
		{"Insert", "INSERT", VK_INSERT, false},
		{"Delete", "DELETE", VK_DELETE, false},
		{"Backspace", "BACKSPACE", VK_BACK, false},
		{"Arrow Up", "UP", VK_UP, false},
		{"Arrow Down", "DOWN", VK_DOWN, false},
		{"Arrow Left", "LEFT", VK_LEFT, false},
		{"Arrow Right", "RIGHT", VK_RIGHT, false},
		{"Invalid key", "InvalidKey", 0, true},
		{"Invalid function key", "F13", 0, true},
		{"Empty key", "", 0, true},
	}
	
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			vkCode, err := hm.keyToVirtualKeyCode(tt.key)
			
			if tt.expectError {
				if err == nil {
					t.Errorf("Expected error for key %s, but got none", tt.key)
				}
				return
			}
			
			if err != nil {
				t.Errorf("Unexpected error for key %s: %v", tt.key, err)
				return
			}
			
			if vkCode != tt.expectedVK {
				t.Errorf("Expected virtual key code %d for key %s, got %d", tt.expectedVK, tt.key, vkCode)
			}
		})
	}
}

func TestHotkeyRegistrationAndUnregistration(t *testing.T) {
	hm, _, _ := createTestHotkeyManager(t)
	
	// Test registering a valid hotkey
	combination := "Ctrl+Alt+T"
	
	// Initially should not be registered
	if hm.IsHotkeyRegistered(combination) {
		t.Errorf("Hotkey %s should not be registered initially", combination)
	}
	
	// Register the hotkey
	err := hm.RegisterHotkey(combination)
	if err != nil {
		t.Errorf("Failed to register hotkey %s: %v", combination, err)
	}
	
	// Should now be registered
	if !hm.IsHotkeyRegistered(combination) {
		t.Errorf("Hotkey %s should be registered after RegisterHotkey", combination)
	}
	
	// Check hotkey count
	if hm.GetHotkeyCount() != 1 {
		t.Errorf("Expected 1 registered hotkey, got %d", hm.GetHotkeyCount())
	}
	
	// Check registered hotkeys list
	registered := hm.GetRegisteredHotkeys()
	if len(registered) != 1 || registered[0] != combination {
		t.Errorf("Expected registered hotkeys [%s], got %v", combination, registered)
	}
	
	// Try to register the same hotkey again (should fail)
	err = hm.RegisterHotkey(combination)
	if err == nil {
		t.Errorf("Expected error when registering duplicate hotkey %s", combination)
	}
	
	// Unregister the hotkey
	err = hm.UnregisterHotkey(combination)
	if err != nil {
		t.Errorf("Failed to unregister hotkey %s: %v", combination, err)
	}
	
	// Should no longer be registered
	if hm.IsHotkeyRegistered(combination) {
		t.Errorf("Hotkey %s should not be registered after UnregisterHotkey", combination)
	}
	
	// Check hotkey count is back to 0
	if hm.GetHotkeyCount() != 0 {
		t.Errorf("Expected 0 registered hotkeys after unregistration, got %d", hm.GetHotkeyCount())
	}
	
	// Try to unregister non-existent hotkey (should fail)
	err = hm.UnregisterHotkey("Ctrl+Alt+NonExistent")
	if err == nil {
		t.Error("Expected error when unregistering non-existent hotkey")
	}
}

func TestUpdateHotkey(t *testing.T) {
	hm, _, _ := createTestHotkeyManager(t)
	
	oldCombo := "Ctrl+Alt+U"  // Use unique combination
	newCombo := "Ctrl+Shift+U"
	
	// Register initial hotkey
	err := hm.RegisterHotkey(oldCombo)
	if err != nil {
		t.Fatalf("Failed to register initial hotkey: %v", err)
	}
	
	// Update to new hotkey
	err = hm.UpdateHotkey(oldCombo, newCombo)
	if err != nil {
		t.Errorf("Failed to update hotkey: %v", err)
	}
	
	// Old hotkey should no longer be registered
	if hm.IsHotkeyRegistered(oldCombo) {
		t.Errorf("Old hotkey %s should not be registered after update", oldCombo)
	}
	
	// New hotkey should be registered
	if !hm.IsHotkeyRegistered(newCombo) {
		t.Errorf("New hotkey %s should be registered after update", newCombo)
	}
	
	// Test updating to invalid hotkey (should fail)
	err = hm.UpdateHotkey(newCombo, "InvalidHotkey")
	if err == nil {
		t.Error("Expected error when updating to invalid hotkey")
	}
	
	// Original hotkey should still be registered after failed update
	if !hm.IsHotkeyRegistered(newCombo) {
		t.Errorf("Original hotkey %s should still be registered after failed update", newCombo)
	}
	
	// Test updating from empty old combo
	err = hm.UpdateHotkey("", "Ctrl+Alt+N")
	if err != nil {
		t.Errorf("Failed to update from empty old combo: %v", err)
	}
	
	// Note: Config manager's hotkey won't change from UpdateHotkey alone
	// UpdateHotkey only changes registration, not the stored config
}

func TestSetHotkey(t *testing.T) {
	hm, configManager, _ := createTestHotkeyManager(t)
	
	newCombo := "Ctrl+Shift+Y"  // Use unique combination
	
	// Set new hotkey
	err := hm.SetHotkey(newCombo)
	if err != nil {
		t.Errorf("Failed to set hotkey: %v", err)
	}
	
	// Verify hotkey is registered
	if !hm.IsHotkeyRegistered(newCombo) {
		t.Errorf("Hotkey %s should be registered after SetHotkey", newCombo)
	}
	
	// Verify config was updated
	if configManager.GetHotkey() != newCombo {
		t.Errorf("Expected config hotkey to be %s, got %s", newCombo, configManager.GetHotkey())
	}
	
	// Verify GetCurrentHotkey returns the new value
	if hm.GetCurrentHotkey() != newCombo {
		t.Errorf("Expected GetCurrentHotkey to return %s, got %s", newCombo, hm.GetCurrentHotkey())
	}
	
	// Test setting invalid hotkey (should fail)
	err = hm.SetHotkey("InvalidHotkey")
	if err == nil {
		t.Error("Expected error when setting invalid hotkey")
	}
	
	// Original hotkey should still be set after failed update
	if hm.GetCurrentHotkey() != newCombo {
		t.Errorf("Expected hotkey to remain %s after failed update, got %s", newCombo, hm.GetCurrentHotkey())
	}
}

func TestHotkeyConflictDetection(t *testing.T) {
	hm, _, _ := createTestHotkeyManager(t)
	
	// Test system reserved combinations
	reservedCombinations := []string{
		"Ctrl+Alt+Delete",
		"Win+L",
		"Alt+Tab",
		"Alt+F4",
		"Ctrl+Shift+Escape",
	}
	
	for _, combo := range reservedCombinations {
		t.Run("Reserved_"+combo, func(t *testing.T) {
			err := hm.ValidateHotkey(combo)
			if err == nil {
				t.Errorf("Expected error for reserved combination %s", combo)
			}
			
			err = hm.RegisterHotkey(combo)
			if err == nil {
				t.Errorf("Expected error when registering reserved combination %s", combo)
			}
		})
	}
	
	// Test case-insensitive reserved combination detection
	err := hm.ValidateHotkey("ctrl+alt+delete")
	if err == nil {
		t.Error("Expected error for lowercase reserved combination")
	}
	
	err = hm.ValidateHotkey("CTRL+ALT+DELETE")
	if err == nil {
		t.Error("Expected error for uppercase reserved combination")
	}
}

func TestGetHotkeyStats(t *testing.T) {
	hm, _, _ := createTestHotkeyManager(t)
	
	// Initially no hotkeys registered
	stats := hm.GetHotkeyStats()
	
	if stats["registered_count"] != 0 {
		t.Errorf("Expected registered_count to be 0, got %v", stats["registered_count"])
	}
	
	if stats["message_loop_running"] != false {
		t.Errorf("Expected message_loop_running to be false, got %v", stats["message_loop_running"])
	}
	
	registeredHotkeys, ok := stats["registered_hotkeys"].([]string)
	if !ok || len(registeredHotkeys) != 0 {
		t.Errorf("Expected empty registered_hotkeys slice, got %v", stats["registered_hotkeys"])
	}
	
	// Register a hotkey and check stats again
	combination := "Ctrl+Alt+Q"  // Use unique combination
	err := hm.RegisterHotkey(combination)
	if err != nil {
		t.Fatalf("Failed to register hotkey: %v", err)
	}
	
	stats = hm.GetHotkeyStats()
	
	if stats["registered_count"] != 1 {
		t.Errorf("Expected registered_count to be 1, got %v", stats["registered_count"])
	}
	
	registeredHotkeys, ok = stats["registered_hotkeys"].([]string)
	if !ok || len(registeredHotkeys) != 1 || registeredHotkeys[0] != combination {
		t.Errorf("Expected registered_hotkeys to contain [%s], got %v", combination, stats["registered_hotkeys"])
	}
}

func TestOnStartupAndShutdown(t *testing.T) {
	hm, configManager, _ := createTestHotkeyManager(t)
	
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	
	// Set a unique hotkey for this test to avoid conflicts
	uniqueHotkey := "Ctrl+Alt+Z"
	err := configManager.SetHotkey(uniqueHotkey)
	if err != nil {
		t.Fatalf("Failed to set unique hotkey: %v", err)
	}
	
	// Test OnStartup
	err = hm.OnStartup(ctx)
	if err != nil {
		t.Errorf("OnStartup failed: %v", err)
	}
	
	// Default hotkey should be registered
	defaultHotkey := configManager.GetHotkey()
	if !hm.IsHotkeyRegistered(defaultHotkey) {
		t.Errorf("Default hotkey %s should be registered after OnStartup", defaultHotkey)
	}
	
	// Message loop should be running
	// Give it a moment to start
	time.Sleep(100 * time.Millisecond)
	if !hm.IsMessageLoopRunning() {
		t.Error("Message loop should be running after OnStartup")
	}
	
	// Test OnShutdown
	hm.OnShutdown(ctx)
	
	// Give it a moment to stop
	time.Sleep(100 * time.Millisecond)
	
	// Message loop should be stopped
	if hm.IsMessageLoopRunning() {
		t.Error("Message loop should be stopped after OnShutdown")
	}
	
	// All hotkeys should be unregistered
	if hm.GetHotkeyCount() != 0 {
		t.Errorf("Expected 0 registered hotkeys after OnShutdown, got %d", hm.GetHotkeyCount())
	}
}

func TestEmptyHotkeyValidation(t *testing.T) {
	hm, _, _ := createTestHotkeyManager(t)
	
	// Test empty string validation
	err := hm.ValidateHotkey("")
	if err == nil {
		t.Error("Expected error for empty hotkey combination")
	}
	
	// Test registration with empty string
	err = hm.RegisterHotkey("")
	if err == nil {
		t.Error("Expected error when registering empty hotkey combination")
	}
	
	// Test unregistration with empty string
	err = hm.UnregisterHotkey("")
	if err == nil {
		t.Error("Expected error when unregistering empty hotkey combination")
	}
}

func TestMultipleHotkeyRegistration(t *testing.T) {
	hm, _, _ := createTestHotkeyManager(t)
	
	combinations := []string{
		"Ctrl+Alt+J",  // Use very unique combinations
		"Ctrl+Shift+K",
		"Alt+F3",
		"Win+F5",
	}
	
	// Register multiple hotkeys
	for _, combo := range combinations {
		err := hm.RegisterHotkey(combo)
		if err != nil {
			t.Errorf("Failed to register hotkey %s: %v", combo, err)
		}
	}
	
	// Verify all are registered
	if hm.GetHotkeyCount() != len(combinations) {
		t.Errorf("Expected %d registered hotkeys, got %d", len(combinations), hm.GetHotkeyCount())
	}
	
	for _, combo := range combinations {
		if !hm.IsHotkeyRegistered(combo) {
			t.Errorf("Hotkey %s should be registered", combo)
		}
	}
	
	// Verify registered hotkeys list contains all combinations
	registered := hm.GetRegisteredHotkeys()
	if len(registered) != len(combinations) {
		t.Errorf("Expected %d registered hotkeys in list, got %d", len(combinations), len(registered))
	}
	
	// Unregister all hotkeys
	for _, combo := range combinations {
		err := hm.UnregisterHotkey(combo)
		if err != nil {
			t.Errorf("Failed to unregister hotkey %s: %v", combo, err)
		}
	}
	
	// Verify all are unregistered
	if hm.GetHotkeyCount() != 0 {
		t.Errorf("Expected 0 registered hotkeys after unregistering all, got %d", hm.GetHotkeyCount())
	}
}