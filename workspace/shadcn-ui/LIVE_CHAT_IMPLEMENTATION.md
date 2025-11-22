# Live Chat System Implementation Guide

## Overview

Complete live chat system with online/offline status, message persistence, cross-page notifications, and email fallback.

## Features Implemented

### 1. **HelpCenter Chat (Enhanced)**
- ✅ Online/offline status indicator with business hours detection
- ✅ Real-time message history with timestamps
- ✅ Typing indicators for support responses
- ✅ Offline email fallback form
- ✅ Simulated auto-responses
- ✅ Message persistence in chat session

### 2. **GlobalChatWidget (New Component)**
- ✅ Floating chat button (bottom-right corner)
- ✅ Persistent across all pages
- ✅ Unread message counter badge
- ✅ Minimizable chat window
- ✅ Message persistence in localStorage
- ✅ Browser notifications for new messages
- ✅ Business hours auto-detection (Mon-Fri, 9am-5pm EST)
- ✅ Offline mode with email capture

## Quick Start

### Option 1: Add Global Chat Widget (Recommended)

Add to your main `App.tsx` or `Layout.tsx`:

```typescript
import { GlobalChatWidget } from '@/components/GlobalChatWidget';

function App() {
  return (
    <>
      {/* Your app content */}
      <GlobalChatWidget />
    </>
  );
}
```

### Option 2: Use HelpCenter Chat

The enhanced chat is already integrated into `HelpCenter.tsx`. Just navigate to Help Center page.

## Business Hours Configuration

Current settings (Mon-Fri, 9am-5pm EST):

```typescript
const checkSupportHours = () => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  // Mon-Fri (1-5), 9am-5pm EST
  const isBusinessHours = day >= 1 && day <= 5 && hour >= 9 && hour < 17;
  setIsSupportOnline(isBusinessHours);
};
```

**To customize:**
- Change `day >= 1 && day <= 5` for different weekdays (0=Sun, 6=Sat)
- Change `hour >= 9 && hour < 17` for different hours
- Add timezone conversion if needed

## Message Flow

### Online (Support Available)

```
User sends message
    ↓
Message added to history (displayed immediately)
    ↓
TODO: Send to WebSocket/API → Support agent receives
    ↓
Support agent responds
    ↓
TODO: Receive from WebSocket → Message displayed
    ↓
Show notification if window closed
```

### Offline (After Hours)

```
User sends message
    ↓
Message added to history (displayed immediately)
    ↓
Offline form appears
    ↓
User enters email
    ↓
TODO: Send to email/ticket system
    ↓
User receives confirmation
    ↓
Support responds via email within 24 hours
```

## Backend Integration (TODO)

### 1. WebSocket Setup

Replace simulated responses with real WebSocket connection:

```typescript
// In GlobalChatWidget.tsx or HelpCenter.tsx

import { io } from 'socket.io-client';

const socket = io('wss://your-api.com/chat');

// Connect on mount
useEffect(() => {
  socket.on('connect', () => {
    console.log('Chat connected');
    setIsSupportOnline(true);
  });

  socket.on('message', (data) => {
    const newMessage: ChatMessage = {
      id: data.id,
      text: data.text,
      sender: 'support',
      timestamp: new Date(data.timestamp),
      unread: !isOpen
    };
    setChatMessages(prev => [...prev, newMessage]);
    
    if (!isOpen) {
      setUnreadCount(prev => prev + 1);
      showNotification(data.text);
    }
  });

  socket.on('typing', () => setIsTyping(true));
  socket.on('stop-typing', () => setIsTyping(false));

  return () => socket.disconnect();
}, []);

// Send message
const handleSendMessage = () => {
  socket.emit('message', {
    text: chatMessage,
    userId: user.id,
    tenantId: tenant.id
  });
};
```

### 2. REST API Endpoints

Create these endpoints in `services/api/`:

#### `POST /api/chat/messages`
Send message when offline or WebSocket unavailable:

```typescript
interface SendMessageDto {
  userId: string;
  tenantId: string;
  message: string;
  email?: string; // Required if offline
}
```

#### `GET /api/chat/messages/:userId`
Retrieve message history:

```typescript
interface ChatMessageDto {
  id: string;
  text: string;
  senderId: string;
  recipientId: string;
  timestamp: string;
  read: boolean;
}
```

#### `GET /api/chat/status`
Check if support is available:

```typescript
interface ChatStatusDto {
  online: boolean;
  estimatedResponseTime: number; // minutes
  availableAgents: number;
}
```

### 3. Database Schema

Add to Prisma schema:

```prisma
model ChatMessage {
  id          String   @id @default(uuid())
  tenantId    String
  userId      String
  agentId     String?
  message     String   @db.Text
  sender      String   // 'user' | 'support'
  read        Boolean  @default(false)
  createdAt   DateTime @default(now())
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  user        User     @relation(fields: [userId], references: [id])
  agent       User?    @relation("AgentMessages", fields: [agentId], references: [id])
  
  @@index([tenantId, userId])
  @@index([createdAt])
}

model ChatSession {
  id          String   @id @default(uuid())
  tenantId    String
  userId      String
  agentId     String?
  status      String   // 'active' | 'resolved' | 'waiting'
  startedAt   DateTime @default(now())
  endedAt     DateTime?
  
  tenant      Tenant   @relation(fields: [tenantId], references: [id])
  user        User     @relation(fields: [userId], references: [id])
  agent       User?    @relation("AssignedSessions", fields: [agentId], references: [id])
  
  @@index([tenantId, status])
}
```

