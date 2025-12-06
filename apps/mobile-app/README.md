# 📱 Smart eQuiz Mobile App - White-Label Multi-Tenant System

## Overview

This React Native + Expo mobile app provides a **white-label solution** for multi-tenant SaaS. Each tenant gets their own branded mobile app with:

- Custom app name and icon
- Tenant-specific branding (colors, logos)
- Isolated data and authentication
- Separate App Store / Google Play listings
- Push notifications with tenant branding

## Architecture

### Single Codebase, Multiple Apps

```
apps/mobile-app/
├── src/                      # Shared application code
│   ├── screens/             # All screens (Login, Quiz, Results, etc.)
│   ├── components/          # Reusable UI components
│   ├── navigation/          # Navigation structure
│   ├── contexts/            # AuthContext, etc.
│   ├── api/                 # API client
│   ├── hooks/               # Custom React hooks
│   └── config/
│       └── tenant-config.ts # Tenant configuration system
│
├── tenants/                  # Tenant-specific configurations
│   ├── firstbaptist/
│   │   ├── config.json      # App settings, branding
│   │   └── assets/          # Logo, icon, splash screen
│   ├── gracechurch/
│   │   ├── config.json
│   │   └── assets/
│   └── demo-tenant/
│       ├── config.json
│       └── assets/
│
├── scripts/
│   └── build-tenant.js       # Automated build script
│
├── App.tsx                   # Entry point
├── app.json                  # Base Expo configuration
└── eas.json                  # EAS Build configuration
```

## Quick Start

### 1. Install Dependencies

```bash
cd apps/mobile-app
pnpm install
```

### 2. Run Development Server

```bash
# Run with default config
pnpm start

# Run on iOS simulator
pnpm ios

# Run on Android emulator
pnpm android
```

### 3. Test with Expo Go App

1. Install Expo Go on your phone:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. Scan QR code from terminal

## Creating a New Tenant App

### Step 1: Create Tenant Configuration

Create `tenants/{tenant-id}/config.json`:

```json
{
  "id": "firstbaptist",
  "name": "First Baptist Quiz",
  "displayName": "First Baptist Church Bible Quiz",
  "slug": "firstbaptist-quiz",
  
  "bundleIdentifier": {
    "ios": "com.smartequiz.firstbaptist",
    "android": "com.smartequiz.firstbaptist"
  },
  "appStoreName": "First Baptist Quiz",
  "publisher": "First Baptist Church Dallas",
  
  "branding": {
    "primaryColor": "#1E40AF",
    "secondaryColor": "#3B82F6",
    "accentColor": "#10B981",
    "logoUrl": "/tenant-assets/firstbaptist/logo.png",
    "iconPath": "./tenants/firstbaptist/assets/icon.png",
    "splashPath": "./tenants/firstbaptist/assets/splash.png",
    "backgroundColor": "#ffffff"
  },
  
  "api": {
    "baseUrl": "https://api.smartequiz.com",
    "tenantId": "firstbaptist-tenant-uuid"
  },
  
  "features": {
    "offlineMode": true,
    "pushNotifications": true,
    "socialSharing": true,
    "darkMode": false
  },
  
  "support": {
    "email": "support@firstbaptist.org",
    "phone": "+1 (555) 123-4567",
    "website": "https://firstbaptist.org"
  }
}
```

### Step 2: Prepare Assets

Create these images in `tenants/{tenant-id}/assets/`:

- **icon.png** - 1024x1024px (app icon)
- **splash.png** - 1242x2688px (splash screen)
- **adaptive-icon.png** - 1024x1024px (Android adaptive icon)

**Design Guidelines:**
- Icon: Simple, recognizable, works at small sizes
- Splash: Tenant logo centered on branded background
- Colors: Match tenant's brand identity

### Step 3: Build Tenant App

```bash
# Build for iOS
npm run build:tenant -- --tenant=firstbaptist --platform=ios

# Build for Android
npm run build:tenant -- --tenant=firstbaptist --platform=android

# Build both platforms
npm run build:tenant -- --tenant=firstbaptist --platform=all
```

The build script will:
1. Load tenant configuration
2. Update app.json with tenant settings
3. Copy tenant assets
4. Trigger EAS build
5. Submit to EAS servers

