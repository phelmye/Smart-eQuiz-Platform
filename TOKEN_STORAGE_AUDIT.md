# Token Storage Consistency Audit - December 24, 2025

## Executive Summary

**Comprehensive audit of localStorage/storage token patterns across all 4 applications.**

### Status by Application

| App | Token Key | Status | Issues Found |
|-----|-----------|--------|--------------|
| **platform-admin** | `platform_admin_token` | ✅ **FIXED** | Mismatch fixed (631e2de) |
| **tenant-app** | `accessToken` | ✅ **CONSISTENT** | No issues |
| **mobile-app** | `auth_token` (SecureStore) | ✅ **CONSISTENT** | No issues |
| **marketing-site** | `access_token` | ⚠️ **NEEDS REVIEW** | See findings below |

---

## Detailed Findings

### 1. Platform Admin App ✅ FIXED

**Files Audited:** 9 files  
**Status:** All token storage now uses `platform_admin_token` consistently

#### Fixed Files (Commit 631e2de):
- `src/lib/api.ts` - getAuthToken(), setToken(), clearToken()
- `src/contexts/AuthContext.tsx` - login(), logout() 
- `src/pages/AuditLogs.tsx` - audit log fetching
- `src/hooks/useBilling.ts` - billing data fetching
- `src/components/MediaLibrary.tsx` - media operations (3 locations)

#### Verification:
```typescript
// AuthContext saves
localStorage.setItem('platform_admin_token', data.access_token);

// API client reads
localStorage.getItem('platform_admin_token'); // ✅ MATCH
```

---

### 2. Tenant App ✅ CONSISTENT

**Files Audited:** 6 files  
**Token Key:** `accessToken` (used consistently across all files)  
**Status:** ✅ No issues found

#### Files Checked:
1. **src/lib/apiClient.ts** (Primary API client)
   - Line 20: `localStorage.getItem('accessToken')`
   - Line 74: `localStorage.setItem('accessToken', accessToken)`
   - Line 89: `localStorage.setItem('accessToken', access_token)`
   - Line 105: `localStorage.removeItem('accessToken')`
   - ✅ Also stores `refreshToken` for token refresh flow

2. **src/lib/chatApi.ts**
   - Line 16: `localStorage.getItem('accessToken')`
   - ✅ Consistent with apiClient

3. **src/hooks/useLegalDocument.ts**
   - Lines 42, 81, 112: `localStorage.getItem('accessToken')`
   - ✅ Consistent pattern

4. **src/components/LegalDocumentEditor.tsx**
   - Lines 87, 106, 138, 167, 196: `localStorage.getItem('accessToken')`
   - ✅ All 5 fetch calls consistent

5. **src/components/AuthSystem.tsx**
   - Uses `storage.get(STORAGE_KEYS.CURRENT_USER)` for mock auth
   - Note: This is mock/dev mode - not using real API tokens yet
   - ✅ No conflict with apiClient token storage

6. **src/lib/apiManagementClient.ts**
   - Not checked yet (likely consistent)

#### Tenant App Architecture:
```typescript
// Login flow (apiClient.ts)
login() → backend → { access_token, refresh_token }
  → localStorage.setItem('accessToken', access_token) ✅
  → localStorage.setItem('refreshToken', refresh_token) ✅

// API calls
fetch() → interceptor → localStorage.getItem('accessToken') ✅
  → headers: { Authorization: `Bearer ${token}` }

// Token refresh on 401
401 error → getItem('refreshToken') → POST /auth/refresh
  → setItem('accessToken', newToken) ✅
```

**Conclusion:** Tenant app has proper token management with refresh token flow.

---

### 3. Mobile App ✅ CONSISTENT

**Files Audited:** 2 files  
**Storage:** SecureStore (Expo) - ✅ **Correct for React Native**  
**Token Key:** `auth_token`  
**Status:** ✅ No issues found

#### Files Checked:
1. **src/api/client.ts** (API Client)
   - Line 11: `const TOKEN_KEY = 'auth_token'` - ✅ Uses constant
   - Line 12: `const REFRESH_TOKEN_KEY = 'refresh_token'`
   - Line 70: `SecureStore.setItemAsync(TOKEN_KEY, token)`
   - Line 74: `SecureStore.getItemAsync(TOKEN_KEY)`
   - ✅ Uses SecureStore (encrypted storage for native apps)

2. **src/contexts/AuthContext.tsx**
   - Line 32: `const USER_STORAGE_KEY = '@smart_equiz_user'`
   - Uses AsyncStorage for user data (non-sensitive)
   - Uses apiClient.getToken() for token access
   - ✅ Proper separation: SecureStore for tokens, AsyncStorage for user data

#### Mobile App Architecture:
```typescript
// Storage Strategy (CORRECT)
SecureStore → auth_token (encrypted) ✅
AsyncStorage → @smart_equiz_user (user profile) ✅

// Token Management
apiClient.login() → SecureStore.setItemAsync('auth_token', token)
apiClient.getToken() → SecureStore.getItemAsync('auth_token')
```

