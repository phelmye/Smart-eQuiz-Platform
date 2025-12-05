import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import {
  MarketingContentType,
  BlogPostStatus,
  PricingInterval,
} from '@prisma/client';

@Injectable()
export class MarketingCmsService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // BLOG POSTS
  // ============================================

  async getAllBlogPosts() {
    return this.prisma.marketingBlogPost.findMany({
      orderBy: { publishedAt: 'desc' },
    });
  }

  async getBlogPostById(id: string) {
    const post = await this.prisma.marketingBlogPost.findUnique({
      where: { id },
    });
    if (!post) {
      throw new NotFoundException(`Blog post with ID ${id} not found`);
    }
    return post;
  }

  async createBlogPost(data: {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    author: string;
    category: string;
    featuredImage?: string;
    tags?: string[];
    status: BlogPostStatus;
  }) {
    return this.prisma.marketingBlogPost.create({
      data: {
        ...data,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
    });
  }

  async updateBlogPost(
    id: string,
    data: {
      title?: string;
      slug?: string;
      excerpt?: string;
      content?: string;
      author?: string;
      category?: string;
      featuredImage?: string;
      tags?: string[];
      status?: BlogPostStatus;
    },
  ) {
    const updateData: any = { ...data };
    
    // If publishing for the first time, set publishedAt
    if (data.status === 'PUBLISHED') {
      const existing = await this.getBlogPostById(id);
      if (!existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }

    return this.prisma.marketingBlogPost.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteBlogPost(id: string) {
    return this.prisma.marketingBlogPost.delete({
      where: { id },
    });
  }

  // ============================================
  // FEATURES
  // ============================================

  async getAllFeatures() {
    return this.prisma.marketingFeature.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async getFeatureById(id: string) {
    const feature = await this.prisma.marketingFeature.findUnique({
      where: { id },
    });
    if (!feature) {
      throw new NotFoundException(`Feature with ID ${id} not found`);
    }
    return feature;
  }

  async createFeature(data: {
    title: string;
    description: string;
    icon: string;
    category: string;
    order?: number;
  }) {
    // Auto-assign order if not provided
    if (!data.order) {
      const maxOrder = await this.prisma.marketingFeature.findFirst({
        orderBy: { order: 'desc' },
      });
      data.order = (maxOrder?.order || 0) + 1;
    }

    return this.prisma.marketingFeature.create({
      data,
    });
  }

  async updateFeature(
    id: string,
    data: {
      title?: string;
      description?: string;
      icon?: string;
      category?: string;
      order?: number;
    },
  ) {
    return this.prisma.marketingFeature.update({
      where: { id },
      data,
    });
  }

  async deleteFeature(id: string) {
    return this.prisma.marketingFeature.delete({
      where: { id },
    });
  }

  // ============================================
  // TESTIMONIALS
  // ============================================

  async getAllTestimonials() {
    return this.prisma.marketingTestimonial.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTestimonialById(id: string) {
    const testimonial = await this.prisma.marketingTestimonial.findUnique({
      where: { id },
    });
    if (!testimonial) {
      throw new NotFoundException(`Testimonial with ID ${id} not found`);
    }
    return testimonial;
  }

  async createTestimonial(data: {
    name: string;
    role: string;
    organization: string;
    quote: string;
    rating: number;
    avatar?: string;
    featured?: boolean;
  }) {
    return this.prisma.marketingTestimonial.create({
      data,
    });
  }

  async updateTestimonial(
    id: string,
    data: {
      name?: string;
      role?: string;
      organization?: string;
      quote?: string;
      rating?: number;
      avatar?: string;
      featured?: boolean;
    },
  ) {
    return this.prisma.marketingTestimonial.update({
      where: { id },
      data,
    });
  }

  async deleteTestimonial(id: string) {
    return this.prisma.marketingTestimonial.delete({
      where: { id },
    });
  }

  // ============================================
  // PRICING PLANS
  // ============================================

  async getAllPricingPlans() {
    return this.prisma.marketingPricingPlan.findMany({
      orderBy: { price: 'asc' },
    });
  }

  async getPricingPlanById(id: string) {
    const plan = await this.prisma.marketingPricingPlan.findUnique({
      where: { id },
    });
    if (!plan) {
      throw new NotFoundException(`Pricing plan with ID ${id} not found`);
    }
    return plan;
  }

  async createPricingPlan(data: {
    name: string;
    price: number;
    interval: PricingInterval;
    features: string[];
    ctaText: string;
    ctaLink: string;
    popular?: boolean;
  }) {
    return this.prisma.marketingPricingPlan.create({
      data,
    });
  }

  async updatePricingPlan(
    id: string,
    data: {
      name?: string;
      price?: number;
      interval?: PricingInterval;
      features?: string[];
      ctaText?: string;
      ctaLink?: string;
      popular?: boolean;
    },
  ) {
    return this.prisma.marketingPricingPlan.update({
      where: { id },
      data,
    });
  }

  async deletePricingPlan(id: string) {
    return this.prisma.marketingPricingPlan.delete({
      where: { id },
    });
  }

  // ============================================
  // FAQS
  // ============================================

  async getAllFaqs() {
    return this.prisma.marketingFAQ.findMany({
      orderBy: { order: 'asc' },
    });
  }

  async getFaqById(id: string) {
    const faq = await this.prisma.marketingFAQ.findUnique({
      where: { id },
    });
    if (!faq) {
      throw new NotFoundException(`FAQ with ID ${id} not found`);
    }
    return faq;
  }

  async createFaq(data: {
    question: string;
    answer: string;
    category: string;
    order?: number;
  }) {
    // Auto-assign order if not provided
    if (!data.order) {
      const maxOrder = await this.prisma.marketingFAQ.findFirst({
        orderBy: { order: 'desc' },
      });
      data.order = (maxOrder?.order || 0) + 1;
    }

    return this.prisma.marketingFAQ.create({
      data,
    });
  }

  async updateFaq(
    id: string,
    data: {
      question?: string;
      answer?: string;
      category?: string;
      order?: number;
    },
  ) {
    return this.prisma.marketingFAQ.update({
      where: { id },
      data,
    });
  }

  async deleteFaq(id: string) {
    return this.prisma.marketingFAQ.delete({
      where: { id },
    });
  }

  // ============================================
  // HERO CONTENT
  // ============================================

  async getHeroContent() {
    // Return the first (and should be only) hero content
    const hero = await this.prisma.marketingHero.findFirst();
    return hero;
  }

  async createOrUpdateHeroContent(data: {
    headline: string;
    subheadline: string;
    primaryCtaText: string;
    primaryCtaLink: string;
    secondaryCtaText?: string;
    secondaryCtaLink?: string;
    backgroundImage?: string;
    videoUrl?: string;
  }) {
    const existing = await this.prisma.marketingHero.findFirst();

    if (existing) {
      return this.prisma.marketingHero.update({
        where: { id: existing.id },
        data,
      });
    } else {
      return this.prisma.marketingHero.create({
        data,
      });
    }
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  async getAllContent() {
    const [blogPosts, features, testimonials, pricingPlans, faqs, hero] =
      await Promise.all([
        this.getAllBlogPosts(),
        this.getAllFeatures(),
        this.getAllTestimonials(),
        this.getAllPricingPlans(),
        this.getAllFaqs(),
        this.getHeroContent(),
      ]);

    return {
      blogPosts,
      features,
      testimonials,
      pricingPlans,
      faqs,
      hero,
    };
  }
}
