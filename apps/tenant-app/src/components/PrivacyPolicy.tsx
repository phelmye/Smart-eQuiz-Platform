import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { useLegalDocument, LegalDocumentType } from '@/hooks/useLegalDocument';
import ReactMarkdown from 'react-markdown';

interface PrivacyPolicyProps {
  onBack?: () => void;
  tenantId?: string;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack, tenantId }) => {
  const { document, loading, error } = useLegalDocument(LegalDocumentType.PRIVACY_POLICY, tenantId);

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
            <CardTitle className="text-2xl">
              {document?.title || 'Privacy Policy'}
            </CardTitle>
            {document && (
              <p className="text-sm text-gray-500">
                Version {document.version} • Last updated: {new Date(document.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-32 w-full mt-6" />
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Failed to load privacy policy. Please try again later.
                </AlertDescription>
              </Alert>
            )}

            {!loading && !error && document && (
              <ScrollArea className="h-[600px] pr-4">
                <div className="prose max-w-none">
                  <ReactMarkdown>{document.content}</ReactMarkdown>
                </div>
              </ScrollArea>
            )}

            {!loading && !error && !document && (
              <ScrollArea className="h-[600px] pr-4">
                <div className="space-y-6">
                  <section>
                    <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                    <p className="text-gray-700 leading-relaxed">
                      Smart eQuiz Platform ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. Please read this privacy policy carefully.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">2. Information We Collect</h2>
                    
                    <h3 className="text-lg font-medium mb-2 mt-4">2.1 Personal Information</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      We collect information that you provide directly to us:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                      <li>Name and contact information (email address, phone number)</li>
                      <li>Account credentials (username, password)</li>
                      <li>Profile information (avatar, bio, preferences)</li>
                      <li>Payment information (processed securely by third-party providers)</li>
                      <li>Organization information (for organizational accounts)</li>
                    </ul>

                    <h3 className="text-lg font-medium mb-2 mt-4">2.2 Usage Information</h3>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      We automatically collect information about your use of the Service:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                      <li>Quiz and tournament participation data</li>
                      <li>Performance metrics and scores</li>
                      <li>Login times and session duration</li>
                      <li>Device information (IP address, browser type, operating system)</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>

                    <h3 className="text-lg font-medium mb-2 mt-4">2.3 Content You Create</h3>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                      <li>Questions and quizzes you create</li>
                      <li>Tournament configurations</li>
                      <li>Comments and feedback</li>
                      <li>Custom branding and themes</li>
                    </ul>
                  </section>

                  <section>
                    <h2 className="text-xl font-semibold mb-3">3. How We Use Your Information</h2>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      We use the information we collect to:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-gray-700">
                      <li>Provide, maintain, and improve our Service</li>
                      <li>Process transactions and send transaction notifications</li>
                      <li>Respond to your comments and questions</li>
                      <li>Send you technical notices and support messages</li>
                      <li>Communicate about products, services, and events</li>
                      <li>Monitor and analyze trends, usage, and activities</li>
                      <li>Detect, investigate, and prevent fraudulent activities</li>
                      <li>Personalize your experience</li>
                      <li>Comply with legal obligations</li>
                    </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">4. Information Sharing and Disclosure</h2>
                  
                  <h3 className="text-lg font-medium mb-2 mt-4">4.1 We May Share Information:</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li><strong>With your consent:</strong> When you direct us to share information</li>
                    <li><strong>Service providers:</strong> Third parties who perform services on our behalf</li>
                    <li><strong>Business transfers:</strong> In connection with mergers, acquisitions, or asset sales</li>
                    <li><strong>Legal requirements:</strong> To comply with laws or respond to legal requests</li>
                    <li><strong>Protection:</strong> To protect rights, property, or safety</li>
                  </ul>

                  <h3 className="text-lg font-medium mb-2 mt-4">4.2 We Do NOT:</h3>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li>Sell your personal information to third parties</li>
                    <li>Share your quiz performance with unauthorized parties</li>
                    <li>Use your content for purposes other than providing the Service</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">5. Data Security</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700 mt-2">
                    <li>Encryption of data in transit and at rest</li>
                    <li>Regular security assessments</li>
                    <li>Access controls and authentication</li>
                    <li>Secure payment processing through certified providers</li>
                    <li>Regular backups and disaster recovery procedures</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We retain your personal information for as long as necessary to provide the Service and fulfill the purposes outlined in this Privacy Policy. When you delete your account, we will delete or anonymize your personal information within 90 days, except where we are required to retain it for legal purposes.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">7. Your Rights and Choices</h2>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    You have the following rights regarding your personal information:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-gray-700">
                    <li><strong>Access:</strong> Request a copy of your personal information</li>
                    <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                    <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                    <li><strong>Portability:</strong> Receive your data in a structured format</li>
                    <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                    <li><strong>Restriction:</strong> Request limitation of processing</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed mt-2">
                    To exercise these rights, please contact us at privacy@smartequiz.com
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">8. Cookies and Tracking</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We use cookies and similar tracking technologies to collect and track information about your use of the Service. You can control cookies through your browser settings. However, disabling cookies may affect the functionality of the Service.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">9. International Data Transfers</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that are different from the laws of your country. We take appropriate measures to ensure your personal information remains protected.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">10. Children's Privacy</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Our Service is not directed to children under 13 years of age. We do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe your child has provided us with personal information, please contact us.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">11. Third-Party Services</h2>
                  <p className="text-gray-700 leading-relaxed">
                    Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties. We encourage you to read their privacy policies.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">12. Changes to This Privacy Policy</h2>
                  <p className="text-gray-700 leading-relaxed">
                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">13. Contact Us</h2>
                  <p className="text-gray-700 leading-relaxed">
                    If you have any questions about this Privacy Policy, please contact us:
                  </p>
                  <ul className="list-none space-y-1 text-gray-700 mt-2">
                    <li>Email: privacy@smartequiz.com</li>
                    <li>Support: support@smartequiz.com</li>
                  </ul>
                </section>

                <section className="border-t pt-4 mt-6">
                  <p className="text-sm text-gray-500 italic">
                    By using Smart eQuiz Platform, you acknowledge that you have read and understood this Privacy Policy.
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

export default PrivacyPolicy;
