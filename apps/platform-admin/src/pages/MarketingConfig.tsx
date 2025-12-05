import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Globe, Plus, Trash2, Save, Image as ImageIcon } from 'lucide-react';

interface HeaderMenuItem {
  label: string;
  href: string;
  highlighted?: boolean;
}

interface FooterSection {
  title: string;
  links: { label: string; href: string }[];
}

interface SocialLink {
  platform: 'twitter' | 'facebook' | 'linkedin' | 'instagram' | 'youtube';
  url: string;
}

export default function MarketingSiteConfig() {
  // Site Settings
  const [siteName, setSiteName] = useState('Smart eQuiz');
  const [logoUrl, setLogoUrl] = useState('/logo.svg');
  const [contactEmail, setContactEmail] = useState('support@smartequiz.com');
  const [footerNote, setFooterNote] = useState('© 2025 Smart eQuiz Platform. All rights reserved.');

  // Header Menu Items
  const [headerMenu, setHeaderMenu] = useState<HeaderMenuItem[]>([
    { label: 'Features', href: '/features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Demo', href: '/demo' },
    { label: 'Docs', href: '/docs' },
    { label: 'Blog', href: '/blog' },
    { label: 'Sign In', href: '/signin' },
    { label: 'Start Free Trial', href: '/signup', highlighted: true },
  ]);

  // Footer Sections
  const footerSections: FooterSection[] = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '/features' },
        { label: 'Pricing', href: '/pricing' },
        { label: 'Demo', href: '/demo' },
        { label: 'Documentation', href: '/docs' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'Blog', href: '/blog' },
        { label: 'Affiliate Program', href: '/affiliate' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { label: 'Help Center', href: '/docs' },
        { label: 'Community', href: '/community' },
        { label: 'Status', href: '/status' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
        { label: 'Security', href: '/security' },
      ],
    },
  ];

  // Social Links
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    { platform: 'twitter', url: 'https://twitter.com/smartequiz' },
    { platform: 'facebook', url: 'https://facebook.com/smartequiz' },
    { platform: 'linkedin', url: 'https://linkedin.com/company/smartequiz' },
  ]);

  const [newMenuItem, setNewMenuItem] = useState({ label: '', href: '', highlighted: false });

  const handleSaveConfig = () => {
    const config = {
      siteName,
      logoUrl,
      contactEmail,
      footerNote,
      headerMenu,
      footerSections,
      socialLinks,
    };
    
    // TODO: Save to API
    console.log('Saving marketing config:', config);
    alert('Marketing configuration saved successfully!');
  };

  const addMenuItem = () => {
    if (newMenuItem.label && newMenuItem.href) {
      setHeaderMenu([...headerMenu, newMenuItem]);
      setNewMenuItem({ label: '', href: '', highlighted: false });
    }
  };

  const removeMenuItem = (index: number) => {
    setHeaderMenu(headerMenu.filter((_, i) => i !== index));
  };

  const toggleMenuItemHighlight = (index: number) => {
    const updated = [...headerMenu];
    updated[index].highlighted = !updated[index].highlighted;
    setHeaderMenu(updated);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Globe className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold">Marketing Site Configuration</h1>
        </div>
        <p className="text-gray-600">
          Manage the marketing website appearance, navigation, and content
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">General Settings</TabsTrigger>
          <TabsTrigger value="header">Header Menu</TabsTrigger>
          <TabsTrigger value="footer">Footer</TabsTrigger>
          <TabsTrigger value="social">Social Links</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure basic site information and branding</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={siteName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSiteName(e.target.value)}
                    placeholder="Smart eQuiz"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logoUrl"
                      value={logoUrl}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLogoUrl(e.target.value)}
                      placeholder="/logo.svg"
                    />
                    <Button variant="outline" size="icon">
                      <ImageIcon className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={contactEmail}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setContactEmail(e.target.value)}
                    placeholder="support@smartequiz.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="footerNote">Footer Copyright Text</Label>
                <Input
                  id="footerNote"
                  value={footerNote}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFooterNote(e.target.value)}
                  placeholder="© 2025 Smart eQuiz Platform. All rights reserved."
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveConfig}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Header Menu */}
        <TabsContent value="header">
          <Card>
            <CardHeader>
              <CardTitle>Header Navigation Menu</CardTitle>
              <CardDescription>Manage the main navigation menu items</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mb-6">
                <div className="grid grid-cols-12 gap-2">
                  <Input
                    placeholder="Label"
                    value={newMenuItem.label}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMenuItem({ ...newMenuItem, label: e.target.value })}
                    className="col-span-4"
                  />
                  <Input
                    placeholder="URL (e.g., /features)"
                    value={newMenuItem.href}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMenuItem({ ...newMenuItem, href: e.target.value })}
                    className="col-span-6"
                  />
                  <Button onClick={addMenuItem} className="col-span-2">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Label</TableHead>
                    <TableHead>URL</TableHead>
                    <TableHead>Style</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {headerMenu.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{item.label}</TableCell>
                      <TableCell className="text-gray-600">{item.href}</TableCell>
                      <TableCell>
                        <Badge
                          variant={item.highlighted ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => toggleMenuItemHighlight(index)}
                        >
                          {item.highlighted ? 'Highlighted' : 'Normal'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMenuItem(index)}
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveConfig}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Footer */}
        <TabsContent value="footer">
          <Card>
            <CardHeader>
              <CardTitle>Footer Sections</CardTitle>
              <CardDescription>Organize footer links into sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {footerSections.map((section, sectionIndex) => (
                  <Card key={sectionIndex}>
                    <CardHeader>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {section.links.map((link, linkIndex) => (
                          <li key={linkIndex} className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{link.label}</span>
                              <span className="text-sm text-gray-500 ml-2">{link.href}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveConfig}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Footer
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Links */}
        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Links</CardTitle>
              <CardDescription>Configure social media profile links</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {socialLinks.map((social, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <Badge className="w-24 justify-center">{social.platform}</Badge>
                    <Input
                      value={social.url}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                        const updated = [...socialLinks];
                        updated[index].url = e.target.value;
                        setSocialLinks(updated);
                      }}
                      placeholder={`https://${social.platform}.com/yourpage`}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSocialLinks(socialLinks.filter((_, i) => i !== index))}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                ))}

                <Button variant="outline" onClick={() => {
                  // Add new social link
                  console.log('Add new social link');
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Social Link
                </Button>
              </div>

              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveConfig}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Social Links
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
