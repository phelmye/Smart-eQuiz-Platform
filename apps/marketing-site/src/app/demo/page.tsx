import Link from 'next/link';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Try Smart eQuiz - Live Demo</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
            Experience the full platform with our interactive demo tenant
          </p>
          
          {/* Demo Access Card */}
          <div className="max-w-2xl mx-auto bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-left border border-white/20">
            <h2 className="text-2xl font-bold mb-4 text-center">Access Demo Tenant</h2>
            
            <div className="space-y-4 mb-6">
              <div className="bg-white/20 rounded-lg p-4">
                <p className="text-sm text-blue-100 mb-1">Demo URL:</p>
                <a 
                  href={process.env.NODE_ENV === 'development' 
                    ? 'http://localhost:5174?tenant=demo' 
                    : 'https://demo.smartequiz.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-mono font-bold hover:underline"
                >
                  demo.smartequiz.com
                </a>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm text-blue-100 mb-1">Admin Login:</p>
                  <p className="font-mono text-sm">admin@demo.local</p>
                  <p className="font-mono text-sm">password123</p>
                </div>
                
                <div className="bg-white/20 rounded-lg p-4">
                  <p className="text-sm text-blue-100 mb-1">Organization:</p>
                  <p className="font-semibold">Demo Church</p>
                  <p className="text-sm text-blue-100">Full admin access</p>
                </div>
              </div>
            </div>
            
            <a
              href={process.env.NODE_ENV === 'development' 
                ? 'http://localhost:5174?tenant=demo' 
                : 'https://demo.smartequiz.com'}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-blue-50 transition-colors text-center"
            >
              Launch Demo Tenant →
            </a>
            
            <p className="text-sm text-blue-100 text-center mt-4">
              Try all features: create tournaments, manage questions, run practice sessions, and view analytics
            </p>
          </div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <svg className="w-24 h-24 mx-auto mb-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
                <p className="text-lg text-gray-300">Demo video coming soon</p>
                <p className="text-sm text-gray-400 mt-2">
                  Platform walkthrough and feature demonstration
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Demo Features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Try These Features</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Create Tournament</h3>
              <p className="text-gray-600 mb-4">
                Set up a tournament in minutes with our intuitive builder
              </p>
              <Link href="/signup" className="text-blue-600 hover:underline text-sm font-medium">
                Try it free →
              </Link>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Question Generator</h3>
              <p className="text-gray-600 mb-4">
                Generate Bible quiz questions with our AI-powered tool
              </p>
              <Link href="/signup" className="text-blue-600 hover:underline text-sm font-medium">
                Try it free →
              </Link>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Real-time Analytics</h3>
              <p className="text-gray-600 mb-4">
                Track performance and engagement with live dashboards
              </p>
              <Link href="/signup" className="text-blue-600 hover:underline text-sm font-medium">
                Try it free →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule Demo CTA */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Want a Personalized Demo?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Schedule a one-on-one session with our team to see how Smart eQuiz can work for your organization
          </p>
          <Link 
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Schedule Demo
          </Link>
        </div>
      </section>
    </div>
  );
}
