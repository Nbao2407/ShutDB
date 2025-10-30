package app

import "fmt"

// ErrorCode represents specific error types for service operations
type ErrorCode int

const (
	ErrPermissionDenied ErrorCode = iota
	ErrServiceNotFound
	ErrOperationTimeout
	ErrInvalidState
	ErrSystemError
)

// ServiceError represents an error that occurred during a service operation
type ServiceError struct {
	Code    ErrorCode
	Message string
	Service string
}

// Error implements the error interface for ServiceError
func (e *ServiceError) Error() string {
	if e.Service != "" {
		return fmt.Sprintf("service '%s': %s", e.Service, e.Message)
	}
	return e.Message
}
