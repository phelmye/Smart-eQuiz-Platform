/**
 * Theme System for Smart eQuiz Platform
 * Provides template-based theming with customizable colors
 */

export interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  secondaryHover: string;
  secondaryLight: string;
  accent: string;
  accentHover: string;
  accentLight: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
}

export interface ThemeTemplate {
  id: string;
  name: string;
  description: string;
  colors: ThemeColors;
  preview?: string;
}

/**
 * Predefined Theme Templates
 */
export const themeTemplates: ThemeTemplate[] = [
  {
    id: 'default',
    name: 'Classic Blue',
    description: 'Professional blue theme with excellent readability',
    colors: {
      primary: '#3b82f6',      // blue-500
      primaryHover: '#2563eb',  // blue-600
      primaryLight: '#dbeafe',  // blue-100
      primaryDark: '#1e40af',   // blue-700
      secondary: '#8b5cf6',     // violet-500
      secondaryHover: '#7c3aed', // violet-600
      secondaryLight: '#ede9fe', // violet-100
      accent: '#10b981',        // green-500
      accentHover: '#059669',   // green-600
      accentLight: '#d1fae5',   // green-100
      success: '#10b981',       // green-500
      warning: '#f59e0b',       // amber-500
      error: '#ef4444',         // red-500
      info: '#3b82f6',          // blue-500
      background: '#f9fafb',    // gray-50
      surface: '#ffffff',
      text: '#111827',          // gray-900
      textSecondary: '#6b7280', // gray-500
      border: '#e5e7eb',        // gray-200
    }
  },
  {
    id: 'emerald',
    name: 'Emerald Green',
    description: 'Fresh and vibrant green theme',
    colors: {
      primary: '#10b981',       // emerald-500
      primaryHover: '#059669',  // emerald-600
      primaryLight: '#d1fae5',  // emerald-100
      primaryDark: '#047857',   // emerald-700
      secondary: '#06b6d4',     // cyan-500
      secondaryHover: '#0891b2', // cyan-600
      secondaryLight: '#cffafe', // cyan-100
      accent: '#f59e0b',        // amber-500
      accentHover: '#d97706',   // amber-600
      accentLight: '#fef3c7',   // amber-100
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#06b6d4',
      background: '#f0fdf4',    // green-50
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#d1fae5',
    }
  },
  {
    id: 'purple',
    name: 'Royal Purple',
    description: 'Elegant purple theme for premium feel',
    colors: {
      primary: '#8b5cf6',       // violet-500
      primaryHover: '#7c3aed',  // violet-600
      primaryLight: '#ede9fe',  // violet-100
      primaryDark: '#6d28d9',   // violet-700
      secondary: '#ec4899',     // pink-500
      secondaryHover: '#db2777', // pink-600
      secondaryLight: '#fce7f3', // pink-100
      accent: '#f59e0b',        // amber-500
      accentHover: '#d97706',   // amber-600
      accentLight: '#fef3c7',   // amber-100
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#8b5cf6',
      background: '#faf5ff',    // purple-50
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e9d5ff',
    }
  },
  {
    id: 'ocean',
    name: 'Ocean Blue',
    description: 'Calming ocean-inspired theme',
    colors: {
      primary: '#0ea5e9',       // sky-500
      primaryHover: '#0284c7',  // sky-600
      primaryLight: '#e0f2fe',  // sky-100
      primaryDark: '#075985',   // sky-700
      secondary: '#06b6d4',     // cyan-500
      secondaryHover: '#0891b2', // cyan-600
      secondaryLight: '#cffafe', // cyan-100
      accent: '#14b8a6',        // teal-500
      accentHover: '#0d9488',   // teal-600
      accentLight: '#ccfbf1',   // teal-100
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#0ea5e9',
      background: '#f0f9ff',    // sky-50
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#bae6fd',
    }
  },
  {
    id: 'sunset',
    name: 'Warm Sunset',
    description: 'Warm and inviting orange-red theme',
    colors: {
      primary: '#f97316',       // orange-500
      primaryHover: '#ea580c',  // orange-600
      primaryLight: '#ffedd5',  // orange-100
      primaryDark: '#c2410c',   // orange-700
      secondary: '#ef4444',     // red-500
      secondaryHover: '#dc2626', // red-600
      secondaryLight: '#fee2e2', // red-100
      accent: '#eab308',        // yellow-500
      accentHover: '#ca8a04',   // yellow-600
      accentLight: '#fef9c3',   // yellow-100
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#f97316',
      background: '#fff7ed',    // orange-50
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#fed7aa',
    }
  },
  {
    id: 'forest',
    name: 'Forest Green',
    description: 'Natural forest-inspired theme',
    colors: {
      primary: '#059669',       // emerald-600
      primaryHover: '#047857',  // emerald-700
      primaryLight: '#d1fae5',  // emerald-100
      primaryDark: '#065f46',   // emerald-800
      secondary: '#84cc16',     // lime-500
      secondaryHover: '#65a30d', // lime-600
      secondaryLight: '#ecfccb', // lime-100
      accent: '#eab308',        // yellow-500
      accentHover: '#ca8a04',   // yellow-600
      accentLight: '#fef9c3',   // yellow-100
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#059669',
      background: '#ecfdf5',    // emerald-50
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#a7f3d0',
    }
  },
  {
    id: 'midnight',
    name: 'Midnight Dark',
    description: 'Dark theme for reduced eye strain',
    colors: {
      primary: '#60a5fa',       // blue-400
      primaryHover: '#3b82f6',  // blue-500
      primaryLight: '#1e3a8a',  // blue-900
      primaryDark: '#1e40af',   // blue-700
      secondary: '#a78bfa',     // violet-400
      secondaryHover: '#8b5cf6', // violet-500
      secondaryLight: '#4c1d95', // violet-900
      accent: '#34d399',        // emerald-400
      accentHover: '#10b981',   // emerald-500
      accentLight: '#064e3b',   // emerald-900
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
      background: '#111827',    // gray-900
      surface: '#1f2937',       // gray-800
      text: '#f9fafb',          // gray-50
      textSecondary: '#9ca3af', // gray-400
      border: '#374151',        // gray-700
    }
  }
];

