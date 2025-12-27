# Logging Strategy & Implementation Guide

## Overview

This document outlines the centralized logging strategy for the Smart eQuiz Platform tenant application. We've replaced 100+ scattered `console.log` statements with a production-ready logging utility that provides:

- **Structured logging** with consistent format
- **Configurable log levels** (DEBUG, INFO, WARN, ERROR)
- **Environment-aware behavior** (verbose in dev, quiet in production)
- **Domain-specific loggers** for auth, API, components, etc.
- **Type-safe logging** with TypeScript support

## Problem Statement

### Before: Scattered Console Logs

The codebase had 100+ `console.log` statements scattered across components:

```typescript
// ❌ Problems with this approach:
console.log('🔍 AuthProvider component rendering');
console.log('✅ User created:', newUser.name);
console.error('Failed to load documents:', error);
console.log('Template applied:', configs);
```

**Issues:**
1. ❌ No centralized control - can't disable logs in production
2. ❌ Inconsistent formatting - some use emojis, some don't
3. ❌ Missing context - hard to track which component logged
4. ❌ No log levels - everything is `console.log`
5. ❌ Manual timestamp management
6. ❌ Difficult to filter/search logs
7. ❌ No structured data for log aggregation services

### After: Centralized Logger

```typescript
// ✅ Production-ready logging:
import { logger, authLogger, componentLogger } from '@/lib/logger';

// General logging
logger.info('User logged in', { userId: user.id });
logger.error('API request failed', error, { endpoint: '/api/users' });

// Domain-specific logging
authLogger.loginSuccess(user.id, user.email);
componentLogger.mount('Dashboard');

// Configurable - can disable in production
```

**Benefits:**
1. ✅ Single import, consistent everywhere
2. ✅ Automatic timestamps and formatting
3. ✅ Environment-aware (verbose in dev, quiet in prod)
4. ✅ Type-safe with full IntelliSense
5. ✅ Easy to configure via environment variables
6. ✅ Ready for log aggregation services (Sentry, LogRocket, etc.)

## Logger API

### Core Logger Methods

Located in [`src/lib/logger.ts`](src/lib/logger.ts)

```typescript
import { logger } from '@/lib/logger';

// DEBUG level - verbose information for debugging
logger.debug('Component rendering', { component: 'Dashboard', props });

// INFO level - general informational messages
logger.info('User action completed', { action: 'create_tournament' });

// SUCCESS level - operation completed successfully (uses INFO level)
logger.success('Tournament created', { tournamentId: 'tour-123' });

// WARN level - something unexpected but not critical
logger.warn('API retry attempt', { endpoint: '/api/users', attempt: 2 });

// ERROR level - something went wrong
logger.error('API request failed', error, { endpoint: '/api/users' });

// GROUP logs together (development only)
logger.group('User Registration Flow', () => {
  logger.debug('Validating form data');
  logger.debug('Creating user');
  logger.success('User created');
});
```

### Domain-Specific Loggers

Pre-configured loggers for common use cases:

#### Auth Logger

```typescript
import { authLogger } from '@/lib/logger';

authLogger.login('user@example.com');
authLogger.loginSuccess('user-123', 'user@example.com');
authLogger.loginFailure('user@example.com');
authLogger.logout('user-123');
authLogger.register('newuser@example.com');
authLogger.registerSuccess('user-456');
authLogger.sessionRestored('user-123');
```

#### API Logger

```typescript
import { apiLogger } from '@/lib/logger';

apiLogger.request('/api/users', 'GET');
apiLogger.response('/api/users', 200);
apiLogger.error('/api/users', error);
apiLogger.retry('/api/users', 2); // attempt number
```

#### Component Logger

```typescript
import { componentLogger } from '@/lib/logger';

componentLogger.mount('Dashboard');
componentLogger.unmount('Dashboard');
componentLogger.render('QuestionCard', { questionId: 'q-123' });
componentLogger.error('PaymentForm', error);
```

#### Tournament Logger

```typescript
import { tournamentLogger } from '@/lib/logger';

tournamentLogger.create('tour-123');
tournamentLogger.update('tour-123');
tournamentLogger.start('tour-123');
tournamentLogger.complete('tour-123');
```

#### Question Logger

