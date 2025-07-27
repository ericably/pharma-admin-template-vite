
// API client for interacting with Symfony API Platform

interface ApiClientOptions {
  baseUrl: string;
  headers?: Record<string, string>;
  defaultTimeout?: number;
}

class ApiClient {
  private baseUrl: string;
  private headers: Record<string, string>;
  private defaultTimeout: number;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl;
    this.headers = {
      'Content-Type': 'application/ld+json',
      'Accept': 'application/ld+json',
      ...options.headers,
    };
    this.defaultTimeout = options.defaultTimeout || 10000; // 10 seconds default
  }

  // Set JWT token for authenticated requests
  setAuthToken(token: string): void {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  // Remove JWT token
  removeAuthToken(): void {
    delete this.headers['Authorization'];
  }

  // Helper method to build URL with query parameters
  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  // Auto-setup token from localStorage on initialization
  private setupAuthFromStorage(): void {
    const token = localStorage.getItem('pharma_auth_token');
    if (token) {
      this.setAuthToken(token);
    }
  }

  // Generic request method with enhanced error handling
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<T> {
    // Ensure we have token from localStorage if available
    this.setupAuthFromStorage();
    
    const url = this.buildUrl(endpoint, params);
    
    // Set appropriate headers based on method
    const requestHeaders = { ...this.headers };
    if (method === 'PATCH') {
      requestHeaders['Content-Type'] = 'application/merge-patch+json';
    }
    
    const options: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(this.defaultTimeout),
      mode: 'cors', // Explicitly set CORS mode
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      
      // Handle authentication errors
      if (response.status === 401) {
        // Token expired or invalid, redirect to login
        localStorage.removeItem('pharma_auth_token');
        localStorage.removeItem('pharma_refresh_token');
        localStorage.removeItem('pharma_user');
        this.removeAuthToken();
        
        // Only redirect if we're not already on login page
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      // Handle other HTTP errors
      if (!response.ok) {
        let errorMessage = `Erreur API: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          errorMessage = errorData?.['hydra:description'] || 
                        errorData?.message || 
                        errorData?.detail ||
                        errorMessage;
        } catch {
          // If we can't parse error response, use default message
        }
        
        throw new Error(errorMessage);
      }
      
      // Check if response is empty
      const contentType = response.headers.get('Content-Type');
      
      if (contentType && (contentType.includes('application/ld+json') || contentType.includes('application/json'))) {
        const jsonData = await response.json() as T;
        return jsonData;
      }
      
      return null as T;
    } catch (error) {
      if (error instanceof Error) {
        // Re-throw our custom errors
        if (error.message.includes('Session expirée') || 
            error.message.includes('Erreur API') ||
            error.message.includes('CORS')) {
          throw error;
        }
      }
      
      // Handle network errors (including CORS issues)
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Erreur de connexion au serveur. Vérifiez votre connexion internet.');
      }
      
      console.error('API request error:', error);
      throw new Error('Une erreur inattendue s\'est produite.');
    }
  }

  // CRUD operations
  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>('GET', endpoint, undefined, params);
  }

  async post<T>(endpoint: string, data: any, params?: Record<string, any>): Promise<T> {
    return this.request<T>('POST', endpoint, data, params);
  }

  async put<T>(endpoint: string, data: any, params?: Record<string, any>): Promise<T> {
    return this.request<T>('PUT', endpoint, data, params);
  }

  async patch<T>(endpoint: string, data: any, params?: Record<string, any>): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, params);
  }

  async delete<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, params);
  }

  // API Platform specific methods for collection handling
  async getCollection<T>(endpoint: string, page = 1, itemsPerPage = 30, filters?: Record<string, any>): Promise<{
    items: T[];
    totalItems: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  }> {
    const params = {
      page,
      itemsPerPage,
      ...filters,
    };
    
    const response = await this.get<any>(endpoint, params);
    
    return {
      items: response['hydra:member'] || [],
      totalItems: response['hydra:totalItems'] || 0,
      itemsPerPage,
      totalPages: Math.ceil((response['hydra:totalItems'] || 0) / itemsPerPage),
      currentPage: page,
    };
  }
}

// Create and export a singleton instance
import { API_CONFIG } from './config';

export const apiClient = new ApiClient({
  baseUrl: API_CONFIG.BASE_URL,
  headers: API_CONFIG.DEFAULT_HEADERS,
  defaultTimeout: API_CONFIG.TIMEOUT,
});

// Auto-setup token from localStorage on module load
const token = localStorage.getItem('pharma_auth_token');
if (token) {
  apiClient.setAuthToken(token);
}

export default apiClient;