/**
 * Get theme by ID
 */
export function getThemeById(id: string): ThemeTemplate | undefined {
  return themeTemplates.find(theme => theme.id === id);
}

/**
 * Get default theme
 */
export function getDefaultTheme(): ThemeTemplate {
  return themeTemplates[0];
}

/**
 * Apply theme colors to CSS variables
 */
export function applyTheme(colors: ThemeColors) {
  const root = document.documentElement;
  
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-hover', colors.primaryHover);
  root.style.setProperty('--color-primary-light', colors.primaryLight);
  root.style.setProperty('--color-primary-dark', colors.primaryDark);
  
  root.style.setProperty('--color-secondary', colors.secondary);
  root.style.setProperty('--color-secondary-hover', colors.secondaryHover);
  root.style.setProperty('--color-secondary-light', colors.secondaryLight);
  
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-hover', colors.accentHover);
  root.style.setProperty('--color-accent-light', colors.accentLight);
  
  root.style.setProperty('--color-success', colors.success);
  root.style.setProperty('--color-warning', colors.warning);
  root.style.setProperty('--color-error', colors.error);
  root.style.setProperty('--color-info', colors.info);
  
  root.style.setProperty('--color-background', colors.background);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-text', colors.text);
  root.style.setProperty('--color-text-secondary', colors.textSecondary);
  root.style.setProperty('--color-border', colors.border);
}

/**
 * Load and apply saved theme for current tenant
 * Should be called on app initialization
 */
