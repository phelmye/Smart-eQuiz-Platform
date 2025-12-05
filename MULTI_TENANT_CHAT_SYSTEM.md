# Multi-Tenant Chat System - Complete Implementation Guide

## Overview

The Smart eQuiz Platform now includes a comprehensive multi-tenant chat and support system with strict tenant isolation, real-time WebSocket communication, and escalation workflows.

## Architecture

### Database Schema (Prisma)

**4 New Models:**
1. **ChatChannel** - Conversation containers with tenant isolation
2. **ChatMessage** - Individual messages with sender types
3. **ChatParticipant** - Channel membership and access control
4. **SupportTicket** - Enhanced support ticket management

**8 New Enums:**
- `ChannelType`: SUPPORT, TOURNAMENT, TEAM, PLATFORM_SUPPORT
- `ChannelStatus`: ACTIVE, RESOLVED, ESCALATED, ARCHIVED
- `SenderType`: SUPER_ADMIN, TENANT_ADMIN, MANAGEMENT_TEAM, PARTICIPANT, SYSTEM
- `ParticipantRole`: ADMIN, MEMBER, OBSERVER
- `TicketPriority`: LOW, MEDIUM, HIGH, URGENT
- `TicketCategory`: TECHNICAL, BILLING, FEATURE_REQUEST, etc.
- `TicketStatus`: OPEN, IN_PROGRESS, WAITING_ON_USER, etc.

### Backend (NestJS)

**Location:** `services/api/src/chat/`

