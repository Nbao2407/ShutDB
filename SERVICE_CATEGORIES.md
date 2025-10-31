# Server Service Categories - Dropdown Structure

## 📊 Complete Service Organization

Based on detected services, here's the logical dropdown grouping structure:

---

## 🗄️ **SQL DATABASES** ▼
**Relational database management systems**

├── **Microsoft SQL Server**
│   ├── SQL Server Database Engine (MSSQLSERVER)
│   ├── SQL Server Agent (SQLAGENT)
│   ├── SQL Server Browser (SQLBrowser)
│   ├── SQL Server VSS Writer (SQLWriter)
│   ├── SQL Server Integration Services (MSDTSServer)
│   ├── SQL Server FullText Search (MSFTESQL)
│   ├── SQL Server Reporting Services (ReportServer)
│   ├── SQL Server CEIP (SQLCEIP)
│   └── SQL Server Telemetry (SQLTelemetry)
│
├── **PostgreSQL**
│   └── PostgreSQL Database Server
│
├── **MySQL**
│   └── MySQL Database Server
│
├── **MariaDB**
│   └── MariaDB Database Server
│
├── **Oracle Database**
│   └── Oracle Database Service
│
├── **IBM DB2**
│   └── DB2 Database Server
│
└── **Firebird**
    └── Firebird SQL Server

---

## 📦 **NoSQL DATABASES** ▼
**Document, graph, and column-family databases**

├── **MongoDB**
│   └── MongoDB Database Server
│
├── **Apache Cassandra**
│   └── Cassandra Database Server
│
├── **CouchDB**
│   └── CouchDB Database Server
│
└── **Neo4j**
    └── Neo4j Graph Database

---

## ⚡ **CACHE & IN-MEMORY** ▼
**High-performance caching and in-memory data stores**

├── **Redis**
│   └── Redis Server
│
├── **Memcached**
│   └── Memcached Server
│
└── **SQLite** (In-Memory Mode)
    └── SQLite Database

---

## 🔍 **SEARCH & ANALYTICS** ▼
**Search engines and time-series databases**

├── **Elasticsearch**
│   └── Elasticsearch Search Engine
│
└── **InfluxDB**
    └── InfluxDB Time-Series Database

---

## �� **MESSAGE BROKERS** ▼
**Message queuing and streaming services**

└── **RabbitMQ**
    └── RabbitMQ Message Broker

---

## 📋 **Category Mapping Table**

| Service Type | Category | Primary Function | Port(s) |
|-------------|----------|------------------|---------|
| **SQL Databases** ||||
| MSSQL | SQL Databases | Relational DB | 1433 |
| PostgreSQL | SQL Databases | Relational DB | 5432 |
| MySQL | SQL Databases | Relational DB | 3306 |
| MariaDB | SQL Databases | Relational DB | 3306 |
| Oracle | SQL Databases | Relational DB | 1521 |
| DB2 | SQL Databases | Relational DB | 50000 |
| Firebird | SQL Databases | Relational DB | 3050 |
| **NoSQL Databases** ||||
| MongoDB | NoSQL Databases | Document DB | 27017 |
| Cassandra | NoSQL Databases | Column-Family DB | 9042 |
| CouchDB | NoSQL Databases | Document DB | 5984 |
| Neo4j | NoSQL Databases | Graph DB | 7474, 7687 |
| **Cache & In-Memory** ||||
| Redis | Cache & In-Memory | Key-Value Store | 6379 |
| Memcached | Cache & In-Memory | Caching System | 11211 |
| SQLite | Cache & In-Memory | Embedded DB | N/A |
| **Search & Analytics** ||||
| Elasticsearch | Search & Analytics | Search Engine | 9200 |
| InfluxDB | Search & Analytics | Time-Series DB | 8086 |
| **Message Brokers** ||||
| RabbitMQ | Message Brokers | Message Queue | 5672 |

---

## 🎯 **UI Implementation Structure**

### **Dropdown Menu Behavior:**

