# Implementation Plan

- [ ] 1. Initialize Wails project with Vite/React-TS template

  - Run `wails init -n service-db-dashboard -t vite-ts` to create project structure
  - Configure wails.json with application metadata (name, version, window dimensions)
  - Verify project builds successfully with `wails build`
  - _Requirements: 5.3, 5.4_

- [x] 2. Implement backend data models and types

  - [x] 2.1 Create Service model with status and type enums

    - Define Service struct with Name, DisplayName, Status, Type fields in `app/models.go`
    - Create ServiceStatus constants (running, stopped, starting, stopping, restarting)
    - Create ServiceType constants (postgresql, mongodb)
    - Add JSON tags for frontend serialization
    - _Requirements: 1.2, 1.4, 1.5_

  - [x] 2.2 Create error types for service operations

    - Define ServiceError struct with Code, Message, Service fields in `app/errors.go`
    - Create ErrorCode constants (ErrPermissionDenied, ErrServiceNotFound, ErrOperationTimeout, ErrInvalidState, ErrSystemError)
    - Implement Error() method for ServiceError
    - _Requirements: 2.4, 3.4, 4.4, 7.3_

- [x] 3. Implement Windows Service Control Manager adapter

  - [x] 3.1 Create OS service adapter interface and Windows implementation

    - Define OSServiceAdapter interface in `app/os_adapter.go` with ListServices, GetServiceStatus, StartService, StopService, RestartService methods
    - Implement WindowsServiceAdapter struct using `golang.org/x/sys/windows/svc` and `golang.org/x/sys/windows/svc/mgr`
    - Add connection management to Windows SCM with proper cleanup
    - _Requirements: 7.1, 7.2, 7.4, 7.5_

  - [x] 3.2 Implement service listing functionality

    - Write ListServices method to query all Windows services
    - Map Windows service states to ServiceStatus enum

    - Handle permission errors and return ErrPermissionDenied when appropriate
    - _Requirements: 1.1, 7.3_

  - [x] 3.3 Implement service control operations

    - Write StartService method with 30-second timeout
    - Write StopService method with 30-second timeout
    - Write RestartService method (stop then start sequence)
    - Add state validation before operations
    - Handle all error cases (not found, timeout, permission denied)
    - _Requirements: 2.1, 2.2, 3.1, 3.2, 4.1, 4.2_

-

- [x] 4. Implement service detection logic

  - [x] 4.1 Create service detector with pattern matching

    - Define ServiceDetector interface in `app/detector.go`
    - Implement WindowsServiceDetector with service name patterns for PostgreSQL and MongoDB
    - Write DetectServices method that filters OS services by known patterns
    - Map detected services to Service model with appropriate ServiceType

    - _Requirements: 1.1, 1.4, 1.5, 7.4, 7.5_

- [ ] 5. Implement service cache for performance optimization

  - [ ] 5.1 Create in-memory cache with TTL

    - Implement ServiceCache struct in `app/cache.go` with map storage and sync.RWMutex

    - Add 5-second TTL configuration

    - Write Get, Set, IsExpired, Clear methods
    - Ensure thread-safe operations
    - _Requirements: 5.2, 1.3_

- [x] 6. Implement Service Manager orchestration layer

  - [x] 6.1 Create ServiceManager with dependency injection

    - Implement ServiceManager struct in `app/service_manager.go` with detector, adapter, and cache fields
    - Write constructor function that initializes all dependencies

    - Add Wails lifecycle hooks (OnStartup, OnShutdown)
    - _Requirements: 1.1, 5.3_

  - [x] 6.2 Implement GetServices method with caching

    - Check cache validity before querying OS
    - Call detector.DetectServices() on cache miss or expiration

    - Update cache with fresh results
    - Return cached services to frontend
    - _Requirements: 1.1, 1.2, 5.2_

  - [x] 6.3 Implement service control methods

    - Write StartService method that validates state and calls adapter
    - Write StopService method that validates state and calls adapter
    - Write RestartService method that calls adapter
    - Invalidate cache after successful operations
    - Add proper error propagation to frontend
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4_

  - [x] 6.4 Implement GetServiceStatus method

    - Query adapter for current service status
    - Update cache with latest status

    - Return status to frontend

    - _Requirements: 1.3_

- [x] 7. Wire up Wails application entry point

  - [x] 7.1 Configure main.go with ServiceManager binding

    - Create ServiceManager instance in `main.go`
    - Bind ServiceManager to Wails app context
    - Configure application window (800x600, min 600x400)
    - Set application title and metadata
    - _Requirements: 5.3, 5.4, 6.1_

  -

  - [x] 7.2 Generate Wails bindings for frontend

    - Run `wails generate module` to create TypeScript bindings
    - Verify generated files in `frontend/src/wailsjs/go/app/`
    - _Requirements: 1.1, 2.1, 3.1, 4.1_

