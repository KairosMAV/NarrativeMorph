// src/config.js
/**
 * Configurazione centralizzata dell'applicazione
 */

const config = {
    // API configuration
    API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1',
    
    // Authentication
    AUTH_TOKEN_KEY: 'codephoenix_token',
    AUTH_USER_KEY: 'codephoenix_user',
    
    // OAuth
    GITHUB_CLIENT_ID: process.env.REACT_APP_GITHUB_CLIENT_ID || 'your_github_client_id',
    GITLAB_CLIENT_ID: process.env.REACT_APP_GITLAB_CLIENT_ID || 'your_gitlab_client_id',
    
    // Feature flags
    FEATURES: {
      ENABLE_ANALYTICS: true,
      ENABLE_SECURITY: true,
      ENABLE_DOCUMENTATION: true,
      ENABLE_TESTING: true,
      ENABLE_REFACTORING: true,
    },
    
    // Pagination
    DEFAULT_PAGE_SIZE: 10,
    
    // Timeouts
    REQUEST_TIMEOUT: 30000, // 30 seconds
    
    // Development mode helpers
    MOCK_AUTH: process.env.NODE_ENV === 'development' && process.env.REACT_APP_MOCK_AUTH === 'true',
    
    // App version
    VERSION: process.env.REACT_APP_VERSION || '0.1.0',
    
    // Default theme settings
    THEME: {
      DEFAULT_DARK_MODE: false,
      PRIMARY_COLOR: '#1976d2',
      SECONDARY_COLOR: '#9c27b0'
    }
  };
  
  export default config;