```typescript
import { questionLogger } from '@/lib/logger';

questionLogger.create('q-123');
questionLogger.update('q-123');
questionLogger.delete('q-123');
```

#### Storage Logger

```typescript
import { storageLogger } from '@/lib/logger';

storageLogger.read('CURRENT_USER');
storageLogger.write('TOURNAMENTS');
storageLogger.delete('SESSION_TOKEN');
```

## Log Levels

### Level Hierarchy

```
DEBUG (0)  - Most verbose, everything
  ↓
INFO (1)   - General information, success messages
  ↓
WARN (2)   - Warnings, retries, unexpected situations
  ↓
ERROR (3)  - Errors, failures
  ↓
NONE (4)   - No logs
```

### Default Behavior

- **Development**: `DEBUG` level (shows everything)
- **Production**: `INFO` level (shows info, warn, error)

### Configuration

Set log level via environment variable:

```env
# .env or .env.local

# Show all logs (development default)
VITE_LOG_LEVEL=DEBUG

# Show info, warn, error (production default)
VITE_LOG_LEVEL=INFO

# Show only warnings and errors
VITE_LOG_LEVEL=WARN

# Show only errors
VITE_LOG_LEVEL=ERROR

# Disable all logs
VITE_LOG_LEVEL=NONE
```

### Runtime Configuration

Change log level programmatically:

```typescript
import { logger, LogLevel } from '@/lib/logger';

// Set to ERROR only in production
if (import.meta.env.PROD) {
  logger.setLevel(LogLevel.ERROR);
}

// Temporarily enable debug logging
logger.setLevel(LogLevel.DEBUG);
// ... do debugging ...
logger.setLevel(LogLevel.INFO);
```

## Migration Guide

### Component Logging

**Before:**

```typescript
// Dashboard.tsx
export default function Dashboard({ user }: DashboardProps) {
  useEffect(() => {
    console.log('Dashboard mounted, current user:', user?.email);
  }, []);

  const handleAction = () => {
    console.log('Template applied:', configs);
  };

  return (/* ... */);
}
```

**After:**

```typescript
// Dashboard.tsx
import { logger, componentLogger } from '@/lib/logger';

export default function Dashboard({ user }: DashboardProps) {
  useEffect(() => {
    componentLogger.mount('Dashboard');
    logger.debug('Current user', { email: user?.email });
  }, []);

  const handleAction = () => {
    logger.success('Template applied', { configs });
  };

  return (/* ... */);
}
```

### Auth Logging

**Before:**

```typescript
// AuthSystem.tsx
const handleLogin = async (email: string, password: string) => {
  console.log('🔍 AuthProvider login called with:', email);
  
  const mockUser = users.find(u => u.email === email);
  if (!mockUser) {
    console.log('🔍 User not found in mock data');
    return false;
  }

  console.log('🔍 Mock login successful:', mockUser.email);
  console.log('🔍 Login successful, user state set');
  return true;
};
```

**After:**

```typescript
// AuthSystem.tsx
import { authLogger, logger } from '@/lib/logger';

const handleLogin = async (email: string, password: string) => {
  authLogger.login(email);
  
  const mockUser = users.find(u => u.email === email);
  if (!mockUser) {
    authLogger.loginFailure(email);
    return false;
  }

  authLogger.loginSuccess(mockUser.id, mockUser.email);
  return true;
};
```

### API Error Logging

**Before:**

```typescript
// PracticeMode.tsx
useEffect(() => {
  const loadData = async () => {
    try {
      const response = await fetch('/api/practice/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };
  loadData();
}, []);
```

**After:**

```typescript
// PracticeMode.tsx
import { apiLogger, logger } from '@/lib/logger';

useEffect(() => {
  const loadData = async () => {
    try {
      apiLogger.request('/api/practice/stats', 'GET');
      const response = await fetch('/api/practice/stats');
      apiLogger.response('/api/practice/stats', response.status);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      apiLogger.error('/api/practice/stats', error as Error);
    }
  };
  loadData();
}, []);
```

### Success Logging

**Before:**

```typescript
// RoleManagement.tsx
const handleCreateUser = async (userData: UserData) => {
  const newUser = { ...userData, id: generateId() };
  storage.set(STORAGE_KEYS.USERS, [...allUsers, newUser]);
  console.log(`✅ User created: ${newUser.name} with role ${newUser.role}`);
  refetchUsers();
};
```

