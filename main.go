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
	// Create service manager instance
	serviceManager := app.NewServiceManager()
	
	// Create window manager instance
	windowManager := app.NewWindowManager()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "ShutDB",
		Width:  800,
		Height: 900,
		MinWidth: 800,
		MinHeight: 900,
		MaxWidth: 800,
		MaxHeight: 900,
		Frameless: true,
		DisableResize: true,
		HideWindowOnClose: false,
		AlwaysOnTop: false,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 44, G: 44, B: 44, A: 1}, // Match acrylic base
		OnStartup: func(ctx context.Context) {
			serviceManager.OnStartup(ctx)
			windowManager.OnStartup(ctx)
		},
		OnShutdown: serviceManager.OnShutdown,
		Bind: []interface{}{
			serviceManager,
			windowManager,
		},
	})

	if err != nil {
		log.Fatal("Error:", err.Error())
	}
}
