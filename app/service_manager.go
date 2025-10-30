package app

import (
	"context"
	"time"
)

// ServiceManager orchestrates service operations
type ServiceManager struct {
	ctx      context.Context
	detector ServiceDetector
	adapter  OSServiceAdapter
	cache    *ServiceCache
}

// NewServiceManager creates a new ServiceManager instance with dependency injection
func NewServiceManager() *ServiceManager {
	// Initialize dependencies
	adapter := NewWindowsServiceAdapter()
	detector := NewWindowsServiceDetector(adapter)
	cache := NewServiceCache(5 * time.Second) // 5-second TTL as per requirements

	return &ServiceManager{
		detector: detector,
		adapter:  adapter,
		cache:    cache,
	}
}

// OnStartup is called when the app starts
func (sm *ServiceManager) OnStartup(ctx context.Context) {
	sm.ctx = ctx
}

// OnShutdown is called when the app closes
func (sm *ServiceManager) OnShutdown(ctx context.Context) {
	// Clear cache on shutdown
	if sm.cache != nil {
		sm.cache.Clear()
	}
}

// GetServices returns all detected database services with caching
func (sm *ServiceManager) GetServices() ([]Service, error) {
	// Check if cache is valid
	if !sm.cache.IsExpired() {
		// Return cached services
		return sm.cache.GetAll(), nil
	}

	// Cache miss or expired - query OS
	services, err := sm.detector.DetectServices()
	if err != nil {
		return nil, err
	}

	// Update cache with fresh results
	sm.cache.SetAll(services)

	// Return services to frontend
	return services, nil
}

// StartService starts a database service
func (sm *ServiceManager) StartService(name string) error {
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
