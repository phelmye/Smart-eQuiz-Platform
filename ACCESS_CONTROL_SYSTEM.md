# 🔐 Multi-Layer Access Control System

## Overview

The Smart eQuiz Platform implements a comprehensive 3-layer access control system designed for a SAAS multi-tenant architecture with role-based permissions and plan-based feature gates.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ACCESS REQUEST                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ LAYER 1: TENANT LEVEL (Plan-Based Feature Gates)            │
│ ─────────────────────────────────────────────────────────    │
│ ✓ Subscription Plan Check                                    │
│ ✓ Feature Availability (AI, Analytics, Branding, etc.)      │
│ ✓ Usage Limits (Users, Tournaments, Questions)              │
│                                                              │
│ Function: hasFeatureAccess(user, feature)                   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ LAYER 2: ROLE LEVEL (RBAC - Role-Based Access Control)      │
│ ─────────────────────────────────────────────────────────    │
│ ✓ Role Assignment Check                                      │
│ ✓ Permission Validation                                      │
│ ✓ Page Access Control                                        │
│                                                              │
│ Functions: hasPermission(user, permission)                  │
│            canAccessPage(user, page)                        │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ LAYER 3: RESOURCE LEVEL (Ownership & Scope)                 │
│ ─────────────────────────────────────────────────────────    │
│ ✓ Resource Ownership Check                                   │
│ ✓ Tenant Scope Validation                                    │
│ ✓ CRUD Operation Authorization                               │
│                                                              │
│ Functions: canEditResource(user, type, ownerId)            │
│            canDeleteResource(user, type, ownerId)           │
│            canViewResource(user, type, isPublic)            │
└─────────────────────────────────────────────────────────────┘
                              ↓
                     [GRANT/DENY ACCESS]
```

---

## 👥 User Roles & Hierarchy

### System Roles (Cross-Tenant)

#### 1. **SUPER_ADMIN** 🔑
- **Scope:** Entire platform across all tenants
- **Permissions:** Wildcard (*) - Full access
- **Use Cases:**
  - Platform administration
  - Tenant management
  - System configuration
  - Global oversight

```typescript
permissions: ['*']
canAccessPages: ['*']
```

---

### Tenant Roles (Within Single Tenant)

#### 2. **ORG_ADMIN** 👔
- **Scope:** All operations within their tenant
- **Limitations:** Bound by subscription plan features
- **Permissions:**
  ```typescript
  - users.create, users.read, users.update, users.delete
  - tournaments.create, tournaments.read, tournaments.update, tournaments.delete
  - questions.create, questions.read, questions.update, questions.delete
  - payments.read, billing.read
  - analytics.view
  - branding.manage (if plan allows)
  ```
- **Use Cases:**
  - Church/organization administrator
  - Manage members and content
  - Monitor activities
  - Handle payments
  - Configure branding (Premium plans)

#### 3. **QUESTION_MANAGER** 📚
- **Scope:** Question and content management
- **Permissions:**
  ```typescript
  - questions.create, questions.read, questions.update, questions.delete
  - tournaments.read
  ```
- **Use Cases:**
  - Create quiz questions
  - Categorize content
  - Review questions
  - Assist in tournament setup

#### 4. **ACCOUNT_OFFICER** 💰
- **Scope:** Financial operations
- **Permissions:**
  ```typescript
  - payments.create, payments.read, payments.update, payments.delete
  - billing.read
  - analytics.view.financial
  - rewards.manage
  - settlements.manage
  ```
- **Use Cases:**
  - Process payments
  - Manage rewards
  - Handle settlements
  - View financial analytics

#### 5. **INSPECTOR** 🔍
- **Scope:** Monitoring and oversight
- **Permissions:**
  ```typescript
  - tournaments.inspect
  - questions.review
  - participants.monitor
  ```
- **Use Cases:**
  - Monitor quiz sessions
  - Ensure fair play
  - Review answers
  - Generate reports

#### 6. **PARTICIPANT** 🎯
- **Scope:** Quiz participation
- **Permissions:**
  ```typescript
  - tournaments.participate
  - questions.answer
  - profile.manage
  ```
- **Use Cases:**
  - Join tournaments
  - Answer questions
  - View personal stats
  - Manage profile

#### 7. **PRACTICE_USER** 📖
- **Scope:** Practice and training
- **Permissions:**
  ```typescript
  - practice.access
  - questions.practice
  - profile.manage
  ```
- **Use Cases:**
  - Access practice quizzes
  - Train without competition
  - Improve skills

#### 8. **SPECTATOR** 👀
- **Scope:** View-only access
- **Permissions:**
  ```typescript
  - tournaments.view
  - matches.view
  - leaderboard.view
  - profile.view
  ```
- **Use Cases:**
  - Watch live tournaments
  - View results
  - Follow leaderboards
  - No participation

#### 9. **PUBLIC** 🌐
- **Scope:** Public information only
- **Permissions:**
  ```typescript
  - tournaments.view.public
  - leaderboard.view.public
  ```
- **Use Cases:**
  - View public tournaments
  - See public leaderboards
  - Marketing pages

---

## 📋 Subscription Plans & Features

### Free Plan
- **Max Users:** 50
- **Max Tournaments:** 5
- **Max Questions/Tournament:** 50
- **Features:**
  - Basic analytics
  - Standard templates

### Starter Plan ($29/month)
- **Max Users:** 200
- **Max Tournaments:** 20
- **Max Questions/Tournament:** 100
- **Features:**
  - Basic analytics
  - Email support
  - Custom branding

### Pro Plan ($79/month)
- **Max Users:** 1,000
- **Max Tournaments:** 100
- **Max Questions/Tournament:** 500
- **Features:**
  - Advanced analytics
  - AI question generator
  - Priority support
  - Full custom branding
  - Payment integration

### Enterprise Plan ($299/month)
- **Max Users:** Unlimited
- **Max Tournaments:** Unlimited
- **Max Questions/Tournament:** Unlimited
- **Features:**
  - All Pro features
  - Dedicated support
  - API access
  - White-labeling
  - Custom integrations

---

## 🔧 Implementation Guide

### 1. Check Feature Access (Layer 1)

```typescript
import { hasFeatureAccess } from '@/lib/mockData';

