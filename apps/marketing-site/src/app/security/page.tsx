import { Shield, Lock, Eye, Database, CheckCircle, FileCheck, Users, Server } from 'lucide-react';

export default function Security() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Shield className="w-16 h-16 mx-auto mb-6" />
          <h1 className="text-5xl font-bold mb-6">Security & Compliance</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Your data security and privacy are our top priorities. Learn about our comprehensive 
            security measures and compliance certifications.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Security Overview */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">Our Security Commitment</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">End-to-End Encryption</h3>
              <p className="text-gray-600 text-sm">
                All data encrypted in transit (TLS 1.3) and at rest (AES-256)
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Database className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Data Isolation</h3>
              <p className="text-gray-600 text-sm">
                Complete tenant data separation with role-based access control
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Security Monitoring</h3>
              <p className="text-gray-600 text-sm">
                24/7 threat detection and automated security response
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileCheck className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Regular Audits</h3>
              <p className="text-gray-600 text-sm">
                Annual third-party security audits and penetration testing
              </p>
            </div>
          </div>
        </div>

        {/* Compliance Certifications */}
        <div className="bg-gray-50 rounded-lg p-8 mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Compliance & Certifications</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="font-bold text-lg">SOC 2 Type II</h3>
              </div>
              <p className="text-gray-700">
                Independently audited for security, availability, and confidentiality controls.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="font-bold text-lg">GDPR Compliant</h3>
              </div>
              <p className="text-gray-700">
                Full compliance with European data protection regulations.
              </p>
            </div>

            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <h3 className="font-bold text-lg">COPPA Certified</h3>
              </div>
              <p className="text-gray-700">
                Children's Online Privacy Protection Act compliance for youth programs.
              </p>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Security Features</h2>
          
          <div className="space-y-6">
            <div className="border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Lock className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-bold text-xl mb-2">Authentication & Access Control</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Multi-factor authentication (MFA) for all admin accounts</li>
                    <li>• Single Sign-On (SSO) support via SAML 2.0 and OAuth 2.0</li>
                    <li>• Role-based access control (RBAC) with 9 predefined roles</li>
                    <li>• Customizable permission sets for Professional and Enterprise plans</li>
                    <li>• Session timeout and automatic logout after inactivity</li>
                    <li>• Password complexity requirements and regular rotation policies</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Database className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-bold text-xl mb-2">Data Protection</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• AES-256 encryption for data at rest</li>
                    <li>• TLS 1.3 encryption for data in transit</li>
                    <li>• Automated daily backups with 30-day retention</li>
                    <li>• Point-in-time recovery capabilities</li>
                    <li>• Geographic data redundancy across multiple regions</li>
                    <li>• Secure data deletion with cryptographic erasure</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Server className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-bold text-xl mb-2">Infrastructure Security</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Hosted on AWS with tier-1 data centers</li>
                    <li>• DDoS protection and web application firewall (WAF)</li>
                    <li>• Network segmentation and private subnets</li>
                    <li>• Intrusion detection and prevention systems (IDS/IPS)</li>
                    <li>• Regular security patches and vulnerability scanning</li>
                    <li>• 99.9% uptime SLA with redundant infrastructure</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Eye className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-bold text-xl mb-2">Monitoring & Auditing</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• 24/7 security operations center (SOC) monitoring</li>
                    <li>• Comprehensive audit logs for all user actions</li>
                    <li>• Real-time alerting for suspicious activities</li>
                    <li>• Automated threat detection and response</li>
                    <li>• Regular penetration testing by third-party experts</li>
                    <li>• Incident response plan with defined SLAs</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Users className="w-6 h-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-bold text-xl mb-2">Privacy Controls</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Data processing agreements available for all customers</li>
                    <li>• Right to access, export, and delete personal data</li>
                    <li>• Consent management for data collection</li>
                    <li>• Privacy by design and by default principles</li>
                    <li>• Transparent data usage policies</li>
                    <li>• No selling or sharing of customer data with third parties</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsible Disclosure */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold mb-4">Responsible Disclosure Program</h2>
          <p className="text-gray-700 mb-4">
            We value the security research community's efforts. If you discover a security vulnerability, 
            please report it responsibly to our security team.
          </p>
          <div className="bg-white rounded-lg p-6">
            <h3 className="font-semibold mb-3">How to Report a Vulnerability:</h3>
            <ol className="space-y-2 text-gray-700 list-decimal list-inside">
              <li>Email <a href="mailto:security@smartequiz.com" className="text-blue-600 hover:underline">security@smartequiz.com</a> with details</li>
              <li>Include steps to reproduce the issue</li>
              <li>Allow us 90 days to address the vulnerability before public disclosure</li>
              <li>Do not exploit the vulnerability or access data beyond what is necessary to demonstrate it</li>
            </ol>
            <p className="text-sm text-gray-600 mt-4">
              We commit to responding within 48 hours and providing updates throughout the resolution process.
            </p>
          </div>
        </div>

        {/* Security Resources */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Security Resources</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="border rounded-lg p-6">
              <h3 className="font-bold text-lg mb-3">For Customers</h3>
              <ul className="space-y-2">
                <li>
                  <a href="/docs/security-best-practices" className="text-blue-600 hover:underline">
                    Security Best Practices Guide
                  </a>
                </li>
                <li>
                  <a href="/docs/data-privacy" className="text-blue-600 hover:underline">
                    Data Privacy Documentation
                  </a>
                </li>
                <li>
                  <a href="/docs/compliance-reports" className="text-blue-600 hover:underline">
                    Compliance Reports & Certifications
                  </a>
                </li>
                <li>
                  <a href="/status" className="text-blue-600 hover:underline">
                    System Status & Incident History
                  </a>
                </li>
              </ul>
            </div>

            <div className="border rounded-lg p-6">
              <h3 className="font-bold text-lg mb-3">Contact Security Team</h3>
              <ul className="space-y-2 text-gray-700">
                <li>
                  <strong>Security Issues:</strong> <a href="mailto:security@smartequiz.com" className="text-blue-600 hover:underline">security@smartequiz.com</a>
                </li>
                <li>
                  <strong>Privacy Concerns:</strong> <a href="mailto:privacy@smartequiz.com" className="text-blue-600 hover:underline">privacy@smartequiz.com</a>
                </li>
                <li>
                  <strong>Compliance Questions:</strong> <a href="mailto:compliance@smartequiz.com" className="text-blue-600 hover:underline">compliance@smartequiz.com</a>
                </li>
                <li>
                  <strong>DPO Contact:</strong> <a href="mailto:dpo@smartequiz.com" className="text-blue-600 hover:underline">dpo@smartequiz.com</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Trust Center CTA */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Questions About Our Security?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Our team is here to answer your security and compliance questions.
          </p>
          <a 
            href="/contact" 
            className="inline-block px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Contact Security Team
          </a>
        </div>
      </div>
    </div>
  );
}
