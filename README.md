# Service Database Dashboard

A lightweight desktop application for managing database services on Windows.

## Features

- ✨ **Modern Fluent Design UI** - Windows 11 inspired dark mode with acrylic effects
- 🎨 **Vibrant Color-Coded Stats** - Real-time visual indicators (blue/green/orange)
- Start, Stop, and Restart database services
- Real-time service status monitoring with live status badges
- Hierarchical service filtering and search
- Minimal resource usage (<50MB RAM)
- Simple and intuitive interface with keyboard shortcuts
- Support for all popular databases



<img width="600" height="900" alt="image" src="https://github.com/user-attachments/assets/71ff9256-bb7f-48e6-806e-bbfb363e403c" />

## Supported Databases

### Relational Databases
- **PostgreSQL** - Open-source relational database
- **MySQL** - Popular open-source database
- **MariaDB** - MySQL fork with enhanced features
- **Microsoft SQL Server** - Enterprise database system (includes Agent, Browser, SSIS, SSRS, and more)
- **Oracle Database** - Enterprise-grade RDBMS
- **IBM DB2** - Enterprise database platform
- **Firebird** - Open-source SQL database
- **SQLite** - Lightweight embedded database

### NoSQL Databases
- **MongoDB** - Document-oriented database
- **Cassandra** - Distributed wide-column store
- **CouchDB** - Document-oriented database
- **Neo4j** - Graph database platform

### In-Memory & Cache
- **Redis** - In-memory data structure store
- **Memcached** - Distributed memory caching system

### Search & Analytics
- **Elasticsearch** - Search and analytics engine
- **InfluxDB** - Time-series database

### Message Brokers
- **RabbitMQ** - Message broker (often used with databases)

## Prerequisites

Before building this application, you need to install:

1. **Go 1.21+** - Download from https://go.dev/dl/
2. **Node.js 16+** - Already installed (v25.0.0 detected)
3. **Wails CLI** - Install with: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`
4. **Windows Build Tools** - Required for Windows development

## Installation Steps

### 1. Install Go

Download and install Go from https://go.dev/dl/

After installation, verify with:

```bash
go version
```

### 2. Install Wails CLI

Once Go is installed, run:

```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

Make sure your Go bin directory is in your PATH. The default location is:

- Windows: `%USERPROFILE%\go\bin`

### 3. Install Dependencies

Install Go dependencies:

```bash
go mod download
```

Install frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

### 4. Development

Run in development mode:

```bash
wails dev
```

### 5. Build

Build the production executable:

```bash
wails build
```

The executable will be in the `build/bin` directory.

## Project Structure

```
service-db-dashboard/
├── app/                    # Go backend code
│   ├── models.go          # Data models
│   ├── errors.go          # Error types
│   ├── os_adapter.go      # Windows Service Control Manager adapter
│   ├── detector.go        # Service detection logic
│   ├── cache.go           # Service cache
│   └── service_manager.go # Main service manager
├── frontend/              # React TypeScript frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── types/         # TypeScript types
│   │   └── wailsjs/       # Auto-generated Wails bindings
│   └── package.json
├── main.go                # Application entry point
├── wails.json             # Wails configuration
└── go.mod                 # Go module definition
```

## Usage

1. Run the application as Administrator (required for service management)
2. The dashboard will automatically detect all installed database services
3. Use the Start, Stop, and Restart buttons to manage services
4. Service status updates automatically every 5 seconds

### Detected Services

The application automatically detects database services by scanning Windows Services for known patterns:
- PostgreSQL services (postgresql, postgres)
- MySQL services (mysql)
- MariaDB services (mariadb)
- **SQL Server services** - Detects ALL related services:
  - Database Engine (mssql, sqlserver, mssqlserver)
  - SQL Server Agent (sqlagent, sqlserveragent)
  - SQL Server Browser (sqlbrowser)
  - SQL Server VSS Writer (sqlwriter)
  - SQL Server CEIP/Telemetry (sqlceip, sqltelemetry)
  - Integration Services - SSIS (msdtsserver)
  - FullText Search (msftesql)
  - Reporting Services - SSRS (reportserver)
- MongoDB services (mongodb, mongo)
- Redis services (redis)
- Elasticsearch services (elasticsearch, elastic)
- And many more...

**Note:** For detailed information about SQL Server services, see `SQL_SERVER_SERVICES.md`.

If you have a database service that isn't detected, it may be using a non-standard service name.

## Technical Details

- **Framework**: Wails v2
- **Backend**: Go with Windows Service Control Manager APIs
- **Frontend**: React 18 + TypeScript 5 + Vite
- **Design System**: Windows 11 Fluent Design with CSS variables
- **UI Features**: Acrylic backgrounds, smooth animations, color-coded metrics
- **Target RAM**: <50MB idle usage
- **Polling Interval**: 5 seconds (2 seconds during operations)

