import Link from 'next/link';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            Smart eQuiz Platform
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: November 18, 2025</p>

        <div className="bg-white rounded-lg shadow-sm p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing or using Smart eQuiz Platform ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed">
              Smart eQuiz Platform provides a cloud-based software-as-a-service solution for managing Bible quiz tournaments, practice sessions, and competitive championships for churches and religious organizations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">3. Account Registration</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              To use our Service, you must:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Be at least 18 years old or have parental/guardian consent</li>
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Promptly update any changes to your information</li>
              <li>Accept responsibility for all activities under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">4. Subscription and Payment</h2>
            <h3 className="text-xl font-semibold mb-2 mt-4">4.1 Plans and Pricing</h3>
            <p className="text-gray-700 leading-relaxed">
              We offer various subscription plans with different features and limitations. Pricing is available on our website and may change with 30 days' notice.
            </p>
            <h3 className="text-xl font-semibold mb-2 mt-4">4.2 Billing</h3>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Subscriptions are billed in advance on a monthly or annual basis</li>
              <li>Payment is due upon subscription renewal</li>
              <li>All fees are non-refundable except as required by law</li>
              <li>Failure to pay may result in service suspension or termination</li>
            </ul>
            <h3 className="text-xl font-semibold mb-2 mt-4">4.3 Free Trial</h3>
            <p className="text-gray-700 leading-relaxed">
              We may offer a free trial period. You must provide payment information to start a trial. You will be charged automatically when the trial ends unless you cancel beforehand.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">5. Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You agree not to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              <li>Use the Service for any illegal purpose</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon intellectual property rights</li>
              <li>Upload harmful code, viruses, or malware</li>
              <li>Attempt to gain unauthorized access to any part of the Service</li>
              <li>Interfere with or disrupt the Service</li>
              <li>Use automated systems to access the Service without permission</li>
              <li>Resell or redistribute the Service without authorization</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">6. User Content</h2>
            <h3 className="text-xl font-semibold mb-2 mt-4">6.1 Your Content</h3>
            <p className="text-gray-700 leading-relaxed">
              You retain ownership of content you create or upload. By using our Service, you grant us a license to use, store, and process your content solely to provide the Service.
            </p>
            <h3 className="text-xl font-semibold mb-2 mt-4">6.2 Content Responsibility</h3>
            <p className="text-gray-700 leading-relaxed">
              You are solely responsible for your content and must ensure it complies with all applicable laws and does not infringe upon third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              The Service, including its original content, features, and functionality, is owned by Smart eQuiz Platform and is protected by copyright, trademark, and other laws. Our trademarks may not be used without express written permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">8. Privacy and Data Protection</h2>
            <p className="text-gray-700 leading-relaxed">
              Your use of the Service is also governed by our Privacy Policy. By using the Service, you consent to our collection and use of personal data as outlined in the Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">9. Service Availability</h2>
            <p className="text-gray-700 leading-relaxed">
              We strive to provide reliable service but do not guarantee uninterrupted or error-free operation. We may modify, suspend, or discontinue any part of the Service with reasonable notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">10. Termination</h2>
            <h3 className="text-xl font-semibold mb-2 mt-4">10.1 By You</h3>
            <p className="text-gray-700 leading-relaxed">
              You may cancel your subscription at any time. Cancellation will be effective at the end of your current billing period.
            </p>
            <h3 className="text-xl font-semibold mb-2 mt-4">10.2 By Us</h3>
            <p className="text-gray-700 leading-relaxed">
              We may suspend or terminate your account for violations of these Terms, non-payment, or for any reason with reasonable notice.
            </p>
            <h3 className="text-xl font-semibold mb-2 mt-4">10.3 Effect of Termination</h3>
            <p className="text-gray-700 leading-relaxed">
              Upon termination, your right to use the Service ceases. We may delete your data after a reasonable retention period.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">11. Disclaimers</h2>
            <p className="text-gray-700 leading-relaxed">
              THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">12. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, SMART EQUIZ PLATFORM SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">13. Indemnification</h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify and hold Smart eQuiz Platform harmless from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">14. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will provide notice of material changes via email or through the Service. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">15. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">16. Dispute Resolution</h2>
            <p className="text-gray-700 leading-relaxed">
              Any disputes arising from these Terms or the Service shall be resolved through binding arbitration, except where prohibited by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">17. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              For questions about these Terms, please contact:
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-gray-700">Email: legal@smartequiz.com</p>
              <p className="text-gray-700">Address: Smart eQuiz Platform, [Your Address]</p>
            </div>
          </section>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
