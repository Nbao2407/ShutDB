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

// ServiceCategory represents the logical grouping of services
type ServiceCategory string

const (
	CategorySQL       ServiceCategory = "sql_databases"
	CategoryNoSQL     ServiceCategory = "nosql_databases"
	CategoryCache     ServiceCategory = "cache_memory"
	CategorySearch    ServiceCategory = "search_analytics"
	CategoryMessaging ServiceCategory = "message_brokers"
)

// Service represents a database service with its current state
type Service struct {
	Name        string          `json:"Name"`
	DisplayName string          `json:"DisplayName"`
	Status      ServiceStatus   `json:"Status"`
	Type        ServiceType     `json:"Type"`
	StartupType StartupType     `json:"StartupType"`
	Category    ServiceCategory `json:"Category"`
}

// GetCategoryInfo returns metadata about a service category
func GetCategoryInfo(category ServiceCategory) map[string]string {
	categoryInfo := map[ServiceCategory]map[string]string{
		CategorySQL: {
			"name":        "SQL Databases",
			"description": "Relational database management systems",
			"icon":        "🗄️",
			"color":       "#0078D4",
		},
		CategoryNoSQL: {
			"name":        "NoSQL Databases",
			"description": "Document, graph, and column-family databases",
			"icon":        "📦",
			"color":       "#107C10",
		},
		CategoryCache: {
			"name":        "Cache & In-Memory",
			"description": "High-performance caching and in-memory stores",
			"icon":        "⚡",
			"color":       "#FF8C00",
		},
		CategorySearch: {
			"name":        "Search & Analytics",
			"description": "Search engines and time-series databases",
			"icon":        "🔍",
			"color":       "#881798",
		},
		CategoryMessaging: {
			"name":        "Message Brokers",
			"description": "Message queuing and streaming services",
			"icon":        "📨",
			"color":       "#E81123",
		},
	}

	if info, exists := categoryInfo[category]; exists {
		return info
	}
	return map[string]string{"name": "Unknown", "description": "", "icon": "❓", "color": "#666666"}
}

// GetServiceCategory returns the category for a given service type
func GetServiceCategory(serviceType ServiceType) ServiceCategory {
	categoryMap := map[ServiceType]ServiceCategory{
		// SQL Databases
		TypeMSSQL:      CategorySQL,
		TypePostgreSQL: CategorySQL,
		TypeMySQL:      CategorySQL,
		TypeMariaDB:    CategorySQL,
		TypeOracle:     CategorySQL,
		TypeDB2:        CategorySQL,
		TypeFirebird:   CategorySQL,

		// NoSQL Databases
		TypeMongoDB:   CategoryNoSQL,
		TypeCassandra: CategoryNoSQL,
		TypeCouchDB:   CategoryNoSQL,
		TypeNeo4j:     CategoryNoSQL,

		// Cache & In-Memory
		TypeRedis:     CategoryCache,
		TypeMemcached: CategoryCache,
		TypeSQLite:    CategoryCache,

		// Search & Analytics
		TypeElasticsearch: CategorySearch,
		TypeInfluxDB:      CategorySearch,

		// Message Brokers
		TypeRabbitMQ: CategoryMessaging,
	}

	if category, exists := categoryMap[serviceType]; exists {
		return category
	}
	return CategorySQL // Default fallback
}
