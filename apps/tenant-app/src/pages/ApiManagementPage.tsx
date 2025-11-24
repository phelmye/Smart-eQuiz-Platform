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
import ApiUsageAnalytics from '@/components/ApiManagement/ApiUsageAnalytics';
import WebhookManagement from '@/components/ApiManagement/WebhookManagement';
import ApiDocumentation from '@/components/ApiManagement/ApiDocumentation';
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
          <ApiUsageAnalytics />
        </TabsContent>

        {/* Webhooks Tab */}
        <TabsContent value="webhooks" className="space-y-6">
          <WebhookManagement />
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="docs" className="space-y-6">
          <ApiDocumentation />
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
