# Smart eQuiz Platform - Marketing CMS Content Loader (CORRECTED)
# This script populates the Marketing CMS with proper DTO field mappings

$API_URL = "https://smart-equiz-api.onrender.com/api"

Write-Host "=== Smart eQuiz Marketing CMS Content Loader (FIXED) ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Authenticate
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

function Add-Content {
    param(
        [string]$Type,
        [string]$Name,
        [hashtable]$Data
    )
    
    Write-Host "Adding $Type`: $Name..." -NoNewline
    
    try {
        $body = $Data | ConvertTo-Json -Depth 10
        $null = Invoke-RestMethod -Uri "$API_URL/marketing-cms/$Type" -Method Post -Headers $headers -Body $body
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

Write-Host "Step 2: Adding content...`n" -ForegroundColor Yellow

# HERO SECTION (Using correct DTO fields)
# Required: headline, subheadline, ctaPrimary, ctaPrimaryLink, createdBy
# Optional: ctaSecondary, ctaSecondaryLink, backgroundImage, videoUrl
Add-Content -Type "hero" -Name "Main Hero" -Data @{
    headline = "Transform Your Bible Quiz Ministry"
    subheadline = "Empower your church or organization with our comprehensive Bible quiz competition platform. Manage participants, create questions, run tournaments, and track progress with real-time analytics."
    ctaPrimary = "Start Free Trial"
    ctaPrimaryLink = "/signup"
    ctaSecondary = "Watch Demo"
    ctaSecondaryLink = "/demo"
    backgroundImage = "https://images.unsplash.com/photo-1519491050282-cf00c82424b4?w=1920"
    createdBy = $CREATED_BY
}

# FEATURES (Using correct DTO fields)
# Required: title, description, icon, category, createdBy
# Optional: order
Add-Content -Type "features" -Name "Real-Time Scoring" -Data @{
    title = "Real-Time Scoring"
    description = "Track scores instantly with our live scoring system. Participants, moderators, and spectators see updates in real-time during competitions."
    icon = "Activity"
    category = "Competition"
    order = 1
    createdBy = $CREATED_BY
}

Add-Content -Type "features" -Name "AI Question Generation" -Data @{
    title = "AI Question Generation"
    description = "Generate high-quality Bible questions automatically using advanced AI. Save time while maintaining theological accuracy and appropriate difficulty levels."
    icon = "Sparkles"
    category = "Questions"
    order = 2
    createdBy = $CREATED_BY
}

Add-Content -Type "features" -Name "Multi-Tenant Architecture" -Data @{
    title = "Multi-Tenant Architecture"
    description = "Complete data isolation for each organization. Your church's data is secure and separate, with custom branding and subdomain."
    icon = "Shield"
    category = "Security"
    order = 3
    createdBy = $CREATED_BY
}

Add-Content -Type "features" -Name "Tournament Management" -Data @{
    title = "Tournament Management"
    description = "Create and manage tournaments with ease. Set up brackets, schedule matches, assign judges, and track progress all in one place."
    icon = "Trophy"
    category = "Competition"
    order = 4
    createdBy = $CREATED_BY
}

Add-Content -Type "features" -Name "Practice Mode" -Data @{
    title = "Unlimited Practice Sessions"
    description = "Let participants practice anytime with adaptive difficulty. Track progress, identify weak areas, and build confidence before competitions."
    icon = "BookOpen"
    category = "Training"
    order = 5
    createdBy = $CREATED_BY
}

Add-Content -Type "features" -Name "Analytics Dashboard" -Data @{
    title = "Comprehensive Analytics"
    description = "Gain insights with detailed reports and visualizations. Track participant progress, question difficulty, tournament outcomes, and engagement metrics."
    icon = "BarChart"
    category = "Analytics"
    order = 6
    createdBy = $CREATED_BY
}

# TESTIMONIALS (Using correct DTO fields)
# Required: name, role, organization, quote, rating, createdBy
# Optional: avatar, featured
Add-Content -Type "testimonials" -Name "Pastor John Smith" -Data @{
    name = "Pastor John Smith"
    role = "Lead Pastor"
    organization = "First Baptist Church"
    quote = "Smart eQuiz has revolutionized our youth Bible quiz program. The platform is intuitive, powerful, and our participants absolutely love it. We've seen a 50% increase in engagement since switching."
    rating = 5
    avatar = "https://i.pravatar.cc/150?img=12"
    featured = $true
    createdBy = $CREATED_BY
}

Add-Content -Type "testimonials" -Name "Sarah Johnson" -Data @{
    name = "Sarah Johnson"
    role = "Youth Director"
    organization = "Grace Community Church"
    quote = "Managing tournaments has never been easier. The real-time scoring and analytics are game-changers. Parents love being able to watch live, and the kids are more motivated than ever."
    rating = 5
    avatar = "https://i.pravatar.cc/150?img=45"
    featured = $true
    createdBy = $CREATED_BY
}

Add-Content -Type "testimonials" -Name "Michael Chen" -Data @{
    name = "Michael Chen"
    role = "Quiz Coordinator"
    organization = "City Bible Fellowship"
    quote = "The multi-currency support and customization options make this perfect for our international ministry. We run competitions across three countries seamlessly."
    rating = 5
    avatar = "https://i.pravatar.cc/150?img=33"
    featured = $false
    createdBy = $CREATED_BY
}

Add-Content -Type "testimonials" -Name "Emily Rodriguez" -Data @{
    name = "Emily Rodriguez"
    role = "Education Director"
    organization = "Hope Community Church"
    quote = "The mobile app is fantastic! Our teens practice during their commute, lunch breaks, and before bed. Bible engagement has never been this high in our youth group."
    rating = 5
    avatar = "https://i.pravatar.cc/150?img=23"
    featured = $false
    createdBy = $CREATED_BY
}

# PRICING PLANS (Using correct DTO fields)
# Required: name, price, interval, features (array), ctaText, ctaLink, createdBy
# Optional: highlighted
Add-Content -Type "pricing-plans" -Name "Starter Plan" -Data @{
    name = "Starter"
    price = 29.00
    interval = "MONTH"
    features = @(
        "Up to 50 participants"
        "Unlimited practice questions"
        "Basic analytics"
        "Email support"
        "Mobile app access"
    )
    ctaText = "Start Free Trial"
    ctaLink = "/signup?plan=starter"
    highlighted = $false
    createdBy = $CREATED_BY
}

Add-Content -Type "pricing-plans" -Name "Professional Plan" -Data @{
    name = "Professional"
    price = 79.00
    interval = "MONTH"
    features = @(
        "Up to 200 participants"
        "AI question generation"
        "Advanced analytics"
        "Custom branding"
        "Priority support"
        "Tournament management"
        "Mobile app access"
    )
    ctaText = "Start Free Trial"
    ctaLink = "/signup?plan=professional"
    highlighted = $true
    createdBy = $CREATED_BY
}

Add-Content -Type "pricing-plans" -Name "Enterprise Plan" -Data @{
    name = "Enterprise"
    price = 199.00
    interval = "MONTH"
    features = @(
        "Unlimited participants"
        "AI question generation"
        "White-label solution"
        "Custom domain"
        "Dedicated support"
        "Advanced security"
        "API access"
        "Multi-location support"
    )
    ctaText = "Contact Sales"
    ctaLink = "/contact?inquiry=enterprise"
    highlighted = $false
    createdBy = $CREATED_BY
}

# FAQS (Using correct DTO fields)
# Required: question, answer, category, createdBy
# Optional: order
Add-Content -Type "faqs" -Name "What is Smart eQuiz?" -Data @{
    question = "What is Smart eQuiz?"
    answer = "Smart eQuiz is a comprehensive Bible quiz competition platform designed for churches, ministries, and Christian organizations. It provides tools for managing participants, creating questions, running tournaments, and tracking progress with real-time analytics."
    category = "General"
    order = 1
    createdBy = $CREATED_BY
}

Add-Content -Type "faqs" -Name "How does pricing work?" -Data @{
    question = "How does pricing work?"
    answer = "We offer three plans: Starter ($29/month for up to 50 participants), Professional ($79/month for up to 200 participants), and Enterprise ($199/month for unlimited participants). All plans include a 14-day free trial with no credit card required. You can upgrade, downgrade, or cancel anytime."
    category = "Billing"
    order = 2
    createdBy = $CREATED_BY
}

Add-Content -Type "faqs" -Name "Is there a mobile app?" -Data @{
    question = "Is there a mobile app?"
    answer = "Yes! Smart eQuiz offers native mobile apps for both iOS and Android. Participants can practice questions, track progress, and even compete in tournaments from their mobile devices. The apps sync seamlessly with the web platform."
    category = "Technical"
    order = 3
    createdBy = $CREATED_BY
}

Add-Content -Type "faqs" -Name "Can I import existing questions?" -Data @{
    question = "Can I import my existing question bank?"
    answer = "Absolutely! You can import questions via CSV or Excel files. We also provide an API for bulk imports. Our support team can help you migrate your existing question database to ensure a smooth transition."
    category = "Questions"
    order = 4
    createdBy = $CREATED_BY
}

Add-Content -Type "faqs" -Name "How secure is my data?" -Data @{
    question = "How secure is my data?"
    answer = "Security is our top priority. We use enterprise-grade encryption (AES-256), multi-tenant data isolation, regular security audits, and GDPR-compliant data handling. Your organization's data is completely isolated from other tenants and backed up daily."
    category = "Security"
    order = 5
    createdBy = $CREATED_BY
}

Add-Content -Type "faqs" -Name "Can we use custom branding?" -Data @{
    question = "Can I use my own branding and domain?"
    answer = "Yes! Professional plans include custom branding (logo, colors, fonts), and Enterprise plans include white-label options with custom domain support. You can make the platform look and feel like it's your own."
    category = "Customization"
    order = 6
    createdBy = $CREATED_BY
}

Write-Host "`n=== Summary ===" -ForegroundColor Cyan
Write-Host "✅ Success: $successCount" -ForegroundColor Green
Write-Host "❌ Failed: $failCount" -ForegroundColor Red
Write-Host ""

if ($failCount -eq 0) {
    Write-Host "🎉 All content added successfully!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some content failed. Check errors above." -ForegroundColor Yellow
}
