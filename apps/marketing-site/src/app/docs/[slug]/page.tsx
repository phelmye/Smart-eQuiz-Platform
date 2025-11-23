import Link from 'next/link';
import { ArrowLeft, BookOpen, Code, Zap, Settings } from 'lucide-react';
import { notFound } from 'next/navigation';

// Documentation articles data
const docsArticles: Record<string, any> = {
  // Getting Started
  'quick-start-guide': {
    title: 'Quick Start Guide',
    category: 'Getting Started',
    icon: 'Zap',
    content: `
      <h2>Welcome to Smart eQuiz Platform</h2>
      <p>This guide will help you set up your Bible quiz program in under 30 minutes.</p>

      <h3>Step 1: Create Your Account</h3>
      <ol>
        <li>Visit <a href="/signup">smartequiz.com/signup</a></li>
        <li>Choose your plan (Free trial available)</li>
        <li>Enter your church information</li>
        <li>Verify your email address</li>
      </ol>

      <h3>Step 2: Set Up Your Organization</h3>
      <ol>
        <li>Navigate to <strong>Settings > Organization</strong></li>
        <li>Upload your church logo</li>
        <li>Set your timezone and preferences</li>
        <li>Configure your custom domain (Professional+ plans)</li>
      </ol>

      <h3>Step 3: Add Users</h3>
      <ol>
        <li>Go to <strong>Users > Add New</strong></li>
        <li>Invite coaches with org_admin or question_manager roles</li>
        <li>Bulk import participants via CSV</li>
        <li>Set up role permissions</li>
      </ol>

      <h3>Step 4: Create Your First Tournament</h3>
      <ol>
        <li>Click <strong>Tournaments > Create New</strong></li>
        <li>Select tournament type (Single Elimination, Round Robin, Swiss)</li>
        <li>Define Scripture scope and rules</li>
        <li>Generate or upload question sets</li>
        <li>Set registration deadline</li>
      </ol>

      <h3>Step 5: Start Practicing</h3>
      <ol>
        <li>Enable Practice Mode in settings</li>
        <li>Assign practice question sets to teams</li>
        <li>Share access links with participants</li>
        <li>Monitor progress via Analytics dashboard</li>
      </ol>

      <h3>Need Help?</h3>
      <p>Contact our support team at <a href="mailto:support@smartequiz.com">support@smartequiz.com</a> or use the in-app chat.</p>
    `
  },
  'platform-overview': {
    title: 'Platform Overview',
    category: 'Getting Started',
    icon: 'BookOpen',
    content: `
      <h2>Understanding Smart eQuiz Platform</h2>
      <p>Smart eQuiz is a comprehensive Bible quiz management platform with four main components:</p>

      <h3>1. Tournament Management</h3>
      <ul>
        <li><strong>Bracket Generation:</strong> Automatic seeding and bracket creation</li>
        <li><strong>Real-time Scoring:</strong> Live updates during matches</li>
        <li><strong>Multiple Formats:</strong> Single/double elimination, round-robin, Swiss</li>
        <li><strong>Live Streaming:</strong> Broadcast matches to remote viewers</li>
      </ul>

      <h3>2. Question Bank System</h3>
      <ul>
        <li><strong>AI Generation:</strong> Unlimited questions across all Scripture</li>
        <li><strong>Custom Categories:</strong> Organize by book, theme, difficulty</li>
        <li><strong>Bulk Import/Export:</strong> CSV and JSON support</li>
        <li><strong>Version Control:</strong> Track changes and maintain history</li>
      </ul>

      <h3>3. Practice Mode</h3>
      <ul>
        <li><strong>Individual Practice:</strong> Self-paced learning</li>
        <li><strong>Team Practice:</strong> Collaborative sessions</li>
        <li><strong>XP & Badges:</strong> Gamification for engagement</li>
        <li><strong>Progress Tracking:</strong> Detailed analytics</li>
      </ul>

      <h3>4. Analytics & Reporting</h3>
      <ul>
        <li><strong>Performance Metrics:</strong> Individual and team statistics</li>
        <li><strong>Coverage Analysis:</strong> Identify knowledge gaps</li>
        <li><strong>Participation Tracking:</strong> Attendance and engagement</li>
        <li><strong>Export Reports:</strong> PDF and Excel formats</li>
      </ul>

      <h3>Multi-Tenant Architecture</h3>
      <p>For church networks and dioceses:</p>
      <ul>
        <li>Complete data isolation per church</li>
        <li>Centralized billing and administration</li>
        <li>Optional resource sharing</li>
        <li>Network-wide tournaments</li>
      </ul>
    `
  },
  'user-roles-permissions': {
    title: 'User Roles & Permissions',
    category: 'Getting Started',
    icon: 'Settings',
    content: `
      <h2>Understanding User Roles</h2>
      <p>Smart eQuiz uses a role-based access control (RBAC) system with 9 distinct roles:</p>

      <h3>Super Admin</h3>
      <ul>
        <li>Platform-wide access (no tenant restrictions)</li>
        <li>Manage all tenants and organizations</li>
        <li>Configure platform settings</li>
        <li>Access billing and subscription management</li>
      </ul>

      <h3>Organization Admin</h3>
      <ul>
        <li>Full control within their church/organization</li>
        <li>Manage users and permissions</li>
        <li>Create and configure tournaments</li>
        <li>Access all analytics and reports</li>
        <li>Configure branding and settings</li>
      </ul>

      <h3>Question Manager</h3>
      <ul>
        <li>Create, edit, and delete questions</li>
        <li>Manage question categories</li>
        <li>Review and approve AI-generated questions</li>
        <li>Export question banks</li>
      </ul>

      <h3>Account Officer</h3>
      <ul>
        <li>Manage payments and donations</li>
        <li>Process tournament fees</li>
        <li>View financial reports</li>
        <li>Configure payment gateways</li>
      </ul>

      <h3>Inspector</h3>
      <ul>
        <li>Monitor quiz matches</li>
        <li>Verify answers and scoring</li>
        <li>Review match recordings</li>
        <li>Generate compliance reports</li>
      </ul>

      <h3>Moderator</h3>
      <ul>
        <li>Conduct quiz matches</li>
        <li>Read questions and manage timers</li>
        <li>Record scores</li>
        <li>Handle protests and challenges</li>
      </ul>

      <h3>Participant</h3>
      <ul>
        <li>Compete in tournaments</li>
        <li>Access practice mode (if approved)</li>
        <li>View personal statistics</li>
        <li>Submit tournament applications</li>
      </ul>

      <h3>Practice User</h3>
      <ul>
        <li>Access practice mode only</li>
        <li>Cannot compete in official tournaments</li>
        <li>View limited statistics</li>
        <li>Apply for full participant status</li>
      </ul>

      <h3>Spectator</h3>
      <ul>
        <li>View live matches</li>
        <li>Access public tournament information</li>
        <li>No participation or admin rights</li>
      </ul>

      <h3>Custom Role Permissions</h3>
      <p>Professional and Enterprise plans allow custom permission sets:</p>
      <ul>
        <li>Add or remove permissions per role</li>
        <li>Create hybrid roles</li>
        <li>Set explicit denies that override grants</li>
        <li>Configure role-based content access</li>
      </ul>
    `
  },
  'installation-setup': {
    title: 'Installation & Setup',
    category: 'Getting Started',
    icon: 'Settings',
    content: `
      <h2>Installing Smart eQuiz Platform</h2>
      <p>Smart eQuiz is a cloud-based SaaS platform - no installation required! Simply access it via web browser.</p>

      <h3>System Requirements</h3>
      <h4>Supported Browsers:</h4>
      <ul>
        <li>Chrome 90+ (Recommended)</li>
        <li>Firefox 88+</li>
        <li>Safari 14+</li>
        <li>Edge 90+</li>
      </ul>

      <h4>Mobile Apps:</h4>
      <ul>
        <li>iOS 14+ (App Store)</li>
        <li>Android 10+ (Google Play)</li>
      </ul>

      <h3>Initial Configuration</h3>

      <h4>1. Organization Settings</h4>
      <pre><code>
Settings > Organization
- Organization Name: "First Baptist Church"
- Timezone: "America/New_York"
- Date Format: "MM/DD/YYYY"
- Default Currency: "USD"
      </code></pre>

      <h4>2. Branding Configuration</h4>
      <pre><code>
Settings > Branding
- Logo Upload (PNG, max 2MB, 512x512px)
- Primary Color: #1E40AF
- Secondary Color: #3B82F6
- Custom Domain: quiz.yourchurch.org (Professional+)
      </code></pre>

      <h4>3. User Import</h4>
      <p>Bulk import via CSV:</p>
      <pre><code>
name,email,role,parish_id
John Doe,john@example.com,participant,parish_1
Jane Smith,jane@example.com,org_admin,parish_1
      </code></pre>

      <h4>4. Question Bank Setup</h4>
      <ul>
        <li>Import existing questions via CSV</li>
        <li>Or use AI to generate initial question set</li>
        <li>Configure question categories</li>
        <li>Set difficulty levels</li>
      </ul>

      <h3>Integration Options</h3>

      <h4>Single Sign-On (SSO)</h4>
      <p>Enterprise plans support SAML 2.0 and OAuth 2.0:</p>
      <pre><code>
Settings > Security > SSO
- Identity Provider: Your IdP URL
- Entity ID: smartequiz.com
- ACS URL: https://smartequiz.com/auth/saml/callback
      </code></pre>

      <h4>API Access</h4>
      <p>Professional+ plans include API access:</p>
      <pre><code>
Settings > API
- Generate API Key
- Set Rate Limits
- Configure Webhooks
      </code></pre>

      <h3>Mobile App Setup</h3>
      <ol>
        <li>Download app from App Store or Google Play</li>
        <li>Enter your organization subdomain: <code>yourchurch.smartequiz.com</code></li>
        <li>Login with your credentials</li>
        <li>Enable biometric authentication (optional)</li>
      </ol>

      <h3>Hardware Setup (Optional)</h3>
      <p>For in-person tournaments:</p>
      <ul>
        <li><strong>Buzzers:</strong> USB or Bluetooth compatible buzzers</li>
        <li><strong>Displays:</strong> Large screen or projector for live scores</li>
        <li><strong>Audio:</strong> Sound system for question reading</li>
        <li><strong>Network:</strong> Reliable Wi-Fi or wired connection</li>
      </ul>
    `
  },

  // Configuration
  'tournament-settings': {
    title: 'Tournament Settings',
    category: 'Configuration',
    icon: 'Settings',
    content: `
      <h2>Configuring Tournament Settings</h2>

      <h3>Tournament Types</h3>

      <h4>Single Elimination</h4>
      <ul>
        <li>Teams compete in brackets</li>
        <li>Losing teams are eliminated</li>
        <li>Best for time-constrained events</li>
        <li>Requires 4, 8, 16, 32, or 64 teams (power of 2)</li>
      </ul>

      <h4>Double Elimination</h4>
      <ul>
        <li>Teams get a second chance</li>
        <li>Winners and losers brackets</li>
        <li>More matches, fairer results</li>
        <li>Approximately 2x duration of single elimination</li>
      </ul>

      <h4>Round Robin</h4>
      <ul>
        <li>Every team plays every other team</li>
        <li>Most fair but time-intensive</li>
        <li>Best for 4-8 teams</li>
        <li>Total matches = n × (n-1) / 2</li>
      </ul>

      <h4>Swiss Format</h4>
      <ul>
        <li>Teams matched by performance</li>
        <li>No elimination</li>
        <li>Fixed number of rounds</li>
        <li>Ideal for large tournaments</li>
      </ul>

      <h3>Scoring Rules</h3>

      <h4>Points per Correct Answer</h4>
      <pre><code>
Standard: 20 points
Bonus Questions: 30 points
Challenge Questions: 50 points
      </code></pre>

      <h4>Penalty System</h4>
      <ul>
        <li><strong>No Penalty:</strong> 0 points deduction</li>
        <li><strong>Light Penalty:</strong> -5 points for incorrect answers</li>
        <li><strong>Standard Penalty:</strong> -10 points for incorrect answers</li>
        <li><strong>Severe Penalty:</strong> -20 points for incorrect answers</li>
      </ul>

      <h4>Time Limits</h4>
      <pre><code>
Question Reading: No limit (moderator paced)
Buzzer Response Time: 3 seconds (configurable 1-10s)
Answer Time: 30 seconds (configurable 10-60s)
Challenge Discussion: 5 minutes
      </code></pre>

      <h3>Match Settings</h3>

      <h4>Match Duration</h4>
      <ul>
        <li><strong>Timed:</strong> 20, 30, or 45 minutes</li>
        <li><strong>Question-based:</strong> 20, 30, or 50 questions</li>
        <li><strong>Score-based:</strong> First to 200, 300, or 500 points</li>
      </ul>

      <h4>Overtime Rules</h4>
      <pre><code>
If tied at end of regulation:
1. Sudden Death: First correct answer wins
2. Extended Play: 5 additional questions, highest score wins
3. Tiebreaker Question: Single question, winner takes match
      </code></pre>

      <h3>Registration Settings</h3>

      <h4>Team Requirements</h4>
      <pre><code>
Minimum Team Size: 3 players
Maximum Team Size: 6 players
Substitutions Allowed: Yes/No
Registration Fee: $0-$500
Registration Deadline: Date/Time
      </code></pre>

      <h4>Participant Requirements</h4>
      <ul>
        <li>Age restrictions (if any)</li>
        <li>Grade level limitations</li>
        <li>Affiliation requirements</li>
        <li>Qualification criteria</li>
      </ul>

      <h3>Advanced Settings</h3>

      <h4>Question Distribution</h4>
      <pre><code>
Old Testament: 40%
New Testament: 60%

Or by difficulty:
Easy: 30%
Medium: 50%
Hard: 20%
      </code></pre>

      <h4>Live Streaming</h4>
      <ul>
        <li>Enable public streaming</li>
        <li>Set viewer permissions</li>
        <li>Configure delay (0-60 seconds)</li>
        <li>Enable chat for viewers</li>
      </ul>

      <h4>Notifications</h4>
      <ul>
        <li>Email notifications for key events</li>
        <li>SMS alerts for coaches (Professional+)</li>
        <li>Push notifications via mobile app</li>
        <li>Webhook integration for custom systems</li>
      </ul>
    `
  },

  // API Reference (abbreviated for space)
  'api-getting-started': {
    title: 'API Getting Started',
    category: 'API Reference',
    icon: 'Code',
    content: `
      <h2>Smart eQuiz API Documentation</h2>
      <p>The Smart eQuiz API allows programmatic access to platform features. Available on Professional and Enterprise plans.</p>

      <h3>Authentication</h3>
      <p>All API requests require an API key:</p>
      <pre><code>
curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.smartequiz.com/v1/tournaments
      </code></pre>

      <h3>Base URL</h3>
      <pre><code>
Production: https://api.smartequiz.com/v1
Sandbox: https://sandbox-api.smartequiz.com/v1
      </code></pre>

      <h3>Quick Start Example</h3>
      <pre><code>
// Node.js example
const SmartEquiz = require('@smartequiz/sdk');

const client = new SmartEquiz({
  apiKey: process.env.SMARTEQUIZ_API_KEY
});

// Create a tournament
const tournament = await client.tournaments.create({
  name: "Spring Championship 2025",
  type: "single_elimination",
  startDate: "2025-03-15T09:00:00Z"
});

console.log(\`Tournament ID: \${tournament.id}\`);
      </code></pre>

      <h3>Common Endpoints</h3>
      <ul>
        <li><code>GET /tournaments</code> - List tournaments</li>
        <li><code>POST /tournaments</code> - Create tournament</li>
        <li><code>GET /questions</code> - List questions</li>
        <li><code>POST /questions</code> - Create question</li>
        <li><code>GET /users</code> - List users</li>
        <li><code>GET /analytics/reports</code> - Get reports</li>
      </ul>

      <h3>Rate Limits</h3>
      <ul>
        <li><strong>Professional:</strong> 1,000 requests/hour</li>
        <li><strong>Enterprise:</strong> 10,000 requests/hour</li>
        <li><strong>Custom:</strong> Contact sales for higher limits</li>
      </ul>

      <p>Full API documentation available at <a href="https://api.smartequiz.com/docs">api.smartequiz.com/docs</a></p>
    `
  },

  // Additional Getting Started Articles
  'first-tournament': {
    title: 'Creating Your First Tournament',
    category: 'Getting Started',
    icon: 'Zap',
    content: `
      <h2>Creating Your First Tournament</h2>
      <p>Learn how to set up and run your first Bible quiz tournament from start to finish.</p>

      <h3>Step 1: Define Tournament Details</h3>
      <ol>
        <li>Navigate to <strong>Tournaments > Create New</strong></li>
        <li>Enter tournament name (e.g., "Spring Championship 2025")</li>
        <li>Select tournament type:
          <ul>
            <li><strong>Single Elimination:</strong> Quick, winner moves on</li>
            <li><strong>Double Elimination:</strong> Second chance for losers</li>
            <li><strong>Round Robin:</strong> Everyone plays everyone</li>
            <li><strong>Swiss:</strong> Best for large groups</li>
          </ul>
        </li>
        <li>Set start date and registration deadline</li>
      </ol>

      <h3>Step 2: Configure Scoring Rules</h3>
      <pre><code>
Points per correct answer: 20
Bonus questions: 30
Penalty for wrong answer: -10
Time limit per question: 30 seconds
      </code></pre>

      <h3>Step 3: Set Up Question Bank</h3>
      <ol>
        <li>Choose Scripture scope (e.g., Gospel of John)</li>
        <li>Generate questions using AI or import existing</li>
        <li>Review and approve all questions</li>
        <li>Set difficulty distribution (30% easy, 50% medium, 20% hard)</li>
      </ol>

      <h3>Step 4: Team Registration</h3>
      <ul>
        <li>Enable team registration</li>
        <li>Set team size limits (e.g., 3-6 players)</li>
        <li>Configure registration fees (if applicable)</li>
        <li>Share registration link with participants</li>
      </ul>

      <h3>Step 5: Run the Tournament</h3>
      <ol>
        <li>Generate brackets automatically</li>
        <li>Assign moderators to matches</li>
        <li>Start matches and track scores in real-time</li>
        <li>Monitor progress from admin dashboard</li>
        <li>Declare winners and export reports</li>
      </ol>

      <h3>Pro Tips</h3>
      <ul>
        <li>Test your question bank with practice mode first</li>
        <li>Send reminder emails 24 hours before tournament</li>
        <li>Have backup moderators ready</li>
        <li>Enable live streaming for remote viewers</li>
      </ul>
    `
  },

  'question-banks': {
    title: 'Setting Up Question Banks',
    category: 'Getting Started',
    icon: 'BookOpen',
    content: `
      <h2>Setting Up Question Banks</h2>
      <p>Build and manage comprehensive question banks for your Bible quiz program.</p>

      <h3>Creating a New Question Bank</h3>
      <ol>
        <li>Go to <strong>Questions > Question Banks</strong></li>
        <li>Click <strong>Create New Bank</strong></li>
        <li>Enter bank name (e.g., "Gospel of John - Complete")</li>
        <li>Select Scripture scope</li>
        <li>Choose difficulty levels to include</li>
      </ol>

      <h3>Adding Questions</h3>

      <h4>Method 1: AI Generation</h4>
      <pre><code>
1. Click "Generate with AI"
2. Select Scripture passages
3. Choose question types (multiple choice, fill-in-blank, true/false)
4. Set number of questions (e.g., 100)
5. Review and edit generated questions
      </code></pre>

      <h4>Method 2: Manual Entry</h4>
      <ol>
        <li>Click <strong>Add Question</strong></li>
        <li>Enter question text</li>
        <li>Add correct answer and distractors</li>
        <li>Tag with Scripture reference</li>
        <li>Set difficulty level</li>
      </ol>

      <h4>Method 3: Bulk Import</h4>
      <p>CSV format:</p>
      <pre><code>
question,answer,difficulty,scripture_reference,category
"Who wrote the Gospel of John?","John the Apostle","easy","John 21:24","Author"
"What was the first miracle?","Turning water into wine","medium","John 2:1-11","Miracles"
      </code></pre>

      <h3>Organizing Questions</h3>
      <ul>
        <li><strong>Categories:</strong> Miracles, Parables, Teachings, Events</li>
        <li><strong>Tags:</strong> Add custom tags for easy filtering</li>
        <li><strong>Difficulty:</strong> Easy, Medium, Hard</li>
        <li><strong>Scripture Range:</strong> Chapters, verses</li>
      </ul>

      <h3>Quality Control</h3>
      <ol>
        <li>Review all AI-generated questions for accuracy</li>
        <li>Test questions in practice mode</li>
        <li>Track question performance (difficulty rating, skip rate)</li>
        <li>Update or retire poorly performing questions</li>
      </ol>

      <h3>Best Practices</h3>
      <ul>
        <li>Maintain at least 200 questions per Scripture book</li>
        <li>Balance difficulty distribution (30/50/20)</li>
        <li>Include variety of question types</li>
        <li>Regularly update and refresh questions</li>
        <li>Version control important question sets</li>
      </ul>
    `
  },

  'user-management': {
    title: 'User Management Basics',
    category: 'Getting Started',
    icon: 'Settings',
    content: `
      <h2>User Management Basics</h2>
      <p>Learn how to add, organize, and manage users in your Smart eQuiz platform.</p>

      <h3>User Roles Overview</h3>
      <ul>
        <li><strong>Organization Admin:</strong> Full control of your church/organization</li>
        <li><strong>Question Manager:</strong> Create and manage question banks</li>
        <li><strong>Moderator:</strong> Run quiz matches</li>
        <li><strong>Inspector:</strong> Monitor and verify matches</li>
        <li><strong>Participant:</strong> Compete in tournaments</li>
        <li><strong>Practice User:</strong> Access practice mode only</li>
        <li><strong>Spectator:</strong> View matches</li>
      </ul>

      <h3>Adding Individual Users</h3>
      <ol>
        <li>Navigate to <strong>Users > Add New</strong></li>
        <li>Enter user details:
          <ul>
            <li>Full name</li>
            <li>Email address</li>
            <li>Role assignment</li>
            <li>Parish/group assignment (if applicable)</li>
          </ul>
        </li>
        <li>Click <strong>Send Invitation</strong></li>
        <li>User receives email with account setup link</li>
      </ol>

      <h3>Bulk User Import</h3>
      <p>Import multiple users via CSV:</p>
      <pre><code>
name,email,role,parish_id,grade_level
John Doe,john@example.com,participant,parish_1,10
Jane Smith,jane@example.com,moderator,parish_1,adult
Mike Johnson,mike@example.com,participant,parish_2,11
      </code></pre>

      <h3>Managing User Permissions</h3>
      <p>Customize permissions for each role:</p>
      <ol>
        <li>Go to <strong>Settings > Roles & Permissions</strong></li>
        <li>Select role to customize</li>
        <li>Toggle permissions:
          <ul>
            <li>Create/edit/delete questions</li>
            <li>Manage tournaments</li>
            <li>View analytics</li>
            <li>Access financial data</li>
            <li>Moderate matches</li>
          </ul>
        </li>
        <li>Save changes</li>
      </ol>

      <h3>User Groups</h3>
      <p>Organize users into groups:</p>
      <ul>
        <li><strong>Teams:</strong> Competition groups</li>
        <li><strong>Parishes:</strong> Church locations</li>
        <li><strong>Grade Levels:</strong> Age-based groupings</li>
        <li><strong>Custom Groups:</strong> Any organizational structure</li>
      </ul>

      <h3>Deactivating Users</h3>
      <ol>
        <li>Find user in user list</li>
        <li>Click <strong>Actions > Deactivate</strong></li>
        <li>User loses access but data is preserved</li>
        <li>Can be reactivated anytime</li>
      </ol>
    `
  },

  // Platform Features
  'tournaments': {
    title: 'Tournament Management',
    category: 'Platform Features',
    icon: 'Settings',
    content: `
      <h2>Tournament Management</h2>
      <p>Comprehensive guide to creating and managing Bible quiz tournaments.</p>

      <h3>Tournament Types</h3>

      <h4>Single Elimination</h4>
      <ul>
        <li>Teams compete in brackets</li>
        <li>Lose once, you're eliminated</li>
        <li>Fast and efficient</li>
        <li>Best for time-constrained events</li>
      </ul>

      <h4>Double Elimination</h4>
      <ul>
        <li>Winners and losers brackets</li>
        <li>Second chance for all teams</li>
        <li>More matches, fairer results</li>
        <li>Approximately 2x duration</li>
      </ul>

      <h4>Round Robin</h4>
      <ul>
        <li>Every team plays every other team</li>
        <li>Most comprehensive results</li>
        <li>Time-intensive</li>
        <li>Best for 4-8 teams</li>
      </ul>

      <h4>Swiss System</h4>
      <ul>
        <li>Teams paired by similar performance</li>
        <li>No elimination</li>
        <li>Fixed number of rounds</li>
        <li>Ideal for large tournaments</li>
      </ul>

      <h3>Tournament Lifecycle</h3>
      <ol>
        <li><strong>Planning:</strong> Set dates, rules, Scripture scope</li>
        <li><strong>Registration:</strong> Teams sign up, pay fees</li>
        <li><strong>Seeding:</strong> Rank teams for bracket placement</li>
        <li><strong>Execution:</strong> Run matches, track scores</li>
        <li><strong>Completion:</strong> Award winners, generate reports</li>
      </ol>

      <h3>Match Configuration</h3>
      <pre><code>
Match Duration: 30 minutes or 25 questions
Buzzer Response Time: 3 seconds
Answer Time Limit: 30 seconds
Overtime: Sudden death (first correct wins)
Challenge Time: 5 minutes discussion
      </code></pre>

      <h3>Live Features</h3>
      <ul>
        <li><strong>Real-time Scoring:</strong> Instant score updates</li>
        <li><strong>Live Streaming:</strong> Broadcast to remote viewers</li>
        <li><strong>Live Chat:</strong> Viewer interaction</li>
        <li><strong>Stats Dashboard:</strong> Live tournament statistics</li>
      </ul>

      <h3>Post-Tournament</h3>
      <ol>
        <li>Export results and statistics</li>
        <li>Generate certificates for winners</li>
        <li>Share match recordings</li>
        <li>Archive tournament data</li>
        <li>Collect feedback from participants</li>
      </ol>
    `
  },

  'ai-generator': {
    title: 'AI Question Generator',
    category: 'Platform Features',
    icon: 'Zap',
    content: `
      <h2>AI Question Generator</h2>
      <p>Leverage artificial intelligence to create unlimited Bible quiz questions.</p>

      <h3>How It Works</h3>
      <p>Our AI analyzes Scripture passages and generates questions using:</p>
      <ul>
        <li>Natural language processing</li>
        <li>Contextual understanding</li>
        <li>Difficulty calibration</li>
        <li>Answer validation</li>
      </ul>

      <h3>Generating Questions</h3>
      <ol>
        <li>Select Scripture passage (book, chapter, verses)</li>
        <li>Choose question types:
          <ul>
            <li>Multiple choice</li>
            <li>Fill in the blank</li>
            <li>True/False</li>
            <li>Short answer</li>
          </ul>
        </li>
        <li>Set difficulty level</li>
        <li>Specify number of questions</li>
        <li>Click <strong>Generate</strong></li>
      </ol>

      <h3>Quality Assurance</h3>
      <p>AI-generated questions go through validation:</p>
      <ol>
        <li><strong>Scripture Accuracy:</strong> Verified against source text</li>
        <li><strong>Clarity Check:</strong> Unambiguous wording</li>
        <li><strong>Difficulty Calibration:</strong> Appropriate challenge level</li>
        <li><strong>Distractor Quality:</strong> Plausible wrong answers</li>
      </ol>

      <h3>Review & Edit</h3>
      <p>Always review AI-generated questions:</p>
      <ul>
        <li>Verify theological accuracy</li>
        <li>Check Scripture references</li>
        <li>Adjust difficulty if needed</li>
        <li>Edit for clarity</li>
        <li>Approve or reject each question</li>
      </ul>

      <h3>Best Practices</h3>
      <ul>
        <li>Generate 2-3x more questions than needed</li>
        <li>Review all questions before use</li>
        <li>Mix AI and manually-created questions</li>
        <li>Track question performance over time</li>
        <li>Retire low-quality questions</li>
      </ul>

      <h3>Advanced Settings</h3>
      <pre><code>
Focus Areas:
- Character names and roles
- Key events and chronology
- Theological concepts
- Direct quotations
- Historical context

Question Complexity:
- Surface level (who, what, where)
- Understanding (why, how)
- Application (meaning, significance)
      </code></pre>
    `
  },

  'multi-tenant': {
    title: 'Multi-Tenant Architecture',
    category: 'Platform Features',
    icon: 'Settings',
    content: `
      <h2>Multi-Tenant Architecture</h2>
      <p>Understand how Smart eQuiz supports multiple organizations with complete data isolation.</p>

      <h3>What is Multi-Tenancy?</h3>
      <p>Each church/organization (tenant) has:</p>
      <ul>
        <li>Separate data storage</li>
        <li>Custom branding</li>
        <li>Independent user management</li>
        <li>Unique subdomain or custom domain</li>
      </ul>

      <h3>Tenant Isolation</h3>
      <p>Security features:</p>
      <ul>
        <li><strong>Data Separation:</strong> No cross-tenant data access</li>
        <li><strong>User Isolation:</strong> Users belong to single tenant</li>
        <li><strong>Role Scoping:</strong> Permissions limited to tenant</li>
        <li><strong>Audit Trails:</strong> Tenant-specific logging</li>
      </ul>

      <h3>Custom Domains</h3>
      <p>Professional and Enterprise plans support custom domains:</p>
      <pre><code>
Default: yourchurch.smartequiz.com
Custom: quiz.yourchurch.org

Configuration:
1. Add DNS CNAME record
2. Verify domain ownership
3. SSL certificate auto-provisioned
4. Domain active within 24 hours
      </code></pre>

      <h3>Branding Customization</h3>
      <ul>
        <li>Upload custom logo</li>
        <li>Set primary and secondary colors</li>
        <li>Customize email templates</li>
        <li>White-label option (Enterprise)</li>
      </ul>

      <h3>Network Features</h3>
      <p>For church networks and dioceses:</p>
      <ul>
        <li><strong>Parent-Child Relationships:</strong> Diocese manages parishes</li>
        <li><strong>Resource Sharing:</strong> Share question banks across tenants</li>
        <li><strong>Centralized Billing:</strong> Single invoice for network</li>
        <li><strong>Network Tournaments:</strong> Inter-parish competitions</li>
      </ul>

      <h3>Data Portability</h3>
      <p>Export your data anytime:</p>
      <ul>
        <li>Full data export in JSON/CSV</li>
        <li>Question banks with metadata</li>
        <li>User information</li>
        <li>Tournament history</li>
        <li>Analytics reports</li>
      </ul>
    `
  },

  'rbac': {
    title: 'Role-Based Access Control',
    category: 'Platform Features',
    icon: 'Settings',
    content: `
      <h2>Role-Based Access Control (RBAC)</h2>
      <p>Comprehensive guide to user roles and permissions in Smart eQuiz.</p>

      <h3>9 Built-in Roles</h3>

      <h4>1. Super Admin</h4>
      <ul>
        <li>Platform-wide access</li>
        <li>Manage all tenants</li>
        <li>Configure system settings</li>
        <li>Access billing and subscriptions</li>
      </ul>

      <h4>2. Organization Admin</h4>
      <ul>
        <li>Full control within tenant</li>
        <li>Manage users and roles</li>
        <li>Create tournaments</li>
        <li>Access all features</li>
        <li>View analytics and reports</li>
      </ul>

      <h4>3. Question Manager</h4>
      <ul>
        <li>Create/edit/delete questions</li>
        <li>Manage question banks</li>
        <li>Use AI generator</li>
        <li>Export question sets</li>
      </ul>

      <h4>4. Account Officer</h4>
      <ul>
        <li>Manage payments</li>
        <li>Process tournament fees</li>
        <li>View financial reports</li>
        <li>Handle refunds</li>
      </ul>

      <h4>5. Inspector</h4>
      <ul>
        <li>Monitor quiz matches</li>
        <li>Verify answers</li>
        <li>Review recordings</li>
        <li>Generate compliance reports</li>
      </ul>

      <h4>6. Moderator</h4>
      <ul>
        <li>Conduct matches</li>
        <li>Read questions</li>
        <li>Record scores</li>
        <li>Handle challenges</li>
      </ul>

      <h4>7. Participant</h4>
      <ul>
        <li>Compete in tournaments</li>
        <li>Access practice mode</li>
        <li>View personal stats</li>
        <li>Submit registrations</li>
      </ul>

      <h4>8. Practice User</h4>
      <ul>
        <li>Practice mode access only</li>
        <li>Cannot compete officially</li>
        <li>Limited statistics</li>
      </ul>

      <h4>9. Spectator</h4>
      <ul>
        <li>View live matches</li>
        <li>Access public info</li>
        <li>No participation rights</li>
      </ul>

      <h3>Custom Permissions</h3>
      <p>Professional+ plans allow customization:</p>
      <ul>
        <li>Add permissions to roles</li>
        <li>Remove default permissions</li>
        <li>Create hybrid roles</li>
        <li>Set explicit denies</li>
      </ul>

      <h3>Permission Categories</h3>
      <pre><code>
Users: create, read, update, delete
Questions: create, read, update, delete, approve
Tournaments: create, read, update, delete, moderate
Analytics: view, export
Settings: manage, configure
Billing: view, manage
      </code></pre>
    `
  },

  // API Documentation
  'api/auth': {
    title: 'Authentication',
    category: 'API Documentation',
    icon: 'Code',
    content: `
      <h2>API Authentication</h2>
      <p>Learn how to authenticate your API requests to Smart eQuiz Platform.</p>

      <h3>API Keys</h3>
      <p>Generate an API key from your dashboard:</p>
      <ol>
        <li>Navigate to <strong>Settings > API</strong></li>
        <li>Click <strong>Generate New Key</strong></li>
        <li>Copy and store securely (shown only once)</li>
        <li>Add description for tracking</li>
      </ol>

      <h3>Authentication Method</h3>
      <p>Include API key in request headers:</p>
      <pre><code>
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
      </code></pre>

      <h3>Example Request</h3>
      <pre><code>
curl -X GET https://api.smartequiz.com/v1/tournaments \\
  -H "Authorization: Bearer sk_live_abc123xyz..." \\
  -H "Content-Type: application/json"
      </code></pre>

      <h3>OAuth 2.0 (Enterprise)</h3>
      <p>For third-party integrations:</p>
      <pre><code>
# Authorization endpoint
POST https://api.smartequiz.com/oauth/authorize
  client_id=YOUR_CLIENT_ID
  redirect_uri=YOUR_REDIRECT_URI
  response_type=code
  scope=tournaments.read questions.write

# Token exchange
POST https://api.smartequiz.com/oauth/token
  client_id=YOUR_CLIENT_ID
  client_secret=YOUR_CLIENT_SECRET
  code=AUTHORIZATION_CODE
  grant_type=authorization_code
      </code></pre>

      <h3>Security Best Practices</h3>
      <ul>
        <li>Never commit API keys to version control</li>
        <li>Use environment variables</li>
        <li>Rotate keys regularly</li>
        <li>Use different keys for dev/staging/production</li>
        <li>Revoke unused keys immediately</li>
        <li>Monitor API usage for anomalies</li>
      </ul>

      <h3>Error Responses</h3>
      <pre><code>
401 Unauthorized - Invalid or missing API key
403 Forbidden - Valid key but insufficient permissions
429 Too Many Requests - Rate limit exceeded
      </code></pre>
    `
  },

  'api/rest': {
    title: 'REST API Reference',
    category: 'API Documentation',
    icon: 'Code',
    content: `
      <h2>REST API Reference</h2>
      <p>Complete reference for Smart eQuiz REST API endpoints.</p>

      <h3>Base URL</h3>
      <pre><code>
Production: https://api.smartequiz.com/v1
Sandbox: https://sandbox-api.smartequiz.com/v1
      </code></pre>

      <h3>Tournaments API</h3>

      <h4>List Tournaments</h4>
      <pre><code>
GET /tournaments
Query Parameters:
  - status: active|completed|upcoming
  - limit: 1-100 (default: 20)
  - offset: pagination offset

Response:
{
  "data": [...],
  "total": 45,
  "limit": 20,
  "offset": 0
}
      </code></pre>

      <h4>Create Tournament</h4>
      <pre><code>
POST /tournaments
Body:
{
  "name": "Spring Championship 2025",
  "type": "single_elimination",
  "startDate": "2025-03-15T09:00:00Z",
  "registrationDeadline": "2025-03-01T23:59:59Z",
  "scriptureScope": "Gospel of John",
  "maxTeams": 16
}

Response:
{
  "id": "tour_abc123",
  "name": "Spring Championship 2025",
  "status": "upcoming",
  ...
}
      </code></pre>

      <h3>Questions API</h3>

      <h4>List Questions</h4>
      <pre><code>
GET /questions
Query Parameters:
  - bank_id: filter by question bank
  - difficulty: easy|medium|hard
  - scripture: book name or reference

Response:
{
  "data": [
    {
      "id": "q_xyz789",
      "text": "Who wrote the Gospel of John?",
      "answer": "John the Apostle",
      "difficulty": "easy",
      "scriptureRef": "John 21:24"
    },
    ...
  ]
}
      </code></pre>

      <h4>Create Question</h4>
      <pre><code>
POST /questions
Body:
{
  "text": "What was Jesus' first miracle?",
  "answer": "Turning water into wine",
  "difficulty": "medium",
  "scriptureRef": "John 2:1-11",
  "category": "Miracles"
}
      </code></pre>

      <h3>Users API</h3>
      <pre><code>
GET /users - List users
POST /users - Create user
GET /users/:id - Get user
PATCH /users/:id - Update user
DELETE /users/:id - Delete user
      </code></pre>

      <h3>Analytics API</h3>
      <pre><code>
GET /analytics/tournaments/:id - Tournament stats
GET /analytics/participants/:id - Participant performance
GET /analytics/questions/:id - Question difficulty rating
      </code></pre>

      <h3>Common Response Codes</h3>
      <ul>
        <li><strong>200 OK:</strong> Success</li>
        <li><strong>201 Created:</strong> Resource created</li>
        <li><strong>400 Bad Request:</strong> Invalid input</li>
        <li><strong>401 Unauthorized:</strong> Authentication failed</li>
        <li><strong>403 Forbidden:</strong> Insufficient permissions</li>
        <li><strong>404 Not Found:</strong> Resource doesn't exist</li>
        <li><strong>429 Too Many Requests:</strong> Rate limit hit</li>
        <li><strong>500 Server Error:</strong> Internal error</li>
      </ul>
    `
  },

  'api/webhooks': {
    title: 'Webhooks',
    category: 'API Documentation',
    icon: 'Code',
    content: `
      <h2>Webhooks</h2>
      <p>Receive real-time notifications for events in your Smart eQuiz account.</p>

      <h3>Setting Up Webhooks</h3>
      <ol>
        <li>Go to <strong>Settings > API > Webhooks</strong></li>
        <li>Click <strong>Add Webhook Endpoint</strong></li>
        <li>Enter your endpoint URL</li>
        <li>Select events to subscribe to</li>
        <li>Save and copy webhook secret</li>
      </ol>

      <h3>Available Events</h3>
      <ul>
        <li><code>tournament.created</code> - New tournament created</li>
        <li><code>tournament.started</code> - Tournament began</li>
        <li><code>tournament.completed</code> - Tournament finished</li>
        <li><code>match.started</code> - Match started</li>
        <li><code>match.completed</code> - Match ended</li>
        <li><code>registration.created</code> - New team registered</li>
        <li><code>user.created</code> - New user added</li>
        <li><code>payment.succeeded</code> - Payment processed</li>
        <li><code>payment.failed</code> - Payment failed</li>
      </ul>

      <h3>Webhook Payload</h3>
      <pre><code>
{
  "id": "evt_abc123",
  "type": "tournament.completed",
  "created": 1234567890,
  "data": {
    "object": {
      "id": "tour_xyz789",
      "name": "Spring Championship",
      "winner": "First Baptist Team A",
      "finalScore": "450-320",
      ...
    }
  }
}
      </code></pre>

      <h3>Verifying Webhook Signatures</h3>
      <p>Verify webhooks using the signature header:</p>
      <pre><code>
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

// Express.js example
app.post('/webhook', (req, res) => {
  const signature = req.headers['x-smartequiz-signature'];
  const payload = JSON.stringify(req.body);
  
  if (!verifyWebhook(payload, signature, webhookSecret)) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook
  const event = req.body;
  console.log('Received event:', event.type);
  
  res.status(200).send('OK');
});
      </code></pre>

      <h3>Best Practices</h3>
      <ul>
        <li>Always verify webhook signatures</li>
        <li>Return 200 status quickly</li>
        <li>Process events asynchronously</li>
        <li>Implement retry logic</li>
        <li>Use HTTPS endpoints only</li>
        <li>Log all webhook events</li>
      </ul>

      <h3>Retry Behavior</h3>
      <p>If webhook delivery fails:</p>
      <ul>
        <li>Retry after 1 minute</li>
        <li>Retry after 5 minutes</li>
        <li>Retry after 30 minutes</li>
        <li>Retry after 2 hours</li>
        <li>Retry after 6 hours</li>
        <li>Give up after 24 hours</li>
      </ul>
    `
  },

  'api/rate-limits': {
    title: 'Rate Limits',
    category: 'API Documentation',
    icon: 'Code',
    content: `
      <h2>API Rate Limits</h2>
      <p>Understand API rate limits and how to handle them.</p>

      <h3>Rate Limit Tiers</h3>
      <ul>
        <li><strong>Free:</strong> 100 requests/hour</li>
        <li><strong>Pro:</strong> 500 requests/hour</li>
        <li><strong>Professional:</strong> 1,000 requests/hour</li>
        <li><strong>Enterprise:</strong> 10,000 requests/hour</li>
        <li><strong>Custom:</strong> Contact sales</li>
      </ul>

      <h3>Rate Limit Headers</h3>
      <p>Every API response includes rate limit information:</p>
      <pre><code>
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1234567890
      </code></pre>

      <h3>Handling Rate Limits</h3>
      <pre><code>
const axios = require('axios');

async function makeRequest(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': \`Bearer \${apiKey}\`
      }
    });
    
    // Check remaining requests
    const remaining = response.headers['x-ratelimit-remaining'];
    if (remaining < 10) {
      console.warn('Approaching rate limit');
    }
    
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 429) {
      // Rate limit hit
      const resetTime = error.response.headers['x-ratelimit-reset'];
      const waitTime = resetTime - Math.floor(Date.now() / 1000);
      
      console.log(\`Rate limit hit. Waiting \${waitTime} seconds\`);
      await sleep(waitTime * 1000);
      
      // Retry request
      return makeRequest(url);
    }
    throw error;
  }
}
      </code></pre>

      <h3>Best Practices</h3>
      <ul>
        <li>Monitor rate limit headers</li>
        <li>Implement exponential backoff</li>
        <li>Cache responses when possible</li>
        <li>Batch requests using bulk endpoints</li>
        <li>Use webhooks instead of polling</li>
        <li>Request rate limit increase if needed</li>
      </ul>

      <h3>Bulk Endpoints</h3>
      <p>Use bulk operations to reduce requests:</p>
      <pre><code>
// Instead of multiple requests
POST /questions (100x)

// Use bulk create
POST /questions/bulk
{
  "questions": [
    { "text": "...", "answer": "..." },
    { "text": "...", "answer": "..." },
    // Up to 100 questions
  ]
}
      </code></pre>

      <h3>Requesting Limit Increase</h3>
      <p>Contact sales for custom limits:</p>
      <ul>
        <li>Describe your use case</li>
        <li>Provide expected request volume</li>
        <li>Timeline and growth projections</li>
        <li>Custom pricing available</li>
      </ul>
    `
  },

  // Guides & Tutorials
  'theming': {
    title: 'Customizing Your Theme',
    category: 'Guides & Tutorials',
    icon: 'BookOpen',
    content: `
      <h2>Customizing Your Theme</h2>
      <p>Make Smart eQuiz match your church's branding with custom themes.</p>

      <h3>Basic Customization</h3>
      <ol>
        <li>Navigate to <strong>Settings > Branding</strong></li>
        <li>Upload your logo (PNG, 512x512px recommended)</li>
        <li>Select primary color (used for buttons, headers)</li>
        <li>Select secondary color (used for accents)</li>
        <li>Preview changes</li>
        <li>Click <strong>Save Theme</strong></li>
      </ol>

      <h3>Color Palette</h3>
      <pre><code>
Primary Color: Main brand color
Secondary Color: Accent color
Success: #10B981 (green)
Warning: #F59E0B (orange)
Error: #EF4444 (red)
Info: #3B82F6 (blue)
      </code></pre>

      <h3>Logo Requirements</h3>
      <ul>
        <li><strong>Format:</strong> PNG with transparent background</li>
        <li><strong>Size:</strong> 512x512px (max 2MB)</li>
        <li><strong>Color Mode:</strong> RGB</li>
        <li><strong>Aspect Ratio:</strong> Square or 2:1 horizontal</li>
      </ul>

      <h3>Advanced Customization (Enterprise)</h3>
      <p>Enterprise plans include white-label options:</p>
      <ul>
        <li>Custom CSS injection</li>
        <li>Custom fonts (Google Fonts)</li>
        <li>Custom email templates</li>
        <li>Remove "Powered by Smart eQuiz"</li>
        <li>Custom domain</li>
      </ul>

      <h3>Email Templates</h3>
      <p>Customize transactional emails:</p>
      <ul>
        <li>Welcome email</li>
        <li>Tournament invitation</li>
        <li>Registration confirmation</li>
        <li>Match reminders</li>
        <li>Results notification</li>
      </ul>

      <h3>Preview Mode</h3>
      <p>Test theme changes before publishing:</p>
      <ol>
        <li>Enable <strong>Preview Mode</strong></li>
        <li>View platform with new theme</li>
        <li>Test on mobile and desktop</li>
        <li>Make adjustments</li>
        <li>Publish when satisfied</li>
      </ol>
    `
  },

  'importing': {
    title: 'Importing Questions',
    category: 'Guides & Tutorials',
    icon: 'BookOpen',
    content: `
      <h2>Importing Questions</h2>
      <p>Import existing question banks into Smart eQuiz Platform.</p>

      <h3>Supported Formats</h3>
      <ul>
        <li>CSV (Comma-Separated Values)</li>
        <li>JSON (JavaScript Object Notation)</li>
        <li>Excel (XLSX)</li>
        <li>Plain Text (structured format)</li>
      </ul>

      <h3>CSV Format</h3>
      <p>Required columns:</p>
      <pre><code>
question,answer,difficulty,scripture_reference,category,question_type
"Who is the author?","John","easy","John 21:24","Author","multiple_choice"
"What was the first miracle?","Water to wine","medium","John 2:1-11","Miracles","short_answer"
      </code></pre>

      <h3>JSON Format</h3>
      <pre><code>
{
  "questions": [
    {
      "text": "Who wrote the Gospel of John?",
      "answer": "John the Apostle",
      "difficulty": "easy",
      "scriptureReference": "John 21:24",
      "category": "Author",
      "type": "multiple_choice",
      "distractors": ["Peter", "Matthew", "Luke"]
    },
    ...
  ]
}
      </code></pre>

      <h3>Import Process</h3>
      <ol>
        <li>Go to <strong>Questions > Import</strong></li>
        <li>Select file format</li>
        <li>Upload file (max 5MB)</li>
        <li>Map columns to fields</li>
        <li>Preview import</li>
        <li>Click <strong>Import Questions</strong></li>
      </ol>

      <h3>Validation</h3>
      <p>During import, questions are validated:</p>
      <ul>
        <li>Required fields present</li>
        <li>Valid difficulty levels</li>
        <li>Scripture references formatted correctly</li>
        <li>No duplicate questions</li>
        <li>Answer provided</li>
      </ul>

      <h3>Error Handling</h3>
      <p>Invalid questions are flagged:</p>
      <ul>
        <li>Download error report</li>
        <li>Fix issues in source file</li>
        <li>Re-import corrected file</li>
        <li>Or manually fix in platform</li>
      </ul>

      <h3>Bulk Operations</h3>
      <p>After import:</p>
      <ul>
        <li>Assign to question bank</li>
        <li>Bulk edit categories</li>
        <li>Adjust difficulty levels</li>
        <li>Add tags</li>
        <li>Set active/inactive status</li>
      </ul>
    `
  },

  'subscriptions': {
    title: 'Managing Subscriptions',
    category: 'Guides & Tutorials',
    icon: 'BookOpen',
    content: `
      <h2>Managing Subscriptions</h2>
      <p>Learn how to manage your Smart eQuiz subscription and billing.</p>

      <h3>Current Plans</h3>
      <ul>
        <li><strong>Free:</strong> $0/month - Basic features</li>
        <li><strong>Starter:</strong> $29/month - Essential features</li>
        <li><strong>Professional:</strong> $99/month - Advanced features</li>
        <li><strong>Enterprise:</strong> $299/month - Premium support</li>
      </ul>

      <h3>Upgrading Your Plan</h3>
      <ol>
        <li>Go to <strong>Settings > Subscription</strong></li>
        <li>Click <strong>Upgrade Plan</strong></li>
        <li>Select desired plan</li>
        <li>Review changes and pricing</li>
        <li>Enter payment information</li>
        <li>Confirm upgrade</li>
      </ol>

      <h3>Billing Cycle</h3>
      <p>Subscriptions are billed:</p>
      <ul>
        <li>Monthly or annually</li>
        <li>Annual saves 20%</li>
        <li>Prorated when upgrading</li>
        <li>Credits when downgrading</li>
      </ul>

      <h3>Payment Methods</h3>
      <ul>
        <li>Credit/Debit Cards (Visa, Mastercard, Amex)</li>
        <li>ACH Bank Transfer (US only)</li>
        <li>Wire Transfer (Enterprise)</li>
        <li>Purchase Orders (Enterprise)</li>
      </ul>

      <h3>Managing Payment Methods</h3>
      <ol>
        <li>Navigate to <strong>Settings > Billing</strong></li>
        <li>Click <strong>Payment Methods</strong></li>
        <li>Add or remove payment methods</li>
        <li>Set default payment method</li>
      </ol>

      <h3>Invoices & Receipts</h3>
      <ul>
        <li>View all invoices in billing section</li>
        <li>Download PDF receipts</li>
        <li>Email invoices to accounting</li>
        <li>Export transaction history</li>
      </ul>

      <h3>Cancellation</h3>
      <p>To cancel your subscription:</p>
      <ol>
        <li>Go to <strong>Settings > Subscription</strong></li>
        <li>Click <strong>Cancel Subscription</strong></li>
        <li>Provide feedback (optional)</li>
        <li>Confirm cancellation</li>
        <li>Access remains until end of billing period</li>
        <li>Data retained for 30 days</li>
      </ol>

      <h3>Reactivation</h3>
      <p>Reactivate within 30 days:</p>
      <ul>
        <li>All data preserved</li>
        <li>Same settings restored</li>
        <li>Users reactivated</li>
        <li>No data loss</li>
      </ul>
    `
  },

  'analytics': {
    title: 'Reporting & Analytics',
    category: 'Guides & Tutorials',
    icon: 'BookOpen',
    content: `
      <h2>Reporting & Analytics</h2>
      <p>Leverage data to improve your Bible quiz program.</p>

      <h3>Analytics Dashboard</h3>
      <p>Overview metrics:</p>
      <ul>
        <li>Total participants</li>
        <li>Active users</li>
        <li>Tournaments completed</li>
        <li>Questions answered</li>
        <li>Average scores</li>
        <li>Engagement trends</li>
      </ul>

      <h3>Tournament Reports</h3>
      <p>For each tournament:</p>
      <ul>
        <li>Participant list and attendance</li>
        <li>Match results and scores</li>
        <li>Winner and runner-up</li>
        <li>MVP and top performers</li>
        <li>Question difficulty analysis</li>
        <li>Time per question average</li>
      </ul>

      <h3>Participant Analytics</h3>
      <p>Individual performance tracking:</p>
      <ul>
        <li>Total matches played</li>
        <li>Win/loss record</li>
        <li>Average score</li>
        <li>Strong/weak Scripture areas</li>
        <li>Progress over time</li>
        <li>Rank within organization</li>
      </ul>

      <h3>Question Performance</h3>
      <p>Analyze question quality:</p>
      <ul>
        <li>Answer accuracy rate</li>
        <li>Average time to answer</li>
        <li>Skip rate</li>
        <li>Actual vs. intended difficulty</li>
        <li>Most missed questions</li>
      </ul>

      <h3>Custom Reports</h3>
      <p>Build custom reports:</p>
      <ol>
        <li>Go to <strong>Analytics > Custom Reports</strong></li>
        <li>Select data sources</li>
        <li>Choose metrics and dimensions</li>
        <li>Apply filters</li>
        <li>Set date range</li>
        <li>Generate report</li>
        <li>Schedule automated delivery</li>
      </ol>

      <h3>Export Options</h3>
      <ul>
        <li><strong>PDF:</strong> Formatted reports for printing</li>
        <li><strong>Excel:</strong> Data analysis in spreadsheets</li>
        <li><strong>CSV:</strong> Raw data for custom processing</li>
        <li><strong>JSON:</strong> API integration</li>
      </ul>

      <h3>Insights & Recommendations</h3>
      <p>AI-powered insights:</p>
      <ul>
        <li>Identify struggling participants</li>
        <li>Recommend practice areas</li>
        <li>Optimal tournament scheduling</li>
        <li>Question bank gaps</li>
        <li>Engagement improvement suggestions</li>
      </ul>
    `
  },
};

