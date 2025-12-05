import Link from 'next/link';
import { Shield, CheckCircle, FileText, Download, Award, Globe, Lock } from 'lucide-react';

export default function ComplianceReportsPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="border-b bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-16">
          <Link href="/docs" className="text-sm hover:underline mb-4 inline-block opacity-90">
            ← Back to Documentation
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Compliance Reports & Certifications</h1>
          <p className="text-xl opacity-90 max-w-3xl">
            Third-party audits, security certifications, and compliance documentation
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Introduction */}
        <section className="mb-16">
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Smart eQuiz undergoes regular third-party security audits and maintains industry-standard 
            certifications to ensure the highest levels of security, privacy, and compliance. This page 
            provides transparency into our compliance posture and access to relevant reports.
          </p>
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4">
            <p className="text-sm text-gray-700">
              <strong>Note:</strong> Some reports are only available to Enterprise customers or require 
              an NDA. Contact us at <a href="mailto:compliance@smartequiz.com" className="text-blue-600 hover:underline">compliance@smartequiz.com</a> for access.
            </p>
          </div>
        </section>

        {/* Certifications */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-green-100 rounded-lg">
              <Award className="w-6 h-6 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold">Security Certifications</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* SOC 2 Type II */}
            <div className="border-2 border-green-600 rounded-lg p-6 bg-green-50">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <h3 className="text-xl font-bold">SOC 2 Type II</h3>
                  <p className="text-sm text-gray-600">Available for Enterprise</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Annual independent audit of our security controls, availability, processing integrity, 
                confidentiality, and privacy practices.
              </p>
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <p><strong>Last Audit:</strong> September 2025</p>
                <p><strong>Audit Period:</strong> October 2024 - September 2025</p>
                <p><strong>Auditor:</strong> [Major Auditing Firm]</p>
              </div>
              <button className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Request Report (Enterprise Only)
              </button>
            </div>

            {/* ISO 27001 */}
            <div className="border-2 border-blue-600 rounded-lg p-6 bg-blue-50">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle className="w-8 h-8 text-blue-600" />
                <div>
                  <h3 className="text-xl font-bold">ISO 27001</h3>
                  <p className="text-sm text-gray-600">In Progress (Q1 2026)</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                International standard for information security management systems. Certification process 
                currently underway with completion expected Q1 2026.
              </p>
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <p><strong>Expected Certification:</strong> March 2026</p>
                <p><strong>Certification Body:</strong> [Accredited Registrar]</p>
                <p><strong>Scope:</strong> All Smart eQuiz platform services</p>
              </div>
              <button className="w-full py-2 bg-gray-300 text-gray-700 rounded-lg font-semibold cursor-not-allowed">
                In Progress
              </button>
            </div>

            {/* GDPR Compliance */}
            <div className="border-2 border-purple-600 rounded-lg p-6 bg-purple-50">
              <div className="flex items-center gap-3 mb-4">
                <Globe className="w-8 h-8 text-purple-600" />
                <div>
                  <h3 className="text-xl font-bold">GDPR Compliant</h3>
                  <p className="text-sm text-gray-600">EU Data Protection</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Full compliance with the European Union's General Data Protection Regulation including 
                data processing agreements and EU data residency options.
              </p>
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <p><strong>DPA Available:</strong> Yes</p>
                <p><strong>Data Residency:</strong> EU region available</p>
                <p><strong>DPO Contact:</strong> dpo@smartequiz.com</p>
              </div>
              <Link href="/docs/data-privacy" className="block w-full py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors text-center">
                View Privacy Documentation
              </Link>
            </div>

            {/* CCPA Compliance */}
            <div className="border-2 border-yellow-600 rounded-lg p-6 bg-yellow-50">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-8 h-8 text-yellow-600" />
                <div>
                  <h3 className="text-xl font-bold">CCPA Compliant</h3>
                  <p className="text-sm text-gray-600">California Privacy</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4">
                Compliant with the California Consumer Privacy Act, providing California residents with 
                enhanced privacy rights and controls.
              </p>
              <div className="space-y-2 text-sm text-gray-700 mb-4">
                <p><strong>Privacy Notice:</strong> Available</p>
                <p><strong>Do Not Sell:</strong> We don't sell data</p>
                <p><strong>Consumer Rights:</strong> Access, Delete, Opt-out</p>
              </div>
              <Link href="/privacy" className="block w-full py-2 bg-yellow-600 text-white rounded-lg font-semibold hover:bg-yellow-700 transition-colors text-center">
                View Privacy Policy
              </Link>
            </div>
          </div>
        </section>

        {/* Available Reports */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold">Available Reports</h2>
          </div>

          <div className="space-y-4">
            {/* Security Overview */}
            <div className="border rounded-lg p-6 hover:border-blue-600 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Security Overview Whitepaper</h3>
                  <p className="text-gray-700 mb-3">
                    Comprehensive overview of our security architecture, encryption standards, access controls, 
                    and incident response procedures. <strong>Public - No NDA required.</strong>
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Public</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">PDF</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">26 pages</span>
                  </div>
                </div>
                <Download className="w-6 h-6 text-blue-600 flex-shrink-0" />
              </div>
              <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Download (PDF)
              </button>
            </div>

            {/* Penetration Test Results */}
            <div className="border rounded-lg p-6 hover:border-purple-600 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Penetration Test Summary</h3>
                  <p className="text-gray-700 mb-3">
                    Executive summary of our most recent third-party penetration testing results. Full report 
                    available to Enterprise customers. <strong>Professional & Enterprise plans.</strong>
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">Professional+</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">PDF</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">12 pages</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Last Test:</strong> October 2025 | <strong>Next Test:</strong> April 2026
                  </p>
                </div>
                <Download className="w-6 h-6 text-purple-600 flex-shrink-0" />
              </div>
              <button className="w-full py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Request Summary
              </button>
            </div>

            {/* SOC 2 Report */}
            <div className="border rounded-lg p-6 hover:border-green-600 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">SOC 2 Type II Report</h3>
                  <p className="text-gray-700 mb-3">
                    Complete SOC 2 Type II audit report covering security, availability, and confidentiality. 
                    <strong>Enterprise plan only. NDA required.</strong>
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-red-100 text-red-800 text-sm rounded-full">Enterprise Only</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">NDA Required</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">PDF</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Audit Period:</strong> Oct 2024 - Sep 2025 | <strong>Report Date:</strong> November 2025
                  </p>
                </div>
                <Lock className="w-6 h-6 text-green-600 flex-shrink-0" />
              </div>
              <button className="w-full py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                Request Access (Enterprise)
              </button>
            </div>

            {/* Vulnerability Disclosure */}
            <div className="border rounded-lg p-6 hover:border-blue-600 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Vulnerability Disclosure Report</h3>
                  <p className="text-gray-700 mb-3">
                    Quarterly summary of security vulnerabilities reported, assessed, and remediated. 
                    Demonstrates our commitment to continuous security improvement. <strong>Public.</strong>
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Public</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">PDF</span>
                    <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">Quarterly</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    <strong>Latest Report:</strong> Q3 2025 (Jul-Sep)
                  </p>
                </div>
                <Download className="w-6 h-6 text-blue-600 flex-shrink-0" />
              </div>
              <button className="w-full py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Download Latest (PDF)
              </button>
            </div>

            {/* Data Processing Agreement */}
            <div className="border rounded-lg p-6 hover:border-purple-600 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">Data Processing Agreement (DPA)</h3>
                  <p className="text-gray-700 mb-3">
                    GDPR-compliant data processing agreement for organizations that need formal contracts 
                    covering data protection. <strong>Professional & Enterprise plans.</strong>
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">Professional+</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">PDF</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">Standard Clauses</span>
                  </div>
                </div>
                <Download className="w-6 h-6 text-purple-600 flex-shrink-0" />
              </div>
              <button className="w-full py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                Download DPA Template
              </button>
            </div>
          </div>
        </section>

        {/* Compliance Standards */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Compliance Standards We Follow</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">Data Protection</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ GDPR (European Union)</li>
                <li>✓ CCPA (California)</li>
                <li>✓ PIPEDA (Canada)</li>
                <li>✓ LGPD (Brazil)</li>
                <li>✓ Privacy Shield (EU-US transfers)</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">Security Standards</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ SOC 2 Type II</li>
                <li>✓ ISO 27001 (in progress)</li>
                <li>✓ NIST Cybersecurity Framework</li>
                <li>✓ OWASP Top 10</li>
                <li>✓ CSA STAR (planned 2026)</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">Industry-Specific</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ COPPA (children's privacy)</li>
                <li>✓ FERPA (educational records)</li>
                <li>✓ Accessibility (WCAG 2.1 AA)</li>
                <li>✓ PCI DSS (payment security)</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-xl font-bold mb-3">Cloud Security</h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ AWS Well-Architected Framework</li>
                <li>✓ Google Cloud Best Practices</li>
                <li>✓ Azure Security Baseline</li>
                <li>✓ Zero Trust Architecture</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Trust Center */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Trust Center</h2>
          
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8 border-2 border-blue-200">
            <h3 className="text-2xl font-bold mb-4">Comprehensive Security & Compliance Hub</h3>
            <p className="text-gray-700 mb-6">
              Our Trust Center provides real-time access to security documentation, compliance reports, 
              system status, and incident history. Available 24/7 to all customers.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4">
                <CheckCircle className="w-8 h-8 text-green-600 mb-2" />
                <h4 className="font-bold mb-1">System Status</h4>
                <p className="text-sm text-gray-600">Real-time uptime monitoring</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <Shield className="w-8 h-8 text-blue-600 mb-2" />
                <h4 className="font-bold mb-1">Security Updates</h4>
                <p className="text-sm text-gray-600">Latest security news</p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <FileText className="w-8 h-8 text-purple-600 mb-2" />
                <h4 className="font-bold mb-1">Documentation</h4>
                <p className="text-sm text-gray-600">All compliance docs</p>
              </div>
            </div>
            <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              Visit Trust Center
            </button>
          </div>
        </section>

        {/* Request Access */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Request Report Access</h2>
          
          <div className="bg-gray-50 rounded-lg p-8">
            <p className="text-gray-700 mb-6">
              To request access to compliance reports or discuss custom compliance requirements:
            </p>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h4 className="font-bold mb-2">For Current Customers</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Log in to your account and submit a request through the Support portal. 
                  Enterprise customers can access reports directly in account settings.
                </p>
                <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Go to Support Portal
                </button>
              </div>
              <div>
                <h4 className="font-bold mb-2">For Prospects</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Evaluating Smart eQuiz? Contact our sales team to discuss compliance requirements 
                  and request relevant documentation.
                </p>
                <Link href="/contact" className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors">
                  Contact Sales
                </Link>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> <a href="mailto:compliance@smartequiz.com" className="text-blue-600 hover:underline">compliance@smartequiz.com</a> | 
              <strong className="ml-4">Response Time:</strong> Within 48 business hours
            </p>
          </div>
        </section>

        {/* Related Links */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Related Documentation</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/docs/security-best-practices" className="border rounded-lg p-6 hover:border-blue-600 hover:shadow-lg transition-all">
              <h3 className="font-bold text-lg mb-2">Security Best Practices</h3>
              <p className="text-gray-600">Guide to securing your account</p>
            </Link>
            <Link href="/docs/data-privacy" className="border rounded-lg p-6 hover:border-blue-600 hover:shadow-lg transition-all">
              <h3 className="font-bold text-lg mb-2">Data Privacy Documentation</h3>
              <p className="text-gray-600">How we handle your data</p>
            </Link>
            <Link href="/security" className="border rounded-lg p-6 hover:border-blue-600 hover:shadow-lg transition-all">
              <h3 className="font-bold text-lg mb-2">Security Overview</h3>
              <p className="text-gray-600">Platform security features</p>
            </Link>
            <Link href="/docs" className="border rounded-lg p-6 hover:border-blue-600 hover:shadow-lg transition-all">
              <h3 className="font-bold text-lg mb-2">Documentation Hub</h3>
              <p className="text-gray-600">All platform documentation</p>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
