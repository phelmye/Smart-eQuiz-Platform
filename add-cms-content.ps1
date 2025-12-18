# PowerShell Script to Add CMS Content to Smart eQuiz Platform
# Run this after logging in as super@admin.com

$API_URL = "https://smart-equiz-api.onrender.com/api"

Write-Host "`n=== Smart eQuiz Platform - CMS Content Seeder ===" -ForegroundColor Cyan
Write-Host "This script will add all CMS content to your platform.`n" -ForegroundColor White

# Step 1: Login to get access token
Write-Host "Step 1: Logging in as super admin..." -ForegroundColor Yellow
$loginBody = @{
    email = "super@admin.com"
    password = "SuperAdmin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$API_URL/auth/login" -Method Post -ContentType "application/json" -Body $loginBody
    $token = $loginResponse.access_token
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "   User: $($loginResponse.user.email)" -ForegroundColor Gray
    Write-Host "   Role: $($loginResponse.user.role)`n" -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Headers with authorization
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

# Counter for success/failure
$successCount = 0
$failCount = 0

# Function to add content
function Add-Content {
    param(
        [string]$Type,
        [string]$Name,
        [hashtable]$Data
    )
    
    Write-Host "Adding $Type`: $Name..." -ForegroundColor Yellow -NoNewline
    
    try {
        $body = $Data | ConvertTo-Json -Depth 10
        $response = Invoke-RestMethod -Uri "$API_URL/marketing-cms/$Type" -Method Post -Headers $headers -Body $body
        Write-Host " ✅" -ForegroundColor Green
        $script:successCount++
    } catch {
        Write-Host " ❌ $($_.Exception.Message)" -ForegroundColor Red
        $script:failCount++
    }
}

Write-Host "Step 2: Adding CMS content...`n" -ForegroundColor Yellow

# 1. Hero Section
Add-Content -Type "hero" -Name "Main Hero" -Data @{
    title = "Transform Your Bible Quiz Ministry"
    subtitle = "Empower your church or organization with our comprehensive Bible quiz competition platform"
    ctaPrimaryText = "Start Free Trial"
    ctaPrimaryUrl = "/signup"
    ctaSecondaryText = "Watch Demo"
    ctaSecondaryUrl = "/demo"
    backgroundImage = "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=1920"
    isActive = $true
}

# 2. Testimonials
Add-Content -Type "testimonials" -Name "Pastor John Smith" -Data @{
    name = "Pastor John Smith"
    role = "Lead Pastor"
    organization = "First Baptist Church"
    content = "Smart eQuiz has revolutionized our youth Bible quiz program. The platform is intuitive and our participants love it!"
    rating = 5
    avatar = "https://i.pravatar.cc/150?img=12"
    isActive = $true
}

Add-Content -Type "testimonials" -Name "Sarah Johnson" -Data @{
    name = "Sarah Johnson"
    role = "Youth Director"
    organization = "Grace Community Church"
    content = "Managing tournaments has never been easier. The real-time scoring and analytics are game-changers."
    rating = 5
    avatar = "https://i.pravatar.cc/150?img=45"
    isActive = $true
}

Add-Content -Type "testimonials" -Name "Michael Chen" -Data @{
    name = "Michael Chen"
    role = "Quiz Coordinator"
    organization = "City Bible Fellowship"
    content = "The multi-currency support and customization options make this perfect for our international ministry."
    rating = 5
    avatar = "https://i.pravatar.cc/150?img=33"
    isActive = $true
}

# 3. Pricing Plans
Add-Content -Type "pricing-plans" -Name "Starter" -Data @{
    name = "Starter"
    description = "Perfect for small churches and ministries"
    price = 29
    currency = "USD"
    interval = "month"
    features = @(
        "Up to 50 participants"
        "Basic question bank"
        "Tournament management"
        "Email support"
        "Mobile app access"
    )
    isPopular = $false
    isActive = $true
    ctaText = "Start Free Trial"
    ctaUrl = "/signup?plan=starter"
}

Add-Content -Type "pricing-plans" -Name "Professional" -Data @{
    name = "Professional"
    description = "For growing organizations"
    price = 99
    currency = "USD"
    interval = "month"
    features = @(
        "Up to 500 participants"
        "Advanced question bank"
        "Custom branding"
        "Analytics dashboard"
        "Priority support"
        "API access"
        "Custom domains"
    )
    isPopular = $true
    isActive = $true
    ctaText = "Start Free Trial"
    ctaUrl = "/signup?plan=professional"
}

Add-Content -Type "pricing-plans" -Name "Enterprise" -Data @{
    name = "Enterprise"
    description = "For large organizations"
    price = 299
    currency = "USD"
    interval = "month"
    features = @(
        "Unlimited participants"
        "Custom development"
        "Dedicated support"
        "SLA guarantee"
        "White-label option"
        "Advanced security"
        "Training sessions"
    )
    isPopular = $false
    isActive = $true
    ctaText = "Contact Sales"
    ctaUrl = "/contact"
}

# 4. FAQs
Add-Content -Type "faqs" -Name "What is Smart eQuiz?" -Data @{
    question = "What is Smart eQuiz?"
    answer = "Smart eQuiz is a comprehensive SaaS platform designed for Bible quiz competitions. It provides tools for managing participants, questions, tournaments, and real-time scoring."
    category = "General"
    order = 1
    isActive = $true
}

Add-Content -Type "faqs" -Name "How does the free trial work?" -Data @{
    question = "How does the free trial work?"
    answer = "You get 14 days of full access to all features with no credit card required. After the trial, choose a plan that fits your needs or continue with our free tier."
    category = "Billing"
    order = 2
    isActive = $true
}

Add-Content -Type "faqs" -Name "Can I customize the platform?" -Data @{
    question = "Can I customize the platform for my organization?"
    answer = "Yes! Professional and Enterprise plans include custom branding, domain configuration, and the ability to customize the look and feel to match your organization."
    category = "Features"
    order = 3
    isActive = $true
}

Add-Content -Type "faqs" -Name "Is there a mobile app?" -Data @{
    question = "Is there a mobile app?"
    answer = "Yes! We provide native mobile apps for both iOS and Android, allowing participants to practice and compete from anywhere."
    category = "Features"
    order = 4
    isActive = $true
}

Add-Content -Type "faqs" -Name "What payment methods do you accept?" -Data @{
    question = "What payment methods do you accept?"
    answer = "We accept all major credit cards, debit cards, and support multiple currencies including USD, EUR, GBP, and more through our Stripe integration."
    category = "Billing"
    order = 5
    isActive = $true
}

# 5. Features
Add-Content -Type "features" -Name "Question Bank Management" -Data @{
    title = "Comprehensive Question Bank"
    description = "Create, organize, and manage thousands of Bible quiz questions with our intuitive question bank system"
    icon = "BookOpen"
    category = "Core Features"
    order = 1
    isActive = $true
}

Add-Content -Type "features" -Name "Tournament System" -Data @{
    title = "Advanced Tournament Management"
    description = "Run single or multi-round tournaments with automatic bracket generation, real-time scoring, and live leaderboards"
    icon = "Trophy"
    category = "Core Features"
    order = 2
    isActive = $true
}

Add-Content -Type "features" -Name "Analytics Dashboard" -Data @{
    title = "Powerful Analytics"
    description = "Track participant progress, question difficulty, tournament statistics, and engagement metrics with beautiful visualizations"
    icon = "BarChart"
    category = "Analytics"
    order = 3
    isActive = $true
}

# 6. Blog Posts
Add-Content -Type "blog-posts" -Name "Getting Started Guide" -Data @{
    title = "Getting Started with Smart eQuiz: A Complete Guide"
    slug = "getting-started-guide"
    excerpt = "Learn how to set up your organization, create questions, and run your first Bible quiz tournament"
    content = "Welcome to Smart eQuiz! This comprehensive guide will walk you through everything you need to know..."
    author = "Smart eQuiz Team"
    category = "Tutorials"
    tags = @("getting-started", "tutorial", "basics")
    featuredImage = "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200"
    isPublished = $true
    publishedAt = (Get-Date).AddDays(-7).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

Add-Content -Type "blog-posts" -Name "Best Practices" -Data @{
    title = "10 Best Practices for Running Engaging Bible Quiz Tournaments"
    slug = "tournament-best-practices"
    excerpt = "Discover proven strategies to make your Bible quiz competitions more engaging and impactful"
    content = "Running a successful Bible quiz tournament requires more than just great questions..."
    author = "Sarah Mitchell"
    category = "Tips & Tricks"
    tags = @("tournaments", "best-practices", "engagement")
    featuredImage = "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1200"
    isPublished = $true
    publishedAt = (Get-Date).AddDays(-14).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

# Summary
Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "✅ Successfully added: $successCount items" -ForegroundColor Green
Write-Host "❌ Failed to add: $failCount items" -ForegroundColor Red
Write-Host "`nTotal: $($successCount + $failCount) CMS items processed`n" -ForegroundColor White

if ($successCount -gt 0) {
    Write-Host "🎉 CMS content has been added to your platform!" -ForegroundColor Green
    Write-Host "Visit your marketing site to see the changes." -ForegroundColor White
    Write-Host "`nNote: You may need to redeploy the marketing site on Vercel" -ForegroundColor Yellow
    Write-Host "for the changes to appear (or wait for cache to clear).`n" -ForegroundColor Yellow
}
