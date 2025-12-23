# Smart eQuiz Platform - Blog Posts Loader

$API_URL = "https://smart-equiz-api.onrender.com/api"

Write-Host "=== Smart eQuiz Blog Posts Loader ===" -ForegroundColor Cyan
Write-Host ""

# Authenticate
Write-Host "Step 1: Authenticating..." -ForegroundColor Yellow
$loginBody = @{
    email = "super@admin.com"
    password = "SuperAdmin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
    $token = $loginResponse.access_token
    $CREATED_BY = $loginResponse.user.id
    Write-Host "✅ Authenticated (User ID: $CREATED_BY)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Auth failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

$successCount = 0
$failCount = 0

function Add-BlogPost {
    param(
        [string]$Title,
        [hashtable]$Data
    )
    
    Write-Host "Adding blog post: $Title..." -NoNewline
    
    try {
        $body = $Data | ConvertTo-Json -Depth 10
        $null = Invoke-RestMethod -Uri "$API_URL/marketing-cms/blog-posts" -Method Post -Headers $headers -Body $body
        Write-Host " ✅" -ForegroundColor Green
        $script:successCount++
    } catch {
        Write-Host " ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Gray
        }
        $script:failCount++
    }
}

Write-Host "Step 2: Adding blog posts...`n" -ForegroundColor Yellow

# Blog Post 1: Tournament Tips
Add-BlogPost -Title "5 Tips for Successful Tournaments" -Data @{
    title = "5 Tips for Hosting Successful Bible Quiz Tournaments"
    slug = "5-tips-successful-bible-quiz-tournaments"
    excerpt = "Learn the secrets to running engaging and memorable Bible quiz competitions that participants will love and remember."
    content = @"
# 5 Tips for Hosting Successful Bible Quiz Tournaments

Hosting a Bible quiz tournament can be an exciting and rewarding experience. Here are our top 5 tips to ensure your event is a success:

## 1. Prepare Your Questions in Advance

Start by creating a diverse question bank at least 2 weeks before your tournament. Include questions of varying difficulty levels and cover multiple books or themes.

## 2. Set Clear Rules and Guidelines

Make sure all participants understand the rules before the tournament begins. Provide a printed or digital copy of rules to each team.

## 3. Use Technology to Your Advantage

Platforms like Smart eQuiz can automate scoring, manage brackets, and provide real-time updates to keep everyone engaged.

## 4. Create an Exciting Atmosphere

Music, decorations, and enthusiasm from moderators can make a huge difference in participant engagement.

## 5. Celebrate All Participants

While winners deserve recognition, make sure to celebrate everyone's participation and effort. Consider awards for various categories beyond just first place.

---

Ready to host your next tournament? [Start your free trial](/signup) and experience the difference Smart eQuiz makes!
"@
    author = "Smart eQuiz Team"
    category = "Tips & Best Practices"
    tags = @("tournaments", "tips", "best practices", "hosting")
    featuredImage = "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
    status = "PUBLISHED"
    createdBy = $CREATED_BY
}

# Blog Post 2: Youth Group Benefits
Add-BlogPost -Title "Benefits for Youth Groups" -Data @{
    title = "The Benefits of Bible Quiz Competitions for Youth Groups"
    slug = "benefits-bible-quiz-youth-groups"
    excerpt = "Discover how Bible quiz competitions can strengthen faith, build community, and make scripture study engaging for young people."
    content = @"
# The Benefits of Bible Quiz Competitions for Youth Groups

Bible quiz competitions offer numerous benefits for youth groups beyond just memorizing scripture. Here's why your youth group should consider starting a quiz program:

## Deepens Scripture Knowledge

Regular quiz practice encourages youth to dive deeper into God's Word, moving beyond surface-level reading to true understanding and retention.

## Builds Community

Working together as a team creates bonds and friendships that extend beyond the competition itself.

## Develops Important Skills

Participants develop critical thinking, public speaking, teamwork, and leadership skills that serve them throughout life.

## Makes Learning Fun

The competitive element adds excitement and motivation to scripture study, making it something youth actively look forward to.

## Provides Positive Role Models

Older, experienced quizzers serve as mentors and examples for younger participants, creating a positive peer influence.

## Getting Started

Ready to start a quiz program? Smart eQuiz makes it easy to organize, manage, and host engaging Bible quiz competitions for your youth group.

[Start your free trial today](/signup) and see the difference!
"@
    author = "Sarah Williams"
    category = "Youth Ministry"
    tags = @("youth", "benefits", "education", "community")
    featuredImage = "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80"
    status = "PUBLISHED"
    createdBy = $CREATED_BY
}

