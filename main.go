package main

import (
	"context"
	"embed"
	"log"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"service-db-dashboard/app"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	// Create config manager instance
	configManager, err := app.NewConfigManager()
	if err != nil {
		log.Fatal("Failed to create config manager:", err.Error())
	}
	
	// Create service manager instance
	serviceManager := app.NewServiceManager(configManager)
	
	// Create window manager instance
	windowManager := app.NewWindowManager()
	
	// Create hotkey manager instance with dependency injection
	hotkeyManager := app.NewHotkeyManager(configManager, windowManager)
	
	// Create tray manager instance with dependency injection
	trayManager := app.NewTrayManager(configManager, serviceManager, windowManager)

	// Create application with options
	err = wails.Run(&options.App{
		Title:  "ShutDB",
		Width:  750,
		Height: 900,
		MinWidth: 600,
		MinHeight: 900,
		MaxWidth: 1200,
		MaxHeight: 1600,
		Frameless: true,
		DisableResize: false,
		HideWindowOnClose: true,
		AlwaysOnTop: false,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 44, G: 44, B: 44, A: 1}, // Match acrylic base
		OnBeforeClose: func(ctx context.Context) (prevent bool) {
			// Check if minimize to tray is enabled
			if configManager.GetMinimizeToTray() {
				// Minimize to tray instead of closing
				if err := trayManager.MinimizeToTray(); err != nil {
					log.Printf("Warning: Failed to minimize to tray on close: %v", err)
					return false // Allow normal close if tray minimize fails
				}
				return true // Prevent normal close, we minimized to tray instead
			}
			return false // Allow normal close if minimize to tray is disabled
		},
		OnStartup: func(ctx context.Context) {
			// Initialize managers in proper order for startup sequence
			
			// 1. Initialize window manager first (needed by other managers)
			windowManager.OnStartup(ctx)
			
			// 2. Initialize service manager and restore previous service state
			serviceManager.OnStartup(ctx)
			
			// Log elevation status
			log.Printf("Privilege status: %s", serviceManager.GetElevationStatus())
			
			// Show elevation status to user if not elevated
			if !serviceManager.IsElevated() {
				log.Printf("Note: Some service operations may require administrator privileges")
			}
			
			// 3. Initialize tray icon (depends on service state for context menu)
			if err := trayManager.OnStartup(ctx); err != nil {
				// Log error but don't fail startup - tray is optional
				log.Printf("Warning: Failed to initialize tray manager: %v", err)
			}
			
			// 4. Register default hotkey (depends on window manager for restoration)
			if err := hotkeyManager.OnStartup(ctx); err != nil {
				// Log error but don't fail startup - hotkey is optional
				log.Printf("Warning: Failed to initialize hotkey manager: %v", err)
			}
			
			// 5. Handle start minimized preference
			if configManager.GetStartMinimized() {
				// Minimize to tray if configured to start minimized
				if err := trayManager.MinimizeToTray(); err != nil {
					log.Printf("Warning: Failed to minimize to tray on startup: %v", err)
				}
			}
		},
		OnShutdown: func(ctx context.Context) {
			// Cleanup in reverse order of initialization
			log.Printf("Starting application shutdown cleanup...")
			
			// 1. Unregister global hotkeys first
			log.Printf("Unregistering global hotkeys...")
			hotkeyManager.OnShutdown(ctx)
			
			// 2. Clean up tray icon and system resources
			log.Printf("Cleaning up system tray...")
			trayManager.OnShutdown(ctx)
			
			// 3. Save current configuration state to persistent storage
			log.Printf("Saving configuration state...")
			if err := configManager.OnShutdown(); err != nil {
				log.Printf("Warning: Failed to save configuration during shutdown: %v", err)
			}
			
			// 4. Clean up service manager
			log.Printf("Cleaning up service manager...")
			serviceManager.OnShutdown(ctx)
			
			// 5. Window manager cleanup (last)
			log.Printf("Cleaning up window manager...")
			// No explicit cleanup needed for window manager currently
			// but we ensure tray state is reset
			if windowManager.IsMinimizedToTray() {
				log.Printf("Resetting tray minimization state...")
			}
			
			log.Printf("Application shutdown cleanup completed")
		},
		Bind: []interface{}{
			configManager,
			serviceManager,
			windowManager,
			hotkeyManager,
			trayManager,
		},
	})

	if err != nil {
		log.Fatal("Error:", err.Error())
	}
}
