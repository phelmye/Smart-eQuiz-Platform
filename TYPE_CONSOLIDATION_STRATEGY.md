# Type Consolidation Strategy

## Current State Analysis

### Shared Types Package (`packages/types/src/index.ts`)
- **Size:** 534 lines
- **Interfaces:** ~30 types
- **Usage:** Only 1 import found (`TenantContext.tsx`)
- **Status:** ⚠️ **SEVERELY UNDERUTILIZED**

### Tenant App MockData (`apps/tenant-app/src/lib/mockData.ts`)
- **Size:** 8,450 lines
- **Interfaces:** 66+ types
- **Duplicates:** Many overlap with shared package
- **Status:** ⚠️ **PRIMARY SOURCE OF TRUTH**

### Legacy Monolith (`workspace/shadcn-ui/src/lib/mockData.ts`)
- **Size:** 8,550 lines (100 MORE than tenant-app)
- **Interfaces:** Similar to tenant-app + referral system types
- **Status:** 🚨 **DEPRECATED - TO BE DELETED**

---

## Consolidation Strategy (Phased Approach)

### Phase 1: Merge Existing Duplicates (1-2 hours) ⭐ HIGH PRIORITY

**Goal:** Reconcile differences between `packages/types` and `tenant-app/mockData`

**Conflicting Types to Merge:**
1. ✅ **Tenant** - Exists in both, but tenant-app has extended version
2. ✅ **User** - Exists in both, tenant-app has extended profile fields
3. ✅ **UserRole** - Exists in both, tenant-app missing 'practice_user' and 'moderator'
4. ✅ **Plan** - Exists in both, identical
5. ✅ **TenantBilling** - Exists in both, shared has more fields
6. ✅ **Tournament** - Exists in both, tenant-app has extended version
7. ✅ **Question** - Exists in both, tenant-app has extended version
8. ✅ **AuditLog** - Exists in both, tenant-app missing fields

**Action Items:**
- [ ] Update shared types to include ALL fields from tenant-app versions
- [ ] Mark shared types as **source of truth**
- [ ] Add JSDoc comments documenting which app uses which fields
- [ ] Create type extension pattern for app-specific additions

### Phase 2: Extract Unique Tenant-Specific Types (2-3 hours)

**Move to Shared Package:**
1. **Parish System** (5 interfaces)
   - `Parish`, `ParishContactPerson`, `ParishAuthority`, `ParishLocation`, `ParishTournamentStats`

2. **User Profile System** (4 interfaces)
   - `UserProfile`, `NextOfKin`, `BankAccount`, `SocialAccounts`

3. **Tournament Extensions** (20+ interfaces)
   - `TournamentApplication`, `PreTournamentQuizConfig`, `PreTournamentQuestion`
   - `QuestionVariation`, `QuizAttempt`, `KnockoutTournamentConfig`
   - `KnockoutMatch`, `TournamentBracket`, `ParticipantBracketJourney`
   - `LiveTournamentView`, `TournamentQuestionConfig`

4. **Prize & Rewards System** (8 interfaces)
   - `PhysicalPrize`, `DigitalReward`, `PrizeSponsor`, `PositionPrize`
   - `CategoryPrize`, `ParticipationReward`, `TournamentPrize`, `PrizeAward`

5. **Payment System** (5 interfaces)
   - `PaymentGatewayConfig`, `TournamentFeeConfig`, `TournamentPayment`
   - `TournamentDonationConfig`, `TournamentDonation`

6. **Question Management** (15+ interfaces)
   - `QuestionCategoryType`, `CustomQuestionCategory`, `RoundCategoryDistribution`
   - `RoundQuestionConfig`, `RoundConfigTemplate`, `AIGenerationConfig`
   - `AIGenerationRequest`, `QuestionLifecycleLog`, `QuestionDuplicateCheck`
   - `UserPracticeAnalytics`, `QuestionPerformance`, `BonusQuestionConfig`
   - `BonusQuestionRequest`, `BonusQuestionTemplate`, `QuestionPoolValidation`

7. **Role & Permissions** (4 interfaces)
   - `RolePermission`, `TenantRole`, `TenantRoleCustomization`, `RoleWithFeatures`
   - `ComponentFeature`, `ComponentFeatureSet`

8. **Miscellaneous** (3 interfaces)
   - `PaymentIntegration`, `PracticePoints`, `Notification` (extended)

