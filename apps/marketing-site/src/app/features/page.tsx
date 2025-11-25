import Link from 'next/link';

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Powerful Features for Bible Quiz Programs</h1>
          <p className="text-xl max-w-3xl mx-auto text-blue-100">
            Everything you need to run successful tournaments, manage participants, and track progress
          </p>
        </div>
      </section>

      {/* Feature Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          
          {/* Tournament Management */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Tournament Management</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Create, schedule, and run tournaments with ease
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Bracket Builder</h3>
                <p className="text-gray-600">
                  Automatically generate tournament brackets based on participants. Supports single elimination, double elimination, and round-robin formats.
                </p>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Live Scoring</h3>
                <p className="text-gray-600">
                  Track scores in real-time during matches. Participants and spectators can follow along with live updates and leaderboards.
                </p>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Schedule Management</h3>
                <p className="text-gray-600">
                  Plan tournament schedules with conflict detection. Automated notifications keep everyone informed of upcoming matches.
                </p>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Multi-Format Support</h3>
                <p className="text-gray-600">
                  Host individual, team, or parish-based tournaments. Customize rules and scoring systems to match your needs.
                </p>
              </div>
            </div>
          </div>

          {/* Question Bank */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Question Bank & AI Generation</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Build and manage comprehensive question libraries
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">AI Question Generator</h3>
                <p className="text-gray-600">
                  Generate high-quality Bible quiz questions automatically using AI. Choose categories, difficulty levels, and review before publishing.
                </p>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Custom Categories</h3>
                <p className="text-gray-600">
                  Organize questions by books, themes, or difficulty. Create custom categories that match your curriculum.
                </p>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Question Lifecycle</h3>
                <p className="text-gray-600">
                  Manage questions through draft, review, approved, and retired states. Track usage and performance metrics.
                </p>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Bulk Import/Export</h3>
                <p className="text-gray-600">
                  Import questions from spreadsheets or other formats. Export for backup or sharing with other organizations.
                </p>
              </div>
            </div>
          </div>

          {/* Practice & Training */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Practice & Training</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Help participants improve their skills
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Practice Mode</h3>
                <p className="text-gray-600">
                  Participants can practice with unlimited questions. Track progress and identify areas for improvement.
                </p>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Gamification</h3>
                <p className="text-gray-600">
                  Earn XP, level up, and unlock badges. Leaderboards motivate participants to practice more.
                </p>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Study Plans</h3>
                <p className="text-gray-600">
                  Create custom study schedules with daily goals. Adaptive difficulty adjusts to participant skill level.
                </p>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Performance Analytics</h3>
                <p className="text-gray-600">
                  Detailed insights into strengths and weaknesses. Track improvement over time with visual reports.
                </p>
              </div>
            </div>
          </div>

          {/* Multi-Tenant Features */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Multi-Tenant Architecture</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Secure, isolated environments for each organization
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Custom Branding</h3>
                <p className="text-gray-600">
                  Add your church logo, colors, and custom domain. Create a branded experience for your participants.
                </p>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Role-Based Access</h3>
                <p className="text-gray-600">
                  Fine-grained permissions for admins, moderators, and participants. Customize roles to match your organization.
                </p>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">Data Isolation</h3>
                <p className="text-gray-600">
                  Your data stays completely separate from other tenants. Enterprise-grade security and compliance.
                </p>
              </div>
              
              <div className="p-6 border border-gray-200 rounded-lg">
                <h3 className="text-xl font-semibold mb-3">API Access</h3>
                <p className="text-gray-600">
                  Build custom integrations with our RESTful API. Connect to your existing church management systems.
                </p>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Start your free 14-day trial today. No credit card required.
          </p>
          <Link 
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
}
