package app

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

// AppConfig represents the persistent application configuration
type AppConfig struct {
	ServiceEnabled   bool   `json:"service_enabled"`
	GlobalHotkey     string `json:"global_hotkey"`
	MinimizeToTray   bool   `json:"minimize_to_tray"`
	StartMinimized   bool   `json:"start_minimized"`
	TrayNotifications bool  `json:"tray_notifications"`
}

// DefaultConfig returns the default configuration values
func DefaultConfig() *AppConfig {
	return &AppConfig{
		ServiceEnabled:    true,
		GlobalHotkey:      "Ctrl+Alt+R",
		MinimizeToTray:    true,
		StartMinimized:    false,
		TrayNotifications: true,
	}
}

// ConfigManager handles persistent storage of application settings
type ConfigManager struct {
	configPath string
	config     *AppConfig
}

// NewConfigManager creates a new ConfigManager instance
func NewConfigManager() (*ConfigManager, error) {
	// Get the application data directory
	appDataDir, err := os.UserConfigDir()
	if err != nil {
		return nil, fmt.Errorf("failed to get user config directory: %w", err)
	}

	// Create ShutDB directory in %APPDATA%
	shutDBDir := filepath.Join(appDataDir, "ShutDB")
	if err := os.MkdirAll(shutDBDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create config directory: %w", err)
	}

	configPath := filepath.Join(shutDBDir, "config.json")
	
	cm := &ConfigManager{
		configPath: configPath,
		config:     DefaultConfig(),
	}

	// Load existing configuration or create default
	if err := cm.LoadConfig(); err != nil {
		// If loading fails, save default config
		if saveErr := cm.SaveConfig(cm.config); saveErr != nil {
			return nil, fmt.Errorf("failed to create default config: %w", saveErr)
		}
	}

	return cm, nil
}

// LoadConfig loads configuration from persistent storage
func (cm *ConfigManager) LoadConfig() error {
	// Check if config file exists
	if _, err := os.Stat(cm.configPath); os.IsNotExist(err) {
		// File doesn't exist, use defaults
		cm.config = DefaultConfig()
		return nil
	}

	// Read config file
	data, err := os.ReadFile(cm.configPath)
	if err != nil {
		return fmt.Errorf("failed to read config file: %w", err)
	}

	// Parse JSON
	var config AppConfig
	if err := json.Unmarshal(data, &config); err != nil {
		// If JSON is corrupted, backup the file and use defaults
		backupPath := cm.configPath + ".backup"
		os.Rename(cm.configPath, backupPath)
		cm.config = DefaultConfig()
		return fmt.Errorf("config file corrupted, backed up to %s: %w", backupPath, err)
	}

	// Validate loaded config
	if err := cm.validateConfig(&config); err != nil {
		return fmt.Errorf("invalid configuration: %w", err)
	}

	cm.config = &config
	return nil
}

