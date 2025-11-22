#!/usr/bin/env node

/**
 * Marketing Asset Generator
 * Generates placeholder images and videos for the Smart eQuiz Platform marketing site
 * 
 * This script creates SVG-based placeholder images that can be replaced with real assets later.
 * Assets are organized by category matching the media library structure.
 */

const fs = require('fs');
const path = require('path');

// Asset specifications
const ASSETS = {
  'hero-backgrounds': [
    {
      name: 'hero-bg-church.svg',
      width: 1920,
      height: 1080,
      title: 'Church Community',
      gradient: ['#667eea', '#764ba2'],
      icon: '⛪'
    },
    {
      name: 'hero-bg-bible-study.svg',
      width: 1920,
      height: 1080,
      title: 'Bible Study',
      gradient: ['#f093fb', '#f5576c'],
      icon: '📖'
    },
    {
      name: 'hero-bg-youth-group.svg',
      width: 1920,
      height: 1080,
      title: 'Youth Engagement',
      gradient: ['#4facfe', '#00f2fe'],
      icon: '🎯'
    }
  ],
  'testimonial-avatars': [
    { name: 'pastor-john.svg', initials: 'JS', color: '#3b82f6' },
    { name: 'pastor-sarah.svg', initials: 'SM', color: '#8b5cf6' },
    { name: 'youth-leader-mike.svg', initials: 'MT', color: '#10b981' },
    { name: 'teacher-amy.svg', initials: 'AL', color: '#f59e0b' },
    { name: 'coordinator-david.svg', initials: 'DR', color: '#ef4444' },
    { name: 'minister-lisa.svg', initials: 'LW', color: '#ec4899' }
  ],
  'feature-icons': [
    {
      name: 'ai-generation.svg',
      icon: '🤖',
      title: 'AI Question Generation',
      color: '#667eea'
    },
    {
      name: 'live-tournaments.svg',
      icon: '🏆',
      title: 'Live Tournaments',
      color: '#f59e0b'
    },
    {
      name: 'team-collaboration.svg',
      icon: '👥',
      title: 'Team Collaboration',
      color: '#10b981'
    },
    {
      name: 'analytics-tracking.svg',
      icon: '📊',
      title: 'Analytics & Tracking',
      color: '#3b82f6'
    },
    {
      name: 'mobile-friendly.svg',
      icon: '📱',
      title: 'Mobile Friendly',
      color: '#8b5cf6'
    },
    {
      name: 'customization.svg',
      icon: '🎨',
      title: 'Full Customization',
      color: '#ec4899'
    }
  ],
  'pricing-icons': [
    { name: 'free-tier.svg', icon: '🌱', color: '#10b981' },
    { name: 'pro-tier.svg', icon: '⭐', color: '#f59e0b' },
    { name: 'enterprise-tier.svg', icon: '👑', color: '#8b5cf6' }
  ],
  'blog-images': [
    {
      name: 'getting-started.svg',
      width: 1200,
      height: 630,
      title: 'Getting Started Guide',
      gradient: ['#667eea', '#764ba2']
    },
    {
      name: 'best-practices.svg',
      width: 1200,
      height: 630,
      title: 'Best Practices',
      gradient: ['#f093fb', '#f5576c']
    },
    {
      name: 'success-stories.svg',
      width: 1200,
      height: 630,
      title: 'Success Stories',
      gradient: ['#4facfe', '#00f2fe']
    }
  ],
  'case-study-images': [
    {
      name: 'grace-church.svg',
      width: 1200,
      height: 630,
      title: 'Grace Community Church',
      gradient: ['#667eea', '#764ba2']
    },
    {
      name: 'hope-ministry.svg',
      width: 1200,
      height: 630,
      title: 'Hope Ministry',
      gradient: ['#f093fb', '#f5576c']
    }
  ]
};

// Output directories
const BASE_DIR = path.join(__dirname, '..', 'apps', 'marketing-site', 'public', 'images');
const UPLOADS_DIR = path.join(__dirname, '..', 'services', 'api', 'uploads', 'media');

