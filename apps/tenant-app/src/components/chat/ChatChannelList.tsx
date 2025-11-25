import React, { useState, useEffect } from 'react';
import { MessageCircle, Users, HelpCircle, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { chatApi, ChatChannel } from '@/lib/chatApi';

interface ChatChannelListProps {
  onSelectChannel: (channel: ChatChannel) => void;
  selectedChannelId?: string;
}

export const ChatChannelList: React.FC<ChatChannelListProps> = ({
  onSelectChannel,
  selectedChannelId
}) => {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'support' | 'team'>('all');

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    try {
      setLoading(true);
      const response = await chatApi.getChannels();
      setChannels(response.data);
    } catch (error) {
      console.error('Failed to load channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const getChannelIcon = (type: ChatChannel['type']) => {
    switch (type) {
      case 'SUPPORT':
        return <HelpCircle className="h-5 w-5 text-blue-500" />;
      case 'TEAM':
        return <Users className="h-5 w-5 text-purple-500" />;
      case 'PLATFORM_SUPPORT':
        return <Shield className="h-5 w-5 text-red-500" />;
      case 'TOURNAMENT':
        return <MessageCircle className="h-5 w-5 text-green-500" />;
      default:
        return <MessageCircle className="h-5 w-5" />;
    }
  };

  const getStatusBadge = (status: ChatChannel['status']) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      ACTIVE: 'default',
      RESOLVED: 'secondary',
      ESCALATED: 'destructive',
      ARCHIVED: 'outline'
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const filteredChannels = channels.filter(channel => {
    if (filter === 'all') return true;
    if (filter === 'support') return channel.type === 'SUPPORT' || channel.type === 'PLATFORM_SUPPORT';
    if (filter === 'team') return channel.type === 'TEAM';
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All ({channels.length})
        </Button>
        <Button
          variant={filter === 'support' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('support')}
        >
          Support ({channels.filter(c => c.type === 'SUPPORT' || c.type === 'PLATFORM_SUPPORT').length})
        </Button>
        <Button
          variant={filter === 'team' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('team')}
        >
          Team ({channels.filter(c => c.type === 'TEAM').length})
        </Button>
      </div>

      {/* Channel List */}
      <div className="space-y-2">
        {filteredChannels.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center text-gray-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p>No conversations yet</p>
            </CardContent>
          </Card>
        ) : (
          filteredChannels.map(channel => {
            const lastMessage = channel.messages[0];
            const isSelected = channel.id === selectedChannelId;

            return (
              <Card
                key={channel.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isSelected ? 'ring-2 ring-blue-500 shadow-md' : ''
                }`}
                onClick={() => onSelectChannel(channel)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    {getChannelIcon(channel.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold truncate">
                          {channel.ticket?.subject || `${channel.type} Chat`}
                        </h3>
                        {getStatusBadge(channel.status)}
                      </div>
                      
                      {lastMessage && (
                        <p className="text-sm text-gray-600 truncate mb-1">
                          {lastMessage.content}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>
                          {channel.participants.length} participant{channel.participants.length !== 1 ? 's' : ''}
                        </span>
                        <span>
                          {new Date(channel.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};
