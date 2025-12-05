import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  HelpCircle,
  Search,
  Book,
  Video,
  MessageCircle,
  FileText,
  ChevronRight,
  ExternalLink,
  Mail,
  Phone,
  Send
} from 'lucide-react';

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  description: string;
  content: string;
  views: number;
  helpful: number;
}

const HELP_ARTICLES: HelpArticle[] = [
  {
    id: '1',
    title: 'Getting Started with Smart eQuiz',
    category: 'Getting Started',
    description: 'Learn the basics of creating and managing quizzes',
    content: `Welcome to Smart eQuiz Platform! This guide will help you get up and running quickly.

**Initial Setup**
After logging in, you'll land on your Dashboard. Take a moment to familiarize yourself with the main navigation:
• Dashboard - Your home base with quick stats and recent activity
• Questions - Create and manage your question bank
• Tournaments - Set up and run Bible quiz competitions
• Practice - Allow users to practice with question sets
• Analytics - Track performance and engagement

**Creating Your First Question**
1. Navigate to "Questions" from the sidebar
2. Click "Add New Question" in the top-right
3. Fill in the question text, category, difficulty level, and verse reference
4. Add answer options (mark the correct one)
5. Optionally add Scripture context and explanation
6. Click "Save Question"

**Organizing Questions**
Use categories to organize questions by Bible book, topic, or difficulty. Create custom categories under Settings > Question Categories.

**Setting Up Your Team**
Invite team members through Settings > Team Management. Assign appropriate roles:
• Org Admin - Full access to all features
• Question Manager - Create and edit questions
• Moderator - Run tournaments and review results
• Inspector - Approve questions before tournaments

**Next Steps**
Once you have 20+ questions, you're ready to create your first tournament! Check out our "Creating Your First Tournament" guide for details.

**Need Help?**
• Watch our video tutorials for visual walkthroughs
• Use live chat for immediate assistance (Mon-Fri, 9am-5pm EST)
• Browse our FAQ section for common questions`,
    views: 1234,
    helpful: 98
  },
  {
    id: '2',
    title: 'Creating Your First Tournament',
    category: 'Tournaments',
    description: 'Step-by-step guide to setting up tournaments',
    content: `Tournaments are the heart of Smart eQuiz. Here's how to create your first competition.

**Prerequisites**
• At least 20 approved questions in your question bank
• Tournament plan subscription (Basic or higher)
• Participants registered in your system

**Step 1: Navigate to Tournaments**
Click "Tournaments" in the sidebar, then "Create New Tournament"

**Step 2: Basic Information**
• Tournament Name - e.g., "January Bible Bowl 2025"
• Description - Brief overview for participants
• Start Date & Time - When registration opens
• End Date & Time - Tournament conclusion
• Registration Deadline - Last day to sign up
• Format - Single Elimination, Round Robin, or League

**Step 3: Question Configuration**
• Question Source - Select from your question bank categories
• Total Questions - How many questions per match (recommended: 20-30)
• Difficulty Mix - Percentage of easy/medium/hard questions
• Time Limit - Seconds per question (recommended: 30-45)
• Points System - Standard (10/20/30) or custom

**Step 4: Qualification Requirements**
• Minimum Practice Score - Require participants to score X% in practice mode
• Prerequisite Tournaments - Lock until previous tournament completed
• Age/Grade Restrictions - Optional demographic filters

**Step 5: Participation Settings**
• Max Participants - Set capacity limits
• Team Size - Individual or team-based (2-5 players)
• Registration Fee - Free or paid entry
• Spectator Access - Allow public viewing

**Step 6: Review & Publish**
Review all settings, then click "Publish Tournament". Participants will be notified via email and see it on their dashboard.

**During the Tournament**
Use the Moderator view to:
• Monitor live matches
• Handle disputes or technical issues
• Track real-time leaderboards
• Export results

**After Completion**
Awards are automatically distributed based on rankings. View detailed analytics under Tournament > [Name] > Analytics.

**Pro Tips**
• Run a test tournament with your team first
• Enable "Practice Mode" for the same question set
• Schedule tournaments at consistent times (e.g., every Saturday at 2pm)
• Announce tournaments 1-2 weeks in advance`,
    views: 856,
    helpful: 92
  },
  {
    id: '3',
    title: 'Managing Question Banks',
    category: 'Questions',
    description: 'How to organize and categorize your questions',
    content: `A well-organized question bank is crucial for successful tournaments. Here's how to manage yours effectively.

**Question Lifecycle**
Every question goes through these stages:
1. Draft - Initial creation, not yet ready
2. Review - Submitted for approval
3. Approved - Ready for tournaments
4. Archived - Retired from active use

**Creating Quality Questions**
**Best Practices:**
• Reference specific Scripture verses
• Ensure one clearly correct answer
• Make distractors (wrong answers) plausible but incorrect
• Include context when needed
• Proofread for spelling and grammar

**Question Types:**
• Multiple Choice - 4 options, 1 correct (most common)
• True/False - Simple fact verification
• Fill in the Blank - Complete the verse or phrase
• Matching - Connect related concepts

**Categorization Strategy**
Organize questions by:
• **Bible Book** - Genesis, Exodus, Matthew, etc.
• **Testament** - Old Testament / New Testament
• **Topic** - Creation, Miracles, Parables, Epistles
• **Difficulty** - Easy, Medium, Hard, Expert
• **Verse Range** - Chapters or specific passages

**Bulk Import**
Save time by importing questions in CSV format:
1. Download the template: Questions > Import > Download Template
2. Fill in: Question, Answer A-D, Correct Answer, Category, Verse Reference
3. Upload: Questions > Import > Choose File

**AI Question Generation**
Use our AI assistant to generate questions:
1. Questions > AI Generator
2. Select Bible passage or topic
3. Choose difficulty and quantity
4. Review and edit generated questions
5. Submit for approval

**Approval Workflow**
For quality control, enable question approval:
1. Question Managers create questions (Draft status)
2. Inspectors review and approve/reject
3. Approved questions available for tournaments
4. Track approval stats in Analytics

**Searching & Filtering**
Find questions quickly:
• Search by keyword, verse reference, or category
• Filter by status, difficulty, or creation date
• Sort by views, usage, or helpfulness rating
• Tag questions for easy grouping

**Question Analytics**
Track performance:
• View count - How often used in tournaments
• Success rate - % of participants who answer correctly
• Average time - How long users take to answer
• Feedback - Participant reports of unclear questions

**Archiving Old Questions**
Keep your bank fresh:
• Archive overused questions participants memorize
• Replace with new questions on same topics
• Maintain a rotation schedule (e.g., quarterly refresh)

**Collaboration Tips**
• Assign question creation quotas to team members
• Hold monthly review sessions for new questions
• Create themed question sets for special events
• Share questions with other organizations (optional)`,
    views: 723,
    helpful: 95
  },
  {
    id: '4',
    title: 'Understanding Analytics',
    category: 'Analytics',
    description: 'Make sense of your performance data',
    content: `Smart eQuiz provides comprehensive analytics to help you understand participant performance and improve your tournaments.

**Dashboard Overview**
The main Analytics dashboard shows:
• Total Participants - Active users in your organization
• Tournament Completion Rate - % who finish what they start
• Average Score - Overall participant performance
• Engagement Trends - Activity over time (daily/weekly/monthly)

**Participant Analytics**
**Individual Performance:**
• Score history across all tournaments
• Strengths & weaknesses by category
• Improvement trends over time
• Time spent practicing vs competing
• Badges and achievements earned

**Viewing Participant Data:**
1. Analytics > Participants
2. Search for specific user or view all
3. Click name to see detailed profile
4. Export data for external analysis

**Tournament Analytics**
**For Each Tournament:**
• Participation rate (registered vs completed)
• Average score and distribution
• Question difficulty analysis
• Time-to-complete metrics
• Drop-off points (where users quit)

**Question Performance:**
• Most/least difficult questions (by success rate)
• Questions needing revision (high skip rate)
• Category performance comparison
• Verse coverage gaps

**Accessing Tournament Reports:**
1. Tournaments > [Select Tournament]
2. Click "Analytics" tab
3. View charts and download CSV export

**Question Bank Analytics**
**Usage Metrics:**
• Most/least used questions
• Questions needing updates (old or overused)
• Category distribution
• Approval vs rejection rates

**Quality Indicators:**
• Questions flagged by participants
• Success rate (too easy = >95%, too hard = <30%)
• Time-to-answer average
• Revision history

**Engagement Analytics**
**User Activity:**
• Daily/Weekly Active Users (DAU/WAU)
• Session duration averages
• Peak usage times and days
• Feature adoption rates (which features users love)

**Retention Metrics:**
• New user onboarding completion
• Return rate after first tournament
• Churn indicators (users becoming inactive)
• Re-engagement success (email campaigns)

**Financial Analytics** (Billing Plan: Professional+)
• Revenue by subscription tier
• Tournament registration fees collected
• Payment success/failure rates
• Subscription renewal predictions

**Custom Reports**
Create tailored reports:
1. Analytics > Custom Reports > Create New
2. Select metrics (participants, scores, time periods)
3. Choose filters (age groups, categories, tournaments)
4. Pick visualization (charts, tables, graphs)
5. Schedule automated email delivery (optional)

**Exporting Data**
Download data for Excel/Sheets:
• CSV format for all tables
• PDF reports with charts
• JSON for API integration
• Scheduled exports (daily/weekly)

**Using Analytics to Improve**
**Identify Patterns:**
• Which Bible books need more questions?
• What time slots have best participation?
• Which categories are most challenging?
• What question format works best?

**Take Action:**
• Add questions to weak categories
• Schedule tournaments at peak times
• Adjust difficulty mix based on scores
• Recognize top performers with badges

**Privacy & Data Protection**
• All analytics respect user privacy settings
• Aggregated data only (no personal info shared)
• GDPR/CCPA compliant export tools
• Participants can request their data deletion`,
    views: 645,
    helpful: 89
  },
  {
    id: '5',
    title: 'Subscription Plans Explained',
    category: 'Billing',
    description: 'Compare features across different plans',
    content: `Smart eQuiz offers flexible pricing plans to fit organizations of all sizes. Here's a detailed breakdown.

**Plan Comparison**

**Free Tier**
Perfect for trying out the platform:
• Up to 50 questions in your bank
• 1 practice mode
• 5 active participants
• Basic analytics
• Community support
• No credit card required

**Basic Plan - $29/month**
Ideal for small groups and churches:
• Up to 500 questions
• 5 practice modes
• 3 tournaments per month
• Up to 30 participants
• Standard analytics
• Email support
• Custom categories
• Basic branding (logo only)

**Professional Plan - $79/month**
Best for growing organizations:
• Unlimited questions
• Unlimited practice modes
• 10 tournaments per month
• Up to 100 participants
• Advanced analytics & reporting
• Priority email support
• AI question generator (100 questions/month)
• Full branding customization
• Team collaboration tools
• Export capabilities (CSV, PDF)

**Enterprise Plan - $199/month**
For large organizations and networks:
• Everything in Professional, plus:
• Unlimited tournaments
• Unlimited participants
• Live chat support
• Dedicated account manager
• Custom integrations (API access)
• White-label options
• Multi-tenant support
• SLA guarantee (99.9% uptime)
• Advanced security features
• Custom training sessions

**Add-Ons** (Available on any paid plan)
• **Extra Participants:** $0.50/user/month above plan limit
• **AI Question Boost:** $20/month for 500 extra AI questions
• **Premium Support:** $50/month for phone + weekend support
• **Custom Development:** Quote-based for unique features

**Billing Frequency**
Save with annual billing:
• Monthly billing - Standard pricing
• Annual billing - Save 20% (2 months free)
• Billed upfront, can cancel anytime

**Payment Methods**
We accept:
• Credit/Debit cards (Visa, Mastercard, Amex)
• PayPal
• Bank transfer (Annual plans only, $500+ invoices)

**Upgrade/Downgrade**
**Upgrading:**
• Immediate access to new features
• Pro-rated charge for current billing period
• No data loss, all content preserved

**Downgrading:**
• Takes effect at next billing cycle
• Excess data archived (not deleted)
• Can re-upgrade to restore full access

**How to Change Plans:**
1. Settings > Billing > Subscription
2. Click "Change Plan"
3. Select new plan tier
4. Confirm payment details
5. Changes apply immediately (upgrades) or next cycle (downgrades)

**Free Trial**
New customers get 14-day free trial of Professional Plan:
• No credit card required to start
• Full access to all Professional features
• Can downgrade to Free or upgrade to Enterprise
• No automatic charges after trial

**Educational Discounts**
Registered 501(c)(3) organizations and churches receive:
• 25% off any paid plan
• Apply via Settings > Billing > Educational Discount
• Requires proof of tax-exempt status

**Refund Policy**
• 30-day money-back guarantee on annual plans
• Monthly plans can cancel anytime (no refunds)
• Unused months on annual plans: pro-rated refund
• Contact support for refund requests

**Usage Limits & Overages**
What happens if you exceed plan limits:
• Participants - Can't add new until upgrade or remove inactive
• Tournaments - Can't create more until next month or upgrade
• Questions - Can't add more until upgrade (existing ones safe)
• We'll email warnings at 80% and 95% of limits

**Special Offers**
Check Settings > Billing for current promotions:
• Seasonal discounts (Back to School, New Year)
• Referral bonuses (Get 1 month free for each referral)
• Multi-year discounts (Save 30% on 2-year commitments)

**Enterprise Custom Pricing**
For 500+ participants or special needs:
1. Contact sales@smartequiz.com
2. Discuss requirements and volume
3. Receive custom quote within 48 hours
4. Negotiate contract terms
5. White-glove onboarding included

**Questions?**
• Live chat with our billing team (Mon-Fri, 9am-5pm EST)
• Email billing@smartequiz.com
• View detailed plan comparison at smartequiz.com/pricing`,
    views: 892,
    helpful: 94
  },
  {
    id: '6',
    title: 'User Roles and Permissions',
    category: 'User Management',
    description: 'Configure access control for your team',
    content: `Smart eQuiz uses role-based access control (RBAC) to manage what users can see and do. Here's your complete guide.

**Default Roles**

**1. Super Admin** (Platform-wide)
• Full access to all tenants and features
• Manage platform settings
• View all organizations
• Cannot be assigned by org admins
• Reserved for Smart eQuiz staff

**2. Org Admin** (Organization-wide)
• Full access within your organization
• Manage all users and roles
• Configure billing and subscriptions
• Customize branding and settings
• View all analytics
• Cannot be restricted

**3. Question Manager**
Can:
• Create, edit, delete questions
• Import questions (bulk)
• Use AI question generator
• Manage categories
• View question analytics

Cannot:
• Approve questions (unless also Inspector)
• Create tournaments
• Manage billing
• Edit users

**4. Inspector**
Can:
• Review and approve/reject questions
• View question submission queue
• Provide feedback on questions
• Access quality control dashboard

Cannot:
• Create questions themselves
• Manage tournaments
• Edit user accounts

**5. Moderator**
Can:
• Create and manage tournaments
• Monitor live tournaments
• Handle participant disputes
• Export tournament results
• View tournament analytics

Cannot:
• Edit questions
• Manage users
• Access billing

**6. Account Officer**
Can:
• Manage billing and payments
• View invoices and receipts
• Update payment methods
• Handle subscription changes
• View financial analytics

Cannot:
• Create questions or tournaments
• Manage other users
• Access question bank

**7. Participant**
Can:
• Register for tournaments
• Access practice modes
• View their own analytics
• Earn badges and XP
• Update their profile

Cannot:
• Access admin features
• View other users' data
• Create any content

**8. Practice User**
Limited version of Participant:
• Can only access practice modes
• Cannot register for tournaments
• Cannot earn tournament badges
• Ideal for training/onboarding

**9. Spectator**
Read-only access:
• View public tournaments
• See leaderboards
• Cannot participate
• Cannot access practice modes

**Assigning Roles**

**Add New User:**
1. Settings > Team Management
2. Click "Invite User"
3. Enter email address
4. Select role from dropdown
5. Optionally add custom permissions
6. Send invitation

**Change Existing User Role:**
1. Settings > Team Management
2. Find user in list
3. Click "Edit" icon
4. Select new role
5. Save changes (takes effect immediately)

**Custom Permissions**

Beyond default roles, you can customize permissions:

**Permission Categories:**
• **Questions:** Create, Edit, Delete, Approve, Import, Export
• **Tournaments:** Create, Edit, Delete, Moderate, View Results
• **Users:** Create, Edit, Delete, Assign Roles, View
• **Billing:** View, Edit, Process Payments
• **Analytics:** View Own, View All, Export, Custom Reports
• **Settings:** Branding, Categories, Integrations, Security

**Creating Custom Role:**
1. Settings > Roles & Permissions
2. Click "Create Custom Role"
3. Name the role (e.g., "Content Creator")
4. Select allowed permissions
5. Save and assign to users

**Permission Inheritance:**
Roles inherit permissions hierarchically:
• Org Admin inherits all permissions (cannot customize)
• Custom roles can combine any permissions
• Deny rules override allow rules (explicit deny wins)

**Multi-Role Assignment**

Users can have multiple roles:
• Assign primary role (defines main dashboard view)
• Add secondary roles for extra permissions
• Example: "Moderator + Question Manager" can run tournaments AND create questions

**How to Assign Multiple Roles:**
1. Edit user
2. Primary Role dropdown (required)
3. Additional Roles checklist (optional)
4. Save

**Best Practices**

**Principle of Least Privilege:**
• Give users minimum permissions needed
• Start restrictive, expand as needed
• Review permissions quarterly

**Role Separation:**
• Question creators shouldn't approve their own questions
• Moderators shouldn't participate in tournaments they run
• Billing officers shouldn't also manage users

**Team Structure Examples:**

**Small Church (5-10 people):**
• 1 Org Admin (pastor or tech-savvy volunteer)
• 2-3 Question Managers (Bible study leaders)
• 1 Moderator (tournament coordinator)
• Remaining are Participants

**Medium Organization (50-100 people):**
• 1 Org Admin
• 5 Question Managers
• 2 Inspectors (for quality control)
• 3 Moderators (rotate tournament duties)
• 1 Account Officer (handle billing)
• Remaining are Participants

**Large Network (500+ people):**
• 1 Org Admin
• 10+ Question Managers (by region/category)
• 5 Inspectors (full-time quality team)
• 10 Moderators (per time zone)
• 2 Account Officers
• Custom roles for special functions

**Security Features**

**Session Management:**
• Force logout inactive users (30 min default)
• Require re-authentication for sensitive actions
• IP address logging for admin actions

**Two-Factor Authentication:**
• Require 2FA for admin roles
• Settings > Security > Enforce 2FA
• Users verify via SMS or authenticator app

**Audit Logging:**
View who did what:
• Settings > Audit Log
• Filter by user, action, date range
• Track role changes, permission edits, data exports
• Retain logs for 90 days (365 on Enterprise plan)

**Deactivating Users**

Instead of deleting:
1. Edit user
2. Change status to "Inactive"
3. User loses access but data preserved
4. Can reactivate anytime

**Bulk Role Management**

Update multiple users at once:
1. Settings > Team Management
2. Select users (checkboxes)
3. Bulk Actions > Change Role
4. Select new role
5. Confirm

**Troubleshooting**

**User can't access feature:**
• Verify their role includes that permission
• Check if feature requires plan upgrade
• Ensure user session is current (re-login)

**Role changes not applying:**
• Have user logout and login again
• Clear browser cache
• Check audit log for conflicts

**Need Help?**
• Contact support for role architecture advice
• Request custom roles for unique workflows
• Schedule training session for team onboarding`,
    views: 567,
    helpful: 91
  },
  {
    id: '7',
    title: 'Troubleshooting Common Issues',
    category: 'Troubleshooting',
    description: 'Solutions to frequently encountered problems',
    content: `Having trouble? Here are solutions to the most common issues.

**Login & Authentication Issues**

**Can't login:**
• Verify email/password (case-sensitive)
• Check Caps Lock is off
• Try "Forgot Password" to reset
• Clear browser cache and cookies
• Try incognito/private browsing mode
• Contact admin if account is locked

**Session timeout:**
• Default timeout: 30 minutes of inactivity
• Save work frequently
• Enable "Remember Me" for extended sessions
• Admin can adjust timeout in Settings

**Two-factor authentication problems:**
• Ensure device time is synced correctly
• Try backup codes from initial setup
• Contact support to reset 2FA if lost device

**Tournament Issues**

**Tournament won't start:**
• Check minimum participant requirement met
• Verify start date/time is correct (timezone!)
• Ensure sufficient approved questions
• Check tournament status isn't "Draft"

**Participants can't join:**
• Verify registration deadline hasn't passed
• Check participant meets qualification requirements
• Ensure tournament capacity not reached
• Confirm participant account is active

**Questions not appearing:**
• Verify questions are "Approved" status
• Check category selected in tournament settings
• Ensure question difficulty matches tournament config
• Refresh browser if recently approved

**Scoring discrepancies:**
• Review question point values
• Check for bonus point settings
• Verify time penalties applied correctly
• Export results for manual audit

**Question Bank Problems**

**Can't create questions:**
• Check you have "questions.create" permission
• Verify you haven't exceeded plan limit
• Ensure all required fields filled
• Try logging out and back in

**Import failed:**
• Check CSV format matches template
• Verify no special characters causing issues
• Ensure file size under limit (5MB)
• Try importing smaller batches

**AI generator not working:**
• Check subscription includes AI features
• Verify API credits available
• Try shorter/simpler prompts
• Contact support if persistent

**Performance Issues**

**Slow loading:**
• Clear browser cache
• Check internet connection speed
• Try different browser
• Disable browser extensions temporarily
• Check system status page

**Timeout errors:**
• Reduce batch operation size
• Try during off-peak hours
• Check if API rate limit exceeded
• Contact support for enterprise support

**Analytics & Reports**

**Data not updating:**
• Allow 5-10 minutes for data refresh
• Click manual refresh button
• Check date range selected
• Verify tournament is completed

**Export fails:**
• Check file format compatibility
• Reduce date range for large exports
• Ensure popup blocker not active
• Try different browser

**Missing data:**
• Verify time zone settings
• Check filters aren't too restrictive
• Ensure you have view permissions
• Data retention policy (90 days standard)

**Billing & Subscriptions**

**Payment declined:**
• Verify card details correct
• Check card has sufficient funds
• Ensure billing address matches card
• Try alternative payment method
• Contact your bank if persists

**Can't upgrade plan:**
• Ensure current subscription active
• Check payment method on file
• Try different browser/device
• Contact billing support

**Invoice not received:**
• Check spam/junk folder
• Verify email address in profile
• Download from Billing History
• Request resend from support

**Mobile Access Issues**

**App won't install:**
• Check device compatibility (iOS 13+, Android 8+)
• Ensure sufficient storage space
• Try restarting device
• Download directly from official app store

**Sync not working:**
• Enable background app refresh
• Check mobile data/WiFi connection
• Force close and reopen app
• Logout and login again

**Push notifications not appearing:**
• Enable notifications in device settings
• Check app notification permissions
• Verify notification preferences in app
• Try disabling and re-enabling

**Integration Issues**

**Webhook failures:**
• Verify endpoint URL is accessible
• Check authentication headers
• Review webhook payload format
• Test with webhook debugging tools
• Check server logs for errors

**API errors:**
• Verify API key is valid
• Check rate limits not exceeded
• Review API documentation for changes
• Ensure request format matches spec
• Contact support with error codes

**SSO not working:**
• Verify SAML/OAuth configuration
• Check certificate hasn't expired
• Ensure redirect URLs whitelisted
• Test with SSO provider's tools
• Review identity provider logs

**Getting Additional Help**

**Still stuck?**

1. **Search Help Center** - Full text search across all articles
2. **Live Chat** - Mon-Fri 9am-5pm EST (fastest for urgent issues)
3. **Email Support** - support@smartequiz.com (24hr response)
4. **Video Tutorials** - Visual step-by-step guides
5. **Community Forum** - Ask other users and experts
6. **Schedule Call** - Book 1-on-1 support session
7. **System Status** - Check for known outages

**Before contacting support, have ready:**
• Your organization name
• User role and email
• Description of issue
• Steps to reproduce
• Screenshots if applicable
• Browser/device info
• Error messages

**Enterprise customers:**
• Dedicated support line
• Guaranteed 4-hour response
• Priority issue resolution
• Direct engineer access`,
    views: 2134,
    helpful: 94
  },
  {
    id: '8',
    title: 'Best Practices for Tournaments',
    category: 'Best Practices',
    description: 'Expert tips for running successful competitions',
    content: `Learn from successful tournament organizers to create engaging competitions.

**Pre-Tournament Preparation**

**Question Quality (Most Important!)**
• Aim for 50+ approved questions before first tournament
• Mix difficulty: 40% easy, 40% medium, 20% hard
• Cover diverse Scripture passages
• Include clear verse references
• Avoid ambiguous wording
• Test questions with sample audience first

**Participant Communication**
• Announce tournaments 1-2 weeks in advance
• Send reminder emails 48 hours before
• Clearly state rules and format
• Provide practice mode access
• Create excitement with promotional graphics
• Set clear expectations for conduct

**Technical Setup**
• Test tournament flow with small group first
• Verify question pool is complete
• Check scoring system configured correctly
• Test on different devices (mobile/tablet/desktop)
• Have backup plan for technical issues
• Ensure stable internet connection

**Tournament Structure**

**Choosing Format**

**Single Elimination:**
• Best for: Large groups (32+ participants)
• Pros: Fast, exciting, clear winner
• Cons: Elimination discourages some
• Tip: Offer consolation bracket

**Round Robin:**
• Best for: Small-medium groups (8-16)
• Pros: Everyone plays multiple rounds
• Cons: Time-consuming
• Tip: Use for league/season play

**Swiss System:**
• Best for: Medium groups (16-32)
• Pros: Fair matchmaking, no elimination
• Cons: Complex scheduling
• Tip: Great for skill-based matching

**Time Management**
• 30 seconds per question ideal for most audiences
• Add 5 seconds for higher difficulty
• Reduce to 20 seconds for speed rounds
• Include 2-3 minute breaks between rounds
• Schedule buffer time for technical delays
• End by advertised time (respect participants)

**Scoring Strategy**

**Standard Points:**
• Correct answer: 10 points
• Fast answer bonus: +5 points (<10 seconds)
• Streak bonus: +2 per consecutive correct

**Advanced Options:**
• Difficulty multipliers (easy 1x, medium 1.5x, hard 2x)
• Lifelines (skip question, 50/50, phone-a-friend)
• Negative points for wrong answers (competitive only)
• Team bonuses for collaboration

**Keeping Score Fair:**
• Use same question pool for all participants
• Randomize question order
• Monitor for cheating/collusion
• Review suspicious high scores
• Disable internet search if in-person

**Engagement Tactics**

**During Tournament**
• Display live leaderboard prominently
• Announce leader changes
• Celebrate milestones (10 streak, perfect round)
• Use sound effects for correct/wrong (if appropriate)
• Project questions on large screen for in-person events
• Enable spectator mode for audience viewing

**Interactive Elements**
• Audience prediction polls
• Live commentary (for large events)
• Social media integration (#yourchurch hashtag)
• Photo opportunities for winners
• Instant replay of close matches

**Post-Match**
• Announce winners immediately
• Share leaderboard via email
• Post highlights on social channels
• Offer feedback surveys
• Provide performance analytics to participants

**Moderation Best Practices**

**Before Tournament:**
• Review all questions personally
• Remove duplicates or unclear questions
• Verify answer keys correct
• Check for offensive content
• Ensure cultural sensitivity

**During Tournament:**
• Monitor chat for inappropriate behavior
• Be ready to pause for technical issues
• Have dispute resolution process ready
• Watch for connectivity issues
• Record match if needed for reviews

**Handling Disputes:**
• Listen to both sides calmly
• Review question and answer
• Check system logs
• Make fair ruling quickly
• Document decision
• Offer make-up match if system error

**Growing Your Tournament Community**

**Recurring Events**
• Schedule monthly or quarterly
• Create tournament series/seasons
• Award cumulative points
• Offer year-end championships
• Build anticipation and loyalty

**Skill Levels**
• Beginner tournaments (easier questions)
• Intermediate (mixed difficulty)
• Advanced/Expert (hard questions only)
• Youth divisions (age-appropriate)
• Family tournaments (team-based)

**Incentives**
• Digital badges and achievements
• Leaderboard rankings
• Certificates for winners
• Small prizes (gift cards, books)
• Recognition in newsletter/service
• Special privileges (tournament naming rights)

**Marketing Your Tournaments**

**Internal Promotion:**
• Announcements in services/meetings
• Email newsletters
• Bulletin board posters
• Word of mouth champions
• Social media posts
• Website calendar

**External Outreach:**
• Invite neighboring organizations
• Partner with other Bible study groups
• Cross-promote with similar ministries
• Local Christian radio announcements
• Community bulletin boards

**Measuring Success**

**Key Metrics:**
• Participation rate (registrations/active members)
• Completion rate (finished/started)
• Return participation (repeat players)
• Average engagement score
• Net Promoter Score (would recommend?)
• Question quality ratings

**Continuous Improvement:**
• Survey participants after each tournament
• Review analytics for patterns
• A/B test different formats
• Learn from top organizers
• Stay updated on platform features
• Adapt based on feedback

**Common Mistakes to Avoid**

❌ Too many questions (causes fatigue)
❌ Unclear rules (leads to confusion)
❌ No practice mode (participants unprepared)
❌ Ignoring feedback (repeat same issues)
❌ Over-complicated scoring (hard to understand)
❌ No moderation plan (disputes escalate)
❌ Poor time management (runs late)
❌ Not testing beforehand (technical disasters)

**Advanced Tips**

**Theme Tournaments:**
• Christmas/Easter focused questions
• Book-specific (Gospels only, Paul's letters)
• Character studies (David, Moses, Peter)
• Timeline tournaments (Old vs New Testament)
• Topical (Love, Faith, Hope, Redemption)

**Hybrid Events:**
• In-person + online participants
• Live streaming with remote players
• Local hub sites connecting virtually
• Mobile app for on-the-go access

**Gamification:**
• Achievement system (badges, titles)
• Unlockable content based on performance
• Daily challenges between tournaments
• Practice mode rewards
• Social features (friend challenges)

**Need More Help?**
• Watch "Tournament Excellence" video series
• Join our Tournament Organizers Facebook group
• Schedule consultation with success team
• Download tournament planning checklist
• Access tournament templates library`,
    views: 1456,
    helpful: 96
  },
  {
    id: '9',
    title: 'Mobile App Guide',
    category: 'Mobile',
    description: 'Using Smart eQuiz on your mobile device',
    content: `Access Smart eQuiz anywhere with our mobile apps for iOS and Android.

**Getting Started**

**Download & Install**

**iOS (iPhone/iPad):**
1. Open App Store
2. Search "Smart eQuiz Platform"
3. Tap "Get" then "Install"
4. Requires iOS 13.0 or later
5. Size: ~45MB

**Android:**
1. Open Google Play Store
2. Search "Smart eQuiz Platform"
3. Tap "Install"
4. Requires Android 8.0 or later
5. Size: ~38MB

**First Launch**
1. Open app
2. Tap "Sign In" (or "Create Account")
3. Enter your credentials
4. Allow notifications (recommended)
5. Complete quick tutorial (2 minutes)

**App Features**

**Participant Experience**

**Dashboard:**
• View upcoming tournaments
• Check your stats and rankings
• Access practice mode
• See recent achievements
• Review tournament history

**Join Tournament:**
• Tap tournament card
• Review details and rules
• Tap "Register" button
• Confirm registration
• Get reminder notification before start

**During Tournament:**
• Swipe to answer questions
• See timer countdown
• Track your score in real-time
• View current rank
• Use lifelines if enabled

**Practice Mode:**
• Select category or random
• Choose difficulty level
• Set number of questions (5, 10, 20, 50)
• Timed or untimed
• Review answers after completion
• Track improvement over time

**Organizer Features**

**Tournament Management:**
• Create tournaments on-the-go
• Monitor active tournaments
• View live participant list
• Access real-time leaderboards
• Handle disputes via chat
• Push notifications to participants

**Question Bank:**
• Browse questions
• Quick-add simple questions
• Review pending questions
• Approve/reject submissions
• Mark favorites for tournaments

**Analytics:**
• View summary dashboards
• Check participation trends
• Review revenue reports
• Export data (email CSV)
• Filter by date ranges

**App-Specific Features**

**Offline Mode:**
• Download questions for offline practice
• Cache tournament details
• Sync when connection restored
• Note: Can't join tournaments offline

**Push Notifications:**
• Tournament starting soon
• Your turn in match
• New tournament announced
• Achievement unlocked
• Score updates
• Admin announcements

**Camera Integration:**
• Scan QR code to join tournament
• Take photo for profile
• Submit visual question content
• Share tournament QR with others

**Quick Actions (3D Touch/Long Press):**
• Jump to Practice Mode
• View Next Tournament
• Check Leaderboard
• Create Question (organizers)

**Settings & Preferences**

**Account Settings:**
• Edit profile information
• Change password
• Upload profile photo
• Manage email preferences
• Link social accounts
• Privacy settings

**Notification Preferences:**
• Tournament reminders (Yes/No)
• Score updates (Real-time/Summary/Off)
• New tournament alerts
• Achievement notifications
• Marketing emails
• Push notification sound

**App Preferences:**
• Dark/Light theme
• Font size (Small/Medium/Large)
• Haptic feedback (vibration)
• Sound effects
• Auto-play videos
• Data saver mode (reduces images)

**Performance Settings:**
• Cache size limit
• Auto-sync frequency
• Download images on WiFi only
• Reduce animations
• Low power mode optimizations

**Tips & Tricks**

**Battery Optimization:**
• Enable Low Power Mode for long tournaments
• Reduce screen brightness
• Close background apps
• Disable unnecessary animations
• Use WiFi instead of cellular data

**Data Saving:**
• Download questions on WiFi before traveling
• Enable Data Saver mode
• Disable auto-play videos
• Reduce image quality
• Only sync when needed

**Faster Navigation:**
• Use search (🔍 in top-right)
• Add favorites to quick access
• Swipe gestures (left: back, right: menu)
• Shake to refresh
• Double-tap profile for settings

**Accessibility Features:**

**Visual:**
• VoiceOver/TalkBack support
• Larger text sizes
• High contrast mode
• Reduce motion
• Button shapes
• Color blind friendly mode

**Audio:**
• Text-to-speech for questions
• Audio feedback for answers
• Adjustable speech rate
• Mono audio option

**Physical:**
• Voice control support
• Switch control compatible
• Larger tap targets
• Extended timeout options

**Troubleshooting**

**App crashes:**
• Force close and reopen
• Check for updates in store
• Free up device storage (need 500MB+)
• Restart device
• Reinstall app (keeps account data)

**Sync issues:**
• Check internet connection
• Pull down to refresh manually
• Log out and back in
• Clear app cache (Settings > Storage)
• Contact support if persists

**Login problems:**
• Ensure email/password correct
• Check Caps Lock
• Try "Forgot Password"
• Verify account activated
• Check email for security alerts

**Slow performance:**
• Close other apps
• Clear cache
• Restart device
• Update to latest version
• Check available storage
• Disable unnecessary features

**Notifications not working:**
• Enable in device Settings > Apps > Smart eQuiz
• Check notification preferences in app
• Ensure Do Not Disturb is off
• Grant notification permissions
• Reinstall if still broken

**Updating the App**

**Auto-update (recommended):**
• iOS: Settings > App Store > App Updates (ON)
• Android: Play Store > Settings > Auto-update apps

**Manual update:**
• Open app store
• Search "Smart eQuiz"
• Tap "Update" if available
• Or check Updates tab

**Update notes:**
• New features announced in-app
• Security patches applied automatically
• Bug fixes listed in store
• Major updates require acceptance

**App vs Web**

**Use App for:**
• On-the-go access
• Push notifications
• Faster tournament participation
• Offline practice
• Better mobile experience

**Use Web for:**
• Full organizer features
• Detailed analytics
• Bulk question import
• Advanced settings
• Multi-tab workflow

**Security**

**Protecting Your Account:**
• Enable biometric login (Face ID/Fingerprint)
• Use strong unique password
• Enable 2FA in settings
• Log out on shared devices
• Review active sessions regularly

**Privacy:**
• App doesn't access contacts/photos without permission
• Location only if you enable it
• No tracking for advertising
• Data encrypted in transit
• COPPA compliant for youth

**Support**

**In-App Help:**
• Tap profile > Help Center
• Search help articles
• Watch video tutorials
• Live chat (Mon-Fri 9am-5pm)
• Submit ticket

**Rating & Feedback:**
• Rate app in store (helps us improve!)
• Report bugs via Settings > Report Issue
• Suggest features via in-app form
• Join beta program for early features

**Coming Soon:**
• Tablet-optimized interface
• Apple Watch companion app
• Offline tournament mode
• Enhanced social features
• AR question scanning`,
    views: 1823,
    helpful: 89
  },
  {
    id: '10',
    title: 'API Integration Guide',
    category: 'Developers',
    description: 'Integrate Smart eQuiz with your applications',
    content: `Connect Smart eQuiz to your existing systems using our REST API.

**Getting Started**

**Prerequisites:**
• Professional or Enterprise plan
• Basic understanding of REST APIs
• API client (Postman, cURL, or programming language)
• HTTPS capable server (for webhooks)

**Authentication**

**Obtaining API Keys:**
1. Log in as Organization Admin
2. Navigate to Settings > API & Integrations
3. Click "Generate API Key"
4. Copy key immediately (shown once!)
5. Store securely (use environment variables)
6. Never commit keys to version control

**Authentication Methods:**

**Bearer Token (Recommended):**
Authorization: Bearer YOUR_API_KEY

**API Key Header:**
X-API-Key: YOUR_API_KEY

**Rate Limits:**
• Free: 100 requests/hour
• Basic: 1,000 requests/hour
• Professional: 10,000 requests/hour
• Enterprise: Custom limits

**Base URL:**
https://api.smartequiz.com/v1

**Core Endpoints**

**Tournaments**

**List Tournaments:**
GET /tournaments
Query params:
  ?status=active|upcoming|completed
  ?page=1
  ?limit=20

**Create Tournament:**
POST /tournaments
Body: { name, startDate, endDate, format, maxParticipants, questionConfig }

**Get Tournament Details:**
GET /tournaments/{tournamentId}

**Update Tournament:**
PUT /tournaments/{tournamentId}

**Delete Tournament:**
DELETE /tournaments/{tournamentId}

**Questions**

**List Questions:**
GET /questions
Query params: ?category=Genesis&difficulty=medium&status=approved

**Create Question:**
POST /questions
Body: { text, options[], correctAnswer, category, difficulty, verse, explanation }

**Bulk Import:**
POST /questions/bulk
Body: { questions: [...array of question objects...] }

**Update Question:**
PUT /questions/{questionId}

**Delete Question:**
DELETE /questions/{questionId}

**Users & Participants**

**List Users:**
GET /users
Query params: ?role=participant|organizer&active=true

**Create User:**
POST /users
Body: { email, name, role, sendInvite }

**Get User Details:**
GET /users/{userId}

**Tournament Registrations:**
GET /tournaments/{tournamentId}/participants
POST /tournaments/{tournamentId}/register
DELETE /tournaments/{tournamentId}/participants/{userId}

**Analytics & Reporting**

**Tournament Results:**
GET /tournaments/{tournamentId}/results
Returns: rankings, statistics (totalParticipants, averageScore, completionRate)

**User Statistics:**
GET /users/{userId}/stats
Returns: tournamentsPlayed, tournamentsWon, averageScore, totalXP, rank

**Organization Analytics:**
GET /analytics/overview
Query params: ?startDate=2025-01-01&endDate=2025-12-31&metric=participation

**Webhooks**

**Supported Events:**
• tournament.created
• tournament.started
• tournament.completed
• user.registered
• question.submitted
• question.approved
• payment.received

**Setup Webhook:**
POST /webhooks
Body: { url, events[], secret }

**Webhook Payload:**
Includes: event, timestamp, data (tournament/user info), signature

**Verifying Webhooks:**
Use HMAC SHA256 to verify webhook signatures with your secret key

**Error Handling**

**HTTP Status Codes:**
• 200 - Success
• 201 - Created
• 204 - No Content (successful delete)
• 400 - Bad Request (validation error)
• 401 - Unauthorized (invalid API key)
• 403 - Forbidden (insufficient permissions)
• 404 - Not Found
• 429 - Too Many Requests (rate limited)
• 500 - Internal Server Error

**Error Response Format:**
Returns: { error: { code, message, details[] } }

**Pagination**

**Request:**
GET /questions?page=2&limit=50

**Response Headers:**
X-Total-Count, X-Page, X-Per-Page, Link (next/prev)

**Code Examples**

**JavaScript (Node.js):**
Use axios or fetch to make API requests
Set Authorization header with Bearer token
Handle errors with try/catch blocks

**Python:**
Use requests library
Set headers with Authorization and Content-Type
Parse JSON responses

**PHP:**
Use cURL for API requests
Set headers with CURLOPT_HTTPHEADER
Decode JSON responses

**Best Practices**

**Security:**
• Never expose API keys in client-side code
• Rotate keys every 90 days
• Use separate keys for dev/staging/production
• Implement webhook signature verification
• Log all API requests for audit trail

**Performance:**
• Cache responses when appropriate
• Use pagination for large datasets
• Batch operations when possible
• Implement exponential backoff for retries
• Monitor rate limit headers

**Data Management:**
• Validate data before sending
• Handle errors gracefully
• Implement idempotency for critical operations
• Clean up test data regularly
• Use transactions for multi-step operations

**Testing**

**Sandbox Environment:**
• URL: https://sandbox-api.smartequiz.com/v1
• Separate API keys
• Fake data, won't affect production
• Reset weekly

**Postman Collection:**
• Download: https://smartequiz.com/api/postman
• Pre-configured requests
• Environment variables template
• Example responses

**Support Resources**

**Documentation:**
• Full API reference: https://docs.smartequiz.com/api
• OpenAPI spec: https://api.smartequiz.com/openapi.json
• Changelog: https://docs.smartequiz.com/changelog

**Developer Support:**
• Email: api@smartequiz.com
• Developer forum: https://community.smartequiz.com/api
• Office hours: Thursdays 2-4pm EST
• Enterprise: Dedicated Slack channel

**Advanced Features (Enterprise)**

• GraphQL API endpoint
• WebSocket for real-time updates
• Custom webhook transformations
• Priority support SLA
• Higher rate limits
• Direct database access (read-only)
• Custom integrations built by our team`,
    views: 892,
    helpful: 87
  }
];

