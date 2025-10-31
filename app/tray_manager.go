package app

import (
	"context"
	"os"

	"github.com/getlantern/systray"
	"github.com/wailsapp/wails/v2/pkg/menu"
	"github.com/wailsapp/wails/v2/pkg/menu/keys"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// For now, we'll use a simple icon data or load it at runtime
// In a production app, you would embed the icon file here
var iconData []byte

// TrayManager manages system tray icon, context menu, and tray-related operations
type TrayManager struct {
	ctx           context.Context
	configManager *ConfigManager
	serviceManager *ServiceManager
	windowManager  *WindowManager
	trayMenu      *menu.Menu
	isInitialized bool
	systrayRunning bool
}

// NewTrayManager creates a new TrayManager instance with dependency injection
func NewTrayManager(configManager *ConfigManager, serviceManager *ServiceManager, windowManager *WindowManager) *TrayManager {
	return &TrayManager{
		configManager:  configManager,
		serviceManager: serviceManager,
		windowManager:  windowManager,
	}
}

// OnStartup initializes the tray icon on application start
func (tm *TrayManager) OnStartup(ctx context.Context) error {
	tm.ctx = ctx
	
	// Initialize tray icon
	if err := tm.InitializeTray(); err != nil {
		return err
	}
	
	tm.isInitialized = true
	return nil
}

// OnShutdown handles cleanup when the application shuts down
func (tm *TrayManager) OnShutdown(ctx context.Context) {
	// Clean up tray icon and system resources
	tm.CleanupTray()
	
	// Reset initialization state
	tm.isInitialized = false
	
	// Clear context reference
	tm.ctx = nil
}

// InitializeTray creates and configures the system tray icon
func (tm *TrayManager) InitializeTray() error {
	// Create the Wails menu as fallback
	tm.trayMenu = menu.NewMenu()
	tm.trayMenu.AddText("Show ShutDB", keys.CmdOrCtrl("o"), tm.HandleOpenApp)
	tm.trayMenu.AddSeparator()
	
	serviceEnabled := tm.configManager.GetServiceState()
	var serviceToggleText string
	if serviceEnabled {
		serviceToggleText = "Disable Service"
	} else {
		serviceToggleText = "Enable Service"
	}
	tm.trayMenu.AddText(serviceToggleText, nil, tm.HandleToggleService)
	tm.trayMenu.AddSeparator()
	tm.trayMenu.AddText("Exit", keys.CmdOrCtrl("q"), tm.HandleExit)
	
	// Set as application menu (fallback)
	runtime.MenuSetApplicationMenu(tm.ctx, tm.trayMenu)
	
	// Initialize real system tray using systray library
	if !tm.systrayRunning {
		go tm.runSystray()
	}
	
	return nil
}

// runSystray initializes and runs the system tray
func (tm *TrayManager) runSystray() {
	tm.systrayRunning = true
	
	systray.Run(tm.onSystrayReady, tm.onSystrayExit)
}

// onSystrayReady is called when the system tray is ready
func (tm *TrayManager) onSystrayReady() {
	// Load and set icon
	tm.loadAndSetIcon()
	
	systray.SetTitle("ShutDB")
	systray.SetTooltip("ShutDB")
	
	// Create menu items
	mShow := systray.AddMenuItem("Open ShutDB", "Show the application window")
	systray.AddSeparator()
	
	// Service toggle menu item
	serviceEnabled := tm.configManager.GetServiceState()
	var serviceToggleText string
	if serviceEnabled {
		serviceToggleText = "Disable Service"
	} else {
		serviceToggleText = "Enable Service"
	}
	mToggleService := systray.AddMenuItem(serviceToggleText, "Toggle service state")
	
	systray.AddSeparator()
	mQuit := systray.AddMenuItem("End Task", "Exit the application")
	
	// Handle menu clicks in separate goroutines
	go func() {
		for {
			select {
			case <-mShow.ClickedCh:
				tm.RestoreFromTray()
			case <-mToggleService.ClickedCh:
				tm.handleSystrayToggleService(mToggleService)
			case <-mQuit.ClickedCh:
				tm.HandleExit(nil)
				return
			}
		}
	}()
}

// onSystrayExit is called when the system tray exits
func (tm *TrayManager) onSystrayExit() {
	tm.systrayRunning = false
}

// handleSystrayToggleService handles service toggle from system tray
func (tm *TrayManager) handleSystrayToggleService(menuItem *systray.MenuItem) {
	// Get current service state
	currentState := tm.configManager.GetServiceState()
	
	// Toggle the state
	newState := !currentState
	
	// Update the configuration
	if err := tm.configManager.SetServiceState(newState); err != nil {
		// Show error notification using Wails runtime
		if tm.ctx != nil {
			runtime.MessageDialog(tm.ctx, runtime.MessageDialogOptions{
				Type:    runtime.ErrorDialog,
				Title:   "Service Toggle Error",
				Message: "Failed to update service state: " + err.Error(),
			})
		}
		return
	}
	
	// Update menu item text
	var newText string
	if newState {
		newText = "Disable Service"
		systray.SetTooltip("ShutDB - Service Enabled")
	} else {
		newText = "Enable Service"
		systray.SetTooltip("ShutDB - Service Disabled")
	}
	menuItem.SetTitle(newText)
	
	// Show success notification if enabled
	if tm.configManager.GetTrayNotifications() && tm.ctx != nil {
		var message string
		if newState {
			message = "Service enabled successfully"
		} else {
			message = "Service disabled successfully"
		}
		
		runtime.MessageDialog(tm.ctx, runtime.MessageDialogOptions{
			Type:    runtime.InfoDialog,
			Title:   "Service Status",
			Message: message,
		})
	}
}

// UpdateTrayIcon updates the tray icon to reflect current service status
func (tm *TrayManager) UpdateTrayIcon() error {
	// Update tooltip based on service state
	if tm.systrayRunning {
		serviceEnabled := tm.configManager.GetServiceState()
		if serviceEnabled {
			systray.SetTooltip("ShutDB - Service Enabled")
		} else {
			systray.SetTooltip("ShutDB - Service Disabled")
		}
	}
	
	// Recreate the Wails menu to update the service toggle text
	if tm.ctx != nil {
		return tm.InitializeTray()
	}
	return nil
}

// HandleOpenApp handles the "Open App" context menu action
func (tm *TrayManager) HandleOpenApp(data *menu.CallbackData) {
	// Always restore from tray when clicked from tray menu
	// (user clicked tray icon, so they want to see the app)
	tm.RestoreFromTray()
}

// HandleToggleService handles the service toggle context menu action
func (tm *TrayManager) HandleToggleService(data *menu.CallbackData) {
	// Get current service state
	currentState := tm.configManager.GetServiceState()
	
	// Toggle the state
	newState := !currentState
	
	// Update the configuration
	if err := tm.configManager.SetServiceState(newState); err != nil {
		// Show error notification using Wails runtime
		runtime.MessageDialog(tm.ctx, runtime.MessageDialogOptions{
			Type:    runtime.ErrorDialog,
			Title:   "Service Toggle Error",
			Message: "Failed to update service state: " + err.Error(),
		})
		return
	}
	
	// Update the tray icon to reflect new state
	if err := tm.UpdateTrayIcon(); err != nil {
		// Log error but don't show dialog for tray update failures
		// The state change was successful, just the UI update failed
	}
	
	// Show success notification
	var message string
	if newState {
		message = "Service enabled successfully"
	} else {
		message = "Service disabled successfully"
	}
	
	// Show notification if enabled in config
	if tm.configManager.GetTrayNotifications() {
		runtime.MessageDialog(tm.ctx, runtime.MessageDialogOptions{
			Type:    runtime.InfoDialog,
			Title:   "Service Status",
			Message: message,
		})
	}
}

// HandleExit handles the "Exit" context menu action
func (tm *TrayManager) HandleExit(data *menu.CallbackData) {
	runtime.Quit(tm.ctx)
}

// MinimizeToTray minimizes the application to the system tray
func (tm *TrayManager) MinimizeToTray() error {
	// Check if minimize to tray is enabled
	if !tm.configManager.GetMinimizeToTray() {
		// If not enabled, use regular minimize
		tm.windowManager.Minimize()
		return nil
	}
	
	// Use WindowManager's MinimizeToTray method
	return tm.windowManager.MinimizeToTray()
}

// RestoreFromTray restores the application window from the system tray
func (tm *TrayManager) RestoreFromTray() error {
	// Use WindowManager's RestoreFromTray method
	return tm.windowManager.RestoreFromTray()
}

// CleanupTray handles tray icon cleanup on application shutdown
func (tm *TrayManager) CleanupTray() {
	// Quit the system tray
	if tm.systrayRunning {
		systray.Quit()
	}
	
	if tm.isInitialized && tm.ctx != nil {
		// Clear the application menu
		runtime.MenuSetApplicationMenu(tm.ctx, nil)
		
		// Clear menu reference
		tm.trayMenu = nil
	}
}

// GetServiceStatus returns the current service status for tray icon updates
func (tm *TrayManager) GetServiceStatus() ServiceStatus {
	// Check if service is enabled in config
	if !tm.configManager.GetServiceState() {
		return StatusStopped
	}
	
	// For now, return running if enabled
	// This could be enhanced to check actual service status
	return StatusRunning
}

// RefreshContextMenu rebuilds the context menu with current state
func (tm *TrayManager) RefreshContextMenu() error {
	if tm.ctx == nil {
		return nil
	}
	
	// Recreate the menu to ensure fresh state
	return tm.InitializeTray()
}

// IsTrayIconVisible returns whether the system tray icon is currently visible
func (tm *TrayManager) IsTrayIconVisible() bool {
	return tm.systrayRunning
}

// IsSystemTraySupported checks if the system supports system tray functionality
func (tm *TrayManager) IsSystemTraySupported() bool {
	return true
}

// loadAndSetIcon loads the application icon and sets it for the system tray
func (tm *TrayManager) loadAndSetIcon() {
	// Try to load icon from build directory
	iconPaths := []string{
		"build/windows/icon.ico",
		"build/appicon.png",
		"app.ico",
		"icon.ico",
	}
	
	for _, path := range iconPaths {
		if data, err := os.ReadFile(path); err == nil {
			systray.SetIcon(data)
			return
		}
	}
	
	// If no icon file found, systray will use a default icon
}