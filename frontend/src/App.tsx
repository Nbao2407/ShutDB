import { useState, useEffect } from 'react'
import { GetServices, StartService, StopService, RestartService } from './wailsjs/go/app/ServiceManager'
import { Service, ServiceStatus, ErrorState } from './types/service'
import { parseServiceError } from './utils/errorHandler'
import ErrorNotification from './components/ErrorNotification'
import { ServiceList } from './components/ServiceList'
import { ServiceControlToggle } from './components/ServiceControlToggle'
import { ServerInfo } from './components/ServerInfo'
import './App.css'

interface AppState {
  services: Service[];
  loading: boolean;
  error: ErrorState | null;
}

function App() {
  const [state, setState] = useState<AppState>({
    services: [],
    loading: true,
    error: null
  });

  // Load services function
  const loadServices = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const services = await GetServices();
      setState({
        services: services as Service[],
        loading: false,
        error: null
      });
    } catch (err) {
      const errorState = parseServiceError(err);
      setState({
        services: [],
        loading: false,
        error: errorState
      });
    }
  };

  // Dismiss error notification
  const dismissError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  // Load services on mount
  useEffect(() => {
    loadServices();
  }, []);

  // Helper function to update service status optimistically
  const updateServiceStatus = (serviceName: string, status: ServiceStatus) => {
    setState(prev => ({
      ...prev,
      services: prev.services.map(service =>
        service.Name === serviceName
          ? { ...service, Status: status }
          : service
      )
    }));
  };

  // Handle start service
  const handleStart = async (serviceName: string) => {
    try {
      // Optimistic UI update
      updateServiceStatus(serviceName, 'starting');
      
      // Call backend
      await StartService(serviceName);
      
      // Refresh service list after operation completes
      await loadServices();
    } catch (err) {
      // Parse error and show user-friendly message
      const errorState = parseServiceError(err, serviceName);
      setState(prev => ({
        ...prev,
        error: errorState
      }));
      
      // Refresh to get actual state
      await loadServices();
    }
  };

  // Handle stop service
  const handleStop = async (serviceName: string) => {
    try {
      // Optimistic UI update
      updateServiceStatus(serviceName, 'stopping');
      
      // Call backend
      await StopService(serviceName);
      
      // Refresh service list after operation completes
      await loadServices();
    } catch (err) {
      // Parse error and show user-friendly message
      const errorState = parseServiceError(err, serviceName);
      setState(prev => ({
        ...prev,
        error: errorState
      }));
      
      // Refresh to get actual state
      await loadServices();
    }
  };

  // Handle restart service
  const handleRestart = async (serviceName: string) => {
    try {
      // Optimistic UI update
      updateServiceStatus(serviceName, 'restarting');

      // Call backend
      await RestartService(serviceName);

      // Refresh service list after operation completes
      await loadServices();
    } catch (err) {
      // Parse error and show user-friendly message
      const errorState = parseServiceError(err, serviceName);
      setState(prev => ({
        ...prev,
        error: errorState
      }));

      // Refresh to get actual state
      await loadServices();
    }
  };

  // Handle stop all services
  const handleStopAll = async () => {
    const runningServices = state.services.filter(s => s.Status === 'running');
    for (const service of runningServices) {
      try {
        await StopService(service.Name);
      } catch (err) {
        console.error(`Failed to stop ${service.Name}:`, err);
      }
    }
    await loadServices();
  };

  // Handle start all services
  const handleStartAll = async () => {
    const stoppedServices = state.services.filter(s => s.Status === 'stopped');
    for (const service of stoppedServices) {
      try {
        await StartService(service.Name);
      } catch (err) {
        console.error(`Failed to start ${service.Name}:`, err);
      }
    }
    await loadServices();
  };

  // Calculate server metrics
  const serverMetrics = {
    hostname: 'localhost',
    platform: 'Windows',
    uptime: 3600,
    totalServices: state.services.length,
    runningServices: state.services.filter(s => s.Status === 'running').length,
    stoppedServices: state.services.filter(s => s.Status === 'stopped').length
  };

  return (
    <div className="app">
      <div className="app-content fluent-scroll">
        {/* Toolbar */}
        <div className="app-toolbar">
          <div className="app-toolbar-left">
            <h1>ShutDB</h1>
          </div>
          <div className="app-toolbar-right">
            <ServiceControlToggle
              onStopAll={handleStopAll}
              onStartAll={handleStartAll}
              isProcessing={state.loading}
            />
          </div>
        </div>

        {/* Server Info */}
        <ServerInfo metrics={serverMetrics} />

        {/* Error notification with dismissal */}
        {state.error && (
          <ErrorNotification
            error={state.error}
            onDismiss={dismissError}
          />
        )}

        {/* Loading state */}
        {state.loading && (
          <div className="loading">Loading services...</div>
        )}

        {/* Service list */}
        {!state.loading && (
          <ServiceList
            services={state.services}
            onStart={handleStart}
            onStop={handleStop}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  )
}

export default App
