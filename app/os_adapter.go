package app

import (
	"fmt"
	"time"

	"golang.org/x/sys/windows/svc"
	"golang.org/x/sys/windows/svc/mgr"
)

// OSService represents a service from the operating system
type OSService struct {
	Name        string
	DisplayName string
	State       svc.State
}

// OSServiceAdapter defines the interface for OS-specific service operations
type OSServiceAdapter interface {
	ListServices() ([]OSService, error)
	GetServiceStatus(name string) (ServiceStatus, error)
	GetStartupType(name string) (StartupType, error)
	StartService(name string) error
	StopService(name string) error
	RestartService(name string) error
	DisableService(name string) error
	EnableService(name string) error
}

// WindowsServiceAdapter implements OSServiceAdapter for Windows
type WindowsServiceAdapter struct {
	// No persistent connection - we'll connect per operation
}

// NewWindowsServiceAdapter creates a new Windows service adapter
func NewWindowsServiceAdapter() *WindowsServiceAdapter {
	return &WindowsServiceAdapter{}
}

// connectSCM establishes a connection to the Windows Service Control Manager
func (w *WindowsServiceAdapter) connectSCM() (*mgr.Mgr, error) {
	m, err := mgr.Connect()
	if err != nil {
		return nil, &ServiceError{
			Code:    ErrPermissionDenied,
			Message: "Failed to connect to Service Control Manager. Administrator privileges may be required.",
		}
	}
	return m, nil
}

// openService opens a specific service with proper error handling
func (w *WindowsServiceAdapter) openService(m *mgr.Mgr, name string) (*mgr.Service, error) {
	s, err := m.OpenService(name)
	if err != nil {
		return nil, &ServiceError{
			Code:    ErrServiceNotFound,
			Message: fmt.Sprintf("Service not found: %s", name),
			Service: name,
		}
	}
	return s, nil
}

// ListServices retrieves all Windows services
func (w *WindowsServiceAdapter) ListServices() ([]OSService, error) {
	m, err := w.connectSCM()
	if err != nil {
		return nil, err
	}
	defer m.Disconnect()

	// List all services
	serviceNames, err := m.ListServices()
	if err != nil {
		return nil, &ServiceError{
			Code:    ErrSystemError,
			Message: fmt.Sprintf("Failed to list services: %v", err),
		}
	}

	services := make([]OSService, 0, len(serviceNames))
	for _, name := range serviceNames {
		s, err := m.OpenService(name)
		if err != nil {
			// Skip services we can't open
			continue
		}

		// Get service status
		status, err := s.Query()
		if err != nil {
			s.Close()
			// Skip services we can't query
			continue
		}

		// Get display name from config
		config, err := s.Config()
		displayName := name
		if err == nil {
			displayName = config.DisplayName
		}

		s.Close()

		services = append(services, OSService{
			Name:        name,
			DisplayName: displayName,
			State:       status.State,
		})
	}

	return services, nil
}

// GetServiceStatus retrieves the current status of a specific service
func (w *WindowsServiceAdapter) GetServiceStatus(name string) (ServiceStatus, error) {
	m, err := w.connectSCM()
	if err != nil {
		return StatusStopped, err
	}
	defer m.Disconnect()

	s, err := w.openService(m, name)
	if err != nil {
		return StatusStopped, err
	}
	defer s.Close()

	status, err := s.Query()
	if err != nil {
		return StatusStopped, &ServiceError{
			Code:    ErrSystemError,
			Message: fmt.Sprintf("Failed to query service status: %v", err),
			Service: name,
		}
	}

	return mapWindowsStateToStatus(status.State), nil
}

// mapWindowsStateToStatus converts Windows service state to our ServiceStatus enum
func mapWindowsStateToStatus(state svc.State) ServiceStatus {
	switch state {
	case svc.Running:
		return StatusRunning
	case svc.Stopped:
		return StatusStopped
	case svc.StartPending:
		return StatusStarting
	case svc.StopPending:
		return StatusStopping
	case svc.ContinuePending, svc.PausePending, svc.Paused:
		return StatusRunning // Treat paused as running for simplicity
	default:
		return StatusStopped
	}
}