// SaveConfig saves configuration to persistent storage
func (cm *ConfigManager) SaveConfig(config *AppConfig) error {
	if config == nil {
		return fmt.Errorf("config cannot be nil")
	}

	// Validate config before saving
	if err := cm.validateConfig(config); err != nil {
		return fmt.Errorf("invalid configuration: %w", err)
	}

	// Marshal to JSON with indentation for readability
	data, err := json.MarshalIndent(config, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	// Write to temporary file first for atomic operation
	tempPath := cm.configPath + ".tmp"
	if err := os.WriteFile(tempPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write temp config file: %w", err)
	}

	// Atomic rename
	if err := os.Rename(tempPath, cm.configPath); err != nil {
		os.Remove(tempPath) // Clean up temp file
		return fmt.Errorf("failed to save config file: %w", err)
	}

	cm.config = config
	return nil
}

// GetConfig returns a copy of the current configuration
func (cm *ConfigManager) GetConfig() *AppConfig {
	if cm.config == nil {
		return DefaultConfig()
	}
	
	// Return a copy to prevent external modification
	configCopy := *cm.config
	return &configCopy
}

// GetServiceState returns the current service enabled state
func (cm *ConfigManager) GetServiceState() bool {
	if cm.config == nil {
		return false
	}
	return cm.config.ServiceEnabled
}

// SetServiceState updates the service enabled state and persists it
func (cm *ConfigManager) SetServiceState(enabled bool) error {
	if cm.config == nil {
		cm.config = DefaultConfig()
	}
	
	cm.config.ServiceEnabled = enabled
	return cm.SaveConfig(cm.config)
}

// GetHotkey returns the current global hotkey combination
func (cm *ConfigManager) GetHotkey() string {
	if cm.config == nil {
		return "Ctrl+Shift+S"
	}
	return cm.config.GlobalHotkey
}

// SetHotkey updates the global hotkey combination and persists it
func (cm *ConfigManager) SetHotkey(combination string) error {
	if err := cm.ValidateHotkey(combination); err != nil {
		return fmt.Errorf("invalid hotkey combination: %w", err)
	}
	
	if cm.config == nil {
		cm.config = DefaultConfig()
	}
	
	cm.config.GlobalHotkey = combination
	return cm.SaveConfig(cm.config)
}

// GetMinimizeToTray returns whether the app should minimize to tray
func (cm *ConfigManager) GetMinimizeToTray() bool {
	if cm.config == nil {
		return true
	}
	return cm.config.MinimizeToTray
}

// SetMinimizeToTray updates the minimize to tray setting and persists it
func (cm *ConfigManager) SetMinimizeToTray(enabled bool) error {
	if cm.config == nil {
		cm.config = DefaultConfig()
	}
	
	cm.config.MinimizeToTray = enabled
	return cm.SaveConfig(cm.config)
}

// GetStartMinimized returns whether the app should start minimized
func (cm *ConfigManager) GetStartMinimized() bool {
	if cm.config == nil {
		return false
	}
	return cm.config.StartMinimized
}

// SetStartMinimized updates the start minimized setting and persists it
func (cm *ConfigManager) SetStartMinimized(enabled bool) error {
	if cm.config == nil {
		cm.config = DefaultConfig()
	}
	
	cm.config.StartMinimized = enabled
	return cm.SaveConfig(cm.config)
}

// GetTrayNotifications returns whether tray notifications are enabled
func (cm *ConfigManager) GetTrayNotifications() bool {
	if cm.config == nil {
		return true
	}
	return cm.config.TrayNotifications
}

// SetTrayNotifications updates the tray notifications setting and persists it
func (cm *ConfigManager) SetTrayNotifications(enabled bool) error {
	if cm.config == nil {
		cm.config = DefaultConfig()
	}
	
	cm.config.TrayNotifications = enabled
	return cm.SaveConfig(cm.config)
}

// ValidateHotkey validates a hotkey combination string
func (cm *ConfigManager) ValidateHotkey(combination string) error {
	if combination == "" {
		return fmt.Errorf("hotkey combination cannot be empty")
	}

	// Split by + to get modifiers and key
	parts := strings.Split(combination, "+")
	if len(parts) < 2 {
		return fmt.Errorf("hotkey must contain at least one modifier and one key")
	}

	// Valid modifiers
	validModifiers := map[string]bool{
		"Ctrl":  true,
		"Alt":   true,
		"Shift": true,
		"Win":   true,
	}

	// Valid keys (basic set - can be extended)
	validKeys := map[string]bool{
		// Letters
		"A": true, "B": true, "C": true, "D": true, "E": true, "F": true, "G": true,
		"H": true, "I": true, "J": true, "K": true, "L": true, "M": true, "N": true,
		"O": true, "P": true, "Q": true, "R": true, "S": true, "T": true, "U": true,
		"V": true, "W": true, "X": true, "Y": true, "Z": true,
		// Numbers
		"0": true, "1": true, "2": true, "3": true, "4": true, "5": true,
		"6": true, "7": true, "8": true, "9": true,
		// Function keys
		"F1": true, "F2": true, "F3": true, "F4": true, "F5": true, "F6": true,
		"F7": true, "F8": true, "F9": true, "F10": true, "F11": true, "F12": true,
		// Special keys
		"Space": true, "Enter": true, "Tab": true, "Escape": true,
		"Home": true, "End": true, "PageUp": true, "PageDown": true,
		"Insert": true, "Delete": true, "Backspace": true,
		"Up": true, "Down": true, "Left": true, "Right": true,
	}

	// Check modifiers (all parts except the last one)
	for i := 0; i < len(parts)-1; i++ {
		modifier := strings.TrimSpace(parts[i])
		if !validModifiers[modifier] {
			return fmt.Errorf("invalid modifier: %s", modifier)
		}
	}

	// Check key (last part)
	key := strings.TrimSpace(parts[len(parts)-1])
	if !validKeys[key] {
		return fmt.Errorf("invalid key: %s", key)
	}

	// Check for reserved system combinations
	reservedCombinations := []string{
		"Ctrl+Alt+Delete",
		"Win+L",
		"Alt+Tab",
		"Alt+F4",
		"Ctrl+Shift+Escape",
	}

	for _, reserved := range reservedCombinations {
		if strings.EqualFold(combination, reserved) {
			return fmt.Errorf("hotkey combination %s is reserved by the system", combination)
		}
	}

	return nil
}

// validateConfig validates the entire configuration structure
func (cm *ConfigManager) validateConfig(config *AppConfig) error {
	if config == nil {
		return fmt.Errorf("config cannot be nil")
	}

	// Validate hotkey
	if err := cm.ValidateHotkey(config.GlobalHotkey); err != nil {
		return fmt.Errorf("invalid global hotkey: %w", err)
	}

	return nil
}

// ResetToDefaults resets configuration to default values and saves it
func (cm *ConfigManager) ResetToDefaults() error {
	cm.config = DefaultConfig()
	return cm.SaveConfig(cm.config)
}

// GetConfigPath returns the path to the configuration file
func (cm *ConfigManager) GetConfigPath() string {
	return cm.configPath
}

// OnShutdown ensures all configuration changes are persisted during application shutdown
func (cm *ConfigManager) OnShutdown() error {
	if cm.config == nil {
		return nil
	}
	
	// Force save current configuration state to ensure persistence
	if err := cm.SaveConfig(cm.config); err != nil {
		return fmt.Errorf("failed to save configuration during shutdown: %w", err)
	}
	
	return nil
}