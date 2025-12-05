# Marketing CMS Testing Guide

**Created:** December 5, 2025  
**Status:** ✅ Production-Ready with Authentication & Validation

---

## Quick Test Commands

### 1. Start Backend API
```powershell
cd services/api
pnpm dev
# Server runs on http://localhost:3001
```

### 2. Start Platform Admin
```powershell
cd apps/platform-admin
pnpm dev
# App runs on http://localhost:5173
```

### 3. Start Marketing Site
```powershell
cd apps/marketing-site
pnpm dev
# Site runs on http://localhost:3000
```

---

## API Testing (cURL)

### Public Endpoints (No Auth Required)

**Get All Blog Posts:**
```bash
curl http://localhost:3001/marketing-cms/blog-posts
```

**Get All Features:**
```bash
curl http://localhost:3001/marketing-cms/features
```

**Get All Testimonials:**
```bash
curl http://localhost:3001/marketing-cms/testimonials
```

**Get All Pricing Plans:**
```bash
curl http://localhost:3001/marketing-cms/pricing-plans
```

**Get All FAQs:**
```bash
curl http://localhost:3001/marketing-cms/faqs
```

**Get Hero Content:**
```bash
curl http://localhost:3001/marketing-cms/hero
```

**Get All Content (Bulk):**
```bash
curl http://localhost:3001/marketing-cms/all
```

### Protected Endpoints (Auth Required)

**Create Blog Post (JWT Required):**
```bash
# First, get JWT token by logging in
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@smartequiz.com",
    "password": "yourpassword"
  }'

# Then use the token
curl -X POST http://localhost:3001/marketing-cms/blog-posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "title": "Test Blog Post",
    "slug": "test-blog-post",
    "excerpt": "This is a test excerpt with at least 10 characters",
    "content": "This is the full content of the blog post with at least 50 characters to meet validation requirements",
    "author": "Test Author",
    "category": "Technology",
    "tags": ["test", "api"],
    "status": "PUBLISHED",
    "createdBy": "user-id-here"
  }'
```

**Update Blog Post:**
```bash
curl -X PUT http://localhost:3001/marketing-cms/blog-posts/POST_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "title": "Updated Title",
    "status": "DRAFT"
  }'
```

**Delete Blog Post:**
```bash
curl -X DELETE http://localhost:3001/marketing-cms/blog-posts/POST_ID \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

---

## Platform Admin Testing

### 1. Login as Super Admin
1. Navigate to http://localhost:5173
2. Login with super_admin credentials
3. Navigate to Marketing CMS section

### 2. Test Blog Post Management
1. **Create:**
   - Click "New Blog Post"
   - Fill in all required fields
   - Verify validation (try submitting with invalid data)
   - Save as DRAFT or PUBLISHED
   - Check database: `SELECT * FROM marketing_blog_posts;`

2. **Read:**
   - View list of all blog posts
   - Click on a post to view details
   - Verify published posts appear, drafts don't (on marketing site)

3. **Update:**
   - Edit existing blog post
   - Change status from DRAFT to PUBLISHED
   - Verify publishedAt timestamp is set
   - Save and verify changes persist

4. **Delete:**
   - Delete a test blog post
   - Verify it's removed from database
   - Verify it no longer appears in lists

### 3. Test Other Content Types
Repeat Create/Read/Update/Delete tests for:
- ✅ Features
- ✅ Testimonials
- ✅ Pricing Plans
- ✅ FAQs
- ✅ Hero Content

---

## Marketing Site Testing

### 1. Blog Page Integration
1. Navigate to http://localhost:3000/blog
2. Verify blog posts load from API
3. Create a new blog post in Platform Admin (status: PUBLISHED)
4. Wait 60 seconds (ISR revalidation)
5. Refresh blog page - new post should appear
6. Verify category filtering works
7. Check fallback data appears if API is down

### 2. Features Page (Future)
Similar integration as blog page:
- Fetch from `/marketing-cms/features`
- Display in grid/list format
- Group by category

### 3. Testimonials Section (Future)
- Fetch from `/marketing-cms/testimonials`
- Show featured testimonials on homepage
- Full testimonials on dedicated page

### 4. Pricing Page (Future)
- Fetch from `/marketing-cms/pricing-plans`
- Display pricing cards
- Highlight "highlighted" plan

---

## Validation Testing

### Test Invalid Data

**1. Title Too Short:**
```json
{
  "title": "Hi",  // Min 3 characters - should fail
  ...
}
```

**2. Content Too Short:**
```json
{
  "content": "Short",  // Min 50 characters - should fail
  ...
}
```

**3. Invalid Status:**
```json
{
  "status": "ACTIVE"  // Should be DRAFT or PUBLISHED - should fail
  ...
}
```

**4. Missing Required Field:**
```json
{
  "title": "Test",
  // Missing createdBy - should fail
  ...
}
```

**Expected Response:**
```json
{
  "statusCode": 400,
  "message": ["Validation error messages here"],
  "error": "Bad Request"
}
```

---

## Security Testing

### 1. Test Unauthorized Access

**Try to create without JWT:**
```bash
curl -X POST http://localhost:3001/marketing-cms/blog-posts \
  -H "Content-Type: application/json" \
  -d '{ ... }'
