# Marketing Site Setup & Testing Guide

## 🎨 1. Fix Logo Not Visible

The logo exists at `/public/logo.svg` but may need configuration. Let's ensure it works:

### Quick Fix Option 1: Use PNG Instead

1. Convert your logo to PNG format
2. Place it in `apps/marketing-site/public/logo.png`
3. Update config:

```typescript
// apps/marketing-site/src/lib/marketingConfig.ts
logoUrl: '/logo.png',  // Change from .svg to .png
```

### Quick Fix Option 2: Verify SVG Configuration

The `unoptimized` prop should work. If logo still doesn't show:

1. Check browser console (F12) for errors
2. Try accessing directly: `https://your-site.vercel.app/logo.svg`
3. If 404, the logo file wasn't included in build

### Deployment Fix

Redeploy marketing site to ensure latest logo fix is live:

```powershell
# In Vercel dashboard:
# 1. Go to marketing-site project
# 2. Click "Deployments" tab
# 3. Click "Redeploy" on latest deployment
```

---

## 🔍 2. Verify CMS Content is Working Dynamically

### Step 1: Check Current Status

Open marketing site and check these pages:

```
https://www.smartequiz.com (or your Vercel URL)
https://www.smartequiz.com/features
https://www.smartequiz.com/pricing
https://www.smartequiz.com/faq
https://www.smartequiz.com/blog
```

**What you'll see:**
- ❌ **Empty sections** = CMS not populated yet (expected)
- ✅ **Static content** = Fallback data from code
- ✅ **Dynamic content** = CMS working!

### Step 2: Add CMS Content via Swagger UI

To populate dynamic content:

1. **Go to Swagger UI:**
   ```
   https://api.smartequiz.com/api/docs
   (or https://smart-equiz-api.onrender.com/api/docs)
   ```

2. **Login First (Required!):**
   - Find section: **auth** → `POST /api/auth/login`
   - Click "Try it out"
   - Enter credentials:
     ```json
     {
       "email": "super@admin.com",
       "password": "SuperAdmin123!"
     }
     ```
   - Click "Execute"
   - Copy the `accessToken` from response

3. **Authorize:**
   - Click the **"Authorize"** button (top right, padlock icon)
   - Enter: `Bearer YOUR_ACCESS_TOKEN` (include "Bearer " with space)
   - Click "Authorize" then "Close"

4. **Add Hero Section:**
   - Find: **marketing-cms** → `POST /api/marketing-cms/hero`
   - Click "Try it out"
   - Paste this JSON:
     ```json
     {
       "headline": "Transform Your Bible Quiz Competitions",
       "subheadline": "The complete platform for organizing, managing, and hosting engaging Bible quiz tournaments",
       "ctaPrimaryText": "Start Free Trial",
       "ctaPrimaryLink": "/signup",
       "ctaSecondaryText": "Watch Demo",
       "ctaSecondaryLink": "/demo",
       "backgroundImage": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200",
       "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"
     }
     ```
   - Click "Execute"
   - Should return 201 Created

5. **Add Testimonials:**
   - Find: `POST /api/marketing-cms/testimonials`
   - Click "Try it out"
   - Paste:
     ```json
     {
       "author": "Pastor John Smith",
       "role": "Youth Director",
       "organization": "First Baptist Church",
       "content": "Smart eQuiz has transformed how we run our Bible quiz competitions. The platform is intuitive and the kids love it!",
       "rating": 5,
       "image": "https://i.pravatar.cc/150?img=12"
     }
     ```
   - Click "Execute"

6. **Add Pricing Plan:**
   - Find: `POST /api/marketing-cms/pricing-plans`
   - Click "Try it out"
   - Paste:
     ```json
     {
       "name": "Starter",
       "description": "Perfect for small churches and youth groups",
       "price": 29,
       "currency": "USD",
       "interval": "month",
       "features": [
         "Up to 50 participants",
         "Unlimited tournaments",
         "Basic analytics",
         "Email support"
       ],
       "isPopular": false,
       "ctaText": "Get Started",
       "ctaLink": "/signup?plan=starter"
     }
     ```
   - Click "Execute"

7. **Add FAQ:**
   - Find: `POST /api/marketing-cms/faqs`
   - Click "Try it out"
   - Paste:
     ```json
     {
       "category": "General",
       "question": "How does Smart eQuiz work?",
       "answer": "Smart eQuiz is a cloud-based platform that allows you to create, manage, and host Bible quiz competitions. Simply sign up, create your tournament, invite participants, and start quizzing!",
       "order": 1
     }
     ```
   - Click "Execute"

8. **Add Blog Post:**
   - Find: `POST /api/marketing-cms/blog-posts`
   - Click "Try it out"
   - Paste:
     ```json
     {
       "title": "5 Tips for Hosting Successful Bible Quiz Tournaments",
       "slug": "5-tips-successful-bible-quiz",
       "excerpt": "Learn the secrets to running engaging and memorable Bible quiz competitions that participants will love.",
       "content": "# 5 Tips for Hosting Successful Bible Quiz Tournaments\n\n## 1. Prepare Your Questions in Advance\n\nStart by creating a diverse question bank...\n\n## 2. Set Clear Rules\n\nMake sure all participants understand the rules...",
       "author": "Admin Team",
       "category": "Tips & Tricks",
       "tags": ["tournaments", "tips", "best practices"],
       "featuredImage": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800",
       "published": true
     }
     ```
   - Click "Execute"

### Step 3: Verify Dynamic Content

After adding content:

1. **Refresh marketing site pages**
2. **Check if content appears:**
   - Homepage should show your hero headline
   - Pricing page should show your pricing plan
   - FAQ page should show your question
   - Blog page should show your post