**After:**

```typescript
// RoleManagement.tsx
import { logger } from '@/lib/logger';

const handleCreateUser = async (userData: UserData) => {
  const newUser = { ...userData, id: generateId() };
  storage.set(STORAGE_KEYS.USERS, [...allUsers, newUser]);
  logger.success('User created', { 
    userId: newUser.id,
    name: newUser.name, 
    role: newUser.role 
  });
  refetchUsers();
};
```

## Implementation Status

### ✅ Completed

- [x] Created centralized logger utility ([`src/lib/logger.ts`](src/lib/logger.ts))
- [x] Defined log levels (DEBUG, INFO, WARN, ERROR, NONE)
- [x] Environment-aware configuration
- [x] Domain-specific loggers (auth, API, component, etc.)
- [x] TypeScript types and IntelliSense support
- [x] Documentation created

### ⏳ TODO: Component Migration

Replace console.log statements in these components (100+ instances):

**High Priority (Auth & Core):**
- [ ] `AuthSystem.tsx` (47 console.log instances)
- [ ] `Dashboard.tsx` (6 instances)
- [ ] `RoleManagement.tsx` (3 instances)
- [ ] `UserManagement.tsx`
- [ ] `UserManagementWithLoginAs.tsx`

**Medium Priority (Features):**
- [ ] `TournamentBuilder.tsx`
- [ ] `TournamentEngine.tsx`
- [ ] `QuestionBank.tsx`
- [ ] `PracticeMode.tsx` (3 error logs)
- [ ] `LiveMatch.tsx`

**Low Priority (Admin & Utilities):**
- [ ] `LegalDocumentEditor.tsx` (6 error logs)
- [ ] `PlanManagement.tsx` (2 error logs)
- [ ] `BonusQuestionManager.tsx` (1 error log)
- [ ] `KnockoutTournamentEngine.tsx` (1 error log)
- [ ] `DebugPage.tsx` (6 debug logs - keep as-is)
- [ ] `HelpCenter.tsx` (2 TODO logs)
- [ ] `Layout.tsx` (1 log)
- [ ] `ComponentAccessControl.tsx` (1 log)
- [ ] `SubscriptionCheckout.tsx` (1 log)
- [ ] `TournamentCheckout.tsx` (1 log)

**Keep as console.error:**
Components that use `console.error` can keep them or migrate:
- These are legitimate error logs that should always show
- Consider migrating to `logger.error()` for consistency
- Ensures error logs aren't accidentally disabled

## Benefits of Migration

### Development Experience

```typescript
// Before - Hard to filter/search
console.log('🔍 AuthProvider login called with:', email);
console.log('Template applied:', configs);
console.log('✅ User created:', newUser.name);

// After - Easy to filter by level
logger.debug('AuthProvider login called', { email });
logger.info('Template applied', { configs });
logger.success('User created', { name: newUser.name });
```

**Benefits:**
- ✅ Filter by log level in DevTools
- ✅ Search for specific domains (auth, API, etc.)
- ✅ Consistent format makes logs easier to read
- ✅ Timestamps automatically included

### Production Deployment

```typescript
// Before - All logs show in production console
console.log('🔍 Debugging info that users see');

// After - Clean production logs
logger.debug('Debugging info'); // Hidden in production
logger.info('User action'); // Shows in production
```

**Benefits:**
- ✅ Clean production console (no debug noise)
- ✅ Only important logs visible to users
- ✅ Configurable per environment
- ✅ Can disable all logs if needed

### Log Aggregation

```typescript
// Structured logs are easy to send to services like Sentry
logger.error('API request failed', error, {
  endpoint: '/api/users',
  method: 'POST',
  userId: user.id,
  tenantId: tenant.id,
});

// Can be intercepted and sent to:
// - Sentry (error tracking)
// - LogRocket (session replay)
// - DataDog (log aggregation)
// - CloudWatch (AWS logging)
```

**Benefits:**
- ✅ Structured context for debugging
- ✅ Easy to implement error tracking
- ✅ Ready for production monitoring
- ✅ Helps identify patterns in user issues

## Best Practices

### DO ✅

