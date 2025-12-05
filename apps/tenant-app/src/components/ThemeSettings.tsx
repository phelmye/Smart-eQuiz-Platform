import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Palette, Save, RotateCcw, Eye, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { storage, STORAGE_KEYS, Tenant, hasPermission } from '@/lib/mockData';
import {
  themeTemplates,
  getThemeById,
  getDefaultTheme,
  applyTheme,
  createCustomTheme,
  type ThemeTemplate,
  type ThemeColors
} from '@/lib/theme';

interface ThemeSettingsProps {
  onBack: () => void;
}

interface TenantThemeConfig {
  tenantId: string;
  templateId: string;
  customColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  isCustom: boolean;
}

export const ThemeSettings: React.FC<ThemeSettingsProps> = ({ onBack }) => {
  const { user, tenant, logout } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState<ThemeTemplate>(getDefaultTheme());
  const [customColors, setCustomColors] = useState({
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#10b981'
  });
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    loadThemeConfig();
  }, [tenant]);

  const loadThemeConfig = () => {
    if (!tenant) return;

    const configs = storage.get(STORAGE_KEYS.THEME_CONFIGS) || [];
    const config = configs.find((c: TenantThemeConfig) => c.tenantId === tenant.id);

    if (config) {
      if (config.isCustom && config.customColors) {
        setIsCustomMode(true);
        setCustomColors(config.customColors);
        const customTheme = createCustomTheme(
          'Custom Theme',
          config.customColors.primary,
          config.customColors.secondary,
          config.customColors.accent
        );
        setSelectedTemplate(customTheme);
        applyTheme(customTheme.colors);
      } else {
        const template = getThemeById(config.templateId);
        if (template) {
          setSelectedTemplate(template);
          applyTheme(template.colors);
        }
      }
    }
  };

  const handleTemplateSelect = (template: ThemeTemplate) => {
    setSelectedTemplate(template);
    setIsCustomMode(false);
    if (previewMode) {
      applyTheme(template.colors);
    }
  };

  const handleCustomColorChange = (colorType: 'primary' | 'secondary' | 'accent', value: string) => {
    const newColors = { ...customColors, [colorType]: value };
    setCustomColors(newColors);
    
    if (previewMode) {
      const customTheme = createCustomTheme(
        'Custom Theme',
        newColors.primary,
        newColors.secondary,
        newColors.accent
      );
      applyTheme(customTheme.colors);
    }
  };

  const handleSaveTheme = () => {
    if (!tenant || !user) return;

    // Check permission
    if (!hasPermission(user, 'branding.manage')) {
      setSaveMessage('You do not have permission to manage themes');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }

    const config: TenantThemeConfig = {
      tenantId: tenant.id,
      templateId: isCustomMode ? 'custom' : selectedTemplate.id,
      isCustom: isCustomMode,
      ...(isCustomMode && { customColors })
    };

    // Save to storage
    const configs = storage.get(STORAGE_KEYS.THEME_CONFIGS) || [];
    const existingIndex = configs.findIndex((c: TenantThemeConfig) => c.tenantId === tenant.id);
    
    if (existingIndex >= 0) {
      configs[existingIndex] = config;
    } else {
      configs.push(config);
    }
    
    storage.set(STORAGE_KEYS.THEME_CONFIGS, configs);

    // Apply theme immediately
    if (isCustomMode) {
      const customTheme = createCustomTheme(
        'Custom Theme',
        customColors.primary,
        customColors.secondary,
        customColors.accent
      );
      applyTheme(customTheme.colors);
    } else {
      applyTheme(selectedTemplate.colors);
    }

    // Dispatch custom event to notify all components
    window.dispatchEvent(new Event('themeChanged'));

    setSaveMessage('Theme saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleResetTheme = () => {
    const defaultTheme = getDefaultTheme();
    setSelectedTemplate(defaultTheme);
    setIsCustomMode(false);
    setCustomColors({
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#10b981'
    });
    applyTheme(defaultTheme.colors);
  };

  const togglePreview = () => {
    if (!previewMode) {
      // Entering preview mode
      if (isCustomMode) {
        const customTheme = createCustomTheme(
          'Custom Theme',
          customColors.primary,
          customColors.secondary,
          customColors.accent
        );
        applyTheme(customTheme.colors);
      } else {
        applyTheme(selectedTemplate.colors);
      }
    } else {
      // Exiting preview mode - reload saved config
      loadThemeConfig();
    }
    setPreviewMode(!previewMode);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Theme Settings</h1>
                <p className="text-gray-600">Customize your platform's appearance with templates or custom colors</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={togglePreview}>
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Exit Preview' : 'Preview'}
              </Button>
              <Button variant="outline" onClick={handleResetTheme}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSaveTheme}>
                <Save className="h-4 w-4 mr-2" />
                Save Theme
              </Button>
              <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Mode Alert */}
        {previewMode && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Eye className="h-4 w-4" />
            <AlertDescription>
              <strong>Preview Mode:</strong> You're viewing how your theme will look. Click "Exit Preview" to restore your saved theme.
            </AlertDescription>
          </Alert>
        )}

        {/* Save Message */}
        {saveMessage && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{saveMessage}</AlertDescription>
          </Alert>
        )}

        <Tabs value={isCustomMode ? 'custom' : 'templates'} onValueChange={(v) => setIsCustomMode(v === 'custom')} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="custom">Custom Colors</TabsTrigger>
          </TabsList>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Choose a Template</CardTitle>
                <CardDescription>
                  Select from our pre-designed themes or create your own custom theme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {themeTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        selectedTemplate.id === template.id && !isCustomMode
                          ? 'ring-2 ring-blue-500'
                          : ''
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-semibold text-lg">{template.name}</h3>
                              <p className="text-sm text-gray-500">{template.description}</p>
                            </div>
                            {selectedTemplate.id === template.id && !isCustomMode && (
                              <CheckCircle className="h-5 w-5 text-blue-500" />
                            )}
                          </div>
                          
                          {/* Color Preview */}
                          <div className="flex gap-2">
                            <div
                              className="w-12 h-12 rounded border-2 border-gray-200"
                              style={{ backgroundColor: template.colors.primary }}
                              title="Primary"
                            />
                            <div
                              className="w-12 h-12 rounded border-2 border-gray-200"
                              style={{ backgroundColor: template.colors.secondary }}
                              title="Secondary"
                            />
                            <div
                              className="w-12 h-12 rounded border-2 border-gray-200"
                              style={{ backgroundColor: template.colors.accent }}
                              title="Accent"
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Colors Tab */}
          <TabsContent value="custom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Color Palette</CardTitle>
                <CardDescription>
                  Choose your own primary, secondary, and accent colors to create a unique theme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Primary Color */}
                  <div className="space-y-3">
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex gap-3">
                      <Input
                        id="primaryColor"
                        type="color"
                        value={customColors.primary}
                        onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                        className="w-20 h-12 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={customColors.primary}
                        onChange={(e) => handleCustomColorChange('primary', e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Main brand color used for primary buttons and key elements
                    </p>
                  </div>

                  {/* Secondary Color */}
                  <div className="space-y-3">
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex gap-3">
                      <Input
                        id="secondaryColor"
                        type="color"
                        value={customColors.secondary}
                        onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                        className="w-20 h-12 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={customColors.secondary}
                        onChange={(e) => handleCustomColorChange('secondary', e.target.value)}
                        placeholder="#8b5cf6"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Supporting color for secondary actions and highlights
                    </p>
                  </div>

                  {/* Accent Color */}
                  <div className="space-y-3">
                    <Label htmlFor="accentColor">Accent Color</Label>
                    <div className="flex gap-3">
                      <Input
                        id="accentColor"
                        type="color"
                        value={customColors.accent}
                        onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                        className="w-20 h-12 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={customColors.accent}
                        onChange={(e) => handleCustomColorChange('accent', e.target.value)}
                        placeholder="#10b981"
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-gray-500">
                      Accent color for success states and emphasis
                    </p>
                  </div>
                </div>

                {/* Preview Card */}
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Color Preview</CardTitle>
                    <CardDescription>See how your colors work together</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div
                          className="h-24 rounded-lg border-2 flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: customColors.primary }}
                        >
                          Primary
                        </div>
                        <Badge style={{ backgroundColor: customColors.primary, color: 'white' }}>
                          Primary Badge
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div
                          className="h-24 rounded-lg border-2 flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: customColors.secondary }}
                        >
                          Secondary
                        </div>
                        <Badge style={{ backgroundColor: customColors.secondary, color: 'white' }}>
                          Secondary Badge
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div
                          className="h-24 rounded-lg border-2 flex items-center justify-center text-white font-semibold"
                          style={{ backgroundColor: customColors.accent }}
                        >
                          Accent
                        </div>
                        <Badge style={{ backgroundColor: customColors.accent, color: 'white' }}>
                          Accent Badge
                        </Badge>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button style={{ backgroundColor: customColors.primary, color: 'white' }}>
                        Primary Button
                      </Button>
                      <Button variant="outline" style={{ borderColor: customColors.secondary, color: customColors.secondary }}>
                        Secondary Button
                      </Button>
                      <Button variant="outline" style={{ borderColor: customColors.accent, color: customColors.accent }}>
                        Accent Button
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ThemeSettings;
