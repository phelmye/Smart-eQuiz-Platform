import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DiagnosticProps {
  componentName: string;
  error?: string;
}

export const Diagnostic: React.FC<DiagnosticProps> = ({ componentName, error }) => {
  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle className="text-blue-600">Diagnostic: {componentName}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p><strong>Status:</strong> {error ? 'Error' : 'Loaded Successfully'}</p>
          <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
          {error && (
            <div className="bg-red-50 p-3 rounded border border-red-200">
              <p className="text-red-700"><strong>Error:</strong> {error}</p>
            </div>
          )}
          <div className="bg-green-50 p-3 rounded border border-green-200">
            <p className="text-green-700">Component is rendering correctly!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Diagnostic;