const VIDEO_TUTORIALS = [
  { 
    id: '1', 
    title: 'Platform Overview', 
    duration: '5:32', 
    views: 2345,
    description: 'Get started with Smart eQuiz Platform and learn about the main features',
    category: 'Getting Started',
    thumbnail: 'https://via.placeholder.com/640x360/3B82F6/FFFFFF?text=Platform+Overview',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ' // Placeholder - replace with actual video
  },
  { 
    id: '2', 
    title: 'Creating Questions', 
    duration: '8:15', 
    views: 1876,
    description: 'Learn how to create effective quiz questions with various types and difficulty levels',
    category: 'Questions',
    thumbnail: 'https://via.placeholder.com/640x360/8B5CF6/FFFFFF?text=Creating+Questions',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  { 
    id: '3', 
    title: 'Running Tournaments', 
    duration: '12:40', 
    views: 1543,
    description: 'Step-by-step guide to setting up and managing tournaments',
    category: 'Tournaments',
    thumbnail: 'https://via.placeholder.com/640x360/10B981/FFFFFF?text=Running+Tournaments',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  { 
    id: '4', 
    title: 'Analytics Deep Dive', 
    duration: '15:20', 
    views: 987,
    description: 'Master the analytics dashboard and understand your tournament performance data',
    category: 'Analytics',
    thumbnail: 'https://via.placeholder.com/640x360/F59E0B/FFFFFF?text=Analytics+Deep+Dive',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  { 
    id: '5', 
    title: 'User Management', 
    duration: '6:45', 
    views: 1234,
    description: 'Manage users, roles, and permissions effectively',
    category: 'Administration',
    thumbnail: 'https://via.placeholder.com/640x360/EF4444/FFFFFF?text=User+Management',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  },
  { 
    id: '6', 
    title: 'Billing & Subscriptions', 
    duration: '7:20', 
    views: 892,
    description: 'Understand your billing, manage subscriptions, and upgrade your plan',
    category: 'Billing',
    thumbnail: 'https://via.placeholder.com/640x360/6366F1/FFFFFF?text=Billing+%26+Subscriptions',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ'
  }
];

// Helper function to render markdown-like content
const formatArticleContent = (content: string) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let key = 0;

  lines.forEach((line, index) => {
    // Bold text: **text** -> <strong>
    let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Bullet points: • item or - item
    if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
      elements.push(
        <li key={key++} className="ml-4 text-gray-700" dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[•-]\s*/, '') }} />
      );
    }
    // Numbered items: 1. item
    else if (/^\d+\.\s/.test(line.trim())) {
      elements.push(
        <li key={key++} className="ml-4 text-gray-700" dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^\d+\.\s*/, '') }} />
      );
    }
    // Empty lines
    else if (line.trim() === '') {
      elements.push(<br key={key++} />);
    }
    // Regular paragraphs
    else {
      elements.push(
        <p key={key++} className="text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: formattedLine }} />
      );
    }
  });

  return <div className="space-y-3">{elements}</div>;
};

