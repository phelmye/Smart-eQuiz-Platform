# 🏆 Tournament Qualification System - Requirements & Implementation Guide

## Overview
A sophisticated, tournament-specific qualification system where users must demonstrate competency or earn access rights for EACH tournament through multiple pathways.

---

## 🎯 Core Principle
**"Every tournament is a new opportunity - past participation doesn't guarantee future access."**

Users must show interest and qualify for each specific tournament individually through one of three pathways:
1. **Pre-Tournament Qualification Quiz** (Pass-based)
2. **Practice Points Threshold** (Earn-based)
3. **Direct Admin Invitation** (Admin-granted)

---

## 👥 User Roles & Base Access

### Inspector (Default Role)
- **Starting Role**: All new registered users
- **Base Access**:
  - View public tournament information
  - View leaderboards
  - View live matches (spectator mode)
- **Cannot Access**:
  - Practice Mode (requires application & approval)
  - Tournament participation
  
### Practice User (Transitional Status)
- **How to Achieve**: Apply for practice access → Admin approves
- **Access Granted**:
  - Full practice mode access
  - Earn practice points
  - Build qualification for tournaments
- **Still Cannot**:
  - Directly participate in tournaments
  - Must still apply per tournament

### Participant (Tournament-Specific)
- **Temporary Status**: Valid for ONE specific tournament only
- **How to Achieve**: 
  - Pass pre-tournament quiz, OR
  - Earn required practice points, OR
  - Receive direct admin invitation
- **Resets After**: Each tournament completion
- **Must Reapply**: For every new tournament

---

## 🚪 Three Pathways to Tournament Participation

### Pathway 1: Pre-Tournament Qualification Quiz (Primary Method)

#### Application Process
1. **User Shows Interest**
   - User clicks "Apply to Participate" on upcoming tournament
   - Application records: `tournamentId`, `userId`, `appliedAt`, `applicationMethod: 'quiz'`
   
2. **Pre-Tournament Quiz Triggered**
   - System generates qualification quiz based on tournament category
   - Quiz parameters (set by tenant admin):
     - Number of questions (default: 20)
     - Pass mark percentage (default: 70%)
     - Time limit (default: 30 minutes)
     - Difficulty level matching tournament
   
3. **Quiz Attempt & Retakes**
   - **Default**: User has **3 attempts** per tournament application
   - Admin can configure: 1-5 retakes allowed
   - Admin can disable retakes (1 attempt only)
   - Real-time scoring
   - Timer countdown visible
   - Each attempt uses different questions from pool
   
4. **Pass Scenario** ✅
   - Score >= Required Pass Mark (on any attempt)
   - **Celebration Effects**:
     - Confetti animation
     - Success sound effect
     - Trophy badge animation
     - Congratulatory modal: "You're In! 🎉"
   - **System Actions**:
     - Grant `participant` status for THIS tournament only
     - Update `tournamentParticipants` table
     - Award XP points for qualification
     - Record which attempt succeeded
     - Send multi-channel notifications
   
5. **Fail Scenario** ❌
   - Score < Required Pass Mark
   - **After Each Failed Attempt**:
     - Show score breakdown with weak areas
     - Display attempts remaining: "2 attempts left"
     - Encouragement message based on score proximity
     - Wait time before next attempt (optional, admin configurable)
   - **After Final Failed Attempt**:
     - Cannot retake for THIS tournament
     - Detailed performance analysis
     - Suggest specific practice areas
     - Send notification with results

#### Quiz Configuration (Admin Settings)
```typescript
interface PreTournamentQuizConfig {
  enabled: boolean;
  questionsCount: number; // 10-50 questions per attempt
  passPercentage: number; // 50-90%
  timeLimitMinutes: number; // 15-60
  
  // RETAKE SETTINGS
  allowRetakes: boolean; // Default: true
  maxRetakes: number; // Default: 3 (total attempts)
  retakeWaitTimeMinutes?: number; // Optional cooldown between attempts (e.g., 30 minutes)
  
  // QUESTION POOL REQUIREMENT
  // If maxRetakes = 3 and questionsCount = 10
  // Then questionPoolSize MUST BE >= 30 (10 × 3)
  questionPoolSize: number; // Auto-calculated: questionsCount × maxRetakes
  questionPoolRequirementMet: boolean; // System validation flag
  
  categoryMatch: boolean; // Use same category as tournament
  difficultyLevel: 'easy' | 'medium' | 'hard';
  
  // Question rotation prevents showing same questions
  preventQuestionReuse: boolean; // Default: true
}
```

---

## 📚 Question Pool Management & Retake System

### The Multiplier Rule

**CRITICAL REQUIREMENT**: To enable retakes, the question pool must be **at least** the number of questions multiplied by the number of allowed attempts.

#### Formula
```
Required Question Pool Size = Questions Per Attempt × Max Attempts
```

#### Examples

**Example 1: Standard Configuration**
- Questions per attempt: **10**
- Max retakes allowed: **3** (default)
- **Required question pool: 10 × 3 = 30 questions minimum**