// Check if user's plan allows AI generator
if (hasFeatureAccess(user, 'ai-generator')) {
  // Show AI generator button
} else {
  // Show upgrade prompt
}

// Available features:
// - 'branding'
// - 'analytics'
// - 'ai-generator'
// - 'payment-integration'
// - 'unlimited-users'
// - 'unlimited-tournaments'
```

### 2. Check Permission (Layer 2)

```typescript
import { hasPermission } from '@/lib/mockData';

// Check if user can create questions
if (hasPermission(user, 'questions.create')) {
  // Allow question creation
}

// Check if user can manage payments
if (hasPermission(user, 'payments.create')) {
  // Show payment management UI
}
```

### 3. Check Page Access (Layer 2)

```typescript
import { canAccessPage } from '@/lib/mockData';

// Check if user can access branding page
if (canAccessPage(user, 'branding')) {
  // Show branding page
} else {
  // Show access denied or upgrade prompt
}
```

### 4. Check Resource Access (Layer 3)

```typescript
import { canEditResource, canDeleteResource, canViewResource } from '@/lib/mockData';

// Check if user can edit a tournament
const tournament = getTournament(tournamentId);
if (canEditResource(user, 'tournament', tournament.createdBy)) {
  // Show edit button
}

// Check if user can delete a question
if (canDeleteResource(user, 'question')) {
  // Show delete button
}

// Check if user can view payment details
if (canViewResource(user, 'payment', false)) {
  // Show payment details
}
```

---

## 🎯 Usage Examples

### Example 1: Sidebar Menu Visibility

```typescript
// AdminSidebar.tsx
const isItemVisible = (item: any) => {
  // Check role
  if (!item.requiredRoles.includes(userRole.toLowerCase())) {
    return false;
  }
  
  // Check permission
  if (item.requiredPermission && !hasPermission(user, item.requiredPermission)) {
    return false;
  }
  
  // Check plan feature
  if (item.planFeature && !hasFeatureAccess(user, item.planFeature)) {
    return false;
  }
  
  return true;
};
```

### Example 2: Question Creation with Plan Limits

```typescript
// QuestionBank.tsx
const handleCreateQuestion = async () => {
  // Check permission
  if (!hasPermission(user, 'questions.create')) {
    showError('You do not have permission to create questions');
    return;
  }
  
  // Check plan limits
  const currentQuestions = getQuestionCount(user.tenantId);
  const plan = getTenantPlan(user.tenantId);
  
  if (currentQuestions >= plan.maxQuestionsPerTournament) {
    showError(`You've reached your plan limit of ${plan.maxQuestionsPerTournament} questions`);
    showUpgradePrompt();
    return;
  }
  
  // Proceed with creation
  await createQuestion(questionData);
};
```

### Example 3: Tournament Editing with Ownership

```typescript
// TournamentEngine.tsx
const TournamentCard = ({ tournament }) => {
  const canEdit = canEditResource(user, 'tournament', tournament.createdBy);
  const canDelete = canDeleteResource(user, 'tournament', tournament.createdBy);
  
  return (
    <Card>
      <CardHeader>{tournament.name}</CardHeader>
      <CardContent>
        {canEdit && <Button onClick={handleEdit}>Edit</Button>}
        {canDelete && <Button onClick={handleDelete}>Delete</Button>}
      </CardContent>
    </Card>
  );
};
```

### Example 4: Feature Upgrade Prompts

```typescript
// AIQuestionGenerator.tsx
const AIGeneratorPage = () => {
  if (!hasFeatureAccess(user, 'ai-generator')) {
    return (
      <UpgradePrompt
        feature="AI Question Generator"
        requiredPlan="Pro"
        benefits={[
          'Generate questions automatically',
          'Save time and effort',
          'High-quality content'
        ]}
      />
    );
  }
  
  return <AIGeneratorComponent />;
};
```

---

## 🔄 Permission Flow Diagram

```
User attempts action (e.g., "Create Tournament")
          ↓
