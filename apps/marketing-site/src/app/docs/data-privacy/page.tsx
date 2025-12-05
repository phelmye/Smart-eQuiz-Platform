import Link from 'next/link';
import { Shield, Lock, Eye, Database, FileText, Globe, CheckCircle, AlertTriangle } from 'lucide-react';

export default function DataPrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <Link href="/docs" className="text-sm hover:underline mb-4 inline-block opacity-90">
            ← Back to Documentation
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Data Privacy Documentation</h1>
          <p className="text-xl opacity-90 max-w-3xl">
            How we collect, use, store, and protect your personal information
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Last Updated */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-8">
          <p className="text-sm text-gray-700">
            <strong>Last Updated:</strong> November 22, 2025 | <strong>Effective Date:</strong> November 22, 2025
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-16">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            At Smart eQuiz, we take your privacy seriously. This documentation explains our data privacy 
            practices and your rights regarding your personal information. We are committed to transparency 
            and compliance with data protection regulations including GDPR, CCPA, and other applicable laws.
          </p>
        </section>

        {/* What We Collect */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Database className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold">What Information We Collect</h2>
          </div>

          <div className="space-y-6">
            <div className="border-l-4 border-blue-600 pl-6">
              <h3 className="text-xl font-bold mb-3">Account Information</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Organization admins:</strong> Name, email, organization name, phone number (optional)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Team members:</strong> Name, email, assigned role, permissions</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Participants:</strong> Name, email (optional), quiz responses, scores, participation history</span>
                </li>
              </ul>
            </div>

            <div className="border-l-4 border-purple-600 pl-6">
              <h3 className="text-xl font-bold mb-3">Usage Information</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Device information (browser type, operating system, IP address)</li>
                <li>• Log data (access times, pages viewed, actions taken)</li>
                <li>• Performance metrics (page load times, error rates)</li>
                <li>• Feature usage analytics (which features you use most)</li>
              </ul>
            </div>

            <div className="border-l-4 border-green-600 pl-6">
              <h3 className="text-xl font-bold mb-3">Content You Create</h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Quiz questions and answers</li>
                <li>• Tournament configurations</li>
                <li>• Custom branding (logos, colors, themes)</li>
                <li>• Reports and exports</li>
              </ul>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-600 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold mb-2">Data Minimization</h4>
                  <p className="text-gray-700">
                    We only collect information necessary to provide and improve our services. 
                    You control what participant data is collected through your account settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How We Use Data */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <h2 className="text-3xl font-bold">How We Use Your Information</h2>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Service Delivery</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Provide access to your Smart eQuiz account</li>
                <li>✓ Process quiz responses and calculate scores</li>
                <li>✓ Generate reports and analytics</li>
                <li>✓ Enable collaboration with team members</li>
                <li>✓ Deliver tournament results and leaderboards</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Communication</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Send service notifications (tournament updates, system alerts)</li>
                <li>✓ Respond to support requests</li>
                <li>✓ Share product updates and new features</li>
                <li>✓ Send billing and payment confirmations</li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                You can unsubscribe from marketing emails at any time. Service notifications 
                are required for account operation.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Platform Improvement</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Analyze usage patterns to improve features</li>
                <li>✓ Identify and fix bugs</li>
                <li>✓ Conduct security monitoring</li>
                <li>✓ Develop new features based on user needs</li>
              </ul>
              <p className="mt-4 text-sm text-gray-600">
                Analytics are anonymized and aggregated whenever possible.
              </p>
            </div>
          </div>
        </section>

        {/* Data Storage & Security */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-lg">
              <Lock className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold">Data Storage & Security</h2>
          </div>

          <div className="space-y-6">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Where Your Data Lives</h3>
              <div className="space-y-3 text-gray-700">
                <p>
                  <strong>Primary Storage:</strong> All data is stored in secure, encrypted databases 
                  hosted on industry-leading cloud infrastructure (AWS/Google Cloud/Azure).
                </p>
                <p>
                  <strong>Data Residency:</strong> By default, data is stored in United States data centers. 
                  Enterprise customers can request data residency in EU, UK, or other regions.
                </p>
                <p>
                  <strong>Backups:</strong> Encrypted backups are maintained for disaster recovery, 
                  retained for 90 days, then securely deleted.
                </p>
              </div>
            </div>

            <div className="bg-green-50 border-l-4 border-green-600 p-6 rounded-lg">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-green-600" />
                Security Measures
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>• Encryption in transit (TLS 1.3) and at rest (AES-256)</li>
                <li>• Multi-tenant data isolation (your data is completely separate from other customers)</li>
                <li>• Regular security audits and penetration testing</li>
                <li>• Automated threat detection and monitoring</li>
                <li>• Employee access controls (need-to-know basis)</li>
                <li>• SOC 2 Type II compliance (Enterprise plan)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Data Sharing */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-red-100 rounded-lg">
              <Globe className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-3xl font-bold">When We Share Your Data</h2>
          </div>

          <div className="bg-red-50 border-l-4 border-red-600 p-6 rounded-lg mb-6">
            <p className="font-bold text-red-900 mb-3">
              We do NOT sell your personal information to third parties. Period.
            </p>
            <p className="text-gray-700">
              We only share data in limited circumstances required to operate the service or as required by law.
            </p>
          </div>

          <div className="space-y-4">
            <div className="border-l-4 border-gray-400 pl-6">
              <h3 className="text-lg font-bold mb-2">Service Providers</h3>
              <p className="text-gray-700 mb-2">
                We work with trusted third-party service providers who help us operate the platform:
              </p>
              <ul className="space-y-1 text-gray-700 text-sm">
                <li>• Cloud hosting providers (AWS, Google Cloud, or Azure)</li>
                <li>• Email delivery services (for transactional emails)</li>
                <li>• Payment processors (for billing)</li>
                <li>• Analytics providers (for aggregated usage data)</li>
              </ul>
              <p className="text-sm text-gray-600 mt-2">
                All service providers are bound by strict data processing agreements and cannot use 
                your data for their own purposes.
              </p>
            </div>

            <div className="border-l-4 border-gray-400 pl-6">
              <h3 className="text-lg font-bold mb-2">Legal Requirements</h3>
              <p className="text-gray-700">
                We may disclose information if required by law, court order, or government request, 
                or to protect the safety of our users and the public.
              </p>
            </div>

            <div className="border-l-4 border-gray-400 pl-6">
              <h3 className="text-lg font-bold mb-2">Business Transfers</h3>
              <p className="text-gray-700">
                If Smart eQuiz is acquired or merged with another company, your data may be transferred. 
                We will notify you and ensure equivalent privacy protections continue.
              </p>
            </div>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Eye className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-3xl font-bold">Your Privacy Rights</h2>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <p className="text-gray-700 mb-4">
              Depending on your location, you may have the following rights under data protection laws:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-6">
              <h3 className="font-bold text-lg mb-3">Access</h3>
              <p className="text-gray-700">
                Request a copy of all personal data we hold about you. Available as a downloadable export 
                in your account settings.
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <h3 className="font-bold text-lg mb-3">Correction</h3>
              <p className="text-gray-700">
                Update or correct inaccurate information. Most data can be edited directly in your account.
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <h3 className="font-bold text-lg mb-3">Deletion</h3>
              <p className="text-gray-700">
                Request deletion of your personal data. You can delete your account at any time, which 
                permanently removes all associated data within 30 days.
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <h3 className="font-bold text-lg mb-3">Portability</h3>
              <p className="text-gray-700">
                Export your data in a machine-readable format (JSON, CSV) to transfer to another service.
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <h3 className="font-bold text-lg mb-3">Objection</h3>
              <p className="text-gray-700">
                Object to processing of your data for marketing purposes. Opt out of marketing emails 
                at any time.
              </p>
            </div>

            <div className="border rounded-lg p-6">
              <h3 className="font-bold text-lg mb-3">Restriction</h3>
              <p className="text-gray-700">
                Request temporary restriction of processing while we verify accuracy or resolve disputes.
              </p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border-l-4 border-blue-600 p-6 rounded-lg">
            <h3 className="font-bold text-lg mb-2">How to Exercise Your Rights</h3>
            <p className="text-gray-700 mb-3">
              To exercise any of these rights, contact us at <a href="mailto:privacy@smartequiz.com" className="text-blue-600 hover:underline">privacy@smartequiz.com</a> 
              or use the data management tools in your account settings.
            </p>
            <p className="text-sm text-gray-600">
              We will respond to all requests within 30 days as required by law.
            </p>
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Data Retention</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-600 pl-6">
              <h3 className="text-lg font-bold mb-2">Active Accounts</h3>
              <p className="text-gray-700">
                Data is retained for as long as your account is active and for a reasonable period 
                after deletion to comply with legal obligations.
              </p>
            </div>

            <div className="border-l-4 border-purple-600 pl-6">
              <h3 className="text-lg font-bold mb-2">Deleted Accounts</h3>
              <p className="text-gray-700">
                When you delete your account, all personal data is permanently deleted within 30 days. 
                Backups are purged within 90 days.
              </p>
            </div>

            <div className="border-l-4 border-green-600 pl-6">
              <h3 className="text-lg font-bold mb-2">Legal Requirements</h3>
              <p className="text-gray-700">
                Some data may be retained longer if required by law (e.g., financial records for tax purposes, 
                typically 7 years).
              </p>
            </div>
          </div>
        </section>

        {/* Children's Privacy */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Children's Privacy</h2>
          <div className="bg-yellow-50 border-l-4 border-yellow-600 p-6 rounded-lg">
            <p className="text-gray-700 mb-3">
              Smart eQuiz is designed for use by organizations and is not intended for children under 13. 
              If you are using Smart eQuiz with minors (e.g., youth Bible quiz programs), you are responsible 
              for obtaining appropriate parental consent and complying with applicable laws (COPPA, GDPR-K, etc.).
            </p>
            <p className="text-gray-700">
              We recommend using minimal data collection for participant accounts involving minors and 
              enabling enhanced privacy settings.
            </p>
          </div>
        </section>

        {/* Changes to Privacy Policy */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Changes to This Policy</h2>
          <p className="text-gray-700 mb-4">
            We may update this privacy documentation from time to time. Significant changes will be 
            communicated via email and prominently displayed on the platform at least 30 days before taking effect.
          </p>
          <p className="text-gray-700">
            Continued use of Smart eQuiz after changes take effect constitutes acceptance of the updated policy.
          </p>
        </section>

        {/* Contact */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Contact Us</h2>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700 mb-4">
              If you have questions about our privacy practices or want to exercise your privacy rights:
            </p>
            <ul className="space-y-2 text-gray-700">
              <li><strong>Email:</strong> <a href="mailto:privacy@smartequiz.com" className="text-blue-600 hover:underline">privacy@smartequiz.com</a></li>
              <li><strong>Data Protection Officer:</strong> <a href="mailto:dpo@smartequiz.com" className="text-blue-600 hover:underline">dpo@smartequiz.com</a></li>
              <li><strong>Support:</strong> <Link href="/contact" className="text-blue-600 hover:underline">Contact Form</Link></li>
            </ul>
          </div>
        </section>

        {/* Additional Resources */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Related Documentation</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/docs/security-best-practices" className="border rounded-lg p-6 hover:border-blue-600 hover:shadow-lg transition-all">
              <h3 className="font-bold text-lg mb-2">Security Best Practices</h3>
              <p className="text-gray-600">How to keep your account secure</p>
            </Link>
            <Link href="/docs/compliance-reports" className="border rounded-lg p-6 hover:border-blue-600 hover:shadow-lg transition-all">
              <h3 className="font-bold text-lg mb-2">Compliance Reports</h3>
              <p className="text-gray-600">Certifications and audit reports</p>
            </Link>
            <Link href="/terms" className="border rounded-lg p-6 hover:border-blue-600 hover:shadow-lg transition-all">
              <h3 className="font-bold text-lg mb-2">Terms of Service</h3>
              <p className="text-gray-600">Legal terms and conditions</p>
            </Link>
            <Link href="/privacy" className="border rounded-lg p-6 hover:border-blue-600 hover:shadow-lg transition-all">
              <h3 className="font-bold text-lg mb-2">Privacy Policy</h3>
              <p className="text-gray-600">Formal privacy policy document</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
