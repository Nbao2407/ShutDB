export type ServiceCategory =
  | "sql_databases"
  | "nosql_databases"
  | "cache_memory"
  | "search_analytics"
  | "message_brokers";

export interface CategoryInfo {
  id: ServiceCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const CATEGORY_INFO: Record<ServiceCategory, CategoryInfo> = {
  sql_databases: {
    id: "sql_databases",
    name: "SQL Databases",
    description: "Relational database management systems",
    icon: "🗄️",
    color: "#0078D4",
  },
  nosql_databases: {
    id: "nosql_databases",
    name: "NoSQL Databases",
    description: "Document, graph, and column-family databases",
    icon: "📦",
    color: "#107C10",
  },
  cache_memory: {
    id: "cache_memory",
    name: "Cache & In-Memory",
    description: "High-performance caching and in-memory stores",
    icon: "⚡",
    color: "#FF8C00",
  },
  search_analytics: {
    id: "search_analytics",
    name: "Search & Analytics",
    description: "Search engines and time-series databases",
    icon: "🔍",
    color: "#881798",
  },
  message_brokers: {
    id: "message_brokers",
    name: "Message Brokers",
    description: "Message queuing and streaming services",
    icon: "📨",
    color: "#E81123",
  },
};

export const ALL_CATEGORIES: ServiceCategory[] = [
  "sql_databases",
  "nosql_databases",
  "cache_memory",
  "search_analytics",
  "message_brokers",
];

export function getCategoryInfo(category: ServiceCategory): CategoryInfo {
  return CATEGORY_INFO[category] || {
    id: category,
    name: "Unknown",
    description: "",
    icon: "❓",
    color: "#666666",
  };
}
