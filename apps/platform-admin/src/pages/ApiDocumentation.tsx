import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
// import { Tabs } from '../components/ui/tabs'; // Unused
import {
  Code,
  Book,
  Key,
  Zap,
  Shield,
  Copy,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';

interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  description: string;
  auth: boolean;
  parameters?: { name: string; type: string; required: boolean; description: string }[];
  requestBody?: string;
  response: string;
}

export default function ApiDocumentation() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('authentication');

  const methodColors = {
    GET: 'bg-blue-100 text-blue-800',
    POST: 'bg-green-100 text-green-800',
    PUT: 'bg-yellow-100 text-yellow-800',
    PATCH: 'bg-orange-100 text-orange-800',
    DELETE: 'bg-red-100 text-red-800',
  };

  const categories = [
    { id: 'authentication', name: 'Authentication', icon: Shield },
    { id: 'tenants', name: 'Tenants', icon: Book },
    { id: 'users', name: 'Users', icon: Code },
    { id: 'analytics', name: 'Analytics', icon: Zap },
  ];

  const endpoints: Record<string, ApiEndpoint[]> = {
    authentication: [
      {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Authenticate a user and receive an access token',
        auth: false,
        requestBody: `{
  "email": "admin@example.com",
  "password": "password123"
}`,
        response: `{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "usr_123",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin"
  }
}`,
      },
      {
        method: 'POST',
        path: '/api/auth/refresh',
        description: 'Refresh an expired access token',
        auth: true,
        requestBody: `{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`,
        response: `{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}`,
      },
      {
        method: 'POST',
        path: '/api/auth/logout',
        description: 'Invalidate the current session',
        auth: true,
        response: `{
  "message": "Successfully logged out"
}`,
      },
    ],
    tenants: [
      {
        method: 'GET',
        path: '/api/tenants',
        description: 'Get a list of all tenants with optional filtering',
        auth: true,
        parameters: [
          { name: 'page', type: 'integer', required: false, description: 'Page number (default: 1)' },
          { name: 'limit', type: 'integer', required: false, description: 'Items per page (default: 20)' },
          { name: 'status', type: 'string', required: false, description: 'Filter by status (active, trial, suspended)' },
          { name: 'plan', type: 'string', required: false, description: 'Filter by plan (Starter, Professional, Enterprise)' },
        ],
        response: `{
  "tenants": [
    {
      "id": "tenant_123",
      "name": "Acme University",
      "subdomain": "acme",
      "plan": "Enterprise",
      "status": "active",
      "users": 450,
      "mrr": 14900,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 248,
    "pages": 13
  }
}`,
      },
      {
        method: 'POST',
        path: '/api/tenants',
        description: 'Create a new tenant organization',
        auth: true,
        requestBody: `{
  "name": "Tech Academy",
  "subdomain": "techacademy",
  "plan": "Professional",
  "adminEmail": "admin@techacademy.com",
  "adminName": "John Doe"
}`,
        response: `{
  "tenant": {
    "id": "tenant_456",
    "name": "Tech Academy",
    "subdomain": "techacademy",
    "plan": "Professional",
    "status": "active",
    "createdAt": "2024-02-15T14:30:00Z"
  }
}`,
      },
      {
        method: 'GET',
        path: '/api/tenants/:id',
        description: 'Get detailed information about a specific tenant',
        auth: true,
        response: `{
  "id": "tenant_123",
  "name": "Acme University",
  "subdomain": "acme",
  "plan": "Enterprise",
  "status": "active",
  "users": 450,
  "mrr": 14900,
  "storage": {
    "used": 8500000000,
    "limit": 100000000000
  },
  "features": ["custom_branding", "sso", "api_access"],
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-02-15T09:20:00Z"
}`,
      },
      {
        method: 'PATCH',
        path: '/api/tenants/:id',
        description: 'Update tenant information',
        auth: true,
        requestBody: `{
  "name": "Acme University (Updated)",
  "plan": "Enterprise",
  "status": "active"
}`,
        response: `{
  "tenant": {
    "id": "tenant_123",
    "name": "Acme University (Updated)",
    "plan": "Enterprise",
    "updatedAt": "2024-02-15T14:45:00Z"
  }
}`,
      },
      {
        method: 'DELETE',
        path: '/api/tenants/:id',
        description: 'Delete a tenant and all associated data',
        auth: true,
        response: `{
  "message": "Tenant successfully deleted",
  "deletedAt": "2024-02-15T15:00:00Z"
}`,
      },
    ],
    users: [
      {
        method: 'GET',
        path: '/api/users',
        description: 'Get a list of platform users',
        auth: true,
        parameters: [
          { name: 'page', type: 'integer', required: false, description: 'Page number' },
          { name: 'limit', type: 'integer', required: false, description: 'Items per page' },
          { name: 'role', type: 'string', required: false, description: 'Filter by role' },
        ],
        response: `{
  "users": [
    {
      "id": "usr_123",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin",
      "status": "active",
      "lastLogin": "2024-02-15T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 156
  }
}`,
      },
      {
        method: 'POST',
        path: '/api/users',
        description: 'Create a new platform user',
        auth: true,
        requestBody: `{
  "email": "newuser@example.com",
  "name": "New User",
  "role": "support",
  "password": "securePassword123"
}`,
        response: `{
  "user": {
    "id": "usr_789",
    "email": "newuser@example.com",
    "name": "New User",
    "role": "support",
    "status": "active",
    "createdAt": "2024-02-15T15:00:00Z"
  }
}`,
      },
    ],
    analytics: [
      {
        method: 'GET',
        path: '/api/analytics/overview',
        description: 'Get platform-wide analytics overview',
        auth: true,
        parameters: [
          { name: 'startDate', type: 'string', required: false, description: 'Start date (ISO 8601)' },
          { name: 'endDate', type: 'string', required: false, description: 'End date (ISO 8601)' },
        ],
        response: `{
  "overview": {
    "totalEvents": 125430,
    "uniqueVisitors": 45230,
    "totalConversions": 3450,
    "conversionRate": 7.6
  },
  "dateRange": {
    "start": "2024-02-01T00:00:00Z",
    "end": "2024-02-15T23:59:59Z"
  }
}`,
      },
      {
        method: 'GET',
        path: '/api/analytics/revenue',
        description: 'Get revenue analytics and trends',
        auth: true,
        response: `{
  "revenue": {
    "current": 54239,
    "previous": 48000,
    "growth": 13.0,
    "mrr": 54239,
    "arr": 650868
  },
  "breakdown": [
    {
      "plan": "Enterprise",
      "revenue": 521650,
      "customers": 35
    }
  ]
}`,
      },
    ],
  };

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Documentation</h1>
        <p className="mt-1 text-sm text-gray-500">
          Complete reference for the Smart eQuiz Platform API
        </p>
      </div>

      {/* Quick Start */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Quick Start</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Base URL</h3>
              <div className="flex items-center space-x-2">
                <code className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-sm font-mono">
                  https://api.smartequiz.com/v1
                </code>
                <button
                  onClick={() => copyToClipboard('https://api.smartequiz.com/v1', 'base-url')}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  {copiedEndpoint === 'base-url' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Authentication</h3>
              <p className="text-sm text-gray-600 mb-2">
                Include your API key in the Authorization header:
              </p>
              <div className="flex items-center space-x-2">
                <code className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-sm font-mono">
                  Authorization: Bearer YOUR_API_KEY
                </code>
                <button
                  onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth-header')}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  {copiedEndpoint === 'auth-header' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <Key className="h-6 w-6 text-blue-600 mb-2" />
                <h4 className="font-semibold text-gray-900">API Keys</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your API keys in Settings
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <Book className="h-6 w-6 text-green-600 mb-2" />
                <h4 className="font-semibold text-gray-900">Rate Limits</h4>
                <p className="text-sm text-gray-600 mt-1">
                  1000 requests per hour
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <ExternalLink className="h-6 w-6 text-purple-600 mb-2" />
                <h4 className="font-semibold text-gray-900">Support</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Contact support for help
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Tabs */}
      <div className="flex space-x-2 border-b border-gray-200">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 border-b-2 transition-colors ${
                selectedCategory === category.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{category.name}</span>
            </button>
          );
        })}
      </div>

      {/* Endpoints */}
      <div className="space-y-4">
        {endpoints[selectedCategory]?.map((endpoint, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Badge className={methodColors[endpoint.method]}>
                      {endpoint.method}
                    </Badge>
                    <code className="text-sm font-mono text-gray-900">{endpoint.path}</code>
                    {endpoint.auth && (
                      <Badge className="bg-purple-100 text-purple-800">
                        <Shield className="h-3 w-3 mr-1 inline" />
                        Auth Required
                      </Badge>
                    )}
                  </div>
                  <button
                    onClick={() => copyToClipboard(endpoint.path, `endpoint-${index}`)}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    {copiedEndpoint === `endpoint-${index}` ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4 text-gray-600" />
                    )}
                  </button>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600">{endpoint.description}</p>

                {/* Parameters */}
                {endpoint.parameters && endpoint.parameters.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Parameters</h4>
                    <div className="space-y-2">
                      {endpoint.parameters.map((param, pidx) => (
                        <div key={pidx} className="flex items-start space-x-4 text-sm">
                          <code className="font-mono text-blue-600 min-w-[120px]">
                            {param.name}
                          </code>
                          <span className="text-gray-500 min-w-[60px]">{param.type}</span>
                          <Badge className={param.required ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}>
                            {param.required ? 'required' : 'optional'}
                          </Badge>
                          <span className="text-gray-600 flex-1">{param.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Request Body */}
                {endpoint.requestBody && (
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-2">Request Body</h4>
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{endpoint.requestBody}</code>
                    </pre>
                  </div>
                )}

                {/* Response */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Response</h4>
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{endpoint.response}</code>
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Error Codes */}
      <Card>
        <CardHeader>
          <CardTitle>Common Error Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { code: '400', title: 'Bad Request', description: 'The request was invalid or cannot be served' },
              { code: '401', title: 'Unauthorized', description: 'Authentication credentials were missing or incorrect' },
              { code: '403', title: 'Forbidden', description: 'The request is understood, but it has been refused' },
              { code: '404', title: 'Not Found', description: 'The requested resource could not be found' },
              { code: '429', title: 'Too Many Requests', description: 'Rate limit exceeded' },
              { code: '500', title: 'Internal Server Error', description: 'Something went wrong on our end' },
            ].map((error) => (
              <div key={error.code} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <Badge className="bg-red-100 text-red-800">{error.code}</Badge>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900">{error.title}</h5>
                  <p className="text-sm text-gray-600">{error.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