# Blog Post 3: Getting Started Guide
Add-BlogPost -Title "Getting Started Guide" -Data @{
    title = "Getting Started with Smart eQuiz: A Complete Guide"
    slug = "getting-started-complete-guide"
    excerpt = "Everything you need to know to set up your organization and start running Bible quiz competitions with Smart eQuiz."
    content = @"
# Getting Started with Smart eQuiz: A Complete Guide

Welcome to Smart eQuiz! This guide will walk you through everything you need to get started with our platform.

## Step 1: Sign Up and Create Your Organization

Visit our [signup page](/signup) and create your organization account. You'll get:
- Your own subdomain (e.g., yourchurch.smartequiz.com)
- 14-day free trial with all features
- Immediate access to the platform

## Step 2: Set Up Your Team

Invite administrators, question managers, and moderators:
1. Go to Team Management
2. Click "Invite Member"
3. Assign appropriate roles
4. They'll receive an email invitation

## Step 3: Build Your Question Bank

Start creating questions:
- Use our AI question generator for quick creation
- Import from CSV/Excel
- Create questions manually
- Organize by books, chapters, and difficulty

## Step 4: Add Participants

Register your quiz participants:
- Individual registration
- Bulk import via CSV
- Self-registration (optional)
- Organize into teams

## Step 5: Create Your First Tournament

Ready to compete? Create a tournament:
1. Set tournament details (name, dates, rules)
2. Select participants/teams
3. Choose tournament format (single elimination, round robin, etc.)
4. Generate bracket or schedule
5. Launch and enjoy!

## Need Help?

Our support team is here to help! Contact us at support@smartequiz.com or use the live chat in your dashboard.

[Start your free trial now](/signup) and see how easy it is!
"@
    author = "Smart eQuiz Team"
    category = "Getting Started"
    tags = @("tutorial", "getting started", "guide", "onboarding")
    featuredImage = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80"
    status = "PUBLISHED"
    createdBy = $CREATED_BY
}

# Blog Post 4: AI Features
Add-BlogPost -Title "AI-Powered Question Generation" -Data @{
    title = "How AI-Powered Question Generation Saves Time and Improves Quality"
    slug = "ai-powered-question-generation"
    excerpt = "Discover how Smart eQuiz's AI technology helps you create high-quality Bible quiz questions in minutes, not hours."
    content = @"
# How AI-Powered Question Generation Saves Time and Improves Quality

Creating engaging, theologically accurate Bible quiz questions can be time-consuming. Our AI-powered question generation changes that.

## What is AI Question Generation?

Smart eQuiz uses advanced AI to automatically generate Bible quiz questions based on:
- Specific passages or chapters
- Difficulty level requirements
- Question types (multiple choice, true/false, short answer)
- Theological accuracy validation

## Benefits of AI Question Generation

### 1. Save Massive Time
Generate 50 questions in 5 minutes instead of 5 hours. Our AI does the heavy lifting while you focus on reviewing and refining.

### 2. Maintain Quality
Every question is:
- Biblically accurate
- Appropriately challenging
- Well-formatted
- Ready to use

### 3. Ensure Variety
The AI generates diverse question types and formats to keep quizzes engaging and test different aspects of knowledge.

### 4. Scale Easily
Whether you need 10 questions or 1,000, AI generation makes it possible without sacrificing quality.

## How It Works

1. Select the Bible passage or chapter
2. Choose your difficulty level
3. Specify question types
4. Review and approve generated questions
5. Add to your question bank

## Human Review is Key

While AI generates the questions, we recommend human review to ensure they match your specific needs and ministry context.

## Try It Today

AI question generation is available on Professional and Enterprise plans. [Upgrade now](/pricing) or [start your free trial](/signup) to experience the difference!
"@
    author = "Dr. James Parker"
    category = "Technology"
    tags = @("AI", "automation", "questions", "technology", "features")
    featuredImage = "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80"
    status = "PUBLISHED"
    createdBy = $CREATED_BY
}

