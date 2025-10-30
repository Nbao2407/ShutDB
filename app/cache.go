package app

import (
	"sync"
	"time"
)

// ServiceCache provides thread-safe in-memory caching for services with TTL support
type ServiceCache struct {
	services   map[string]*Service
	lastUpdate time.Time
	ttl        time.Duration
	mu         sync.RWMutex
}

// NewServiceCache creates a new ServiceCache with the specified TTL
func NewServiceCache(ttl time.Duration) *ServiceCache {
	return &ServiceCache{
		services:   make(map[string]*Service),
		lastUpdate: time.Time{},
		ttl:        ttl,
	}
}

// Get retrieves a service from the cache by name
// Returns the service and true if found, nil and false otherwise
func (sc *ServiceCache) Get(name string) (*Service, bool) {
	sc.mu.RLock()
	defer sc.mu.RUnlock()

	service, exists := sc.services[name]
	return service, exists
}

// Set stores a service in the cache and updates the lastUpdate timestamp
func (sc *ServiceCache) Set(name string, service *Service) {
	sc.mu.Lock()
	defer sc.mu.Unlock()

	sc.services[name] = service
	sc.lastUpdate = time.Now()
}

// SetAll replaces all cached services and updates the lastUpdate timestamp
func (sc *ServiceCache) SetAll(services []Service) {
	sc.mu.Lock()
	defer sc.mu.Unlock()

	// Clear existing cache
	sc.services = make(map[string]*Service)

	// Store new services
	for i := range services {
		sc.services[services[i].Name] = &services[i]
	}

	sc.lastUpdate = time.Now()
}

// GetAll returns all cached services as a slice
func (sc *ServiceCache) GetAll() []Service {
	sc.mu.RLock()
	defer sc.mu.RUnlock()

	services := make([]Service, 0, len(sc.services))
	for _, service := range sc.services {
		services = append(services, *service)
	}

	return services
}

// IsExpired checks if the cache has exceeded its TTL
// Returns true if the cache is expired or has never been populated
func (sc *ServiceCache) IsExpired() bool {
	sc.mu.RLock()
	defer sc.mu.RUnlock()

	// Cache is expired if it has never been populated
	if sc.lastUpdate.IsZero() {
		return true
	}

	// Check if TTL has elapsed
	return time.Since(sc.lastUpdate) > sc.ttl
}

// Clear removes all entries from the cache and resets the lastUpdate timestamp
func (sc *ServiceCache) Clear() {
	sc.mu.Lock()
	defer sc.mu.Unlock()

	sc.services = make(map[string]*Service)
	sc.lastUpdate = time.Time{}
}
