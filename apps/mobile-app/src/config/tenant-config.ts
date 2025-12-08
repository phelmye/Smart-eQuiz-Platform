export interface TenantConfig {
  // App Identity
  id: string;
  name: string;
  displayName: string;
  slug: string;
  
  // App Store Info
  bundleIdentifier: {
    ios: string;
    android: string;
  };
  appStoreName: string;
  publisher: string;
  
  // Branding
  branding: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    logoUrl: string;
    iconPath: string;
    splashPath: string;
    backgroundColor: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
      text: string;
      border: string;
    };
  };
  
  // API Configuration
  api: {
    baseUrl: string;
    tenantId: string;
  };
  
  // Features
  features: {
    offlineMode: boolean;
    pushNotifications: boolean;
    socialSharing: boolean;
    darkMode: boolean;
  };
  
  // Contact & Support
  support: {
    email: string;
    phone?: string;
    website: string;
  };
}

// Default configuration (used as template)
export const defaultConfig: TenantConfig = {
  id: 'demo',
  name: 'Smart eQuiz',
  displayName: 'Smart eQuiz Platform',
  slug: 'smart-equiz',
  
  bundleIdentifier: {
    ios: 'com.smartequiz.app',
    android: 'com.smartequiz.app',
  },
  appStoreName: 'Smart eQuiz',
  publisher: 'Smart eQuiz Platform',
  
  branding: {
    primaryColor: '#1E40AF',
    secondaryColor: '#3B82F6',
    accentColor: '#10B981',
    logoUrl: '/assets/logo.png',
    iconPath: './assets/icon.png',
    splashPath: './assets/splash.png',
    backgroundColor: '#ffffff',
    colors: {
      primary: '#1E40AF',
      secondary: '#3B82F6',
      accent: '#10B981',
      background: '#ffffff',
      text: '#1F2937',
      border: '#E5E7EB',
    },
  },
  
  api: {
    baseUrl: 'http://10.159.47.66:3001/api', // Will be replaced by .env
    tenantId: 'demo',
  },
  
  features: {
    offlineMode: true,
    pushNotifications: true,
    socialSharing: true,
    darkMode: false,
  },
  
  support: {
    email: 'support@smartequiz.com',
    website: 'https://smartequiz.com',
  },
};

// Load tenant-specific configuration
export function loadTenantConfig(tenantId: string): TenantConfig {
  // For now, always use default config
  // Tenant-specific configs can be added later via build-time configuration
  console.log(`Loading config for tenant: ${tenantId}`);
  return defaultConfig;
}

// Get active tenant config (set via environment or build script)
const API_URL = 'http://10.159.47.66:3001/api';
const TENANT_ID = 'demo';

// Create tenant configuration with overridden API settings
const baseConfig = loadTenantConfig(TENANT_ID);

export const tenantConfig: TenantConfig = {
  ...baseConfig,
  api: {
    baseUrl: API_URL,
    tenantId: TENANT_ID,
  },
};

// Log configuration for debugging
console.log('Tenant Config Loaded:', {
  tenantId: tenantConfig.id,
  apiBaseUrl: tenantConfig.api.baseUrl,
});
