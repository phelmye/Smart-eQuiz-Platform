import { useState, useEffect } from 'react';

export enum LegalDocumentType {
  TERMS_OF_SERVICE = 'TERMS_OF_SERVICE',
  PRIVACY_POLICY = 'PRIVACY_POLICY',
  COOKIE_POLICY = 'COOKIE_POLICY',
  ACCEPTABLE_USE_POLICY = 'ACCEPTABLE_USE_POLICY',
  DATA_PROCESSING_AGREEMENT = 'DATA_PROCESSING_AGREEMENT',
  SERVICE_LEVEL_AGREEMENT = 'SERVICE_LEVEL_AGREEMENT',
}

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
  createdAt: string;
  updatedAt: string;
}

export const useLegalDocument = (type: LegalDocumentType, tenantId?: string) => {
  const [document, setDocument] = useState<LegalDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true);
      setError(null);

      try {
        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        // Add auth token if available
        const token = localStorage.getItem('accessToken');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        // Add tenant ID if available
        if (tenantId) {
          headers['X-Tenant-Id'] = tenantId;
        }

        const response = await fetch(`/api/legal-documents/active/${type}`, {
          headers,
        });

        if (response.ok) {
          const data = await response.json();
          setDocument(data);
        } else if (response.status === 404) {
          // No document found - use fallback
          setDocument(null);
        } else {
          throw new Error('Failed to fetch legal document');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setDocument(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [type, tenantId]);

  return { document, loading, error };
};

export const acceptLegalDocument = async (documentId: string, version: number): Promise<boolean> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch('/api/legal-documents/accept', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        documentId,
        documentVersion: version,
        ipAddress: window.location.hostname, // In production, get from server
        userAgent: navigator.userAgent,
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Failed to accept document:', error);
    return false;
  }
};

export const checkAcceptanceStatus = async (tenantId: string): Promise<{
  hasAcceptedAll: boolean;
  pendingDocuments: Array<{ id: string; type: string; title: string; version: number }>;
}> => {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      return { hasAcceptedAll: true, pendingDocuments: [] };
    }

    const response = await fetch('/api/legal-documents/my-acceptances', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Tenant-Id': tenantId,
      },
    });

    if (response.ok) {
      return await response.json();
    }

    return { hasAcceptedAll: true, pendingDocuments: [] };
  } catch (error) {
    console.error('Failed to check acceptance status:', error);
    return { hasAcceptedAll: true, pendingDocuments: [] };
  }
};