**Files Created:**
1. **chat.module.ts** - Module configuration
2. **chat.service.ts** - Business logic with tenant isolation
3. **chat.controller.ts** - REST API endpoints
4. **chat.gateway.ts** - WebSocket real-time communication
5. **dto/** - Data transfer objects for validation

**Key Features:**
- ✅ **Tenant Isolation** - Every query filters by `tenantId`
- ✅ **Real-time Messaging** - Socket.IO WebSocket gateway
- ✅ **Escalation Workflow** - Route tickets to super admin
- ✅ **Team Assignment** - Assign channels to management team
- ✅ **Typing Indicators** - Real-time typing status
- ✅ **Read Receipts** - Track message read status
- ✅ **System Messages** - Automated status updates

### Frontend (React + TypeScript)

**Location:** `apps/tenant-app/src/`

**Components:**
1. **ChatChannelList.tsx** - List all conversations with filters
2. **ChatWindow.tsx** - Main chat interface with real-time updates
3. **CreateSupportTicketDialog.tsx** - Create new support tickets
4. **ChatPage.tsx** - Main page component

**Utilities:**
1. **lib/chatSocket.ts** - Socket.IO client wrapper
2. **lib/chatApi.ts** - REST API client

## API Endpoints

### Chat Channels

```typescript
POST   /api/chat/channels              // Create new channel
GET    /api/chat/channels              // List user's channels
GET    /api/chat/channels/:id          // Get channel with messages
POST   /api/chat/channels/:id/messages // Send message
PUT    /api/chat/channels/:id/escalate // Escalate to super admin
PUT    /api/chat/channels/:id/assign   // Assign to team member
PUT    /api/chat/channels/:id/resolve  // Mark as resolved
DELETE /api/chat/channels/:id          // Archive channel
```

### WebSocket Events

**Client → Server:**
- `join_channel` - Join channel room
- `leave_channel` - Leave channel room
- `send_message` - Send message (also saves to DB)
- `typing` - Notify others user is typing
- `stop_typing` - Stop typing notification

**Server → Client:**
- `new_message` - New message broadcast
- `user_typing` - User typing indicator
- `user_stop_typing` - User stopped typing
- `channel_status_changed` - Status update
- `channel_assigned` - Assignment notification
- `ticket_escalated` - Escalation notification (super admin only)

## Usage Examples

### Creating a Support Ticket

```typescript
// Frontend
import { CreateSupportTicketDialog } from '@/components/chat/CreateSupportTicketDialog';

<CreateSupportTicketDialog 
  onTicketCreated={() => refreshChannels()} 
/>
```

### Sending a Message

```typescript
// Via WebSocket (real-time)
import { chatSocket } from '@/lib/chatSocket';

chatSocket.connect(userId, tenantId);
chatSocket.sendMessage(channelId, 'Hello!');

// Via REST API
import { chatApi } from '@/lib/chatApi';

await chatApi.sendMessage(channelId, 'Hello!');
```

### Escalating to Super Admin

```typescript
await chatApi.escalateChannel(channelId, 'Unable to resolve locally');
// Channel status changes to ESCALATED
// Super admin receives notification
// Super admin added as participant
```

### Tenant Isolation Example

```typescript
// ChatService.ts - ALL queries filter by tenantId
async getUserChannels(userId: string, tenantId: string) {
  return this.prisma.chatChannel.findMany({
    where: {
      tenantId, // ✅ CRITICAL: Tenant isolation
      participants: { some: { userId } }
    }
  });
}
```

## Security Features

### 1. Tenant Isolation
- Every `ChatChannel` has `tenantId` field
- All queries filter by current user's `tenantId`
- Cross-tenant channel creation blocked
- Participant verification before message send

### 2. Access Control
- Users can only see channels they're participants in
- Role-based sender types (SUPER_ADMIN, TENANT_ADMIN, etc.)
- Admin-only actions: escalate, assign, resolve
- Archived channels are read-only

### 3. WebSocket Security
- Connection requires `userId` and `tenantId`
- Channel join requests verified against database
- Messages validated before broadcast
- Tenant-scoped room isolation

## Communication Contexts

### 1. Support Chat (SUPPORT)
**Flow:** Participant → Tenant Admin → Management Team → Super Admin (escalated)

**Use Case:** User needs help with tournament setup
```typescript
await chatApi.createChannel({
  type: 'SUPPORT',
  participantIds: [userId],
  subject: 'Cannot create tournament',
  category: 'TOURNAMENT_ISSUE',
  priority: 'HIGH'
});
```

### 2. Team Chat (TEAM)
**Flow:** Tenant Admin ↔ Management Team Members

**Use Case:** Internal team collaboration
```typescript
await chatApi.createChannel({
  type: 'TEAM',
  participantIds: [admin1, admin2, questionManager],
  subject: 'Weekly planning'
});
```

### 3. Tournament Chat (TOURNAMENT)
**Flow:** Participants ↔ Participants (monitored by moderators)

**Use Case:** Tournament-specific discussion
```typescript
await chatApi.createChannel({
  type: 'TOURNAMENT',
  contextId: tournamentId,
  participantIds: [user1, user2, user3]
});
```

### 4. Platform Support (PLATFORM_SUPPORT)
**Flow:** Tenant Admin → Super Admin

**Use Case:** Billing issues, feature requests
```typescript
await chatApi.createChannel({
  type: 'PLATFORM_SUPPORT',
  participantIds: [],
  subject: 'Upgrade to Enterprise plan',
  category: 'BILLING'
});
```

## Integration Points

### 1. Navbar/Dashboard
Add chat icon with unread count badge:
```tsx
import { MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

<button onClick={() => navigate('/chat')}>
  <MessageCircle className="h-5 w-5" />
  {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
</button>
```

### 2. Help Center
Replace existing basic chat with new system:
```tsx
// Old: Basic dialog with mock data
// New: Real chat system with database persistence
import { CreateSupportTicketDialog } from '@/components/chat/CreateSupportTicketDialog';
```

### 3. Tournament Page
Add tournament-specific chat:
```tsx
import { ChatWindow } from '@/components/chat/ChatWindow';

// Load tournament chat channel
const tournamentChannel = await chatApi.getChannels().find(
  c => c.type === 'TOURNAMENT' && c.contextId === tournamentId
);
```

## Deployment Considerations

### Backend Configuration

**Environment Variables:**
```env
# Socket.IO CORS (production)
CORS_ORIGIN=https://yourtenant.smartequiz.com,https://admin.smartequiz.com

# WebSocket port (if different from API)
WEBSOCKET_PORT=3001
```

**main.ts:**
```typescript
app.enableCors({
  origin: process.env.CORS_ORIGIN.split(','),
  credentials: true
});
```

### Frontend Configuration

**Socket.IO Connection:**
```typescript
// apps/tenant-app/src/lib/chatSocket.ts
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Production: Use WSS
const socket = io(`${apiUrl}/chat`, {
  transports: ['websocket'],
  secure: true // Enable for HTTPS
});
```

### Database Indexes

Already optimized for performance:
```prisma
@@index([tenantId, status])
@@index([assignedTo])
@@index([type, tenantId])
@@index([channelId, createdAt])
```

## Testing

### Backend Tests
```bash
cd services/api

# Test chat endpoints
curl -X POST http://localhost:3000/api/chat/channels \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "SUPPORT",
    "participantIds": [],
    "subject": "Test ticket",
    "category": "TECHNICAL"
  }'
```

### Frontend Tests
```typescript
// Open DevTools Console
import { chatSocket } from '@/lib/chatSocket';

chatSocket.connect(userId, tenantId);
chatSocket.joinChannel(channelId);
chatSocket.sendMessage(channelId, 'Test message');
```

### WebSocket Test
```bash
# Install wscat
npm i -g wscat

# Connect to WebSocket
wscat -c "ws://localhost:3000/chat?userId=USER_ID&tenantId=TENANT_ID"

# Send message
{"event":"send_message","data":{"channelId":"CHANNEL_ID","content":"Test"}}
```

## Migration from Old Chat

The old `HelpCenter.tsx` chat implementation is now deprecated. To migrate:

**Old Implementation:**
```typescript
// workspace/shadcn-ui/src/components/HelpCenter.tsx
const [chatMessages, setChatMessages] = useState<Array<{
  id: string;
  text: string;
  sender: 'user' | 'support'; // ❌ Not tenant-aware
  timestamp: Date;
}>>([]);
```

**New Implementation:**
```typescript
// apps/tenant-app/src/pages/ChatPage.tsx
import { ChatPage } from '@/pages/ChatPage';

<ChatPage
  currentUserId={user.id}
  currentUserName={user.name}
  currentUserEmail={user.email}
  tenantId={tenant.id}
/>
```

## Future Enhancements

### Phase 2 (Not Yet Implemented)
- [ ] File attachments in messages
- [ ] Message reactions (👍, ❤️, etc.)
- [ ] Message search and filtering
- [ ] Chat bots for common support queries
- [ ] Canned responses for support team
- [ ] SLA tracking and auto-escalation
- [ ] Chat analytics dashboard
- [ ] Email notifications for offline messages
- [ ] Mobile push notifications

### Phase 3
- [ ] Voice/Video calls via WebRTC
- [ ] Screen sharing for support
- [ ] AI-powered message suggestions
- [ ] Multi-language translation
- [ ] Chat export (PDF/CSV)
- [ ] Integration with third-party support tools

## Troubleshooting

### WebSocket Not Connecting

**Issue:** Socket.IO fails to connect

**Solution:**
1. Check CORS configuration in `main.ts`
2. Verify `VITE_API_URL` is correct
3. Ensure WebSocket port is accessible
4. Check browser console for errors

### Messages Not Appearing

**Issue:** Messages sent but not visible

**Solution:**
1. Verify `channelId` is correct
2. Check user is participant in channel
3. Ensure Socket.IO is connected
4. Check database for message creation
5. Verify tenant isolation isn't blocking

### Tenant Data Leaking

**Issue:** User sees channels from other tenants

**Solution:**
1. Verify all queries include `tenantId` filter
2. Check `getUserChannels()` in ChatService
3. Review WebSocket room joins
4. Audit database queries with Prisma Studio

### Performance Issues

**Issue:** Chat slow with many messages

**Solution:**
1. Implement message pagination (load 50 at a time)
2. Add infinite scroll in ChatWindow
3. Archive old channels regularly
4. Monitor database indexes
5. Consider Redis for message caching

## Support

For questions about the chat system implementation:
- **Backend:** Review `services/api/src/chat/chat.service.ts`
- **Frontend:** Review `apps/tenant-app/src/components/chat/`
- **Database:** Review Prisma schema and migration
- **WebSocket:** Review `chat.gateway.ts` and `chatSocket.ts`

---

**Implementation Status:** ✅ Complete (95%)
- Database schema: ✅ Complete
- Backend API: ✅ Complete
- WebSocket gateway: ✅ Complete
- Frontend components: ✅ Complete
- Integration: 🟡 Partial (needs routing)

**Next Steps:**
1. Add chat route to app router
2. Add chat link to navigation
3. Test end-to-end workflow
4. Deploy to staging environment
