'use client';

import { useState } from 'react';
import * as Icons from 'lucide-react';

interface Feature {
  id: string;
  title: string;
  description: string;
  icon?: string;
  category?: string;
  order: number;
  isActive: boolean;
}

interface FeaturesContentProps {
  features: Feature[];
}

export default function FeaturesContent({ features }: FeaturesContentProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get unique categories
  const categories = ['all', ...Array.from(new Set(features.map(f => f.category).filter(Boolean)))] as string[];

  // Filter features by category
  const filteredFeatures = selectedCategory === 'all' 
    ? features 
    : features.filter(f => f.category === selectedCategory);

  // Group features by category for display
  const groupedFeatures = filteredFeatures.reduce((acc, feature) => {
    const category = feature.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(feature);
    return acc;
  }, {} as Record<string, Feature[]>);

  // Get icon component
  const getIcon = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="w-8 h-8 text-blue-600" /> : null;
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Powerful Features for Bible Quiz Programs</h1>
          <p className="text-xl max-w-3xl mx-auto text-blue-100">
            Everything you need to run successful tournaments, manage participants, and track progress
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 border-b bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {category === 'all' ? 'All Features' : category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid by Category */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-6xl">
          {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
            <div key={category} className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">{category}</h2>
                <div className="w-20 h-1 bg-blue-600 mx-auto"></div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-8">
                {categoryFeatures
                  .sort((a, b) => a.order - b.order)
                  .map((feature) => (
                    <div key={feature.id} className="p-6 border border-gray-200 rounded-lg hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-4 mb-3">
                        {getIcon(feature.icon)}
                        <h3 className="text-xl font-semibold">{feature.title}</h3>
                      </div>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  ))}
              </div>
            </div>
          ))}

          {filteredFeatures.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No features found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Start your free 14-day trial today. No credit card required.
          </p>
          <a 
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            Start Free Trial
          </a>
        </div>
      </section>
    </div>
  );
}