# Blog Post 5: Mobile App Announcement
Add-BlogPost -Title "Mobile App Now Available" -Data @{
    title = "Smart eQuiz Mobile Apps Now Available for iOS and Android"
    slug = "mobile-apps-available"
    excerpt = "Practice anytime, anywhere! Our new mobile apps bring the full Smart eQuiz experience to your smartphone and tablet."
    content = @"
# Smart eQuiz Mobile Apps Now Available for iOS and Android

We're excited to announce the launch of Smart eQuiz mobile apps for iOS and Android!

## What You Can Do

Our mobile apps bring the complete Smart eQuiz experience to your pocket:

### For Participants
- Practice questions anytime, anywhere
- Track your progress and statistics
- Compete in live tournaments
- Review past performance
- Study mode with spaced repetition

### For Administrators
- Monitor live tournaments on the go
- Manage participants and questions
- View real-time analytics
- Respond to support requests
- Get notifications for important events

### For Moderators
- Score matches from your tablet
- Access tournament brackets
- View participant details
- Update scores in real-time

## Key Features

### Offline Mode
Downloaded question sets work offline - perfect for practicing during commutes or in areas with limited connectivity.

### Sync Across Devices
Your progress syncs seamlessly between web and mobile, so you can start on your phone and continue on your computer.

### Push Notifications
Stay informed about upcoming tournaments, practice reminders, and important updates.

### Optimized for Mobile
Native apps provide the best performance and user experience on mobile devices.

## Download Now

Available now on:
- **iOS:** [App Store](https://apps.apple.com/smartequiz) (iOS 14+)
- **Android:** [Google Play](https://play.google.com/smartequiz) (Android 8+)

## All Plans Included

Mobile access is included with all Smart eQuiz plans, including our free trial!

[Start your free trial](/signup) and download the apps today!
"@
    author = "Smart eQuiz Team"
    category = "Product Updates"
    tags = @("mobile", "apps", "iOS", "Android", "announcement")
    featuredImage = "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&q=80"
    status = "PUBLISHED"
    createdBy = $CREATED_BY
}

# Blog Post 6: Security & Privacy
Add-BlogPost -Title "Security and Data Privacy" -Data @{
    title = "How Smart eQuiz Protects Your Organization's Data"
    slug = "security-data-privacy"
    excerpt = "Learn about the security measures and data protection practices that keep your organization's information safe and private."
    content = @"
# How Smart eQuiz Protects Your Organization's Data

Security and data privacy are our top priorities. Here's how we protect your organization's information.

## Enterprise-Grade Security

### Data Encryption
- **At Rest:** AES-256 encryption for all stored data
- **In Transit:** TLS 1.3 for all data transmission
- **Database:** Encrypted backups with secure key management

### Multi-Tenant Isolation
Each organization's data is completely isolated:
- Separate data partitions
- No cross-tenant access
- Database-level security

### Access Controls
- Role-based permissions (9 roles)
- Two-factor authentication (2FA)
- Session management and timeout
- IP whitelisting (Enterprise)

## Data Privacy Compliance

### GDPR Compliant
We follow GDPR requirements:
- Right to access data
- Right to deletion
- Data portability
- Privacy by design
- Consent management

### COPPA Considerations
For organizations with children:
- Parental consent workflows
- Age verification
- Limited data collection
- Secure data handling

## Infrastructure Security

### Cloud Provider
Hosted on industry-leading cloud infrastructure:
- SOC 2 Type II certified
- 99.9% uptime SLA
- DDoS protection
- Automated failover

### Regular Security Audits
- Quarterly penetration testing
- Vulnerability scanning
- Security patch management
- Third-party audits

## Data Backup & Recovery

### Automated Backups
- Daily automated backups
- 30-day retention
- Point-in-time recovery
- Geographic redundancy

### Disaster Recovery
- Recovery Time Objective (RTO): 4 hours
- Recovery Point Objective (RPO): 24 hours
- Tested quarterly

## Your Responsibilities

We recommend organizations:
1. Use strong passwords
2. Enable two-factor authentication
3. Regularly review user access
4. Train team members on security
5. Report suspicious activity

## Questions About Security?

Contact our security team at security@smartequiz.com or review our full [Security Policy](/security-policy).

[Start your free trial](/signup) with confidence!
"@
    author = "David Chen, CISO"
    category = "Security"
    tags = @("security", "privacy", "GDPR", "compliance", "data protection")
    featuredImage = "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80"
    status = "PUBLISHED"
    createdBy = $CREATED_BY
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "✅ Success: $successCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor Red
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "🎉 All blog posts added successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some blog posts failed. Check errors above." -ForegroundColor Yellow
}
