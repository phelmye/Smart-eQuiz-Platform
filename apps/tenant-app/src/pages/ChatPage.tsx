import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { ChatChannelList } from '@/components/chat/ChatChannelList';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { CreateSupportTicketDialog } from '@/components/chat/CreateSupportTicketDialog';
import { ChatChannel, chatApi } from '@/lib/chatApi';
import { chatSocket } from '@/lib/chatSocket';

interface ChatPageProps {
  currentUserId: string;
  currentUserName: string;
  currentUserEmail: string;
  tenantId: string;
}

export const ChatPage: React.FC<ChatPageProps> = ({
  currentUserId,
  currentUserName,
  currentUserEmail,
  tenantId
}) => {
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    // Connect to WebSocket
    chatSocket.connect(currentUserId, tenantId);

    return () => {
      chatSocket.disconnect();
    };
  }, [currentUserId, tenantId]);

  const handleChannelSelect = (channel: ChatChannel) => {
    setSelectedChannel(channel);
  };

  const handleTicketCreated = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleEscalate = async () => {
    if (!selectedChannel) return;

    const reason = prompt('Please provide a reason for escalation:');
    if (!reason) return;

    try {
      await chatApi.escalateChannel(selectedChannel.id, reason);
      alert('Ticket escalated to platform support successfully.');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to escalate:', error);
      alert('Failed to escalate ticket. Please try again.');
    }
  };

  const handleResolve = async () => {
    if (!selectedChannel) return;

    const resolution = prompt('Please provide a resolution summary (optional):');
    
    try {
      await chatApi.resolveChannel(selectedChannel.id, resolution || undefined);
      alert('Channel marked as resolved.');
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to resolve:', error);
      alert('Failed to resolve channel. Please try again.');
    }
  };

  const handleArchive = async () => {
    if (!selectedChannel) return;

    if (!confirm('Are you sure you want to archive this channel? This cannot be undone.')) {
      return;
    }

    try {
      await chatApi.archiveChannel(selectedChannel.id);
      alert('Channel archived successfully.');
      setSelectedChannel(null);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Failed to archive:', error);
      alert('Failed to archive channel. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageCircle className="h-8 w-8 text-blue-600" />
            Messages & Support
          </h1>
          <p className="text-gray-600 mt-1">
            Communicate with your team and get support
          </p>
        </div>
        <CreateSupportTicketDialog onTicketCreated={handleTicketCreated} />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Channel List */}
        <div className="md:col-span-1">
          <ChatChannelList
            key={refreshTrigger}
            onSelectChannel={handleChannelSelect}
            selectedChannelId={selectedChannel?.id}
          />
        </div>

        {/* Chat Window */}
        <div className="md:col-span-2">
          {selectedChannel ? (
            <ChatWindow
              channel={selectedChannel}
              currentUserId={currentUserId}
              currentUserName={currentUserName}
              onEscalate={handleEscalate}
              onResolve={handleResolve}
              onArchive={handleArchive}
            />
          ) : (
            <div className="flex items-center justify-center h-[600px] border-2 border-dashed rounded-lg">
              <div className="text-center text-gray-400">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">Select a conversation to start chatting</p>
                <p className="text-sm mt-2">or create a new support ticket</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
