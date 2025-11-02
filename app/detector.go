package app

import (
	"strings"
)

// ServiceDetector defines the interface for detecting database services
type ServiceDetector interface {
	DetectServices() ([]Service, error)
}

// WindowsServiceDetector implements ServiceDetector for Windows
type WindowsServiceDetector struct {
	adapter       OSServiceAdapter
	knownPatterns map[ServiceType][]string
}

// NewWindowsServiceDetector creates a new Windows service detector
func NewWindowsServiceDetector(adapter OSServiceAdapter) *WindowsServiceDetector {
	return &WindowsServiceDetector{
		adapter: adapter,
		knownPatterns: map[ServiceType][]string{
			// Relational Databases
			TypePostgreSQL: {"postgresql", "postgres"},
			TypeMySQL:      {"mysql"},
			TypeMariaDB:    {"mariadb"},
			TypeMSSQL: {
				"mssql", "sqlserver", "mssqlserver",
				"sqlagent",       // SQL Server Agent
				"sqlbrowser",     // SQL Server Browser
				"sqlwriter",      // SQL Server VSS Writer
				"sqlceip",        // SQL Server CEIP
				"sqltelemetry",   // SQL Server Telemetry
				"msdtsserver",    // SQL Server Integration Services
				"msftesql",       // SQL Server FullText Search
				"reportserver",   // SQL Server Reporting Services
				"sqlserveragent", // Alternative Agent name
			},
			TypeOracle:   {"oracle", "oracleservice"},
			TypeDB2:      {"db2"},
			TypeFirebird: {"firebird", "firebirdserver"},
			TypeSQLite:   {"sqlite"},

			// NoSQL Databases
			TypeMongoDB:   {"mongodb", "mongo"},
			TypeCassandra: {"cassandra"},
			TypeCouchDB:   {"couchdb"},
			TypeNeo4j:     {"neo4j"},

			// In-Memory & Cache
			TypeRedis:     {"redis"},
			TypeMemcached: {"memcached"},

			// Search & Analytics
			TypeElasticsearch: {"elasticsearch", "elastic"},
			TypeInfluxDB:      {"influxdb", "influx"},

			// Message Brokers (often used with databases)
			TypeRabbitMQ: {"rabbitmq"},
		},
	}
}

// DetectServices filters OS services by known patterns and returns detected database services
func (d *WindowsServiceDetector) DetectServices() ([]Service, error) {
	// Get all OS services
	osServices, err := d.adapter.ListServices()
	if err != nil {
		return nil, err
	}

	// Pre-allocate with estimated capacity to reduce memory allocations
	detectedServices := make([]Service, 0, len(osServices)/10) // Estimate ~10% of services are database-related

	// Filter services by known patterns with memory-efficient processing
	for i := range osServices {
		osService := &osServices[i] // Use pointer to avoid copying
		serviceType, matched := d.matchServiceType(osService.Name)
		if matched {
			// Get startup type only for matched services to reduce API calls
			startupType, err := d.adapter.GetStartupType(osService.Name)
			if err != nil {
				startupType = StartupManual // Default to manual if unable to retrieve
			}

			detectedServices = append(detectedServices, Service{
				Name:        osService.Name,
				DisplayName: osService.DisplayName,
				Status:      mapWindowsStateToStatus(osService.State),
				Type:        serviceType,
				StartupType: startupType,
				Category:    GetServiceCategory(serviceType),
			})
		}
	}

	// Shrink slice to actual size to free unused capacity
	if cap(detectedServices) > len(detectedServices)*2 {
		shrunk := make([]Service, len(detectedServices))
		copy(shrunk, detectedServices)
		detectedServices = shrunk
	}

	return detectedServices, nil
}

// matchServiceType checks if a service name matches any known patterns
func (d *WindowsServiceDetector) matchServiceType(serviceName string) (ServiceType, bool) {
	lowerName := strings.ToLower(serviceName)

	for serviceType, patterns := range d.knownPatterns {
		for _, pattern := range patterns {
			if strings.Contains(lowerName, pattern) {
				return serviceType, true
			}
		}
	}

	return "", false
}
