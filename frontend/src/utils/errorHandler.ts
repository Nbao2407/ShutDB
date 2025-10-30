import { ErrorState, ErrorCode } from '../types/service';

/**
 * Parse error from backend and convert to user-friendly ErrorState
 */
export function parseServiceError(error: any, serviceName?: string): ErrorState {
  // If error is already a string, use it directly
  if (typeof error === 'string') {
    return {
      message: error,
      serviceName
    };
  }

  // If error is an Error object
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    
    // Check for permission denied errors
    if (errorMessage.includes('access is denied') || 
        errorMessage.includes('permission denied') ||
        errorMessage.includes('access denied')) {
      return {
        message: 'Permission denied. Please run the application as Administrator to manage services.',
        code: ErrorCode.ErrPermissionDenied,
        serviceName
      };
    }
    
    // Check for service not found errors
    if (errorMessage.includes('not found') || 
        errorMessage.includes('does not exist')) {
      return {
        message: serviceName 
          ? `Service '${serviceName}' was not found on this system.`
          : 'The requested service was not found.',
        code: ErrorCode.ErrServiceNotFound,
        serviceName
      };
    }
    
    // Check for timeout errors
    if (errorMessage.includes('timeout') || 
        errorMessage.includes('timed out')) {
      return {
        message: serviceName
          ? `Operation timed out for service '${serviceName}'. The service may be unresponsive.`
          : 'The operation timed out. Please try again.',
        code: ErrorCode.ErrOperationTimeout,
        serviceName
      };
    }
    
    // Check for invalid state errors
    if (errorMessage.includes('invalid state') || 
        errorMessage.includes('already running') ||
        errorMessage.includes('already stopped')) {
      return {
        message: serviceName
          ? `Service '${serviceName}' is already in the requested state.`
          : 'The service is already in the requested state.',
        code: ErrorCode.ErrInvalidState,
        serviceName
      };
    }
    
    // Default error message
    return {
      message: error.message,
      code: ErrorCode.ErrSystemError,
      serviceName
    };
  }

  // Fallback for unknown error types
  return {
    message: serviceName 
      ? `An unexpected error occurred with service '${serviceName}'.`
      : 'An unexpected error occurred.',
    code: ErrorCode.ErrSystemError,
    serviceName
  };
}

/**
 * Get user-friendly error message with actionable guidance
 */
export function getErrorGuidance(errorState: ErrorState): string | null {
  switch (errorState.code) {
    case ErrorCode.ErrPermissionDenied:
      return 'Right-click the application and select "Run as administrator" to manage Windows services.';
    
    case ErrorCode.ErrServiceNotFound:
      return 'Make sure the database service is installed on your system.';
    
    case ErrorCode.ErrOperationTimeout:
      return 'Check if the service is responding. You may need to restart your computer.';
    
    case ErrorCode.ErrInvalidState:
      return 'Refresh the service list to see the current status.';
    
    default:
      return null;
  }
}
