# CMS Content - Ready to Add via Swagger UI

After authorizing in Swagger UI, use these JSON payloads to populate your marketing site.

---

## 1. Hero Section (Homepage Banner)

**Endpoint:** `POST /api/marketing-cms/hero`

```json
{
  "headline": "Transform Your Bible Quiz Competitions",
  "subheadline": "The complete cloud platform for organizing, managing, and hosting engaging Bible quiz tournaments for churches and schools",
  "ctaPrimaryText": "Start Free Trial",
  "ctaPrimaryLink": "/signup",
  "ctaSecondaryText": "Watch Demo",
  "ctaSecondaryLink": "/demo",
  "backgroundImage": "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&q=80",
  "videoUrl": null
}
```

---

## 2. Testimonials (3 Examples)

**Endpoint:** `POST /api/marketing-cms/testimonials`

### Testimonial 1:
```json
{
  "author": "Pastor Michael Johnson",
  "role": "Youth Director",
  "organization": "Grace Community Church",
  "content": "Smart eQuiz has completely transformed how we run our youth Bible quiz competitions. The platform is intuitive, the kids are more engaged, and managing tournaments is now effortless. Highly recommended!",
  "rating": 5,
  "image": "https://i.pravatar.cc/150?img=12"
}
```

### Testimonial 2:
```json
{
  "author": "Sarah Martinez",
  "role": "Bible Study Coordinator",
  "organization": "St. Paul's Methodist",
  "content": "We've been using Smart eQuiz for 6 months and couldn't be happier. The reporting features help us track progress, and the live match feature makes our tournaments exciting!",
  "rating": 5,
  "image": "https://i.pravatar.cc/150?img=5"
}
```

### Testimonial 3:
```json
{
  "author": "David Chen",
  "role": "Principal",
  "organization": "Faith Christian Academy",
  "content": "As a school administrator, I appreciate the detailed analytics and easy participant management. Smart eQuiz has helped us build a thriving Bible quiz program.",
  "rating": 5,
  "image": "https://i.pravatar.cc/150?img=33"
}
```

---

## 3. Pricing Plans (3 Tiers)

**Endpoint:** `POST /api/marketing-cms/pricing-plans`

### Starter Plan:
```json
{
  "name": "Starter",
  "description": "Perfect for small churches and youth groups getting started",
  "price": 29,
  "currency": "USD",
  "interval": "month",
  "features": [
    "Up to 50 participants",
    "Unlimited tournaments",
    "Basic analytics",
    "Email support",
    "Question bank access",
    "Live match mode"
  ],
  "isPopular": false,
  "ctaText": "Get Started",
  "ctaLink": "/signup?plan=starter"
}
```

### Pro Plan:
```json
{
  "name": "Pro",
  "description": "For growing organizations with advanced needs",
  "price": 79,
  "currency": "USD",
  "interval": "month",
  "features": [
    "Up to 200 participants",
    "Unlimited tournaments",
    "Advanced analytics & reports",
    "Priority support",
    "Custom question creation",
    "Live streaming integration",
    "Team management",
    "Custom branding"
  ],
  "isPopular": true,
  "ctaText": "Start Pro Trial",
  "ctaLink": "/signup?plan=pro"
}
```

### Enterprise Plan:
```json
{
  "name": "Enterprise",
  "description": "For large organizations and multi-site deployments",
  "price": 199,
  "currency": "USD",
  "interval": "month",
  "features": [
    "Unlimited participants",
    "Unlimited tournaments",
    "White-label solution",
    "Dedicated account manager",
    "Custom integrations",
    "SLA guarantee",
    "Training & onboarding",
    "Multi-tenant support"
  ],
  "isPopular": false,
  "ctaText": "Contact Sales",
  "ctaLink": "/contact?plan=enterprise"
}
```

---

## 4. FAQs (5 Common Questions)

**Endpoint:** `POST /api/marketing-cms/faqs`

### FAQ 1:
```json
{
  "category": "General",
  "question": "How does Smart eQuiz work?",
  "answer": "Smart eQuiz is a cloud-based platform that allows you to create, manage, and host Bible quiz competitions. Simply sign up, create your tournament, invite participants, and start quizzing! Our platform handles everything from question management to live scoring.",
  "order": 1
}
```

### FAQ 2:
```json
{
  "category": "Pricing",
  "question": "Is there a free trial?",
  "answer": "Yes! We offer a 14-day free trial on all plans. No credit card required to start. You can test all features and decide which plan works best for your organization.",
  "order": 2
}
```

### FAQ 3:
```json
{
  "category": "Features",
  "question": "Can I create my own questions?",
  "answer": "Absolutely! Pro and Enterprise plans include custom question creation. You can build your own question banks, categorize by topic, difficulty level, and scripture reference. We also provide a pre-built question library to get you started.",
  "order": 3
}
```

### FAQ 4:
```json
{
  "category": "Technical",
  "question": "What devices are supported?",
  "answer": "Smart eQuiz works on all modern devices including desktop computers, laptops, tablets, and smartphones. Participants can join from any device with a web browser - no app installation required!",
  "order": 4
}
```

