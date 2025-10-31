package app

import (
	"fmt"
	"syscall"
	"unsafe"
)

// PrivilegeManager handles Windows privilege elevation and checking
type PrivilegeManager struct {
	isElevated bool
	checked    bool
}

// NewPrivilegeManager creates a new privilege manager
func NewPrivilegeManager() *PrivilegeManager {
	return &PrivilegeManager{}
}

// IsElevated checks if the current process is running with administrator privileges
func (pm *PrivilegeManager) IsElevated() bool {
	if pm.checked {
		return pm.isElevated
	}
	
	pm.isElevated = pm.checkElevation()
	pm.checked = true
	return pm.isElevated
}

// checkElevation performs the actual elevation check
func (pm *PrivilegeManager) checkElevation() bool {
	// Load required Windows APIs
	advapi32 := syscall.NewLazyDLL("advapi32.dll")
	kernel32 := syscall.NewLazyDLL("kernel32.dll")
	
	procGetCurrentProcess := kernel32.NewProc("GetCurrentProcess")
	procOpenProcessToken := advapi32.NewProc("OpenProcessToken")
	procGetTokenInformation := advapi32.NewProc("GetTokenInformation")
	
	// Constants
	const (
		TOKEN_QUERY         = 0x0008
		TokenElevationType  = 18
		TokenElevationTypeFull = 2
	)
	
	// Get current process handle
	currentProcess, _, _ := procGetCurrentProcess.Call()
	
	// Open process token
	var token syscall.Handle
	ret, _, _ := procOpenProcessToken.Call(
		currentProcess,
		TOKEN_QUERY,
		uintptr(unsafe.Pointer(&token)),
	)
	
	if ret == 0 {
		return false
	}
	defer syscall.CloseHandle(token)
	
	// Get token elevation type
	var elevationType uint32
	var returnLength uint32
	
	ret, _, _ = procGetTokenInformation.Call(
		uintptr(token),
		TokenElevationType,
		uintptr(unsafe.Pointer(&elevationType)),
		unsafe.Sizeof(elevationType),
		uintptr(unsafe.Pointer(&returnLength)),
	)
	
	if ret == 0 {
		return false
	}
	
	// Check if we have full elevation
	return elevationType == TokenElevationTypeFull
}

// RequireElevation checks if the process is elevated and returns an error if not
func (pm *PrivilegeManager) RequireElevation() error {
	if !pm.IsElevated() {
		return fmt.Errorf("administrator privileges required. Please run the application as administrator")
	}
	return nil
}

// GetElevationStatus returns a user-friendly status message
func (pm *PrivilegeManager) GetElevationStatus() string {
	if pm.IsElevated() {
		return "Running with administrator privileges"
	}
	return "Running with standard user privileges"
}