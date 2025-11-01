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
import { ServiceTable } from "./components/ServiceTable";
import { SearchAndFilter } from "./components/SearchAndFilter";
import { ServiceTypeFilter } from "./components/ServiceTypeFilter";
import { ServiceType } from "./types/service";
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

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] =
    useState<ServiceType | "all">("all");
  const [isProcessing, setIsProcessing] = useState(false);
  
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
        (s) => s.Status === "running"
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

  // Handle start all services
  const handleStartAll = async () => {
    setIsProcessing(true);
    try {
      const stoppedServices = filteredServices.filter(
        (s) => s.Status === "stopped"
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



  // Filter services based on search term and category
  // Note: SearchAndFilter component now handles debouncing internally
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

    // Filter by service type
    if (selectedType !== "all") {
      filtered = filtered.filter(
        (service) => service.Type === selectedType
      );
    }

    return filtered;
  }, [state.services, searchTerm, selectedType]);

  // Get type counts for filter dropdown
  const typeCounts = useMemo(() => {
    const counts: Record<ServiceType | "all", number> = {
      all: state.services.length,
      postgresql: 0,
      mongodb: 0,
      mysql: 0,
      mariadb: 0,
      mssql: 0,
      oracle: 0,
      redis: 0,
      cassandra: 0,
      elasticsearch: 0,
      couchdb: 0,
      influxdb: 0,
      neo4j: 0,
      rabbitmq: 0,
      memcached: 0,
      sqlite: 0,
      db2: 0,
      firebird: 0,
    };

    state.services.forEach((service) => {
      if (service.Type) {
        counts[service.Type]++;
      }
    });

    return counts;
  }, [state.services]);

  return (
    <div className="app">
      {/* Custom title bar */}
      <div className="title-bar">
        <div className="title-bar-spacer"></div>
        <WindowControls />
      </div>

      <div className="app-content fluent-scroll">
        {/* Toolbar */}
        <div className="app-toolbar">
          <div className="app-toolbar-left">
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
              onStartAll={handleStartAll}
              onStopAll={handleStopAll}
              isProcessing={state.loading || isProcessing}
            />
            <ServiceTypeFilter
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              typeCounts={typeCounts}
            />
          </div>
          <div className="app-toolbar-right">
            <div className="service-stats">
              <span className="stat-item">
                <span className="stat-value">{filteredServices.length}</span>
                <span className="stat-label">Services</span>
              </span>
              <span className="stat-divider">•</span>
              <span className="stat-item">
                <span className="stat-value text-success">
                  {
                    filteredServices.filter((s) => s.Status === "running")
                      .length
                  }
                </span>
                <span className="stat-label">Running</span>
              </span>
              <span className="stat-divider">•</span>
              <span className="stat-item">
                <span className="stat-value text-destructive">
                  {
                    filteredServices.filter((s) => s.Status === "stopped")
                      .length
                  }
                </span>
                <span className="stat-label">Stopped</span>
              </span>
            </div>
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
                <svg
                  className="no-results-icon"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <h3>No services found</h3>
                <p>No services match your search for "{searchTerm}"</p>
              </div>
            ) : (
              <ServiceTable
                services={filteredServices}
                onStart={handleStart}
                onStop={handleStop}
                onRestart={handleRestart}
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
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
            stroke="currentColor"
            strokeWidth="1.5"
          />
          <path
            d="M10 1v2m0 14v2M4.22 4.22l1.42 1.42m8.72 8.72l1.42 1.42M1 10h2m14 0h2M4.22 15.78l1.42-1.42m8.72-8.72l1.42-1.42"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <span className="settings-button-label">Settings</span>
      </button>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
