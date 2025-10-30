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
 * Service represents a database service with its current state
 * Matches the backend Go Service struct
 */
export interface Service {
  Name: string;
  DisplayName: string;
  Status: ServiceStatus;
  Type: ServiceType;
  StartupType: StartupType;
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