// Create directories
function createDirectories() {
  const dirs = [
    path.join(BASE_DIR, 'hero'),
    path.join(BASE_DIR, 'testimonials'),
    path.join(BASE_DIR, 'features'),
    path.join(BASE_DIR, 'pricing'),
    path.join(BASE_DIR, 'blog'),
    path.join(BASE_DIR, 'case-studies'),
    path.join(UPLOADS_DIR),
    path.join(UPLOADS_DIR, 'thumbnails')
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✓ Created directory: ${dir}`);
    }
  });
}

// Generate hero background SVG
function generateHeroBackground({ name, width, height, title, gradient, icon }) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${gradient[0]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${gradient[1]};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#grad)"/>
  <text x="50%" y="45%" text-anchor="middle" font-size="200" fill="white" opacity="0.3">${icon}</text>
  <text x="50%" y="55%" text-anchor="middle" font-size="48" fill="white" font-family="Arial, sans-serif" font-weight="bold">${title}</text>
  <text x="50%" y="60%" text-anchor="middle" font-size="24" fill="white" opacity="0.8" font-family="Arial, sans-serif">Smart eQuiz Platform</text>
</svg>`;
  
  return svg;
}

// Generate avatar SVG
function generateAvatar({ name, initials, color }) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
  <circle cx="100" cy="100" r="100" fill="${color}"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".35em" font-size="80" fill="white" font-family="Arial, sans-serif" font-weight="bold">${initials}</text>
</svg>`;
  
  return svg;
}

// Generate feature icon SVG
function generateFeatureIcon({ name, icon, title, color }) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="300" height="300" fill="${color}" opacity="0.1" rx="20"/>
  <circle cx="150" cy="120" r="60" fill="${color}"/>
  <text x="50%" y="38%" text-anchor="middle" dy=".35em" font-size="60" fill="white">${icon}</text>
  <text x="50%" y="75%" text-anchor="middle" font-size="18" fill="${color}" font-family="Arial, sans-serif" font-weight="bold">${title}</text>
</svg>`;
  
  return svg;
}

// Generate pricing icon SVG
function generatePricingIcon({ name, icon, color }) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
  <circle cx="60" cy="60" r="60" fill="${color}"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".35em" font-size="50" fill="white">${icon}</text>
</svg>`;
  
  return svg;
}

// Generate blog/case study image SVG
function generateBlogImage({ name, width, height, title, gradient }) {
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad-${name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${gradient[0]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${gradient[1]};stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#grad-${name})"/>
  <rect x="60" y="${height/2 - 100}" width="400" height="200" fill="white" opacity="0.9" rx="10"/>
  <text x="80" y="${height/2 - 50}" font-size="32" fill="#1f2937" font-family="Arial, sans-serif" font-weight="bold">${title}</text>
  <text x="80" y="${height/2}" font-size="18" fill="#6b7280" font-family="Arial, sans-serif">Smart eQuiz Platform</text>
</svg>`;
  
  return svg;
}

