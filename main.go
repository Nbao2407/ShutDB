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
		Title:  "Service Database Dashboard",
		Width:  1000,
		Height: 800,
		MinWidth: 1000,
		MinHeight: 800,
		MaxWidth: 1000,
		MaxHeight: 800,
		DisableResize: true,
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