export const HelpCenter: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(null);
  const [activeTab, setActiveTab] = useState('articles');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<typeof VIDEO_TUTORIALS[0] | null>(null);
  const [videoSearchQuery, setVideoSearchQuery] = useState('');
  const [showChatDialog, setShowChatDialog] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  
  // Live chat state
  const [isSupportOnline, setIsSupportOnline] = useState(true); // Simulated - would be from WebSocket/API
  const [chatMessages, setChatMessages] = useState<Array<{id: string; text: string; sender: 'user' | 'support'; timestamp: Date}>>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showOfflineForm, setShowOfflineForm] = useState(false);
  
  // Simulate checking support availability (in real app: WebSocket connection)
  useEffect(() => {
    const checkSupportHours = () => {
      const now = new Date();
      const hour = now.getHours();
      const day = now.getDay();
      // Mon-Fri (1-5), 9am-5pm EST
      const isBusinessHours = day >= 1 && day <= 5 && hour >= 9 && hour < 17;
      setIsSupportOnline(isBusinessHours);
    };
    checkSupportHours();
    const interval = setInterval(checkSupportHours, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const filteredArticles = HELP_ARTICLES.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVideos = VIDEO_TUTORIALS.filter(video =>
    video.title.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
    video.description.toLowerCase().includes(videoSearchQuery.toLowerCase()) ||
    video.category.toLowerCase().includes(videoSearchQuery.toLowerCase())
  );

  const videoCategories = Array.from(new Set(VIDEO_TUTORIALS.map(v => v.category)));
  const categories = Array.from(new Set(HELP_ARTICLES.map(a => a.category)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">How can we help you?</h1>
        <p className="text-gray-600 mb-6">Search our knowledge base or browse categories</p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for help articles..."
            className="w-full pl-12 pr-4 py-4 border rounded-lg text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('articles')}>
          <CardContent className="pt-6 text-center">
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Book className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-1">Documentation</h3>
            <p className="text-sm text-gray-600">Detailed guides and references</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('videos')}>
          <CardContent className="pt-6 text-center">
            <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Video className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-1">Video Tutorials</h3>
            <p className="text-sm text-gray-600">Learn with step-by-step videos</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setActiveTab('contact')}>
          <CardContent className="pt-6 text-center">
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-1">Live Chat</h3>
            <p className="text-sm text-gray-600">Chat with our support team</p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => {
          setActiveTab('articles');
          setSelectedCategory('FAQ');
        }}>
          <CardContent className="pt-6 text-center">
            <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="h-6 w-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-1">FAQs</h3>
            <p className="text-sm text-gray-600">Common questions answered</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
          <TabsTrigger value="articles">Articles</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-6">
          {/* Categories */}
          <div className="grid md:grid-cols-3 gap-4">
            {categories.map((category) => {
              const articleCount = HELP_ARTICLES.filter(a => a.category === category).length;
              return (
                <Card key={category} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">{category}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {articleCount} {articleCount === 1 ? 'article' : 'articles'}
                    </p>
                    <Button variant="link" className="p-0" onClick={() => { 
                      setSelectedCategory(category);
                      setSearchQuery(category);
                    }}>
                      View all <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Popular Articles */}
          <Card>
            <CardHeader>
              <CardTitle>
                {searchQuery ? `Search Results (${filteredArticles.length})` : 'Popular Articles'}
              </CardTitle>
              <CardDescription>
                {searchQuery ? 'Articles matching your search' : 'Most viewed help articles'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {filteredArticles.map((article) => (
                    <div
                      key={article.id}
                      className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <h4 className="font-semibold">{article.title}</h4>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{article.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <Badge variant="outline" className="text-xs">
                              {article.category}
                            </Badge>
                            <span>{article.views} views</span>
                            <span>{article.helpful}% found helpful</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="videos" className="space-y-6">
          {/* Video Search */}
          <Card>
            <CardContent className="pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search video tutorials..."
                  className="w-full pl-9 pr-3 py-2 border rounded-md"
                  value={videoSearchQuery}
                  onChange={(e) => setVideoSearchQuery(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Video Categories */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant={videoSearchQuery === '' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setVideoSearchQuery('')}
            >
              All Videos
            </Button>
            {videoCategories.map((category) => (
              <Button 
                key={category}
                variant="outline" 
                size="sm"
                onClick={() => setVideoSearchQuery(category)}
              >
                {category}
              </Button>
            ))}
          </div>

          {/* Video Grid */}
          <Card>
            <CardHeader>
              <CardTitle>
                {videoSearchQuery ? `Filtered Videos (${filteredVideos.length})` : 'Video Tutorials'}
              </CardTitle>
              <CardDescription>Watch and learn at your own pace</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredVideos.map((video) => (
                  <div
                    key={video.id}
                    className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow group"
                    onClick={() => setSelectedVideo(video)}
                  >
                    <div className="aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative overflow-hidden">
                      <img 
                        src={video.thumbnail} 
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                          <Video className="h-8 w-8 text-blue-600 ml-1" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                        {video.duration}
                      </div>
                    </div>
                    <div className="p-4">
                      <Badge variant="outline" className="text-xs mb-2">
                        {video.category}
                      </Badge>
                      <h4 className="font-semibold mb-1">{video.title}</h4>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{video.description}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{video.views} views</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {filteredVideos.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Video className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No videos found matching your search</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Video Player Dialog */}
          {selectedVideo && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedVideo(null)}
            >
              <div 
                className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 border-b flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{selectedVideo.title}</h3>
                    <p className="text-sm text-gray-600">{selectedVideo.description}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedVideo(null)}
                  >
                    ✕
                  </Button>
                </div>
                <div className="aspect-video bg-black">
                  <iframe
                    src={selectedVideo.videoUrl}
                    title={selectedVideo.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-4 border-t bg-gray-50">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <Badge>{selectedVideo.category}</Badge>
                      <span className="text-gray-600">{selectedVideo.duration}</span>
                      <span className="text-gray-600">{selectedVideo.views} views</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        // TODO: Add to watch later or favorites
                        console.log('Add to favorites:', selectedVideo.id);
                      }}
                    >
                      Add to Favorites
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="contact" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Get help from our team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Email Support</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Typically responds within 24 hours
                    </p>
                    <a href="mailto:support@smartequiz.com" className="text-sm text-blue-600 hover:underline">
                      support@smartequiz.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Live Chat</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Available Mon-Fri, 9am-5pm EST
                    </p>
                    <Button size="sm" onClick={() => setShowChatDialog(true)}>
                      Start Chat
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 border rounded-lg">
                  <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Phone Support</h4>
                    <p className="text-sm text-gray-600 mb-2">
                      Enterprise plans only
                    </p>
                    <a href="tel:+1234567890" className="text-sm text-blue-600 hover:underline">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Submit a Ticket</CardTitle>
                <CardDescription>We'll get back to you soon</CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  // TODO: Implement ticket submission to backend
                  console.log('Submit support ticket');
                  alert('Support ticket submitted! We\'ll get back to you within 24 hours.');
                }}>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select className="w-full px-3 py-2 border rounded-md" required>
                      <option>Technical Issue</option>
                      <option>Billing Question</option>
                      <option>Feature Request</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md"
                      rows={6}
                      placeholder="Describe your issue in detail..."
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">Submit Ticket</Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Article View Dialog */}
      {selectedArticle && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedArticle(null)}
        >
          <div 
            className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <Badge variant="outline" className="mb-2">
                    {selectedArticle.category}
                  </Badge>
                  <h2 className="text-2xl font-bold mb-2">{selectedArticle.title}</h2>
                  <p className="text-gray-600">{selectedArticle.description}</p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setSelectedArticle(null)}
                >
                  ✕
                </Button>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>👁️ {selectedArticle.views} views</span>
                <span>👍 {selectedArticle.helpful}% found helpful</span>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-6">
              <div className="prose max-w-none">
                {formatArticleContent(selectedArticle.content)}
              </div>
            </ScrollArea>
            
            <div className="p-4 border-t bg-gray-50">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">Was this article helpful?</p>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // TODO: Track helpful vote
                      console.log('Article helpful:', selectedArticle.id);
                      alert('Thanks for your feedback!');
                    }}
                  >
                    👍 Yes
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: Track not helpful vote
                      console.log('Article not helpful:', selectedArticle.id);
                      alert("Thanks for your feedback! We'll work to improve this article.");
                    }}
                  >
                    👎 No
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Live Chat Dialog */}
      {showChatDialog && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4"
          onClick={() => setShowChatDialog(false)}
        >
          <div 
            className="bg-white rounded-t-lg sm:rounded-lg w-full sm:max-w-md sm:max-h-[600px] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b flex items-center justify-between bg-green-600 text-white rounded-t-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center relative">
                  <MessageCircle className="h-5 w-5" />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    isSupportOnline ? 'bg-green-400' : 'bg-gray-400'
                  }`} />
                </div>
                <div>
                  <h3 className="font-bold">Live Support Chat</h3>
                  <p className="text-xs opacity-90">
                    {isSupportOnline ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        Online - We'll reply in a few minutes
                      </span>
                    ) : (
                      'Currently offline - Leave a message'
                    )}
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="text-white hover:bg-white hover:bg-opacity-20"
                onClick={() => setShowChatDialog(false)}
              >
                ✕
              </Button>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50 space-y-4">
              {/* Welcome Message */}
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white rounded-lg p-3 max-w-[80%] shadow-sm">
                  <p className="text-sm">
                    👋 Hi! Welcome to Smart eQuiz support. {isSupportOnline ? 'How can we help you today?' : 'We\'re currently offline. Please leave a message and we\'ll get back to you via email within 24 hours.'}
                  </p>
                </div>
              </div>
              
              {/* Message History */}
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                  {msg.sender === 'support' && (
                    <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className={`rounded-lg p-3 max-w-[80%] shadow-sm ${
                    msg.sender === 'user' ? 'bg-green-600 text-white' : 'bg-white'
                  }`}>
                    <p className="text-sm">{msg.text}</p>
                    <p className={`text-xs mt-1 ${
                      msg.sender === 'user' ? 'text-green-100' : 'text-gray-500'
                    }`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}} />
                      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}} />
                    </div>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="space-y-2">
                <p className="text-xs text-gray-500 text-center">Quick actions:</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors"
                    onClick={() => {
                      setChatMessage("I'm experiencing a technical issue with...");
                      document.getElementById('chat-input')?.focus();
                    }}
                  >
                    🔧 Technical Issue
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors"
                    onClick={() => {
                      setChatMessage("I have a question about billing/subscription...");
                      document.getElementById('chat-input')?.focus();
                    }}
                  >
                    💳 Billing Question
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors"
                    onClick={() => {
                      setChatMessage("I need help with my account settings...");
                      document.getElementById('chat-input')?.focus();
                    }}
                  >
                    👤 Account Help
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs hover:bg-green-50 hover:text-green-700 hover:border-green-300 transition-colors"
                    onClick={() => {
                      setChatMessage("I'd like to request a new feature...");
                      document.getElementById('chat-input')?.focus();
                    }}
                  >
                    ✨ Feature Request
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t bg-white">
              <div className="flex gap-2">
                <input
                  id="chat-input"
                  type="text"
                  placeholder="Type your message..."
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  className="flex-1 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && chatMessage.trim()) {
                      const newMessage = {
                        id: Date.now().toString(),
                        text: chatMessage,
                        sender: 'user' as const,
                        timestamp: new Date()
                      };
                      setChatMessages([...chatMessages, newMessage]);
                      
                      if (isSupportOnline) {
                        // TODO: Send to WebSocket/API
                        console.log('Send to live chat:', chatMessage);
                        // Simulate support response
                        setIsTyping(true);
                        setTimeout(() => {
                          setIsTyping(false);
                          setChatMessages(prev => [...prev, {
                            id: (Date.now() + 1).toString(),
                            text: 'Thanks for contacting us! A support agent will be with you shortly.',
                            sender: 'support',
                            timestamp: new Date()
                          }]);
                        }, 2000);
                      } else {
                        // TODO: Send to email/ticket system
                        console.log('Send offline message to email:', chatMessage);
                        setShowOfflineForm(true);
                      }
                      setChatMessage('');
                    }
                  }}
                />
                <Button 
                  size="sm" 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    if (chatMessage.trim()) {
                      const newMessage = {
                        id: Date.now().toString(),
                        text: chatMessage,
                        sender: 'user' as const,
                        timestamp: new Date()
                      };
                      setChatMessages([...chatMessages, newMessage]);
                      
                      if (isSupportOnline) {
                        // TODO: Send to WebSocket/API
                        console.log('Send to live chat:', chatMessage);
                        // Simulate support response
                        setIsTyping(true);
                        setTimeout(() => {
                          setIsTyping(false);
                          setChatMessages(prev => [...prev, {
                            id: (Date.now() + 1).toString(),
                            text: 'Thanks for contacting us! A support agent will be with you shortly.',
                            sender: 'support',
                            timestamp: new Date()
                          }]);
                        }, 2000);
                      } else {
                        // TODO: Send to email/ticket system
                        console.log('Send offline message to email:', chatMessage);
                        setShowOfflineForm(true);
                      }
                      setChatMessage('');
                    }
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {isSupportOnline ? (
                  'Live chat is available Mon-Fri, 9am-5pm EST'
                ) : (
                  <span className="text-orange-600 font-medium">
                    ⏰ Offline - Available Mon-Fri, 9am-5pm EST. Your message will be sent via email.
                  </span>
                )}
              </p>
              
              {/* Offline Email Form */}
              {showOfflineForm && !isSupportOnline && (
                <div className="absolute inset-0 bg-white p-4 flex flex-col gap-3">
                  <h4 className="font-bold text-gray-900">We'll email you back</h4>
                  <p className="text-sm text-gray-600">Please provide your email so we can respond to your message.</p>
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const email = e.currentTarget.value;
                        if (email) {
                          console.log('Offline message with email:', email);
                          alert(`Message sent!\n\nWe'll reply to ${email} within 24 hours.`);
                          setShowOfflineForm(false);
                          setShowChatDialog(false);
                          setChatMessages([]);
                        }
                      }
                    }}
                  />
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setShowOfflineForm(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      onClick={(e) => {
                        const input = (e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement);
                        const email = input?.value;
                        if (email) {
                          console.log('Offline message with email:', email);
                          alert(`Message sent!\n\nWe'll reply to ${email} within 24 hours.`);
                          setShowOfflineForm(false);
                          setShowChatDialog(false);
                          setChatMessages([]);
                        }
                      }}
                    >
                      Send Message
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpCenter;
