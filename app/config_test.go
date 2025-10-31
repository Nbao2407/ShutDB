package app

import (
	"encoding/json"
	"os"
	"path/filepath"
	"testing"
)

// Helper function to create a test config manager with temporary directory
func createTestConfigManager(t *testing.T) (*ConfigManager, string) {
	tempDir := t.TempDir()
	shutDBDir := filepath.Join(tempDir, "ShutDB")
	configPath := filepath.Join(shutDBDir, "config.json")
	
	// Create directory
	err := os.MkdirAll(shutDBDir, 0755)
	if err != nil {
		t.Fatalf("Failed to create test directory: %v", err)
	}
	
	cm := &ConfigManager{
		configPath: configPath,
		config:     DefaultConfig(),
	}
	
	return cm, tempDir
}

func TestNewConfigManager(t *testing.T) {
	// This test uses the actual user config directory
	// We'll just verify it doesn't crash and creates the expected structure
	cm, err := NewConfigManager()
	if err != nil {
		t.Fatalf("NewConfigManager() failed: %v", err)
	}
	
	if cm == nil {
		t.Fatal("ConfigManager should not be nil")
	}
	
	// Just verify the config path contains ShutDB
	configPath := cm.GetConfigPath()
	if !filepath.IsAbs(configPath) {
		t.Error("Config path should be absolute")
	}
	
	// Check that file exists
	if _, err := os.Stat(configPath); os.IsNotExist(err) {
		t.Error("Config file should have been created")
	}
}

func TestDefaultConfig(t *testing.T) {
	config := DefaultConfig()
	
	if config.ServiceEnabled != true {
		t.Error("Default ServiceEnabled should be true")
	}
	
	if config.GlobalHotkey != "Ctrl+Alt+R" {
		t.Errorf("Default GlobalHotkey should be 'Ctrl+Alt+R', got '%s'", config.GlobalHotkey)
	}
	
	if config.MinimizeToTray != true {
		t.Error("Default MinimizeToTray should be true")
	}
	
	if config.StartMinimized != false {
		t.Error("Default StartMinimized should be false")
	}
	
	if config.TrayNotifications != true {
		t.Error("Default TrayNotifications should be true")
	}
}

func TestConfigManagerServiceState(t *testing.T) {
	cm, _ := createTestConfigManager(t)
	
	// Test default service state
	if !cm.GetServiceState() {
		t.Error("Default service state should be enabled")
	}
	
	// Test setting service state
	err := cm.SetServiceState(false)
	if err != nil {
		t.Fatalf("SetServiceState() failed: %v", err)
	}
	
	if cm.GetServiceState() {
		t.Error("Service state should be disabled after SetServiceState(false)")
	}
	
	// Test persistence by loading config again
	err = cm.LoadConfig()
	if err != nil {
		t.Fatalf("LoadConfig() failed: %v", err)
	}
	
	if cm.GetServiceState() {
		t.Error("Service state should persist as disabled")
	}
}

func TestConfigValidateHotkey(t *testing.T) {
	cm := &ConfigManager{}
	
	// Test valid hotkeys
	validHotkeys := []string{
		"Ctrl+Alt+R",
		"Ctrl+Shift+S",
		"Alt+F1",
		"Win+Space",
	}
	
	for _, hotkey := range validHotkeys {
		if err := cm.ValidateHotkey(hotkey); err != nil {
			t.Errorf("ValidateHotkey('%s') should be valid, got error: %v", hotkey, err)
		}
	}
	
	// Test invalid hotkeys
	invalidHotkeys := []string{
		"",                    // empty
		"S",                   // no modifier
		"InvalidMod+S",        // invalid modifier
		"Ctrl+InvalidKey",     // invalid key
		"Ctrl+Alt+Delete",     // reserved combination
	}
	
	for _, hotkey := range invalidHotkeys {
		if err := cm.ValidateHotkey(hotkey); err == nil {
			t.Errorf("ValidateHotkey('%s') should be invalid", hotkey)
		}
	}
}

