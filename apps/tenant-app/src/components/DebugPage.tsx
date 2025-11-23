import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface DebugPageProps {
  onBack: () => void;
}

export const DebugPage: React.FC<DebugPageProps> = ({ onBack }) => {
  const [debugInfo, setDebugInfo] = React.useState({
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    location: window.location.href,
    reactVersion: React.version
  });

  const testLazyImport = async () => {
    try {
      console.log('Testing QuestionBank lazy import...');
      const module = await import('@/components/QuestionBank');
      console.log('QuestionBank module loaded successfully:', module);
      setDebugInfo(prev => ({ ...prev, questionBankTest: 'Success' }));
    } catch (error) {
      console.error('Failed to load QuestionBank:', error);
      setDebugInfo(prev => ({ ...prev, questionBankTest: `Error: ${error.message}` }));
    }
  };

  const testUserManagementImport = async () => {
    try {
      console.log('Testing UserManagement lazy import...');
      const module = await import('@/components/UserManagement');
      console.log('UserManagement module loaded successfully:', module);
      setDebugInfo(prev => ({ ...prev, userManagementTest: 'Success' }));
    } catch (error) {
      console.error('Failed to load UserManagement:', error);
      setDebugInfo(prev => ({ ...prev, userManagementTest: `Error: ${error.message}` }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Environment Information</h3>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(debugInfo, null, 2)}
                </pre>
              </div>
              
              <div className="flex space-x-4">
                <Button onClick={testLazyImport}>Test QuestionBank Import</Button>
                <Button onClick={testUserManagementImport}>Test UserManagement Import</Button>
                <Button variant="outline" onClick={onBack}>Back</Button>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Console Log Instructions</h3>
                <p className="text-sm text-gray-600">
                  Open browser Developer Tools (F12) and check the Console tab for error messages.
                  Click the test buttons above to manually test component imports.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DebugPage;