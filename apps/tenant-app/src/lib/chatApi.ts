import api from './api';

export interface ChatChannel {
  id: string;
  type: 'SUPPORT' | 'TOURNAMENT' | 'TEAM' | 'PLATFORM_SUPPORT';
  status: 'ACTIVE' | 'RESOLVED' | 'ESCALATED' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  participants: Array<{
    id: string;
    user: {
      id: string;
      email: string;
      role: string;
    };
  }>;
  messages: ChatMessage[];
  ticket?: SupportTicket;
}

export interface ChatMessage {
  id: string;
  channelId: string;
  senderId: string;
  senderType: 'SUPER_ADMIN' | 'TENANT_ADMIN' | 'MANAGEMENT_TEAM' | 'PARTICIPANT' | 'SYSTEM';
  content: string;
  metadata?: any;
  readBy: string[];
  createdAt: string;
  sender: {
    id: string;
    email: string;
    role: string;
  };
}

export interface SupportTicket {
  id: string;
  channelId: string;
  subject: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateChannelRequest {
  type: 'SUPPORT' | 'TOURNAMENT' | 'TEAM' | 'PLATFORM_SUPPORT';
  participantIds: string[];
  contextId?: string;
  subject?: string;
  category?: string;
  priority?: string;
}

export const chatApi = {
  // Channels
  getChannels: () => api.get<ChatChannel[]>('/chat/channels'),
  
  getChannel: (channelId: string) => 
    api.get<ChatChannel>(`/chat/channels/${channelId}`),
  
  createChannel: (data: CreateChannelRequest) => 
    api.post<ChatChannel>('/chat/channels', data),
  
  // Messages
  sendMessage: (channelId: string, content: string, metadata?: any) =>
    api.post<ChatMessage>(`/chat/channels/${channelId}/messages`, { content, metadata }),
  
  // Actions
  escalateChannel: (channelId: string, reason: string) =>
    api.put<ChatChannel>(`/chat/channels/${channelId}/escalate`, { reason }),
  
  assignChannel: (channelId: string, teamMemberId: string) =>
    api.put<ChatChannel>(`/chat/channels/${channelId}/assign`, { teamMemberId }),
  
  resolveChannel: (channelId: string, resolution?: string) =>
    api.put<ChatChannel>(`/chat/channels/${channelId}/resolve`, { resolution }),
  
  archiveChannel: (channelId: string) =>
    api.delete(`/chat/channels/${channelId}`),
};