func TestConfigManagerHotkey(t *testing.T) {
	cm, _ := createTestConfigManager(t)
	
	// Test default hotkey
	defaultHotkey := cm.GetHotkey()
	if defaultHotkey != "Ctrl+Alt+R" {
		t.Errorf("Default hotkey should be 'Ctrl+Alt+R', got '%s'", defaultHotkey)
	}
	
	// Test setting valid hotkey
	newHotkey := "Ctrl+Shift+T"
	err := cm.SetHotkey(newHotkey)
	if err != nil {
		t.Fatalf("SetHotkey() failed: %v", err)
	}
	
	if cm.GetHotkey() != newHotkey {
		t.Errorf("Hotkey should be '%s', got '%s'", newHotkey, cm.GetHotkey())
	}
	
	// Test setting invalid hotkey
	err = cm.SetHotkey("InvalidHotkey")
	if err == nil {
		t.Error("SetHotkey() should fail for invalid hotkey")
	}
}

func TestConfigManagerTraySettings(t *testing.T) {
	cm, _ := createTestConfigManager(t)
	
	// Test default minimize to tray setting
	if !cm.GetMinimizeToTray() {
		t.Error("Default MinimizeToTray should be true")
	}
	
	// Test setting minimize to tray
	err := cm.SetMinimizeToTray(false)
	if err != nil {
		t.Fatalf("SetMinimizeToTray() failed: %v", err)
	}
	
	if cm.GetMinimizeToTray() {
		t.Error("MinimizeToTray should be false after SetMinimizeToTray(false)")
	}
	
	// Test start minimized setting
	if cm.GetStartMinimized() {
		t.Error("Default StartMinimized should be false")
	}
	
	err = cm.SetStartMinimized(true)
	if err != nil {
		t.Fatalf("SetStartMinimized() failed: %v", err)
	}
	
	if !cm.GetStartMinimized() {
		t.Error("StartMinimized should be true after SetStartMinimized(true)")
	}
	
	// Test tray notifications setting
	if !cm.GetTrayNotifications() {
		t.Error("Default TrayNotifications should be true")
	}
	
	err = cm.SetTrayNotifications(false)
	if err != nil {
		t.Fatalf("SetTrayNotifications() failed: %v", err)
	}
	
	if cm.GetTrayNotifications() {
		t.Error("TrayNotifications should be false after SetTrayNotifications(false)")
	}
}

func TestConfigPersistence(t *testing.T) {
	cm, _ := createTestConfigManager(t)
	
	// Modify all settings
	err := cm.SetServiceState(false)
	if err != nil {
		t.Fatalf("SetServiceState() failed: %v", err)
	}
	
	err = cm.SetHotkey("Ctrl+Shift+T")
	if err != nil {
		t.Fatalf("SetHotkey() failed: %v", err)
	}
	
	err = cm.SetMinimizeToTray(false)
	if err != nil {
		t.Fatalf("SetMinimizeToTray() failed: %v", err)
	}
	
	err = cm.SetStartMinimized(true)
	if err != nil {
		t.Fatalf("SetStartMinimized() failed: %v", err)
	}
	
	err = cm.SetTrayNotifications(false)
	if err != nil {
		t.Fatalf("SetTrayNotifications() failed: %v", err)
	}
	
	// Create new config manager with same path to test persistence
	cm2 := &ConfigManager{
		configPath: cm.configPath,
		config:     DefaultConfig(),
	}
	
	err = cm2.LoadConfig()
	if err != nil {
		t.Fatalf("LoadConfig() failed: %v", err)
	}
	
	// Verify all settings persisted
	if cm2.GetServiceState() {
		t.Error("ServiceState should persist as false")
	}
	
	if cm2.GetHotkey() != "Ctrl+Shift+T" {
		t.Errorf("Hotkey should persist as 'Ctrl+Shift+T', got '%s'", cm2.GetHotkey())
	}
	
	if cm2.GetMinimizeToTray() {
		t.Error("MinimizeToTray should persist as false")
	}
	
	if !cm2.GetStartMinimized() {
		t.Error("StartMinimized should persist as true")
	}
	
	if cm2.GetTrayNotifications() {
		t.Error("TrayNotifications should persist as false")
	}
}