-

- [x] 8. Implement frontend TypeScript types and interfaces

  - [x] 8.1 Create frontend data models

    - Define Service interface in `frontend/src/types/service.ts` matching backend model
    - Create ServiceStatus and ServiceType type unions
    - Define ErrorState interface for error handling
    - _Requirements: 1.2, 2.4, 3.4, 4.4_

- [x] 9. Implement ServiceRow component

  - [x] 9.1 Create ServiceRow component with controls

    - Build ServiceRow component in `frontend/src/components/ServiceRow.tsx`
    - Display service name, display name, and status badge
    - Add Start, Stop, Restart buttons with appropriate enabled/disabled states
    - Implement color-coded status indicator (green=running, red=stopped, yellow=transitioning)
    - Add loading state during operations
    - Disable buttons during transitions (starting, stopping, restarting)
    - _Requirements: 2.5, 3.5, 4.5, 6.2, 6.3, 6.5_

  - [x] 9.2 Add CSS styling for ServiceRow

    - Create `frontend/src/components/ServiceRow.module.css` with minimal styles
    - Style service row layout (flexbox for horizontal arrangement)
    - Style status badges with color coding
    - Style buttons with hover and disabled states
    - Keep styles lightweight (no external CSS libraries)
    - _Requirements: 5.4, 6.2, 6.3_

- [x] 10. Implement ServiceList component

  - [x] 10.1 Create ServiceList component

    - Build ServiceList component in `frontend/src/components/ServiceList.tsx`
    - Render array of ServiceRow components
    - Handle empty state (no services detected)
    - Add scrollable container for service list
    - Pass action callbacks (onStart, onStop, onRestart) to ServiceRow
    - _Requirements: 1.2, 6.4_

  - [x] 10.2 Add CSS styling for ServiceList

    - Create `frontend/src/components/ServiceList.module.css`
    - Style scrollable container with max-height
    - Style empty state message
    - _Requirements: 5.4, 6.4_

- [ ] 11. Implement App component with state management

  - [x] 11.1 Create App component with service state

    - Implement App component in `frontend/src/App.tsx` with services, loading, error state
    - Add useEffect hook to load services on mount
    - Call GetServices from Wails bindings
    - Handle loading and error states
    - _Requirements: 1.1, 1.2, 6.5_

  - [x] 11.2 Implement service control handlers

    - Write handleStart function that calls StartService binding
    - Write handleStop function that calls StopService binding

    - Write handleRestart function that calls RestartService binding
    - Add optimistic UI updates (set transitioning status immediately)
    - Refresh service list after operations complete
    - Handle errors and display error messages
    - _Requirements: 2.1, 2.4, 2.5, 3.1, 3.4, 3.5, 4.1, 4.4, 4.5_

  - [x] 11.3 Implement polling mechanism

    - Create useEffect hook with 5-second interval for polling
    - Call GetServices periodically to refresh status
    - Implement adaptive polling (2 seconds during operations, 5 seconds idle)
    - Pause polling when window is hidden (use document.visibilityState)
    - Clear interval on component unmount
    - _Requirements: 1.3, 5.2, 5.5_

  - [x] 11.4 Add error handling and user feedback

    - Display user-friendly error messages

    - Display user-friendly error messages
    - Show permission error with guidance to run as administrator
    - Add error dismissal functionality
    - Implement visual feedback within 200ms of interactions
    - _Requirements: 2.4, 3.4, 4.4, 6.5, 7.3_

- [ ] 12. Style the main application

  - [x] 12.1 Create minimal global styles

    - Update `frontend/src/App.css` with lightweight global styles
    - Set application background and text colors
    - Define consistent spacing and typography
    - Keep total CSS under 5KB for performance
    - _Requirements: 5.4, 6.1_

- [ ] 13. Build and verify application

  - [x] 13.1 Build production executable

    - Run `wails build` to create production executable
    - Verify executable size is under 15MB

    - Test executable runs without dependencies
    - _Requirements: 5.1, 5.3, 5.4_

  - [x] 13.2 Verify memory usage requirements

    - Launch application and monitor RAM usage in Task Manager
    - Verify idle RAM usage is under 50MB
    - Test with multiple services detected

    - Verify memory stays stable during polling
    - _Requirements: 5.1, 5.2, 5.5_

  - [x] 13.3 Manual testing of core functionality




    - Test service detection with PostgreSQL and MongoDB installed
    - Test Start operation on stopped service
    - Test Stop operation on running service
    - Test Restart operation
    - Verify status updates within 2 seconds

    - Test error handling without administrator privileges
    - Test with no database services installed
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 7.1, 7.2, 7.3, 7.4, 7.5_
