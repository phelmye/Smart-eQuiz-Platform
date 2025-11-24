/**
 * API Management Page
 * 
 * Main dashboard for tenant API management including:
 * - API keys management
 * - Usage analytics
 * - Webhooks configuration
 * - API documentation
 * 
 * NOTE: This is separate from platform-admin ApiKeys page (third-party service keys).
 * This page is for TENANTS to create API keys for accessing THEIR data.
 */

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Key, BarChart3, Webhook, BookOpen } from 'lucide-react';
import ApiKeysList from '@/components/ApiManagement/ApiKeysList';
import CreateApiKeyDialog from '@/components/ApiManagement/CreateApiKeyDialog';
import type { User } from '@/lib/mockData';

interface ApiManagementPageProps {
  user: User;
}

export default function ApiManagementPage({ user }: ApiManagementPageProps) {
  const [activeTab, setActiveTab] = useState('keys');
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    // The ApiKeysList component will reload automatically
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">API Management</h1>
        <p className="text-gray-600 mt-2">
          Manage API keys, webhooks, and monitor usage for programmatic access to your data
        </p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="keys" className="flex items-center gap-2">
            <Key className="w-4 h-4" />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Usage Analytics
          </TabsTrigger>
          <TabsTrigger value="webhooks" className="flex items-center gap-2">
            <Webhook className="w-4 h-4" />
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="docs" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Documentation
          </TabsTrigger>
        </TabsList>

        {/* API Keys Tab */}
        <TabsContent value="keys" className="space-y-6">
          <ApiKeysList onCreateClick={() => setShowCreateDialog(true)} />
        </TabsContent>

        {/* Usage Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Usage Analytics Coming Soon
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              View detailed analytics about your API usage including request volume,
              response times, error rates, and more.
            </p>
          </div>
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Webhook className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Webhooks Coming Soon
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              Configure webhooks to receive real-time notifications about events
              in your account.
            </p>
          </div>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="space-y-6">
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              API Documentation Coming Soon
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              View comprehensive API documentation with code examples,
              authentication guides, and endpoint reference.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create API Key Dialog */}
      <CreateApiKeyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
