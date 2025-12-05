/**
 * API Client for Platform Admin
 * Centralized API communication with the backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean>;
}

class ApiClient {
  private getAuthToken(): string | null {
    return localStorage.getItem('token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private buildUrl(endpoint: string, params?: Record<string, string | number | boolean>): string {
    const url = `${API_BASE_URL}${endpoint}`;
    
    if (!params) return url;

    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      searchParams.append(key, String(value));
    });

    return `${url}?${searchParams.toString()}`;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...this.getHeaders(),
        ...fetchOptions.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // Convenience methods
  get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  patch<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Authentication
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  clearToken(): void {
    localStorage.removeItem('token');
  }

  // File upload
  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const token = this.getAuthToken();
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }
}

// Type-safe API endpoints
export const endpoints = {
  // Auth
  login: '/auth/login',
  logout: '/auth/logout',
  refresh: '/auth/refresh',
  
  // Users
  users: '/users',
  userById: (id: string) => `/users/${id}`,
  
  // Tenants (if available)
  tenants: '/tenants',
  tenantById: (id: string) => `/tenants/${id}`,
  
  // Analytics
  analyticsOverview: '/analytics/overview',
  analyticsEvents: '/analytics/events',
  analyticsConversions: '/analytics/conversions',
  analyticsCtaPerformance: '/analytics/cta-performance',
  analyticsTrafficSources: '/analytics/traffic-sources',
  analyticsDeviceStats: '/analytics/device-stats',
  
  // Media
  media: '/media',
  mediaUpload: '/media/upload',
  mediaById: (id: string) => `/media/${id}`,
  
  // Marketing
  marketingContent: '/marketing/content',
  marketingContentById: (id: string) => `/marketing/content/${id}`,
  
  // Audit
  auditLogs: '/audit/logs',
  auditStats: '/audit/stats',
  auditExport: '/audit/export',
} as const;

// Create singleton instance
const apiClient = new ApiClient();

// Named export
export const api = apiClient;

// Default export
export default apiClient;