**Example 2: More Retakes**
- Questions per attempt: **15**
- Max retakes allowed: **5**
- **Required question pool: 15 × 5 = 75 questions minimum**

**Example 3: No Retakes**
- Questions per attempt: **20**
- Max retakes allowed: **1** (no retakes)
- **Required question pool: 20 × 1 = 20 questions minimum**

### Admin Configuration Validation

When tenant admin configures pre-tournament quiz settings:

```typescript
interface QuizConfigurationValidation {
  questionsPerAttempt: number;      // e.g., 10
  maxAttempts: number;               // e.g., 3
  requiredPoolSize: number;          // Auto-calculated: 10 × 3 = 30
  availableQuestions: number;        // Current questions in database
  canEnableRetakes: boolean;         // true if availableQuestions >= requiredPoolSize
  missingQuestionsCount?: number;    // How many more questions needed
}
```

### Admin UI - Quiz Settings Panel

```
┌─────────────────────────────────────────────────────────────┐
│ Pre-Tournament Quiz Configuration                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ☑ Enable Pre-Tournament Quiz                               │
│                                                              │
│ Questions Per Attempt: [10] ▼                               │
│ Pass Mark Percentage:  [70]%                                │
│ Time Limit:           [30] minutes                          │
│                                                              │
│ ┌────────────────────────────────────────────────────────┐ │
│ │ RETAKE SETTINGS                                         │ │
│ │                                                         │ │
│ │ ☑ Allow Retakes                                        │ │
│ │                                                         │ │
│ │ Maximum Attempts: [3] ▼  (includes first attempt)     │ │
│ │                                                         │ │
│ │ Wait Time Between Attempts: [30] minutes (optional)   │ │
│ │                                                         │ │
│ │ ⚠️ QUESTION POOL REQUIREMENT                           │ │
│ │ ─────────────────────────────────────────────────────  │ │
│ │ Questions needed: 10 × 3 = 30 questions minimum       │ │
│ │                                                         │ │
│ │ Available questions: [45] ✓                           │ │
│ │ Status: Sufficient questions ✓                        │ │
│ │                                                         │ │
│ │ ☑ Prevent question reuse across attempts              │ │
│ │                                                         │ │
│ └────────────────────────────────────────────────────────┘ │
│                                                              │
│ [Save Settings]  [Test Configuration]                       │
└─────────────────────────────────────────────────────────────┘
```

### Insufficient Questions Warning

If admin tries to enable retakes without enough questions:

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ WARNING: Insufficient Questions                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Cannot enable 3 attempts with current question pool.        │
│                                                              │
│ Required: 10 × 3 = 30 questions                             │
│ Available: 18 questions                                     │
│ Missing: 12 questions                                       │
│                                                              │
│ Options:                                                     │
│ • Reduce questions per attempt to 6 (18 ÷ 3)               │
│ • Reduce max attempts to 1 (no retakes)                    │
│ • Add 12 more questions to the question bank               │
│                                                              │
│ [Add Questions] [Adjust Settings] [Cancel]                  │
└─────────────────────────────────────────────────────────────┘
```

### Question Selection Algorithm

```typescript
interface QuizAttempt {
  attemptNumber: number; // 1, 2, or 3
  questionsShown: string[]; // Question IDs shown in this attempt
  previousAttempts: string[][]; // Question IDs from previous attempts
}

function selectQuestionsForAttempt(
  userId: string,
  tournamentId: string,
  attemptNumber: number,
  questionsNeeded: number
): Question[] {
  // Get all available questions for tournament category
  const availableQuestions = getQuestionsByCategory(tournament.category);
  
  // Get questions already shown in previous attempts
  const previousAttempts = getUserPreviousAttempts(userId, tournamentId);
  const usedQuestionIds = previousAttempts.flatMap(attempt => attempt.questionsShown);
  
  // Filter out previously used questions
  const unusedQuestions = availableQuestions.filter(
    q => !usedQuestionIds.includes(q.id)
  );
  
  // Validation check
  if (unusedQuestions.length < questionsNeeded) {
    throw new Error(
      `Insufficient unused questions. Need ${questionsNeeded}, have ${unusedQuestions.length}`
    );
  }
  
  // Randomly select required number of questions
  const selectedQuestions = shuffle(unusedQuestions).slice(0, questionsNeeded);
  
  // Log which questions are shown in this attempt
  logQuestionsShown(userId, tournamentId, attemptNumber, selectedQuestions.map(q => q.id));
  
  return selectedQuestions;
}
```

### User Experience - Retake Flow

#### Attempt 1 (First Try)
```
┌─────────────────────────────────────────────────────────────┐
│ 📝 Pre-Tournament Qualification Quiz                        │
│ Attempt 1 of 3                                              │
├─────────────────────────────────────────────────────────────┤
│ Questions: 10                                                │
│ Pass Mark: 70%                                              │
│ Time Remaining: 29:45                                       │
└─────────────────────────────────────────────────────────────┘
```

#### Failed Attempt - Show Retake Option
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Quiz Results - Attempt 1                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Your Score: 60% (6/10 correct)                             │
│ Pass Mark:  70%                                             │
│                                                              │
│ ❌ Not passed yet, but don't give up!                      │
│                                                              │
│ You have 2 more attempts remaining.                         │
│                                                              │
│ Weak Areas:                                                  │
│ • New Testament History (3/5)                               │
│ • Old Testament Prophets (1/3)                              │
│                                                              │
│ 💡 Tip: Review these topics before your next attempt       │
│                                                              │
│ Next attempt available in: 29:45                            │
│                                                              │
│ [Review Answers] [Practice These Topics] [Try Again Later] │
└─────────────────────────────────────────────────────────────┘
```