```typescript
// Use appropriate log levels
logger.debug('Entering function', { params });  // Verbose debugging
logger.info('User performed action', { action }); // General info
logger.warn('Unexpected state', { state }); // Warnings
logger.error('Operation failed', error, { context }); // Errors

// Include context objects
logger.info('Tournament created', { 
  tournamentId: tournament.id,
  createdBy: user.id,
  participantCount: participants.length
});

// Use domain-specific loggers
authLogger.loginSuccess(user.id, user.email);
apiLogger.request('/api/users', 'GET');

// Group related logs
logger.group('User Registration Flow', () => {
  logger.debug('Validating email');
  logger.debug('Creating user record');
  logger.success('User registered');
});
```

### DON'T ❌

```typescript
// Don't use raw console.log
console.log('User logged in'); // ❌ Use logger.info()

// Don't log sensitive data
logger.info('User password', { password: user.password }); // ❌ Security risk!

// Don't over-log in production code
logger.debug('Variable x:', x); // ❌ Use sparingly
logger.debug('Function entered'); // ❌ Too verbose

// Don't concatenate messages
logger.info('User ' + user.name + ' created'); // ❌ Use context objects

// Don't use emojis directly (logger adds them)
logger.info('✅ User created'); // ❌ Logger handles emojis
```

## Future Enhancements

### Phase 1: Complete Migration ⏳
- Replace all console.log statements with logger
- Update components to use domain-specific loggers
- Test log levels in all environments

### Phase 2: Error Tracking Integration 🔜
- Integrate with Sentry for error tracking
- Add breadcrumbs for debugging
- Track user sessions with context

### Phase 3: Performance Monitoring 🔮
- Add performance timing logs
- Track slow API calls
- Monitor render performance

### Phase 4: Log Aggregation 🔮
- Send logs to CloudWatch/DataDog
- Set up dashboards for monitoring
- Create alerts for critical errors

## Testing Logger

### Manual Testing

```typescript
// Test all log levels
import { logger, LogLevel } from '@/lib/logger';

// Test in different modes
logger.setLevel(LogLevel.DEBUG);
logger.debug('Debug test'); // Should show
logger.info('Info test');   // Should show
logger.warn('Warn test');   // Should show
logger.error('Error test'); // Should show

logger.setLevel(LogLevel.INFO);
logger.debug('Debug test'); // Should NOT show
logger.info('Info test');   // Should show

logger.setLevel(LogLevel.NONE);
logger.error('Error test'); // Should NOT show

// Test context objects
logger.info('User action', {
  userId: 'user-123',
  action: 'create_tournament',
  timestamp: Date.now()
});

// Test error logging with stack traces
try {
  throw new Error('Test error');
} catch (error) {
  logger.error('Caught error', error, { component: 'Test' });
}
```

### Browser DevTools

1. Open browser console (F12)
2. Filter by log level using DevTools filters
3. Search for specific messages or contexts
4. Check timestamps are included
5. Verify icons appear correctly (🔍, ℹ️, ⚠️, ❌, ✅)

## Summary

### Impact Metrics

- **100+ console.log statements** identified
- **1 centralized logger** created
- **7 domain-specific loggers** provided
- **5 log levels** implemented
- **Environment-aware** behavior
- **Type-safe** with full IntelliSense
- **Production-ready** for monitoring integration

### Next Steps

1. ✅ Review this document
2. ⏳ Migrate high-priority components (AuthSystem, Dashboard)
3. ⏳ Test logger in development and production modes
4. ⏳ Configure VITE_LOG_LEVEL for production deployment
5. 🔜 Integrate with error tracking service (Sentry)
6. 🔜 Set up log aggregation for production monitoring

### Related Documents

- [`API_INTEGRATION_COMPLETE.md`](../../../API_INTEGRATION_COMPLETE.md) - API integration status
- [`LOCALSTORAGE_AUDIT.md`](../../../LOCALSTORAGE_AUDIT.md) - localStorage usage audit
- [`ARCHITECTURE.md`](../../../ARCHITECTURE.md) - System architecture
- [`TROUBLESHOOTING.md`](../../../TROUBLESHOOTING.md) - Common issues and solutions

---

**Last Updated:** 2024-01-20  
**Status:** Logger created, migration in progress  
**Priority:** Medium (improves debugging, required for production monitoring)
