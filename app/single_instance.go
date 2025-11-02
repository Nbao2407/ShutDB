package app

import (
	"log"
	"syscall"
	"unsafe"

	"golang.org/x/sys/windows"
)

const (
	// Unique mutex name for ShutDB application
	SHUTDB_MUTEX_NAME = "Global\\ShutDB_SingleInstance_Mutex"
	// Window class name for finding existing instances
	SHUTDB_WINDOW_CLASS = "ShutDB_MainWindow"
	// Custom message for inter-process communication
	WM_SHUTDB_RESTORE = 0x0400 + 1 // WM_USER + 1
	// Windows constants
	SW_RESTORE         = 9
	MB_OK              = 0x00000000
	MB_ICONINFORMATION = 0x00000040
)

var (
	user32DLL               = windows.NewLazySystemDLL("user32.dll")
	kernel32DLL             = windows.NewLazySystemDLL("kernel32.dll")
	procFindWindow          = user32DLL.NewProc("FindWindowW")
	procSetForegroundWindow = user32DLL.NewProc("SetForegroundWindow")
	procShowWindow          = user32DLL.NewProc("ShowWindow")
	procIsIconic            = user32DLL.NewProc("IsIconic")
	procSendMessage         = user32DLL.NewProc("SendMessageW")
	procMessageBox          = user32DLL.NewProc("MessageBoxW")
	procCreateMutex         = kernel32DLL.NewProc("CreateMutexW")
	procReleaseMutex        = kernel32DLL.NewProc("ReleaseMutex")
	procCloseHandle         = kernel32DLL.NewProc("CloseHandle")
)

// SingleInstanceManager handles single instance enforcement
type SingleInstanceManager struct {
	mutexHandle syscall.Handle
	appTitle    string
}

// NewSingleInstanceManager creates a new single instance manager
func NewSingleInstanceManager(appTitle string) *SingleInstanceManager {
	return &SingleInstanceManager{
		appTitle: appTitle,
	}
}

// TryAcquireLock attempts to acquire the singleton lock
// Returns true if successful (first instance), false if another instance exists
func (sim *SingleInstanceManager) TryAcquireLock() bool {
	mutexName, _ := syscall.UTF16PtrFromString(SHUTDB_MUTEX_NAME)

	ret, _, err := procCreateMutex.Call(
		0,                                  // lpMutexAttributes
		1,                                  // bInitialOwner
		uintptr(unsafe.Pointer(mutexName)), // lpName
	)

	if ret == 0 {
		log.Printf("Failed to create mutex: %v", err)
		return false
	}

	sim.mutexHandle = syscall.Handle(ret)

	// Check if mutex already existed
	if err.(syscall.Errno) == windows.ERROR_ALREADY_EXISTS {
		log.Printf("Another instance of %s is already running", sim.appTitle)
		sim.notifyExistingInstance()
		sim.ReleaseLock()
		return false
	}

	log.Printf("Successfully acquired singleton lock for %s", sim.appTitle)
	return true
}

// notifyExistingInstance attempts to bring the existing instance to foreground
func (sim *SingleInstanceManager) notifyExistingInstance() {
	// Try to find window by title first
	windowTitle, _ := syscall.UTF16PtrFromString(sim.appTitle)
	hwnd, _, _ := procFindWindow.Call(0, uintptr(unsafe.Pointer(windowTitle)))

	if hwnd == 0 {
		// If not found by title, try by class name (if implemented)
		className, _ := syscall.UTF16PtrFromString(SHUTDB_WINDOW_CLASS)
		hwnd, _, _ = procFindWindow.Call(uintptr(unsafe.Pointer(className)), 0)
	}

	if hwnd != 0 {
		log.Printf("Found existing window, attempting to restore and focus")
		sim.restoreAndFocusWindow(hwnd)
	} else {
		log.Printf("Could not find existing window to restore")
		sim.showAlreadyRunningMessage()
	}
}

// restoreAndFocusWindow restores a minimized window and brings it to foreground
func (sim *SingleInstanceManager) restoreAndFocusWindow(hwnd uintptr) {
	// Check if window is minimized
	isMinimized, _, _ := procIsIconic.Call(hwnd)

	if isMinimized != 0 {
		// Restore window from minimized state
		procShowWindow.Call(hwnd, SW_RESTORE)
		log.Printf("Restored minimized window")
	}

	// Send custom message to existing instance
	procSendMessage.Call(hwnd, WM_SHUTDB_RESTORE, 0, 0)

	// Bring window to foreground
	ret, _, _ := procSetForegroundWindow.Call(hwnd)
	if ret != 0 {
		log.Printf("Successfully brought existing window to foreground")
	} else {
		log.Printf("Failed to bring window to foreground, window may already be active")
	}
}

// showAlreadyRunningMessage displays a message to the user
func (sim *SingleInstanceManager) showAlreadyRunningMessage() {
	title, _ := syscall.UTF16PtrFromString("ShutDB - Already Running")
	message, _ := syscall.UTF16PtrFromString(
		"ShutDB is already running.\n\n" +
			"Please check your system tray or taskbar for the existing instance.\n" +
			"Only one instance of ShutDB can run at a time.")

	procMessageBox.Call(
		0, // hwnd (no parent window)
		uintptr(unsafe.Pointer(message)),
		uintptr(unsafe.Pointer(title)),
		MB_OK|MB_ICONINFORMATION,
	)
}

// ReleaseLock releases the singleton mutex
func (sim *SingleInstanceManager) ReleaseLock() {
	if sim.mutexHandle != 0 {
		procReleaseMutex.Call(uintptr(sim.mutexHandle))
		procCloseHandle.Call(uintptr(sim.mutexHandle))
		sim.mutexHandle = 0
		log.Printf("Released singleton lock")
	}
}

// IsLocked returns true if the singleton lock is currently held
func (sim *SingleInstanceManager) IsLocked() bool {
	return sim.mutexHandle != 0
}

// GetMutexName returns the mutex name used for singleton enforcement
func (sim *SingleInstanceManager) GetMutexName() string {
	return SHUTDB_MUTEX_NAME
}
