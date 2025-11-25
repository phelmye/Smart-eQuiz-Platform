# Beta Program - Quick Start Guide

**Welcome to Smart eQuiz Platform Beta!**

Thank you for joining our beta program. This guide will help you get started with the platform in under 15 minutes.

---

## 📋 Table of Contents

1. [Account Setup](#1-account-setup)
2. [Organization Configuration](#2-organization-configuration)
3. [Creating Your First Tournament](#3-creating-your-first-tournament)
4. [Adding Questions](#4-adding-questions)
5. [Inviting Participants](#5-inviting-participants)
6. [Running a Live Tournament](#6-running-a-live-tournament)
7. [Viewing Results](#7-viewing-results)
8. [Getting Help](#8-getting-help)

---

## 1. Account Setup

### Step 1: Access Your Beta Account

You should have received an email with:
- Your organization's unique URL: `https://[your-church].smartequiz.com`
- Temporary admin credentials
- Beta program Slack channel invite

### Step 2: First Login

1. Visit your organization's URL
2. Log in with the temporary credentials
3. **IMPORTANT:** Change your password immediately:
   - Click your profile icon (top right)
   - Select "Account Settings"
   - Click "Change Password"
   - Create a strong password (min 8 chars, uppercase, lowercase, number, special char)

### Step 3: Complete Your Profile

1. Navigate to "My Profile"
2. Update your information:
   - Full name
   - Email address (verify it's correct)
   - Phone number (optional, for SMS notifications)
   - Profile photo (optional)
3. Click "Save Changes"

**✅ Checkpoint:** You can now access the dashboard with your new credentials.

---

## 2. Organization Configuration

### Step 1: Organization Details

1. Go to "Settings" → "Organization"
2. Update basic information:
   - Organization name (your church name)
   - Logo (upload church logo, recommended 200x200px PNG)
   - Description (brief intro to your quiz program)
   - Website URL
   - Contact email
3. Click "Save Organization"

### Step 2: Customize Branding (Optional)

1. In "Settings" → "Branding":
   - Primary color (matches your church branding)
   - Secondary color
   - Preview theme changes
2. Click "Apply Theme"

**Your organization now has a personalized look!**

### Step 3: Configure Email Settings

1. Go to "Settings" → "Communications"
2. Review default email templates:
   - Welcome email (sent to new participants)
   - Tournament invitation
   - Results notification
3. Customize templates with your church's voice (optional)

**✅ Checkpoint:** Your organization is configured and branded.

---

## 3. Creating Your First Tournament

### Step 1: Navigate to Tournaments

1. Click "Tournaments" in the sidebar
2. Click "+ Create Tournament" button

### Step 2: Basic Information

Fill in tournament details:

- **Tournament Name:** e.g., "November Bible Quiz - Book of Acts"
- **Description:** Brief overview of the tournament
- **Start Date/Time:** When the tournament begins
- **Duration:** How long participants have to complete (e.g., 60 minutes)
- **Tournament Type:** 
  - **Practice:** Participants can retake, see correct answers
  - **Competitive:** One attempt, timed, ranked results
  - **Live:** Real-time moderated quiz

**Recommendation for first tournament:** Start with "Practice" type.

### Step 3: Tournament Settings

Configure tournament rules:

- **Questions per Round:** 20 (recommended for first tournament)
- **Time per Question:** 30 seconds (adjustable)
- **Passing Score:** 70% (customize as needed)
- **Allow Retakes:** Yes (for practice mode)
- **Randomize Questions:** Yes (prevents memorization)
- **Show Correct Answers:** After completion (for learning)

### Step 4: Advanced Options (Optional)

- **Qualification Requirements:** None (for first tournament)
- **Team Mode:** Disabled (start with individual)
- **Live Moderation:** Disabled (practice mode doesn't need it)

### Step 5: Review and Create

1. Review all settings in the summary panel
2. Click "Create Tournament"
3. You'll see: "Tournament created successfully! Now add questions."

**✅ Checkpoint:** Your first tournament is created but needs questions.

---

## 4. Adding Questions

You have **three ways** to add questions. We recommend starting with AI Generation for speed.

### Method 1: AI Question Generator (Fastest) ⚡

1. From the tournament page, click "Add Questions" → "AI Generate"
2. Configure generation:
   - **Topic/Scripture:** "Acts 1-5" (or your chosen passage)
   - **Difficulty:** Medium (for balanced questions)
   - **Question Type:** Multiple Choice (easiest for participants)
   - **Number of Questions:** 20
3. Click "Generate Questions"
4. **Review AI-generated questions:**
   - Read each question for accuracy
   - Edit any that need adjustment
   - Delete any that don't fit
   - Add explanations (optional but helpful)
5. Click "Add All to Tournament"

**Time saved:** ~15 minutes vs manual creation

### Method 2: Question Bank (Reusable)

1. Go to "Question Bank" in sidebar
2. Click "+ Create Question"
3. Fill in question details:
   - **Question Text:** "Who was the first person to speak in tongues on Pentecost?"
   - **Type:** Multiple Choice
   - **Difficulty:** Easy / Medium / Hard
   - **Scripture Reference:** Acts 2:4 (for context)
   - **Answer Options:**
     - Peter ✓ (mark as correct)
     - John
     - James
     - Andrew
   - **Explanation:** "Peter stood up and addressed the crowd (Acts 2:14)"
4. Click "Save Question"
5. Assign to tournament:
   - Click "Assign to Tournament"
   - Select your tournament
   - Click "Add"

**Benefit:** Questions saved in bank can be reused in future tournaments.

### Method 3: Import from File (Bulk Upload)

1. Download the question template (CSV format)
2. Fill in questions following the format:
   ```csv
   Question,Type,Difficulty,Answer A,Answer B,Answer C,Answer D,Correct,Reference
   "Who was...",multiple_choice,medium,"Peter","John","James","Andrew",A,"Acts 2:4"
   ```
3. Go to tournament → "Add Questions" → "Import CSV"
4. Upload your file
5. Review imported questions
6. Click "Confirm Import"

**Best for:** Migrating existing question sets.

### Step 6: Verify Questions

1. Go to tournament details
2. Click "Preview Questions"
3. Take the quiz yourself to verify:
   - Questions load correctly
   - Correct answers are marked properly
   - Timing works as expected
   - Explanations display after answers

**✅ Checkpoint:** Tournament has 20 questions and is ready for participants.

---

## 5. Inviting Participants

### Step 1: Add Participants

**Option A: Individual Invites**

1. Go to "Participants" in sidebar
2. Click "+ Add Participant"
3. Enter participant details:
   - First name
   - Last name
   - Email address
   - Age group (optional, for age-based tournaments)
   - Team (optional, leave blank for now)
4. Click "Send Invitation"

Participant receives an email with:
- Welcome message
- Login credentials (temporary password)
- Link to your organization's platform

**Option B: Bulk Import**

1. Download participant template (CSV)
2. Fill in participant information
3. Go to "Participants" → "Import CSV"
4. Upload file
5. Click "Send All Invitations"

**Option C: Self-Registration Link**

1. Go to "Settings" → "Registration"
2. Copy your organization's registration link
3. Share link via:
   - Church bulletin
   - Email newsletter
   - Social media
   - WhatsApp group
4. Participants can self-register and join

**Recommendation:** Use self-registration link for easiest onboarding.

### Step 2: Assign Participants to Tournament

1. Open your tournament
2. Click "Add Participants" button
3. Select participants from list (or check "All")
4. Click "Add to Tournament"
5. Optionally send notification:
   - Check "Send email notification"
   - Review email preview
   - Click "Send Invitations"

**✅ Checkpoint:** Participants are invited and can access the tournament.

---

## 6. Running a Live Tournament

### Step 1: Prepare for Live Session

**1 Day Before:**
- [ ] Verify all questions are finalized
- [ ] Test the tournament yourself (use "Preview" mode)
- [ ] Send reminder email to participants
- [ ] Prepare any physical materials (prizes, certificates)

**1 Hour Before:**
- [ ] Log in and test your internet connection
- [ ] Open the tournament dashboard
- [ ] Verify participant list is complete
- [ ] Share joining instructions with participants

### Step 2: Start the Tournament

**For Practice/Competitive Tournaments:**
1. Go to tournament page
2. Click "Start Tournament" button
3. Tournament becomes active immediately
4. Participants can begin when ready

**For Live Moderated Tournaments:**
1. Click "Start Live Session"
2. Wait for participants to join (you'll see them appear)
3. Share your screen if presenting questions visually
4. Click "Begin First Question"
5. Timer starts automatically
6. Monitor participant responses in real-time
7. After timer expires, click "Reveal Answer"
8. Review correct answer and explanation
9. Click "Next Question" to continue

### Step 3: Monitor Progress

**Real-Time Dashboard shows:**
- Number of active participants
- Current question number
- Average response time
- Correct answer percentage
- Live leaderboard (if enabled)

**Moderator Controls:**
- Pause tournament (if technical issues)
- Skip question (if necessary)
- Extend time (for special circumstances)
- Kick participant (if disruptive)

### Step 4: End the Tournament

**Manual End:**
1. Click "End Tournament" button
2. Confirm action
3. Tournament closes, no more submissions accepted

**Automatic End:**
- Tournament ends when time expires
- Or when all participants finish (whichever comes first)

**✅ Checkpoint:** Tournament is complete, results are ready.

---

## 7. Viewing Results

### Step 1: Access Results

1. Go to "Tournaments" → Select your tournament
2. Click "Results" tab

### Step 2: View Participant Performance

**Leaderboard View:**
- Participants ranked by score
- Shows: Name, Score (%), Time taken, Rank
- Filter by: Team, Age group, Score range

**Individual Reports:**
1. Click on a participant's name
2. View detailed breakdown:
   - Questions answered correctly/incorrectly
   - Time per question
   - Areas of strength/weakness
   - Scripture passage performance

### Step 3: Export Results

**CSV Export:**
1. Click "Export Results" button
2. Choose export format:
   - Summary (scores only)
   - Detailed (question-by-question breakdown)
3. Click "Download CSV"
4. Open in Excel/Google Sheets

**PDF Certificates:**
1. Click "Generate Certificates"
2. Select participants (top 3, all, custom)
3. Choose certificate template
4. Click "Generate and Download"
5. Print or email certificates

### Step 4: Analytics

**Tournament Analytics tab shows:**
- Participation rate (invited vs completed)
- Average score
- Question difficulty analysis (% correct per question)
- Time distribution
- Completion rate

**Use insights to:**
- Identify questions that were too easy/hard
- Understand participant engagement
- Plan future tournaments

**✅ Checkpoint:** Results reviewed, certificates generated, insights gathered.

---

## 8. Getting Help

### Beta Support Channels

**1. Slack Community (Fastest)**
- Join: `#beta-smart-equiz` channel
- Response time: < 2 hours during business hours
- Perfect for: Quick questions, troubleshooting, feature requests

**2. Email Support**
- Email: `beta-support@smartequiz.com`
- Response time: < 24 hours
- Perfect for: Detailed issues, bug reports, account problems

**3. Video Tutorials**
- Access: Platform → "Help" → "Video Tutorials"
- Topics covered:
  - Getting started (5 min)
  - Creating tournaments (8 min)
  - AI question generation (6 min)
  - Running live quizzes (10 min)
  - Analyzing results (7 min)

**4. Knowledge Base**
- Access: `help.smartequiz.com`
- Search for: Specific features, error messages, best practices
- Updated weekly with new articles

**5. Weekly Office Hours**
- Schedule: Every Thursday 2-3 PM EST
- Zoom link: Sent via email
- Format: Q&A session, feature demos, feedback discussion

### Reporting Bugs

Found a bug? Help us improve!

**Bug Report Template:**
```
**What happened?**
[Describe the issue]

**What were you trying to do?**
[Your intended action]

**Steps to reproduce:**
1. Go to...
2. Click on...
3. See error

**Expected behavior:**
[What should have happened]

**Screenshots:**
[Attach if helpful]

**Browser/Device:**
[Chrome 120 on Windows, Safari on iPhone, etc.]
```

**Submit via:**
- Slack: Post in #beta-bugs channel
- Email: beta-support@smartequiz.com
- In-app: Click "Report Bug" button (bottom right)

### Feature Requests

Have an idea? We want to hear it!

**Feature Request Template:**
```
**Feature name:**
[Brief title]

**Problem it solves:**
[What challenge does this address?]

**How it would work:**
[Describe the user experience]

**Who benefits:**
[Quiz coordinators, participants, admins?]

**Priority:**
[Nice to have / Important / Critical]
```

**Submit via:**
- Slack: #beta-feature-requests channel
- Email: feedback@smartequiz.com

---

## 🎉 Congratulations!

You've completed the Quick Start Guide. You now know how to:

- ✅ Set up your account and organization
- ✅ Create and configure tournaments
- ✅ Add questions (manually, AI, or import)
- ✅ Invite and manage participants
- ✅ Run live tournament sessions
- ✅ View and export results
- ✅ Get help when needed

### Next Steps

**Week 1 Goals:**
- [ ] Create and run your first practice tournament
- [ ] Invite 5-10 participants
- [ ] Test AI question generation
- [ ] Review results and analytics

**Week 2 Goals:**
- [ ] Build a question bank (50+ questions)
- [ ] Run your first competitive tournament
- [ ] Collect participant feedback
- [ ] Explore team-based tournaments

**Week 3 Goals:**
- [ ] Try live moderated tournament
- [ ] Create custom branding theme
- [ ] Set up recurring tournaments
- [ ] Integrate with your church calendar

### Beta Program Expectations

**Your Commitment:**
- Run at least 2 tournaments per month
- Provide feedback via weekly surveys
- Report bugs and issues promptly
- Participate in monthly check-in calls
- Share success stories and testimonials

**Our Commitment:**
- Respond to support requests within 24 hours
- Fix critical bugs within 48 hours
- Implement high-priority feature requests
- Provide personalized onboarding support
- Offer extended trial period (free during beta)

### Feedback is Gold 🌟

Your feedback shapes the product. Please share:

**What's working well:**
- Features you love
- Smooth experiences
- Time savers

**What needs improvement:**
- Confusing interfaces
- Missing features
- Performance issues
- Documentation gaps

**Use cases we haven't considered:**
- How you're using the platform
- Creative applications
- Integration needs

---

## 📞 Quick Reference

**Your Organization URL:** `https://[your-church].smartequiz.com`

**Support Contacts:**
- Slack: `#beta-smart-equiz`
- Email: `beta-support@smartequiz.com`
- Office Hours: Thursdays 2-3 PM EST

**Important Links:**
- Help Center: `help.smartequiz.com`
- Video Tutorials: Platform → "Help"
- API Documentation: `api.smartequiz.com/docs`
- Status Page: `status.smartequiz.com`

**Keyboard Shortcuts:**
- `Ctrl/Cmd + K` - Quick search
- `Ctrl/Cmd + /` - Show keyboard shortcuts
- `Ctrl/Cmd + N` - Create new tournament
- `Esc` - Close modal/dialog

---

**Need help?** Don't hesitate to reach out. We're here to make your Bible quiz program successful!

**Welcome to the Smart eQuiz family! 🎊**
