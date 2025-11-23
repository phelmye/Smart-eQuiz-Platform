'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Calendar, User, ArrowRight } from 'lucide-react';

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const posts = [
    {
      id: 1,
      title: "5 Ways to Improve Your Bible Quiz Team's Performance",
      excerpt: "Discover proven strategies to help your team excel in competitive Bible quiz tournaments.",
      author: "Sarah Johnson",
      date: "November 15, 2025",
      category: "Coaching Tips",
      image: "https://images.unsplash.com/photo-1519791883288-dc8bd696e667?w=800&h=400&fit=crop"
    },
    {
      id: 2,
      title: "How AI is Revolutionizing Bible Quiz Question Generation",
      excerpt: "Learn how artificial intelligence is making it easier than ever to create diverse, challenging quiz questions.",
      author: "Michael Chen",
      date: "November 10, 2025",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop"
    },
    {
      id: 3,
      title: "Setting Up Your First Tournament: A Complete Guide",
      excerpt: "Everything you need to know to organize a successful Bible quiz tournament from start to finish.",
      author: "David Williams",
      date: "November 5, 2025",
      category: "Tournaments",
      image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop"
    },
    {
      id: 4,
      title: "Multi-Tenant Platform Benefits for Church Networks",
      excerpt: "Why multi-tenant architecture is the perfect solution for managing multiple church quiz programs.",
      author: "Emily Rodriguez",
      date: "October 28, 2025",
      category: "Platform Features",
      image: "https://images.unsplash.com/photo-1529070538774-1843cb3265df?w=800&h=400&fit=crop"
    },
    {
      id: 5,
      title: "Best Practices for Question Bank Management",
      excerpt: "Tips for organizing, categorizing, and maintaining a high-quality question database.",
      author: "James Patterson",
      date: "October 20, 2025",
      category: "Best Practices",
      image: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&h=400&fit=crop"
    },
    {
      id: 6,
      title: "Success Story: How First Baptist Transformed Their Quiz Program",
      excerpt: "A case study on how one church modernized their Bible quiz program with Smart eQuiz Platform.",
      author: "Sarah Johnson",
      date: "October 15, 2025",
      category: "Case Studies",
      image: "https://images.unsplash.com/photo-1544377193-33dcf4d68fb5?w=800&h=400&fit=crop"
    },
    {
      id: 7,
      title: "Understanding Role-Based Access Control in Quiz Platforms",
      excerpt: "Learn how RBAC ensures security and proper permissions across your organization's quiz program.",
      author: "Michael Chen",
      date: "October 10, 2025",
      category: "Platform Features",
      image: "https://images.unsplash.com/photo-1555421689-491a97ff2040?w=800&h=400&fit=crop"
    },
    {
      id: 8,
      title: "Motivating Participants: Gamification Strategies That Work",
      excerpt: "Explore proven gamification techniques including XP systems, badges, and leaderboards to boost engagement.",
      author: "Sarah Johnson",
      date: "October 5, 2025",
      category: "Coaching Tips",
      image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&h=400&fit=crop"
    },
    {
      id: 9,
      title: "Multi-Currency Support: Going Global with Your Quiz Program",
      excerpt: "How Smart eQuiz Platform supports 12 currencies to help churches worldwide run competitions.",
      author: "Emily Rodriguez",
      date: "September 28, 2025",
      category: "Platform Features",
      image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=400&fit=crop"
    },
    {
      id: 10,
      title: "Creating Effective Study Plans for Quiz Participants",
      excerpt: "Structured approaches to help students prepare for tournaments with daily goals and adaptive difficulty.",
      author: "David Williams",
      date: "September 20, 2025",
      category: "Coaching Tips",
      image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&h=400&fit=crop"
    },
    {
      id: 11,
      title: "The Power of Real-Time Analytics in Tournament Management",
      excerpt: "Discover how live performance tracking and insights improve both participant experience and outcomes.",
      author: "James Patterson",
      date: "September 15, 2025",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop"
    },
    {
      id: 12,
      title: "Building a Thriving Bible Quiz Community",
      excerpt: "Proven strategies for fostering engagement, retention, and growth in your church's quiz program.",
      author: "Sarah Johnson",
      date: "September 10, 2025",
      category: "Best Practices",
      image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=400&fit=crop"
    },
    {
      id: 13,
      title: "Parish Tournament Mode: Coordinating Multi-Church Competitions",
      excerpt: "Step-by-step guide to organizing and running successful inter-church Bible quiz tournaments.",
      author: "David Williams",
      date: "September 5, 2025",
      category: "Tournaments",
      image: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=400&fit=crop"
    },
    {
      id: 14,
      title: "Data Security and Privacy in Multi-Tenant Platforms",
      excerpt: "Understanding how tenant isolation protects your organization's data and ensures compliance.",
      author: "Michael Chen",
      date: "August 30, 2025",
      category: "Technology",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=400&fit=crop"
    },
    {
      id: 15,
      title: "Success Story: Regional Network Scales to 1000+ Participants",
      excerpt: "How a regional Bible quiz network used Smart eQuiz Platform to manage explosive growth.",
      author: "Emily Rodriguez",
      date: "August 25, 2025",
      category: "Case Studies",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=400&fit=crop"
    }
  ];

  const categories = ["All", "Coaching Tips", "Technology", "Tournaments", "Platform Features", "Best Practices", "Case Studies"];

  const filteredPosts = selectedCategory === 'All' 
    ? posts 
    : posts.filter(post => post.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Smart eQuiz Blog</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Tips, insights, and news about Bible quiz competitions, technology, and best practices
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="border-b bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-wrap gap-3">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  category === selectedCategory
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100 border"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map(post => (
              <article key={post.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow border">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                      {post.category}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-600">
                    <Link href={`/blog/${post.id}`}>{post.title}</Link>
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <Link 
                    href={`/blog/${post.id}`}
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-2 mt-12">
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg">1</button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">2</button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">3</button>
            <button className="px-4 py-2 border rounded-lg hover:bg-gray-50">
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Newsletter Subscribe */}
      <section className="bg-blue-600 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Subscribe to Our Newsletter</h2>
          <p className="text-blue-100 mb-8">
            Get the latest articles, tips, and updates delivered to your inbox
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
