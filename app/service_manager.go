package app

import (
	"context"
	"time"
)

// ServiceManager orchestrates service operations
type ServiceManager struct {
	ctx              context.Context
	detector         ServiceDetector
	adapter          OSServiceAdapter
	cache            *ServiceCache
	configManager    *ConfigManager
	privilegeManager *PrivilegeManager
	elevationChecked bool
}

// NewServiceManager creates a new ServiceManager instance with dependency injection
func NewServiceManager(configManager *ConfigManager) *ServiceManager {
	// Initialize dependencies
	adapter := NewWindowsServiceAdapter()
	detector := NewWindowsServiceDetector(adapter)
	cache := NewServiceCache(5 * time.Second) // 5-second TTL as per requirements
	privilegeManager := NewPrivilegeManager()

	return &ServiceManager{
		detector:         detector,
		adapter:          adapter,
		cache:            cache,
		configManager:    configManager,
		privilegeManager: privilegeManager,
	}
}

// OnStartup is called when the app starts
func (sm *ServiceManager) OnStartup(ctx context.Context) {
	sm.ctx = ctx
	
	// Check elevation status once at startup
	sm.checkElevationStatus()
	
	// Initialize service control state from persistent storage
	sm.initializeServiceState()
}

// checkElevationStatus checks if we have the required privileges for service operations
func (sm *ServiceManager) checkElevationStatus() {
	sm.elevationChecked = true
	
	// Check if we have administrator privileges
	if !sm.privilegeManager.IsElevated() {
		// Log that we don't have elevation - services will be read-only
		// In a production app, this would go to a proper logger
		// The UI will show an appropriate message to the user
	}
}

// initializeServiceState initializes the service control state from persistent storage
func (sm *ServiceManager) initializeServiceState() {
	if sm.configManager == nil {
		return
	}
	
	// Service state is automatically loaded from persistent storage by ConfigManager
	// No additional initialization needed as GetServiceState() reads from loaded config
}

// OnShutdown is called when the app closes
func (sm *ServiceManager) OnShutdown(ctx context.Context) {
	// Clear cache on shutdown to free memory
	if sm.cache != nil {
		sm.cache.Clear()
	}
	
	// Clear context reference
	sm.ctx = nil
}

// IsServiceControlEnabled returns whether service control functionality is enabled
func (sm *ServiceManager) IsServiceControlEnabled() bool {
	if sm.configManager == nil {
		return true // Default to enabled if no config manager
	}
	return sm.configManager.GetServiceState()
}

// EnableServiceControl enables the service control functionality
func (sm *ServiceManager) EnableServiceControl() error {
	if sm.configManager == nil {
		return &ServiceError{
			Code:    ErrInvalidState,
			Message: "Configuration manager not available",
		}
	}
	return sm.configManager.SetServiceState(true)
}

// DisableServiceControl disables the service control functionality
func (sm *ServiceManager) DisableServiceControl() error {
	if sm.configManager == nil {
		return &ServiceError{
			Code:    ErrInvalidState,
			Message: "Configuration manager not available",
		}
	}
	return sm.configManager.SetServiceState(false)
}

// ToggleServiceControl toggles the service control functionality
func (sm *ServiceManager) ToggleServiceControl() (bool, error) {
	if sm.configManager == nil {
		return false, &ServiceError{
			Code:    ErrInvalidState,
			Message: "Configuration manager not available",
		}
	}
	
	currentState := sm.configManager.GetServiceState()
	newState := !currentState
	
	err := sm.configManager.SetServiceState(newState)
	if err != nil {
		return currentState, err
	}
	
	return newState, nil
}

// GetServiceControlState returns the current service control state
func (sm *ServiceManager) GetServiceControlState() bool {
	return sm.IsServiceControlEnabled()
}

// GetPrivilegeInfo returns information about current privilege level
func (sm *ServiceManager) GetPrivilegeInfo() map[string]interface{} {
	return map[string]interface{}{
		"isElevated":     sm.IsElevated(),
		"statusMessage":  sm.GetElevationStatus(),
		"canControlServices": sm.IsElevated() && sm.IsServiceControlEnabled(),
	}
}

// SetServiceControlState sets the service control state
func (sm *ServiceManager) SetServiceControlState(enabled bool) error {
	if sm.configManager == nil {
		return &ServiceError{
			Code:    ErrInvalidState,
			Message: "Configuration manager not available",
		}
	}
	return sm.configManager.SetServiceState(enabled)
}

// IsElevated returns whether the application is running with administrator privileges
func (sm *ServiceManager) IsElevated() bool {
	return sm.privilegeManager.IsElevated()
}

// GetElevationStatus returns a user-friendly elevation status message
func (sm *ServiceManager) GetElevationStatus() string {
	return sm.privilegeManager.GetElevationStatus()
}

// RequireElevationForOperation checks if elevation is required for service operations
func (sm *ServiceManager) RequireElevationForOperation() error {
	if !sm.IsServiceControlEnabled() {
		return &ServiceError{
			Code:    ErrInvalidState,
			Message: "Service control is disabled",
		}
	}
	
	if !sm.privilegeManager.IsElevated() {
		return &ServiceError{
			Code:    ErrPermissionDenied,
			Message: "Administrator privileges are required for service operations. Please restart the application as administrator.",
		}
	}
	
	return nil
}