### Phase 3: Update All Imports (1-2 hours)

**Files to Update:** 150+ components

**Pattern:**
```typescript
// ❌ OLD
import { User, Tournament } from '@/lib/mockData';

// ✅ NEW
import { User, Tournament } from '@smart-equiz/types';
import { getMockUsers, getMockTournaments } from '@/lib/mockData';
```

**Strategy:**
1. Use find/replace for common patterns
2. Update imports file-by-file in logical groups:
   - All User-related components
   - All Tournament components
   - All Question Bank components
   - All Settings components

### Phase 4: Clean Up MockData Files (30 minutes)

**Remove from `mockData.ts`:**
- All `export interface` declarations (moved to shared package)
- All `export type` declarations (moved to shared package)

**Keep in `mockData.ts`:**
- `STORAGE_KEYS` constant
- `COMPONENT_FEATURES` data
- All mock data functions (`getMockUsers`, `getMockTournaments`, etc.)
- Storage utility functions

### Phase 5: Verify & Test (30 minutes)

**Checklist:**
- [ ] All apps build successfully (`pnpm build`)
- [ ] No TypeScript errors
- [ ] Dev servers start without errors
- [ ] Run smoke tests in browser console
- [ ] Verify type imports resolve correctly in IDE

---

## File Organization Plan

### Shared Types Structure (After Consolidation)

```typescript
// packages/types/src/index.ts

// CORE TYPES (Used by all apps)
export interface Tenant { ... }
export interface User { ... }
export type UserRole = ...

// TENANT-SPECIFIC TYPES (Only used by tenant-app)
// Parish System
export interface Parish { ... }
export interface ParishContactPerson { ... }

// Tournament System
export interface Tournament { ... }
export interface TournamentApplication { ... }

// Question System
export interface Question { ... }
export interface QuestionCategory { ... }

// Payment System
export interface PaymentGatewayConfig { ... }

// Prize System
export interface TournamentPrize { ... }

// Role & Permissions
export interface TenantRoleCustomization { ... }

// etc...
```

### Benefits After Consolidation

1. **Single Source of Truth** ✅
   - All type definitions in one place
   - No more duplicate interfaces
   - Easier to maintain and update

2. **Better Type Safety** ✅
   - TypeScript can catch more errors
   - IDE autocomplete works perfectly
   - Refactoring is safer

3. **Smaller Bundle Size** ✅
   - Apps only import types they need
   - No duplicate type definitions in bundles

4. **Better Developer Experience** ✅
   - Clear separation: types vs data
   - Easier to find type definitions
   - Better code organization

---

## Immediate Next Steps

### Option A: Quick Win (30 minutes) - Recommended for Demo
**Focus:** Fix the most critical duplicates only
- Merge User, Tenant, Tournament types
- Update 5-10 most-used components
- Verify builds work

### Option B: Comprehensive (4-8 hours) - Recommended for Production
**Focus:** Complete type consolidation
- All 66+ interfaces moved to shared package
- All 150+ components updated
- Full testing and verification

### Option C: Incremental (1 hour per session over multiple days)
**Focus:** One category at a time
- Day 1: User & Auth types
- Day 2: Tournament types
- Day 3: Question types
- Day 4: Payment & Prize types
- Day 5: Cleanup & testing

---

## Risk Mitigation

### Potential Issues:
1. **Import path changes** → Use find/replace carefully
2. **Circular dependencies** → Use separate files for each domain
3. **Build failures** → Test after each major change
4. **Type conflicts** → Use type merging or Pick/Omit utilities

### Rollback Plan:
If consolidation causes issues:
1. Revert shared types package to current version
2. Keep using mockData types temporarily
3. Fix issues one at a time
4. Retry consolidation in smaller batches

---

## Recommendation

**For Current Session:** Start with **Option A (Quick Win)**

**Why:**
- Demonstrates immediate value
- Low risk
- Can be completed in current session
- Provides foundation for future work

**What to do:**
1. Extend shared types with tenant-app fields (30 min)
2. Update 5-10 critical components (30 min)
3. Test and verify (15 min)
4. Document progress (15 min)

**Total Time:** 90 minutes

Then schedule Option B for a dedicated 4-8 hour session when you're ready for complete consolidation.

---

*Strategy created: November 22, 2025*
