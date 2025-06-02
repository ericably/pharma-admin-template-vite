
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
    console.log('🚀 ApiClient initialized with baseUrl:', this.baseUrl);
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

  // Generic request method
  private async request<T>(
    method: string,
    endpoint: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    console.log(`🌐 ${method} request to:`, url);
    console.log('📤 Request headers:', this.headers);
    if (data) console.log('📤 Request data:', data);
    
    const options: RequestInit = {
      method,
      headers: this.headers,
      signal: AbortSignal.timeout(this.defaultTimeout),
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      console.log('⏳ Sending request...');
      const response = await fetch(url, options);
      console.log('📥 Response status:', response.status, response.statusText);
      console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
      
      // Handle HTTP errors
      if (!response.ok) {
        console.error('❌ HTTP Error:', response.status, response.statusText);
        const errorData = await response.json().catch(() => null);
        console.error('❌ Error data:', errorData);
        throw new Error(
          errorData?.['hydra:description'] || 
          errorData?.message || 
          `API error: ${response.status} ${response.statusText}`
        );
      }
      
      // Check if response is empty
      const contentType = response.headers.get('Content-Type');
      console.log('📋 Content-Type:', contentType);
      
      if (contentType && contentType.includes('application/ld+json')) {
        const jsonData = await response.json() as T;
        console.log('✅ Parsed JSON response:', jsonData);
        return jsonData;
      }
      
      console.log('ℹ️ Empty response returned');
      return null as T;
    } catch (error) {
      console.error('❌ API request error:', error);
      throw error;
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
export const apiClient = new ApiClient({
  baseUrl: import.meta.env.VITE_API_URL || '/api', // Default to '/api' if not set
});

export default apiClient;
