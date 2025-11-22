import Link from 'next/link';
import { Shield, Lock, Key, AlertTriangle, CheckCircle, Users, Database, Eye } from 'lucide-react';

export default function SecurityBestPracticesPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <Link href="/docs" className="text-sm hover:underline mb-4 inline-block opacity-90">
            ← Back to Documentation
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Security Best Practices</h1>
          <p className="text-xl opacity-90 max-w-3xl">
            Comprehensive guide to keeping your Smart eQuiz account and data secure
          </p>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Introduction */}
        <div className="mb-12">
          <p className="text-lg text-gray-700 leading-relaxed">
            Security is a shared responsibility. While we implement enterprise-grade security measures, 
            following these best practices will help you maximize the security of your Smart eQuiz account 
            and protect your organization's data.
          </p>
        </div>

        {/* Account Security */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Lock className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold">Account Security</h2>
          </div>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-6">
              <h3 className="text-xl font-bold mb-3">Strong Passwords</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Use at least 12 characters with a mix of uppercase, lowercase, numbers, and symbols</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Avoid using personal information or common words</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Use a unique password for Smart eQuiz (don't reuse passwords)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Consider using a password manager to generate and store secure passwords</span>
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-600 pl-6">
              <h3 className="text-xl font-bold mb-3">Two-Factor Authentication (2FA)</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Enable 2FA for all administrator accounts (required for Enterprise plans)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Use authenticator apps (Google Authenticator, Authy) instead of SMS when possible</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Store backup codes in a secure location</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span>Encourage all users to enable 2FA voluntarily</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Access Management */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold">Access Management</h2>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Principle of Least Privilege</h3>
              <p className="text-gray-700 mb-4">
                Grant users only the permissions they need to perform their role. Regularly review and 
                audit user permissions to ensure they remain appropriate.
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span>Limit the number of users with org_admin role</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span>Use specialized roles (question_manager, inspector) instead of granting admin access</span>
                </li>
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <span>Remove access immediately when users leave your organization</span>
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-green-600 pl-6">
              <h3 className="text-xl font-bold mb-3">Session Management</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Log out from shared or public devices</li>
                <li>• Use the "Remember this device" option only on personal devices</li>
                <li>• Review active sessions regularly in account settings</li>
                <li>• Terminate suspicious or unrecognized sessions immediately</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Protection */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-lg">
              <Database className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold">Data Protection</h2>
          </div>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-6">
              <h3 className="text-xl font-bold mb-3">Question Bank Security</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Mark sensitive questions as "confidential" to restrict access</li>
                <li>• Use approval workflows for question changes</li>
                <li>• Regularly backup your question bank data</li>
                <li>• Avoid including personally identifiable information (PII) in questions</li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-600 pl-6">
              <h3 className="text-xl font-bold mb-3">Participant Data</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Collect only the minimum data necessary</li>
                <li>• Obtain proper consent for data collection</li>
                <li>• Delete participant data when no longer needed</li>
                <li>• Use data anonymization for analytics and reporting</li>
              </ul>
            </div>
          </div>
        </section>

        {/* API & Integration Security */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Key className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-3xl font-bold">API & Integration Security</h2>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg">
            <div className="flex items-start gap-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-xl font-bold mb-2">API Key Management</h3>
                <p className="text-gray-700 mb-4">
                  API keys provide full access to your account. Treat them like passwords.
                </p>
              </div>
            </div>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Never commit API keys to version control or public repositories</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Rotate API keys regularly (at least every 90 days)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Use environment variables to store API keys</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Revoke API keys immediately if compromised</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <span>Use separate API keys for development, staging, and production</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Monitoring & Response */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-100 rounded-lg">
              <Eye className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold">Monitoring & Incident Response</h2>
          </div>

          <div className="space-y-6">
            <div className="border-l-4 border-red-600 pl-6">
              <h3 className="text-xl font-bold mb-3">Activity Monitoring</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Review audit logs regularly (available on Professional and Enterprise plans)</li>
                <li>• Monitor login attempts and failed authentication</li>
                <li>• Watch for unusual data access patterns</li>
                <li>• Set up alerts for critical actions (user creation, permission changes)</li>
              </ul>
            </div>

            <div className="bg-red-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-red-600" />
                If You Suspect a Security Incident
              </h3>
              <ol className="space-y-3 text-gray-700 list-decimal list-inside">
                <li className="font-semibold">Immediately change your password and revoke API keys</li>
                <li className="font-semibold">Contact our security team at security@smartequiz.com</li>
                <li>Review recent activity logs for unauthorized access</li>
                <li>Notify affected users if data may have been compromised</li>
                <li>Document the incident timeline and actions taken</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Additional Resources */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Additional Resources</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/docs/data-privacy" className="border rounded-lg p-6 hover:border-blue-600 hover:shadow-lg transition-all">
              <h3 className="font-bold text-lg mb-2">Data Privacy Documentation</h3>
              <p className="text-gray-600">Learn about our privacy policies and data handling practices</p>
            </Link>
            <Link href="/docs/compliance-reports" className="border rounded-lg p-6 hover:border-blue-600 hover:shadow-lg transition-all">
              <h3 className="font-bold text-lg mb-2">Compliance Reports</h3>
              <p className="text-gray-600">View our security certifications and compliance status</p>
            </Link>
            <Link href="/security" className="border rounded-lg p-6 hover:border-blue-600 hover:shadow-lg transition-all">
              <h3 className="font-bold text-lg mb-2">Security Overview</h3>
              <p className="text-gray-600">Platform security features and architecture</p>
            </Link>
            <Link href="/contact" className="border rounded-lg p-6 hover:border-blue-600 hover:shadow-lg transition-all">
              <h3 className="font-bold text-lg mb-2">Contact Security Team</h3>
              <p className="text-gray-600">Report security issues or ask questions</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
