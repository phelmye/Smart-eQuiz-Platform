import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { checkAcceptanceStatus, acceptLegalDocument, LegalDocumentType, useLegalDocument } from '@/hooks/useLegalDocument';
import ReactMarkdown from 'react-markdown';

interface PendingDocument {
  id: string;
  type: LegalDocumentType;
  title: string;
  version: number;
}

interface LegalAcceptanceModalProps {
  tenantId: string;
  userId: string;
  onAccepted: () => void;
}

export const LegalAcceptanceModal: React.FC<LegalAcceptanceModalProps> = ({
  tenantId,
  userId,
  onAccepted,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingDocuments, setPendingDocuments] = useState<PendingDocument[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [acceptances, setAcceptances] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentDoc = pendingDocuments[currentIndex];
  const { document, loading } = useLegalDocument(
    currentDoc?.type as LegalDocumentType,
    tenantId
  );

  useEffect(() => {
    checkPendingDocuments();
  }, [tenantId, userId]);

  const checkPendingDocuments = async () => {
    try {
      const status = await checkAcceptanceStatus(tenantId);
      
      if (!status.hasAcceptedAll && status.pendingDocuments.length > 0) {
        setPendingDocuments(status.pendingDocuments);
        setIsOpen(true);
      }
    } catch (error) {
      console.error('Failed to check acceptance status:', error);
    }
  };

  const handleAcceptCurrent = () => {
    if (currentDoc) {
      setAcceptances({
        ...acceptances,
        [currentDoc.id]: true,
      });
    }
  };

  const handleNext = () => {
    if (currentIndex < pendingDocuments.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmitAll = async () => {
    setSubmitting(true);
    setError(null);

    try {
      // Accept all documents that were checked
      const acceptPromises = pendingDocuments
        .filter(doc => acceptances[doc.id])
        .map(doc => acceptLegalDocument(doc.id, doc.version));

      const results = await Promise.all(acceptPromises);
      
      const allSucceeded = results.every(result => result === true);

      if (allSucceeded) {
        setIsOpen(false);
        onAccepted();
      } else {
        setError('Some documents could not be accepted. Please try again.');
      }
    } catch (err) {
      setError('Failed to accept documents. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const allAccepted = pendingDocuments.every(doc => acceptances[doc.id]);
  const currentAccepted = currentDoc && acceptances[currentDoc.id];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      // Prevent closing without accepting
      if (!open && !allAccepted) {
        setError('You must accept all required documents to continue.');
        return;
      }
      setIsOpen(open);
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh]" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Action Required: Legal Documents
          </DialogTitle>
          <DialogDescription>
            Please review and accept the following legal documents to continue using the service.
            Document {currentIndex + 1} of {pendingDocuments.length}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Progress indicators */}
        <div className="flex gap-2 justify-center">
          {pendingDocuments.map((doc, index) => (
            <div
              key={doc.id}
              className={`h-2 flex-1 rounded-full ${
                index === currentIndex
                  ? 'bg-blue-600'
                  : acceptances[doc.id]
                  ? 'bg-green-500'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {currentDoc && (
          <div className="space-y-4">
            {/* Document header */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold">{currentDoc.title}</h3>
                <p className="text-sm text-gray-600">Version {currentDoc.version}</p>
              </div>
              {currentAccepted && (
                <Badge variant="default" className="bg-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Accepted
                </Badge>
              )}
            </div>

            {/* Document content */}
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            ) : document ? (
              <ScrollArea className="h-[400px] border rounded-lg p-4">
                <div className="prose max-w-none prose-sm">
                  <ReactMarkdown>{document.content}</ReactMarkdown>
                </div>
              </ScrollArea>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Unable to load document content. Please contact support.
                </AlertDescription>
              </Alert>
            )}

            {/* Acceptance checkbox */}
            <div className="flex items-start space-x-3 p-4 border rounded-lg bg-blue-50">
              <Checkbox
                id={`accept-${currentDoc.id}`}
                checked={currentAccepted || false}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handleAcceptCurrent();
                  } else {
                    const newAcceptances = { ...acceptances };
                    delete newAcceptances[currentDoc.id];
                    setAcceptances(newAcceptances);
                  }
                }}
                className="mt-1"
              />
              <Label
                htmlFor={`accept-${currentDoc.id}`}
                className="text-sm font-medium leading-relaxed cursor-pointer"
              >
                I have read and agree to the {currentDoc.title}
              </Label>
            </div>
          </div>
        )}

        <DialogFooter className="flex justify-between">
          <div>
            {currentIndex > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {currentIndex < pendingDocuments.length - 1 ? (
              <Button onClick={handleNext} disabled={!currentAccepted}>
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmitAll}
                disabled={!allAccepted || submitting}
                className="bg-green-600 hover:bg-green-700"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accept All & Continue
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Helper component to integrate into app
function Label({ htmlFor, className, children }: { htmlFor: string; className?: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  );
}
