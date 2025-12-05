'use client';

import { Star } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  organization?: string;
  quote: string;
  rating: number;
  featured: boolean;
  avatar?: string;
}

interface TestimonialsProps {
  testimonials: Testimonial[];
  showFeaturedOnly?: boolean;
  maxDisplay?: number;
}

export default function Testimonials({ testimonials, showFeaturedOnly = false, maxDisplay }: TestimonialsProps) {
  // Filter testimonials
  let displayedTestimonials = showFeaturedOnly 
    ? testimonials.filter(t => t.featured)
    : testimonials;

  // Limit number if specified
  if (maxDisplay) {
    displayedTestimonials = displayedTestimonials.slice(0, maxDisplay);
  }

  // Render star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (displayedTestimonials.length === 0) {
    return null;
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
      {displayedTestimonials.map((testimonial) => (
        <div
          key={testimonial.id}
          className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          {/* Rating */}
          <div className="mb-4">{renderStars(testimonial.rating)}</div>

          {/* Quote */}
          <p className="text-gray-700 mb-6 italic">"{testimonial.quote}"</p>

          {/* Author */}
          <div className="flex items-center gap-4">
            {testimonial.avatar ? (
              <img
                src={testimonial.avatar}
                alt={testimonial.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-semibold text-lg">
                  {testimonial.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <div className="font-semibold text-gray-900">{testimonial.name}</div>
              <div className="text-sm text-gray-600">
                {testimonial.role}
                {testimonial.organization && `, ${testimonial.organization}`}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
