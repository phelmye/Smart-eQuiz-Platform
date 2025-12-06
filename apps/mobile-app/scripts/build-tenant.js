#!/usr/bin/env node

/**
 * Tenant Build Script
 * 
 * This script generates a tenant-specific mobile app build by:
 * 1. Loading tenant configuration from tenants/{tenantId}/config.json
 * 2. Updating app.json with tenant-specific settings
 * 3. Copying tenant-specific assets (icons, splash screens)
 * 4. Setting environment variables
 * 5. Triggering EAS build for iOS/Android
 * 
 * Usage:
 *   npm run build:tenant -- --tenant=firstbaptist --platform=ios
 *   npm run build:tenant -- --tenant=gracechurch --platform=android
 *   npm run build:tenant -- --tenant=demo-tenant --platform=all
 */

const fs = require('fs-extra');
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config();

// Parse command line arguments
const args = process.argv.slice(2);
const tenantArg = args.find(arg => arg.startsWith('--tenant='));
const platformArg = args.find(arg => arg.startsWith('--platform='));

if (!tenantArg) {
  console.error('❌ Error: --tenant parameter is required');
  console.log('\nUsage:');
  console.log('  npm run build:tenant -- --tenant=<tenant-id> --platform=<ios|android|all>');
  console.log('\nExample:');
  console.log('  npm run build:tenant -- --tenant=firstbaptist --platform=ios');
  process.exit(1);
}

const tenantId = tenantArg.split('=')[1];
const platform = platformArg ? platformArg.split('=')[1] : 'all';

console.log(`\n🏗️  Building app for tenant: ${tenantId}`);
console.log(`📱 Platform: ${platform}\n`);

// Paths
const ROOT_DIR = path.resolve(__dirname, '..');
const TENANTS_DIR = path.join(ROOT_DIR, 'tenants');
const TENANT_DIR = path.join(TENANTS_DIR, tenantId);
const TENANT_CONFIG_PATH = path.join(TENANT_DIR, 'config.json');
const APP_JSON_PATH = path.join(ROOT_DIR, 'app.json');
const APP_JSON_BACKUP = path.join(ROOT_DIR, 'app.json.backup');

// Step 1: Validate tenant configuration
console.log('📋 Step 1: Loading tenant configuration...');

if (!fs.existsSync(TENANT_CONFIG_PATH)) {
  console.error(`❌ Error: Tenant configuration not found at ${TENANT_CONFIG_PATH}`);
  console.log('\nAvailable tenants:');
  const tenants = fs.readdirSync(TENANTS_DIR).filter(f => 
    fs.statSync(path.join(TENANTS_DIR, f)).isDirectory()
  );
  tenants.forEach(t => console.log(`  - ${t}`));
  process.exit(1);
}

const tenantConfig = fs.readJSONSync(TENANT_CONFIG_PATH);
console.log(`✅ Loaded config for: ${tenantConfig.displayName}`);

// Step 2: Backup original app.json
console.log('\n💾 Step 2: Backing up app.json...');
if (!fs.existsSync(APP_JSON_BACKUP)) {
  fs.copySync(APP_JSON_PATH, APP_JSON_BACKUP);
  console.log('✅ Backup created');
}

// Step 3: Update app.json with tenant configuration
console.log('\n📝 Step 3: Updating app.json with tenant settings...');

const appJson = fs.readJSONSync(APP_JSON_PATH);

// Update expo configuration
appJson.expo.name = tenantConfig.displayName;
appJson.expo.slug = tenantConfig.slug;
appJson.expo.icon = tenantConfig.branding.iconPath;
appJson.expo.splash.image = tenantConfig.branding.splashPath;
appJson.expo.splash.backgroundColor = tenantConfig.branding.backgroundColor;

// iOS specific
appJson.expo.ios.bundleIdentifier = tenantConfig.bundleIdentifier.ios;

// Android specific
appJson.expo.android.package = tenantConfig.bundleIdentifier.android;
appJson.expo.android.adaptiveIcon.backgroundColor = tenantConfig.branding.backgroundColor;

