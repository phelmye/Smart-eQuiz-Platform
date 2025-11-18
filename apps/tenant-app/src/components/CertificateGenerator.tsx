import React, { useState } from 'react';
import { Award, Download, Printer, Mail, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PrizeAward, Tournament, User, mockTournaments, storage, STORAGE_KEYS } from '@/lib/mockData';

interface CertificateGeneratorProps {
  award: PrizeAward;
  type?: 'winner' | 'participation';
  userId?: string; // For participation certificates
}

export const CertificateGenerator: React.FC<CertificateGeneratorProps> = ({
  award,
  type = 'winner',
  userId
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const getTournament = (): Tournament | null => {
    return mockTournaments.find(t => t.id === award.tournamentId) || null;
  };

  const getUser = (): User | null => {
    if (!userId) return null;
    const users = storage.get(STORAGE_KEYS.USERS) || [];
    return users.find((u: User) => u.id === userId) || null;
  };

  const tournament = getTournament();
  const user = getUser();

  const handleDownload = () => {
    // In production, this would generate a PDF
    alert('Certificate download will be implemented with PDF generation library');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    alert(`Certificate will be emailed to ${award.winnerEmail || user?.email}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Certificate Preview</DialogTitle>
              <DialogDescription>
                {type === 'winner' ? 'Winner' : 'Participation'} Certificate
              </DialogDescription>
            </DialogHeader>
            <CertificatePreview award={award} tournament={tournament} type={type} />
          </DialogContent>
        </Dialog>

        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>

        <Button variant="outline" size="sm" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print
        </Button>

        <Button variant="outline" size="sm" onClick={handleEmail}>
          <Mail className="h-4 w-4 mr-2" />
          Email
        </Button>
      </div>
    </div>
  );
};

// Certificate Preview Component
const CertificatePreview: React.FC<{
  award: PrizeAward;
  tournament: Tournament | null;
  type: 'winner' | 'participation';
}> = ({ award, tournament, type }) => {
  const getMedalEmoji = (position: number): string => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return '🏅';
  };

  return (
    <div className="certificate-container bg-white p-8 rounded-lg border-8 border-double border-yellow-600">
      {/* Decorative Header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{type === 'winner' ? getMedalEmoji(award.position) : '🎓'}</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2" style={{ fontFamily: 'serif' }}>
          Certificate of {type === 'winner' ? 'Achievement' : 'Participation'}
        </h1>
        <div className="w-32 h-1 bg-yellow-600 mx-auto"></div>
      </div>

      {/* Certificate Body */}
      <div className="text-center space-y-6 mb-8">
        <p className="text-lg text-gray-600">This certificate is proudly presented to</p>
        
        <h2 className="text-5xl font-bold text-gray-900 my-6" style={{ fontFamily: 'serif' }}>
          {award.winnerName}
        </h2>

        {type === 'winner' ? (
          <>
            <p className="text-xl text-gray-700">
              For achieving <span className="font-bold text-yellow-700">{award.positionLabel}</span>
            </p>
            <p className="text-xl text-gray-700">
              in the
            </p>
            <h3 className="text-2xl font-bold text-gray-800">
              {tournament?.name || 'Tournament'}
            </h3>
            {award.prizeCategory && award.prizeCategory !== 'Overall' && (
              <p className="text-lg text-gray-600">
                Category: <span className="font-semibold">{award.prizeCategory}</span>
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-xl text-gray-700">
              For successfully participating in the
            </p>
            <h3 className="text-2xl font-bold text-gray-800">
              {tournament?.name || 'Tournament'}
            </h3>
            <p className="text-lg text-gray-600">
              Demonstrating dedication and commitment to excellence
            </p>
          </>
        )}
      </div>

      {/* Prizes (for winner certificates) */}
      {type === 'winner' && award.prizes.length > 0 && (
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-center font-semibold text-gray-700 mb-2">Prizes Awarded:</p>
          <div className="flex flex-wrap justify-center gap-3">
            {award.prizes.map((prize, i) => (
              <div key={i} className="bg-white px-4 py-2 rounded-full border border-yellow-300">
                <span className="text-sm font-medium">{prize.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Date and Signatures */}
      <div className="grid grid-cols-2 gap-8 mt-12">
        <div className="text-center">
          <div className="border-t-2 border-gray-400 pt-2">
            <p className="font-semibold text-gray-700">Date</p>
            <p className="text-gray-600">
              {new Date(award.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
        <div className="text-center">
          <div className="border-t-2 border-gray-400 pt-2">
            <p className="font-semibold text-gray-700">Authorized Signature</p>
            <p className="text-gray-600 italic">Tournament Administrator</p>
          </div>
        </div>
      </div>

      {/* Sponsor (if applicable) */}
      {award.sponsor && (
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Sponsored by <span className="font-semibold">{award.sponsor.sponsorName}</span></p>
        </div>
      )}

      {/* Certificate ID */}
      <div className="mt-8 text-center text-xs text-gray-400">
        <p>Certificate ID: {award.id}</p>
      </div>
    </div>
  );
};

// Bulk Certificate Generator
export const BulkCertificateGenerator: React.FC<{
  awards: PrizeAward[];
  tournamentId: string;
}> = ({ awards, tournamentId }) => {
  const [generating, setGenerating] = useState(false);

  const handleGenerateAll = async () => {
    setGenerating(true);
    // Simulate generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerating(false);
    alert(`Generated ${awards.length} certificates!`);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Award className="h-5 w-5" />
              Bulk Certificate Generation
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Generate certificates for {awards.length} winner(s)
            </p>
          </div>
          <Button onClick={handleGenerateAll} disabled={generating}>
            {generating ? (
              <>Generating...</>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Generate All
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CertificateGenerator;