// GetServices returns all detected database services with caching
func (sm *ServiceManager) GetServices() ([]Service, error) {
	// Check if service control is enabled
	if !sm.IsServiceControlEnabled() {
		return []Service{}, &ServiceError{
			Code:    ErrInvalidState,
			Message: "Service control is disabled",
		}
	}

	// Check if cache is valid
	if !sm.cache.IsExpired() {
		// Return cached services
		return sm.cache.GetAll(), nil
	}

	// For listing services, we can try without elevation first
	// If it fails due to permissions, we'll return a helpful error
	services, err := sm.detector.DetectServices()
	if err != nil {
		// Check if this is a permission error
		if serviceErr, ok := err.(*ServiceError); ok && serviceErr.Code == ErrPermissionDenied {
			// Return a more helpful error message
			return nil, &ServiceError{
				Code:    ErrPermissionDenied,
				Message: "Administrator privileges are required to access service information. Please restart the application as administrator.",
			}
		}
		return nil, err
	}

	// Update cache with fresh results
	sm.cache.SetAll(services)

	// Return services to frontend
	return services, nil
}

// StartService starts a database service
func (sm *ServiceManager) StartService(name string) error {
	// Check elevation before attempting service operations
	if err := sm.RequireElevationForOperation(); err != nil {
		return err
	}

	// Validate state by checking current status
	status, err := sm.adapter.GetServiceStatus(name)
	if err != nil {
		return err
	}

	// Check if service is already running or starting
	if status == StatusRunning {
		return &ServiceError{
			Code:    ErrInvalidState,
			Message: "Service is already running",
			Service: name,
		}
	}

	if status == StatusStarting {
		return &ServiceError{
			Code:    ErrInvalidState,
			Message: "Service is already starting",
			Service: name,
		}
	}

	// Call adapter to start the service
	err = sm.adapter.StartService(name)
	if err != nil {
		return err
	}

	// Invalidate cache after successful operation
	sm.cache.Clear()

	return nil
}

// StopService stops a database service
func (sm *ServiceManager) StopService(name string) error {
	// Check elevation before attempting service operations
	if err := sm.RequireElevationForOperation(); err != nil {
		return err
	}

	// Validate state by checking current status
	status, err := sm.adapter.GetServiceStatus(name)
	if err != nil {
		return err
	}

	// Check if service is already stopped or stopping
	if status == StatusStopped {
		return &ServiceError{
			Code:    ErrInvalidState,
			Message: "Service is already stopped",
			Service: name,
		}
	}

	if status == StatusStopping {
		return &ServiceError{
			Code:    ErrInvalidState,
			Message: "Service is already stopping",
			Service: name,
		}
	}

	// Call adapter to stop the service
	err = sm.adapter.StopService(name)
	if err != nil {
		return err
	}

	// Invalidate cache after successful operation
	sm.cache.Clear()

	return nil
}

// RestartService restarts a database service
func (sm *ServiceManager) RestartService(name string) error {
	// Check elevation before attempting service operations
	if err := sm.RequireElevationForOperation(); err != nil {
		return err
	}

	// Call adapter to restart the service
	err := sm.adapter.RestartService(name)
	if err != nil {
		return err
	}

	// Invalidate cache after successful operation
	sm.cache.Clear()

	return nil
}

// GetServiceStatus returns the current status of a service
func (sm *ServiceManager) GetServiceStatus(name string) (string, error) {
	// Check if service control is enabled
	if !sm.IsServiceControlEnabled() {
		return string(StatusStopped), &ServiceError{
			Code:    ErrInvalidState,
			Message: "Service control is disabled",
			Service: name,
		}
	}

	// Query adapter for current service status
	status, err := sm.adapter.GetServiceStatus(name)
	if err != nil {
		return string(StatusStopped), err
	}

	// Update cache with latest status
	if cachedService, exists := sm.cache.Get(name); exists {
		cachedService.Status = status
		sm.cache.Set(name, cachedService)
	}

	// Return status to frontend
	return string(status), nil
}

// EnableService enables a database service (sets startup type to manual)
func (sm *ServiceManager) EnableService(name string) error {
	// Check elevation before attempting service operations
	if err := sm.RequireElevationForOperation(); err != nil {
		return err
	}

	// Call adapter to enable the service
	err := sm.adapter.EnableService(name)
	if err != nil {
		return err
	}

	// Invalidate cache after successful operation
	sm.cache.Clear()

	return nil
}

// DisableService disables a database service (sets startup type to disabled)
func (sm *ServiceManager) DisableService(name string) error {
	// Check elevation before attempting service operations
	if err := sm.RequireElevationForOperation(); err != nil {
		return err
	}

	// Call adapter to disable the service
	err := sm.adapter.DisableService(name)
	if err != nil {
		return err
	}

	// Invalidate cache after successful operation
	sm.cache.Clear()

	return nil
}