export function loadSavedTheme(tenantId: string | null) {
  if (!tenantId) {
    // Apply default theme if no tenant
    const defaultTheme = getDefaultTheme();
    applyTheme(defaultTheme.colors);
    return;
  }

  try {
    // Use correct storage key matching platform-admin
    const THEME_CONFIGS_KEY = 'equiz_theme_configs';
    const configsJson = localStorage.getItem(THEME_CONFIGS_KEY);
    const configs = configsJson ? JSON.parse(configsJson) : [];
    const config = configs.find((c: any) => c.tenantId === tenantId);

    if (config) {
      if (config.isCustom && config.customColors) {
        // Apply custom theme from branding settings
        const customTheme = createCustomTheme(
          'Custom Theme',
          config.customColors.primary,
          config.customColors.secondary,
          config.customColors.accent
        );
        applyTheme(customTheme.colors);
        console.log('Applied custom theme for tenant:', tenantId);
      } else if (config.templateId) {
        // Apply predefined template
        const template = getThemeById(config.templateId);
        if (template) {
          applyTheme(template.colors);
          console.log('Applied theme template:', config.templateId);
        } else {
          // Fallback to default if template not found
          const defaultTheme = getDefaultTheme();
          applyTheme(defaultTheme.colors);
        }
      } else {
        // Config exists but invalid, use default
        const defaultTheme = getDefaultTheme();
        applyTheme(defaultTheme.colors);
      }
    } else {
      // No theme config found, apply default theme
      const defaultTheme = getDefaultTheme();
      applyTheme(defaultTheme.colors);
      console.log('No theme config found, using default theme');
    }
  } catch (error) {
    console.error('Error loading theme:', error);
    // Fallback to default theme on any error
    const defaultTheme = getDefaultTheme();
    applyTheme(defaultTheme.colors);
  }
}

/**
 * Convert hex color to RGB values
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Generate lighter/darker shades of a color
 */
export function generateShades(hex: string): {
  light: string;
  dark: string;
  hover: string;
} {
  const rgb = hexToRgb(hex);
  if (!rgb) return { light: hex, dark: hex, hover: hex };
  
  // Light shade (add 40 to each component, max 255)
  const light = `#${[
    Math.min(255, rgb.r + 40).toString(16).padStart(2, '0'),
    Math.min(255, rgb.g + 40).toString(16).padStart(2, '0'),
    Math.min(255, rgb.b + 40).toString(16).padStart(2, '0')
  ].join('')}`;
  
  // Dark shade (subtract 30 from each component, min 0)
  const dark = `#${[
    Math.max(0, rgb.r - 30).toString(16).padStart(2, '0'),
    Math.max(0, rgb.g - 30).toString(16).padStart(2, '0'),
    Math.max(0, rgb.b - 30).toString(16).padStart(2, '0')
  ].join('')}`;
  
  // Hover shade (subtract 15 from each component)
  const hover = `#${[
    Math.max(0, rgb.r - 15).toString(16).padStart(2, '0'),
    Math.max(0, rgb.g - 15).toString(16).padStart(2, '0'),
    Math.max(0, rgb.b - 15).toString(16).padStart(2, '0')
  ].join('')}`;
  
  return { light, dark, hover };
}

/**
 * Create custom theme from base colors
 */
export function createCustomTheme(
  name: string,
  primary: string,
  secondary: string,
  accent: string
): ThemeTemplate {
  const primaryShades = generateShades(primary);
  const secondaryShades = generateShades(secondary);
  const accentShades = generateShades(accent);
  
  return {
    id: `custom-${Date.now()}`,
    name,
    description: 'Custom theme',
    colors: {
      primary,
      primaryHover: primaryShades.hover,
      primaryLight: primaryShades.light,
      primaryDark: primaryShades.dark,
      secondary,
      secondaryHover: secondaryShades.hover,
      secondaryLight: secondaryShades.light,
      accent,
      accentHover: accentShades.hover,
      accentLight: accentShades.light,
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: primary,
      background: '#f9fafb',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#6b7280',
      border: '#e5e7eb',
    }
  };
}