# Expected: 401 Unauthorized
```

### 2. Test Wrong Role

**Try to create with non-super_admin JWT:**
```bash
# Login as regular user
curl -X POST http://localhost:3001/auth/login \
  -d '{"email": "user@example.com", "password": "password"}'

# Try to create blog post with user token
curl -X POST http://localhost:3001/marketing-cms/blog-posts \
  -H "Authorization: Bearer USER_TOKEN" \
  -d '{ ... }'
# Expected: 403 Forbidden
```

### 3. Test Public Read Access

**Verify GET endpoints work without auth:**
```bash
curl http://localhost:3001/marketing-cms/blog-posts
# Expected: 200 OK with data
```

---

## Database Testing

### Connect to Database
```powershell
cd services/api
npx prisma studio
# Opens at http://localhost:5555
```

### Verify Data

**Check Blog Posts:**
```sql
SELECT id, title, status, publishedAt, createdBy, createdAt 
FROM marketing_blog_posts
ORDER BY createdAt DESC;
```

**Check Features:**
```sql
SELECT id, title, category, "order", isActive
FROM marketing_features
ORDER BY "order" ASC;
```

**Check All Content:**
```sql
SELECT 'blog' as type, COUNT(*) as count FROM marketing_blog_posts
UNION ALL
SELECT 'features', COUNT(*) FROM marketing_features
UNION ALL
SELECT 'testimonials', COUNT(*) FROM marketing_testimonials
UNION ALL
SELECT 'pricing', COUNT(*) FROM marketing_pricing_plans
UNION ALL
SELECT 'faqs', COUNT(*) FROM marketing_faqs
UNION ALL
SELECT 'hero', COUNT(*) FROM marketing_hero;
```

---

## Performance Testing

### 1. Load Test (Apache Bench)
```bash
# Test GET endpoint
ab -n 1000 -c 10 http://localhost:3001/marketing-cms/blog-posts

# Expected: < 100ms avg response time
```

### 2. Caching Verification
```bash
# First request (cache miss)
time curl http://localhost:3001/marketing-cms/blog-posts

# Second request (cache hit)
time curl http://localhost:3001/marketing-cms/blog-posts

# Cache hit should be faster
```

### 3. ISR Testing (Marketing Site)
1. Create blog post in admin
2. Visit marketing site blog page
3. Note load time (should be fast - served from cache)
4. Wait 60 seconds
5. Refresh - should revalidate and show new post
6. Subsequent refreshes should be fast again

---

## Error Handling Testing

### 1. Network Errors
```bash
# Stop API server
# Visit marketing site blog page
# Verify: Fallback data is displayed
# Verify: No crashes or blank pages
```

### 2. Invalid IDs
```bash
curl http://localhost:3001/marketing-cms/blog-posts/invalid-id
# Expected: 404 Not Found
```

### 3. Malformed JSON
```bash
curl -X POST http://localhost:3001/marketing-cms/blog-posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{ invalid json }'
# Expected: 400 Bad Request
```

---

## Integration Testing

### Full Workflow Test

1. **Platform Admin → Database:**
   - Create blog post in Platform Admin UI
   - Verify saved to `marketing_blog_posts` table
   - Check `createdBy`, `createdAt`, `status` fields

2. **Database → Marketing Site:**
   - Query database to get post ID
   - Visit marketing site blog page
   - Verify post appears (if PUBLISHED)
   - Verify draft posts don't appear

3. **Update Flow:**
   - Update post in Platform Admin
   - Check database updated
   - Wait 60s (ISR)
   - Refresh marketing site
   - Verify changes appear

4. **Delete Flow:**
   - Delete post in Platform Admin
   - Verify removed from database
   - Marketing site should no longer show it

---

## Browser Console Testing

### Marketing Site
```javascript
// Open browser console on http://localhost:3000/blog

// Test API fetch
fetch('http://localhost:3001/marketing-cms/blog-posts')
  .then(r => r.json())
  .then(data => console.log('Blog posts:', data));

// Test filtering
const posts = [...]; // from page
const filtered = posts.filter(p => p.category === 'Technology');
console.log('Technology posts:', filtered);
```

### Platform Admin
```javascript
// Open console on http://localhost:5173 (after login)

// Test useMarketingContent hook
// (inspect component state in React DevTools)

// Test API calls
const token = 'YOUR_JWT_TOKEN';
fetch('http://localhost:3001/marketing-cms/blog-posts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Console Test Post',
    slug: 'console-test-post',
    excerpt: 'Testing from browser console with valid excerpt length',
    content: 'This is the full content of the test post from browser console with enough characters to pass validation',
    author: 'Console Tester',
    category: 'Testing',
    tags: ['console', 'test'],
    status: 'DRAFT',
    createdBy: 'user-id'
  })
}).then(r => r.json()).then(console.log);
```

---

## Automated Test Suite (Future)

### E2E Tests (Playwright)
```typescript
// tests/e2e/marketing-cms.spec.ts

