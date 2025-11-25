/**
 * API Management Client
 * 
 * Client library for interacting with the multi-tenant API Management system.
 * Handles API keys, webhooks, and usage analytics for tenant applications.
 * 
 * NOTE: This is SEPARATE from platform-admin ApiKeys.tsx which manages
 * third-party service keys (Stripe, OpenAI, etc.). This client manages
 * tenant-generated API keys for accessing their own tenant data.
 */

import { supabase } from './supabaseClient';

// ============================================================================
// Types & Interfaces
// ============================================================================

export type ApiKeyType = 'PUBLIC' | 'SECRET' | 'TEST';
export type ApiKeyStatus = 'ACTIVE' | 'REVOKED' | 'EXPIRED';
export type WebhookStatus = 'ACTIVE' | 'PAUSED' | 'FAILED';
export type WebhookDeliveryStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'RETRYING';

export type WebhookEvent = 
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'TOURNAMENT_CREATED'
  | 'TOURNAMENT_STARTED'
  | 'TOURNAMENT_COMPLETED'
  | 'TOURNAMENT_CANCELLED'
  | 'MATCH_STARTED'
  | 'MATCH_COMPLETED'
  | 'PAYMENT_SUCCEEDED'
  | 'PAYMENT_FAILED'
  | 'QUESTION_CREATED'
  | 'QUESTION_UPDATED'
  | 'TICKET_CREATED'
  | 'TICKET_RESOLVED'
  | 'TICKET_ESCALATED';

export interface ApiKey {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  type: ApiKeyType;
  status: ApiKeyStatus;
  keyPrefix: string;
  key?: string; // Only returned on creation
  scopes: string[];
  rateLimit?: number;
  ipWhitelist: string[];
  expiresAt?: Date;
  lastUsedAt?: Date;
  lastUsedIp?: string;
  revokedAt?: Date;
  revokedBy?: string;
  revokedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateApiKeyDto {
  name: string;
  description?: string;
  type: ApiKeyType;
  scopes: string[];
  rateLimit?: number;
  ipWhitelist?: string[];
  expiresAt?: Date;
}

export interface UpdateApiKeyDto {
  name?: string;
  description?: string;
  scopes?: string[];
  rateLimit?: number;
  ipWhitelist?: string[];
}

export interface RevokeApiKeyDto {
  reason: string;
}

export interface ApiKeyUsageStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  successRate: number;
  averageResponseTime: number;
  lastUsed?: Date;
  topEndpoints: Array<{
    endpoint: string;
    count: number;
  }>;
  dailyUsage: Array<{
    date: string;
    requests: number;
  }>;
}

export interface Webhook {
  id: string;
  tenantId: string;
  url: string;
  description?: string;
  secret: string; // HMAC signing secret
  events: WebhookEvent[];
  status: WebhookStatus;
  retryAttempts: number;
  timeout: number;
  consecutiveFailures: number;
  lastDeliveryAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateWebhookDto {
  url: string;
  description?: string;
  events: WebhookEvent[];
  retryAttempts?: number;
  timeout?: number;
}

export interface UpdateWebhookDto {
  url?: string;
  description?: string;
  events?: WebhookEvent[];
  retryAttempts?: number;
  timeout?: number;
  status?: WebhookStatus;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventId: string;
  eventType: WebhookEvent;
  payload: Record<string, unknown>;
  status: WebhookDeliveryStatus;
  attempts: number;
  responseStatus?: number;
  responseBody?: string;
  error?: string;
  deliveredAt?: Date;
  nextRetryAt?: Date;
  createdAt: Date;
}

export interface ApiLog {
  id: string;
  tenantId: string;
  apiKeyId: string;
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  requestSize: number;
  responseSize: number;
  userAgent?: string;
  ipAddress?: string;
  error?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
}

export interface ApiLogQuery {
  apiKeyId?: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}

export interface ApiLogStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  p50ResponseTime: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
  topEndpoints: Array<{
    endpoint: string;
    count: number;
    avgResponseTime: number;
  }>;
  statusCodeDistribution: Record<string, number>;
  dailyRequestVolume: Array<{
    date: string;
    requests: number;
    errors: number;
  }>;
}