### Step 4: Download & Submit

1. Check build status: https://expo.dev
2. Download IPA (iOS) or APK/AAB (Android)
3. Submit to App Store / Google Play

## Deployment Models

### Model 1: Platform-Managed (Recommended for Beta)

**You control everything:**
- Create Apple Developer account ($99/year)
- Create Google Play Developer account ($25 one-time)
- Build all tenant apps under your accounts
- Submit and manage updates
- Tenant pays premium for branded app ($99-149/month)

**Pros:** Quality control, faster deployment, easier updates
**Cons:** You pay all fees, more operational work

### Model 2: Tenant-Managed (Enterprise)

**Tenants control their apps:**
- They create their own developer accounts
- You provide build automation
- They submit their own apps
- They pay their own fees

**Pros:** Tenant ownership, no fees for you
**Cons:** More support needed, less control

## Tenant Onboarding Process

### 1. Tenant Signup
- Tenant registers on platform admin
- Chooses "Premium Mobile App" tier ($99-149/month)

### 2. Branding Setup
- Upload logo (1024x1024)
- Choose brand colors
- Enter app store details (name, description)

### 3. App Generation
- Platform admin triggers build
- Build script generates tenant-specific app
- Submits to EAS for building

### 4. App Store Submission
- **Platform-Managed:** You submit using your accounts
- **Tenant-Managed:** They submit using their accounts

### 5. Delivery
- App approved in 3-7 days (iOS), 1-3 days (Android)
- Tenant gets app store links
- Users can download from stores

## Testing

### Test on Physical Device

```bash
# Start development server
pnpm start

# Scan QR with Expo Go app
# App will load with demo-tenant configuration
```

### Test Tenant-Specific Builds

```bash
# Set tenant in environment
export TENANT_ID=firstbaptist

# Run development build
pnpm start

# App will use firstbaptist branding
```

### Test Production Builds

```bash
# Create preview build
eas build --profile preview --platform ios

# Download and install on device
# Test full production experience
```

## Environment Variables

Create `.env` file:

```env
# API Configuration
API_URL=https://api.smartequiz.com

# EAS Project
EXPO_PUBLIC_EAS_PROJECT_ID=your-project-id

# Sentry (Error Tracking)
SENTRY_DSN=https://your-sentry-dsn

# Firebase (Push Notifications)
FIREBASE_API_KEY=your-firebase-key
```

## Common Tasks

### Update Shared Dependencies

```bash
cd apps/mobile-app
pnpm add expo@latest react-native@latest
```

### Add New Feature

1. Implement in `src/` (shared code)
2. Test with demo tenant
3. Build for production tenants
4. No tenant-specific code changes needed!

### Update All Tenant Apps

```bash
# Update version in app.json
# Rebuild all tenants
for tenant in firstbaptist gracechurch newhope; do
  npm run build:tenant -- --tenant=$tenant --platform=all
done
```

## Troubleshooting

### Build Fails

```bash
# Check EAS build logs
eas build:list

# View specific build
eas build:view [build-id]
```

### Tenant Config Not Found

```bash
# List available tenants
ls tenants/

# Verify config exists
cat tenants/firstbaptist/config.json
```

### Assets Not Copying

- Ensure assets exist in `tenants/{tenant-id}/assets/`
- Check file names: `icon.png`, `splash.png`, `adaptive-icon.png`
- Verify image dimensions

## Cost Calculator

### Per Tenant (Annual):
- Apple Developer: $99/year
- Google Play: $25 one-time
- EAS Build: $29/month = $348/year
- **Total Year 1:** $472
- **Total Year 2+:** $447/year

### Revenue Calculator:
- 10 tenants × $99/month = $11,880/year
- Costs: $4,720 (year 1)
- **Profit:** $7,160/year

**Break-even:** 5 tenants at $99/month

## Next Steps

1. ✅ Set up EAS account: https://expo.dev
2. ✅ Create first tenant configuration
3. ✅ Build demo app and test
4. ✅ Create Apple Developer account
5. ✅ Create Google Play Developer account
6. ✅ Submit first tenant app
7. ✅ Document process for scaling

## Support

- **Documentation:** See this README
- **Issues:** Check GitHub Issues
- **Contact:** support@smartequiz.com
