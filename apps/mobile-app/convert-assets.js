const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Asset configurations
const assets = [
  { input: 'icon.svg', output: 'icon.png', width: 1024, height: 1024 },
  { input: 'splash.svg', output: 'splash.png', width: 1242, height: 2688 },
  { input: 'adaptive-icon.svg', output: 'adaptive-icon.png', width: 1024, height: 1024 },
  { input: 'notification-icon.svg', output: 'notification-icon.png', width: 96, height: 96 },
  { input: 'favicon.svg', output: 'favicon.png', width: 32, height: 32 }
];

const assetsDir = path.join(__dirname, 'assets');

console.log('📱 Converting SVG assets to PNG...\n');

// Check if sharp is installed
try {
  require.resolve('sharp');
} catch (e) {
  console.log('Installing sharp for image conversion...');
  execSync('npm install --save-dev sharp', { stdio: 'inherit' });
}

const sharp = require('sharp');

// Convert each asset
async function convertAssets() {
  let successCount = 0;
  let errorCount = 0;

  for (const asset of assets) {
    const inputPath = path.join(assetsDir, asset.input);
    const outputPath = path.join(assetsDir, asset.output);

    try {
      await sharp(inputPath)
        .resize(asset.width, asset.height, {
          fit: 'contain',
          background: { r: 0, g: 0, b: 0, alpha: 0 } // Transparent background
        })
        .png()
        .toFile(outputPath);

      console.log(`✅ ${asset.input} → ${asset.output} (${asset.width}x${asset.height})`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to convert ${asset.input}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n🎉 Conversion complete!`);
  console.log(`   ✅ Success: ${successCount}`);
  if (errorCount > 0) {
    console.log(`   ❌ Failed: ${errorCount}`);
  }
  console.log('\n📋 Generated assets:');
  console.log('   - icon.png (1024x1024) - App icon');
  console.log('   - splash.png (1242x2688) - Splash screen');
  console.log('   - adaptive-icon.png (1024x1024) - Android adaptive icon');
  console.log('   - notification-icon.png (96x96) - Android notification');
  console.log('   - favicon.png (32x32) - Web favicon');
  console.log('\n✨ Ready for Expo build!');
}

convertAssets().catch(console.error);
