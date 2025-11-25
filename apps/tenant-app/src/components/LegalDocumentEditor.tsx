import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Save, Eye, History, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { User } from '@/lib/mockData';

interface LegalDocument {
  id: string;
  tenantId: string;
  type: LegalDocumentType;
  title: string;
  content: string;
  version: number;
  isActive: boolean;
  requiresAcceptance: boolean;
  effectiveDate: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

enum LegalDocumentType {
  TERMS_OF_SERVICE = 'TERMS_OF_SERVICE',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  COOKIE_POLICY = 'COOKIE_POLICY',
  ACCEPTABLE_USE_POLICY = 'ACCEPTABLE_USE_POLICY',
  DATA_PROCESSING_AGREEMENT = 'DATA_PROCESSING_AGREEMENT',
  SERVICE_LEVEL_AGREEMENT = 'SERVICE_LEVEL_AGREEMENT',
}

const DOCUMENT_TYPE_LABELS: Record<LegalDocumentType, string> = {
  TERMS_OF_SERVICE: 'Terms of Service',
  PRIVACY_POLICY: 'Privacy Policy',
  COOKIE_POLICY: 'Cookie Policy',
  ACCEPTABLE_USE_POLICY: 'Acceptable Use Policy',
  DATA_PROCESSING_AGREEMENT: 'Data Processing Agreement',
  SERVICE_LEVEL_AGREEMENT: 'Service Level Agreement',
};

interface LegalDocumentEditorProps {
  user: User;
}

export const LegalDocumentEditor: React.FC<LegalDocumentEditorProps> = ({ user }) => {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [selectedType, setSelectedType] = useState<LegalDocumentType>(LegalDocumentType.TERMS_OF_SERVICE);
  const [editingDocument, setEditingDocument] = useState<Partial<LegalDocument> | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [versionHistory, setVersionHistory] = useState<LegalDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    requiresAcceptance: true,
    effectiveDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    if (selectedType) {
      loadActiveDocument(selectedType);
    }
  }, [selectedType]);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const response = await fetch(`/api/legal-documents/active`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'X-Tenant-Id': user.tenantId,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setDocuments(data);
      }
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadActiveDocument = async (type: LegalDocumentType) => {
    try {
      const response = await fetch(`/api/legal-documents/active/${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'X-Tenant-Id': user.tenantId,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setEditingDocument(data);
        setFormData({
          title: data.title,
          content: data.content,
          requiresAcceptance: data.requiresAcceptance,
          effectiveDate: data.effectiveDate.split('T')[0],
        });
      }
    } catch (error) {
      console.error('Failed to load document:', error);
      // New document
      setEditingDocument(null);
      setFormData({
        title: `${DOCUMENT_TYPE_LABELS[type]}`,
        content: getDefaultTemplate(type),
        requiresAcceptance: true,
        effectiveDate: new Date().toISOString().split('T')[0],
      });
    }
  };

  const loadVersionHistory = async (type: LegalDocumentType) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/legal-documents/history/${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'X-Tenant-Id': user.tenantId,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setVersionHistory(data);
        setShowHistory(true);
      }
    } catch (error) {
      console.error('Failed to load version history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      const url = editingDocument?.id
        ? `/api/legal-documents/${editingDocument.id}`
        : '/api/legal-documents';
      
      const method = editingDocument?.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'X-Tenant-Id': user.tenantId,
        },
        body: JSON.stringify({
          type: selectedType,
          ...formData,
        }),
      });

      if (response.ok) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
        loadDocuments();
        loadActiveDocument(selectedType);
        setShowEditor(false);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Failed to save document:', error);
      setSaveStatus('error');
    }
  };

  const handleActivateVersion = async (documentId: string) => {
    try {
      const response = await fetch(`/api/legal-documents/${documentId}/activate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'X-Tenant-Id': user.tenantId,
        },
      });

      if (response.ok) {
        loadDocuments();
        loadActiveDocument(selectedType);
        loadVersionHistory(selectedType);
      }
    } catch (error) {
      console.error('Failed to activate version:', error);
    }
  };

  const getDefaultTemplate = (type: LegalDocumentType): string => {
    const orgName = user.tenantId; // Replace with actual tenant name
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    switch (type) {
      case LegalDocumentType.TERMS_OF_SERVICE:
        return `# Terms of Service

**Last Updated:** ${today}

## 1. Acceptance of Terms

By accessing and using ${orgName}'s Bible Quiz platform, you accept and agree to be bound by the terms and provisions of this agreement.

## 2. Use License

Permission is granted to access the Service for personal or organizational use. This is the grant of a license, not a transfer of title.

## 3. User Accounts

You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.

## 4. Prohibited Uses

You may not use the Service:
- For any unlawful purpose
- To transmit any harmful or malicious code
- To interfere with or disrupt the Service
- To violate any applicable laws or regulations

## 5. Modifications

We reserve the right to modify or replace these Terms at any time. Continued use of the Service after changes constitutes acceptance of the new Terms.

## 6. Contact

For questions about these Terms, please contact us at support@${orgName}.com`;

      case LegalDocumentType.PRIVACY_POLICY:
        return `# Privacy Policy

**Last Updated:** ${today}

## 1. Introduction

${orgName} ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information.

## 2. Information We Collect

### 2.1 Personal Information
- Name and contact information
- Account credentials
- Profile information
- Quiz participation data

### 2.2 Automatically Collected Information
- IP address and device information
- Usage data and analytics
- Cookies and similar tracking technologies

## 3. How We Use Your Information

We use collected information to:
- Provide and maintain our Service
- Notify you about changes to our Service
- Provide customer support
- Monitor usage and improve the Service
- Detect and prevent fraud

## 4. Information Sharing

We do not sell your personal information. We may share information with:
- Service providers who assist in operating our Service
- Legal authorities when required by law
- Other users within your organization (as configured)

## 5. Data Security

We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.

## 6. Your Rights

You have the right to:
- Access your personal information
- Correct inaccurate information
- Request deletion of your information
- Opt-out of marketing communications

## 7. Contact

For privacy-related questions, please contact us at privacy@${orgName}.com`;

      default:
        return `# ${DOCUMENT_TYPE_LABELS[type]}\n\n**Last Updated:** ${today}\n\n## Introduction\n\nEnter your document content here...`;
    }
  };

  const activeDoc = documents.find(d => d.type === selectedType);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold mb-2">Legal Documents Manager</h2>
        <p className="text-gray-600">
          Create and manage legal documents for your organization. Each document supports version control and user acceptance tracking.
        </p>
      </div>

      {/* Document Type Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Document Type</CardTitle>
          <CardDescription>Choose which legal document you want to view or edit</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedType} onValueChange={(value) => setSelectedType(value as LegalDocumentType)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(DOCUMENT_TYPE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Current Document Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {DOCUMENT_TYPE_LABELS[selectedType]}
              </CardTitle>
              <CardDescription className="mt-1">
                {activeDoc ? `Version ${activeDoc.version} • Last updated ${new Date(activeDoc.updatedAt).toLocaleDateString()}` : 'No active version'}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => loadVersionHistory(selectedType)}>
                <History className="h-4 w-4 mr-1" />
                History
              </Button>
              {activeDoc && (
                <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
                  <Eye className="h-4 w-4 mr-1" />
                  Preview
                </Button>
              )}
              <Button onClick={() => { loadActiveDocument(selectedType); setShowEditor(true); }}>
                <FileText className="h-4 w-4 mr-1" />
                {activeDoc ? 'Edit' : 'Create'}
              </Button>
            </div>
          </div>
        </CardHeader>
        {activeDoc && (
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={activeDoc.isActive ? "default" : "secondary"} className="mt-1">
                  {activeDoc.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Version</p>
                <p className="font-medium mt-1">v{activeDoc.version}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Requires Acceptance</p>
                <p className="font-medium mt-1">{activeDoc.requiresAcceptance ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Effective Date</p>
                <p className="font-medium mt-1">{new Date(activeDoc.effectiveDate).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Editor Dialog */}
      <Dialog open={showEditor} onOpenChange={setShowEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {editingDocument?.id ? 'Edit' : 'Create'} {DOCUMENT_TYPE_LABELS[selectedType]}
            </DialogTitle>
            <DialogDescription>
              {editingDocument?.id 
                ? `Creating a new version (will become v${(editingDocument.version || 0) + 1})`
                : 'Create the first version of this document'
              }
            </DialogDescription>
          </DialogHeader>

          {saveStatus === 'saved' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                Document saved successfully!
              </AlertDescription>
            </Alert>
          )}

          {saveStatus === 'error' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to save document. Please try again.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Document Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter document title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="content">Document Content (Markdown)</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Enter document content in Markdown format"
                className="mt-1 min-h-[400px] font-mono text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use Markdown syntax: # for headings, ** for bold, * for italic, - for lists
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="effectiveDate">Effective Date</Label>
                <Input
                  id="effectiveDate"
                  type="date"
                  value={formData.effectiveDate}
                  onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="flex items-center space-x-2 mt-6">
                <Switch
                  id="requiresAcceptance"
                  checked={formData.requiresAcceptance}
                  onCheckedChange={(checked) => setFormData({ ...formData, requiresAcceptance: checked })}
                />
                <Label htmlFor="requiresAcceptance" className="cursor-pointer">
                  Require user acceptance
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditor(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saveStatus === 'saving'}>
              <Save className="h-4 w-4 mr-2" />
              {saveStatus === 'saving' ? 'Saving...' : 'Save Document'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{activeDoc?.title}</DialogTitle>
            <DialogDescription>
              Version {activeDoc?.version} • Last updated {activeDoc && new Date(activeDoc.updatedAt).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="prose max-w-none py-4">
            <div dangerouslySetInnerHTML={{ __html: activeDoc?.content.replace(/\n/g, '<br />') || '' }} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={showHistory} onOpenChange={setShowHistory}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Version History - {DOCUMENT_TYPE_LABELS[selectedType]}</DialogTitle>
            <DialogDescription>
              View and manage all versions of this document
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            {versionHistory.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">Version {doc.version}</h4>
                        {doc.isActive && <Badge variant="default">Active</Badge>}
                      </div>
                      <p className="text-sm text-gray-600">{doc.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created {new Date(doc.createdAt).toLocaleString()} • 
                        Effective {new Date(doc.effectiveDate).toLocaleDateString()}
                      </p>
                    </div>
                    {!doc.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleActivateVersion(doc.id)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Activate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