// StartService starts a Windows service with a 30-second timeout
func (w *WindowsServiceAdapter) StartService(name string) error {
	m, err := w.connectSCM()
	if err != nil {
		return err
	}
	defer m.Disconnect()

	s, err := w.openService(m, name)
	if err != nil {
		return err
	}
	defer s.Close()

	// Check current state
	status, err := s.Query()
	if err != nil {
		return &ServiceError{
			Code:    ErrSystemError,
			Message: fmt.Sprintf("Failed to query service status: %v", err),
			Service: name,
		}
	}

	// Validate state - can't start if already running or starting
	if status.State == svc.Running {
		return &ServiceError{
			Code:    ErrInvalidState,
			Message: "Service is already running",
			Service: name,
		}
	}

	if status.State == svc.StartPending {
		return &ServiceError{
			Code:    ErrInvalidState,
			Message: "Service is already starting",
			Service: name,
		}
	}

	// Start the service
	err = s.Start()
	if err != nil {
		return &ServiceError{
			Code:    ErrSystemError,
			Message: fmt.Sprintf("Failed to start service: %v", err),
			Service: name,
		}
	}

	// Wait for service to start with 30-second timeout
	timeout := time.Now().Add(30 * time.Second)
	for time.Now().Before(timeout) {
		status, err := s.Query()
		if err != nil {
			return &ServiceError{
				Code:    ErrSystemError,
				Message: fmt.Sprintf("Failed to query service status: %v", err),
				Service: name,
			}
		}

		if status.State == svc.Running {
			return nil
		}

		if status.State == svc.Stopped {
			return &ServiceError{
				Code:    ErrSystemError,
				Message: "Service failed to start",
				Service: name,
			}
		}

		time.Sleep(500 * time.Millisecond)
	}

	return &ServiceError{
		Code:    ErrOperationTimeout,
		Message: "Service start operation timed out after 30 seconds",
		Service: name,
	}
}

// StopService stops a Windows service with a 30-second timeout
func (w *WindowsServiceAdapter) StopService(name string) error {
	m, err := w.connectSCM()
	if err != nil {
		return err
	}
	defer m.Disconnect()

	s, err := w.openService(m, name)
	if err != nil {
		return err
	}
	defer s.Close()

	// Check current state
	status, err := s.Query()
	if err != nil {
		return &ServiceError{
			Code:    ErrSystemError,
			Message: fmt.Sprintf("Failed to query service status: %v", err),
			Service: name,
		}
	}

	// Validate state - can't stop if already stopped or stopping
	if status.State == svc.Stopped {
		return &ServiceError{
			Code:    ErrInvalidState,
			Message: "Service is already stopped",
			Service: name,
		}
	}

	if status.State == svc.StopPending {
		return &ServiceError{
			Code:    ErrInvalidState,
			Message: "Service is already stopping",
			Service: name,
		}
	}

	// Stop the service
	status, err = s.Control(svc.Stop)
	if err != nil {
		return &ServiceError{
			Code:    ErrSystemError,
			Message: fmt.Sprintf("Failed to stop service: %v", err),
			Service: name,
		}
	}

	// Wait for service to stop with 30-second timeout
	timeout := time.Now().Add(30 * time.Second)
	for time.Now().Before(timeout) {
		status, err := s.Query()
		if err != nil {
			return &ServiceError{
				Code:    ErrSystemError,
				Message: fmt.Sprintf("Failed to query service status: %v", err),
				Service: name,
			}
		}

		if status.State == svc.Stopped {
			return nil
		}

		time.Sleep(500 * time.Millisecond)
	}

	return &ServiceError{
		Code:    ErrOperationTimeout,
		Message: "Service stop operation timed out after 30 seconds",
		Service: name,
	}
}

