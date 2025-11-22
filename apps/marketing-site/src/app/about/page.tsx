import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">About Smart eQuiz</h1>
          <p className="text-xl max-w-3xl mx-auto text-blue-100">
            Empowering churches worldwide to build stronger Bible knowledge through competitive quizzing
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              We believe that Bible knowledge transforms lives. Smart eQuiz was created to make it easier 
              for churches and organizations to run engaging, competitive Bible quiz programs that inspire 
              participants to dive deeper into Scripture.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Biblical Foundation</h3>
              <p className="text-gray-600">
                Built by people who love Scripture and understand the importance of Bible study
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Community Focused</h3>
              <p className="text-gray-600">
                Designed to bring churches together and foster healthy competition
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Technology Driven</h3>
              <p className="text-gray-600">
                Leveraging modern tech to make quiz management effortless and engaging
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Our Story</h2>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              Smart eQuiz was born out of a simple frustration: running Bible quiz tournaments was too complicated. 
              Between managing brackets, tracking scores, organizing questions, and keeping participants engaged, 
              quiz coordinators were spending more time on logistics than on ministry.
            </p>
            
            <p className="text-gray-600 mb-6">
              We knew there had to be a better way. After working with dozens of churches and quiz organizations, 
              we built Smart eQuiz from the ground up to solve these real-world challenges.
            </p>
            
            <p className="text-gray-600 mb-6">
              Today, Smart eQuiz serves churches across multiple countries, powering thousands of quiz tournaments 
              and helping participants grow in their knowledge of Scripture. We're constantly innovating, adding 
              features requested by our community, and working to make Bible quizzing more accessible to everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">1</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Scripture First</h3>
                <p className="text-gray-600">
                  Every feature we build is designed to help people engage more deeply with God's Word.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-600">2</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Simplicity & Excellence</h3>
                <p className="text-gray-600">
                  We make powerful tools that are easy to use, so you can focus on what matters most.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-purple-600">3</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Servant Leadership</h3>
                <p className="text-gray-600">
                  We're here to serve churches and support their ministry, not just sell software.
                </p>
              </div>
            </div>

            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <span className="text-2xl font-bold text-orange-600">4</span>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Continuous Innovation</h3>
                <p className="text-gray-600">
                  We listen to our users and constantly improve based on their feedback and needs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Join Churches Worldwide</h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Start using Smart eQuiz for your Bible quiz program today
          </p>
          <Link 
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
}
