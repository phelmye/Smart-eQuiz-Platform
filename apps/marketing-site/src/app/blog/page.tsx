import Link from 'next/link';
import { Calendar, User, ArrowRight } from 'lucide-react';
import { BlogContent } from './BlogContent';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Fetch blog posts from Marketing CMS API
async function getBlogPosts() {
  try {
    const res = await fetch(`${API_URL}/marketing-cms/blog-posts`, {
      next: { revalidate: 60 }, // ISR: Revalidate every 60 seconds
    });
    
    if (!res.ok) {
      console.error('Failed to fetch blog posts:', res.statusText);
      return [];
    }
    
    const posts = await res.json();
    // Filter only published posts
    return posts.filter((post: any) => post.status === 'PUBLISHED');
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

export default async function BlogPage() {
  const apiPosts = await getBlogPosts();
  
  // Fallback to sample data if API returns no posts (for demo)
  const posts = apiPosts.length > 0 ? apiPosts : [
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

  // Extract unique categories from posts
  const allCategories = Array.from(new Set(posts.map((post: any) => post.category))) as string[];
  const categories = ["All", ...allCategories];

  return <BlogContent posts={posts} categories={categories} />;
}
