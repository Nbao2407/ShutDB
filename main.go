package main

import (
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

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "ShutDB",
		Width:  800,
		Height: 900,
		MinWidth: 800,
		MinHeight: 900,
		MaxWidth: 800,
		MaxHeight: 900,
		DisableResize: true,
		Frameless: true,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup:        serviceManager.OnStartup,
		OnShutdown:       serviceManager.OnShutdown,
		Bind: []interface{}{
			serviceManager,
		},
	})

	if err != nil {
		log.Fatal("Error:", err.Error())
	}
}
