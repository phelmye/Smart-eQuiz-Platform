import React, { useState, useEffect, useRef } from 'react';
import { Send, MoreVertical, AlertCircle, UserPlus, CheckCircle, Archive } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { chatApi, ChatChannel, ChatMessage } from '@/lib/chatApi';
import { chatSocket } from '@/lib/chatSocket';

interface ChatWindowProps {
  channel: ChatChannel;
  currentUserId: string;
  currentUserName: string;
  onEscalate?: () => void;
  onAssign?: () => void;
  onResolve?: () => void;
  onArchive?: () => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  channel,
  currentUserId,
  currentUserName,
  onEscalate,
  onAssign,
  onResolve,
  onArchive
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    loadMessages();
    chatSocket.joinChannel(channel.id);

    // Listen for new messages
    const handleNewMessage = (data: { channelId: string; message: ChatMessage }) => {
      if (data.channelId === channel.id) {
        setMessages(prev => [...prev, data.message]);
      }
    };

    const handleUserTyping = (data: { channelId: string; userId: string; userName: string }) => {
      if (data.channelId === channel.id && data.userId !== currentUserId) {
        setTypingUsers(prev => new Set(prev).add(data.userName));
        setTimeout(() => {
          setTypingUsers(prev => {
            const next = new Set(prev);
            next.delete(data.userName);
            return next;
          });
        }, 3000);
      }
    };

    const handleUserStopTyping = (data: { channelId: string; userId: string }) => {
      if (data.channelId === channel.id) {
        setTypingUsers(prev => {
          const next = new Set(prev);
          // Remove by userId (would need to map userName to userId)
          return next;
        });
      }
    };

    chatSocket.onNewMessage(handleNewMessage);
    chatSocket.onUserTyping(handleUserTyping);
    chatSocket.onUserStopTyping(handleUserStopTyping);

    return () => {
      chatSocket.leaveChannel(channel.id);
      chatSocket.off('new_message');
      chatSocket.off('user_typing');
      chatSocket.off('user_stop_typing');
    };
  }, [channel.id, currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const response = await chatApi.getChannel(channel.id);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Failed to load messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || sending) return;

    try {
      setSending(true);
      chatSocket.stopTyping(channel.id);
      
      // Send via socket for real-time
      chatSocket.sendMessage(channel.id, inputValue.trim());
      
      setInputValue('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    
    // Emit typing indicator
    chatSocket.startTyping(channel.id, currentUserName);
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      chatSocket.stopTyping(channel.id);
    }, 3000);
  };

  const getSenderName = (message: ChatMessage) => {
    if (message.senderType === 'SYSTEM') return 'System';
    return message.sender?.email || 'Unknown';
  };

  const getSenderColor = (senderType: ChatMessage['senderType']) => {
    switch (senderType) {
      case 'SUPER_ADMIN':
        return 'bg-red-100 text-red-800';
      case 'TENANT_ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'MANAGEMENT_TEAM':
        return 'bg-blue-100 text-blue-800';
      case 'SYSTEM':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">
              {channel.ticket?.subject || `${channel.type} Chat`}
            </h2>
            <p className="text-sm text-gray-500">
              {channel.participants.length} participant{channel.participants.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onEscalate && channel.status !== 'ESCALATED' && (
                <DropdownMenuItem onClick={onEscalate}>
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Escalate to Platform Support
                </DropdownMenuItem>
              )}
              {onAssign && (
                <DropdownMenuItem onClick={onAssign}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Assign to Team Member
                </DropdownMenuItem>
              )}
              {onResolve && channel.status === 'ACTIVE' && (
                <DropdownMenuItem onClick={onResolve}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Resolved
                </DropdownMenuItem>
              )}
              {onArchive && (
                <DropdownMenuItem onClick={onArchive} className="text-red-600">
                  <Archive className="h-4 w-4 mr-2" />
                  Archive Channel
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => {
          const isOwnMessage = message.senderId === currentUserId;
          const isSystemMessage = message.senderType === 'SYSTEM';

          if (isSystemMessage) {
            return (
              <div key={message.id} className="flex justify-center">
                <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-full">
                  {message.content}
                </div>
              </div>
            );
          }

          return (
            <div
              key={message.id}
              className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getSenderColor(message.senderType)}`}>
                    {getSenderName(message)}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    isOwnMessage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Typing Indicator */}
        {typingUsers.size > 0 && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-600 text-sm px-4 py-2 rounded-lg italic">
              {Array.from(typingUsers).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </CardContent>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Type a message..."
            disabled={channel.status === 'ARCHIVED' || channel.status === 'RESOLVED'}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!inputValue.trim() || sending || channel.status === 'ARCHIVED'}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
};
