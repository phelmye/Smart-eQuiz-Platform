# Phase 14: AI Question Generation & Lifecycle Management - Implementation Guide

## Table of Contents
1. [Overview](#overview)
2. [Business Requirements](#business-requirements)
3. [Technical Architecture](#technical-architecture)
4. [Data Model](#data-model)
5. [Question Lifecycle Flow](#question-lifecycle-flow)
6. [AI Generation System](#ai-generation-system)
7. [Tournament Auto-Rotation](#tournament-auto-rotation)
8. [API Reference](#api-reference)
9. [Frontend Implementation Guide](#frontend-implementation-guide)
10. [Testing Strategy](#testing-strategy)

---

## Overview

Phase 14 introduces a comprehensive AI-powered question generation system with sophisticated lifecycle management, approval workflows, and automated tournament question rotation.

### Key Features
- **AI Question Generation**: Plan-based monthly limits with multiple model support
- **Lifecycle Management**: 7-state question lifecycle from draft to archived
- **Approval Workflow**: 4-state approval process for AI-generated questions
- **Tournament Auto-Rotation**: Automatic question rotation after tournaments with delayed release
- **Duplicate Detection**: 85% similarity threshold for quality control
- **Complete Audit Trail**: Full transparency with lifecycle logging

### Status
- **Phase 14.1**: Data Model & Business Logic - ✅ COMPLETED (Commit: edf08e0)
- **Phase 14.2**: Frontend Components - 🚧 IN PROGRESS
- **Phase 14.3**: Testing & Validation - ⏳ PLANNED

---

## Business Requirements

### User Stories

#### 1. AI Question Generation
**As a tenant admin**, I want to:
- Generate Bible questions using AI
- Have generation limits based on my subscription plan
- Choose from multiple AI models
- Prevent duplicate questions
- Review and edit AI-generated questions before approval

#### 2. Question Approval Workflow
**As a tenant admin**, I want to:
- Review AI-generated questions before they enter the pool
- Edit questions that need revision
- Reject questions that don't meet quality standards
- Choose to add approved questions to the pool OR upcoming tournament
- Track who created, reviewed, and approved each question

#### 3. Tournament Question Management
**As a tenant admin**, I want to:
- Keep upcoming tournament questions hidden from practice mode
- Automatically make last tournament's questions available for practice
- Configure when recent tournament questions become available (immediate/delayed/manual)
- Ensure minimum questions per category for tournaments (10)
- Notify users when delayed questions will be available

#### 4. Practice Mode
**As a user**, I want to:
- Practice with questions from the question pool
- Practice with questions from the most recent tournament
- See when recent tournament questions will be available
- Not see upcoming tournament questions

### Business Rules

#### Question Pool
- Minimum pool size: **100 questions** (recommended)
- Minimum per category in pool: **20 questions** (recommended)
- Questions must be approved before entering the pool
- Pool questions are always available for practice

#### Tournament Questions
- Minimum per category: **10 questions** (enforced)
- Tournament questions hidden from practice until released
- Only last 1 tournament kept for practice
- Previous tournament questions return to pool when new tournament ends

#### AI Generation Limits (Monthly, Auto-Reset)
- **Free**: 50 questions/month
- **Pro**: 100 questions/month
- **Professional**: 500 questions/month
- **Enterprise**: Unlimited

#### Auto-Rotation Modes
- **Immediate**: Questions available right after tournament ends (default)
- **Delayed**: Configurable delay (e.g., 24 hours) with user notification
- **Manual**: Admin manually releases questions

---

## Technical Architecture

### System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     AI Question Generation Flow                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. Admin Requests → 2. Check Limit → 3. Generate → 4. Review   │
│     AI Generation        (Plan-Based)     (External API)          │
│                                                                   │
│  5. Edit/Inspect → 6. Approve/Reject → 7. Destination Selection │
│     (by Admin)         (Approval Workflow)    (Pool or Tournament)│
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     Question Lifecycle States                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│   DRAFT → AI_PENDING_REVIEW → QUESTION_POOL →                   │
│                                                                   │
│   TOURNAMENT_RESERVED → TOURNAMENT_ACTIVE →                      │
│                                                                   │
│   RECENT_TOURNAMENT → (back to) QUESTION_POOL → ARCHIVED        │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                  Tournament Auto-Rotation Flow                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│   Tournament Ends → Check Mode → Immediate/Delayed/Manual       │
│                                                                   │
│   Current Questions: TOURNAMENT_ACTIVE → RECENT_TOURNAMENT      │
│                                                                   │
│   Previous Recent: RECENT_TOURNAMENT → QUESTION_POOL            │
│                                                                   │
│   If Delayed: Set availableForPracticeDate + Notify Users       │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack
- **Frontend**: React + TypeScript + shadcn/ui
- **State Management**: localStorage (mockData.ts)
- **AI Models**: GPT-4, GPT-3.5-turbo, Claude-3, Claude-3-Opus (external API)
- **Duplicate Detection**: Similarity scoring algorithm (85% threshold)

---

## Data Model

### Enhanced Question Interface

```typescript
interface Question {
  // Core fields (existing)
  id: string;
  tenantId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  timeLimit: number;
  
  // ===== NEW LIFECYCLE FIELDS =====
  
  // Status tracking
  status: QuestionStatus;  // 7 possible states
  approvalStatus?: QuestionApprovalStatus;  // 4 possible states
  
  // Tournament tracking
  tournamentId?: string;  // Associated tournament
  tournamentDate?: string;  // When used in tournament
  usageCount: number;  // Times used in tournaments
  lastUsedDate?: string;  // Last tournament usage
  availableForPracticeDate?: string;  // Delayed release date
  
  // AI generation tracking
  aiGeneratedAt?: string;  // When AI generated
  aiModel?: string;  // Which AI model used
  aiPrompt?: string;  // Prompt used for generation
  
  // Approval workflow
  createdBy: string;  // User ID who created
  reviewedBy?: string;  // User ID who reviewed
  approvedBy?: string;  // User ID who approved
  reviewedAt?: string;  // Review timestamp
  approvedAt?: string;  // Approval timestamp
  rejectionReason?: string;  // Why rejected
  revisionNotes?: string;  // Admin notes for revision
  
  // Metadata
  tags?: string[];  // Categorization tags
  createdAt: string;  // Creation timestamp
  updatedAt: string;  // Last update timestamp
}
```

### Question Status Enum

```typescript
enum QuestionStatus {
  DRAFT = 'draft',                           // Being created/edited
  AI_PENDING_REVIEW = 'ai_pending_review',   // AI-generated, awaiting approval
  QUESTION_POOL = 'question_pool',           // Available for practice (approved)
  TOURNAMENT_RESERVED = 'tournament_reserved', // Locked for upcoming tournament
  TOURNAMENT_ACTIVE = 'tournament_active',   // Currently in tournament
  RECENT_TOURNAMENT = 'recent_tournament',   // Last tournament (practice available)
  ARCHIVED = 'archived'                      // Retired questions
}
```

### Question Approval Status Enum

```typescript
enum QuestionApprovalStatus {
  PENDING = 'pending',               // Awaiting review
  APPROVED = 'approved',             // Approved for use
  REJECTED = 'rejected',             // Rejected - won't be used
  NEEDS_REVISION = 'needs_revision'  // Needs changes before approval
}
```

### AI Generation Config

```typescript
interface AIGenerationConfig {
  tenantId: string;
  planId: string;  // Current subscription plan
  
  // Usage tracking
  monthlyQuestionLimit: number;  // -1 for unlimited
  questionsUsedThisMonth: number;
  resetDate: string;  // ISO date for monthly reset
  
  // Model configuration
  defaultModel: 'gpt-4' | 'gpt-3.5-turbo' | 'claude-3' | 'claude-3-opus';
  enabledModels: string[];
  
  // Quality control
  requireManualApproval: boolean;
  autoApproveAfterReview: boolean;
  duplicateDetectionEnabled: boolean;
  similarityThreshold: number;  // 0.0 to 1.0 (default: 0.85)
  
  // Statistics
  totalQuestionsGenerated: number;
  totalQuestionsApproved: number;
  totalQuestionsRejected: number;
  averageApprovalTime: number;  // In minutes
  
  createdAt: string;
  updatedAt: string;
}
```

### AI Generation Request

```typescript
interface AIGenerationRequest {
  id: string;
  tenantId: string;
  requestedBy: string;  // User ID
  
  // Request parameters
  count: number;  // Number of questions to generate
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  bibleBooks?: string[];  // Filter by specific books
  topics?: string[];  // Filter by topics
  verseRange?: { book: string; startChapter: number; endChapter: number };
  
  // AI settings
  model: string;
  temperature?: number;  // 0.0 to 1.0
  customPrompt?: string;
  
  // Status tracking
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;  // 0 to 100
  generatedQuestionIds: string[];
  error?: string;
  
  // Timestamps
  requestedAt: string;
  startedAt?: string;
  completedAt?: string;
}
```

### Tournament Question Config

```typescript
interface TournamentQuestionConfig {
  tournamentId: string;
  tenantId: string;
  
  // Selection configuration
  selectionMode: 'manual' | 'auto' | 'hybrid';
  selectedQuestionIds: string[];
  
  // Auto-selection rules (if selectionMode is 'auto' or 'hybrid')
  autoSelectRules?: {
    categoryDistribution: { category: string; count: number }[];
    difficultyDistribution?: { difficulty: string; percentage: number }[];
    preferRecentlyCreated: boolean;
    excludeRecentlyUsed: boolean;
    minDaysSinceLastUse?: number;
  };
  
  // Practice release configuration
  practiceReleaseMode: 'immediate' | 'delayed' | 'manual';
  delayHours?: number;  // For 'delayed' mode
  releaseScheduledFor?: string;  // ISO date for scheduled release
  
  // Validation
  minimumQuestionsPerCategory: number;  // Default: 10
  
  // Status
  releasedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Question Lifecycle Log

```typescript
interface QuestionLifecycleLog {
  id: string;
  questionId: string;
  tenantId: string;
  
  // Transition details
  fromStatus: QuestionStatus;
  toStatus: QuestionStatus;
  reason: string;
  
  // Context
  tournamentId?: string;
  triggeredBy: 'user' | 'system';
  userId?: string;  // If triggered by user
  metadata?: any;  // Additional context
  
  createdAt: string;
}
```

### Question Duplicate Check

```typescript
interface QuestionDuplicateCheck {
  questionId: string;
  isDuplicate: boolean;
  similarQuestions: {
    questionId: string;
    similarityScore: number;  // 0.0 to 1.0
    question: string;
  }[];
}
```

---

## Question Lifecycle Flow

### State Transition Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                       Question Lifecycle States                   │
└──────────────────────────────────────────────────────────────────┘

                         [Manual Creation]
                               ↓
                         ┌──────────┐
                         │  DRAFT   │
                         └────┬─────┘
                              ↓ [Submit for AI Generation]
                    ┌─────────────────────┐
                    │ AI_PENDING_REVIEW   │
                    └──────┬──────────────┘
                           ↓ [Approve]
                    ┌──────────────┐
              ┌────→│ QUESTION_POOL│←──────┐
              │     └──────┬───────┘       │
              │            ↓ [Assign to    │
              │            ↓  Tournament]  │
              │     ┌──────────────────┐   │
              │     │TOURNAMENT_RESERVED│   │
              │     └──────┬───────────┘   │
              │            ↓ [Tournament   │
              │            ↓  Starts]      │
              │     ┌──────────────────┐   │
              │     │TOURNAMENT_ACTIVE │   │
              │     └──────┬───────────┘   │
              │            ↓ [Tournament   │
              │            ↓  Ends]        │
              │     ┌──────────────────┐   │
              │     │RECENT_TOURNAMENT │───┘
              │     └──────┬───────────┘   
              │            ↓ [Next Tournament Ends]
              │            ↓
              └────────────┘

                    [Manual Archive]
                         ↓
                    ┌──────────┐
                    │ ARCHIVED │
                    └──────────┘

Notes:
- RECENT_TOURNAMENT → QUESTION_POOL happens when next tournament ends
- Only ONE tournament's questions can be in RECENT_TOURNAMENT at a time
- Delayed release: Questions stay in TOURNAMENT_ACTIVE with availableForPracticeDate set
```

### Approval Workflow

```
┌────────────────────────────────────────────────────────────┐
│              Question Approval State Machine               │
└────────────────────────────────────────────────────────────┘

        [AI Generates Question]
                 ↓
           ┌──────────┐
           │ PENDING  │
           └────┬─────┘
                ↓ [Admin Reviews]
    ┌───────────┼───────────┬──────────────┐
    ↓           ↓           ↓              ↓
┌─────────┐ ┌─────────┐ ┌──────────────┐ ┌──────────┐
│APPROVED │ │REJECTED │ │NEEDS_REVISION│ │  (Edit)  │
└────┬────┘ └─────────┘ └──────┬───────┘ └────┬─────┘
     ↓                          ↓              ↓
[Add to Pool]          [Admin Edits]    [Re-submit]
or [Tournament]              ↓                ↓
                       ┌──────────┐     ┌──────────┐
                       │ PENDING  │────→│ PENDING  │
                       └──────────┘     └──────────┘
```

---

## AI Generation System

### Plan-Based Limits

| Plan          | Monthly Questions | Model Access                           | Price     |
|---------------|-------------------|----------------------------------------|-----------|
| Free          | 50                | GPT-3.5-turbo                         | $0        |
| Pro           | 100               | GPT-3.5-turbo, GPT-4                  | $49/month |
| Professional  | 500               | GPT-3.5-turbo, GPT-4, Claude-3        | $149/month|
| Enterprise    | Unlimited         | All models + Custom                    | Custom    |

### Generation Workflow

```typescript
// 1. Check if tenant can generate questions
const check = canGenerateAIQuestions(tenantId, requestedCount);
if (!check.allowed) {
  // Show error: check.reason
  return;
}

// 2. Create generation request
const request = createAIGenerationRequest(tenantId, userId, {
  count: 10,
  category: 'New Testament',
  difficulty: 'medium',
  bibleBooks: ['Matthew', 'Mark'],
  model: 'gpt-4',
  temperature: 0.7
});

// 3. Call external AI API (not implemented yet)
const questions = await externalAI.generateQuestions(request);

// 4. Save questions as AI_PENDING_REVIEW
for (const q of questions) {
  const question: Question = {
    ...q,
    status: QuestionStatus.AI_PENDING_REVIEW,
    approvalStatus: QuestionApprovalStatus.PENDING,
    aiGeneratedAt: new Date().toISOString(),
    aiModel: request.model,
    aiPrompt: request.customPrompt,
    createdBy: userId
  };
  // Save to storage
}

// 5. Admin reviews and approves/rejects
```

### Duplicate Detection

```typescript
// Check for duplicates before approval
function detectDuplicates(newQuestion: Question): QuestionDuplicateCheck {
  const existingQuestions = getQuestions(newQuestion.tenantId);
  const similarities = existingQuestions.map(existing => ({
    questionId: existing.id,
    similarityScore: calculateSimilarity(newQuestion.question, existing.question),
    question: existing.question
  })).filter(s => s.similarityScore >= 0.85);
  
  return {
    questionId: newQuestion.id,
    isDuplicate: similarities.length > 0,
    similarQuestions: similarities.sort((a, b) => b.similarityScore - a.similarityScore)
  };
}
```

---

## Tournament Auto-Rotation

### Rotation Logic

```typescript
// Called when tournament ends
async function handleTournamentCompletion(tournamentId: string): Promise<void> {
  const tournament = getTournament(tournamentId);
  const config = getTournamentQuestionConfig(tournamentId);
  const questions = getQuestions(tournament.tenantId);
  
  // Mode 1: IMMEDIATE (default)
  if (config.practiceReleaseMode === 'immediate') {
    // Current tournament questions → RECENT_TOURNAMENT
    updateQuestionsStatus(
      config.selectedQuestionIds,
      QuestionStatus.RECENT_TOURNAMENT,
      { reason: 'Tournament completed - immediate release' }
    );
    
    // Previous RECENT_TOURNAMENT → QUESTION_POOL
    const previousRecent = questions.filter(q => 
      q.status === QuestionStatus.RECENT_TOURNAMENT &&
      q.tournamentId !== tournamentId
    );
    updateQuestionsStatus(
      previousRecent.map(q => q.id),
      QuestionStatus.QUESTION_POOL,
      { reason: 'Auto-rotation - moved to pool' }
    );
  }
  
  // Mode 2: DELAYED
  else if (config.practiceReleaseMode === 'delayed') {
    const releaseDate = new Date();
    releaseDate.setHours(releaseDate.getHours() + (config.delayHours || 24));
    
    // Set availability date but keep in TOURNAMENT_ACTIVE
    questions
      .filter(q => config.selectedQuestionIds.includes(q.id))
      .forEach(q => {
        q.availableForPracticeDate = releaseDate.toISOString();
      });
    
    // Schedule notification to users
    scheduleNotification(tournament.tenantId, {
      type: 'delayed_question_release',
      message: `Tournament questions will be available for practice on ${releaseDate.toLocaleDateString()}`,
      releaseDate: releaseDate.toISOString()
    });
    
    // Still rotate previous RECENT_TOURNAMENT to POOL
    const previousRecent = questions.filter(q => 
      q.status === QuestionStatus.RECENT_TOURNAMENT &&
      q.tournamentId !== tournamentId
    );
    updateQuestionsStatus(
      previousRecent.map(q => q.id),
      QuestionStatus.QUESTION_POOL,
      { reason: 'Auto-rotation - moved to pool' }
    );
  }
  
  // Mode 3: MANUAL
  // Admin manually releases via dashboard - no auto action
}
```

### Delayed Release Check

```typescript
// Check if recent tournament questions are available
function getRecentTournamentQuestionsAvailability(tenantId: string) {
  const questions = getQuestions(tenantId);
  const recent = questions.filter(q => q.status === QuestionStatus.RECENT_TOURNAMENT);
  
  if (recent.length === 0) {
    return { available: false, count: 0 };
  }
  
  const delayed = recent.filter(q => q.availableForPracticeDate);
  if (delayed.length === 0) {
    return { available: true, count: recent.length };
  }
  
  const earliest = new Date(Math.min(...delayed.map(q => 
    new Date(q.availableForPracticeDate!).getTime()
  )));
  
  if (earliest <= new Date()) {
    return { available: true, count: recent.length };
  }
  
  return {
    available: false,
    availableAt: earliest.toISOString(),
    count: recent.length
  };
}
```

---

## API Reference

### AI Generation Functions

#### `getAIGenerationConfig(tenantId: string): AIGenerationConfig`
Get or create AI generation config for tenant with plan-based limits.

**Returns**: Config with monthly limits, usage tracking, and settings

**Example**:
```typescript
const config = getAIGenerationConfig('tenant-123');
console.log(`Limit: ${config.monthlyQuestionLimit}`);
console.log(`Used: ${config.questionsUsedThisMonth}`);
console.log(`Resets: ${config.resetDate}`);
```

#### `canGenerateAIQuestions(tenantId: string, count: number): { allowed: boolean; reason?: string }`
Check if tenant can generate specified number of questions this month.

**Returns**: 
- `allowed: true` if generation is allowed
- `allowed: false` with `reason` if limit exceeded

**Example**:
```typescript
const check = canGenerateAIQuestions('tenant-123', 10);
if (!check.allowed) {
  alert(check.reason); // "Monthly limit reached. 5 questions remaining..."
}
```

#### `createAIGenerationRequest(...): AIGenerationRequest | { error: string }`
Create tracked AI generation request with validation.

**Parameters**:
- `tenantId`: Tenant ID
- `userId`: User requesting generation
- `params`: Request parameters (count, category, difficulty, etc.)

**Returns**: Request object or error

**Example**:
```typescript
const request = createAIGenerationRequest('tenant-123', 'user-456', {
  count: 10,
  category: 'New Testament',
  difficulty: 'medium',
  bibleBooks: ['Matthew', 'John'],
  model: 'gpt-4',
  temperature: 0.7,
  customPrompt: 'Focus on parables'
});
```

#### `getAIGenerationRequests(tenantId: string): AIGenerationRequest[]`
Get all AI generation requests for tenant (sorted by date, newest first).

### Lifecycle Management Functions

#### `updateQuestionStatus(questionId, newStatus, context): Question | null`
Update question status with automatic logging.

**Parameters**:
- `questionId`: Question ID
- `newStatus`: New QuestionStatus
- `context`: { reason, userId?, tournamentId?, metadata? }

**Returns**: Updated question or null if not found

**Example**:
```typescript
updateQuestionStatus('q-123', QuestionStatus.QUESTION_POOL, {
  reason: 'Approved after review',
  userId: 'admin-456'
});
```

#### `handleTournamentCompletion(tournamentId: string): Promise<void>`
Auto-rotate questions after tournament completion (3 modes).

**Behavior**:
- Immediate: Questions available right away
- Delayed: Set availableForPracticeDate + notify users
- Manual: No auto action

**Example**:
```typescript
// Called when tournament ends
await handleTournamentCompletion('tournament-789');
```

#### `getQuestionsForPractice(tenantId, options): Question[]`
Get questions available for practice with filtering.

**Options**:
- `source`: 'pool' | 'recent' | 'both'
- `category`: Filter by category
- `difficulty`: Filter by difficulty
- `excludeQuestionIds`: Exclude specific questions

**Returns**: Filtered questions (respects delayed release)

**Example**:
```typescript
const questions = getQuestionsForPractice('tenant-123', {
  source: 'both',
  category: 'Old Testament',
  difficulty: 'hard'
});
```

#### `getRecentTournamentQuestionsAvailability(tenantId): object`
Check if recent tournament questions are available.

**Returns**:
```typescript
{
  available: boolean;
  availableAt?: string;  // ISO date if delayed
  count: number;
  oldTournamentQuestions?: { tournamentId: string; count: number }[];
}
```

#### `validateTournamentQuestions(tournamentId): object`
Validate tournament has minimum questions per category.

**Returns**:
```typescript
{
  valid: boolean;
  errors: string[];
  categoryCounts: { category: string; count: number; minimum: number }[];
}
```

**Example**:
```typescript
const validation = validateTournamentQuestions('tournament-789');
if (!validation.valid) {
  validation.errors.forEach(error => console.error(error));
  // "Category 'Old Testament' has only 8 questions (minimum: 10)"
}
```

---

## Frontend Implementation Guide

### Phase 14.2 Components

#### 1. Enhanced AIQuestionGenerator Component

**File**: `src/components/AIQuestionGenerator.tsx`

**Features**:
- AI generation form with parameters
- Plan-based limit display
- Progress monitoring
- Generated questions review list
- Approval workflow UI

**UI Mockup**:
```
┌─────────────────────────────────────────────────────────────┐
│ AI Question Generator                                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Plan Usage: 45 / 100 questions this month                   │
│ ████████████████░░░░░░░░░░░░░░░░░░░░░░  45%                │
│ Resets: December 1, 2024                                    │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Generate New Questions                               │    │
│ │                                                       │    │
│ │ Count: [  10  ] questions                           │    │
│ │                                                       │    │
│ │ Category: [ New Testament ▼ ]                       │    │
│ │                                                       │    │
│ │ Difficulty: ○ Easy  ● Medium  ○ Hard                │    │
│ │                                                       │    │
│ │ Bible Books (optional):                              │    │
│ │ [x] Matthew  [ ] Mark  [x] Luke  [x] John           │    │
│ │                                                       │    │
│ │ AI Model: [ GPT-4 ▼ ]                               │    │
│ │                                                       │    │
│ │ Temperature: [──●────────] 0.7                      │    │
│ │                                                       │    │
│ │ Custom Prompt (optional):                            │    │
│ │ ┌─────────────────────────────────────────────┐    │    │
│ │ │ Focus on Jesus's teachings and parables     │    │    │
│ │ └─────────────────────────────────────────────┘    │    │
│ │                                                       │    │
│ │ [Generate Questions]                                 │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Pending Approval (3 questions)                       │    │
│ │                                                       │    │
│ │ ┌───────────────────────────────────────────────┐  │    │
│ │ │ ⚠ AI_PENDING_REVIEW                           │  │    │
│ │ │ Who wrote the Gospel of John?                  │  │    │
│ │ │ Difficulty: Medium | Category: New Testament   │  │    │
│ │ │ Generated: 2 hours ago | Model: GPT-4          │  │    │
│ │ │                                                 │  │    │
│ │ │ [✏ Edit] [👁 Review] [✓ Approve] [✗ Reject]   │  │    │
│ │ └───────────────────────────────────────────────┘  │    │
│ │                                                       │    │
│ │ ... (2 more questions)                               │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Key Code Snippets**:
```typescript
// Check if can generate
const handleGenerate = async () => {
  const check = canGenerateAIQuestions(tenantId, count);
  if (!check.allowed) {
    toast.error(check.reason);
    return;
  }
  
  const request = createAIGenerationRequest(tenantId, userId, {
    count,
    category,
    difficulty,
    bibleBooks: selectedBooks,
    model: selectedModel,
    temperature,
    customPrompt
  });
  
  if ('error' in request) {
    toast.error(request.error);
    return;
  }
  
  // Call external AI API
  setIsGenerating(true);
  try {
    const result = await externalAI.generateQuestions(request);
    // Save questions with AI_PENDING_REVIEW status
    toast.success(`Generated ${result.length} questions for review`);
  } catch (error) {
    toast.error('Generation failed');
  } finally {
    setIsGenerating(false);
  }
};

// Approve question
const handleApprove = (questionId: string, destination: 'pool' | 'tournament') => {
  updateQuestionStatus(questionId, 
    destination === 'pool' ? QuestionStatus.QUESTION_POOL : QuestionStatus.TOURNAMENT_RESERVED,
    {
      reason: `Approved and added to ${destination}`,
      userId: currentUser.id
    }
  );
  
  // Update approval status
  const questions = getQuestions(tenantId);
  const question = questions.find(q => q.id === questionId);
  if (question) {
    question.approvalStatus = QuestionApprovalStatus.APPROVED;
    question.approvedBy = currentUser.id;
    question.approvedAt = new Date().toISOString();
  }
  
  toast.success(`Question approved and added to ${destination}`);
};
```

#### 2. Question Status Badge Component

**File**: `src/components/ui/QuestionStatusBadge.tsx`

**Features**:
- Color-coded badges for all 7 statuses
- Tooltips with status descriptions
- Approval status indicator

**UI Mockup**:
```
Status Badges:
┌──────┐ ┌────────────────────┐ ┌──────────────┐
│DRAFT │ │AI_PENDING_REVIEW   │ │QUESTION_POOL │
└──────┘ └────────────────────┘ └──────────────┘
  Gray          Yellow               Green

┌──────────────────────┐ ┌──────────────────┐
│TOURNAMENT_RESERVED   │ │TOURNAMENT_ACTIVE │
└──────────────────────┘ └──────────────────┘
        Blue                   Purple

┌──────────────────┐ ┌──────────┐
│RECENT_TOURNAMENT │ │ARCHIVED  │
└──────────────────┘ └──────────┘
      Teal             Red
```

**Code**:
```typescript
interface QuestionStatusBadgeProps {
  status: QuestionStatus;
  approvalStatus?: QuestionApprovalStatus;
  showTooltip?: boolean;
}

const statusConfig = {
  [QuestionStatus.DRAFT]: {
    color: 'gray',
    label: 'Draft',
    description: 'Question is being created or edited'
  },
  [QuestionStatus.AI_PENDING_REVIEW]: {
    color: 'yellow',
    label: 'Pending Review',
    description: 'AI-generated question awaiting approval'
  },
  [QuestionStatus.QUESTION_POOL]: {
    color: 'green',
    label: 'Question Pool',
    description: 'Available for practice and tournament selection'
  },
  // ... other statuses
};

export function QuestionStatusBadge({ status, approvalStatus, showTooltip }: QuestionStatusBadgeProps) {
  const config = statusConfig[status];
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant={config.color}>
            {config.label}
          </Badge>
          {approvalStatus && (
            <Badge variant="outline" className="ml-1">
              {approvalStatus}
            </Badge>
          )}
        </TooltipTrigger>
        {showTooltip && (
          <TooltipContent>
            {config.description}
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
```

#### 3. Enhanced QuestionBank Component

**File**: `src/components/QuestionBank.tsx`

**New Features**:
- Filter by status
- Filter by approval status
- AI-generated indicator
- Bulk approval actions
- Lifecycle history viewer

**UI Additions**:
```
┌─────────────────────────────────────────────────────────────┐
│ Question Bank                                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Filters:                                                     │
│ Status: [ All ▼ ] [ QUESTION_POOL ▼ ] [ AI_PENDING_REVIEW ▼]│
│ Approval: [ All ▼ ] [ PENDING ▼ ] [ APPROVED ▼ ]           │
│ AI Generated: [ All ▼ ] [ Yes ] [ No ]                     │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ 🤖 AI  PENDING_REVIEW                                │    │
│ │ Who wrote the Gospel of John?                        │    │
│ │ Category: New Testament | Difficulty: Medium         │    │
│ │ Generated: 2 hours ago | Model: GPT-4                │    │
│ │                                                       │    │
│ │ [✏ Edit] [👁 View History] [✓ Approve] [✗ Reject]  │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ ... (more questions)                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 4. Tournament Question Configuration Panel

**File**: `src/components/TournamentQuestionConfig.tsx` (new)

**Features**:
- Select questions from pool
- Category distribution preview
- Minimum validation (10 per category)
- Auto-rotation mode selector
- Preview of question distribution

**UI Mockup**:
```
┌─────────────────────────────────────────────────────────────┐
│ Tournament Question Configuration                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Selection Mode: ● Auto  ○ Manual  ○ Hybrid                 │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Category Distribution                                │    │
│ │                                                       │    │
│ │ Old Testament:    [  15  ] questions (min: 10) ✓    │    │
│ │ New Testament:    [  20  ] questions (min: 10) ✓    │    │
│ │ Wisdom Books:     [   8  ] questions (min: 10) ⚠    │    │
│ │                                                       │    │
│ │ ⚠ Wisdom Books needs 2 more questions                │    │
│ │                                                       │    │
│ │ Total: 43 questions selected                         │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Practice Release Settings                            │    │
│ │                                                       │    │
│ │ After tournament ends:                               │    │
│ │ ● Release immediately (users can practice now)      │    │
│ │ ○ Delay release by [  24  ] hours                   │    │
│ │ ○ Manual release (admin controls timing)            │    │
│ │                                                       │    │
│ │ ℹ Previous tournament questions will move to pool   │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ [Save Configuration]                                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 5. Practice Mode Source Selector

**File**: `src/components/PracticeMode.tsx` (enhanced)

**New Features**:
- Toggle between pool/recent/both
- Show availability status
- Display delayed release countdown
- Category distribution stats

**UI Addition**:
```
┌─────────────────────────────────────────────────────────────┐
│ Practice Mode                                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ Question Source:                                             │
│ ○ Question Pool (150 questions available)                   │
│ ○ Recent Tournament (Available in 18 hours) ⏰              │
│ ● Both (150 + 43 questions)                                 │
│                                                              │
│ ℹ Recent tournament questions will be available on          │
│   December 1, 2024 at 3:00 PM                               │
│                                                              │
│ ... (rest of practice mode UI)                              │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

**Code**:
```typescript
const PracticeMode = () => {
  const [questionSource, setQuestionSource] = useState<'pool' | 'recent' | 'both'>('both');
  const availability = getRecentTournamentQuestionsAvailability(tenantId);
  
  return (
    <div>
      <RadioGroup value={questionSource} onValueChange={setQuestionSource}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="pool" />
          <Label>Question Pool ({poolCount} questions)</Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="recent" disabled={!availability.available} />
          <Label>
            Recent Tournament 
            {!availability.available && availability.availableAt && (
              <span className="text-amber-500 ml-2">
                Available in {formatCountdown(availability.availableAt)}
              </span>
            )}
          </Label>
        </div>
        
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="both" />
          <Label>Both ({poolCount + recentCount} questions)</Label>
        </div>
      </RadioGroup>
      
      {!availability.available && availability.availableAt && (
        <Alert className="mt-4">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            Recent tournament questions will be available on{' '}
            {new Date(availability.availableAt).toLocaleString()}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Rest of practice mode */}
    </div>
  );
};
```

#### 6. Admin Lifecycle Dashboard

**File**: `src/components/AdminLifecycleDashboard.tsx` (new)

**Features**:
- Question status distribution chart
- AI generation usage
- Recent lifecycle events
- Pending approvals count
- Quick actions

**UI Mockup**:
```
┌─────────────────────────────────────────────────────────────┐
│ Question Lifecycle Dashboard                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌────────────────────┐  ┌────────────────────┐            │
│ │ Status Distribution│  │ AI Generation Usage│            │
│ │                    │  │                    │            │
│ │ [Pie Chart]        │  │ 45 / 100 (45%)    │            │
│ │                    │  │ ████████████░░░░░  │            │
│ │ Pool: 150          │  │ Resets: Dec 1     │            │
│ │ Tournament: 43     │  │                    │            │
│ │ Recent: 43         │  │ [View Requests]   │            │
│ │ Pending: 12        │  │                    │            │
│ └────────────────────┘  └────────────────────┘            │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Pending Actions                                      │    │
│ │                                                       │    │
│ │ ⚠ 12 AI-generated questions awaiting approval       │    │
│ │ ⚠ Wisdom Books category needs 2 more questions      │    │
│ │ ℹ Tournament "Christmas Quiz" ends in 2 days        │    │
│ │                                                       │    │
│ │ [Review Pending Questions]                           │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
│ ┌─────────────────────────────────────────────────────┐    │
│ │ Recent Lifecycle Events                              │    │
│ │                                                       │    │
│ │ • 2 hours ago: 10 questions moved to                 │    │
│ │   RECENT_TOURNAMENT (Tournament "Fall Quiz" ended)  │    │
│ │                                                       │    │
│ │ • 1 day ago: Question approved and added to pool    │    │
│ │                                                       │    │
│ │ • 2 days ago: 15 questions reserved for tournament  │    │
│ │                                                       │    │
│ │ [View Full History]                                  │    │
│ └─────────────────────────────────────────────────────┘    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Testing Strategy

### Unit Tests

#### 1. AI Generation Limit Tests
```typescript
describe('AI Generation Limits', () => {
  it('should enforce Free plan limit (50/month)', () => {
    const result = canGenerateAIQuestions('free-tenant', 51);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('Monthly limit reached');
  });
  
  it('should allow unlimited for Enterprise', () => {
    const result = canGenerateAIQuestions('enterprise-tenant', 10000);
    expect(result.allowed).toBe(true);
  });
  
  it('should auto-reset on new month', () => {
    // Set config with past reset date
    const config = getAIGenerationConfig('tenant-123');
    config.resetDate = '2024-10-01';
    config.questionsUsedThisMonth = 100;
    
    // Check limit (should reset)
    const result = canGenerateAIQuestions('tenant-123', 10);
    expect(result.allowed).toBe(true);
    
    const updatedConfig = getAIGenerationConfig('tenant-123');
    expect(updatedConfig.questionsUsedThisMonth).toBe(0);
  });
});
```

#### 2. Lifecycle Status Tests
```typescript
describe('Question Lifecycle', () => {
  it('should transition from AI_PENDING_REVIEW to QUESTION_POOL on approval', () => {
    const question = updateQuestionStatus('q-123', QuestionStatus.QUESTION_POOL, {
      reason: 'Approved',
      userId: 'admin-456'
    });
    
    expect(question.status).toBe(QuestionStatus.QUESTION_POOL);
    
    // Check log created
    const logs = getQuestionLifecycleLogs('q-123');
    expect(logs).toHaveLength(1);
    expect(logs[0].fromStatus).toBe(QuestionStatus.AI_PENDING_REVIEW);
    expect(logs[0].toStatus).toBe(QuestionStatus.QUESTION_POOL);
  });
  
  it('should handle tournament completion with immediate release', async () => {
    // Setup tournament with questions
    const tournamentId = 'tournament-789';
    const config = {
      tournamentId,
      practiceReleaseMode: 'immediate',
      selectedQuestionIds: ['q-1', 'q-2', 'q-3']
    };
    
    await handleTournamentCompletion(tournamentId);
    
    // Check questions moved to RECENT_TOURNAMENT
    const questions = getQuestions('tenant-123');
    const recentQuestions = questions.filter(q => 
      q.status === QuestionStatus.RECENT_TOURNAMENT &&
      q.tournamentId === tournamentId
    );
    
    expect(recentQuestions).toHaveLength(3);
  });
  
  it('should set availableForPracticeDate with delayed release', async () => {
    const config = {
      tournamentId: 'tournament-789',
      practiceReleaseMode: 'delayed',
      delayHours: 24,
      selectedQuestionIds: ['q-1']
    };
    
    await handleTournamentCompletion('tournament-789');
    
    const question = getQuestion('q-1');
    expect(question.availableForPracticeDate).toBeDefined();
    
    const releaseDate = new Date(question.availableForPracticeDate);
    const now = new Date();
    const diffHours = (releaseDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    expect(diffHours).toBeCloseTo(24, 0);
  });
});
```

#### 3. Practice Mode Filtering Tests
```typescript
describe('Practice Mode Filtering', () => {
  it('should return only QUESTION_POOL questions when source is pool', () => {
    const questions = getQuestionsForPractice('tenant-123', {
      source: 'pool'
    });
    
    expect(questions.every(q => q.status === QuestionStatus.QUESTION_POOL)).toBe(true);
  });
  
  it('should return only available RECENT_TOURNAMENT questions when source is recent', () => {
    const questions = getQuestionsForPractice('tenant-123', {
      source: 'recent'
    });
    
    expect(questions.every(q => {
      if (q.status !== QuestionStatus.RECENT_TOURNAMENT) return false;
      if (!q.availableForPracticeDate) return true;
      return new Date(q.availableForPracticeDate) <= new Date();
    })).toBe(true);
  });
  
  it('should not return delayed questions before release date', () => {
    // Create delayed question
    const futureDate = new Date();
    futureDate.setHours(futureDate.getHours() + 24);
    
    const question = {
      id: 'q-delayed',
      status: QuestionStatus.RECENT_TOURNAMENT,
      availableForPracticeDate: futureDate.toISOString(),
      tenantId: 'tenant-123'
    };
    
    const questions = getQuestionsForPractice('tenant-123', {
      source: 'recent'
    });
    
    expect(questions.find(q => q.id === 'q-delayed')).toBeUndefined();
  });
});
```

#### 4. Tournament Validation Tests
```typescript
describe('Tournament Validation', () => {
  it('should validate minimum questions per category (10)', () => {
    const validation = validateTournamentQuestions('tournament-789');
    
    if (!validation.valid) {
      validation.errors.forEach(error => {
        expect(error).toMatch(/has only \d+ questions \(minimum: 10\)/);
      });
    }
  });
  
  it('should pass validation when all categories have 10+ questions', () => {
    // Setup tournament with sufficient questions
    const validation = validateTournamentQuestions('valid-tournament');
    
    expect(validation.valid).toBe(true);
    expect(validation.errors).toHaveLength(0);
    validation.categoryCounts.forEach(({ count, minimum }) => {
      expect(count).toBeGreaterThanOrEqual(minimum);
    });
  });
});
```

### Integration Tests

#### 1. Complete Workflow Test
```typescript
describe('Complete Question Lifecycle Workflow', () => {
  it('should handle AI generation → approval → tournament → practice flow', async () => {
    // 1. Generate AI questions
    const request = createAIGenerationRequest('tenant-123', 'user-456', {
      count: 10,
      category: 'New Testament',
      difficulty: 'medium',
      model: 'gpt-4'
    });
    
    expect(request).toHaveProperty('id');
    expect(request.status).toBe('pending');
    
    // 2. Simulate AI generation (mock)
    const questions = await mockAIGeneration(request);
    expect(questions).toHaveLength(10);
    expect(questions.every(q => q.status === QuestionStatus.AI_PENDING_REVIEW)).toBe(true);
    
    // 3. Approve questions
    questions.forEach(q => {
      updateQuestionStatus(q.id, QuestionStatus.QUESTION_POOL, {
        reason: 'Approved',
        userId: 'admin-456'
      });
    });
    
    // 4. Assign to tournament
    const tournamentQuestions = questions.slice(0, 5);
    tournamentQuestions.forEach(q => {
      updateQuestionStatus(q.id, QuestionStatus.TOURNAMENT_RESERVED, {
        reason: 'Assigned to tournament',
        tournamentId: 'tournament-789'
      });
    });
    
    // 5. Start tournament
    tournamentQuestions.forEach(q => {
      updateQuestionStatus(q.id, QuestionStatus.TOURNAMENT_ACTIVE, {
        reason: 'Tournament started',
        tournamentId: 'tournament-789'
      });
    });
    
    // 6. Complete tournament
    await handleTournamentCompletion('tournament-789');
    
    // 7. Verify questions in RECENT_TOURNAMENT
    const recentQuestions = getQuestionsForPractice('tenant-123', {
      source: 'recent'
    });
    
    expect(recentQuestions.filter(q => 
      tournamentQuestions.map(tq => tq.id).includes(q.id)
    )).toHaveLength(5);
    
    // 8. Complete another tournament
    await handleTournamentCompletion('tournament-new');
    
    // 9. Verify old tournament questions moved to pool
    const poolQuestions = getQuestionsForPractice('tenant-123', {
      source: 'pool'
    });
    
    expect(poolQuestions.filter(q => 
      tournamentQuestions.map(tq => tq.id).includes(q.id)
    )).toHaveLength(5);
  });
});
```

### Performance Tests

```typescript
describe('Performance Tests', () => {
  it('should handle 1000+ questions efficiently', () => {
    const start = performance.now();
    
    const questions = getQuestionsForPractice('tenant-123', {
      source: 'both',
      category: 'New Testament'
    });
    
    const end = performance.now();
    const duration = end - start;
    
    // Should complete in < 100ms
    expect(duration).toBeLessThan(100);
  });
  
  it('should auto-rotate questions efficiently', async () => {
    const start = performance.now();
    
    await handleTournamentCompletion('tournament-789');
    
    const end = performance.now();
    const duration = end - start;
    
    // Should complete in < 200ms
    expect(duration).toBeLessThan(200);
  });
});
```

---

## Conclusion

Phase 14 provides a complete AI-powered question management system with sophisticated lifecycle management, approval workflows, and automated tournament rotation. The data model and business logic layer is complete, with frontend components planned for Phase 14.2.

### Key Achievements
- ✅ 7-state question lifecycle
- ✅ Plan-based AI generation limits
- ✅ 4-state approval workflow
- ✅ 3-mode tournament auto-rotation
- ✅ Duplicate detection system
- ✅ Complete audit trail
- ✅ ~770 lines of production code

### Next Steps
1. Implement frontend components (Phase 14.2)
2. Integrate external AI API
3. Add notification system
4. Complete testing suite
5. User acceptance testing

---

**Document Version**: 1.0  
**Last Updated**: November 30, 2024  
**Author**: GitHub Copilot  
**Status**: Phase 14.1 Complete, Phase 14.2 In Progress