// RestartService restarts a Windows service (stop then start sequence)
func (w *WindowsServiceAdapter) RestartService(name string) error {
	m, err := w.connectSCM()
	if err != nil {
		return err
	}
	defer m.Disconnect()

	s, err := w.openService(m, name)
	if err != nil {
		return err
	}
	defer s.Close()

	// Check current state
	status, err := s.Query()
	if err != nil {
		return &ServiceError{
			Code:    ErrSystemError,
			Message: fmt.Sprintf("Failed to query service status: %v", err),
			Service: name,
		}
	}

	// If service is running, stop it first
	if status.State == svc.Running || status.State == svc.StartPending {
		_, err = s.Control(svc.Stop)
		if err != nil {
			return &ServiceError{
				Code:    ErrSystemError,
				Message: fmt.Sprintf("Failed to stop service during restart: %v", err),
				Service: name,
			}
		}

		// Wait for service to stop with 30-second timeout
		timeout := time.Now().Add(30 * time.Second)
		for time.Now().Before(timeout) {
			status, err := s.Query()
			if err != nil {
				return &ServiceError{
					Code:    ErrSystemError,
					Message: fmt.Sprintf("Failed to query service status: %v", err),
					Service: name,
				}
			}

			if status.State == svc.Stopped {
				break
			}

			time.Sleep(500 * time.Millisecond)
		}

		if status.State != svc.Stopped {
			return &ServiceError{
				Code:    ErrOperationTimeout,
				Message: "Service stop operation timed out during restart",
				Service: name,
			}
		}
	}

	// Start the service
	err = s.Start()
	if err != nil {
		return &ServiceError{
			Code:    ErrSystemError,
			Message: fmt.Sprintf("Failed to start service during restart: %v", err),
			Service: name,
		}
	}

	// Wait for service to start with 30-second timeout
	timeout := time.Now().Add(30 * time.Second)
	for time.Now().Before(timeout) {
		status, err := s.Query()
		if err != nil {
			return &ServiceError{
				Code:    ErrSystemError,
				Message: fmt.Sprintf("Failed to query service status: %v", err),
				Service: name,
			}
		}

		if status.State == svc.Running {
			return nil
		}

		if status.State == svc.Stopped {
			return &ServiceError{
				Code:    ErrSystemError,
				Message: "Service failed to start during restart",
				Service: name,
			}
		}

		time.Sleep(500 * time.Millisecond)
	}

	return &ServiceError{
		Code:    ErrOperationTimeout,
		Message: "Service start operation timed out during restart",
		Service: name,
	}
}

// GetStartupType retrieves the startup type of a service
func (w *WindowsServiceAdapter) GetStartupType(name string) (StartupType, error) {
	m, err := w.connectSCM()
	if err != nil {
		return StartupDisabled, err
	}
	defer m.Disconnect()

	s, err := w.openService(m, name)
	if err != nil {
		return StartupDisabled, err
	}
	defer s.Close()

	config, err := s.Config()
	if err != nil {
		return StartupDisabled, &ServiceError{
			Code:    ErrSystemError,
			Message: fmt.Sprintf("Failed to get service configuration: %v", err),
			Service: name,
		}
	}

	switch config.StartType {
	case mgr.StartAutomatic:
		return StartupAutomatic, nil
	case mgr.StartManual:
		return StartupManual, nil
	case mgr.StartDisabled:
		return StartupDisabled, nil
	default:
		return StartupManual, nil
	}
}

// DisableService disables a Windows service (sets startup type to disabled)
func (w *WindowsServiceAdapter) DisableService(name string) error {
	m, err := w.connectSCM()
	if err != nil {
		return err
	}
	defer m.Disconnect()

	s, err := w.openService(m, name)
	if err != nil {
		return err
	}
	defer s.Close()

	// Get current config
	config, err := s.Config()
	if err != nil {
		return &ServiceError{
			Code:    ErrSystemError,
			Message: fmt.Sprintf("Failed to get service configuration: %v", err),
			Service: name,
		}
	}

	// Update config to disable the service
	config.StartType = mgr.StartDisabled
	err = s.UpdateConfig(config)
	if err != nil {
		return &ServiceError{
			Code:    ErrSystemError,
			Message: fmt.Sprintf("Failed to disable service: %v", err),
			Service: name,
		}
	}

	return nil
}

// EnableService enables a Windows service (sets startup type to manual)
func (w *WindowsServiceAdapter) EnableService(name string) error {
	m, err := w.connectSCM()
	if err != nil {
		return err
	}
	defer m.Disconnect()

	s, err := w.openService(m, name)
	if err != nil {
		return err
	}
	defer s.Close()

	// Get current config
	config, err := s.Config()
	if err != nil {
		return &ServiceError{
			Code:    ErrSystemError,
			Message: fmt.Sprintf("Failed to get service configuration: %v", err),
			Service: name,
		}
	}

	// Update config to enable the service (set to manual start)
	config.StartType = mgr.StartManual
	err = s.UpdateConfig(config)
	if err != nil {
		return &ServiceError{
			Code:    ErrSystemError,
			Message: fmt.Sprintf("Failed to enable service: %v", err),
			Service: name,
		}
	}

	return nil
}