```
┌─────────────────────────────────┐
│ All Services              ▼     │
├─────────────────────────────────┤
│ ✓ All Services                  │
│ ─────────────────────────       │
│   SQL Databases (7)        ▶    │ → Expands to show MSSQL, PostgreSQL, etc.
│   NoSQL Databases (4)      ▶    │ → Expands to show MongoDB, Cassandra, etc.
│   Cache & In-Memory (3)    ▶    │ → Expands to show Redis, Memcached, SQLite
│   Search & Analytics (2)   ▶    │ → Expands to show Elasticsearch, InfluxDB
│   Message Brokers (1)      ▶    │ → Expands to show RabbitMQ
└─────────────────────────────────┘
```

### **Expanded View Example:**

```
┌─────────────────────────────────┐
│ SQL Databases              ▼     │
├─────────────────────────────────┤
│ ✓ All SQL Databases             │
│ ─────────────────────────       │
│   □ Microsoft SQL Server        │
│   □ PostgreSQL                  │
│   □ MySQL                       │
│   □ MariaDB                     │
│   □ Oracle Database             │
│   □ IBM DB2                     │
│   □ Firebird                    │
└─────────────────────────────────┘
```

---

## 🏗️ **Technical Implementation Details**

### **Category Enum:**
```typescript
enum ServiceCategory {
  ALL = "all",
  SQL_DATABASES = "sql_databases",
  NOSQL_DATABASES = "nosql_databases",
  CACHE_MEMORY = "cache_memory",
  SEARCH_ANALYTICS = "search_analytics",
  MESSAGE_BROKERS = "message_brokers"
}
```

### **Category Metadata:**
```typescript
interface CategoryInfo {
  id: ServiceCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  serviceTypes: ServiceType[];
}
```

### **Service Grouping Logic:**
```go
func GetServiceCategory(serviceType ServiceType) string {
    categoryMap := map[ServiceType]string{
        // SQL Databases
        TypeMSSQL: "sql_databases",
        TypePostgreSQL: "sql_databases",
        TypeMySQL: "sql_databases",
        TypeMariaDB: "sql_databases",
        TypeOracle: "sql_databases",
        TypeDB2: "sql_databases",
        TypeFirebird: "sql_databases",

        // NoSQL Databases
        TypeMongoDB: "nosql_databases",
        TypeCassandra: "nosql_databases",
        TypeCouchDB: "nosql_databases",
        TypeNeo4j: "nosql_databases",

        // Cache & In-Memory
        TypeRedis: "cache_memory",
        TypeMemcached: "cache_memory",
        TypeSQLite: "cache_memory",

        // Search & Analytics
        TypeElasticsearch: "search_analytics",
        TypeInfluxDB: "search_analytics",

        // Message Brokers
        TypeRabbitMQ: "message_brokers",
    }

    return categoryMap[serviceType]
}
```

---

## 🎨 **Visual Design Guidelines**

### **Category Colors:**
- **SQL Databases**: Blue (#0078D4)
- **NoSQL Databases**: Green (#107C10)
- **Cache & In-Memory**: Orange (#FF8C00)
- **Search & Analytics**: Purple (#881798)
- **Message Brokers**: Red (#E81123)

### **Category Icons:**
- **SQL Databases**: 🗄️ Database cylinder
- **NoSQL Databases**: 📦 Package/box
- **Cache & In-Memory**: ⚡ Lightning bolt
- **Search & Analytics**: 🔍 Magnifying glass
- **Message Brokers**: 📨 Envelope/message

---

## 📊 **Statistics Display:**

```
Total: 17 Service Types Across 5 Categories

├── SQL Databases: 7 types (41%)
├── NoSQL Databases: 4 types (24%)
├── Cache & In-Memory: 3 types (18%)
├── Search & Analytics: 2 types (12%)
└── Message Brokers: 1 type (5%)
```

---

## 🔄 **Future Extensions**

### **Additional Categories to Consider:**
- **Web Services & Applications** (Apache, Nginx, IIS)
- **Development Tools** (Docker, Kubernetes services)
- **Security & Authentication** (LDAP, Active Directory)
- **Backup & Storage** (Backup services, File servers)
- **Monitoring & Management** (Prometheus, Grafana agents)

### **Category Filtering:**
- Allow multiple category selection
- Save user preferences
- Quick filters (Running only, Stopped only)
- Search within category