#### Attempt 2 (Second Try)
```
┌─────────────────────────────────────────────────────────────┐
│ 📝 Pre-Tournament Qualification Quiz                        │
│ Attempt 2 of 3 - Last attempt was 60%                      │
├─────────────────────────────────────────────────────────────┤
│ Different questions will be shown this time                 │
│                                                              │
│ Questions: 10 (NEW questions)                               │
│ Pass Mark: 70%                                              │
│ Time Limit: 30 minutes                                      │
│                                                              │
│ [Start Attempt 2]                                           │
└─────────────────────────────────────────────────────────────┘
```

#### Final Failed Attempt (All Retakes Exhausted)
```
┌─────────────────────────────────────────────────────────────┐
│ 📊 Final Quiz Results                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Attempt 1: 60%                                              │
│ Attempt 2: 65%                                              │
│ Attempt 3: 68%                                              │
│                                                              │
│ Best Score: 68% (Pass Mark: 70%)                           │
│                                                              │
│ ❌ Unfortunately, you did not qualify for this tournament.  │
│                                                              │
│ You're so close! Just 2% away from qualifying.              │
│                                                              │
│ 📚 Recommended Next Steps:                                  │
│ • Continue practicing in Practice Mode                      │
│ • Focus on: New Testament, Prophets                        │
│ • Earn practice points for automatic qualification          │
│ • Apply for the next tournament                             │
│                                                              │
│ [View Detailed Analysis] [Go to Practice Mode]             │
└─────────────────────────────────────────────────────────────┘
```

### Retake Tracking Schema

```typescript
interface QuizAttemptRecord {
  id: string;
  userId: string;
  tournamentId: string;
  attemptNumber: number; // 1, 2, or 3
  questionsShownIds: string[]; // Track which questions were shown
  userAnswers: {
    questionId: string;
    selectedAnswer: string;
    isCorrect: boolean;
    timeSpent: number; // seconds
  }[];
  score: number;
  percentage: number;
  passed: boolean;
  startedAt: string;
  completedAt: string;
  timeSpent: number; // total seconds
}

interface UserQuizProgress {
  userId: string;
  tournamentId: string;
  totalAttemptsAllowed: number; // e.g., 3
  attemptsUsed: number; // e.g., 2
  attemptsRemaining: number; // e.g., 1
  allAttempts: QuizAttemptRecord[];
  bestScore: number;
  bestAttemptNumber: number;
  finalStatus: 'in_progress' | 'passed' | 'failed' | 'expired';
  canRetake: boolean;
  nextAttemptAvailableAt?: string; // If wait time configured
}
```

---

### Pathway 2: Practice Points Threshold (Earn Your Way)

#### How It Works
1. **Admin Sets Point Requirement**
   - Tenant admin configures per tournament:
     - `requiredPracticePoints: number` (e.g., 500 points)
     - `pointsEarningPeriod: 'last_30_days' | 'all_time' | 'since_last_tournament'`
   
2. **Users Earn Points**
   - Practice mode awards points:
     - Correct answer: +10 points
     - Perfect quiz: +50 bonus
     - Streak bonus: +5 per consecutive day
     - Daily practice: +20 points
   
3. **Auto-Qualification**
   - System checks practice points when user applies
   - If `userPracticePoints >= requiredPracticePoints`:
     - **Skip pre-tournament quiz entirely**
     - Automatic participant status
     - Celebratory notification: "You earned your spot! 🌟"
   - If not enough points:
     - Must take pre-tournament quiz
     - OR keep practicing to reach threshold

4. **Point Tracking Dashboard**
   - Real-time points display
   - Progress bar toward next tournament threshold
   - History of points earned
   - Leaderboard showing top point earners

#### Points Configuration (Admin Settings)
```typescript
interface PracticePointsConfig {
  enabled: boolean;
  requiredPoints: number;
  countingPeriod: 'last_7_days' | 'last_30_days' | 'all_time';
  pointsPerCorrectAnswer: number;
  pointsPerPerfectQuiz: number;
  dailyStreakBonus: number;
  resetAfterTournament: boolean;
}
```

---

### Pathway 3: Direct Admin Invitation (VIP Access)

#### Admin Powers
1. **Manual Participant Addition**
   - Tenant admin can directly add users as participants
   - Use cases:
     - Special guests
     - Returning champions
     - Sponsored participants
     - Staff members
   
2. **Bulk Invitation**
   - Select multiple users
   - Bulk action: "Add as Participants"
   - Bypass all qualification requirements
   
