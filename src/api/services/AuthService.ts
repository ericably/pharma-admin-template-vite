
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
    try {
      // API Platform JWT login_check endpoint
      const { API_CONFIG } = await import('../config');
      const response = await fetch(API_CONFIG.AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        body: JSON.stringify({
          username: credentials.email,
          password: credentials.password
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.token) {
          const loginResponse: LoginResponse = {
            token: data.token,
            user: {
              id: data.user?.id || 1,
              email: credentials.email,
              roles: data.user?.roles || ["ROLE_USER"],
              name: data.user?.name || credentials.email.split('@')[0]
            }
          };
          
          // Store token and user data
          this.setToken(loginResponse.token);
          this.setUser(loginResponse.user);
          
          // Set auth token for future API requests
          apiClient.setAuthToken(loginResponse.token);
          
          return loginResponse;
        }
      }
      
      // Handle authentication errors
      if (response.status === 401) {
        throw new Error("Email ou mot de passe incorrect");
      }
      
      throw new Error("Erreur de connexion au serveur");
    } catch (error) {
      
      // Fallback to mock for development only
      if (process.env.NODE_ENV === 'development' &&
          credentials.email === this.mockCredentials.email && 
          credentials.password === this.mockCredentials.password) {
        
        const mockResponse: LoginResponse = {
          token: "mock-jwt-token-for-development",
          user: {
            id: 1,
            email: credentials.email,
            roles: ["ROLE_ADMIN"],
            name: "Admin User"
          }
        };
        
        this.setToken(mockResponse.token);
        this.setUser(mockResponse.user);
        apiClient.setAuthToken(mockResponse.token);
        
        return mockResponse;
      }
      
      // Re-throw the error with original message or a user-friendly one
      throw error instanceof Error ? error : new Error("Erreur de connexion");
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
    const token = this.getToken();
    
    if (!token) {
      return false;
    }
    
    try {
      // Set token in API client
      apiClient.setAuthToken(token);
      
      // Validate token by making a test request to a protected endpoint
      const { API_CONFIG } = await import('../config');
      const response = await fetch(`${API_CONFIG.BASE_URL}/test-auth`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/ld+json',
        },
        mode: 'cors',
      });
      
      // If token is valid, return true
      if (response.ok || response.status !== 401) {
        return true;
      }
      
      // Token is invalid, logout
      this.logout();
      return false;
    } catch (error) {
      // On network error, don't logout (could be temporary)
      // Just return false but keep token for retry
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
