import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MarketingContentManager } from '@/components/MarketingContentManager';
import MarketingSiteConfig from './MarketingConfig';
import { useAuth } from '@/contexts/AuthContext';

export default function MarketingManagement() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="p-6">
      <Tabs defaultValue="content" className="space-y-6">
        <TabsList>
          <TabsTrigger value="content">Page Content</TabsTrigger>
          <TabsTrigger value="config">Site Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="content">
          <MarketingContentManager />
        </TabsContent>

        <TabsContent value="config">
          <MarketingSiteConfig user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
