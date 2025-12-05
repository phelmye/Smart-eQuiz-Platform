'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category?: string;
  order: number;
}

interface FAQContentProps {
  faqs: FAQ[];
}

export default function FAQContent({ faqs }: FAQContentProps) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(faqs.map(f => f.category).filter(Boolean)))] as string[];

  // Filter and group FAQs
  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(f => f.category === selectedCategory);

  const groupedFAQs = filteredFAQs.reduce((acc, faq) => {
    const category = faq.category || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(faq);
    return acc;
  }, {} as Record<string, FAQ[]>);

  // Toggle FAQ open/close
  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Frequently Asked Questions</h1>
          <p className="text-xl max-w-3xl mx-auto text-blue-100">
            Find answers to common questions about Smart eQuiz Platform
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category === 'all' ? 'All Questions' : category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs by Category */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {Object.entries(groupedFAQs).map(([category, categoryFAQs]) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold mb-6 text-gray-900">{category}</h2>
              <div className="space-y-4">
                {categoryFAQs
                  .sort((a, b) => a.order - b.order)
                  .map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-white rounded-lg shadow-md overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-semibold text-gray-900 pr-8">
                          {faq.question}
                        </span>
                        {openId === faq.id ? (
                          <ChevronUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                      </button>
                      {openId === faq.id && (
                        <div className="px-6 py-4 bg-gray-50 border-t">
                          <p className="text-gray-700">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}

          {filteredFAQs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No FAQs found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Our support team is here to help
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </a>
        </div>
      </section>
    </div>
  );
}
