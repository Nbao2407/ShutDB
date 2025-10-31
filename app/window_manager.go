package app

import (
	"context"

	"github.com/wailsapp/wails/v2/pkg/runtime"
)

// WindowManager handles window operations
type WindowManager struct {
	ctx              context.Context
	isMinimizedToTray bool
}

// NewWindowManager creates a new WindowManager instance
func NewWindowManager() *WindowManager {
	return &WindowManager{
		isMinimizedToTray: false,
	}
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

// Minimize minimizes the window to taskbar (not tray)
func (wm *WindowManager) Minimize() {
	runtime.WindowMinimise(wm.ctx)
	// Regular minimize doesn't affect tray state
}

// Close closes the application
func (wm *WindowManager) Close() {
	runtime.Quit(wm.ctx)
}

// IsWindows returns true if running on Windows
func (wm *WindowManager) IsWindows() bool {
	return true
}

// MinimizeToTray minimizes the application to the system tray
func (wm *WindowManager) MinimizeToTray() error {
	// Hide the window instead of minimizing to taskbar
	runtime.WindowHide(wm.ctx)
	wm.isMinimizedToTray = true
	return nil
}

// RestoreFromTray restores the application window from the system tray
func (wm *WindowManager) RestoreFromTray() error {
	// Show and focus the window
	runtime.WindowShow(wm.ctx)
	runtime.WindowSetAlwaysOnTop(wm.ctx, true)
	runtime.WindowSetAlwaysOnTop(wm.ctx, false) // This brings it to front
	wm.isMinimizedToTray = false
	return nil
}

// IsMinimizedToTray returns whether the window is currently hidden (minimized to tray)
func (wm *WindowManager) IsMinimizedToTray() bool {
	return wm.isMinimizedToTray
}

// IsVisible returns whether the window is currently visible (not minimized to tray)
func (wm *WindowManager) IsVisible() bool {
	return !wm.isMinimizedToTray
}

// ToggleVisibility toggles between showing and hiding the window
func (wm *WindowManager) ToggleVisibility() error {
	if wm.isMinimizedToTray {
		return wm.RestoreFromTray()
	} else {
		return wm.MinimizeToTray()
	}
}