3. **Invitation Tracking**
   - Record shows: `addedBy`, `addedAt`, `reason`, `qualificationMethod: 'direct_invitation'`
   - Audit trail maintained

#### Admin Interface
```typescript
interface DirectInvitation {
  tournamentId: string;
  userId: string;
  invitedBy: string; // Admin user ID
  invitedAt: string;
  reason?: string;
  skipQuiz: boolean; // Always true for direct invites
  expiresAt?: string; // Optional expiry
}
```

---

## 📊 Tournament Participant Status Model

### Database Schema
```typescript
interface TournamentParticipant {
  id: string;
  tournamentId: string;
  userId: string;
  
  // Qualification Method
  qualificationMethod: 'quiz_pass' | 'practice_points' | 'direct_invitation';
  
  // Quiz Path Data (if applicable)
  quizAttempted?: boolean;
  quizScore?: number;
  quizPassMark?: number;
  quizAttemptedAt?: string;
  quizPassed?: boolean;
  
  // Points Path Data (if applicable)
  practicePointsUsed?: number;
  pointsThresholdMet?: boolean;
  
  // Direct Invitation Data (if applicable)
  invitedBy?: string;
  invitationReason?: string;
  
  // Status Tracking
  status: 'pending' | 'qualified' | 'participating' | 'disqualified' | 'completed';
  appliedAt: string;
  qualifiedAt?: string;
  participatedAt?: string;
  
  // Tournament-Specific (does NOT carry over)
  isActiveForThisTournament: boolean;
  
  // Metadata
  createdAt: string;
  updatedAt: string;
}
```

### User Interface Extension
```typescript
interface User {
  // ... existing fields
  
  // Practice Access (persistent across tournaments)
  practiceAccessStatus: 'none' | 'pending' | 'approved' | 'rejected';
  practiceAccessAppliedAt?: string;
  practiceAccessApprovedAt?: string;
  
  // Practice Points (can reset per tournament or accumulate)
  practicePoints: number;
  practicePointsHistory: PracticePointEntry[];
  
  // Tournament-Specific Status (TEMPORARY)
  currentTournamentParticipations: {
    tournamentId: string;
    status: 'qualified' | 'participating';
    qualifiedAt: string;
    method: 'quiz_pass' | 'practice_points' | 'direct_invitation';
  }[];
}
```

---

## 🔔 Multi-Channel Notification System

### Notification Triggers & Templates

#### 1. Practice Access Application Submitted
**Trigger**: User applies for practice access  
**Recipients**: User + Tenant Admins  
**Channels**: Email, WhatsApp, Telegram (based on config)  
**Template**:
```
📚 Practice Access Application Received

Hello [User Name],

Your application for practice mode access has been received and is under review.

An administrator will review your request within 24-48 hours.

Status: Pending Review
Applied: [Date/Time]

[View Application Status]
```

#### 2. Practice Access Approved
**Trigger**: Admin approves practice access  
**Recipients**: User  
**Channels**: All enabled channels  
**Template**:
```
🎉 Practice Access Approved!

Congratulations [User Name]!

Your practice access has been approved. You can now:
✓ Access all practice quizzes
✓ Earn practice points
✓ Build your skills for tournaments

Start practicing now to qualify for upcoming tournaments!

[Go to Practice Mode]
```

#### 3. Tournament Application Received
**Trigger**: User applies to participate in tournament  
**Recipients**: User  
**Channels**: All enabled channels  
**Template**:
```
🏆 Tournament Application Received

Hello [User Name],

You've applied to participate in: [Tournament Name]

Next Steps:
• Take the pre-tournament qualification quiz
• OR continue earning practice points ([Current]/[Required])

Qualification Deadline: [Date/Time]

[Take Qualification Quiz]
```

#### 4. Pre-Tournament Quiz Available
**Trigger**: Admin activates qualification quiz  
**Recipients**: All applicants  
**Channels**: All enabled channels + Push notification  
**Template**:
```
⏰ Qualification Quiz Now Available!

[Tournament Name] - Qualification Quiz

You can now take your qualification quiz:
• Questions: [Count]
• Pass Mark: [Percentage]%
• Time Limit: [Minutes] minutes
• Attempts: 1 only

⚠️ Quiz closes: [Deadline Date/Time]

[Start Quiz Now]
```

#### 5. Quiz Passed - Participation Granted
**Trigger**: User passes pre-tournament quiz  
**Recipients**: User  
**Channels**: All enabled channels + SMS  
**Template**:
```
🎉 CONGRATULATIONS! You're In!

Amazing job, [User Name]!

Quiz Score: [Score]% (Pass: [PassMark]%)

You are now officially a participant in:
🏆 [Tournament Name]

Tournament Details:
📅 Date: [Date]
⏰ Time: [Time]
🎯 Category: [Category]

See you at the tournament!

[View Tournament Details]
```

