'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function WelcomeContent() {
  const searchParams = useSearchParams();
  const subdomain = searchParams.get('subdomain') || 'your-church';

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-2xl p-8 md:p-12 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Welcome to Smart eQuiz! 🎉
        </h1>
        
        <p className="text-xl text-gray-600 mb-8">
          Your account has been created successfully!
        </p>

        {/* Account Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="font-semibold text-lg mb-4">Your Platform Details</h2>
          <div className="space-y-3 text-left">
            <div className="flex justify-between">
              <span className="text-gray-600">Your Site URL:</span>
              <span className="font-semibold text-blue-600">
                {subdomain}.smartequiz.com
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trial Period:</span>
              <span className="font-semibold">14 days</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className="font-semibold text-green-600">Active</span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="text-left mb-8">
          <h3 className="font-semibold text-lg mb-4">Next Steps:</h3>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                <span className="text-blue-600 font-semibold">1</span>
              </div>
              <div>
                <h4 className="font-semibold">Check your email</h4>
                <p className="text-sm text-gray-600">
                  We've sent you a verification email with login instructions
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                <span className="text-blue-600 font-semibold">2</span>
              </div>
              <div>
                <h4 className="font-semibold">Set up your organization</h4>
                <p className="text-sm text-gray-600">
                  Customize your branding, add team members, and configure settings
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mr-3">
                <span className="text-blue-600 font-semibold">3</span>
              </div>
              <div>
                <h4 className="font-semibold">Create your first tournament</h4>
                <p className="text-sm text-gray-600">
                  Start adding participants and questions to get started
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`https://${subdomain}.smartequiz.com/login`}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Go to Your Dashboard
          </Link>
          <Link
            href="/docs"
            className="px-8 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            View Documentation
          </Link>
        </div>

        {/* Support */}
        <p className="mt-8 text-sm text-gray-500">
          Need help getting started?{' '}
          <Link href="/contact" className="text-blue-600 hover:underline">
            Contact our support team
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function WelcomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <WelcomeContent />
    </Suspense>
  );
}
