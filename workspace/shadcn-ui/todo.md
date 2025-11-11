# Smart eQuiz Tournament Platform - MVP Implementation

## Core Files to Create (Maximum 8 files limit)

### 1. src/pages/Index.tsx
- Main dashboard with role-based routing
- Authentication state management
- Navigation to different sections

### 2. src/components/AuthSystem.tsx
- Login/Register forms
- Role-based access control
- JWT token management
- Multi-tenant support

### 3. src/components/Dashboard.tsx
- Role-specific dashboards (Admin, Participant, Spectator)
- Tournament overview
- Practice mode access
- User stats and progress

### 4. src/components/TournamentEngine.tsx
- Tournament creation and management
- Bracket generation
- Round management
- Real-time match coordination

### 5. src/components/PracticeMode.tsx
- Question practice interface
- XP and badge system
- Progress tracking
- Difficulty progression

### 6. src/components/QuestionBank.tsx
- Question CRUD operations
- AI question generation interface
- Category management
- Difficulty scoring

### 7. src/components/LiveMatch.tsx
- Real-time quiz gameplay
- Scoring and leaderboards
- Spectator view
- WebSocket integration simulation

### 8. src/lib/mockData.ts
- Mock database with Bible quiz questions
- User profiles and roles
- Tournament data
- Scoring and analytics data

## MVP Features Priority
1. ✅ Authentication with roles (Super Admin, Org Admin, Participant, Spectator)
2. ✅ Multi-tenant architecture simulation
3. ✅ Practice mode with XP system
4. ✅ Tournament creation and management
5. ✅ Question bank with Bible categories
6. ✅ Live match simulation
7. ✅ Basic scoring and leaderboards
8. ✅ Payment simulation for entry fees

## Technical Implementation Notes
- Use localStorage for data persistence (simulating backend)
- Implement WebSocket simulation for real-time features
- Create comprehensive UI with shadcn/ui components
- Focus on user experience and responsive design
- Include Bible-specific categories and questions
- Implement role-based access control
- Add basic anti-cheat monitoring simulation

## Excluded from MVP (Future Enhancements)
- Actual backend integration (NestJS/Prisma)
- Real payment processing
- Actual AI integration
- Docker deployment
- Advanced analytics
- Real-time WebSocket server