#### 6. Quiz Failed - Encouragement
**Trigger**: User fails pre-tournament quiz  
**Recipients**: User  
**Channels**: Email, In-app  
**Template**:
```
📊 Qualification Quiz Results

Hello [User Name],

Quiz Score: [Score]% (Required: [PassMark]%)

You didn't qualify this time, but don't give up!

📚 Next Steps:
1. Review your weak areas: [Topics]
2. Practice more in Practice Mode
3. Apply for the next tournament

Keep practicing - you'll get there! 💪

[Go to Practice Mode]
```

#### 7. Points Threshold Achieved - Auto-Qualified
**Trigger**: User reaches required practice points  
**Recipients**: User  
**Channels**: All enabled channels  
**Template**:
```
🌟 You Earned Your Spot!

Incredible, [User Name]!

Your dedication paid off! You've earned [Points] practice points and automatically qualified for:

🏆 [Tournament Name]

You've SKIPPED the qualification quiz! 🎉

Tournament Details:
📅 Date: [Date]
⏰ Time: [Time]

No quiz needed - see you at the tournament!

[View Tournament Details]
```

#### 8. Direct Invitation Received
**Trigger**: Admin directly adds user as participant  
**Recipients**: User  
**Channels**: All enabled channels  
**Template**:
```
🎖️ Special Invitation - You're In!

Hello [User Name],

You've been directly invited to participate in:
🏆 [Tournament Name]

Invited by: [Admin Name]
Reason: [Optional Reason]

You've been granted special access - no qualification needed!

Tournament Details:
📅 Date: [Date]
⏰ Time: [Time]

[Accept Invitation]
```

#### 9. Tournament Reminder (Day Before)
**Trigger**: 24 hours before tournament  
**Recipients**: All qualified participants  
**Channels**: All enabled channels + SMS + Push  
**Template**:
```
⏰ Tournament Tomorrow!

Hello [User Name],

Reminder: You're participating in [Tournament Name] tomorrow!

📅 Date: [Tomorrow's Date]
⏰ Time: [Time]
🎯 Category: [Category]

Tips:
✓ Get good rest
✓ Review key topics
✓ Be online 15 minutes early

Good luck! 🍀

[View Tournament]
```

#### 10. Tournament Starting Soon (1 Hour)
**Trigger**: 1 hour before tournament  
**Recipients**: All qualified participants  
**Channels**: SMS + Push + In-app  
**Template**:
```
🚨 Tournament Starting in 1 Hour!

[Tournament Name] begins at [Time]

Be ready! Login 15 minutes early.

[Join Tournament Room]
```

---

## ⚙️ Notification Configuration (Tenant Admin)

### Communication Channels Setup
```typescript
interface NotificationChannels {
  email: {
    enabled: boolean;
    provider: 'smtp' | 'sendgrid' | 'mailgun';
    fromAddress: string;
    replyTo: string;
  };
  
  whatsapp: {
    enabled: boolean;
    provider: 'twilio' | 'whatsapp_business_api';
    accountId: string;
    fromNumber: string;
  };
  
  telegram: {
    enabled: boolean;
    botToken: string;
    botUsername: string;
  };
  
  sms: {
    enabled: boolean;
    provider: 'twilio' | 'vonage';
    fromNumber: string;
  };
  
  push: {
    enabled: boolean;
    provider: 'firebase' | 'onesignal';
    apiKey: string;
  };
  
  inApp: {
    enabled: boolean; // Always true
  };
}
```

### Notification Preferences (Per Event Type)
```typescript
interface NotificationSettings {
  practiceAccessApplicationReceived: {
    sendToUser: ['email', 'inApp'];
    sendToAdmins: ['email', 'inApp'];
  };
  
  practiceAccessApproved: {
    channels: ['email', 'whatsapp', 'telegram', 'push', 'inApp'];
  };
  
  tournamentApplicationReceived: {
    channels: ['email', 'inApp'];
  };
  
  qualificationQuizAvailable: {
    channels: ['email', 'whatsapp', 'telegram', 'push', 'inApp'];
  };
  
  quizPassedParticipationGranted: {
    channels: ['email', 'whatsapp', 'telegram', 'sms', 'push', 'inApp'];
  };
  
  quizFailed: {
    channels: ['email', 'inApp'];
  };
  
  pointsThresholdAchieved: {
    channels: ['email', 'whatsapp', 'telegram', 'push', 'inApp'];
  };
  
  directInvitationReceived: {
    channels: ['email', 'whatsapp', 'telegram', 'sms', 'push', 'inApp'];
  };
  
  tournament24HourReminder: {
    channels: ['email', 'whatsapp', 'telegram', 'sms', 'push', 'inApp'];
  };
  
  tournament1HourReminder: {
    channels: ['sms', 'push', 'inApp'];
  };
}
```

---

## 🎨 UI/UX Celebration Effects

### Quiz Pass Celebration
```typescript
interface CelebrationEffects {
  confetti: {
    enabled: true;
    colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1'];
    duration: 5000; // 5 seconds
    particleCount: 150;
  };
  
  soundEffect: {
    enabled: true;
    file: '/sounds/success-fanfare.mp3';
    volume: 0.7;
  };
  
  modal: {
    title: '🎉 CONGRATULATIONS!';
    message: 'You passed the qualification quiz!';
    score: 'Your Score: 85%';
    badge: '🏆 Tournament Participant Badge';
    animation: 'bounce-in';
    autoCloseAfter: 10000; // 10 seconds
  };
  
  badgeAnimation: {
    type: 'scale-rotate';
    duration: 1500;
  };
  
  xpGain: {
    show: true;
    amount: 100;
    animation: 'float-up';
  };
}
```

