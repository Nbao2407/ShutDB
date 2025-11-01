/**
 * Fluent System Icons mapping for database services
 * Uses Microsoft's Fluent System Icons for consistent professional appearance
 */

// Fluent System Icon SVG components
export const FluentIcons = {
  // Database and Storage Icons
  Database: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2C14.42 2 18 3.34 18 5v10c0 1.66-3.58 3-8 3s-8-1.34-8-3V5c0-1.66 3.58-3 8-3zm0 1C6.13 3 3 4.12 3 5s3.13 2 7 2 7-.12 7-2-3.13-2-7-2zm7 4.07c-1.66.91-4.25 1.43-7 1.43s-5.34-.52-7-1.43V9.5c0 .88 3.13 2 7 2s7-1.12 7-2V6.07zm0 3.5c-1.66.91-4.25 1.43-7 1.43s-5.34-.52-7-1.43v2.93c0 .88 3.13 2 7 2s7-1.12 7-2V9.57z"/>
    </svg>
  ),
  
  DatabaseStack: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 1.5c4.69 0 8.5 1.34 8.5 3v1.5c0 1.66-3.81 3-8.5 3S1.5 7.66 1.5 6V4.5c0-1.66 3.81-3 8.5-3zm0 1c-4.1 0-7.5 1.12-7.5 2s3.4 2 7.5 2 7.5-1.12 7.5-2-3.4-2-7.5-2zm7.5 3.75c-1.58.86-4.13 1.25-7.5 1.25s-5.92-.39-7.5-1.25V8.5c0 .88 3.4 2 7.5 2s7.5-1.12 7.5-2V6.25zm0 3c-1.58.86-4.13 1.25-7.5 1.25s-5.92-.39-7.5-1.25V11.5c0 .88 3.4 2 7.5 2s7.5-1.12 7.5-2V9.25zm0 3c-1.58.86-4.13 1.25-7.5 1.25s-5.92-.39-7.5-1.25V14.5c0 .88 3.4 2 7.5 2s7.5-1.12 7.5-2v-1.25z"/>
    </svg>
  ),

  // Document and NoSQL Icons  
  Document: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M4 2a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V6.41c0-.4-.16-.78-.44-1.06l-2.91-2.91A1.5 1.5 0 0 0 13.59 2H4zM3 4a1 1 0 0 1 1-1h9v3.5c0 .28.22.5.5.5H17v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4zm11 .41V6h1.59L14 4.41z"/>
    </svg>
  ),

  DocumentStack: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3.5 2A1.5 1.5 0 0 0 2 3.5v11A1.5 1.5 0 0 0 3.5 16H5v1.5A1.5 1.5 0 0 0 6.5 19h11a1.5 1.5 0 0 0 1.5-1.5v-11A1.5 1.5 0 0 0 17.5 5H16V3.5A1.5 1.5 0 0 0 14.5 2h-11zM5 15V6h9.5a.5.5 0 0 1 .5.5V15H3.5a.5.5 0 0 1-.5-.5zM16 6v9H6.5a.5.5 0 0 1-.5-.5V6h8.5a.5.5 0 0 1 .5.5z"/>
    </svg>
  ),

  // Performance and Cache Icons
  Flash: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M7.5 2a.5.5 0 0 1 .46.31L10.98 10H15.5a.5.5 0 0 1 .37.83l-8 9a.5.5 0 0 1-.87-.48L9.02 12H4.5a.5.5 0 0 1-.37-.83l8-9A.5.5 0 0 1 7.5 2z"/>
    </svg>
  ),

  Server: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3zm2-1a1 1 0 0 0-1 1v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H5zm0 8a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5zm-1 2a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4z"/>
    </svg>
  ),

  // Search and Analytics Icons
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M8.5 3a5.5 5.5 0 0 1 4.38 8.82l4.15 4.15a.75.75 0 0 1-1.06 1.06l-4.15-4.15A5.5 5.5 0 1 1 8.5 3zm0 1.5a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/>
    </svg>
  ),

  ChartLine: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3.5 2a.5.5 0 0 1 .5.5v14a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-14a.5.5 0 0 1 .5-.5h1zM6 8.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-8zM10.5 5a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5h1zM14 2.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v14a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-14z"/>
    </svg>
  ),

  // Message and Communication Icons
  ChatBubblesQuestion: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M5.5 2A3.5 3.5 0 0 0 2 5.5v4A3.5 3.5 0 0 0 5.5 13H7v2.5c0 .83.67 1.5 1.5 1.5.35 0 .68-.12.94-.34L12.76 13h1.74A3.5 3.5 0 0 0 18 9.5v-4A3.5 3.5 0 0 0 14.5 2h-9zM3 5.5A2.5 2.5 0 0 1 5.5 3h9A2.5 2.5 0 0 1 17 5.5v4a2.5 2.5 0 0 1-2.5 2.5h-2.24l-2.5 2.5c-.12.12-.26.2-.41.25-.08.02-.16.03-.25.03a.5.5 0 0 1-.5-.5V12H5.5A2.5 2.5 0 0 1 3 9.5v-4z"/>
    </svg>
  ),

  // All Services Icon
  Apps: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M3 3a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3zm2-1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H5zm6 1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2V3zm2-1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-2zM3 13a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-2zm2-1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1H5zm6 1a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-2zm2-1a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-2z"/>
    </svg>
  ),

  // Action Icons
  Play: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M6.25 4.5c0-.83.67-1.5 1.5-1.5.35 0 .68.12.94.34l6.5 5c.6.46.6 1.36 0 1.82l-6.5 5c-.26.22-.59.34-.94.34-.83 0-1.5-.67-1.5-1.5v-9z"/>
    </svg>
  ),

  Stop: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M4.5 4.5A1.5 1.5 0 0 1 6 3h8a1.5 1.5 0 0 1 1.5 1.5v11A1.5 1.5 0 0 1 14 17H6a1.5 1.5 0 0 1-1.5-1.5v-11z"/>
    </svg>
  ),

  ArrowClockwise: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2.5a7.5 7.5 0 0 1 7.5 7.5.75.75 0 0 1-1.5 0 6 6 0 1 0-1.76 4.24l-.72-.72a.75.75 0 0 1 1.06-1.06l2 2c.3.3.3.77 0 1.06l-2 2a.75.75 0 1 1-1.06-1.06l.72-.72A7.5 7.5 0 0 1 10 2.5z"/>
    </svg>
  ),

  ChevronRight: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M7.73 4.22a.75.75 0 0 1 1.06 0l4.5 4.5c.3.3.3.77 0 1.06l-4.5 4.5a.75.75 0 1 1-1.06-1.06L11.69 10 7.73 6.03a.75.75 0 0 1 0-1.06z"/>
    </svg>
  ),

  ChevronDown: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M4.22 7.73a.75.75 0 0 1 1.06 0L10 12.44l4.72-4.71a.75.75 0 1 1 1.06 1.06l-5.25 5.25c-.3.3-.77.3-1.06 0L4.22 8.79a.75.75 0 0 1 0-1.06z"/>
    </svg>
  ),

  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M19.07 11.5h-2.19c-.14-.67-.37-1.31-.69-1.89l1.55-1.55a1.5 1.5 0 0 0-2.12-2.12l-1.55 1.55c-.58-.32-1.22-.55-1.89-.69V.93a1.5 1.5 0 0 0-3 0v2.19c-.67.14-1.31.37-1.89.69L6.28 2.26a1.5 1.5 0 0 0-2.12 2.12l1.55 1.55c-.32.58-.55 1.22-.69 1.89H.93a1.5 1.5 0 0 0 0 3h2.19c.14.67.37 1.31.69 1.89l-1.55 1.55a1.5 1.5 0 0 0 2.12 2.12l1.55-1.55c.58.32 1.22.55 1.89.69v2.19a1.5 1.5 0 0 0 3 0v-2.19c.67-.14 1.31-.37 1.89-.69l1.55 1.55a1.5 1.5 0 0 0 2.12-2.12l-1.55-1.55c.32-.58.55-1.22.69-1.89h2.19a1.5 1.5 0 0 0 0-3zM10 14.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"/>
    </svg>
  ),

  Error: () => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
      <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16zM9 6a1 1 0 1 1 2 0v3.5a1 1 0 1 1-2 0V6zm1 7.25a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/>
    </svg>
  ),
};

