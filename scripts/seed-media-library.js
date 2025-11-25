#!/usr/bin/env node

/**
 * Seed Media Library with Generated Assets
 * Imports generated marketing assets into the MediaAsset database
 * 
 * Run from project root: node scripts/seed-media-library.js
 * Or from services/api: node ../../scripts/seed-media-library.js
 */

const fs = require('fs');
const path = require('path');

// Resolve paths relative to where script is run from
const rootDir = process.cwd().includes('services/api') 
  ? path.join(process.cwd(), '..', '..')
  : process.cwd();

const apiDir = path.join(rootDir, 'services', 'api');

// Import Prisma from the API directory
const { PrismaClient } = require(path.join(apiDir, 'node_modules', '@prisma/client'));

const prisma = new PrismaClient();

// Asset metadata
const ASSET_METADATA = {
  'hero-bg-church.svg': {
    category: 'hero-background',
    altText: 'Church community background for hero section',
    tags: ['hero', 'church', 'community', 'background']
  },
  'hero-bg-bible-study.svg': {
    category: 'hero-background',
    altText: 'Bible study background for hero section',
    tags: ['hero', 'bible', 'study', 'background']
  },
  'hero-bg-youth-group.svg': {
    category: 'hero-background',
    altText: 'Youth engagement background for hero section',
    tags: ['hero', 'youth', 'engagement', 'background']
  },
  'pastor-john.svg': {
    category: 'testimonial-avatar',
    altText: 'Pastor John Smith avatar',
    tags: ['testimonial', 'pastor', 'avatar']
  },
  'pastor-sarah.svg': {
    category: 'testimonial-avatar',
    altText: 'Pastor Sarah Martinez avatar',
    tags: ['testimonial', 'pastor', 'avatar']
  },
  'youth-leader-mike.svg': {
    category: 'testimonial-avatar',
    altText: 'Youth Leader Mike Thompson avatar',
    tags: ['testimonial', 'youth-leader', 'avatar']
  },
  'teacher-amy.svg': {
    category: 'testimonial-avatar',
    altText: 'Teacher Amy Lee avatar',
    tags: ['testimonial', 'teacher', 'avatar']
  },
  'coordinator-david.svg': {
    category: 'testimonial-avatar',
    altText: 'Coordinator David Rodriguez avatar',
    tags: ['testimonial', 'coordinator', 'avatar']
  },
  'minister-lisa.svg': {
    category: 'testimonial-avatar',
    altText: 'Minister Lisa Wang avatar',
    tags: ['testimonial', 'minister', 'avatar']
  },
  'ai-generation.svg': {
    category: 'feature-icon',
    altText: 'AI question generation icon',
    tags: ['feature', 'ai', 'generation', 'icon']
  },
  'live-tournaments.svg': {
    category: 'feature-icon',
    altText: 'Live tournaments icon',
    tags: ['feature', 'tournament', 'live', 'icon']
  },
  'team-collaboration.svg': {
    category: 'feature-icon',
    altText: 'Team collaboration icon',
    tags: ['feature', 'team', 'collaboration', 'icon']
  },
  'analytics-tracking.svg': {
    category: 'feature-icon',
    altText: 'Analytics and tracking icon',
    tags: ['feature', 'analytics', 'tracking', 'icon']
  },
  'mobile-friendly.svg': {
    category: 'feature-icon',
    altText: 'Mobile friendly icon',
    tags: ['feature', 'mobile', 'responsive', 'icon']
  },
  'customization.svg': {
    category: 'feature-icon',
    altText: 'Full customization icon',
    tags: ['feature', 'customization', 'icon']
  },
  'free-tier.svg': {
    category: 'pricing-icon',
    altText: 'Free tier pricing icon',
    tags: ['pricing', 'free', 'icon']
  },
  'pro-tier.svg': {
    category: 'pricing-icon',
    altText: 'Pro tier pricing icon',
    tags: ['pricing', 'pro', 'icon']
  },
  'enterprise-tier.svg': {
    category: 'pricing-icon',
    altText: 'Enterprise tier pricing icon',
    tags: ['pricing', 'enterprise', 'icon']
  },
  'getting-started.svg': {
    category: 'blog-image',
    altText: 'Getting started guide blog image',
    tags: ['blog', 'guide', 'getting-started']
  },
  'best-practices.svg': {
    category: 'blog-image',
    altText: 'Best practices blog image',
    tags: ['blog', 'best-practices', 'tips']
  },
  'success-stories.svg': {
    category: 'blog-image',
    altText: 'Success stories blog image',
    tags: ['blog', 'success', 'stories']
  },
  'grace-church.svg': {
    category: 'case-study-image',
    altText: 'Grace Community Church case study',
    tags: ['case-study', 'church', 'success']
  },
  'hope-ministry.svg': {
    category: 'case-study-image',
    altText: 'Hope Ministry case study',
    tags: ['case-study', 'ministry', 'success']
  }
};

