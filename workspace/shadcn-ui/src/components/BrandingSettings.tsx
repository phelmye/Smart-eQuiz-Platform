import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Upload, Image, Palette, Type, Save, RefreshCw, Eye, Download, LogOut } from 'lucide-react';
import { useAuth } from './AuthSystem';
import { storage, STORAGE_KEYS, Tenant, hasPermission } from '@/lib/mockData';

interface BrandingSettingsProps {
  onBack: () => void;
}

interface BrandingConfig {
  platformTitle: string;
  platformSubtitle: string;
  logoUrl: string;
  faviconUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  customCSS: string;
  footerText: string;
  welcomeMessage: string;
  socialLinks: {
    website: string;
    facebook: string;
    twitter: string;
    instagram: string;
  };
  customFieldLabels: {
    parishSingular: string;
    parishPlural: string;
    parishMember: string;
    parishLeader: string;
  };
}

const defaultBranding: BrandingConfig = {
  platformTitle: 'Smart eQuiz Platform',
  platformSubtitle: 'Bible Tournament & Practice System',
  logoUrl: '',
  faviconUrl: '',
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  accentColor: '#f59e0b',
  fontFamily: 'Inter',
  customCSS: '',
  footerText: '© 2024 Smart eQuiz Platform. All rights reserved.',
  welcomeMessage: 'Welcome to our Bible Quiz Tournament Platform! Test your knowledge and compete with others.',
  socialLinks: {
    website: '',
    facebook: '',
    twitter: '',
    instagram: ''
  },
  customFieldLabels: {
    parishSingular: 'Parish/Organization',
    parishPlural: 'Parishes/Organizations',
    parishMember: 'Member',
    parishLeader: 'Authority/Pastor'
  }
};

