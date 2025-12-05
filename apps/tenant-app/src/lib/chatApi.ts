import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with auth interceptor
const chatApiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
chatApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

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
  getChannels: () => chatApiClient.get<ChatChannel[]>('/chat/channels'),
  
  getChannel: (channelId: string) => 
    chatApiClient.get<ChatChannel>(`/chat/channels/${channelId}`),
  
  createChannel: (data: CreateChannelRequest) => 
    chatApiClient.post<ChatChannel>('/chat/channels', data),
  
  // Messages
  sendMessage: (channelId: string, content: string, metadata?: any) =>
    chatApiClient.post<ChatMessage>(`/chat/channels/${channelId}/messages`, { content, metadata }),
  
  // Actions
  escalateChannel: (channelId: string, reason: string) =>
    chatApiClient.put<ChatChannel>(`/chat/channels/${channelId}/escalate`, { reason }),
  
  assignChannel: (channelId: string, teamMemberId: string) =>
    chatApiClient.put<ChatChannel>(`/chat/channels/${channelId}/assign`, { teamMemberId }),
  
  resolveChannel: (channelId: string, resolution?: string) =>
    chatApiClient.put<ChatChannel>(`/chat/channels/${channelId}/resolve`, { resolution }),
  
  archiveChannel: (channelId: string) =>
    chatApiClient.delete(`/chat/channels/${channelId}`),
};
