'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Book, Code, Zap, Settings, HelpCircle, Search, ArrowRight } from 'lucide-react';

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  
  const sections = [
    {
      title: "Getting Started",
      icon: Zap,
      color: "blue",
      articles: [
        { title: "Quick Start Guide", href: "/docs/quick-start-guide" },
        { title: "Creating Your First Tournament", href: "/docs/first-tournament" },
        { title: "Setting Up Question Banks", href: "/docs/question-banks" },
        { title: "User Management Basics", href: "/docs/user-management" }
      ]
    },
    {
      title: "Platform Features",
      icon: Settings,
      color: "indigo",
      articles: [
        { title: "Tournament Management", href: "/docs/tournaments" },
        { title: "AI Question Generator", href: "/docs/ai-generator" },
        { title: "Multi-Tenant Architecture", href: "/docs/multi-tenant" },
        { title: "Role-Based Access Control", href: "/docs/rbac" }
      ]
    },
    {
      title: "API Documentation",
      icon: Code,
      color: "purple",
      articles: [
        { title: "Authentication", href: "/docs/api/auth" },
        { title: "REST API Reference", href: "/docs/api/rest" },
        { title: "Webhooks", href: "/docs/api/webhooks" },
        { title: "Rate Limits", href: "/docs/api/rate-limits" }
      ]
    },
    {
      title: "Guides & Tutorials",
      icon: Book,
      color: "green",
      articles: [
        { title: "Customizing Your Theme", href: "/docs/theming" },
        { title: "Importing Questions", href: "/docs/importing" },
        { title: "Managing Subscriptions", href: "/docs/subscriptions" },
        { title: "Reporting & Analytics", href: "/docs/analytics" }
      ]
    }
  ];

  const popularArticles = [
    { title: "How to Create Your First Tournament", category: "Getting Started" },
    { title: "Understanding Role Permissions", category: "Platform Features" },
    { title: "API Authentication Guide", category: "API Documentation" },
    { title: "Customizing Email Templates", category: "Guides & Tutorials" }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Documentation</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Everything you need to know to get the most out of Smart eQuiz Platform
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-lg text-gray-900 text-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-12 bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularArticles.map((article, index) => (
              <Link
                key={index}
                href="#"
                className="bg-white p-4 rounded-lg border hover:shadow-md transition-shadow"
              >
                <p className="text-xs text-blue-600 font-semibold mb-2">{article.category}</p>
                <h3 className="font-medium text-gray-900 hover:text-blue-600">
                  {article.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {sections.map((section) => {
              const IconComponent = section.icon;
              const colorClasses = {
                blue: "bg-blue-100 text-blue-600",
                indigo: "bg-indigo-100 text-indigo-600",
                purple: "bg-purple-100 text-purple-600",
                green: "bg-green-100 text-green-600"
              };
              
              return (
                <div key={section.title} className="bg-white rounded-lg border p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-3 rounded-lg ${colorClasses[section.color as keyof typeof colorClasses]}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                  </div>
                  <ul className="space-y-3">
                    {section.articles.map((article) => (
                      <li key={article.title}>
                        <Link
                          href={article.href}
                          className="flex items-center justify-between text-gray-700 hover:text-blue-600 group"
                        >
                          <span>{article.title}</span>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Help Section */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <HelpCircle className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Need More Help?</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Can't find what you're looking for? Our support team is here to help you get the most out of Smart eQuiz Platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
            >
              Contact Support
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg border-2 border-blue-600 hover:bg-blue-50"
            >
              Visit Our Blog
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
