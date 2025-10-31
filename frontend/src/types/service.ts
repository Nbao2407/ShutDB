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
  | "sql_databases"
  | "nosql_databases"
  | "cache_memory"
  | "search_analytics"
  | "message_brokers";

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
  Category: ServiceCategory;
  // Extended properties for table display
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
  const sqlDatabases: ServiceType[] = [
    'postgresql', 'mysql', 'mariadb', 'mssql', 'oracle',
    'sqlite', 'db2', 'firebird'
  ];

  const nosqlDatabases: ServiceType[] = [
    'mongodb', 'cassandra', 'couchdb', 'neo4j'
  ];

  const cacheMemory: ServiceType[] = ['redis', 'memcached'];

  const searchAnalytics: ServiceType[] = ['elasticsearch', 'influxdb'];

  const messageBrokers: ServiceType[] = ['rabbitmq'];

  if (sqlDatabases.includes(serviceType)) return 'sql_databases';
  if (nosqlDatabases.includes(serviceType)) return 'nosql_databases';
  if (cacheMemory.includes(serviceType)) return 'cache_memory';
  if (searchAnalytics.includes(serviceType)) return 'search_analytics';
  if (messageBrokers.includes(serviceType)) return 'message_brokers';

  return 'sql_databases'; // Default fallback
};

/**
 * Maps a service category to its appropriate log-on account type
 * @param category The service category
 * @returns The recommended log-on account type for the category
 */
export const getLogOnTypeForCategory = (category: ServiceCategory): LogOnType => {
  switch (category) {
    case 'sql_databases':
      return 'Network Service';
    case 'nosql_databases':
      return 'Network Service';
    case 'cache_memory':
      return 'Network Service';
    case 'search_analytics':
      return 'Network Service';
    case 'message_brokers':
      return 'Network Service';
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
    case 'sql_databases':
      return '🗄️';
    case 'nosql_databases':
      return '📦';
    case 'cache_memory':
      return '⚡';
    case 'search_analytics':
      return '🔍';
    case 'message_brokers':
      return '📨';
    default:
      return '⚙️';
  }
};

/**
 * Extends a basic service with UI-specific properties
 * @param service The basic service object from the backend
 * @returns The service with extended UI properties
 */
export const extendServiceForUI = (service: Service): Service => {
  const logOnAs = getLogOnTypeForCategory(service.Category);
  const icon = getCategoryIcon(service.Category);

  return {
    ...service,
    logOnAs,
    icon
  };
};