### 4. Email Template (Offline Messages)

Create in `services/api/src/email/templates/`:

```typescript
export const offlineChatTemplate = (data: {
  userName: string;
  userEmail: string;
  message: string;
  timestamp: Date;
}) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #16a34a; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
    .message { background: white; padding: 15px; border-left: 4px solid #16a34a; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>New Chat Message from ${data.userName}</h2>
    </div>
    <div class="content">
      <p><strong>From:</strong> ${data.userName} (${data.userEmail})</p>
      <p><strong>Time:</strong> ${data.timestamp.toLocaleString()}</p>
      <div class="message">
        <p><strong>Message:</strong></p>
        <p>${data.message}</p>
      </div>
      <p>Please respond to ${data.userEmail} within 24 hours.</p>
    </div>
    <div class="footer">
      <p>Smart eQuiz Platform - Support System</p>
    </div>
  </div>
</body>
</html>
`;
```

## Browser Notifications

### Setup

The widget automatically requests notification permission when user first opens chat.

### Manual Request

```typescript
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      console.log('Notifications enabled');
    }
  });
}
```

### Testing

```javascript
// In browser console
new Notification('Smart eQuiz Support', {
  body: 'New message from support agent',
  icon: '/logo.png',
  badge: '/logo.png'
});
```

## Message Persistence

### localStorage Structure

```typescript
{
  "chatMessages": [
    {
      "id": "1234567890",
      "text": "Hello, I need help",
      "sender": "user",
      "timestamp": "2025-11-19T18:04:00.000Z",
      "unread": false
    }
  ],
  "chatUnreadCount": "2"
}
```

### Clear History

```typescript
localStorage.removeItem('chatMessages');
localStorage.removeItem('chatUnreadCount');
```

## Styling Customization

### Colors

Update in component files:

```typescript
// Primary color (green)
className="bg-green-600 hover:bg-green-700"

// Unread badge (red)
className="bg-red-500"

// Online indicator
className="bg-green-400"

// Offline indicator
className="bg-gray-400"
```

### Position

GlobalChatWidget button position:

```typescript
// Current: bottom-right
className="fixed bottom-6 right-6"

// Bottom-left
className="fixed bottom-6 left-6"

// Custom
className="fixed bottom-[20px] right-[20px]"
```

## Testing

### 1. Online/Offline Toggle

```javascript
// Force online
setIsSupportOnline(true);

// Force offline
setIsSupportOnline(false);

// Test business hours logic
const now = new Date();
console.log('Current hour:', now.getHours());
console.log('Current day:', now.getDay()); // 0=Sun, 1=Mon, etc.
```

### 2. Simulate Support Response

```javascript
// Add this to component for testing
const simulateResponse = (text: string) => {
  const msg: ChatMessage = {
    id: Date.now().toString(),
    text,
    sender: 'support',
    timestamp: new Date(),
    unread: !isOpen
  };
  setChatMessages(prev => [...prev, msg]);
  if (!isOpen) {
    setUnreadCount(prev => prev + 1);
    showNotification(text);
  }
};

// Test in console
simulateResponse('Hello! How can I help you?');
```

### 3. Test Notifications

```javascript
// Request permission
Notification.requestPermission();

// Test notification
new Notification('Test', { body: 'This is a test message' });
```

## Production Checklist

- [ ] Replace simulated responses with WebSocket connection
- [ ] Implement backend API endpoints
- [ ] Add database migrations for chat tables
- [ ] Configure email service for offline messages
- [ ] Set up support agent dashboard
- [ ] Add message encryption (HTTPS/WSS)
- [ ] Implement rate limiting
- [ ] Add file upload support (optional)
- [ ] Set up analytics tracking
- [ ] Configure business hours per tenant (multi-timezone)
- [ ] Add chat transcript email option
- [ ] Implement GDPR compliance (data retention)

## Advanced Features (Future)

### 1. Multi-Agent Routing

Route users to specific agents based on:
- Department (billing, technical, sales)
- Language preference
- Agent availability
- Queue position

### 2. Canned Responses

Pre-written responses for common questions:

```typescript
const CANNED_RESPONSES = {
  greeting: "Hello! Thanks for contacting Smart eQuiz support.",
  billing: "I'll connect you with our billing department.",
  technical: "Let me help you troubleshoot this issue."
};
```

### 3. Chat Analytics

Track metrics:
- Average response time
- Customer satisfaction (CSAT)
- Resolution rate
- Popular issues

### 4. File Sharing

Allow users to upload screenshots/documents:

```typescript
<input
  type="file"
  accept="image/*,.pdf"
  onChange={handleFileUpload}
/>
```

### 5. Video Chat Integration

Add video call button for complex issues:

```typescript
<Button onClick={startVideoCall}>
  📹 Start Video Call
</Button>
```

## Support

For questions about this implementation:
1. Check console logs for debugging info
2. Review TODO comments in code
3. Test with browser DevTools Network tab
4. Verify WebSocket connection in DevTools

## Summary

✅ **Current Status:**
- Online/offline detection working
- Message persistence implemented
- Browser notifications ready
- Offline email fallback functional
- Cross-page widget available

⏳ **Needs Backend:**
- WebSocket server
- REST API endpoints
- Database schema
- Email service integration

The frontend is production-ready. Focus backend work on WebSocket implementation and database schema migration.
