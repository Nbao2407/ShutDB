/**
 * ServiceStatus represents the current operational state of a database service
 */
export type ServiceStatus =
  | "running"
  | "stopped"
  | "starting"
  | "stopping"
  | "restarting";

/**
 * StartupType represents the service startup configuration
 */
export type StartupType =
  | "automatic"
  | "manual"
  | "disabled";

/**
 * ServiceType represents the type of database service
 */
export type ServiceType =
  | "postgresql"
  | "mongodb"
  | "mysql"
  | "mariadb"
  | "mssql"
  | "oracle"
  | "redis"
  | "cassandra"
  | "elasticsearch"
  | "couchdb"
  | "influxdb"
  | "neo4j"
  | "rabbitmq"
  | "memcached"
  | "sqlite"
  | "db2"
  | "firebird";

/**
 * ServiceCategory represents the category grouping for services in the UI
 */
export type ServiceCategory =
  | "database"
  | "web"
  | "cache"
  | "message"
  | "application"
  | "other";

/**
 * LogOnType represents the service account type for log-on configuration
 */
export type LogOnType =
  | "Local System"
  | "Network Service"
  | "Local Service";

/**
 * Service represents a database service with its current state
 * Matches the backend Go Service struct with UI extensions
 */
export interface Service {
  Name: string;
  DisplayName: string;
  Status: ServiceStatus;
  Type: ServiceType;
  StartupType: StartupType;
  // Extended properties for table display
  category?: ServiceCategory;
  logOnAs?: LogOnType;
  icon?: string;
}

/**
 * ErrorCode represents specific error types for service operations
 */
export enum ErrorCode {
  ErrPermissionDenied = 0,
  ErrServiceNotFound = 1,
  ErrOperationTimeout = 2,
  ErrInvalidState = 3,
  ErrSystemError = 4,
}

/**
 * ErrorState represents an error that occurred during a service operation
 * Used for displaying user-friendly error messages in the UI
 */
export interface ErrorState {
  message: string;
  code?: ErrorCode;
  serviceName?: string;
}

/**
 * Maps a service type to its appropriate category for UI grouping
 * @param serviceType The type of service to categorize
 * @returns The category that the service belongs to
 */
export const categorizeService = (serviceType: ServiceType): ServiceCategory => {
  const dbTypes: ServiceType[] = [
    'postgresql', 'mysql', 'mariadb', 'mssql', 'mongodb', 'oracle',
    'cassandra', 'elasticsearch', 'couchdb', 'influxdb', 'neo4j',
    'sqlite', 'db2', 'firebird'
  ];

  const webTypes: ServiceType[] = [];

  const cacheTypes: ServiceType[] = ['redis', 'memcached'];

  const messageTypes: ServiceType[] = ['rabbitmq'];

  if (dbTypes.includes(serviceType)) return 'database';
  if (webTypes.includes(serviceType)) return 'web';
  if (cacheTypes.includes(serviceType)) return 'cache';
  if (messageTypes.includes(serviceType)) return 'message';

  return 'other';
};

/**
 * Maps a service category to its appropriate log-on account type
 * @param category The service category
 * @returns The recommended log-on account type for the category
 */
export const getLogOnTypeForCategory = (category: ServiceCategory): LogOnType => {
  switch (category) {
    case 'database':
      return 'Network Service';
    case 'web':
      return 'Network Service';
    case 'cache':
      return 'Network Service';
    case 'message':
      return 'Network Service';
    case 'application':
      return 'Local Service';
    case 'other':
    default:
      return 'Local System';
  }
};

/**
 * Gets the appropriate icon for a service category
 * @param category The service category
 * @returns The icon string for the category
 */
export const getCategoryIcon = (category: ServiceCategory): string => {
  switch (category) {
    case 'database':
      return '📊';
    case 'web':
      return '🌐';
    case 'cache':
      return '⚡';
    case 'message':
      return '📨';
    case 'application':
      return '🔧';
    case 'other':
    default:
      return '⚙️';
  }
};

/**
 * Extends a basic service with UI-specific properties
 * @param service The basic service object from the backend
 * @returns The service with extended UI properties
 */
export const extendServiceForUI = (service: Omit<Service, 'category' | 'logOnAs' | 'icon'>): Service => {
  const category = categorizeService(service.Type);
  const logOnAs = getLogOnTypeForCategory(category);
  const icon = getCategoryIcon(category);

  return {
    ...service,
    category,
    logOnAs,
    icon
  };
};