### FAQ 5:
```json
{
  "category": "Support",
  "question": "What kind of support do you provide?",
  "answer": "We offer email support for Starter plans, priority support for Pro plans, and dedicated account management for Enterprise customers. Our help center includes video tutorials, documentation, and best practices guides.",
  "order": 5
}
```

---

## 5. Features (3 Key Features)

**Endpoint:** `POST /api/marketing-cms/features`

### Feature 1:
```json
{
  "title": "Tournament Management",
  "description": "Create and manage tournaments with ease. Set up brackets, schedule rounds, and track progress in real-time.",
  "icon": "trophy",
  "order": 1,
  "category": "Core Features"
}
```

### Feature 2:
```json
{
  "title": "Live Quiz Mode",
  "description": "Host exciting live quiz sessions with real-time scoring, leaderboards, and instant feedback for participants.",
  "icon": "zap",
  "order": 2,
  "category": "Core Features"
}
```

### Feature 3:
```json
{
  "title": "Analytics & Reports",
  "description": "Gain insights with detailed analytics, performance reports, and participant progress tracking to improve your program.",
  "icon": "chart",
  "order": 3,
  "category": "Core Features"
}
```

---

## 6. Blog Posts (2 Examples)

**Endpoint:** `POST /api/marketing-cms/blog-posts`

### Blog Post 1:
```json
{
  "title": "5 Tips for Hosting Successful Bible Quiz Tournaments",
  "slug": "5-tips-successful-bible-quiz-tournaments",
  "excerpt": "Learn the secrets to running engaging and memorable Bible quiz competitions that participants will love and remember.",
  "content": "# 5 Tips for Hosting Successful Bible Quiz Tournaments\n\nHosting a Bible quiz tournament can be an exciting and rewarding experience. Here are our top 5 tips to ensure your event is a success:\n\n## 1. Prepare Your Questions in Advance\n\nStart by creating a diverse question bank at least 2 weeks before your tournament. Include questions of varying difficulty levels and cover multiple books or themes.\n\n## 2. Set Clear Rules and Guidelines\n\nMake sure all participants understand the rules before the tournament begins. Provide a printed or digital copy of rules to each team.\n\n## 3. Use Technology to Your Advantage\n\nPlatforms like Smart eQuiz can automate scoring, manage brackets, and provide real-time updates to keep everyone engaged.\n\n## 4. Create an Exciting Atmosphere\n\nMusic, decorations, and enthusiasm from moderators can make a huge difference in participant engagement.\n\n## 5. Celebrate All Participants\n\nWhile winners deserve recognition, make sure to celebrate everyone's participation and effort. Consider awards for various categories beyond just first place.",
  "author": "Smart eQuiz Team",
  "category": "Tips & Best Practices",
  "tags": ["tournaments", "tips", "best practices", "hosting"],
  "featuredImage": "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80",
  "published": true
}
```

### Blog Post 2:
```json
{
  "title": "The Benefits of Bible Quiz Competitions for Youth Groups",
  "slug": "benefits-bible-quiz-youth-groups",
  "excerpt": "Discover how Bible quiz competitions can strengthen faith, build community, and make scripture study engaging for young people.",
  "content": "# The Benefits of Bible Quiz Competitions for Youth Groups\n\nBible quiz competitions offer numerous benefits for youth groups beyond just memorizing scripture. Here's why your youth group should consider starting a quiz program:\n\n## Deepens Scripture Knowledge\n\nRegular quiz practice encourages youth to dive deeper into God's Word, moving beyond surface-level reading to true understanding and retention.\n\n## Builds Community\n\nWorking together as a team creates bonds and friendships that extend beyond the competition itself.\n\n## Develops Important Skills\n\nParticipants develop critical thinking, public speaking, teamwork, and leadership skills that serve them throughout life.\n\n## Makes Learning Fun\n\nThe competitive element adds excitement and motivation to scripture study, making it something youth actively look forward to.\n\n## Provides Positive Role Models\n\nOlder, experienced quizzers serve as mentors and examples for younger participants, creating a positive peer influence.\n\n## Getting Started\n\nReady to start a quiz program? Smart eQuiz makes it easy to organize, manage, and host engaging Bible quiz competitions for your youth group.",
  "author": "Sarah Williams",
  "category": "Youth Ministry",
  "tags": ["youth", "benefits", "education", "community"],
  "featuredImage": "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
  "published": true
}
```

---

## Quick Copy-Paste Guide

**To add each item:**

1. Find the section in Swagger UI (e.g., "marketing-cms")
2. Find the POST endpoint (e.g., `POST /api/marketing-cms/hero`)
3. Click "Try it out"
4. Copy the JSON from above
5. Paste into the request body
6. Click "Execute"
7. Verify 201 Created response

**Repeat for all items above to populate your marketing site!**

---

## Verify Content is Live

After adding all content, check these pages:

- **Homepage:** https://your-site.vercel.app
  - Should show hero section with your headline
  
- **Pricing:** https://your-site.vercel.app/pricing
  - Should show 3 pricing tiers
  
- **FAQ:** https://your-site.vercel.app/faq
  - Should show 5 questions
  
- **Blog:** https://your-site.vercel.app/blog
  - Should show 2 blog posts

If content doesn't appear:
- Check browser console for errors
- Verify NEXT_PUBLIC_API_URL environment variable
- Redeploy marketing site
