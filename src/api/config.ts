// API Configuration
export const API_CONFIG = {
  // Authentication
  AUTH_URL:'http://localhost:8080/api/login_check',
  
  // Main API URL  
  BASE_URL: 'http://localhost:8080/api',
  
  // Request timeout
  TIMEOUT: 10000,
  
  // Default headers
  DEFAULT_HEADERS: {
    'Content-Type': 'application/ld+json',
    'Accept': 'application/ld+json',
  }
} as const;