async function seedMediaAssets() {
  console.log('\n📦 Seeding media library with generated assets...\n');

  const uploadsDir = path.join(rootDir, 'services', 'api', 'uploads', 'media');
  
  if (!fs.existsSync(uploadsDir)) {
    console.log(`❌ Uploads directory not found: ${uploadsDir}`);
    console.log('   Run "node scripts/generate-marketing-assets.js" first!');
    return;
  }

  const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.svg'));

  let seeded = 0;
  let skipped = 0;

  for (const filename of files) {
    const metadata = ASSET_METADATA[filename];
    if (!metadata) {
      console.log(`⚠️  No metadata for ${filename}, skipping...`);
      skipped++;
      continue;
    }

    const filePath = path.join(uploadsDir, filename);
    const stats = fs.statSync(filePath);

    // Check if asset already exists
    const existing = await prisma.mediaAsset.findFirst({
      where: { filename }
    });

    if (existing) {
      console.log(`⏭️  ${filename} already exists, skipping...`);
      skipped++;
      continue;
    }

    // Create media asset record
    try {
      await prisma.mediaAsset.create({
        data: {
          filename,
          originalName: filename,
          mimeType: 'image/svg+xml',
          size: stats.size,
          width: null, // SVG dimensions can be dynamic
          height: null,
          url: `/uploads/media/${filename}`,
          thumbnailUrl: `/uploads/media/${filename}`, // SVGs don't need separate thumbnails
          storageKey: filename,
          category: metadata.category,
          altText: metadata.altText,
          uploadedBy: 'system',
          uploadedByEmail: 'system@smartequiz.com',
          tenantId: null,
          usageCount: 0,
          tags: metadata.tags
        }
      });

      console.log(`✓ Seeded: ${filename} (${metadata.category})`);
      seeded++;
    } catch (error) {
      console.error(`❌ Error seeding ${filename}:`, error.message);
    }
  }

  console.log(`\n✨ Seeding complete!`);
  console.log(`   Seeded: ${seeded} assets`);
  console.log(`   Skipped: ${skipped} assets`);
  console.log(`   Total: ${seeded + skipped} assets processed\n`);
}

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   Smart eQuiz Platform - Media Library Seeder');
  console.log('═══════════════════════════════════════════════════════');

  try {
    await seedMediaAssets();
    
    // Get stats
    const stats = await prisma.mediaAsset.groupBy({
      by: ['category'],
      _count: true
    });

    console.log('📊 Media Library Stats:');
    stats.forEach(stat => {
      console.log(`   ${stat.category}: ${stat._count} assets`);
    });

    const total = await prisma.mediaAsset.count();
    console.log(`   TOTAL: ${total} assets\n`);

    console.log('✅ Media library seeded successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Visit http://localhost:5173/media to view assets');
    console.log('   2. Use assets in Marketing CMS for hero, testimonials, features');
    console.log('   3. Upload additional custom images as needed');
    console.log('\n═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ Error seeding media library:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { seedMediaAssets };
