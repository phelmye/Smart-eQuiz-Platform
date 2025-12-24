import { useState, useEffect } from 'react';
import { AlertTriangle, Database, Trash2, RefreshCw, Check, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';
import { api } from '../lib/api';

interface SampleDataStatus {
  hasSampleData: boolean;
  counts: {
    tenants: number;
    supportTickets: number;
    users: number;
    auditLogs: number;
    blogPosts: number;
    total: number;
  };
}

export function SampleDataManager() {
  const [status, setStatus] = useState<SampleDataStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const { toast } = useToast();

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await api.get<SampleDataStatus>('/admin/sample-data/status');
      setStatus(data);
    } catch (error) {
      console.error('Failed to fetch sample data status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleSeed = async () => {
    if (!confirm('This will add sample data to your database. Continue?')) {
      return;
    }

    try {
      setActing(true);
      await api.post('/admin/sample-data/seed', {});
      toast({
        title: 'Sample Data Seeded',
        description: 'Demo tenants, users, and activities have been added.',
      });
      await fetchStatus();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Seeding Failed',
        description: error.response?.data?.message || 'Failed to seed sample data',
      });
    } finally {
      setActing(false);
    }
  };

  const handleClear = async () => {
    if (!confirm('This will permanently delete all sample data. This cannot be undone. Continue?')) {
      return;
    }

    try {
      setActing(true);
      const result = await api.delete('/admin/sample-data');
      toast({
        title: 'Sample Data Cleared',
        description: `Removed ${result.tenants} tenants, ${result.users} users, ${result.auditLogs} logs.`,
      });
      await fetchStatus();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Clear Failed',
        description: error.response?.data?.message || 'Failed to clear sample data',
      });
    } finally {
      setActing(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Sample Data Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-500">Loading status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5" />
          Sample Data Management
        </CardTitle>
        <CardDescription>
          Seed your database with demo data for testing, or clear it when you have real data.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              {status?.hasSampleData ? (
                <>
                  <Check className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Sample Data Active</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {status.counts.total} records
                  </Badge>
                </>
              ) : (
                <>
                  <X className="w-5 h-5 text-gray-400" />
                  <span className="font-medium text-gray-600">No Sample Data</span>
                  <Badge variant="outline" className="bg-gray-50 text-gray-600">
                    Using real data only
                  </Badge>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchStatus}
              disabled={acting}
            >
              <RefreshCw className={`w-4 h-4 ${acting ? 'animate-spin' : ''}`} />
            </Button>
          </div>

          {/* Sample Data Breakdown */}
          {status?.hasSampleData && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">{status.counts.tenants}</p>
                <p className="text-xs text-gray-600">Tenants</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-purple-600">{status.counts.users}</p>
                <p className="text-xs text-gray-600">Users</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{status.counts.supportTickets}</p>
                <p className="text-xs text-gray-600">Tickets</p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">{status.counts.auditLogs}</p>
                <p className="text-xs text-gray-600">Audit Logs</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-orange-600">{status.counts.blogPosts}</p>
                <p className="text-xs text-gray-600">Blog Posts</p>
              </div>
            </div>
          )}

          {/* Warning Box */}
          <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-1">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1 text-xs">
                <li>Sample data is marked with <code className="bg-yellow-100 px-1 rounded">isSample: true</code> flag</li>
                <li>Real data added by users is never affected by clearing</li>
                <li>Sample data helps demonstrate features to new users</li>
                <li>Clear sample data once you have sufficient real data</li>
              </ul>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {!status?.hasSampleData ? (
              <Button
                onClick={handleSeed}
                disabled={acting}
                className="flex-1"
              >
                <Database className="w-4 h-4 mr-2" />
                Seed Sample Data
              </Button>
            ) : (
              <Button
                onClick={handleClear}
                disabled={acting}
                variant="destructive"
                className="flex-1"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Sample Data
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