// Generate all assets
function generateAllAssets() {
  console.log('\n🎨 Generating marketing assets...\n');

  // Hero backgrounds
  console.log('📸 Generating hero backgrounds...');
  ASSETS['hero-backgrounds'].forEach(spec => {
    const svg = generateHeroBackground(spec);
    const filePath = path.join(BASE_DIR, 'hero', spec.name);
    fs.writeFileSync(filePath, svg);
    console.log(`  ✓ ${spec.name}`);
    
    // Also save to uploads directory
    const uploadPath = path.join(UPLOADS_DIR, spec.name);
    fs.writeFileSync(uploadPath, svg);
  });

  // Testimonial avatars
  console.log('\n👤 Generating testimonial avatars...');
  ASSETS['testimonial-avatars'].forEach(spec => {
    const svg = generateAvatar(spec);
    const filePath = path.join(BASE_DIR, 'testimonials', spec.name);
    fs.writeFileSync(filePath, svg);
    console.log(`  ✓ ${spec.name}`);
    
    const uploadPath = path.join(UPLOADS_DIR, spec.name);
    fs.writeFileSync(uploadPath, svg);
  });

  // Feature icons
  console.log('\n🎯 Generating feature icons...');
  ASSETS['feature-icons'].forEach(spec => {
    const svg = generateFeatureIcon(spec);
    const filePath = path.join(BASE_DIR, 'features', spec.name);
    fs.writeFileSync(filePath, svg);
    console.log(`  ✓ ${spec.name}`);
    
    const uploadPath = path.join(UPLOADS_DIR, spec.name);
    fs.writeFileSync(uploadPath, svg);
  });

  // Pricing icons
  console.log('\n💰 Generating pricing icons...');
  ASSETS['pricing-icons'].forEach(spec => {
    const svg = generatePricingIcon(spec);
    const filePath = path.join(BASE_DIR, 'pricing', spec.name);
    fs.writeFileSync(filePath, svg);
    console.log(`  ✓ ${spec.name}`);
    
    const uploadPath = path.join(UPLOADS_DIR, spec.name);
    fs.writeFileSync(uploadPath, svg);
  });

  // Blog images
  console.log('\n📝 Generating blog images...');
  ASSETS['blog-images'].forEach(spec => {
    const svg = generateBlogImage(spec);
    const filePath = path.join(BASE_DIR, 'blog', spec.name);
    fs.writeFileSync(filePath, svg);
    console.log(`  ✓ ${spec.name}`);
    
    const uploadPath = path.join(UPLOADS_DIR, spec.name);
    fs.writeFileSync(uploadPath, svg);
  });

  // Case study images
  console.log('\n📊 Generating case study images...');
  ASSETS['case-study-images'].forEach(spec => {
    const svg = generateBlogImage(spec);
    const filePath = path.join(BASE_DIR, 'case-studies', spec.name);
    fs.writeFileSync(filePath, svg);
    console.log(`  ✓ ${spec.name}`);
    
    const uploadPath = path.join(UPLOADS_DIR, spec.name);
    fs.writeFileSync(uploadPath, svg);
  });
}

// Generate video placeholder HTML
function generateVideoPlaceholder() {
  console.log('\n🎥 Generating video placeholders...');
  
  const videoHTML = `<!DOCTYPE html>
<html>
<head>
  <title>Smart eQuiz Demo Video</title>
  <style>
    body {
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      font-family: Arial, sans-serif;
    }
    .video-placeholder {
      text-align: center;
      color: white;
      padding: 60px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 20px;
      max-width: 800px;
    }
    .play-icon {
      font-size: 120px;
      margin-bottom: 20px;
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    h1 { font-size: 48px; margin: 20px 0; }
    p { font-size: 24px; opacity: 0.9; }
  </style>
</head>
<body>
  <div class="video-placeholder">
    <div class="play-icon">▶️</div>
    <h1>Smart eQuiz Platform Demo</h1>
    <p>Interactive Bible Quiz Tournaments</p>
    <p style="font-size: 18px; margin-top: 40px;">
      Video placeholder - Replace with actual demo video
    </p>
  </div>
</body>
</html>`;

  const videoPath = path.join(BASE_DIR, 'hero', 'demo-video-placeholder.html');
  fs.writeFileSync(videoPath, videoHTML);
  console.log('  ✓ demo-video-placeholder.html');
}