---

## 📈 Admin Dashboard Features

### Tournament Management Panel

#### 1. Qualification Settings Tab
```
┌─────────────────────────────────────────────────┐
│ Qualification Settings                           │
├─────────────────────────────────────────────────┤
│                                                  │
│ □ Enable Pre-Tournament Quiz                    │
│   ├─ Questions: [20] ▼                          │
│   ├─ Pass Mark: [70]%                           │
│   ├─ Time Limit: [30] minutes                   │
│   └─ Retakes Allowed: [No] ▼                    │
│                                                  │
│ □ Enable Practice Points Path                   │
│   ├─ Required Points: [500]                     │
│   ├─ Counting Period: [Last 30 Days] ▼          │
│   └─ Reset After Tournament: [Yes] ▼            │
│                                                  │
│ □ Allow Direct Admin Invitations                │
│                                                  │
│ [Save Settings]                                  │
└─────────────────────────────────────────────────┘
```

#### 2. Applications Overview
```
┌─────────────────────────────────────────────────────────────┐
│ Tournament Applications - Bible Quiz Championship            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Total Applications: 45                                       │
│ ├─ Qualified (Quiz Pass): 15                                │
│ ├─ Qualified (Points): 8                                    │
│ ├─ Direct Invitations: 3                                    │
│ ├─ Pending Quiz: 12                                         │
│ └─ Failed/Rejected: 7                                       │
│                                                              │
│ [View All] [Export List] [Send Reminders]                  │
└─────────────────────────────────────────────────────────────┘
```

#### 3. Applicants Table
```
┌──────────────────────────────────────────────────────────────────────────┐
│ Name          │ Applied    │ Method      │ Status     │ Score  │ Actions  │
├──────────────────────────────────────────────────────────────────────────┤
│ John Doe      │ 2h ago     │ Quiz        │ Passed ✓   │ 85%    │ [View]   │
│ Jane Smith    │ 5h ago     │ Points      │ Qualified  │ 520pts │ [View]   │
│ Mike Johnson  │ 1d ago     │ Invitation  │ Qualified  │ N/A    │ [View]   │
│ Sarah Wilson  │ 3h ago     │ Quiz        │ Pending    │ -      │ [Remind] │
│ Tom Brown     │ 6h ago     │ Quiz        │ Failed ✗   │ 55%    │ [Review] │
└──────────────────────────────────────────────────────────────────────────┘
```

#### 4. Direct Invitation Interface
```
┌─────────────────────────────────────────────────┐
│ Add Participants Directly                        │
├─────────────────────────────────────────────────┤
│                                                  │
│ Search Users: [_____________________] 🔍        │
│                                                  │
│ Selected Users (3):                              │
│ ☑ John Doe                               [×]    │
│ ☑ Jane Smith                             [×]    │
│ ☑ Mike Johnson                           [×]    │
│                                                  │
│ Reason (Optional):                               │
│ [_________________________________________]      │
│                                                  │
│ Send Notification: ☑ Email ☑ WhatsApp ☑ SMS   │
│                                                  │
│ [Cancel]  [Add as Participants]                 │
└─────────────────────────────────────────────────┘
```

---

## 🔄 Complete User Flow Diagrams

### Flow 1: Quiz-Based Qualification
```
User Registers (Inspector)
        ↓
Apply for Practice Access
        ↓
Admin Approves → [Notification Sent]
        ↓
User Practices & Builds Skills
        ↓
Tournament Announced
        ↓
User Applies to Participate → [Notification Sent]
        ↓
Pre-Tournament Quiz Available → [Notification Sent]
        ↓
┌─────────────────────────────────────────────────┐
│         RETAKE SYSTEM (Default: 3 Attempts)     │
└─────────────────────────────────────────────────┘
        ↓
User Takes Quiz - Attempt 1
        ↓
    ┌───────────────┐
    │  Pass (≥70%)  │────→ [Celebration Effects]
    │               │────→ [Multi-Channel Notifications]
    │               │────→ Grant Participant Status (THIS tournament)
    │               │────→ Award XP & Badge
    │               │────→ END (Success)
    └───────────────┘
    
    ┌───────────────┐
    │  Fail (<70%)  │────→ Show Score & Weak Areas
    │   Attempt 1   │────→ "2 attempts remaining"
    │               │────→ Wait time if configured (e.g., 30 min)
    └───────┬───────┘
            ↓
    User Takes Quiz - Attempt 2 (Different Questions)
            ↓
        ┌───────────────┐
        │  Pass (≥70%)  │────→ [Celebration Effects]
        │               │────→ [Success on 2nd Try!]
        │               │────→ Grant Participant Status
        │               │────→ END (Success)
        └───────────────┘
        
        ┌───────────────┐
        │  Fail (<70%)  │────→ Show Progress: Attempt 1 vs 2
        │   Attempt 2   │────→ "1 final attempt remaining"
        │               │────→ Encouragement message
        └───────┬───────┘
                ↓
        User Takes Quiz - Attempt 3 (Different Questions Again)
                ↓
            ┌───────────────┐
            │  Pass (≥70%)  │────→ [Celebration Effects]
            │               │────→ [Success on Final Try!]
            │               │────→ Grant Participant Status
            │               │────→ END (Success)
            └───────────────┘
            
            ┌───────────────┐
            │  Fail (<70%)  │────→ Show All 3 Attempts
            │   Attempt 3   │────→ Best Score Highlighted
            │   (FINAL)     │────→ Detailed Analysis
            │               │────→ Cannot Retake for THIS Tournament
            │               │────→ Suggest Practice Mode
            │               │────→ [Encouraging Notification]
            └───────────────┘
        ↓
Tournament Starts → [24h & 1h Reminders]
        ↓
Qualified Users Participate
        ↓
Tournament Ends
        ↓
Status Resets → Must Reapply for Next Tournament
```

