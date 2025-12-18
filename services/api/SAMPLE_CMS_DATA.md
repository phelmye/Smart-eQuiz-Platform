# Sample CMS Data for Swagger UI

Use these JSON payloads in Swagger UI to populate your marketing site with content.

**Access Swagger UI**: https://smart-equiz-api.onrender.com/api/docs

**⚠️ IMPORTANT**: All POST/PUT/DELETE endpoints require SUPER_ADMIN authentication!

---

## 🔐 Step 0: Authenticate First (Required!)

Before adding any content, you **MUST** login to get an access token.

### Login via Swagger UI

1. **Open Swagger UI**: https://smart-equiz-api.onrender.com/api/docs
2. **Find the `auth` section** and expand it
3. **Click `POST /api/auth/login`**
4. **Click "Try it out"**
5. **Paste this JSON** (default super admin credentials from seed):

```json
{
  "email": "super@admin.com",
  "password": "SuperAdmin123!"
}
```

6. **Click "Execute"**
7. **Copy the `accessToken`** from the response (looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

### Authorize Swagger UI

8. **Scroll to top** of Swagger page
9. **Click the "Authorize" button** (padlock icon, top right)
10. **In the dialog, paste:** `Bearer YOUR_ACCESS_TOKEN`
    - Example: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
    - **Important**: Include the word "Bearer" followed by a space!
11. **Click "Authorize"**
12. **Click "Close"**

Now you're authenticated and can use POST endpoints! The lock icons will be closed 🔒.

---

## 1. Hero Section (Homepage Banner)

**Endpoint**: `POST /api/marketing-cms/hero`

Click **Try it out** → Paste this JSON → Click **Execute**

```json
{
  "headline": "Transform Your Church's Bible Quiz Program",
  "subheadline": "The complete SaaS platform for managing tournaments, practice sessions, and competitive championships. Engage youth, track progress, and inspire deeper Scripture study.",
  "ctaPrimaryText": "Start Free Trial",
  "ctaPrimaryUrl": "/signup",
  "ctaSecondaryText": "Watch Demo",
  "ctaSecondaryUrl": "/demo",
  "backgroundImage": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920"
}
```

---

## 2. Testimonials

**Endpoint**: `POST /api/marketing-cms/testimonials`

Add 3-5 testimonials. Run this endpoint **multiple times** with different data:

### Testimonial 1
```json
{
  "name": "Pastor John Smith",
  "role": "Youth Pastor",
  "organization": "First Baptist Church",
  "quote": "Smart eQuiz transformed our youth program. Engagement is up 300% and kids are memorizing Scripture like never before!",
  "rating": 5,
  "featured": true,
  "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=John"
}
```

### Testimonial 2
```json
{
  "name": "Sarah Johnson",
  "role": "Quiz Coordinator",
  "organization": "Grace Community Church",
  "quote": "The best platform for managing Bible quiz tournaments. The reporting features alone saved us 10 hours per month.",
  "rating": 5,
  "featured": true,
  "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
}
```

### Testimonial 3
```json
{
  "name": "Michael Chen",
  "role": "Tournament Director",
  "organization": "City Church Network",
  "quote": "Easy to use, powerful features, and excellent support. We run regional tournaments with 50+ teams effortlessly.",
  "rating": 5,
  "featured": true,
  "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael"
}
```

### Testimonial 4
```json
{
  "name": "Rebecca Martinez",
  "role": "Parent",
  "organization": "Riverside Church",
  "quote": "My daughter went from struggling to quote verses to winning regional competitions. The practice mode is incredible!",
  "rating": 5,
  "featured": false,
  "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=Rebecca"
}
```

### Testimonial 5
```json
{
  "name": "David Thompson",
  "role": "Lead Pastor",
  "organization": "Mountain View Assembly",
  "quote": "Smart eQuiz helped us launch our first Bible quiz program. The onboarding was smooth and kids love it!",
  "rating": 5,
  "featured": false,
  "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=David"
}
```

---

## 3. Pricing Plans

**Endpoint**: `POST /api/marketing-cms/pricing-plans`

Add each plan separately:

### Starter Plan
```json
{
  "name": "Starter",
  "description": "Perfect for small churches getting started",
  "price": 29,
  "interval": "month",
  "currency": "USD",
  "features": [
    "Up to 50 participants",
    "5 tournaments per month",
    "Basic reporting",
    "Email support",
    "Mobile app access",
    "Question bank (500 questions)"
  ],
  "highlighted": false,
  "popular": false,
  "ctaText": "Start Free Trial",
  "ctaUrl": "/signup?plan=starter"
}
```

### Professional Plan (Most Popular)
```json
{
  "name": "Professional",
  "description": "Most popular for growing programs",
  "price": 79,
  "interval": "month",
  "currency": "USD",
  "features": [
    "Up to 200 participants",
    "Unlimited tournaments",
    "Advanced analytics & reporting",
    "Priority support",
    "Mobile app access",
    "Question bank (2000 questions)",
    "Custom branding",
    "Team management",
    "Export data"
  ],
  "highlighted": true,
  "popular": true,
  "ctaText": "Start Free Trial",
  "ctaUrl": "/signup?plan=professional"
}
```

### Enterprise Plan
```json
{
  "name": "Enterprise",
  "description": "For large organizations and networks",
  "price": 199,
  "interval": "month",
  "currency": "USD",
  "features": [
    "Unlimited participants",
    "Unlimited tournaments",
    "White-label solution",
    "Dedicated account manager",
    "API access",
    "Custom integrations",
    "Question bank (5000+ questions)",
    "Multi-location support",
    "SLA guarantee",
    "Training & onboarding"
  ],
  "highlighted": false,
  "popular": false,
  "ctaText": "Contact Sales",
  "ctaUrl": "/contact?plan=enterprise"
}
```

---

## 4. FAQs

**Endpoint**: `POST /api/marketing-cms/faqs`

Add multiple FAQs:

### FAQ 1
```json
{
  "question": "How do I get started with Smart eQuiz?",
  "answer": "Getting started is easy! Sign up for a free 14-day trial, create your organization profile, invite participants, and start creating practice sessions or tournaments. Our setup wizard guides you through each step.",
  "category": "Getting Started",
  "order": 1
}
```

### FAQ 2
```json
{
  "question": "Can I customize questions for my denomination?",
  "answer": "Yes! Professional and Enterprise plans include a custom question builder. You can create questions from any Bible translation, add your own commentary, and organize them by book, chapter, or topic.",
  "category": "Features",
  "order": 2
}
```

### FAQ 3
```json
{
  "question": "Is there a mobile app?",
  "answer": "Yes! Smart eQuiz includes native iOS and Android apps for participants to practice on-the-go. Coordinators can also use the mobile app to manage tournaments and track scores in real-time.",
  "category": "Mobile",
  "order": 3
}
```

### FAQ 4
```json
{
  "question": "How is pricing calculated?",
  "answer": "Pricing is based on the number of active participants in your organization. A participant is anyone who has an account and participates in practice sessions or tournaments. You can upgrade or downgrade anytime.",
  "category": "Billing",
  "order": 4
}
```

### FAQ 5
```json
{
  "question": "What payment methods do you accept?",
  "answer": "We accept all major credit cards (Visa, MasterCard, American Express, Discover) and ACH bank transfers for Enterprise plans. All payments are processed securely through Stripe.",
  "category": "Billing",
  "order": 5
}
```

### FAQ 6
```json
{
  "question": "Can I cancel anytime?",
  "answer": "Yes! There are no long-term contracts. You can cancel your subscription anytime from your account settings. Your data will be available for export for 30 days after cancellation.",
  "category": "Billing",
  "order": 6
}
```

### FAQ 7
```json
{
  "question": "Do you offer training or support?",
  "answer": "All plans include email support and access to our knowledge base. Professional plans get priority support, and Enterprise plans include dedicated account management, live training sessions, and custom onboarding.",
  "category": "Support",
  "order": 7
}
```

### FAQ 8
```json
{
  "question": "Is my data secure?",
  "answer": "Absolutely! We use bank-level encryption (AES-256), all data is transmitted over HTTPS, and we're SOC 2 Type II certified. We perform regular security audits and comply with GDPR and CCPA regulations.",
  "category": "Security",
  "order": 8
}
```

---

## 5. Blog Posts (Optional)

**Endpoint**: `POST /api/marketing-cms/blog-posts`

### Blog Post 1
```json
{
  "title": "10 Tips for Successful Bible Quiz Teams",
  "slug": "10-tips-successful-bible-quiz-teams",
  "excerpt": "Discover proven strategies from top coordinators to build winning Bible quiz teams that love Scripture.",
  "content": "# 10 Tips for Successful Bible Quiz Teams\n\nBuilding a successful Bible quiz team goes beyond memorization...\n\n## 1. Start with Prayer\nEvery practice and tournament should begin with prayer...\n\n## 2. Make It Fun\nIncorporate games and team-building activities...\n\n[Continue with full content]",
  "author": "Sarah Johnson",
  "published": true,
  "publishedAt": "2025-12-01T10:00:00Z",
  "coverImage": "https://images.unsplash.com/photo-1510022079733-8b58aca7c4a9?w=1200",
  "tags": ["tips", "team-building", "best-practices"]
}
```

### Blog Post 2
```json
{
  "title": "How Technology is Transforming Youth Ministry",
  "slug": "technology-transforming-youth-ministry",
  "excerpt": "Explore how digital tools are helping churches engage the next generation with Scripture in meaningful ways.",
  "content": "# How Technology is Transforming Youth Ministry\n\nThe landscape of youth ministry is changing rapidly...\n\nToday's youth are digital natives...",
  "author": "Pastor Michael Chen",
  "published": true,
  "publishedAt": "2025-11-28T14:30:00Z",
  "coverImage": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1200",
  "tags": ["youth-ministry", "technology", "engagement"]
}
```

---

## Step-by-Step Process

### 1. Open Swagger UI
Visit: https://smart-equiz-api.onrender.com/api/docs

### 2. Find the Section
Scroll down to **marketing-cms** section and expand it

### 3. For Each Content Type:

#### Add Hero:
1. Click `POST /api/marketing-cms/hero`
2. Click **Try it out**
3. Paste hero JSON from above
4. Click **Execute**
5. Check response (should show 201 Created)

#### Add Testimonials:
1. Click `POST /api/marketing-cms/testimonials`
2. Click **Try it out**
3. Paste testimonial JSON (one at a time)
4. Click **Execute**
5. Repeat for each testimonial

#### Add Pricing Plans:
1. Click `POST /api/marketing-cms/pricing-plans`
2. Click **Try it out**
3. Paste pricing plan JSON (one at a time)
4. Click **Execute**
5. Repeat for all 3 plans

#### Add FAQs:
1. Click `POST /api/marketing-cms/faqs`
2. Click **Try it out**
3. Paste FAQ JSON (one at a time)
4. Click **Execute**
5. Repeat for each FAQ

---

## Verify Content

### Via API:
- **Get Hero**: `GET /api/marketing-cms/hero`
- **Get Testimonials**: `GET /api/marketing-cms/testimonials`
- **Get Pricing**: `GET /api/marketing-cms/pricing-plans`
- **Get FAQs**: `GET /api/marketing-cms/faqs`
- **Get All**: `GET /api/marketing-cms/all`

### Via Marketing Site:
After adding content and redeploying Vercel:
- Homepage should show your custom hero and testimonials
- /pricing should show your pricing plans
- /faq should show your FAQs

---

## Tips

1. **API Sleeping?** First request may take 15-30 seconds if API hasn't been used recently
2. **Copy Exact JSON**: Don't modify field names, only values
3. **Check Responses**: 201 = success, 400 = validation error, 500 = server error
4. **Update Content**: Use PUT endpoints with the content ID
5. **Delete Content**: Use DELETE endpoints with the content ID

---

## Troubleshooting

### 401 Unauthorized
**You forgot to authenticate!** Go back to Step 0 and login, then click "Authorize" button with your token.

### 403 Forbidden  
Your user doesn't have SUPER_ADMIN role. Make sure you logged in with `super@admin.com`.

### 400 Bad Request
Check JSON syntax - missing comma, extra quote, etc.

### 500 Internal Server Error
Check Render logs for details or try again (might be temporary)

### No Data Showing on Site
1. Verify content was created (GET endpoint)
2. Check NEXT_PUBLIC_API_URL is set in Vercel
3. Redeploy marketing site
4. Clear browser cache

### "Authorize" Button Not Working
Make sure you include "Bearer " (with space) before the token:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## ⚠️ Important Notes

1. **Authentication Required**: Unlike the sample data guide suggested earlier, you CANNOT add content without authentication
2. **SUPER_ADMIN Only**: Only the super admin user can create/edit marketing CMS content
3. **Token Expiration**: Access tokens expire after 15 minutes. If you get 401 errors, login again
4. **Database Must Be Seeded**: The super admin user (`super@admin.com`) must exist in the database
5. **First Time Setup**: If database is empty, you may need to run migrations and seed script on Render

---

## Alternative: Seed Script on Render

If you want to populate the database programmatically instead of using Swagger:

1. Go to Render Dashboard → Your API service
2. Click "Shell" tab (or connect via SSH)
3. Run:
   ```bash
   node prisma/seed.js
   ```

This will create:
- Super admin user
- Demo tenant
- Sample categories
- Sample questions
- (Optionally modify seed.js to include CMS content)

---

## Quick Test

To quickly test if API is working:

1. Open: https://smart-equiz-api.onrender.com/api/marketing-cms/all
2. Should return JSON with hero, testimonials, pricing, faqs
3. If empty `{}`, no content added yet
4. If data exists, it will show all content

Good luck! 🚀