// Service type to Fluent icon mapping
export const getFluentIcon = (serviceType: string) => {
  switch (serviceType.toLowerCase()) {
    // SQL Databases
    case 'mssql':
    case 'postgresql': 
    case 'mysql':
    case 'mariadb':
    case 'oracle':
    case 'db2':
    case 'firebird':
    case 'sqlite':
      return FluentIcons.Database;
    
    // NoSQL Databases
    case 'mongodb':
    case 'cassandra':
    case 'couchdb':
    case 'neo4j':
      return FluentIcons.Document;
    
    // Cache & Memory
    case 'redis':
    case 'memcached':
      return FluentIcons.Flash;
    
    // Search & Analytics
    case 'elasticsearch':
      return FluentIcons.Search;
    case 'influxdb':
      return FluentIcons.ChartLine;
    
    // Message Brokers
    case 'rabbitmq':
      return FluentIcons.ChatBubblesQuestion;
    
    // Default
    default:
      return FluentIcons.Server;
  }
};

// Category to Fluent icon mapping
export const getCategoryFluentIcon = (category: string) => {
  switch (category.toLowerCase()) {
    case 'sql databases':
    case 'sql_databases':
      return FluentIcons.Database;
    case 'nosql databases':
    case 'nosql_databases':
      return FluentIcons.DocumentStack;
    case 'cache & memory':
    case 'cache_memory':
      return FluentIcons.Flash;
    case 'search & analytics':
    case 'search_analytics':
      return FluentIcons.Search;
    case 'message brokers':
    case 'message_brokers':
      return FluentIcons.ChatBubblesQuestion;
    case 'all':
    default:
      return FluentIcons.Apps;
  }
};

// Action icons
export const ActionIcons = {
  Play: FluentIcons.Play,
  Stop: FluentIcons.Stop,
  Restart: FluentIcons.ArrowClockwise,
  ChevronRight: FluentIcons.ChevronRight,
  ChevronDown: FluentIcons.ChevronDown,
  Settings: FluentIcons.Settings,
};