export default function DocsArticle({ params }: { params: { slug: string } }) {
  const article = docsArticles[params.slug];

  if (!article) {
    notFound();
  }

  const iconComponents = {
    Zap: Zap,
    BookOpen: BookOpen,
    Code: Code,
    Settings: Settings,
  };

  const IconComponent = iconComponents[article.icon as keyof typeof iconComponents] || BookOpen;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <Link href="/docs" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Docs
            </Link>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Getting Started</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/docs/quick-start-guide" className="text-gray-600 hover:text-blue-600">
                      Quick Start Guide
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/platform-overview" className="text-gray-600 hover:text-blue-600">
                      Platform Overview
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/first-tournament" className="text-gray-600 hover:text-blue-600">
                      Creating Your First Tournament
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/question-banks" className="text-gray-600 hover:text-blue-600">
                      Setting Up Question Banks
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/user-management" className="text-gray-600 hover:text-blue-600">
                      User Management Basics
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/user-roles-permissions" className="text-gray-600 hover:text-blue-600">
                      User Roles & Permissions
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/installation-setup" className="text-gray-600 hover:text-blue-600">
                      Installation & Setup
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Platform Features</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/docs/tournaments" className="text-gray-600 hover:text-blue-600">
                      Tournament Management
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/ai-generator" className="text-gray-600 hover:text-blue-600">
                      AI Question Generator
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/multi-tenant" className="text-gray-600 hover:text-blue-600">
                      Multi-Tenant Architecture
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/rbac" className="text-gray-600 hover:text-blue-600">
                      Role-Based Access Control
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Configuration</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/docs/tournament-settings" className="text-gray-600 hover:text-blue-600">
                      Tournament Settings
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">API Documentation</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/docs/api-getting-started" className="text-gray-600 hover:text-blue-600">
                      API Getting Started
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/api/auth" className="text-gray-600 hover:text-blue-600">
                      Authentication
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/api/rest" className="text-gray-600 hover:text-blue-600">
                      REST API Reference
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/api/webhooks" className="text-gray-600 hover:text-blue-600">
                      Webhooks
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/api/rate-limits" className="text-gray-600 hover:text-blue-600">
                      Rate Limits
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Guides & Tutorials</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="/docs/theming" className="text-gray-600 hover:text-blue-600">
                      Customizing Your Theme
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/importing" className="text-gray-600 hover:text-blue-600">
                      Importing Questions
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/subscriptions" className="text-gray-600 hover:text-blue-600">
                      Managing Subscriptions
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs/analytics" className="text-gray-600 hover:text-blue-600">
                      Reporting & Analytics
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="md:col-span-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <IconComponent className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-gray-600">{article.category}</div>
                <h1 className="text-4xl font-bold text-gray-900">{article.title}</h1>
              </div>
            </div>

            <div 
              className="prose prose-lg max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4 prose-h4:text-xl prose-h4:mt-6 prose-h4:mb-3 prose-p:text-gray-700 prose-p:mb-6 prose-ul:my-4 prose-li:text-gray-700 prose-a:text-blue-600 prose-a:no-underline hover:prose-a:text-blue-700 prose-code:bg-gray-100 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Help Section */}
            <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="text-lg font-semibold mb-2">Need more help?</h3>
              <p className="text-gray-700 mb-4">
                Our support team is here to assist you with any questions.
              </p>
              <div className="flex gap-4">
                <Link 
                  href="/contact" 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Contact Support
                </Link>
                <Link 
                  href="/docs" 
                  className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Browse All Docs
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