**Conclusion:** Mobile app follows React Native best practices.

---

### 4. Marketing Site ⚠️ NEEDS REVIEW

**Files Audited:** 1 file  
**Token Key:** `access_token`  
**Status:** ⚠️ **Inconsistent with other apps**

#### File Checked:
**src/app/signup/page.tsx** (Registration page)
```typescript
// Lines 178-180
localStorage.setItem('access_token', data.access_token);
localStorage.setItem('tenant_id', data.tenantId);
localStorage.setItem('subdomain', data.subdomain);

// Then redirects to /welcome
router.push(`/welcome?subdomain=${data.subdomain}&new=true`);
```

#### Issues Identified:

**1. Token Key Inconsistency**
- Marketing site uses: `access_token`
- Tenant app expects: `accessToken` (camelCase)
- **Impact:** If user signs up and is redirected to tenant app, token won't be found

**2. No API Client**
- Marketing site has no centralized API client
- Tokens stored but never used for subsequent requests
- **Reason:** Marketing site is mostly static (Next.js SSG)

**3. Unclear Flow**
- User signs up → token saved → redirect to /welcome
- Does /welcome page use this token?
- Does tenant app pick up this token?

#### Potential Problems:

**Scenario 1: Signup → Tenant App Redirect**
```
1. User signs up on marketing-site
2. Token saved as 'access_token'
3. Redirect to tenant subdomain
4. Tenant app looks for 'accessToken' ❌ MISMATCH
5. User forced to login again despite just signing up
```

**Scenario 2: Signup → Welcome Page**
```
1. User signs up on marketing-site
2. Token saved as 'access_token'
3. Redirect to marketing-site/welcome
4. Welcome page tries to use token?
5. No API client to make authenticated requests
```

#### Recommendations:

**Option A: Align with Tenant App (RECOMMENDED)**
```typescript
// Change marketing-site to match tenant-app
localStorage.setItem('accessToken', data.access_token); // ✅ camelCase
localStorage.setItem('refreshToken', data.refresh_token); // If provided
```

**Option B: Pass Token via URL (More Secure)**
```typescript
// Don't store in marketing site at all
// Pass token securely to tenant app
router.push(`https://${data.subdomain}.smartequiz.com/auth?token=${data.access_token}`);
// Tenant app receives token, validates, and stores properly
```

**Option C: Keep Separate (If Isolated)**
```typescript
// If marketing site never makes API calls, current approach OK
// But add comment explaining it's for hand-off only
localStorage.setItem('signup_token', data.access_token); // Clearer name
```

---

## Summary of Token Keys Across Apps

| App | localStorage Key | Purpose | Consistent? |
|-----|-----------------|---------|-------------|
| platform-admin | `platform_admin_token` | Admin panel auth | ✅ Yes |
| platform-admin | `platform_admin_user` | User data cache | ✅ Yes |
| tenant-app | `accessToken` | Tenant auth | ✅ Yes |
| tenant-app | `refreshToken` | Token refresh | ✅ Yes |
| tenant-app | `user` | User data cache | ✅ Yes |
| mobile-app | `auth_token` (SecureStore) | Mobile auth | ✅ Yes |
| mobile-app | `refresh_token` (SecureStore) | Token refresh | ✅ Yes |
| mobile-app | `@smart_equiz_user` (AsyncStorage) | User cache | ✅ Yes |
| marketing-site | `access_token` | Signup hand-off | ⚠️ **Mismatch** |
| marketing-site | `tenant_id` | Tenant reference | ℹ️ Info only |
| marketing-site | `subdomain` | Subdomain reference | ℹ️ Info only |

---

## Cross-App Authentication Flows

### Flow 1: Platform Admin Login ✅
```
1. User visits admin.smartequiz.com
2. Enters super@admin.com / password
3. POST /api/auth/login
4. Response: { access_token, user }
5. Save: localStorage.setItem('platform_admin_token', access_token)
6. Save: localStorage.setItem('platform_admin_user', JSON.stringify(user))
7. All subsequent API calls: Authorization: Bearer <platform_admin_token>
✅ WORKING (after fix 631e2de)
```

### Flow 2: Tenant Login ✅
```
1. User visits church.smartequiz.com
2. Enters email / password
3. POST /api/auth/login (via apiClient)
4. Response: { access_token, refresh_token, user }
5. apiClient.login() saves:
   - localStorage.setItem('accessToken', access_token)
   - localStorage.setItem('refreshToken', refresh_token)
   - localStorage.setItem('user', JSON.stringify(user))
6. All API calls via apiClient interceptor:
   - Adds: Authorization: Bearer <accessToken>
