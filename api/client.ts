import AsyncStorage from '@react-native-async-storage/async-storage';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000/api/v1' 
  : 'https://api.kobopilot.ng/api/v1';

const API_TIMEOUT = 10000; // 10 seconds

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Error Types
export class ApiError extends Error {
  public statusCode: number;
  public response?: any;

  constructor(message: string, statusCode: number, response?: any) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.response = response;
  }
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private timeout: number;

  constructor(baseURL: string, timeout: number) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user.authToken || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  private async createRequest(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<RequestInit> {
    const url = `${this.baseURL}${endpoint}`;
    const authToken = await this.getAuthToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    return {
      ...options,
      headers,
    };
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const requestOptions = await this.createRequest(endpoint, options);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = 'An error occurred';
        let errorData;

        try {
          const errorResponse = await response.json();
          errorMessage = errorResponse.message || errorMessage;
          errorData = errorResponse;
        } catch {
          // If error response is not JSON, use status text
          errorMessage = response.statusText || errorMessage;
        }

        throw new ApiError(errorMessage, response.status, errorData);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof ApiError) {
        throw error;
      }
      
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout', 408);
      }
      
      throw new ApiError(
        error.message || 'Network error occurred',
        500
      );
    }
  }

  // HTTP Methods
  async get<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }
}

// Export singleton instance
export const apiClient = new ApiClient(API_BASE_URL, API_TIMEOUT);

// Mock API Client for Development
export class MockApiClient {
  private delay = 1000; // Simulate network delay

  private async simulateDelay(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, this.delay));
  }

  async get<T>(endpoint: string): Promise<T> {
    await this.simulateDelay();
    return this.handleMockResponse(endpoint) as T;
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    await this.simulateDelay();
    return this.handleMockResponse(endpoint, data) as T;
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    await this.simulateDelay();
    return this.handleMockResponse(endpoint, data) as T;
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    await this.simulateDelay();
    return this.handleMockResponse(endpoint, data) as T;
  }

  async delete<T>(endpoint: string): Promise<T> {
    await this.simulateDelay();
    return this.handleMockResponse(endpoint) as T;
  }

  private handleMockResponse(endpoint: string, data?: any): any {
    // Mock responses for different endpoints
    if (endpoint.includes('/accounts')) {
      return this.getMockAccounts();
    }
    
    if (endpoint.includes('/transactions')) {
      return this.getMockTransactions();
    }
    
    if (endpoint.includes('/subscriptions')) {
      return this.getMockSubscriptions();
    }
    
    if (endpoint.includes('/user/profile')) {
      return this.getMockUserProfile();
    }

    return { success: true, data: null };
  }

  private getMockAccounts() {
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'GTBank Main Account',
          accountNumber: '0123456789',
          balance: 1247350,
          currency: 'NGN',
          type: 'savings',
          bank: 'GTBank',
          isActive: true,
        },
        {
          id: '2',
          name: 'Access Bank Business',
          accountNumber: '9876543210',
          balance: 567890,
          currency: 'NGN',
          type: 'current',
          bank: 'Access Bank',
          isActive: true,
        },
        {
          id: '3',
          name: 'Zenith Bank Savings',
          accountNumber: '1122334455',
          balance: 234567,
          currency: 'NGN',
          type: 'savings',
          bank: 'Zenith Bank',
          isActive: true,
        },
      ],
    };
  }

  private getMockTransactions() {
    return {
      success: true,
      data: [
        {
          id: '1',
          description: 'GTBank Salary',
          amount: 450000,
          type: 'credit',
          category: 'Income',
          date: '2025-01-15T10:30:00Z',
          bank: 'GTBank',
          accountId: '1',
          reference: 'SAL/2025/001',
          balanceAfter: 1247350,
        },
        {
          id: '2',
          description: 'Netflix Subscription',
          amount: 2900,
          type: 'debit',
          category: 'Entertainment',
          date: '2025-01-14T15:45:00Z',
          bank: 'Access Bank',
          accountId: '2',
          reference: 'NETFLIX/001',
          balanceAfter: 567890,
        },
        {
          id: '3',
          description: 'Jumia Online Shopping',
          amount: 24500,
          type: 'debit',
          category: 'Shopping',
          date: '2025-01-13T14:20:00Z',
          bank: 'GTBank',
          accountId: '1',
          reference: 'JUMIA/2025/001',
          balanceAfter: 1222850,
        },
        {
          id: '4',
          description: 'Uber Trip',
          amount: 3200,
          type: 'debit',
          category: 'Transport',
          date: '2025-01-13T09:15:00Z',
          bank: 'Zenith Bank',
          accountId: '3',
          reference: 'UBER/001',
          balanceAfter: 231367,
        },
        {
          id: '5',
          description: 'Freelance Payment',
          amount: 85000,
          type: 'credit',
          category: 'Income',
          date: '2025-01-12T16:30:00Z',
          bank: 'First Bank',
          accountId: '4',
          reference: 'FREELANCE/001',
          balanceAfter: 85000,
        },
      ],
      pagination: {
        page: 1,
        limit: 20,
        total: 156,
        totalPages: 8,
      },
    };
  }

  private getMockSubscriptions() {
    return {
      success: true,
      data: [
        {
          id: '1',
          name: 'Netflix',
          amount: 2900,
          frequency: 'monthly',
          nextPayment: '2025-02-14T00:00:00Z',
          category: 'Entertainment',
          vendor: 'Netflix Inc.',
          status: 'active',
          bank: 'Access Bank',
          accountId: '2',
          lastPayment: '2025-01-14T00:00:00Z',
          cancellationUrl: 'https://netflix.com/cancel',
        },
        {
          id: '2',
          name: 'Spotify Premium',
          amount: 1200,
          frequency: 'monthly',
          nextPayment: '2025-02-09T00:00:00Z',
          category: 'Entertainment',
          vendor: 'Spotify AB',
          status: 'active',
          bank: 'First Bank',
          accountId: '5',
          lastPayment: '2025-01-09T00:00:00Z',
          cancellationUrl: 'https://spotify.com/account',
        },
        {
          id: '3',
          name: 'Office 365',
          amount: 8500,
          frequency: 'monthly',
          nextPayment: '2025-02-20T00:00:00Z',
          category: 'Productivity',
          vendor: 'Microsoft Corporation',
          status: 'active',
          bank: 'GTBank',
          accountId: '1',
          lastPayment: '2025-01-20T00:00:00Z',
          cancellationUrl: 'https://account.microsoft.com',
        },
      ],
    };
  }

  private getMockUserProfile() {
    return {
      success: true,
      data: {
        id: '1',
        fullName: 'Tayo Adebayo',
        email: 'tayo.adebayo@example.com',
        phone: '+2348012345678',
        dateOfBirth: '1990-05-15',
        isMfaEnabled: true,
        hasConnectedBank: true,
        preferences: {
          currency: 'NGN',
          language: 'en',
          notifications: {
            transactions: true,
            subscriptions: true,
            insights: true,
          },
        },
        createdAt: '2025-01-01T00:00:00Z',
        updatedAt: '2025-01-15T10:30:00Z',
      },
    };
  }
}

// Export mock client for development
export const mockApiClient = new MockApiClient();

// Use mock client in development, real client in production
export const client = __DEV__ ? mockApiClient : apiClient;
