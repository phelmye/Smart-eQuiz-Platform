-- CreateEnum
CREATE TYPE "MarketingContentType" AS ENUM ('BLOG_POST', 'FEATURE', 'TESTIMONIAL', 'PRICING_PLAN', 'FAQ', 'HERO');

-- CreateEnum
CREATE TYPE "BlogPostStatus" AS ENUM ('DRAFT', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "PricingInterval" AS ENUM ('MONTH', 'YEAR');

-- CreateTable
CREATE TABLE "marketing_blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "featuredImage" TEXT,
    "category" TEXT NOT NULL,
    "tags" TEXT[],
    "status" "BlogPostStatus" NOT NULL DEFAULT 'DRAFT',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_features" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_features_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_testimonials" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "organization" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "avatar" TEXT,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_testimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_pricing_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "interval" "PricingInterval" NOT NULL DEFAULT 'MONTH',
    "features" TEXT[],
    "highlighted" BOOLEAN NOT NULL DEFAULT false,
    "ctaText" TEXT NOT NULL DEFAULT 'Get Started',
    "ctaLink" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_pricing_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_faqs" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_faqs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketing_hero" (
    "id" TEXT NOT NULL,
    "headline" TEXT NOT NULL,
    "subheadline" TEXT NOT NULL,
    "ctaPrimary" TEXT NOT NULL,
    "ctaSecondary" TEXT,
    "ctaPrimaryLink" TEXT NOT NULL,
    "ctaSecondaryLink" TEXT,
    "backgroundImage" TEXT,
    "videoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketing_hero_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "marketing_blog_posts_slug_key" ON "marketing_blog_posts"("slug");

-- CreateIndex
CREATE INDEX "marketing_blog_posts_status_publishedAt_idx" ON "marketing_blog_posts"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "marketing_blog_posts_category_idx" ON "marketing_blog_posts"("category");

-- CreateIndex
CREATE INDEX "marketing_blog_posts_slug_idx" ON "marketing_blog_posts"("slug");

-- CreateIndex
CREATE INDEX "marketing_features_category_order_idx" ON "marketing_features"("category", "order");

-- CreateIndex
CREATE INDEX "marketing_features_isActive_idx" ON "marketing_features"("isActive");

-- CreateIndex
CREATE INDEX "marketing_testimonials_featured_isActive_idx" ON "marketing_testimonials"("featured", "isActive");

-- CreateIndex
CREATE INDEX "marketing_testimonials_rating_idx" ON "marketing_testimonials"("rating");

-- CreateIndex
CREATE INDEX "marketing_pricing_plans_order_isActive_idx" ON "marketing_pricing_plans"("order", "isActive");

-- CreateIndex
CREATE INDEX "marketing_pricing_plans_highlighted_idx" ON "marketing_pricing_plans"("highlighted");

-- CreateIndex
CREATE INDEX "marketing_faqs_category_order_idx" ON "marketing_faqs"("category", "order");

-- CreateIndex
CREATE INDEX "marketing_faqs_isActive_idx" ON "marketing_faqs"("isActive");

-- CreateIndex
CREATE INDEX "marketing_hero_isActive_version_idx" ON "marketing_hero"("isActive", "version");
