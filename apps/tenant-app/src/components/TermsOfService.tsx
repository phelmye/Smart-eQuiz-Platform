import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowLeft } from 'lucide-react';

interface TermsOfServiceProps {
  onBack?: () => void;
}

export const TermsOfService: React.FC<TermsOfServiceProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {onBack && (
          <Button variant="ghost" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Terms of Service</CardTitle>
            <p className="text-sm text-gray-500">Last updated: November 15, 2025</p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                <section>
                  <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                  <p className="text-gray-700 leading-relaxed">
                    By accessing and using Smart eQuiz Platform ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">2. Use License</h2>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    Permission is granted to temporarily access the Service for personal or organizational use. This is the grant of a license, not a transfer of title, and under this license you may not:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Modify or copy the materials</li>
                    <li>Use the materials for any commercial purpose without proper subscription</li>
                    <li>Attempt to decompile or reverse engineer any software contained in the Service</li>
                    <li>Remove any copyright or other proprietary notations from the materials</li>
                    <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">3. Account Terms</h2>
                  <div className="space-y-2 text-gray-700">
                    <p>3.1. You must be 13 years or older to use this Service.</p>
                    <p>3.2. You must be a human. Accounts registered by "bots" or other automated methods are not permitted.</p>
                    <p>3.3. You are responsible for maintaining the security of your account and password.</p>
                    <p>3.4. You are responsible for all content posted and activity that occurs under your account.</p>
                    <p>3.5. You may not use the Service for any illegal or unauthorized purpose.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">4. Payment Terms</h2>
                  <div className="space-y-2 text-gray-700">
                    <p>4.1. A valid payment method is required for paid subscriptions.</p>
                    <p>4.2. All fees are exclusive of all taxes, levies, or duties.</p>
                    <p>4.3. Subscriptions are billed in advance on a monthly or yearly basis.</p>
                    <p>4.4. There will be no refunds or credits for partial months of service.</p>
                    <p>4.5. All fees are non-refundable except as required by law.</p>
                    <p>4.6. Tournament entry fees are non-refundable once the tournament begins.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">5. Cancellation and Termination</h2>
                  <div className="space-y-2 text-gray-700">
                    <p>5.1. You are solely responsible for properly canceling your account.</p>
                    <p>5.2. Upon cancellation, your content may be permanently deleted.</p>
                    <p>5.3. We reserve the right to suspend or terminate your account at any time for violation of these terms.</p>
                    <p>5.4. We reserve the right to refuse service to anyone for any reason at any time.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">6. Modifications to Service</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right to modify or discontinue, temporarily or permanently, the Service (or any part thereof) with or without notice. We shall not be liable to you or to any third party for any modification, price change, suspension or discontinuance of the Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">7. Intellectual Property</h2>
                  <div className="space-y-2 text-gray-700">
                    <p>7.1. All content included in the Service is the property of Smart eQuiz Platform or its content suppliers.</p>
                    <p>7.2. You retain ownership of all content you post to the Service.</p>
                    <p>7.3. By posting content, you grant us a non-exclusive license to use, modify, and display such content.</p>
                  </div>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
                  <p className="text-gray-700 leading-relaxed">
                    In no event shall Smart eQuiz Platform be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">9. Data Protection</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Your use of the Service is also governed by our Privacy Policy. Please review our Privacy Policy, which also governs the Service and informs users of our data collection practices.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">10. Changes to Terms</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material, we will provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">11. Contact Information</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Questions about the Terms of Service should be sent to us at support@smartequiz.com
                  </p>
                </section>

                <section className="border-t pt-4 mt-6">
                  <p className="text-sm text-gray-500 italic">
                    By using Smart eQuiz Platform, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                  </p>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
