# Tenant Theme System Integration Guide

## Overview

The Smart eQuiz Platform now features a comprehensive theme system that allows tenant administrators to customize the look and feel of their tenant application from the platform-admin branding settings. Theme changes are automatically synchronized and applied to the tenant app in real-time.

## System Architecture

### Components

1. **Platform-Admin (workspace/shadcn-ui)**
   - `BrandingSettings.tsx` - Theme configuration UI
   - Theme template selection
   - Custom color configuration
   - Real-time preview

2. **Tenant-App (apps/tenant-app)**
   - `theme.ts` - Theme definitions and application logic
   - `ThemeContext.tsx` - React context for theme management
   - `TenantContext.tsx` - Tenant-specific theme loading
   - Automatic theme application on tenant load

### Data Flow

```
Platform Admin (Branding Settings)
  ↓
Save theme config to localStorage (equiz_theme_configs)
  ↓
Dispatch 'themeChanged' event
  ↓
Tenant App listens for event
  ↓
Reload theme from localStorage
  ↓
Apply CSS variables to document root
```

## Available Theme Templates

### 1. Classic Blue (default)
- **Primary:** Blue (#3b82f6)
- **Secondary:** Violet (#8b5cf6)
- **Accent:** Green (#10b981)
- **Use Case:** Professional, trustworthy, widely appealing

### 2. Emerald Green
- **Primary:** Emerald (#10b981)
- **Secondary:** Cyan (#06b6d4)
- **Accent:** Amber (#f59e0b)
- **Use Case:** Fresh, vibrant, nature-inspired

### 3. Royal Purple
- **Primary:** Violet (#8b5cf6)
- **Secondary:** Pink (#ec4899)
- **Accent:** Amber (#f59e0b)
- **Use Case:** Elegant, premium, creative

### 4. Ocean Blue
- **Primary:** Sky Blue (#0ea5e9)
- **Secondary:** Cyan (#06b6d4)
- **Accent:** Teal (#14b8a6)
- **Use Case:** Calming, peaceful, professional

### 5. Warm Sunset
- **Primary:** Orange (#f97316)
- **Secondary:** Red (#ef4444)
- **Accent:** Yellow (#eab308)
- **Use Case:** Energetic, warm, inviting

### 6. Forest Green
- **Primary:** Emerald Dark (#059669)
- **Secondary:** Lime (#84cc16)
- **Accent:** Yellow (#eab308)
- **Use Case:** Natural, earthy, organic

### 7. Midnight Dark
- **Primary:** Blue Light (#60a5fa)
- **Secondary:** Violet Light (#a78bfa)
- **Accent:** Emerald Light (#34d399)
- **Use Case:** Dark mode, reduced eye strain, modern

### 8. Custom Colors
- **Custom:** User-defined primary, secondary, and accent colors
- **Use Case:** Brand-specific color requirements

## How to Configure Themes

### For Tenant Administrators

1. **Access Branding Settings**
   - Login to platform-admin as org_admin or super_admin
   - Navigate to Settings > Branding Settings
   - Click on the "Theme" tab

2. **Select a Theme Template**
   - Browse through 8 pre-designed theme templates
   - Each template shows:
     - Name and description
     - Color preview (primary, secondary, accent)
     - Active badge if currently selected
   - Click on any template to select it

3. **Use Custom Colors**
   - Select "Custom Colors" template
   - Navigate to "Colors & Fonts" tab
   - Use color pickers to choose:
     - Primary Color
     - Secondary Color
     - Accent Color
   - Colors will be automatically applied to tenant app

4. **Save and Preview**
   - Click "Save Changes" to persist theme
   - Click "Preview Theme in Tenant App" for quick preview
   - Theme changes are applied immediately

### For Developers

#### Theme Configuration Storage

Theme configurations are stored in localStorage with key `equiz_theme_configs`:

```typescript
interface ThemeConfig {
  tenantId: string;
  templateId: string; // 'default', 'emerald', 'purple', etc.
  isCustom: boolean; // true if 'custom' template selected
  customColors: {
    primary: string;
    secondary: string;
    accent: string;
  } | null;
  updatedAt: string;
}
```

#### Loading Themes Programmatically

```typescript
import { loadSavedTheme, applyTheme, getThemeById } from '@/lib/theme';

// Load theme for specific tenant
loadSavedTheme('tenant-id-123');

// Apply a specific theme template
const oceanTheme = getThemeById('ocean');
if (oceanTheme) {
  applyTheme(oceanTheme.colors);
}

// Create and apply custom theme
import { createCustomTheme } from '@/lib/theme';

const customTheme = createCustomTheme(
  'My Custom Theme',
  '#1e40af', // primary
  '#7c3aed', // secondary
  '#059669'  // accent
);
applyTheme(customTheme.colors);
```

#### CSS Variable Reference

When a theme is applied, the following CSS variables are set on `:root`:

```css
--color-primary: #3b82f6
--color-primary-hover: #2563eb
--color-primary-light: #dbeafe
--color-primary-dark: #1e40af

--color-secondary: #8b5cf6
--color-secondary-hover: #7c3aed
--color-secondary-light: #ede9fe

--color-accent: #10b981
--color-accent-hover: #059669
--color-accent-light: #d1fae5

--color-success: #10b981
--color-warning: #f59e0b
--color-error: #ef4444
--color-info: #3b82f6

--color-background: #f9fafb
--color-surface: #ffffff
--color-text: #111827
--color-text-secondary: #6b7280
--color-border: #e5e7eb
```

#### Using Theme Colors in Components

```tsx
// In CSS/Tailwind
<div className="bg-[var(--color-primary)] text-white">
  Primary Button
</div>

// Inline styles
<button style={{ backgroundColor: 'var(--color-primary)' }}>
  Click Me
</button>

// In styled-components or emotion
const Button = styled.button`
  background-color: var(--color-primary);
  &:hover {
    background-color: var(--color-primary-hover);
  }
`;
```

## Real-Time Theme Synchronization

### Event System

The theme system uses browser events for real-time synchronization:

1. **themeChanged Event**
   - Dispatched when theme is saved in platform-admin
   - Listened to by tenant-app ThemeContext
   - Triggers theme reload

2. **Storage Event**
   - Native browser event for localStorage changes
   - Triggers theme reload when THEME_CONFIGS changes
   - Works across browser tabs

### Implementation

**Platform-Admin (BrandingSettings.tsx)**
```typescript
// Dispatch theme change event after saving
const saveThemeConfigForTenantApp = (tenantId: string) => {
  // ... save theme config to localStorage
  
  // Notify tenant app
  window.dispatchEvent(new Event('themeChanged'));
};
```

**Tenant-App (ThemeContext.tsx)**
```typescript
useEffect(() => {
  // Listen for custom theme change events
  const handleThemeChange = () => {
    reloadTheme();
  };

  window.addEventListener('themeChanged', handleThemeChange);

  return () => {
    window.removeEventListener('themeChanged', handleThemeChange);
  };
}, []);
```

## Testing Guide

### Manual Testing Steps

1. **Test Theme Selection**
   - Open platform-admin in one browser tab
   - Open tenant-app in another tab
   - Login as org_admin for a tenant
   - Navigate to Branding Settings > Theme
   - Select different theme templates
   - Observe theme changes in tenant-app tab

2. **Test Custom Colors**
   - Select "Custom Colors" template
   - Go to "Colors & Fonts" tab
   - Change primary, secondary, accent colors
   - Save changes
   - Verify colors applied in tenant-app

3. **Test Cross-Tab Synchronization**
   - Open tenant-app in two different tabs
   - Change theme in platform-admin
   - Both tenant-app tabs should update automatically

4. **Test Theme Persistence**
   - Select a theme and save
   - Close browser completely
   - Reopen tenant-app
   - Verify selected theme is still applied

### Automated Testing

```typescript
// Example test for theme loading
describe('Theme System', () => {
  it('should load default theme when no config exists', () => {
    localStorage.removeItem('equiz_theme_configs');
    loadSavedTheme('tenant-123');
    
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-primary');
    
    expect(primaryColor).toBe('#3b82f6');
  });

  it('should load custom theme from config', () => {
    const config = [{
      tenantId: 'tenant-123',
      templateId: 'custom',
      isCustom: true,
      customColors: {
        primary: '#ff0000',
        secondary: '#00ff00',
        accent: '#0000ff'
      }
    }];
    
    localStorage.setItem('equiz_theme_configs', JSON.stringify(config));
    loadSavedTheme('tenant-123');
    
    const primaryColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-primary');
    
    expect(primaryColor).toBe('#ff0000');
  });
});
```

## Troubleshooting

### Theme Not Applying

**Problem:** Theme changes don't appear in tenant-app

**Solutions:**
1. Check browser console for errors
2. Verify localStorage has `equiz_theme_configs` key
3. Confirm tenant ID matches between platform-admin and tenant-app
4. Hard refresh browser (Ctrl+Shift+R)
5. Clear browser cache and localStorage

### Custom Colors Not Working

**Problem:** Custom colors not showing in tenant-app

**Solutions:**
1. Verify "Custom Colors" template is selected in Theme tab
2. Check that colors are saved in "Colors & Fonts" tab
3. Confirm theme config has `isCustom: true`
4. Verify `customColors` object exists in config

### Theme Reverts to Default

**Problem:** Theme keeps reverting to default after refresh

**Solutions:**
1. Check if theme config is being saved to localStorage
2. Verify no JavaScript errors on page load
3. Confirm tenant ID is correctly set in TenantContext
4. Check browser localStorage quotas (may be full)

### Colors Look Different Than Expected

**Problem:** Applied colors don't match selected template

**Solutions:**
1. Verify correct theme template ID in config
2. Check for CSS conflicts or overrides
3. Ensure no custom CSS interfering with theme variables
4. Clear browser cache for CSS files

## Best Practices

### For Tenant Admins

1. **Choose Appropriate Themes**
   - Select themes that align with your brand
   - Consider readability and accessibility
   - Test themes with different content types

2. **Custom Color Selection**
   - Ensure sufficient contrast for readability
   - Test colors on different screen sizes
   - Consider color blindness accessibility

3. **Preview Before Saving**
   - Use the preview button to test changes
   - Check theme across different pages
   - Verify buttons, links, and forms look good

### For Developers

1. **Always Use Theme Variables**
   - Never hardcode colors in components
   - Use CSS variables for consistency
   - Document when custom colors are needed

2. **Test Theme Compatibility**
   - Test components with all theme templates
   - Verify dark theme (Midnight) compatibility
   - Check color contrast ratios

3. **Handle Theme Loading States**
   - Show loading indicators during theme load
   - Provide fallbacks for missing themes
   - Handle localStorage errors gracefully

## Future Enhancements

### Planned Features

1. **Theme Preview Modal**
   - Live preview without saving
   - Preview all pages with new theme
   - A/B testing different themes

2. **Advanced Color Customization**
   - Custom background colors
   - Custom text colors
   - Gradient support

3. **Typography Customization**
   - Font family selection
   - Font size scales
   - Line height adjustments

4. **Component-Level Customization**
   - Custom button styles
   - Custom card styles
   - Custom form input styles

5. **Theme Import/Export**
   - Export theme as JSON
   - Import themes from file
   - Share themes between tenants

6. **Theme Marketplace**
   - Browse community themes
   - Purchase premium themes
   - Rate and review themes

## API Reference

### Functions

#### `loadSavedTheme(tenantId: string | null): void`
Load and apply theme for specified tenant. Falls back to default if no config found.

#### `applyTheme(colors: ThemeColors): void`
Apply theme colors to CSS variables on document root.

#### `getThemeById(id: string): ThemeTemplate | undefined`
Get theme template by ID. Returns undefined if not found.

#### `getDefaultTheme(): ThemeTemplate`
Get the default theme (Classic Blue).

#### `createCustomTheme(name: string, primary: string, secondary: string, accent: string): ThemeTemplate`
Create custom theme from base colors. Automatically generates light, dark, and hover shades.

#### `generateShades(hex: string): { light: string; dark: string; hover: string }`
Generate lighter and darker shades of a color.

#### `hexToRgb(hex: string): { r: number; g: number; b: number } | null`
Convert hex color to RGB values.

## Support

For issues, questions, or feature requests related to the theme system:

1. Check this documentation
2. Review troubleshooting section
3. Check browser console for errors
4. Contact development team with:
   - Tenant ID
   - Selected theme/template
   - Browser and version
   - Steps to reproduce issue
   - Screenshots if applicable

## Version History

- **v1.0.0** (November 2024)
  - Initial theme system implementation
  - 8 pre-designed theme templates
  - Custom color support
  - Real-time synchronization
  - Platform-admin integration

---

*Last Updated: November 18, 2024*