### Flow 2: Points-Based Auto-Qualification
```
User Has Practice Access
        ↓
Practices Regularly
        ↓
Earns Practice Points
   • Correct Answer: +10pts
   • Perfect Quiz: +50pts
   • Daily Streak: +5pts
        ↓
Reaches Threshold (e.g., 500pts)
        ↓
Tournament Announced
        ↓
User Applies to Participate
        ↓
System Checks Points: userPoints >= requiredPoints?
        ↓
    YES → Skip Quiz Entirely
        ↓
   [Auto-Qualification Celebration]
   [Multi-Channel Notifications]
   Grant Participant Status
        ↓
Tournament Starts → [Reminders]
        ↓
User Participates
        ↓
Points Reset (if configured)
Status Resets for Next Tournament
```

### Flow 3: Direct Admin Invitation
```
Admin Views Tournament
        ↓
Selects "Add Participants"
        ↓
Searches for User(s)
        ↓
Selects Users + Optional Reason
        ↓
Clicks "Add as Participants"
        ↓
System Actions:
   • Grant Participant Status
   • Skip All Qualification Steps
   • Log Audit Trail
   • [Send Multi-Channel Notification]
        ↓
User Receives Invitation → [All Channels]
        ↓
User Accepts (Optional)
        ↓
Tournament Starts
        ↓
User Participates
```

---

## 🛠️ Implementation Checklist

### Phase 1: Core Qualification System
- [ ] Create `TournamentParticipant` model with retake tracking
- [ ] Create `PreTournamentQuiz` model with attempt history
- [ ] Create `QuizAttemptRecord` model for each attempt
- [ ] Create `PracticePoints` tracking system
- [ ] Implement `applyForTournament(userId, tournamentId)` function
- [ ] Implement `takeQualificationQuiz(attemptNumber)` function
- [ ] Implement **Question Pool Validation** system
  - [ ] Calculate required pool size (questions × attempts)
  - [ ] Validate sufficient questions before enabling retakes
  - [ ] Admin warning if insufficient questions
- [ ] Implement **Question Selection Algorithm**
  - [ ] Track questions shown in each attempt
  - [ ] Prevent question reuse across attempts
  - [ ] Random selection from unused questions
- [ ] Implement **Retake Management**
  - [ ] Track attempts used and remaining
  - [ ] Enforce wait time between attempts (if configured)
  - [ ] Allow max 3 attempts by default (configurable 1-5)
- [ ] Implement `checkPracticePointsEligibility()` function
- [ ] Implement `directlyAddParticipant()` admin function
- [ ] Create quiz scoring and pass/fail logic
- [ ] Implement **Attempt Progress Tracking**
  - [ ] Show "Attempt X of Y"
  - [ ] Display score history across attempts
  - [ ] Show best score achieved
- [ ] Implement celebration effects system
- [ ] Reset participant status after tournament

### Phase 2: Practice Points System
- [ ] Create points earning rules engine
- [ ] Implement real-time points tracking
- [ ] Create points history log
- [ ] Build points threshold checker
- [ ] Create admin points configuration UI
- [ ] Implement points reset logic
- [ ] Build practice points leaderboard

### Phase 3: Notification System
- [ ] Set up notification service architecture
- [ ] Integrate email provider (SendGrid/SMTP)
- [ ] Integrate WhatsApp Business API
- [ ] Integrate Telegram Bot API
- [ ] Integrate SMS provider (Twilio)
- [ ] Implement push notifications (Firebase/OneSignal)
- [ ] Create notification templates (all 10 types)
- [ ] Build notification queue system
- [ ] Implement retry logic for failed notifications
- [ ] Create admin notification settings UI
- [ ] Build notification history/audit log

### Phase 4: Admin Dashboard
- [ ] Tournament qualification settings panel
  - [ ] **Retake configuration UI** with validation
  - [ ] **Question pool requirement calculator**
  - [ ] **Insufficient questions warning**
  - [ ] **Auto-adjust suggestions** (reduce questions or attempts)
