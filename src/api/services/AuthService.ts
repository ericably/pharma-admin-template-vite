
import apiClient from '../apiClient';

// Type definitions
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken?: string;
  expiresIn?: number;
  user?: {
    id: string | number;
    email: string;
    roles: string[];
    name?: string;
  };
}

class AuthService {
  private endpoint = '/auth';
  private tokenKey = 'pharma_auth_token';
  private refreshTokenKey = 'pharma_refresh_token';
  private userKey = 'pharma_user';

  // Mock credentials for development - remove in production
  private mockCredentials = {
    email: "admin@pharmacy.com",
    password: "password123"
  };

  // Login user and store tokens
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // For development: mock login when API is not available
    if (credentials.email === this.mockCredentials.email && 
        credentials.password === this.mockCredentials.password) {
      
      // Create mock response
      const mockResponse: LoginResponse = {
        token: "mock-jwt-token-for-development",
        refreshToken: "mock-refresh-token",
        expiresIn: 3600,
        user: {
          id: 1,
          email: credentials.email,
          roles: ["ROLE_ADMIN"],
          name: "Admin User"
        }
      };
      
      // Store mock data
      this.setToken(mockResponse.token);
      if (mockResponse.refreshToken) {
        this.setRefreshToken(mockResponse.refreshToken);
      }
      if (mockResponse.user) {
        this.setUser(mockResponse.user);
      }
      
      // Set auth token for API client
      apiClient.setAuthToken(mockResponse.token);
      
      return mockResponse;
    }
    
    // Try real API if mock credentials don't match
    try {
      const response = await apiClient.post<LoginResponse>(`${this.endpoint}/login`, credentials);
      
      if (response?.token) {
        this.setToken(response.token);
        
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }
        
        if (response.user) {
          this.setUser(response.user);
        }
        
        // Set the authentication token for future API requests
        apiClient.setAuthToken(response.token);
      }
      
      return response;
    } catch (error) {
      console.error("API login failed:", error);
      throw new Error("Invalid email or password");
    }
  }

  // Logout user and remove tokens
  logout(): void {
    // Clear tokens from storage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.refreshTokenKey);
    localStorage.removeItem(this.userKey);
    
    // Remove auth header from API client
    apiClient.removeAuthToken();
  }

  // Refresh the access token using a refresh token
  async refreshToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return false;
    }
    
    try {
      const response = await apiClient.post<LoginResponse>(
        `${this.endpoint}/refresh`, 
        { refreshToken }
      );
      
      if (response?.token) {
        this.setToken(response.token);
        
        if (response.refreshToken) {
          this.setRefreshToken(response.refreshToken);
        }
        
        apiClient.setAuthToken(response.token);
        return true;
      }
      
      return false;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  // Check if user is logged in
  isAuthenticated(): boolean {
    const token = this.getToken();
    return !!token;
  }

  // Get current user information
  getUser(): any {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Private helper methods
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  private getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private setRefreshToken(refreshToken: string): void {
    localStorage.setItem(this.refreshTokenKey, refreshToken);
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey);
  }

  private setUser(user: any): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }
}

export default new AuthService();