// Generate asset manifest
function generateManifest() {
  const manifest = {
    generated: new Date().toISOString(),
    version: '1.0.0',
    description: 'Marketing asset manifest for Smart eQuiz Platform',
    assets: {
      'hero-backgrounds': ASSETS['hero-backgrounds'].map(a => ({
        name: a.name,
        path: `/images/hero/${a.name}`,
        uploadPath: `/uploads/media/${a.name}`,
        category: 'hero-background',
        title: a.title,
        dimensions: `${a.width}x${a.height}`
      })),
      'testimonial-avatars': ASSETS['testimonial-avatars'].map(a => ({
        name: a.name,
        path: `/images/testimonials/${a.name}`,
        uploadPath: `/uploads/media/${a.name}`,
        category: 'testimonial-avatar',
        initials: a.initials
      })),
      'feature-icons': ASSETS['feature-icons'].map(a => ({
        name: a.name,
        path: `/images/features/${a.name}`,
        uploadPath: `/uploads/media/${a.name}`,
        category: 'feature-icon',
        title: a.title
      })),
      'pricing-icons': ASSETS['pricing-icons'].map(a => ({
        name: a.name,
        path: `/images/pricing/${a.name}`,
        uploadPath: `/uploads/media/${a.name}`,
        category: 'pricing-icon'
      })),
      'blog-images': ASSETS['blog-images'].map(a => ({
        name: a.name,
        path: `/images/blog/${a.name}`,
        uploadPath: `/uploads/media/${a.name}`,
        category: 'blog-image',
        title: a.title,
        dimensions: `${a.width}x${a.height}`
      })),
      'case-study-images': ASSETS['case-study-images'].map(a => ({
        name: a.name,
        path: `/images/case-studies/${a.name}`,
        uploadPath: `/uploads/media/${a.name}`,
        category: 'case-study-image',
        title: a.title,
        dimensions: `${a.width}x${a.height}`
      }))
    },
    stats: {
      totalAssets: Object.values(ASSETS).reduce((sum, arr) => sum + arr.length, 0),
      heroBackgrounds: ASSETS['hero-backgrounds'].length,
      testimonialAvatars: ASSETS['testimonial-avatars'].length,
      featureIcons: ASSETS['feature-icons'].length,
      pricingIcons: ASSETS['pricing-icons'].length,
      blogImages: ASSETS['blog-images'].length,
      caseStudyImages: ASSETS['case-study-images'].length
    },
    notes: [
      'All assets are SVG-based placeholders',
      'Replace with real images/photos for production',
      'Assets are optimized for web display',
      'Accessible via both /images/ and /uploads/media/ paths'
    ]
  };

  const manifestPath = path.join(__dirname, '..', 'MARKETING_ASSETS_MANIFEST.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`\n📋 Generated asset manifest: MARKETING_ASSETS_MANIFEST.json`);
  console.log(`\n✨ Summary:`);
  console.log(`   Total assets: ${manifest.stats.totalAssets}`);
  console.log(`   Hero backgrounds: ${manifest.stats.heroBackgrounds}`);
  console.log(`   Testimonial avatars: ${manifest.stats.testimonialAvatars}`);
  console.log(`   Feature icons: ${manifest.stats.featureIcons}`);
  console.log(`   Pricing icons: ${manifest.stats.pricingIcons}`);
  console.log(`   Blog images: ${manifest.stats.blogImages}`);
  console.log(`   Case study images: ${manifest.stats.caseStudyImages}`);
}

// Main execution
function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('   Smart eQuiz Platform - Marketing Asset Generator');
  console.log('═══════════════════════════════════════════════════════');
  
  try {
    createDirectories();
    generateAllAssets();
    generateVideoPlaceholder();
    generateManifest();
    
    console.log('\n✅ All marketing assets generated successfully!');
    console.log('\n📁 Assets location:');
    console.log(`   Marketing site: ${BASE_DIR}`);
    console.log(`   Media uploads: ${UPLOADS_DIR}`);
    console.log('\n💡 Next steps:');
    console.log('   1. Review generated assets in the directories above');
    console.log('   2. Upload assets through /media page in platform-admin');
    console.log('   3. Select assets in Marketing CMS for hero, testimonials, features');
    console.log('   4. Replace placeholders with real photos/videos for production');
    console.log('\n═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('\n❌ Error generating assets:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateAllAssets, generateManifest };