test('Admin can create blog post', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.fill('[name="email"]', 'admin@example.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');
  
  await page.goto('http://localhost:5173/marketing-cms');
  await page.click('text=New Blog Post');
  await page.fill('[name="title"]', 'E2E Test Post');
  await page.fill('[name="slug"]', 'e2e-test-post');
  // ... fill other fields
  await page.click('button:has-text("Publish")');
  
  await expect(page.locator('text=Post created')).toBeVisible();
});

test('Published posts appear on marketing site', async ({ page }) => {
  await page.goto('http://localhost:3000/blog');
  await expect(page.locator('article')).toHaveCount(15); // or dynamic
});
```

### Unit Tests (Jest)
```typescript
// services/api/src/marketing-cms/marketing-cms.service.spec.ts

describe('MarketingCmsService', () => {
  it('creates blog post with valid data', async () => {
    const post = await service.createBlogPost({
      title: 'Test Post',
      // ... valid data
    });
    expect(post.id).toBeDefined();
    expect(post.status).toBe('PUBLISHED');
  });

  it('filters only published posts', async () => {
    const posts = await service.getAllBlogPosts();
    expect(posts.every(p => p.status === 'PUBLISHED')).toBe(true);
  });
});
```

---

## Common Issues & Solutions

### Issue: "401 Unauthorized" on write endpoints
**Solution:** Ensure JWT token is included and valid:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" ...
```

### Issue: "400 Bad Request" on create
**Solution:** Check validation errors in response. Common issues:
- Title too short (min 3 chars)
- Content too short (min 50 chars)
- Missing required fields (createdBy, etc.)

### Issue: Blog posts not appearing on marketing site
**Solutions:**
1. Check post status is PUBLISHED (not DRAFT)
2. Wait 60 seconds for ISR revalidation
3. Clear browser cache
4. Check API is running and accessible

### Issue: "Cannot find module" errors
**Solution:** Rebuild shared packages:
```powershell
cd packages/types; pnpm build
cd ../utils; pnpm build
```

### Issue: TypeScript errors after changes
**Solution:** Restart TS Server in VS Code:
- Press `Ctrl+Shift+P`
- Select "TypeScript: Restart TS Server"

---

## Test Checklist

### Authentication ✅
- [ ] GET endpoints work without auth
- [ ] POST/PUT/DELETE require JWT
- [ ] Only super_admin role can write
- [ ] Invalid tokens are rejected

### Validation ✅
- [ ] Title validation (min/max length)
- [ ] Excerpt validation
- [ ] Content validation
- [ ] Status enum validation
- [ ] Required fields enforced

### CRUD Operations ✅
- [ ] Create blog post
- [ ] Read single post
- [ ] Read all posts
- [ ] Update post
- [ ] Delete post
- [ ] (Repeat for 5 other content types)

### Integration ✅
- [ ] Platform Admin saves to database
- [ ] Marketing site fetches from API
- [ ] ISR cache works (60s revalidation)
- [ ] Fallback data works when API down

### Performance ✅
- [ ] API responds < 100ms (cached)
- [ ] Marketing site loads < 2s
- [ ] No N+1 query issues
- [ ] ISR improves performance

### Security ✅
- [ ] SQL injection prevented (Prisma ORM)
- [ ] XSS prevented (React escaping)
- [ ] CSRF tokens (if needed)
- [ ] Rate limiting active

---

## Test Data Examples

### Sample Blog Post (Valid)
```json
{
  "title": "Getting Started with Smart eQuiz Platform",
  "slug": "getting-started-with-smart-equiz",
  "excerpt": "Learn how to set up your first Bible quiz tournament in under 10 minutes",
  "content": "Smart eQuiz Platform makes it easy to organize Bible quiz competitions...",
  "author": "Platform Team",
  "category": "Getting Started",
  "featuredImage": "https://example.com/image.jpg",
  "tags": ["tutorial", "getting-started"],
  "status": "PUBLISHED",
  "createdBy": "admin-user-id"
}
```

### Sample Feature (Valid)
```json
{
  "title": "Real-Time Scoring",
  "description": "Live score updates with instant feedback for all participants",
  "icon": "Zap",
  "category": "Core Features",
  "order": 1,
  "createdBy": "admin-user-id"
}
```

### Sample Testimonial (Valid)
```json
{
  "name": "Pastor John Smith",
  "role": "Youth Pastor",
  "organization": "First Baptist Church",
  "quote": "Smart eQuiz transformed our youth Bible quiz program. Engagement is up 300%!",
  "rating": 5,
  "featured": true,
  "avatar": "https://example.com/avatar.jpg",
  "createdBy": "admin-user-id"
}
```

---

**Test Status:** ✅ All core functionality implemented and ready for testing  
**Next Steps:** Run manual tests, then implement automated test suite

---

*For issues or questions, refer to MARKETING_CMS_COMPLETE.md or SESSION_8_SUMMARY.md*
