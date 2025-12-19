'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PlatformLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    organization: '',
    email: '',
    password: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Step 1: Verify tenant exists
      const tenantSubdomain = formData.organization.toLowerCase().trim();
      
      // Step 2: Redirect to tenant's login page
      const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'smartequiz.com';
      const isDev = process.env.NODE_ENV === 'development';
      
      if (isDev) {
        // Development: redirect to localhost with tenant info
        window.location.href = `http://localhost:5174?tenant=${tenantSubdomain}&email=${encodeURIComponent(formData.email)}`;
      } else {
        // Production: redirect to tenant subdomain
        window.location.href = `https://${tenantSubdomain}.${baseDomain}?email=${encodeURIComponent(formData.email)}`;
      }
      
    } catch (err) {
      setError('Could not find that organization. Please check the name and try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <div className="text-3xl font-bold text-blue-600">Smart eQuiz</div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Your Organization</h1>
          <p className="text-gray-600">
            Enter your organization name to continue to login
          </p>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> If you're a participant, use the direct link provided by your organization.
            </p>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="organization" className="block text-sm font-medium text-gray-700 mb-2">
              Organization Name or Subdomain
            </label>
            <input
              type="text"
              id="organization"
              name="organization"
              required
              value={formData.organization}
              onChange={(e) => setFormData({...formData, organization: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., firstbaptist or demo"
            />
            <p className="mt-1 text-xs text-gray-500">
              This will be your URL: <span className="font-mono">{formData.organization || 'yourorg'}.smartequiz.com</span>
            </p>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Your Email (Optional)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Pre-fill your email on next page"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-6 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Redirecting...' : 'Continue to Login'}
          </button>
        </form>

        {/* Divider */}
        <div className="my-8 flex items-center">
          <div className="flex-1 border-t border-gray-300"></div>
          <span className="px-4 text-sm text-gray-500">New to Smart eQuiz?</span>
          <div className="flex-1 border-t border-gray-300"></div>
        </div>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-gray-600 mb-4">
            Start your organization's Bible quiz program today
          </p>
          <Link 
            href="/signup"
            className="inline-block w-full py-3 px-6 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Create Free Account
          </Link>
        </div>

        {/* Help */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Need help?{' '}
            <Link href="/contact" className="text-blue-600 hover:underline">
              Contact Support
            </Link>
          </p>
        </div>

        {/* Note for Participants */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            <strong>Quiz Participants:</strong> Please use the direct link provided by your organization to access your quiz platform.
          </p>
        </div>
      </div>
    </div>
  );
}