// ============================================================================
// API Management Client Class
// ============================================================================

class ApiManagementClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
  }

  /**
   * Get authentication headers with JWT token
   */
  private async getAuthHeaders(): Promise<HeadersInit> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('Not authenticated');
    }

    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.access_token}`
    };
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers = await this.getAuthHeaders();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ============================================================================
  // API Keys Management
  // ============================================================================

  /**
   * Create a new API key
   * WARNING: The full API key is only returned once. Save it immediately!
   */
  async createApiKey(data: CreateApiKeyDto): Promise<ApiKey> {
    return this.request<ApiKey>('/api-keys', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * List all API keys for the current tenant
   */
  async listApiKeys(): Promise<ApiKey[]> {
    return this.request<ApiKey[]>('/api-keys');
  }

  /**
   * Get a specific API key by ID
   */
  async getApiKey(id: string): Promise<ApiKey> {
    return this.request<ApiKey>(`/api-keys/${id}`);
  }

  /**
   * Update an API key's settings
   */
  async updateApiKey(id: string, data: UpdateApiKeyDto): Promise<ApiKey> {
    return this.request<ApiKey>(`/api-keys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * Revoke an API key (cannot be undone)
   */
  async revokeApiKey(id: string, data: RevokeApiKeyDto): Promise<ApiKey> {
    return this.request<ApiKey>(`/api-keys/${id}/revoke`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * Delete an API key permanently
   */
  async deleteApiKey(id: string): Promise<void> {
    return this.request<void>(`/api-keys/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Get usage statistics for a specific API key
   */
  async getApiKeyUsage(id: string, days: number = 7): Promise<ApiKeyUsageStats> {
    return this.request<ApiKeyUsageStats>(`/api-keys/${id}/usage?days=${days}`);
  }

  /**
   * Get overall API key usage statistics
   */
  async getApiKeysStats(): Promise<ApiKeyUsageStats> {
    return this.request<ApiKeyUsageStats>('/api-keys/stats');
  }

  // ============================================================================
  // Webhooks Management
  // ============================================================================

  /**
   * Register a new webhook
   */
  async createWebhook(data: CreateWebhookDto): Promise<Webhook> {
    return this.request<Webhook>('/webhooks', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  /**
   * List all webhooks for the current tenant
   */
  async listWebhooks(): Promise<Webhook[]> {
    return this.request<Webhook[]>('/webhooks');
  }

  /**
   * Get a specific webhook by ID
   */
  async getWebhook(id: string): Promise<Webhook> {
    return this.request<Webhook>(`/webhooks/${id}`);
  }

  /**
   * Update a webhook's configuration
   */
  async updateWebhook(id: string, data: UpdateWebhookDto): Promise<Webhook> {
    return this.request<Webhook>(`/webhooks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  /**
   * Delete a webhook
   */
  async deleteWebhook(id: string): Promise<void> {
    return this.request<void>(`/webhooks/${id}`, {
      method: 'DELETE'
    });
  }

  /**
   * Test a webhook by sending a test payload
   */
  async testWebhook(id: string): Promise<WebhookDelivery> {
    return this.request<WebhookDelivery>(`/webhooks/${id}/test`, {
      method: 'POST'
    });
  }

  /**
   * Get delivery logs for a webhook
   */
  async getWebhookDeliveries(id: string, limit: number = 50): Promise<WebhookDelivery[]> {
    return this.request<WebhookDelivery[]>(`/webhooks/${id}/deliveries?limit=${limit}`);
  }

  /**
   * Retry a failed webhook delivery
   */
  async retryWebhookDelivery(deliveryId: string): Promise<WebhookDelivery> {
    return this.request<WebhookDelivery>(`/webhooks/deliveries/${deliveryId}/retry`, {
      method: 'POST'
    });
  }

  // ============================================================================
  // API Logs & Analytics
  // ============================================================================

  /**
   * Query API logs with filters
   */
  async queryApiLogs(query: ApiLogQuery): Promise<ApiLog[]> {
    const params = new URLSearchParams();
    
    if (query.apiKeyId) params.append('apiKeyId', query.apiKeyId);
    if (query.endpoint) params.append('endpoint', query.endpoint);
    if (query.method) params.append('method', query.method);
    if (query.statusCode) params.append('statusCode', query.statusCode.toString());
    if (query.startDate) params.append('startDate', query.startDate.toISOString());
    if (query.endDate) params.append('endDate', query.endDate.toISOString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.offset) params.append('offset', query.offset.toString());

    return this.request<ApiLog[]>(`/api-logs?${params.toString()}`);
  }

  /**
   * Get aggregated API usage statistics
   */
  async getApiStats(days: number = 30): Promise<ApiLogStats> {
    return this.request<ApiLogStats>(`/api-logs/stats?days=${days}`);
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const apiManagementClient = new ApiManagementClient();

// ============================================================================
// Available API Scopes
// ============================================================================

export const API_SCOPES = {
  USERS: {
    READ: 'users:read',
    WRITE: 'users:write',
    DELETE: 'users:delete',
    ALL: 'users:*'
  },
  TOURNAMENTS: {
    READ: 'tournaments:read',
    WRITE: 'tournaments:write',
    ADMIN: 'tournaments:admin',
    ALL: 'tournaments:*'
  },
  QUESTIONS: {
    READ: 'questions:read',
    WRITE: 'questions:write',
    ALL: 'questions:*'
  },
  ANALYTICS: {
    READ: 'analytics:read',
    ALL: 'analytics:*'
  },
  PAYMENTS: {
    READ: 'payments:read',
    PROCESS: 'payments:process',
    ALL: 'payments:*'
  },
  WEBHOOKS: {
    MANAGE: 'webhooks:manage'
  },
  ADMIN: {
    FULL: 'admin:full' // Grants all permissions
  }
} as const;

/**
 * Get all available scopes as a flat array
 */
export function getAllScopes(): string[] {
  const scopes: string[] = [];
  
  Object.values(API_SCOPES).forEach(category => {
    Object.values(category).forEach(scope => {
      if (!scope.endsWith(':*') && scope !== 'admin:full') {
        scopes.push(scope);
      }
    });
  });
  
  return scopes;
}

/**
 * Get scope display name
 */
export function getScopeDisplayName(scope: string): string {
  const scopeNames: Record<string, string> = {
    'users:read': 'Read Users',
    'users:write': 'Create/Update Users',
    'users:delete': 'Delete Users',
    'tournaments:read': 'Read Tournaments',
    'tournaments:write': 'Create/Update Tournaments',
    'tournaments:admin': 'Administer Tournaments',
    'questions:read': 'Read Questions',
    'questions:write': 'Create/Update Questions',
    'analytics:read': 'Read Analytics',
    'payments:read': 'Read Payments',
    'payments:process': 'Process Payments',
    'webhooks:manage': 'Manage Webhooks',
    'admin:full': 'Full Admin Access'
  };
  
  return scopeNames[scope] || scope;
}

/**
 * Get scope description
 */
export function getScopeDescription(scope: string): string {
  const descriptions: Record<string, string> = {
    'users:read': 'View user profiles and details',
    'users:write': 'Create and update user accounts',
    'users:delete': 'Delete user accounts permanently',
    'tournaments:read': 'View tournament details and standings',
    'tournaments:write': 'Create and modify tournaments',
    'tournaments:admin': 'Full tournament administration including deletion',
    'questions:read': 'View question bank and details',
    'questions:write': 'Create and update questions',
    'analytics:read': 'Access usage analytics and reports',
    'payments:read': 'View payment history and transactions',
    'payments:process': 'Process new payments and refunds',
    'webhooks:manage': 'Create and manage webhook subscriptions',
    'admin:full': 'Complete access to all API resources'
  };
  
  return descriptions[scope] || 'No description available';
}