// Set extra config
appJson.expo.extra = appJson.expo.extra || {};
appJson.expo.extra.tenantId = tenantConfig.id;
appJson.expo.extra.tenantConfig = tenantConfig;

fs.writeJSONSync(APP_JSON_PATH, appJson, { spaces: 2 });
console.log('✅ app.json updated');

// Step 4: Copy tenant assets
console.log('\n🎨 Step 4: Copying tenant assets...');

const TENANT_ASSETS_DIR = path.join(TENANT_DIR, 'assets');
const APP_ASSETS_DIR = path.join(ROOT_DIR, 'assets');

if (fs.existsSync(TENANT_ASSETS_DIR)) {
  // Copy icon
  const iconSource = path.join(TENANT_ASSETS_DIR, 'icon.png');
  const iconDest = path.join(APP_ASSETS_DIR, 'icon.png');
  if (fs.existsSync(iconSource)) {
    fs.copySync(iconSource, iconDest);
    console.log('  ✅ Copied icon.png');
  }

  // Copy splash
  const splashSource = path.join(TENANT_ASSETS_DIR, 'splash.png');
  const splashDest = path.join(APP_ASSETS_DIR, 'splash.png');
  if (fs.existsSync(splashSource)) {
    fs.copySync(splashSource, splashDest);
    console.log('  ✅ Copied splash.png');
  }

  // Copy adaptive icon (Android)
  const adaptiveSource = path.join(TENANT_ASSETS_DIR, 'adaptive-icon.png');
  const adaptiveDest = path.join(APP_ASSETS_DIR, 'adaptive-icon.png');
  if (fs.existsSync(adaptiveSource)) {
    fs.copySync(adaptiveSource, adaptiveDest);
    console.log('  ✅ Copied adaptive-icon.png');
  }

  console.log('✅ Assets copied');
} else {
  console.log('⚠️  No custom assets found, using defaults');
}

// Step 5: Set environment variables
console.log('\n🔧 Step 5: Setting environment variables...');
process.env.TENANT_ID = tenantConfig.id;
process.env.API_URL = tenantConfig.api.baseUrl;
console.log(`  TENANT_ID=${tenantConfig.id}`);
console.log(`  API_URL=${tenantConfig.api.baseUrl}`);

// Step 6: Build app
console.log(`\n🚀 Step 6: Building ${platform} app...\n`);

try {
  if (platform === 'ios' || platform === 'all') {
    console.log('📱 Building iOS app...');
    execSync('eas build --platform ios --profile tenant-production --non-interactive', {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: { ...process.env }
    });
    console.log('✅ iOS build submitted');
  }

  if (platform === 'android' || platform === 'all') {
    console.log('🤖 Building Android app...');
    execSync('eas build --platform android --profile tenant-production --non-interactive', {
      cwd: ROOT_DIR,
      stdio: 'inherit',
      env: { ...process.env }
    });
    console.log('✅ Android build submitted');
  }
} catch (error) {
  console.error('\n❌ Build failed:', error.message);
  
  // Restore original app.json
  console.log('\n🔄 Restoring original app.json...');
  fs.copySync(APP_JSON_BACKUP, APP_JSON_PATH);
  console.log('✅ Restored');
  
  process.exit(1);
}

// Step 7: Cleanup (optional - restore original app.json)
console.log('\n✨ Build complete!');
console.log(`\n📦 App built for: ${tenantConfig.displayName}`);
console.log(`📱 Platform: ${platform}`);
console.log(`🆔 Bundle ID (iOS): ${tenantConfig.bundleIdentifier.ios}`);
console.log(`🆔 Package (Android): ${tenantConfig.bundleIdentifier.android}`);
console.log('\n💡 Next steps:');
console.log('  1. Wait for EAS build to complete (check https://expo.dev)');
console.log('  2. Download the build artifact');
console.log('  3. Submit to App Store / Google Play');
console.log('\n');