Check if user is logged in ←─── NO ──→ Redirect to login
          ↓ YES
Check user role in required roles ←─── NO ──→ Show "Access Denied"
          ↓ YES
Check if action requires permission ←─── NO ──→ Check plan features
          ↓ YES                                        ↓
Check hasPermission(user, permission) ←─── NO ──→ Show "Insufficient Permissions"
          ↓ YES
Check if action requires plan feature ←─── NO ──→ Check resource access
          ↓ YES                                        ↓
Check hasFeatureAccess(user, feature) ←─── NO ──→ Show "Upgrade Required"
          ↓ YES
Check resource ownership (if applicable) ←─── NO ──→ Show "Not Authorized"
          ↓ YES
[GRANT ACCESS TO ACTION]
```

---

## 🚀 Best Practices

### 1. Always Check All Layers
```typescript
// ✅ GOOD
if (hasPermission(user, 'tournaments.create') && 
    hasFeatureAccess(user, 'unlimited-tournaments')) {
  // Create tournament
}

// ❌ BAD
if (user.role === 'org_admin') {
  // Bypasses plan limits!
}
```

### 2. Provide Clear Feedback
```typescript
// ✅ GOOD
if (!hasFeatureAccess(user, 'ai-generator')) {
  return (
    <Alert>
      <AlertTitle>AI Generator requires Pro plan</AlertTitle>
      <AlertDescription>
        Upgrade to Pro to unlock AI-powered question generation.
        <Button onClick={showUpgradeModal}>Upgrade Now</Button>
      </AlertDescription>
    </Alert>
  );
}
```

### 3. Check Permissions Early
```typescript
// ✅ GOOD - Check before loading heavy components
if (!canAccessPage(user, 'analytics')) {
  return <AccessDenied />;
}

return <AnalyticsDashboard />; // Heavy component

// ❌ BAD - Load component then check
return (
  <AnalyticsDashboard>
    {!canAccessPage(user, 'analytics') && <AccessDenied />}
  </AnalyticsDashboard>
);
```

### 4. Handle Plan Limits Gracefully
```typescript
// ✅ GOOD
const currentUsers = getUserCount(tenantId);
const maxUsers = plan.maxUsers;
const canAddMore = maxUsers === -1 || currentUsers < maxUsers;

if (!canAddMore) {
  showUpgradePrompt({
    current: currentUsers,
    limit: maxUsers,
    nextPlan: getNextPlanTier(plan)
  });
}
```

---

## 📝 Adding New Roles

To add a new role to the system:

1. **Define the role in `mockData.ts`:**

```typescript
{
  roleId: 'new_role',
  roleName: 'New Role Name',
  description: 'Description of the role',
  permissions: [
    'resource.action',
    'another.action'
  ],
  canAccessPages: ['page1', 'page2'],
  isSystemRole: false
}
```

2. **Update permission checking functions** if needed

3. **Add role to sidebar menu items:**

```typescript
{
  id: 'new-feature',
  label: 'New Feature',
  icon: Icon,
  requiredRoles: ['super_admin', 'org_admin', 'new_role'],
  requiredPermission: 'feature.access',
  planFeature: 'feature-name' // if plan-dependent
}
```

---

## 📝 Adding New Plan Features

To add a new plan-gated feature:

1. **Update plan definitions:**

```typescript
features: [
  'Existing feature',
  'New amazing feature' // Add here
]
```

2. **Update `hasFeatureAccess` function:**

```typescript
case 'new-feature':
  return plan.features.some(f => f.includes('New amazing feature'));
```

3. **Update permission checking:**

```typescript
const featureMap: Record<string, string> = {
  'feature.action': 'new-feature',
  // ...
};
```

---

## 🎓 Summary

The Smart eQuiz Platform's access control system provides:

✅ **Multi-tenancy isolation** - Each tenant operates independently  
✅ **Plan-based feature gates** - Monetization through tiered plans  
✅ **Role-based permissions** - Fine-grained access control  
✅ **Resource-level security** - Ownership and scope validation  
✅ **Scalable architecture** - Easy to add new roles and features  
✅ **Clear upgrade paths** - Encourage plan upgrades  

This system ensures secure, scalable, and monetizable SAAS operations while providing excellent user experience with clear permission boundaries and upgrade prompts.
