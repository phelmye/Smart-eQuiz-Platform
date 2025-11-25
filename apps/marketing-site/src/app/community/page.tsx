import Link from 'next/link';
import { MessageSquare, Users, BookOpen, Award, Calendar, TrendingUp } from 'lucide-react';

export default function Community() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Smart eQuiz Community</h1>
          <p className="text-xl text-blue-100 max-w-3xl mx-auto">
            Join thousands of Bible quiz coaches, participants, and organizers sharing best practices, 
            resources, and encouragement.
          </p>
        </div>
      </div>

      {/* Community Stats */}
      <div className="max-w-7xl mx-auto px-4 -mt-12">
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900">5,000+</div>
            <div className="text-gray-600">Active Members</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <MessageSquare className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900">1,200+</div>
            <div className="text-gray-600">Discussion Topics</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900">500+</div>
            <div className="text-gray-600">Shared Resources</div>
          </div>
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Award className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <div className="text-3xl font-bold text-gray-900">200+</div>
            <div className="text-gray-600">Organizations</div>
          </div>
        </div>
      </div>

      {/* Community Features */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Community Features</h2>
        
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <div className="bg-gray-50 rounded-lg p-8">
            <MessageSquare className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Discussion Forums</h3>
            <p className="text-gray-700 mb-6">
              Connect with coaches and organizers worldwide. Share strategies, ask questions, 
              and learn from experienced quiz leaders.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Coaching Techniques & Strategies</li>
              <li>• Tournament Organization Tips</li>
              <li>• Question Writing Best Practices</li>
              <li>• Technical Support & Troubleshooting</li>
              <li>• Scripture Study Resources</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-8">
            <BookOpen className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Resource Library</h3>
            <p className="text-gray-700 mb-6">
              Access a growing collection of community-contributed resources to enhance 
              your Bible quiz program.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Practice Question Sets</li>
              <li>• Training Materials & Guides</li>
              <li>• Tournament Templates</li>
              <li>• Promotional Materials</li>
              <li>• Score Sheets & Forms</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-8">
            <Calendar className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Events & Webinars</h3>
            <p className="text-gray-700 mb-6">
              Join live events, training sessions, and webinars hosted by experienced 
              quiz coaches and platform experts.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Monthly Coaching Webinars</li>
              <li>• Quarterly Platform Training</li>
              <li>• Annual Quiz Conference</li>
              <li>• Feature Preview Sessions</li>
              <li>• Community Q&A Events</li>
            </ul>
          </div>

          <div className="bg-gray-50 rounded-lg p-8">
            <TrendingUp className="w-12 h-12 text-blue-600 mb-4" />
            <h3 className="text-2xl font-bold mb-4">Success Stories</h3>
            <p className="text-gray-700 mb-6">
              Read inspiring stories from churches and organizations that have transformed 
              their Bible quiz programs.
            </p>
            <ul className="space-y-2 text-gray-700">
              <li>• Program Growth Case Studies</li>
              <li>• Creative Tournament Formats</li>
              <li>• Youth Engagement Strategies</li>
              <li>• Multi-Site Implementations</li>
              <li>• International Expansion Stories</li>
            </ul>
          </div>
        </div>

        {/* Featured Discussions */}
        <div className="bg-blue-50 rounded-lg p-8 mb-16">
          <h3 className="text-2xl font-bold mb-6">Trending Discussions</h3>
          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4 flex items-start gap-4">
              <MessageSquare className="w-5 h-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Best practices for training new quizzers?</h4>
                <p className="text-sm text-gray-600">Posted by Sarah J. • 42 replies • Last activity 2h ago</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 flex items-start gap-4">
              <MessageSquare className="w-5 h-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">How to structure a year-long program?</h4>
                <p className="text-sm text-gray-600">Posted by Michael T. • 38 replies • Last activity 5h ago</p>
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 flex items-start gap-4">
              <MessageSquare className="w-5 h-5 text-blue-600 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold mb-1">Using AI-generated questions effectively</h4>
                <p className="text-sm text-gray-600">Posted by Pastor David • 56 replies • Last activity 1d ago</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Join the Community Today</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Get started with a free account and connect with Bible quiz enthusiasts worldwide.
          </p>
          <div className="flex gap-4 justify-center">
            <Link 
              href="/signup" 
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Create Account
            </Link>
            <Link 
              href="/contact" 
              className="px-8 py-3 bg-blue-700 text-white border border-white rounded-lg font-semibold hover:bg-blue-600 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