- [ ] Applications overview dashboard
- [ ] Applicants management table with attempt history
  - [ ] Show attempt count for each applicant
  - [ ] Display best score across attempts
  - [ ] View detailed attempt history per user
- [ ] Direct invitation interface
- [ ] Quiz results review panel
  - [ ] **Multi-attempt score comparison**
  - [ ] **Progress tracking across attempts**
- [ ] Practice points dashboard
- [ ] Bulk actions (approve, remind, export)
- [ ] Notification sending interface
- [ ] Analytics & reporting
  - [ ] **Retake success rates** (1st vs 2nd vs 3rd attempt)
  - [ ] **Question difficulty analysis** based on attempts

### Phase 5: UI/UX Enhancements
- [ ] Tournament application page
- [ ] Pre-tournament quiz interface
  - [ ] **Attempt counter display** ("Attempt 2 of 3")
  - [ ] **Previous attempt score shown** for context
  - [ ] **Wait timer** if cooldown configured
- [ ] Quiz timer and progress bar
- [ ] Celebration effects (confetti, sounds, animations)
  - [ ] **Different celebrations** based on attempt (1st try vs final try)
- [ ] Score breakdown page
  - [ ] **Multi-attempt comparison view**
  - [ ] **Improvement tracking** between attempts
  - [ ] **Weak area identification** across all attempts
- [ ] **Retake encouragement UI**
  - [ ] Show attempts remaining
  - [ ] Display score improvement tips
  - [ ] Highlight near-miss scenarios ("Just 2% away!")
- [ ] Practice points progress tracker
- [ ] Tournament status badges
- [ ] Notification preferences UI
- [ ] Mobile-responsive design

### Phase 6: Testing & Optimization
- [ ] Unit tests for all qualification paths
- [ ] **Retake system tests**
  - [ ] Question selection algorithm validation
  - [ ] Duplicate question prevention
  - [ ] Attempt limit enforcement
  - [ ] Wait time enforcement
- [ ] **Question pool validation tests**
  - [ ] Insufficient pool scenarios
  - [ ] Pool size calculations
  - [ ] Admin warning triggers
- [ ] Integration tests for notification system
- [ ] Load testing for concurrent quiz-takers
- [ ] UI/UX testing for celebration effects
- [ ] Admin workflow testing
- [ ] Cross-channel notification testing
- [ ] Performance optimization
- [ ] Security audit
  - [ ] Prevent attempt manipulation
  - [ ] Prevent question extraction/sharing

---

## 💡 Additional Recommendations

### 1. **Grace Period for Applications**
- Set application deadline (e.g., 48 hours before tournament)
- Send deadline reminders to interested users
- Close applications automatically at cutoff time

### 2. **Quiz Question Pool Rotation & Retake Strategy**
- **CRITICAL**: Maintain question pool at least Questions × MaxAttempts
- Rotate questions to prevent sharing between users
- Track which questions each user received in each attempt
- **Smart pool management**:
  - Alert admin when pool depletes below threshold
  - Suggest adding more questions or reducing attempts
  - Auto-disable retakes if pool insufficient
- Prevent repeat questions in retakes (if allowed)

### 3. **Practice Points Decay** (Optional)
- Points older than X days lose value
- Encourages consistent practice
- Admin configurable

### 4. **Waitlist System**
- Tournament capacity limits
- Auto-promote from waitlist if participant drops
- Notification when promoted from waitlist

### 5. **Participant Analytics**
- Track qualification success rates
- Identify common failure points
- Improve quiz difficulty calibration
- Monitor points distribution

### 6. **Anti-Cheating Measures**
- Randomize question order
- Randomize answer choices
- Time-lock between questions
- Browser focus detection
- IP address logging

### 7. **Notification Rate Limiting**
- Prevent notification spam
- Batch similar notifications
- User preference for notification frequency
- Quiet hours configuration

### 8. **Multi-Language Support**
- Translate all notification templates
- Support user language preferences
- Admin can set default language

---

## 🎯 Success Metrics

### User Engagement
- Application rate per tournament
- Quiz completion rate
- Quiz pass rate
- Practice mode usage before tournaments
- Points accumulation trends

### System Performance
- Notification delivery rate per channel
- Average notification delivery time
- Quiz loading time
- Concurrent users during qualification period

### Admin Efficiency
- Time to review applications
- Direct invitation usage rate
- Configuration changes frequency
- Bulk action usage

---

## 📝 Summary

This tournament qualification system ensures:
✅ **Fair Access**: Multiple pathways to participate  
✅ **Engagement**: Practice mode drives continuous learning  
✅ **Flexibility**: Admins can override when needed  
✅ **Communication**: Multi-channel notifications keep everyone informed  
✅ **Freshness**: Every tournament is a new opportunity  
✅ **Motivation**: Celebration effects reward achievement  
✅ **Scalability**: Handles growing user base and tournaments  

**Result**: A sophisticated, engaging, and fair tournament qualification ecosystem that maximizes participation while maintaining quality standards.
