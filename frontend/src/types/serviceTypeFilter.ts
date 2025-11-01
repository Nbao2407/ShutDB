import { ServiceType } from "./service";

export interface ServiceTypeInfo {
  id: ServiceType;
  name: string;
  icon: string;
  color: string;
  category: string;
}

export const SERVICE_TYPE_INFO: Record<ServiceType, ServiceTypeInfo> = {
  // SQL Databases
  mssql: {
    id: "mssql",
    name: "Microsoft SQL Server",
    icon: "🗄️",
    color: "#0078D4",
    category: "SQL Databases",
  },
  postgresql: {
    id: "postgresql",
    name: "PostgreSQL",
    icon: "🐘",
    color: "#336791",
    category: "SQL Databases",
  },
  mysql: {
    id: "mysql",
    name: "MySQL",
    icon: "🐬",
    color: "#4479A1",
    category: "SQL Databases",
  },
  mariadb: {
    id: "mariadb",
    name: "MariaDB",
    icon: "🦭",
    color: "#003545",
    category: "SQL Databases",
  },
  oracle: {
    id: "oracle",
    name: "Oracle Database",
    icon: "🔴",
    color: "#F80000",
    category: "SQL Databases",
  },
  db2: {
    id: "db2",
    name: "IBM DB2",
    icon: "💙",
    color: "#054ADA",
    category: "SQL Databases",
  },
  firebird: {
    id: "firebird",
    name: "Firebird",
    icon: "🔥",
    color: "#FF6600",
    category: "SQL Databases",
  },
  sqlite: {
    id: "sqlite",
    name: "SQLite",
    icon: "💽",
    color: "#003B57",
    category: "SQL Databases",
  },

  // NoSQL Databases
  mongodb: {
    id: "mongodb",
    name: "MongoDB",
    icon: "🍃",
    color: "#47A248",
    category: "NoSQL Databases",
  },
  cassandra: {
    id: "cassandra",
    name: "Apache Cassandra",
    icon: "💎",
    color: "#1287B1",
    category: "NoSQL Databases",
  },
  couchdb: {
    id: "couchdb",
    name: "CouchDB",
    icon: "🛋️",
    color: "#E42528",
    category: "NoSQL Databases",
  },
  neo4j: {
    id: "neo4j",
    name: "Neo4j",
    icon: "🕸️",
    color: "#008CC1",
    category: "NoSQL Databases",
  },

  // Cache & In-Memory
  redis: {
    id: "redis",
    name: "Redis",
    icon: "⚡",
    color: "#DC382D",
    category: "Cache & Memory",
  },
  memcached: {
    id: "memcached",
    name: "Memcached",
    icon: "💨",
    color: "#1B4D89",
    category: "Cache & Memory",
  },

  // Search & Analytics
  elasticsearch: {
    id: "elasticsearch",
    name: "Elasticsearch",
    icon: "🔍",
    color: "#FEC514",
    category: "Search & Analytics",
  },
  influxdb: {
    id: "influxdb",
    name: "InfluxDB",
    icon: "📊",
    color: "#22ADF6",
    category: "Search & Analytics",
  },

  // Message Brokers
  rabbitmq: {
    id: "rabbitmq",
    name: "RabbitMQ",
    icon: "🐰",
    color: "#FF6600",
    category: "Message Brokers",
  },
};

export const ALL_SERVICE_TYPES: ServiceType[] = Object.keys(
  SERVICE_TYPE_INFO
) as ServiceType[];

export function getServiceTypeInfo(type: ServiceType): ServiceTypeInfo {
  return (
    SERVICE_TYPE_INFO[type] || {
      id: type,
      name: type,
      icon: "⚙️",
      color: "#666666",
      category: "Other",
    }
  );
}

export function groupServiceTypesByCategory(): Record<string, ServiceType[]> {
  const groups: Record<string, ServiceType[]> = {};

  ALL_SERVICE_TYPES.forEach((type) => {
    const info = SERVICE_TYPE_INFO[type];
    if (!groups[info.category]) {
      groups[info.category] = [];
    }
    groups[info.category].push(type);
  });

  return groups;
}
