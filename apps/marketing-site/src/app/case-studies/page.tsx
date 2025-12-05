import Link from 'next/link';
import { ArrowRight, TrendingUp, Users, Trophy, Globe } from 'lucide-react';

export default function CaseStudiesPage() {
  const caseStudies = [
    {
      id: 1,
      organization: "First Baptist Church",
      location: "Dallas, Texas",
      size: "Large (2000+ members)",
      challenge: "Managing 50+ youth participants across multiple age groups with manual spreadsheets and paper scoring",
      solution: "Implemented Smart eQuiz Platform with custom branding, automated tournaments, and real-time analytics",
      results: [
        "75% reduction in tournament setup time",
        "40% increase in participant engagement",
        "Eliminated scoring errors completely",
        "Expanded program from 1 to 4 tournaments per year"
      ],
      testimonial: {
        quote: "Smart eQuiz transformed our Bible quiz program from a logistical nightmare into a well-oiled machine. The kids love the gamification features, and parents appreciate the transparency of real-time scoring.",
        author: "Emily Patterson",
        role: "Education Director"
      },
      stats: {
        participants: 52,
        tournaments: 4,
        timesSaved: "20 hours/month",
        satisfaction: "4.8/5"
      },
      image: "https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800&h=500&fit=crop"
    },
    {
      id: 2,
      organization: "Regional Bible Quiz Network",
      location: "Pacific Northwest",
      size: "Multi-Church Network (12 churches)",
      challenge: "Coordinating inter-church tournaments with inconsistent scoring systems and poor communication between locations",
      solution: "Deployed Smart eQuiz Platform's parish tournament mode with centralized question bank and unified leaderboards",
      results: [
        "Unified 12 churches under one platform",
        "Grew from 200 to 1000+ participants in 18 months",
        "Reduced coordination overhead by 60%",
        "Increased inter-church participation by 85%"
      ],
      testimonial: {
        quote: "Before Smart eQuiz, coordinating regional tournaments meant dozens of emails, phone calls, and manual data reconciliation. Now everything is automated and transparent. It's been a game-changer.",
        author: "James Rodriguez",
        role: "Regional Coordinator"
      },
      stats: {
        participants: 1047,
        tournaments: 24,
        churches: 12,
        satisfaction: "4.9/5"
      },
      image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&h=500&fit=crop"
    },
    {
      id: 3,
      organization: "Grace Community Church",
      location: "Toronto, Canada",
      size: "Medium (500 members)",
      challenge: "Low youth engagement in Bible study programs and difficulty creating fresh, challenging questions",
      solution: "Leveraged AI question generator and gamification features to create engaging weekly practice sessions",
      results: [
        "90% increase in weekly practice participation",
        "Generated 500+ high-quality questions in first month",
        "Youth Bible knowledge scores improved by 35%",
        "Launched scholarship program based on quiz performance"
      ],
      testimonial: {
        quote: "The AI question generator is incredible. We can create entire quiz sets in minutes instead of hours. The gamification features have our youth competing to top the leaderboards every week.",
        author: "Sarah Mitchell",
        role: "Youth Director"
      },
      stats: {
        participants: 38,
        questionsGenerated: 847,
        engagementIncrease: "+90%",
        satisfaction: "4.7/5"
      },
      image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=500&fit=crop"
    },
    {
      id: 4,
      organization: "International Bible Quiz Federation",
      location: "Global (15 countries)",
      size: "International Network",
      challenge: "Managing cross-border competitions with multiple currencies, languages, and time zones",
      solution: "Implemented Smart eQuiz Platform's multi-currency support and localization features for global tournaments",
      results: [
        "Successfully hosted tournaments across 15 countries",
        "Supported 12 different currencies seamlessly",
        "Eliminated currency conversion confusion",
        "Unified global leaderboards with real-time updates"
      ],
      testimonial: {
        quote: "Smart eQuiz's multi-currency support and time zone handling made our international championship possible. Participants from Nigeria to Japan competed on equal footing with local pricing and familiar interfaces.",
        author: "Dr. Michael Chen",
        role: "Federation President"
      },
      stats: {
        participants: 2847,
        countries: 15,
        currencies: 12,
        satisfaction: "4.9/5"
      },
      image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=500&fit=crop"
    },
    {
      id: 5,
      organization: "New Hope Fellowship",
      location: "Nairobi, Kenya",
      size: "Growing (300 members)",
      challenge: "Limited budget for quiz management tools and need for mobile-friendly platform in area with spotty internet",
      solution: "Started with Smart eQuiz Starter plan, leveraging offline mode and mobile optimization",
      results: [
        "Launched Bible quiz program with minimal investment",
        "Mobile participation rate of 95%",
        "Successfully ran tournaments despite connectivity issues",
        "Scaled to Professional plan within 6 months"
      ],
      testimonial: {
        quote: "Smart eQuiz made it possible for us to run a professional Bible quiz program on a tight budget. The mobile app works even when our internet is unstable, which is crucial in our area.",
        author: "Pastor David Omondi",
        role: "Lead Pastor"
      },
      stats: {
        participants: 45,
        mobileUsage: "95%",
        costSavings: "$2400/year",
        satisfaction: "4.8/5"
      },
      image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=500&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Success Stories</h1>
          <p className="text-xl max-w-3xl mx-auto text-blue-100">
            See how churches and organizations worldwide are transforming their Bible quiz programs with Smart eQuiz Platform
          </p>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-4xl font-bold text-blue-600 mb-2">4,000+</div>
              <div className="text-gray-600">Active Participants</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-3">
                <Globe className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-4xl font-bold text-green-600 mb-2">15</div>
              <div className="text-gray-600">Countries Served</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-3">
                <Trophy className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-4xl font-bold text-purple-600 mb-2">1,200+</div>
              <div className="text-gray-600">Tournaments Hosted</div>
            </div>
            <div>
              <div className="flex items-center justify-center mb-3">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-4xl font-bold text-orange-600 mb-2">85%</div>
              <div className="text-gray-600">Avg. Engagement Increase</div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="space-y-16">
            {caseStudies.map((study, index) => (
              <div key={study.id} className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-8 items-center`}>
                {/* Image */}
                <div className="lg:w-1/2">
                  <img 
                    src={study.image} 
                    alt={study.organization}
                    className="rounded-lg shadow-xl w-full"
                  />
                </div>

                {/* Content */}
                <div className="lg:w-1/2">
                  <div className="mb-4">
                    <h2 className="text-3xl font-bold mb-2">{study.organization}</h2>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {study.location} • {study.size}
                    </p>
                  </div>

                  {/* Challenge */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2 text-red-600">Challenge</h3>
                    <p className="text-gray-700">{study.challenge}</p>
                  </div>

                  {/* Solution */}
                  <div className="mb-4">
                    <h3 className="font-semibold text-lg mb-2 text-blue-600">Solution</h3>
                    <p className="text-gray-700">{study.solution}</p>
                  </div>

                  {/* Results */}
                  <div className="mb-6">
                    <h3 className="font-semibold text-lg mb-3 text-green-600">Results</h3>
                    <ul className="space-y-2">
                      {study.results.map((result, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-gray-700">{result}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Testimonial */}
                  <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-600">
                    <p className="text-gray-700 italic mb-4">&quot;{study.testimonial.quote}&quot;</p>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-200 rounded-full flex items-center justify-center text-blue-600 font-bold">
                        {study.testimonial.author.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{study.testimonial.author}</div>
                        <div className="text-sm text-gray-600">{study.testimonial.role}</div>
                      </div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    {Object.entries(study.stats).map(([key, value]) => (
                      <div key={key} className="bg-white p-4 rounded-lg border text-center">
                        <div className="text-2xl font-bold text-blue-600">{value}</div>
                        <div className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Write Your Success Story?</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join hundreds of churches worldwide using Smart eQuiz to transform their Bible quiz programs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/signup"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors gap-2"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/demo"
              className="inline-flex items-center justify-center px-8 py-4 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-400 transition-colors border-2 border-white/20"
            >
              Watch Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