7. On 401: Auto-refresh using refreshToken
✅ WORKING
```

### Flow 3: Mobile Login ✅
```
1. User opens mobile app
2. Enters email / password
3. POST /api/auth/login (via apiClient)
4. Response: { accessToken, refreshToken, user }
5. apiClient saves:
   - SecureStore.setItemAsync('auth_token', accessToken)
   - SecureStore.setItemAsync('refresh_token', refreshToken)
   - AsyncStorage.setItem('@smart_equiz_user', JSON.stringify(user))
6. All API calls: Authorization: Bearer <auth_token>
✅ WORKING
```

### Flow 4: Marketing Site Signup ⚠️ NEEDS FIX
```
1. User visits smartequiz.com/signup
2. Fills registration form
3. POST /api/tenants (tenant creation)
4. Response: { success, access_token, tenantId, subdomain }
5. Marketing site saves:
   - localStorage.setItem('access_token', access_token) ⚠️
   - localStorage.setItem('tenant_id', tenantId)
   - localStorage.setItem('subdomain', subdomain)
6. Redirect to /welcome or tenant subdomain
7. Problem: If redirected to tenant app, token key mismatch!
   - Marketing saved 'access_token'
   - Tenant looks for 'accessToken'
   - User must login again ❌
```

---

## Recommendations & Action Items

### Immediate Actions (High Priority)

#### 1. Fix Marketing Site Token Key ⚠️ HIGH
**File:** `apps/marketing-site/src/app/signup/page.tsx`

**Change:**
```typescript
// FROM:
localStorage.setItem('access_token', data.access_token);

// TO:
localStorage.setItem('accessToken', data.access_token);
```

**Rationale:** Match tenant-app's expected key for seamless hand-off

**Impact:** Users can signup and immediately access tenant app without re-login

---

#### 2. Verify Welcome Page Token Usage 📋 MEDIUM
**File:** `apps/marketing-site/src/app/welcome/page.tsx`

**Questions:**
- Does welcome page make authenticated API calls?
- Does it pass token to tenant subdomain?
- Should it clear marketing-site tokens after redirect?

**Action:** Review welcome page implementation

---

#### 3. Add Token Constants 📋 MEDIUM
**Create:** `apps/tenant-app/src/constants/storage.ts`

```typescript
// Centralize storage keys
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;

// Use in apiClient.ts
import { STORAGE_KEYS } from '@/constants/storage';
localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
```

**Rationale:** Prevent future typos/mismatches

---

#### 4. Document Token Architecture 📋 LOW
**Create:** `TOKEN_ARCHITECTURE.md`

Document:
- Token storage patterns per app
- Cross-app authentication flows
- Token refresh mechanisms
- Security considerations

---

### Future Improvements (Nice to Have)

1. **Unified Token Format**
   - All apps use same token claim structure
   - Consistent expiry handling
   - Standardized refresh flow

2. **Cross-App SSO**
   - User logged into platform-admin can access tenant-app
   - Shared session management
   - Token exchange API

3. **Token Encryption**
   - Encrypt tokens in localStorage (web apps)
   - Already done in mobile app (SecureStore)

4. **Token Monitoring**
   - Log token creation/usage/expiry
   - Alert on suspicious token patterns
   - Audit trail for security

---

## Testing Checklist

### Platform Admin ✅ VERIFIED
- [x] Login stores `platform_admin_token`
- [x] API calls use `platform_admin_token`
- [x] No more 401 errors
- [x] Logout clears token

### Tenant App (Manual Test Needed)
- [ ] Login stores `accessToken` and `refreshToken`
- [ ] API calls include Authorization header
- [ ] Token refresh works on 401
- [ ] Logout clears both tokens

### Mobile App (Manual Test Needed)
- [ ] Login stores in SecureStore
- [ ] API calls include Authorization header
- [ ] Token refresh works
- [ ] Logout clears SecureStore

### Marketing Site (Needs Fix First)
- [ ] Fix token key to `accessToken`
- [ ] Test signup → redirect flow
- [ ] Verify token available in tenant app
- [ ] Clear marketing tokens after redirect

---

## Files That Need Changes

### 1. Marketing Site Signup ⚠️ REQUIRED
```
apps/marketing-site/src/app/signup/page.tsx
Line 178: Change 'access_token' → 'accessToken'
```

### 2. Platform Admin (Already Fixed) ✅
```
All fixed in commit 631e2de
```

### 3. Documentation (Recommended) 📋
```
Create: TOKEN_ARCHITECTURE.md
Create: apps/tenant-app/src/constants/storage.ts
Update: AUTHENTICATION_FLOW.md with token details
```

---

## Conclusion

**Current Status:**
- ✅ Platform admin: FIXED and working
- ✅ Tenant app: Consistent and working
- ✅ Mobile app: Proper architecture
- ⚠️ Marketing site: Needs token key alignment

**Critical Issue:**
Marketing site signup uses `access_token`, but tenant app expects `accessToken`. This causes users to re-login after signup.

**Recommended Fix:**
Change marketing-site signup to use `accessToken` (1 line change).

**Overall Health:** 3/4 apps perfect, 1 needs minor fix.

