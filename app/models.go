package app

// ServiceStatus represents the current operational state of a database service
type ServiceStatus string

const (
	StatusRunning    ServiceStatus = "running"
	StatusStopped    ServiceStatus = "stopped"
	StatusStarting   ServiceStatus = "starting"
	StatusStopping   ServiceStatus = "stopping"
	StatusRestarting ServiceStatus = "restarting"
)

// ServiceType represents the type of database service
type ServiceType string

const (
	TypePostgreSQL ServiceType = "postgresql"
	TypeMongoDB    ServiceType = "mongodb"
	TypeMySQL      ServiceType = "mysql"
	TypeMariaDB    ServiceType = "mariadb"
	TypeMSSQL      ServiceType = "mssql"
	TypeOracle     ServiceType = "oracle"
	TypeRedis      ServiceType = "redis"
	TypeCassandra  ServiceType = "cassandra"
	TypeElasticsearch ServiceType = "elasticsearch"
	TypeCouchDB    ServiceType = "couchdb"
	TypeInfluxDB   ServiceType = "influxdb"
	TypeNeo4j      ServiceType = "neo4j"
	TypeRabbitMQ   ServiceType = "rabbitmq"
	TypeMemcached  ServiceType = "memcached"
	TypeSQLite     ServiceType = "sqlite"
	TypeDB2        ServiceType = "db2"
	TypeFirebird   ServiceType = "firebird"
)

// StartupType represents the service startup configuration
type StartupType string

const (
	StartupAutomatic StartupType = "automatic"
	StartupManual    StartupType = "manual"
	StartupDisabled  StartupType = "disabled"
)

// Service represents a database service with its current state
type Service struct {
	Name        string        `json:"Name"`
	DisplayName string        `json:"DisplayName"`
	Status      ServiceStatus `json:"Status"`
	Type        ServiceType   `json:"Type"`
	StartupType StartupType   `json:"StartupType"`
}
