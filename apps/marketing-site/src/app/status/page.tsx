import { CheckCircle, AlertCircle, Clock, Activity, Database, Zap, Globe, Shield } from 'lucide-react';

export default function Status() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">System Status</h1>
          <p className="text-gray-600">Current status of Smart eQuiz Platform services</p>
          <div className="flex items-center gap-2 mt-4">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-600">Last updated: {currentDate} at {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Overall Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold text-green-900">All Systems Operational</h2>
              <p className="text-green-700">All services are running normally</p>
            </div>
          </div>
        </div>

        {/* Uptime Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">99.98%</div>
            <div className="text-gray-600">Uptime (30 days)</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">45ms</div>
            <div className="text-gray-600">Avg Response Time</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
            <div className="text-gray-600">Incidents Today</div>
          </div>
        </div>

        {/* System Components */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">System Components</h2>
          </div>
          
          <div className="divide-y">
            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Globe className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Web Application</h3>
                  <p className="text-sm text-gray-600">Main platform interface</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Operational</span>
              </div>
            </div>

            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Zap className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">API Services</h3>
                  <p className="text-sm text-gray-600">REST API endpoints</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Operational</span>
              </div>
            </div>

            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Database className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Database</h3>
                  <p className="text-sm text-gray-600">PostgreSQL cluster</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Operational</span>
              </div>
            </div>

            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Activity className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Real-time Services</h3>
                  <p className="text-sm text-gray-600">Live scoring and updates</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Operational</span>
              </div>
            </div>

            <div className="p-6 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Shield className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Authentication</h3>
                  <p className="text-sm text-gray-600">User login and security</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Operational</span>
              </div>
            </div>
          </div>
        </div>

        {/* Incident History */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b">
            <h2 className="text-2xl font-bold">Recent Incidents</h2>
          </div>
          
          <div className="divide-y">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Resolved: API Rate Limiting Issue</h3>
                    <span className="text-sm text-gray-600">January 10, 2025</span>
                  </div>
                  <p className="text-gray-600 mb-2">
                    Some API requests were experiencing slower response times due to rate limiting configuration.
                  </p>
                  <div className="text-sm text-gray-500">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Duration: 45 minutes • Affected: 2% of API users
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Resolved: Scheduled Maintenance</h3>
                    <span className="text-sm text-gray-600">January 3, 2025</span>
                  </div>
                  <p className="text-gray-600 mb-2">
                    Scheduled database maintenance and infrastructure upgrades completed successfully.
                  </p>
                  <div className="text-sm text-gray-500">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Duration: 2 hours • Planned maintenance window
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">Resolved: Email Delivery Delay</h3>
                    <span className="text-sm text-gray-600">December 28, 2024</span>
                  </div>
                  <p className="text-gray-600 mb-2">
                    Email notifications experienced delivery delays due to third-party SMTP service issues.
                  </p>
                  <div className="text-sm text-gray-500">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Duration: 3 hours • All emails delivered successfully after resolution
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Maintenance */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Upcoming Scheduled Maintenance</h3>
              <p className="text-blue-800 mb-4">
                <strong>Date:</strong> February 1, 2025, 2:00 AM - 4:00 AM EST
              </p>
              <p className="text-blue-700">
                We will be performing infrastructure upgrades to improve performance and reliability. 
                The platform will be temporarily unavailable during this window. All scheduled tournaments 
                and practices will be automatically rescheduled.
              </p>
            </div>
          </div>
        </div>

        {/* Subscribe to Updates */}
        <div className="bg-gray-100 rounded-lg p-8 text-center">
          <h3 className="text-xl font-bold mb-4">Subscribe to Status Updates</h3>
          <p className="text-gray-600 mb-6">
            Get notified about system status changes, incidents, and scheduled maintenance.
          </p>
          <div className="flex gap-4 justify-center max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="your@email.com" 
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