func TestConfigCorruptedFile(t *testing.T) {
	cm, _ := createTestConfigManager(t)
	
	// Write corrupted JSON to config file
	corruptedJSON := `{"service_enabled": true, "invalid_json"`
	err := os.WriteFile(cm.configPath, []byte(corruptedJSON), 0644)
	if err != nil {
		t.Fatalf("Failed to write corrupted config: %v", err)
	}
	
	// Loading should handle corruption gracefully
	err = cm.LoadConfig()
	if err == nil {
		t.Error("LoadConfig() should return error for corrupted file")
	}
	
	// Should fall back to defaults
	if cm.GetServiceState() != true {
		t.Error("Should fall back to default ServiceState (true) after corruption")
	}
	
	// Backup file should exist
	backupPath := cm.configPath + ".backup"
	if _, err := os.Stat(backupPath); os.IsNotExist(err) {
		t.Error("Backup file should be created when config is corrupted")
	}
}

func TestResetToDefaults(t *testing.T) {
	cm, _ := createTestConfigManager(t)
	
	// Modify settings
	cm.SetServiceState(false)
	cm.SetHotkey("Ctrl+Shift+X")
	cm.SetMinimizeToTray(false)
	
	// Reset to defaults
	err := cm.ResetToDefaults()
	if err != nil {
		t.Fatalf("ResetToDefaults() failed: %v", err)
	}
	
	// Verify all settings are back to defaults
	defaults := DefaultConfig()
	
	if cm.GetServiceState() != defaults.ServiceEnabled {
		t.Error("ServiceState should be reset to default")
	}
	
	if cm.GetHotkey() != defaults.GlobalHotkey {
		t.Error("Hotkey should be reset to default")
	}
	
	if cm.GetMinimizeToTray() != defaults.MinimizeToTray {
		t.Error("MinimizeToTray should be reset to default")
	}
	
	if cm.GetStartMinimized() != defaults.StartMinimized {
		t.Error("StartMinimized should be reset to default")
	}
	
	if cm.GetTrayNotifications() != defaults.TrayNotifications {
		t.Error("TrayNotifications should be reset to default")
	}
}

func TestConfigJSONFormat(t *testing.T) {
	cm, _ := createTestConfigManager(t)
	
	// Save config and verify JSON format
	err := cm.SaveConfig(cm.config)
	if err != nil {
		t.Fatalf("SaveConfig() failed: %v", err)
	}
	
	// Read and parse JSON
	data, err := os.ReadFile(cm.configPath)
	if err != nil {
		t.Fatalf("Failed to read config file: %v", err)
	}
	
	var parsedConfig AppConfig
	err = json.Unmarshal(data, &parsedConfig)
	if err != nil {
		t.Fatalf("Failed to parse saved JSON: %v", err)
	}
	
	// Verify all fields are present and correct
	if parsedConfig.ServiceEnabled != cm.config.ServiceEnabled {
		t.Error("ServiceEnabled not correctly saved to JSON")
	}
	
	if parsedConfig.GlobalHotkey != cm.config.GlobalHotkey {
		t.Error("GlobalHotkey not correctly saved to JSON")
	}
	
	if parsedConfig.MinimizeToTray != cm.config.MinimizeToTray {
		t.Error("MinimizeToTray not correctly saved to JSON")
	}
	
	if parsedConfig.StartMinimized != cm.config.StartMinimized {
		t.Error("StartMinimized not correctly saved to JSON")
	}
	
	if parsedConfig.TrayNotifications != cm.config.TrayNotifications {
		t.Error("TrayNotifications not correctly saved to JSON")
	}
}