import { useState, useEffect, useMemo } from "react";
import {
  GetServices,
  StartService,
  StopService,
  RestartService,
} from "./wailsjs/go/app/ServiceManager";
import {
  Service,
  ServiceStatus,
  ErrorState,
} from "./types/service";
import { parseServiceError } from "./utils/errorHandler";
import ErrorNotification from "./components/ErrorNotification";
import { HierarchicalServiceTable } from "./components/HierarchicalServiceTable";
import { SearchAndFilter } from "./components/SearchAndFilter";
import { FluentIcons } from "./components/FluentIcons";
import { ServiceControlToggle } from "./components/ServiceControlToggle";

import { WindowControls } from "./components/WindowControls";
import { SettingsModal } from "./components/SettingsModal";

import "./App.css";

interface AppState {
  services: Service[];
  loading: boolean;
  error: ErrorState | null;
}


function App() {
  const [state, setState] = useState<AppState>({
    services: [],
    loading: true,
    error: null,
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Table state
  const [isTableDisabled, setIsTableDisabled] = useState(false);
  const [disabledServices, setDisabledServices] = useState<Set<string>>(new Set());
  
  // Settings modal state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  


  // Load services function
  const loadServices = async () => {
    try {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      const services = await GetServices();
      setState({
        services: services as Service[],
        loading: false,
        error: null,
      });
    } catch (err) {
      const errorState = parseServiceError(err);
      setState({
        services: [],
        loading: false,
        error: errorState,
      });
    }
  };

  // Dismiss error notification
  const dismissError = () => {
    setState((prev) => ({ ...prev, error: null }));
  };

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, []);

  // Helper function to update service status optimistically
  const updateServiceStatus = (serviceName: string, status: ServiceStatus) => {
    setState((prev) => ({
      ...prev,
      services: prev.services.map((service) =>
        service.Name === serviceName ? { ...service, Status: status } : service
      ),
    }));
  };

  // Handle start service
  const handleStart = async (serviceName: string) => {
    // Check if service is individually disabled
    if (disabledServices.has(serviceName)) {
      return;
    }

    try {
      // Optimistic UI update
      updateServiceStatus(serviceName, "starting");

      // Call backend
      await StartService(serviceName);

      // Refresh service list after operation completes
      await loadServices();
    } catch (err) {
      // Parse error and show user-friendly message
      const errorState = parseServiceError(err, serviceName);
      setState((prev) => ({
        ...prev,
        error: errorState,
      }));

      // Refresh to get actual state
      await loadServices();
    }
  };

  // Handle stop service
  const handleStop = async (serviceName: string) => {
    // Check if service is individually disabled
    if (disabledServices.has(serviceName)) {
      return;
    }

    try {
      // Optimistic UI update
      updateServiceStatus(serviceName, "stopping");

      // Call backend
      await StopService(serviceName);

      // Refresh service list after operation completes
      await loadServices();
    } catch (err) {
      // Parse error and show user-friendly message
      const errorState = parseServiceError(err, serviceName);
      setState((prev) => ({
        ...prev,
        error: errorState,
      }));

      // Refresh to get actual state
      await loadServices();
    }
  };

  // Handle restart service
  const handleRestart = async (serviceName: string) => {
    // Check if service is individually disabled
    if (disabledServices.has(serviceName)) {
      return;
    }

    try {
      // Optimistic UI update
      updateServiceStatus(serviceName, "restarting");

      // Call backend
      await RestartService(serviceName);

      // Refresh service list after operation completes
      await loadServices();
    } catch (err) {
      // Parse error and show user-friendly message
      const errorState = parseServiceError(err, serviceName);
      setState((prev) => ({
        ...prev,
        error: errorState,
      }));

      // Refresh to get actual state
      await loadServices();
    }
  };

  // Handle stop all services
  const handleStopAll = async () => {
    setIsProcessing(true);
    try {
      const runningServices = filteredServices.filter(
        (s) => s.Status === "running" && !disabledServices.has(s.Name)
      );
      for (const service of runningServices) {
        try {
          await StopService(service.Name);
        } catch (err) {
          console.error(`Failed to stop ${service.Name}:`, err);
        }
      }
      await loadServices();
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle individual service disable/enable
  const handleToggleServiceDisabled = (serviceName: string) => {
    setDisabledServices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(serviceName)) {
        newSet.delete(serviceName);
      } else {
        newSet.add(serviceName);
      }
      return newSet;
    });
  };

  // Handle start all services
  const handleStartAll = async () => {
    setIsProcessing(true);
    try {
      const stoppedServices = filteredServices.filter(
        (s) => s.Status === "stopped" && !disabledServices.has(s.Name)
      );
      for (const service of stoppedServices) {
        try {
          await StartService(service.Name);
        } catch (err) {
          console.error(`Failed to start ${service.Name}:`, err);
        }
      }
      await loadServices();
    } finally {
      setIsProcessing(false);
    }
  };



  // Filter services based on search term only
  const filteredServices = useMemo(() => {
    let filtered = state.services;

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (service) =>
          service.DisplayName.toLowerCase().includes(searchLower) ||
          service.Name.toLowerCase().includes(searchLower) ||
          service.Type.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [state.services, searchTerm]);

  return (
    <div className="app">
      {/* Custom title bar */}
      <div className="title-bar">
        <div className="title-bar-spacer"></div>
        <WindowControls />
      </div>

      <div className="app-content fluent-scroll">
        {/* Toolbar - Single Row, Responsive & Organized */}
        <div className="app-toolbar">
          {/* Search Section - Primary, grows as needed */}
          <div className="toolbar-section toolbar-search">
            <SearchAndFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedCategory="all"
              onCategoryChange={() => {}}
              categoryCounts={{
                all: 0,
                database: 0,
                web: 0,
                cache: 0,
                message: 0,
                application: 0,
                other: 0,
              }}
            />
          </div>

      

          {/* Control buttons pinned to the right */}
          <div className="toolbar-section toolbar-controls">
            <ServiceControlToggle
              onStartAll={handleStartAll}
              onStopAll={handleStopAll}
              isProcessing={state.loading || isProcessing}
              isTableDisabled={isTableDisabled}
              onToggleTableState={() => setIsTableDisabled(!isTableDisabled)}
            />
          </div>
        </div>
        
        {/* Error notification with dismissal */}
        {state.error && (
          <ErrorNotification error={state.error} onDismiss={dismissError} />
        )}

        {/* Loading state */}
        {state.loading && <div className="loading">Loading services...</div>}

        {/* Service list */}
        {!state.loading && (
          <>
            {filteredServices.length === 0 && searchTerm.trim() ? (
              <div className="no-results">
                <div className="no-results-icon">
                  <FluentIcons.Search />
                </div>
                <h3>No services found</h3>
                <p>No services match your search for "{searchTerm}"</p>
              </div>
            ) : (
              <HierarchicalServiceTable
                services={filteredServices}
                onStart={handleStart}
                onStop={handleStop}
                onRestart={handleRestart}
                isDisabled={isTableDisabled}
                disabledServices={disabledServices}
                onToggleServiceDisabled={handleToggleServiceDisabled}
              />
            )}
          </>
        )}
      </div>

      {/* Settings Button - Bottom Left */}
      <button
        type="button"
        onClick={() => setIsSettingsOpen(true)}
        className="settings-button-fixed"
        title="Settings"
        aria-label="Open Settings"
      >
        <span className="settings-button-label">Settings</span>
      </button>

      {/* Service Stats - Bottom Right */}
      <div className="service-stats-fixed">
        <span className="stat-item">
          <span className="stat-value">{filteredServices.length}</span>
          <span className="stat-label">Total</span>
        </span>
        <span className="stat-divider">•</span>
        <span className="stat-item">
          <span className="stat-value text-success">
            {filteredServices.filter((s) => s.Status === "running").length}
          </span>
          <span className="stat-label">Active</span>
        </span>
        <span className="stat-divider">•</span>
        <span className="stat-item">
          <span className="stat-value text-destructive">
            {filteredServices.filter((s) => s.Status === "stopped").length}
          </span>
          <span className="stat-label">Inactive</span>
        </span>
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
