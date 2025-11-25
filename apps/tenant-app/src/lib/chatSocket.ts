import { io, Socket } from 'socket.io-client';

class ChatSocketService {
  private socket: Socket | null = null;
  private userId: string | null = null;
  private tenantId: string | null = null;

  connect(userId: string, tenantId: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.userId = userId;
    this.tenantId = tenantId;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    
    this.socket = io(`${apiUrl}/chat`, {
      query: { userId, tenantId },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected');
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket.IO disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinChannel(channelId: string) {
    this.socket?.emit('join_channel', { channelId });
  }

  leaveChannel(channelId: string) {
    this.socket?.emit('leave_channel', { channelId });
  }

  sendMessage(channelId: string, content: string, metadata?: any) {
    this.socket?.emit('send_message', { channelId, content, metadata });
  }

  startTyping(channelId: string, userName: string) {
    this.socket?.emit('typing', { channelId, userName });
  }

  stopTyping(channelId: string) {
    this.socket?.emit('stop_typing', { channelId });
  }

  onNewMessage(callback: (data: any) => void) {
    this.socket?.on('new_message', callback);
  }

  onUserTyping(callback: (data: any) => void) {
    this.socket?.on('user_typing', callback);
  }

  onUserStopTyping(callback: (data: any) => void) {
    this.socket?.on('user_stop_typing', callback);
  }

  onChannelStatusChanged(callback: (data: any) => void) {
    this.socket?.on('channel_status_changed', callback);
  }

  onChannelAssigned(callback: (data: any) => void) {
    this.socket?.on('channel_assigned', callback);
  }

  onTicketEscalated(callback: (data: any) => void) {
    this.socket?.on('ticket_escalated', callback);
  }

  off(event: string) {
    this.socket?.off(event);
  }
}

export const chatSocket = new ChatSocketService();
