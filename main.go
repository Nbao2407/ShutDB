package main

import (
	"context"
	"embed"
	"log"

	"service-db-dashboard/app"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
	"github.com/wailsapp/wails/v2/pkg/options/windows"
)

//go:embed all:frontend/dist
var assets embed.FS

var (
	singleInstanceManager *app.SingleInstanceManager
)

func main() {
	// Initialize single instance manager
	singleInstanceManager = app.NewSingleInstanceManager("ShutDB")

	// Check if another instance is already running
	if !singleInstanceManager.TryAcquireLock() {
		log.Fatal("ShutDB is already running. Only one instance is allowed.")
	}

	// Ensure proper cleanup on exit
	defer func() {
		if singleInstanceManager != nil {
			singleInstanceManager.ReleaseLock()
		}
	}()

	configManager, err := app.NewConfigManager()
	if err != nil {
		log.Fatal("Failed to create config manager:", err.Error())
	}

	serviceManager := app.NewServiceManager(configManager)

	windowManager := app.NewWindowManager()

	hotkeyManager := app.NewHotkeyManager(configManager, windowManager)

	trayManager := app.NewTrayManager(configManager, serviceManager, windowManager)

	err = wails.Run(&options.App{
		Title:             "ShutDB",
		Width:             600,
		Height:            900,
		MinWidth:          600,
		MinHeight:         900,
		MaxWidth:          1200,
		MaxHeight:         1600,
		Frameless:         true,
		DisableResize:     false,
		HideWindowOnClose: true,
		AlwaysOnTop:       false,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 0, G: 0, B: 0, A: 0},
		Windows: &windows.Options{
			WebviewIsTransparent: true,
			WindowIsTranslucent:  true,
			BackdropType:         windows.Acrylic,
			WebviewUserDataPath:  "",
		},
		OnBeforeClose: func(ctx context.Context) (prevent bool) {
			if trayManager.IsForceExit() {
				log.Printf("Force exit requested, terminating application")
				return false
			}

			if configManager.GetMinimizeToTray() {
				if err := trayManager.MinimizeToTray(); err != nil {
					log.Printf("Warning: Failed to minimize to tray on close: %v", err)
					return false
				}
				return true
			}
			return false
		},
		OnStartup: func(ctx context.Context) {
			windowManager.OnStartup(ctx)

			serviceManager.OnStartup(ctx)

			log.Printf("Privilege status: %s", serviceManager.GetElevationStatus())

			if !serviceManager.IsElevated() {
				log.Printf("Note: Some service operations may require administrator privileges")
			}

			if err := trayManager.OnStartup(ctx); err != nil {
				log.Printf("Warning: Failed to initialize tray manager: %v", err)
			}

			if err := hotkeyManager.OnStartup(ctx); err != nil {
				log.Printf("Warning: Failed to initialize hotkey manager: %v", err)
			}

			if configManager.GetStartMinimized() {
				if err := trayManager.MinimizeToTray(); err != nil {
					log.Printf("Warning: Failed to minimize to tray on startup: %v", err)
				}
			}
		},
		OnShutdown: func(ctx context.Context) {
			log.Printf("Starting application shutdown cleanup...")

			log.Printf("Unregistering global hotkeys...")
			hotkeyManager.OnShutdown(ctx)

			log.Printf("Cleaning up system tray...")
			trayManager.OnShutdown(ctx)

			log.Printf("Saving configuration state...")
			if err := configManager.OnShutdown(); err != nil {
				log.Printf("Warning: Failed to save configuration during shutdown: %v", err)
			}

			log.Printf("Cleaning up service manager...")
			serviceManager.OnShutdown(ctx)

			log.Printf("Cleaning up window manager...")
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