export const BrandingSettings: React.FC<BrandingSettingsProps> = ({ onBack }) => {
  const { user, tenant, logout } = useAuth();
  const [branding, setBranding] = useState<BrandingConfig>(defaultBranding);
  const [isLoading, setIsLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  useEffect(() => {
    loadBrandingConfig();
  }, [user, tenant]);

  const loadBrandingConfig = () => {
    const savedBranding = storage.get(`${STORAGE_KEYS.BRANDING}_${tenant?.id}`) || 
                          storage.get(STORAGE_KEYS.BRANDING) || 
                          defaultBranding;
    
    // Ensure socialLinks and customFieldLabels properties exist to prevent errors
    const brandingWithDefaults = {
      ...defaultBranding,
      ...savedBranding,
      socialLinks: {
        ...defaultBranding.socialLinks,
        ...(savedBranding?.socialLinks || {})
      },
      customFieldLabels: {
        ...defaultBranding.customFieldLabels,
        ...(savedBranding?.customFieldLabels || {})
      }
    };
    
    setBranding(brandingWithDefaults);
  };

  const saveBrandingConfig = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Save branding configuration
      const storageKey = tenant?.id ? `${STORAGE_KEYS.BRANDING}_${tenant.id}` : STORAGE_KEYS.BRANDING;
      storage.set(storageKey, branding);
      
      // Update tenant configuration if applicable
      if (tenant) {
        const tenants = storage.get(STORAGE_KEYS.TENANTS) || [];
        const updatedTenants = tenants.map((t: Tenant) => 
          t.id === tenant.id ? { 
            ...t, 
            name: branding.platformTitle,
            primaryColor: branding.primaryColor,
            logoUrl: branding.logoUrl
          } : t
        );
        storage.set(STORAGE_KEYS.TENANTS, updatedTenants);
      }
      
      // Apply branding to document
      applyBrandingToDocument();
      
      alert('Branding settings saved successfully!');
    } catch (error) {
      alert('Failed to save branding settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const applyBrandingToDocument = () => {
    // Update document title
    document.title = branding.platformTitle;
    
    // Update favicon if provided
    if (branding.faviconUrl) {
      const favicon = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (favicon) {
        favicon.href = branding.faviconUrl;
      }
    }
    
    // Apply custom CSS variables
    const root = document.documentElement;
    root.style.setProperty('--primary-color', branding.primaryColor);
    root.style.setProperty('--secondary-color', branding.secondaryColor);
    root.style.setProperty('--accent-color', branding.accentColor);
    
    // Apply custom CSS if provided
    if (branding.customCSS) {
      let customStyleElement = document.getElementById('custom-branding-styles');
      if (!customStyleElement) {
        customStyleElement = document.createElement('style');
        customStyleElement.id = 'custom-branding-styles';
        document.head.appendChild(customStyleElement);
      }
      customStyleElement.textContent = branding.customCSS;
    }
  };

  const handleFileUpload = (file: File, type: 'logo' | 'favicon') => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setBranding(prev => ({
        ...prev,
        [type === 'logo' ? 'logoUrl' : 'faviconUrl']: dataUrl
      }));
    };
    reader.readAsDataURL(file);
    
    if (type === 'logo') {
      setLogoFile(file);
    } else {
      setFaviconFile(file);
    }
  };

  const resetToDefaults = () => {
    if (confirm('Are you sure you want to reset all branding settings to defaults?')) {
      setBranding(defaultBranding);
    }
  };

  const exportBrandingConfig = () => {
    const dataStr = JSON.stringify(branding, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `branding-config-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!user || !hasPermission(user, 'branding.manage')) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-gray-600 mb-4">You need admin privileges to manage branding settings.</p>
            <Button onClick={onBack}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <h1 className="text-3xl font-bold text-gray-900">Branding Settings</h1>
                <p className="text-gray-600">Customize your platform's appearance and branding</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
                <Eye className="h-4 w-4 mr-2" />
                {previewMode ? 'Exit Preview' : 'Preview'}
              </Button>
              
              <Button variant="outline" onClick={exportBrandingConfig}>
                <Download className="h-4 w-4 mr-2" />
                Export Config
              </Button>
              
              <Button variant="outline" onClick={resetToDefaults}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset to Defaults
              </Button>
              
              <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
              
              <Button onClick={saveBrandingConfig} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </div>

          {previewMode && (
            <Alert className="mb-4">
              <Eye className="h-4 w-4" />
              <AlertDescription>
                Preview mode is active. Changes are shown in real-time but not saved until you click "Save Changes".
              </AlertDescription>
            </Alert>
          )}
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="logos">Logos & Images</TabsTrigger>
            <TabsTrigger value="colors">Colors & Fonts</TabsTrigger>
            <TabsTrigger value="terminology">Field Labels</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Information</CardTitle>
                <CardDescription>Basic platform details and naming</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="platform-title">Platform Title *</Label>
                    <Input
                      id="platform-title"
                      value={branding.platformTitle}
                      onChange={(e) => setBranding(prev => ({ ...prev, platformTitle: e.target.value }))}
                      placeholder="Smart eQuiz Platform"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="platform-subtitle">Platform Subtitle</Label>
                    <Input
                      id="platform-subtitle"
                      value={branding.platformSubtitle}
                      onChange={(e) => setBranding(prev => ({ ...prev, platformSubtitle: e.target.value }))}
                      placeholder="Bible Tournament & Practice System"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="welcome-message">Welcome Message</Label>
                  <Textarea
                    id="welcome-message"
                    value={branding.welcomeMessage}
                    onChange={(e) => setBranding(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                    placeholder="Welcome message for new users..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="footer-text">Footer Text</Label>
                  <Input
                    id="footer-text"
                    value={branding.footerText}
                    onChange={(e) => setBranding(prev => ({ ...prev, footerText: e.target.value }))}
                    placeholder="© 2024 Your Organization. All rights reserved."
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>Connect your social media accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="website">Website URL</Label>
                    <Input
                      id="website"
                      value={branding?.socialLinks?.website || ''}
                      onChange={(e) => setBranding(prev => ({ 
                        ...prev, 
                        socialLinks: { ...prev.socialLinks, website: e.target.value }
                      }))}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="facebook">Facebook Page</Label>
                    <Input
                      id="facebook"
                      value={branding?.socialLinks?.facebook || ''}
                      onChange={(e) => setBranding(prev => ({ 
                        ...prev, 
                        socialLinks: { ...prev.socialLinks, facebook: e.target.value }
                      }))}
                      placeholder="https://facebook.com/yourpage"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="twitter">Twitter/X Profile</Label>
                    <Input
                      id="twitter"
                      value={branding?.socialLinks?.twitter || ''}
                      onChange={(e) => setBranding(prev => ({ 
                        ...prev, 
                        socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                      }))}
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="instagram">Instagram Profile</Label>
                    <Input
                      id="instagram"
                      value={branding?.socialLinks?.instagram || ''}
                      onChange={(e) => setBranding(prev => ({ 
                        ...prev, 
                        socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                      }))}
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Logo & Brand Images</CardTitle>
                <CardDescription>Upload your organization's logo and favicon</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label>Platform Logo</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {branding.logoUrl ? (
                        <div className="space-y-4">
                          <img 
                            src={branding.logoUrl} 
                            alt="Platform Logo" 
                            className="max-h-32 mx-auto object-contain"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setBranding(prev => ({ ...prev, logoUrl: '' }))}
                          >
                            Remove Logo
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Image className="h-12 w-12 text-gray-400 mx-auto" />
                          <div>
                            <p className="text-sm text-gray-600">Upload your logo</p>
                            <p className="text-xs text-gray-400">PNG, JPG, SVG up to 2MB</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'logo');
                            }}
                            className="hidden"
                            id="logo-upload"
                          />
                          <Button asChild variant="outline">
                            <label htmlFor="logo-upload" className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Choose File
                            </label>
                          </Button>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="logo-url">Or enter Logo URL</Label>
                      <Input
                        id="logo-url"
                        value={branding.logoUrl}
                        onChange={(e) => setBranding(prev => ({ ...prev, logoUrl: e.target.value }))}
                        placeholder="/images/Logo.jpg"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label>Favicon</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      {branding.faviconUrl ? (
                        <div className="space-y-4">
                          <img 
                            src={branding.faviconUrl} 
                            alt="Favicon" 
                            className="max-h-16 mx-auto object-contain"
                          />
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setBranding(prev => ({ ...prev, faviconUrl: '' }))}
                          >
                            Remove Favicon
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <Image className="h-8 w-8 text-gray-400 mx-auto" />
                          <div>
                            <p className="text-sm text-gray-600">Upload favicon</p>
                            <p className="text-xs text-gray-400">ICO, PNG 16x16 or 32x32</p>
                          </div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleFileUpload(file, 'favicon');
                            }}
                            className="hidden"
                            id="favicon-upload"
                          />
                          <Button asChild variant="outline">
                            <label htmlFor="favicon-upload" className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Choose File
                            </label>
                          </Button>
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="favicon-url">Or enter Favicon URL</Label>
                      <Input
                        id="favicon-url"
                        value={branding.faviconUrl}
                        onChange={(e) => setBranding(prev => ({ ...prev, faviconUrl: e.target.value }))}
                        placeholder="https://example.com/favicon.ico"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="colors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Color Scheme</CardTitle>
                <CardDescription>Customize your platform's color palette</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        id="primary-color"
                        value={branding.primaryColor}
                        onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="w-12 h-10 border rounded cursor-pointer"
                      />
                      <Input
                        value={branding.primaryColor}
                        onChange={(e) => setBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                        placeholder="#2563eb"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        id="secondary-color"
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="w-12 h-10 border rounded cursor-pointer"
                      />
                      <Input
                        value={branding.secondaryColor}
                        onChange={(e) => setBranding(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        placeholder="#64748b"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accent-color">Accent Color</Label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        id="accent-color"
                        value={branding.accentColor}
                        onChange={(e) => setBranding(prev => ({ ...prev, accentColor: e.target.value }))}
                        className="w-12 h-10 border rounded cursor-pointer"
                      />
                      <Input
                        value={branding.accentColor}
                        onChange={(e) => setBranding(prev => ({ ...prev, accentColor: e.target.value }))}
                        placeholder="#f59e0b"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Color Preview</Label>
                  <div className="grid grid-cols-3 gap-4">
                    <div 
                      className="h-20 rounded-lg flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: branding.primaryColor }}
                    >
                      Primary
                    </div>
                    <div 
                      className="h-20 rounded-lg flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: branding.secondaryColor }}
                    >
                      Secondary
                    </div>
                    <div 
                      className="h-20 rounded-lg flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: branding.accentColor }}
                    >
                      Accent
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Typography</CardTitle>
                <CardDescription>Choose fonts for your platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="font-family">Font Family</Label>
                  <select
                    id="font-family"
                    value={branding.fontFamily}
                    onChange={(e) => setBranding(prev => ({ ...prev, fontFamily: e.target.value }))}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Inter">Inter (Default)</option>
                    <option value="Arial">Arial</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Roboto">Roboto</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Lato">Lato</option>
                    <option value="Montserrat">Montserrat</option>
                  </select>
                </div>

                <div className="p-4 border rounded-lg" style={{ fontFamily: branding.fontFamily }}>
                  <h3 className="text-lg font-bold mb-2">Font Preview</h3>
                  <p className="text-sm text-gray-600">
                    This is how your text will appear with the selected font family. 
                    The quick brown fox jumps over the lazy dog.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terminology" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Customize Field Labels</CardTitle>
                <CardDescription>
                  Customize terminology to match your organization's language. 
                  These labels will be used throughout the platform in forms, profiles, and tournaments.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert className="bg-blue-50 border-blue-200">
                  <Type className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800">
                    <strong>Examples:</strong> If you run a school quiz platform, you might change "Parish/Organization" to "School" 
                    or "Class". For sports teams, use "Team" or "Club". These changes apply everywhere in your platform.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="parish-singular">
                      Group Name (Singular) *
                      <span className="text-sm text-gray-500 ml-2">Default: "Parish/Organization"</span>
                    </Label>
                    <Input
                      id="parish-singular"
                      value={branding.customFieldLabels.parishSingular}
                      onChange={(e) => setBranding(prev => ({ 
                        ...prev, 
                        customFieldLabels: { ...prev.customFieldLabels, parishSingular: e.target.value }
                      }))}
                      placeholder="e.g., Parish, Church, School, Team, Organization"
                    />
                    <p className="text-xs text-gray-500">
                      Used in: Registration form, User profile, Tournament application
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parish-plural">
                      Group Name (Plural) *
                      <span className="text-sm text-gray-500 ml-2">Default: "Parishes/Organizations"</span>
                    </Label>
                    <Input
                      id="parish-plural"
                      value={branding.customFieldLabels.parishPlural}
                      onChange={(e) => setBranding(prev => ({ 
                        ...prev, 
                        customFieldLabels: { ...prev.customFieldLabels, parishPlural: e.target.value }
                      }))}
                      placeholder="e.g., Parishes, Churches, Schools, Teams, Organizations"
                    />
                    <p className="text-xs text-gray-500">
                      Used in: Lists, Search results, Dashboard headings
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parish-member">
                      Member Title
                      <span className="text-sm text-gray-500 ml-2">Default: "Member"</span>
                    </Label>
                    <Input
                      id="parish-member"
                      value={branding.customFieldLabels.parishMember}
                      onChange={(e) => setBranding(prev => ({ 
                        ...prev, 
                        customFieldLabels: { ...prev.customFieldLabels, parishMember: e.target.value }
                      }))}
                      placeholder="e.g., Member, Parishioner, Student, Team Member, Participant"
                    />
                    <p className="text-xs text-gray-500">
                      Used in: Tournament rosters, Group listings, Member counts
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parish-leader">
                      Leader Title
                      <span className="text-sm text-gray-500 ml-2">Default: "Authority/Pastor"</span>
                    </Label>
                    <Input
                      id="parish-leader"
                      value={branding.customFieldLabels.parishLeader}
                      onChange={(e) => setBranding(prev => ({ 
                        ...prev, 
                        customFieldLabels: { ...prev.customFieldLabels, parishLeader: e.target.value }
                      }))}
                      placeholder="e.g., Pastor, Priest, Principal, Coach, Team Captain"
                    />
                    <p className="text-xs text-gray-500">
                      Used in: Group registration forms, Contact information
                    </p>
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-semibold mb-3">Preview</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Registration:</strong> "Select your {branding.customFieldLabels.parishSingular.toLowerCase()}"</p>
                    <p><strong>Dashboard:</strong> "Browse {branding.customFieldLabels.parishPlural}"</p>
                    <p><strong>Tournament:</strong> "Compete as a {branding.customFieldLabels.parishMember.toLowerCase()}"</p>
                    <p><strong>Contact:</strong> "{branding.customFieldLabels.parishLeader} Information"</p>
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    <strong>Note:</strong> Changes will take effect immediately for all new forms and displays. 
                    Existing data labels will update on next page load.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Platform Content</CardTitle>
                <CardDescription>Customize text content throughout your platform</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="welcome-message-content">Welcome Message</Label>
                  <Textarea
                    id="welcome-message-content"
                    value={branding.welcomeMessage}
                    onChange={(e) => setBranding(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                    placeholder="Welcome to our Bible Quiz Tournament Platform!"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="footer-content">Footer Text</Label>
                  <Input
                    id="footer-content"
                    value={branding.footerText}
                    onChange={(e) => setBranding(prev => ({ ...prev, footerText: e.target.value }))}
                    placeholder="© 2024 Your Organization. All rights reserved."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom CSS</CardTitle>
                <CardDescription>Add custom CSS for advanced styling (use with caution)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="custom-css">Custom CSS Code</Label>
                  <Textarea
                    id="custom-css"
                    value={branding.customCSS}
                    onChange={(e) => setBranding(prev => ({ ...prev, customCSS: e.target.value }))}
                    placeholder="/* Add your custom CSS here */
.custom-class {
  color: #your-color;
}"
                    rows={10}
                    className="font-mono text-sm"
                  />
                </div>

                <Alert>
                  <Palette className="h-4 w-4" />
                  <AlertDescription>
                    Custom CSS will be applied globally. Test thoroughly before saving to production.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Import/Export Configuration</CardTitle>
                <CardDescription>Backup or restore your branding settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex space-x-4">
                  <Button variant="outline" onClick={exportBrandingConfig}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Configuration
                  </Button>
                  
                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            try {
                              const config = JSON.parse(event.target?.result as string);
                              setBranding(config);
                              alert('Configuration imported successfully!');
                            } catch (error) {
                              alert('Invalid configuration file.');
                            }
                          };
                          reader.readAsText(file);
                        }
                      }}
                      className="hidden"
                      id="import-config"
                    />
                    <Button asChild variant="outline">
                      <label htmlFor="import-config" className="cursor-pointer">
                        <Upload className="h-4 w-4 mr-2" />
                        Import Configuration
                      </label>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};