# Landing Page Content Management System (CMS) - Complete Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Backend API](#backend-api)
5. [Frontend Integration](#frontend-integration)
6. [Version Control](#version-control)
7. [Usage Examples](#usage-examples)
8. [Migration from localStorage](#migration-from-localstorage)
9. [Testing](#testing)
10. [Troubleshooting](#troubleshooting)

---

## Overview

The Landing Page CMS provides a complete content management system for tenant landing pages, featuring:

- **Database Persistence**: Replace volatile localStorage with PostgreSQL
- **Version Control**: Multiple versions per section with activate/deactivate
- **Audit Trail**: Track who created what and when
- **Scheduled Publishing**: Set effective dates for content updates
- **Preview Mode**: Review changes before activation
- **Rollback Capability**: Revert to previous versions easily
- **Multi-Section Support**: Manage 5 independent sections (Hero, Stats, Features, Testimonials, Branding)

### Why a Dedicated CMS?

Separate from Legal Documents CMS for:
- **Clean Architecture**: Marketing content ≠ Legal documents
- **Different Data Models**: JSON (flexible) vs Markdown (structured text)
- **Different Permissions**: Marketing team vs Legal team
- **Landing Page-Specific Features**: A/B testing, analytics, scheduled campaigns

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Tenant Landing Page                       │
│                 (TenantLandingPage.tsx)                      │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Hero   │  │  Stats   │  │ Features │  │Branding  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└──────────────────────┬───────────────────────────────────────┘
                       │ GET /api/landing-page/active
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Landing Page CMS Backend API                    │
│           (NestJS + Prisma + PostgreSQL)                     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  LandingPageService (version control logic)        │    │
│  │  - create()   - activate()   - getHistory()        │    │
│  │  - update()   - deactivate() - getAllActive()      │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  LandingPageController (HTTP endpoints)            │    │
│  │  - POST /api/landing-page (create version)         │    │
│  │  - PUT /api/landing-page/:id (update)              │    │
│  │  - POST /api/landing-page/:id/activate             │    │
│  │  - GET /api/landing-page/active (public)           │    │
│  └────────────────────────────────────────────────────┘    │
└──────────────────────┬───────────────────────────────────────┘
                       │ Prisma ORM
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                 PostgreSQL Database                          │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  landing_page_contents                             │    │
│  │  ┌─────────────────────────────────────────┐      │    │
│  │  │ id, tenantId, section, content (JSON)   │      │    │
│  │  │ version, isActive, effectiveDate         │      │    │
│  │  │ createdBy, createdAt, updatedAt          │      │    │
│  │  └─────────────────────────────────────────┘      │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                       ▲
                       │ Admin manages content
                       │
┌─────────────────────────────────────────────────────────────┐
│         Landing Page Editor (Admin Component)                │
│           (LandingPageEditor.tsx - To Be Built)              │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Section-Specific Editors                         │      │
│  │  - Hero Editor (headline, CTA buttons)            │      │
│  │  - Stats Editor (metrics display)                 │      │
│  │  - Features Editor (feature cards)                │      │
│  │  - Testimonials Editor (user reviews)             │      │
│  │  - Branding Editor (logo, footer)                 │      │
│  └──────────────────────────────────────────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────┐      │
│  │  Version Control UI                               │      │
│  │  - Preview before publish                         │      │
│  │  - Activate/deactivate versions                   │      │
│  │  - View version history                           │      │
│  │  - Compare versions                               │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### LandingPageContent Model

```prisma
model LandingPageContent {
  id            String              @id @default(cuid())
  tenantId      String
  section       LandingPageSection
  content       Json                // Flexible JSON structure
  version       Int                 @default(1)
  isActive      Boolean             @default(false)
  effectiveDate DateTime            // When this version takes effect
  createdBy     String              // User ID who created this version
  createdAt     DateTime            @default(now())
  updatedAt     DateTime            @updatedAt

  tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)

  @@unique([tenantId, section, version])
  @@index([tenantId, section, isActive])
  @@index([tenantId, section, effectiveDate])
  @@map("landing_page_contents")
}
```

### LandingPageSection Enum

```prisma
enum LandingPageSection {
  HERO          // Main hero section (headline, subheadline, CTA)
  STATS         // Statistics section (question count, tournaments)
  FEATURES      // Features section (tournament, practice, leaderboard)
  TESTIMONIALS  // User testimonials and reviews
  BRANDING      // Logo display, powered by, custom footer
}
```

### Key Features

1. **Tenant Isolation**: All queries filter by `tenantId`
2. **Version Control**: Unique constraint on `[tenantId, section, version]`
3. **Single Active Version**: Only one active version per section at a time
4. **Cascade Delete**: Deleting tenant removes all landing page content
5. **Optimized Queries**: Indexes on frequently queried fields

---

## Backend API

### Endpoints Overview

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/landing-page` | Admin | Create new version |
| PUT | `/api/landing-page/:id` | Admin | Update content (creates new version) |
| GET | `/api/landing-page/section/:section/versions` | Admin | Get all versions for section |
| GET | `/api/landing-page/section/:section/active` | Public | Get active content for section |
| GET | `/api/landing-page/active` | Public | Get all active content |
| POST | `/api/landing-page/:id/activate` | Admin | Activate a version |
| POST | `/api/landing-page/:id/deactivate` | Admin | Deactivate a version |
| GET | `/api/landing-page/section/:section/history` | Admin | Get version history |
| GET | `/api/landing-page/:id` | Admin | Get specific version |
| DELETE | `/api/landing-page/:id` | Admin | Delete version (cannot delete active) |

### Authentication & Authorization

All endpoints require JWT authentication except where noted. Admin endpoints require `ORG_ADMIN` or `QUESTION_MANAGER` role.

```typescript
// All requests include:
@UseGuards(JwtAuthGuard, TenantGuard)

// Admin endpoints also include:
@UseGuards(RolesGuard)
@Roles('ORG_ADMIN', 'QUESTION_MANAGER')
```

### Service Methods

#### Create New Version

```typescript
async create(
  tenantId: string,
  userId: string,
  createDto: CreateLandingPageContentDto,
): Promise<LandingPageContent>
```

**Auto-increments version number** based on latest version for the section.

**Input:**
```typescript
{
  section: 'HERO',
  content: {
    headline: 'Master Bible Quizzing',
    subheadline: 'Interactive tournaments, practice modes, and AI-powered learning',
    ctaPrimary: {
      text: 'Get Started Free',
      link: '/signup'
    },
    ctaSecondary: {
      text: 'Watch Demo',
      link: '/demo'
    }
  },
  effectiveDate: '2024-12-01T00:00:00Z' // Optional, defaults to now
}
```

#### Activate Version

```typescript
async activate(id: string, tenantId: string): Promise<LandingPageContent>
```

**Atomic operation** that:
1. Deactivates all other versions for the section
2. Activates the specified version

Uses Prisma transaction for data consistency.

#### Get All Active Content

```typescript
async getAllActive(tenantId: string): Promise<Record<string, any>>
```

Returns object keyed by section:

```typescript
{
  HERO: { id: '...', version: 3, content: {...}, isActive: true },
  STATS: { id: '...', version: 2, content: {...}, isActive: true },
  FEATURES: { id: '...', version: 1, content: {...}, isActive: true },
  // ... other sections
}
```

---

## Frontend Integration

### Content Structure by Section

#### HERO Section

```typescript
{
  headline: string;
  subheadline: string;
  ctaPrimary: {
    text: string;
    link: string;
  };
  ctaSecondary: {
    text: string;
    link: string;
  };
  backgroundImage?: string; // Optional
}
```

#### STATS Section

```typescript
{
  totalQuestions: number | string;
  activeTournaments: number | string;
  practiceAccess: string;
  customStats?: Array<{
    label: string;
    value: string | number;
  }>;
}
```

#### FEATURES Section

```typescript
{
  features: Array<{
    icon: string; // Icon name or component
    title: string;
    description: string;
  }>;
}
```

#### TESTIMONIALS Section

```typescript
{
  testimonials: Array<{
    name: string;
    role: string;
    church?: string;
    quote: string;
    avatar?: string;
  }>;
}
```

#### BRANDING Section

```typescript
{
  logoUrl?: string;
  poweredBy: string;
  customFooter?: {
    text: string;
    links: Array<{
      label: string;
      url: string;
    }>;
  };
}
```

### React Hook for Content Fetching

**To be created:** `useLandingPageContent.ts`

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

export function useLandingPageContent(tenantId: string) {
  const [content, setContent] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await axios.get('/api/landing-page/active', {
          headers: { 'X-Tenant-Id': tenantId },
        });
        setContent(response.data);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [tenantId]);

  return { content, loading, error };
}
```

**Usage:**

```typescript
function TenantLandingPage({ tenantId }) {
  const { content, loading, error } = useLandingPageContent(tenantId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;

  return (
    <>
      <HeroSection data={content.HERO?.content} />
      <StatsSection data={content.STATS?.content} />
      <FeaturesSection data={content.FEATURES?.content} />
      <TestimonialsSection data={content.TESTIMONIALS?.content} />
      <BrandingSection data={content.BRANDING?.content} />
    </>
  );
}
```

---

## Version Control

### Version Lifecycle

```
┌──────────────┐
│  Create v1   │ ──> isActive: false
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Activate v1 │ ──> isActive: true (only active version)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Create v2   │ ──> isActive: false (v1 still active)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Activate v2 │ ──> v1: false, v2: true (auto-switch)
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Rollback    │ ──> Reactivate v1 (v2 becomes inactive)
└──────────────┘
```

### Version Comparison

**To be implemented in editor:**

```typescript
function VersionCompare({ version1, version2 }) {
  const diff = computeDiff(version1.content, version2.content);
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3>Version {version1.version}</h3>
        <pre>{JSON.stringify(version1.content, null, 2)}</pre>
      </div>
      <div>
        <h3>Version {version2.version}</h3>
        <pre>{JSON.stringify(version2.content, null, 2)}</pre>
      </div>
      <div className="col-span-2">
        <h3>Differences</h3>
        <DiffViewer changes={diff} />
      </div>
    </div>
  );
}
```

---

## Usage Examples

### 1. Create Hero Section Content

**Request:**
```http
POST /api/landing-page
Content-Type: application/json
Authorization: Bearer <jwt_token>
X-Tenant-Id: <tenant_id>

{
  "section": "HERO",
  "content": {
    "headline": "Transform Your Bible Quiz Ministry",
    "subheadline": "Engage students with interactive tournaments and AI-powered practice",
    "ctaPrimary": {
      "text": "Start Free Trial",
      "link": "/signup"
    },
    "ctaSecondary": {
      "text": "Schedule Demo",
      "link": "/demo"
    }
  },
  "effectiveDate": "2024-12-01T00:00:00Z"
}
```

**Response:**
```json
{
  "id": "clp123abc",
  "tenantId": "tenant_xyz",
  "section": "HERO",
  "content": {
    "headline": "Transform Your Bible Quiz Ministry",
    "subheadline": "Engage students with interactive tournaments and AI-powered practice",
    "ctaPrimary": {
      "text": "Start Free Trial",
      "link": "/signup"
    },
    "ctaSecondary": {
      "text": "Schedule Demo",
      "link": "/demo"
    }
  },
  "version": 1,
  "isActive": false,
  "effectiveDate": "2024-12-01T00:00:00.000Z",
  "createdBy": "user_admin",
  "createdAt": "2024-11-25T05:55:14.000Z",
  "updatedAt": "2024-11-25T05:55:14.000Z"
}
```

### 2. Activate Hero Section

**Request:**
```http
POST /api/landing-page/clp123abc/activate
Authorization: Bearer <jwt_token>
X-Tenant-Id: <tenant_id>
```

**Response:**
```json
{
  "id": "clp123abc",
  "isActive": true,
  // ... other fields
}
```

### 3. Fetch Active Content (Public)

**Request:**
```http
GET /api/landing-page/active
X-Tenant-Id: <tenant_id>
```

**Response:**
```json
{
  "HERO": {
    "id": "clp123abc",
    "version": 1,
    "content": {
      "headline": "Transform Your Bible Quiz Ministry",
      // ...
    },
    "isActive": true
  },
  "STATS": {
    "id": "clp456def",
    "version": 2,
    "content": {
      "totalQuestions": 5000,
      // ...
    },
    "isActive": true
  }
  // ... other sections
}
```

### 4. Get Version History

**Request:**
```http
GET /api/landing-page/section/HERO/history
Authorization: Bearer <jwt_token>
X-Tenant-Id: <tenant_id>
```

**Response:**
```json
[
  {
    "id": "clp789ghi",
    "version": 3,
    "isActive": true,
    "effectiveDate": "2024-12-01T00:00:00.000Z",
    "createdBy": "user_admin",
    "createdAt": "2024-11-25T10:00:00.000Z",
    "updatedAt": "2024-11-25T10:05:00.000Z"
  },
  {
    "id": "clp456def",
    "version": 2,
    "isActive": false,
    "effectiveDate": "2024-11-20T00:00:00.000Z",
    "createdBy": "user_admin",
    "createdAt": "2024-11-20T09:00:00.000Z",
    "updatedAt": "2024-11-20T09:00:00.000Z"
  },
  {
    "id": "clp123abc",
    "version": 1,
    "isActive": false,
    "effectiveDate": "2024-11-15T00:00:00.000Z",
    "createdBy": "user_admin",
    "createdAt": "2024-11-15T08:00:00.000Z",
    "updatedAt": "2024-11-15T08:00:00.000Z"
  }
]
```

---

## Migration from localStorage

### Current Implementation

**TenantLandingSettings.tsx** (539 lines):
- Stores content in `localStorage.setItem('tenant_landing_${tenant.id}', JSON.stringify(content))`
- Sections: hero, stats, features, testimonials, branding
- No version control, no audit trail

**TenantLandingPage.tsx** (743 lines):
- Loads content from `localStorage.getItem('tenant_landing_${tenant.id}')`
- Falls back to default values if no content

### Migration Steps

#### Step 1: Create Data Migration Script

```typescript
// scripts/migrate-landing-page-content.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateTenant(tenantId: string, localStorageData: any) {
  const sections: Array<keyof typeof localStorageData> = [
    'hero',
    'stats',
    'features',
    'testimonials',
    'branding',
  ];

  for (const section of sections) {
    if (localStorageData[section]) {
      await prisma.landingPageContent.create({
        data: {
          tenantId,
          section: section.toUpperCase() as any,
          content: localStorageData[section],
          version: 1,
          isActive: true,
          effectiveDate: new Date(),
          createdBy: 'MIGRATION_SCRIPT',
        },
      });
    }
  }
}

// Run migration for all tenants
async function main() {
  const tenants = await prisma.tenant.findMany();
  
  for (const tenant of tenants) {
    const storageKey = `tenant_landing_${tenant.id}`;
    const data = localStorage.getItem(storageKey);
    
    if (data) {
      const parsed = JSON.parse(data);
      await migrateTenant(tenant.id, parsed);
      console.log(`✅ Migrated content for tenant: ${tenant.id}`);
    }
  }
}

main();
```

#### Step 2: Update TenantLandingPage.tsx

**Before:**
```typescript
const [landingContent, setLandingContent] = useState(() => {
  const saved = localStorage.getItem(`tenant_landing_${tenant.id}`);
  return saved ? JSON.parse(saved) : defaultContent;
});
```

**After:**
```typescript
const { content, loading, error } = useLandingPageContent(tenant.id);

if (loading) return <LoadingSpinner />;
if (error) {
  // Fallback to default content
  return <LandingPageWithDefaults />;
}
```

#### Step 3: Update TenantLandingSettings.tsx

Replace localStorage save logic with API calls:

**Before:**
```typescript
const handleSave = () => {
  localStorage.setItem(
    `tenant_landing_${tenant.id}`,
    JSON.stringify(landingContent)
  );
  alert('Landing page updated successfully!');
};
```

**After:**
```typescript
const handleSave = async () => {
  try {
    // Create new version for each modified section
    const promises = Object.entries(modifiedSections).map(
      ([section, content]) =>
        axios.post('/api/landing-page', {
          section: section.toUpperCase(),
          content,
        })
    );
    
    await Promise.all(promises);
    
    // Auto-activate new versions
    const activatePromises = newVersionIds.map(id =>
      axios.post(`/api/landing-page/${id}/activate`)
    );
    
    await Promise.all(activatePromises);
    
    toast.success('Landing page updated successfully!');
  } catch (error) {
    toast.error('Failed to update landing page');
  }
};
```

#### Step 4: Cleanup localStorage

After successful migration:

```typescript
// Remove old localStorage keys
const tenants = await prisma.tenant.findMany();
tenants.forEach(tenant => {
  localStorage.removeItem(`tenant_landing_${tenant.id}`);
});
```

---

## Testing

### Backend API Tests

**Create test file:** `services/api/test/landing-page.e2e.test.ts`

```typescript
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';

describe('Landing Page CMS E2E', () => {
  let app;
  let authToken;
  let tenantId;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();

    // Setup: Login and get tenant
    const loginRes = await request(app.getHttpServer())
      .post('/api/auth/login')
      .send({ email: 'admin@test.com', password: 'password' });
    
    authToken = loginRes.body.access_token;
    tenantId = loginRes.body.user.tenantId;
  });

  it('should create new landing page content', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/landing-page')
      .set('Authorization', `Bearer ${authToken}`)
      .set('X-Tenant-Id', tenantId)
      .send({
        section: 'HERO',
        content: {
          headline: 'Test Headline',
          subheadline: 'Test Subheadline',
        },
      })
      .expect(201);

    expect(res.body.version).toBe(1);
    expect(res.body.isActive).toBe(false);
  });

  it('should activate a version', async () => {
    // Create version first
    const createRes = await request(app.getHttpServer())
      .post('/api/landing-page')
      .set('Authorization', `Bearer ${authToken}`)
      .set('X-Tenant-Id', tenantId)
      .send({
        section: 'STATS',
        content: { totalQuestions: 5000 },
      });

    const versionId = createRes.body.id;

    // Activate it
    const activateRes = await request(app.getHttpServer())
      .post(`/api/landing-page/${versionId}/activate`)
      .set('Authorization', `Bearer ${authToken}`)
      .set('X-Tenant-Id', tenantId)
      .expect(200);

    expect(activateRes.body.isActive).toBe(true);
  });

  it('should fetch all active content', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/landing-page/active')
      .set('X-Tenant-Id', tenantId)
      .expect(200);

    expect(res.body).toHaveProperty('HERO');
    expect(res.body.HERO.isActive).toBe(true);
  });

  afterAll(async () => {
    await app.close();
  });
});
```

### Frontend Component Tests

**Test:** `apps/tenant-app/src/components/__tests__/useLandingPageContent.test.ts`

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useLandingPageContent } from '../hooks/useLandingPageContent';
import axios from 'axios';

jest.mock('axios');

describe('useLandingPageContent', () => {
  it('should fetch landing page content', async () => {
    const mockData = {
      HERO: { content: { headline: 'Test' } },
    };

    (axios.get as jest.Mock).mockResolvedValue({ data: mockData });

    const { result } = renderHook(() =>
      useLandingPageContent('tenant_123')
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.content).toEqual(mockData);
    expect(result.current.error).toBe(null);
  });

  it('should handle errors', async () => {
    const error = new Error('Network error');
    (axios.get as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() =>
      useLandingPageContent('tenant_123')
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(error);
  });
});
```

---

## Troubleshooting

### Issue: "Property 'landingPageContent' does not exist on type 'PrismaService'"

**Cause:** TypeScript hasn't picked up the regenerated Prisma Client.

**Solution:**
```powershell
cd services/api
npx prisma generate
# Restart VS Code TypeScript server (Ctrl+Shift+P → "TypeScript: Restart TS Server")
```

### Issue: "No active content found for section"

**Cause:** No version has been activated for that section.

**Solution:**
1. Create a version for the section
2. Activate it: `POST /api/landing-page/:id/activate`
3. Verify: `GET /api/landing-page/section/:section/active`

### Issue: "Cannot delete active version"

**Cause:** Trying to delete the currently active version.

**Solution:**
1. Activate a different version first
2. Then delete the old version

Or deactivate first:
```http
POST /api/landing-page/:id/deactivate
DELETE /api/landing-page/:id
```

### Issue: Version numbers not incrementing

**Cause:** Logic error in `create()` method.

**Debug:**
```sql
-- Check versions in database
SELECT tenant_id, section, version, is_active 
FROM landing_page_contents 
WHERE tenant_id = 'YOUR_TENANT_ID' 
ORDER BY section, version DESC;
```

Verify highest version is being found correctly.

### Issue: Multiple active versions for same section

**Cause:** Transaction failure in `activate()` method.

**Solution:**
```sql
-- Manual cleanup
UPDATE landing_page_contents 
SET is_active = false 
WHERE tenant_id = 'YOUR_TENANT_ID' 
  AND section = 'HERO' 
  AND id != 'CORRECT_ACTIVE_VERSION_ID';
```

---

## Next Steps

### Frontend Editor (In Progress)

**File:** `apps/tenant-app/src/components/LandingPageEditor.tsx`

**Features to implement:**
1. Section-specific editors (Hero, Stats, Features, etc.)
2. JSON editor with schema validation
3. Preview mode (live preview before activation)
4. Version history viewer
5. Compare versions side-by-side
6. Activate/deactivate buttons
7. Schedule publishing (future)

### Enhancements (Future)

1. **A/B Testing**: Multiple active versions with traffic split
2. **Analytics Integration**: Track conversion rates per version
3. **Scheduled Publishing**: Auto-activate versions at specific times
4. **Content Templates**: Pre-built templates for common layouts
5. **Media Library**: Integrated image/video management
6. **Localization**: Multi-language support per section
7. **Collaborative Editing**: Multiple admins editing simultaneously

---

## Summary

The Landing Page CMS provides a **production-ready** content management system with:

- ✅ **Database Schema**: PostgreSQL with Prisma ORM
- ✅ **Backend API**: 10 RESTful endpoints with authentication
- ✅ **Version Control**: Auto-increment, activate/deactivate, rollback
- ✅ **Tenant Isolation**: All queries filtered by tenant_id
- ✅ **Audit Trail**: Track creators and timestamps
- ⏳ **Frontend Editor**: Next step (in progress)
- ⏳ **Migration Tools**: localStorage → Database (next step)

**Migration Created:** `20251125055514_add_landing_page_cms`

**Backend Files:**
- `services/api/src/landing-page/landing-page.service.ts` (280 lines)
- `services/api/src/landing-page/landing-page.controller.ts` (140 lines)
- `services/api/src/landing-page/landing-page.module.ts`
- `services/api/src/landing-page/dto/*.dto.ts` (3 DTOs)

**Documentation:** This guide (700+ lines)

Ready for frontend integration! 🚀
