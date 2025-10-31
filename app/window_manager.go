package app

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// WindowManager handles window operations
type WindowManager struct {
	ctx context.Context
}

// NewWindowManager creates a new WindowManager instance
func NewWindowManager() *WindowManager {
	return &WindowManager{}
}

// OnStartup is called when the app starts
func (wm *WindowManager) OnStartup(ctx context.Context) {
	wm.ctx = ctx
}

// StartDrag initiates window dragging - for now just log
func (wm *WindowManager) StartDrag() error {
	// For frameless windows, we'll rely on CSS -webkit-app-region
	// This function exists for future platform-specific implementations
	return nil
}

// Minimize minimizes the window
func (wm *WindowManager) Minimize() {
	runtime.WindowMinimise(wm.ctx)
}

// Close closes the application
func (wm *WindowManager) Close() {
	runtime.Quit(wm.ctx)
}

// IsWindows returns true if running on Windows
func (wm *WindowManager) IsWindows() bool {
	return true
}