3. **Browser DevTools Check:**
   - Open browser console (F12)
   - Go to Network tab
   - Refresh page
   - Look for API calls to:
     - `https://api.smartequiz.com/api/marketing-cms/hero`
     - `https://api.smartequiz.com/api/marketing-cms/testimonials`
     - etc.
   - Should return 200 OK with your content

**If content still not showing:**
- Check CORS errors in console (we already fixed this)
- Verify API_URL environment variable in Vercel:
  ```
  NEXT_PUBLIC_API_URL=https://api.smartequiz.com
  ```
- Redeploy marketing site

---

## 🔐 3. Login to Platform Admin

### Admin Credentials

Use the super admin account created during database seeding:

```
Email: super@admin.com
Password: SuperAdmin123!
```

### Login Steps

1. **Go to Platform Admin:**
   ```
   https://admin.smartequiz.com
   (or your platform-admin Vercel URL)
   ```

2. **Enter credentials:**
   - Email: `super@admin.com`
   - Password: `SuperAdmin123!`

3. **Click "Sign In"**

### What You Can Do in Platform Admin

- **View all tenants** across the platform
- **Create new tenants** (organizations/churches)
- **Manage platform-wide settings**
- **View analytics** across all tenants
- **Manage super admin users**

### Create a Test Tenant

Once logged in as super admin:

1. Go to "Tenants" section
2. Click "Add New Tenant"
3. Fill in details:
   ```
   Organization Name: Demo Church
   Subdomain: demo (will be demo.smartequiz.com)
   Admin Email: admin@demochurch.com
   Admin Password: Demo123!
   Plan: Pro
   ```
4. Click "Create Tenant"

Now you can access the tenant at:
```
https://demo.smartequiz.com
Login: admin@demochurch.com / Demo123!
```

---

## 📺 4. Create Demo Content (What Users See Before Subscribing)

You have several options for demo content:

### Option A: Landing Page Demo Section (Easiest)

Edit the marketing site directly to show what users will see:

**File:** `apps/marketing-site/src/app/demo/page.tsx`

This page shows:
- Video walkthrough
- Feature highlights
- Screenshot carousel
- Try it now button

**To customize:**
1. Add real screenshots to `/public/images/demo/`
2. Update video URL
3. Modify feature list
4. Update call-to-action links

### Option B: Interactive Demo via Tenant Landing Page

Each tenant can customize their public landing page:

1. **Login as tenant admin** (e.g., demo.smartequiz.com)
2. **Go to:** Settings → Landing Page
3. **Customize:**
   - Hero section (headline, subheadline, CTA)
   - About section
   - Features showcase
   - Testimonials
   - Gallery/media
   - Contact information

This creates a public page at:
```
https://demo.smartequiz.com/landing
```

Users can see this BEFORE subscribing or logging in.

### Option C: Create Demo Tenant with Sample Data

Create a publicly accessible "demo" tenant:

1. **Login to platform-admin** as super admin
2. **Create tenant:**
   - Subdomain: `demo`
   - Organization: "Demo Church"
   - Enable "Public Access" mode

3. **Populate with sample data:**
   - Create sample tournament
   - Add sample questions
   - Add sample teams
   - Add sample participants

4. **Make it read-only** so users can browse but not modify

5. **Link from marketing site:**
   ```html
   <a href="https://demo.smartequiz.com">
     Try Live Demo
   </a>
   ```

### Option D: Video Demo + Screenshots

Create marketing assets:

1. **Record a video walkthrough:**
   - Screen recording of creating a tournament
   - Hosting a live quiz
   - Viewing results

2. **Upload to YouTube:**
   - Make it public or unlisted
   - Get embed link

3. **Add to marketing site:**
   ```typescript
   // In apps/marketing-site/src/app/demo/page.tsx
   const demoVideo = "https://www.youtube.com/embed/YOUR_VIDEO_ID";
   ```

4. **Take screenshots:**
   - Dashboard
   - Tournament builder
   - Live match
   - Results page

5. **Add to marketing site** in demo page

### Recommended Approach

**Combine Options B + D:**

1. **Create interactive demo tenant:**
   - URL: `https://demo.smartequiz.com/landing`
   - Customized public landing page
   - Sample tournament visible to public
   - "Try It Yourself" button → leads to login

2. **Add video walkthrough:**
   - On marketing site demo page
   - Shows full features
   - Professional narration

3. **Add screenshots carousel:**
   - Key features highlighted
   - Before/after scenarios
   - Success stories

---

## 🎯 Next Steps Checklist

### Immediate Actions:

- [ ] **Fix logo:** Redeploy marketing site or convert to PNG
- [ ] **Add CMS content:** Use Swagger UI with super admin credentials
- [ ] **Test CMS:** Verify content appears on marketing site
- [ ] **Login to platform-admin:** Use super@admin.com
- [ ] **Create demo tenant:** For testing and public demo
- [ ] **Customize tenant landing:** Add sample content
- [ ] **Record demo video:** Walkthrough of features
- [ ] **Take screenshots:** Key features and workflows

### Verification Commands:

```powershell
# Test API health
curl https://api.smartequiz.com/api/health

# Test CMS endpoint
curl https://api.smartequiz.com/api/marketing-cms/hero

# Check DNS propagation
nslookup www.smartequiz.com
nslookup admin.smartequiz.com
nslookup demo.smartequiz.com

# Flush local DNS
ipconfig /flushdns
```

---

## 📄 Files Reference

**For detailed CMS content examples:**
- `services/api/SAMPLE_CMS_DATA.md`

**For DNS configuration:**
- `DNS_CONFIGURATION_GO54.md`

**For deployment guide:**
- `COMPLETE_DEPLOYMENT_GUIDE.md`

All guides are in your project root directory!
