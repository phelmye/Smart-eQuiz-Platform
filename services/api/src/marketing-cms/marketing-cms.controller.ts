import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MarketingCmsService } from './marketing-cms.service';
import { BlogPostStatus, PricingInterval } from '@prisma/client';

@Controller('marketing-cms')
export class MarketingCmsController {
  constructor(private readonly marketingCmsService: MarketingCmsService) {}

  // ============================================
  // BLOG POSTS
  // ============================================

  @Get('blog-posts')
  async getAllBlogPosts() {
    return this.marketingCmsService.getAllBlogPosts();
  }

  @Get('blog-posts/:id')
  async getBlogPostById(@Param('id') id: string) {
    return this.marketingCmsService.getBlogPostById(id);
  }

  @Post('blog-posts')
  async createBlogPost(
    @Body()
    body: {
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      author: string;
      category: string;
      featuredImage?: string;
      tags?: string[];
      status: BlogPostStatus;
    },
  ) {
    return this.marketingCmsService.createBlogPost(body);
  }

  @Put('blog-posts/:id')
  async updateBlogPost(
    @Param('id') id: string,
    @Body()
    body: {
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
    return this.marketingCmsService.updateBlogPost(id, body);
  }

  @Delete('blog-posts/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBlogPost(@Param('id') id: string) {
    await this.marketingCmsService.deleteBlogPost(id);
  }

  // ============================================
  // FEATURES
  // ============================================

  @Get('features')
  async getAllFeatures() {
    return this.marketingCmsService.getAllFeatures();
  }

  @Get('features/:id')
  async getFeatureById(@Param('id') id: string) {
    return this.marketingCmsService.getFeatureById(id);
  }

  @Post('features')
  async createFeature(
    @Body()
    body: {
      title: string;
      description: string;
      icon: string;
      category: string;
      order?: number;
    },
  ) {
    return this.marketingCmsService.createFeature(body);
  }

  @Put('features/:id')
  async updateFeature(
    @Param('id') id: string,
    @Body()
    body: {
      title?: string;
      description?: string;
      icon?: string;
      category?: string;
      order?: number;
    },
  ) {
    return this.marketingCmsService.updateFeature(id, body);
  }

  @Delete('features/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFeature(@Param('id') id: string) {
    await this.marketingCmsService.deleteFeature(id);
  }

  // ============================================
  // TESTIMONIALS
  // ============================================

  @Get('testimonials')
  async getAllTestimonials() {
    return this.marketingCmsService.getAllTestimonials();
  }

  @Get('testimonials/:id')
  async getTestimonialById(@Param('id') id: string) {
    return this.marketingCmsService.getTestimonialById(id);
  }

  @Post('testimonials')
  async createTestimonial(
    @Body()
    body: {
      name: string;
      role: string;
      organization: string;
      quote: string;
      rating: number;
      avatar?: string;
      featured?: boolean;
    },
  ) {
    return this.marketingCmsService.createTestimonial(body);
  }

  @Put('testimonials/:id')
  async updateTestimonial(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      role?: string;
      organization?: string;
      quote?: string;
      rating?: number;
      avatar?: string;
      featured?: boolean;
    },
  ) {
    return this.marketingCmsService.updateTestimonial(id, body);
  }

  @Delete('testimonials/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTestimonial(@Param('id') id: string) {
    await this.marketingCmsService.deleteTestimonial(id);
  }

  // ============================================
  // PRICING PLANS
  // ============================================

  @Get('pricing-plans')
  async getAllPricingPlans() {
    return this.marketingCmsService.getAllPricingPlans();
  }

  @Get('pricing-plans/:id')
  async getPricingPlanById(@Param('id') id: string) {
    return this.marketingCmsService.getPricingPlanById(id);
  }

  @Post('pricing-plans')
  async createPricingPlan(
    @Body()
    body: {
      name: string;
      price: number;
      interval: PricingInterval;
      features: string[];
      ctaText: string;
      ctaLink: string;
      popular?: boolean;
    },
  ) {
    return this.marketingCmsService.createPricingPlan(body);
  }

  @Put('pricing-plans/:id')
  async updatePricingPlan(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      price?: number;
      interval?: PricingInterval;
      features?: string[];
      ctaText?: string;
      ctaLink?: string;
      popular?: boolean;
    },
  ) {
    return this.marketingCmsService.updatePricingPlan(id, body);
  }

  @Delete('pricing-plans/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePricingPlan(@Param('id') id: string) {
    await this.marketingCmsService.deletePricingPlan(id);
  }

  // ============================================
  // FAQS
  // ============================================

  @Get('faqs')
  async getAllFaqs() {
    return this.marketingCmsService.getAllFaqs();
  }

  @Get('faqs/:id')
  async getFaqById(@Param('id') id: string) {
    return this.marketingCmsService.getFaqById(id);
  }

  @Post('faqs')
  async createFaq(
    @Body()
    body: {
      question: string;
      answer: string;
      category: string;
      order?: number;
    },
  ) {
    return this.marketingCmsService.createFaq(body);
  }

  @Put('faqs/:id')
  async updateFaq(
    @Param('id') id: string,
    @Body()
    body: {
      question?: string;
      answer?: string;
      category?: string;
      order?: number;
    },
  ) {
    return this.marketingCmsService.updateFaq(id, body);
  }

  @Delete('faqs/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteFaq(@Param('id') id: string) {
    await this.marketingCmsService.deleteFaq(id);
  }

  // ============================================
  // HERO CONTENT
  // ============================================

  @Get('hero')
  async getHeroContent() {
    return this.marketingCmsService.getHeroContent();
  }

  @Post('hero')
  async createOrUpdateHeroContent(
    @Body()
    body: {
      headline: string;
      subheadline: string;
      primaryCtaText: string;
      primaryCtaLink: string;
      secondaryCtaText?: string;
      secondaryCtaLink?: string;
      backgroundImage?: string;
      videoUrl?: string;
    },
  ) {
    return this.marketingCmsService.createOrUpdateHeroContent(body);
  }

  // ============================================
  // BULK OPERATIONS
  // ============================================

  @Get('all')
  async getAllContent() {
    return this.marketingCmsService.getAllContent();
  }
}
