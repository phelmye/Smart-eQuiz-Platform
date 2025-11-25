/**
 * API Keys List Component
 * 
 * Displays and manages tenant-generated API keys for accessing their data via REST API.
 * 
 * IMPORTANT: This is completely separate from platform-admin/ApiKeys.tsx which manages
 * third-party service keys (Stripe, OpenAI, etc.). This component handles API keys that
 * TENANTS create to allow external applications to access THEIR tenant data.
 */

import { useState, useEffect } from 'react';
import {
  Key,
  Plus,
  Eye,
  EyeOff,
  Copy,
  Trash2,
  Ban,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  apiManagementClient,
  type ApiKey,
  type ApiKeyType,
  API_SCOPES,
  getScopeDisplayName,
  getScopeDescription
} from '@/lib/apiManagementClient';

interface ApiKeysListProps {
  onCreateClick: () => void;
}

export default function ApiKeysList({ onCreateClick }: ApiKeysListProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [showSecret, setShowSecret] = useState<{ [keyId: string]: boolean }>({});
  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; key: ApiKey | null }>({
    open: false,
    key: null
  });
  const [revokeReason, setRevokeReason] = useState('');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; key: ApiKey | null }>({
    open: false,
    key: null
  });

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      setError(null);
      const keys = await apiManagementClient.listApiKeys();
      setApiKeys(keys);
    } catch (err) {
      console.error('Failed to load API keys:', err);
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = (keyPrefix: string) => {
    navigator.clipboard.writeText(keyPrefix);
    // TODO: Show toast notification
    console.log('API key prefix copied to clipboard');
  };

  const toggleShowSecret = (keyId: string) => {
    setShowSecret(prev => ({
      ...prev,
      [keyId]: !prev[keyId]
    }));
  };

  const handleRevoke = async () => {
    if (!revokeDialog.key || !revokeReason.trim()) return;

    try {
      await apiManagementClient.revokeApiKey(revokeDialog.key.id, {
        reason: revokeReason
      });
      
      // Reload keys
      await loadApiKeys();
      
      // Close dialog
      setRevokeDialog({ open: false, key: null });
      setRevokeReason('');
      
      // TODO: Show success toast
      console.log('API key revoked successfully');
    } catch (err) {
      console.error('Failed to revoke API key:', err);
      // TODO: Show error toast
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.key) return;

    try {
      await apiManagementClient.deleteApiKey(deleteDialog.key.id);
      
      // Reload keys
      await loadApiKeys();
      
      // Close dialog
      setDeleteDialog({ open: false, key: null });
      
      // TODO: Show success toast
      console.log('API key deleted successfully');
    } catch (err) {
      console.error('Failed to delete API key:', err);
      // TODO: Show error toast
    }
  };

  const getStatusBadge = (key: ApiKey) => {
    if (key.status === 'REVOKED') {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <Ban className="w-3 h-3" />
        Revoked
      </Badge>;
    }
    
    if (key.status === 'EXPIRED') {
      return <Badge variant="secondary" className="flex items-center gap-1">
        <Clock className="w-3 h-3" />
        Expired
      </Badge>;
    }

    if (key.expiresAt && new Date(key.expiresAt) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) {
      return <Badge variant="warning" className="flex items-center gap-1">
        <AlertTriangle className="w-3 h-3" />
        Expiring Soon
      </Badge>;
    }
    
    return <Badge variant="success" className="flex items-center gap-1">
      <CheckCircle className="w-3 h-3" />
      Active
    </Badge>;
  };

  const getTypeBadge = (type: ApiKeyType) => {
    const variants: Record<ApiKeyType, 'default' | 'secondary' | 'outline'> = {
      PUBLIC: 'outline',
      SECRET: 'default',
      TEST: 'secondary'
    };

    return <Badge variant={variants[type]}>{type}</Badge>;
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return 'Never';
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            <span className="ml-2 text-gray-600">Loading API keys...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load API Keys</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadApiKeys}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                API Keys
              </CardTitle>
              <CardDescription>
                Manage API keys for accessing your tenant data programmatically
              </CardDescription>
            </div>
            <Button onClick={onCreateClick}>
              <Plus className="w-4 h-4 mr-2" />
              Create API Key
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No API Keys Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Create your first API key to start accessing your data via REST API
              </p>
              <Button onClick={onCreateClick}>
                <Plus className="w-4 h-4 mr-2" />
                Create Your First API Key
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key Prefix</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scopes</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div>{key.name}</div>
                        {key.description && (
                          <div className="text-sm text-gray-500">{key.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {showSecret[key.id] ? key.keyPrefix : key.keyPrefix.slice(0, 20) + '...'}
                        </code>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleShowSecret(key.id)}
                        >
                          {showSecret[key.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyKey(key.keyPrefix)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(key.type)}</TableCell>
                    <TableCell>{getStatusBadge(key)}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {key.scopes.slice(0, 3).map((scope) => (
                          <Badge key={scope} variant="outline" className="text-xs">
                            {scope}
                          </Badge>
                        ))}
                        {key.scopes.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{key.scopes.length - 3}
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(key.lastUsedAt)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(key.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedKey(key)}
                          title="View Details"
                        >
                          <Activity className="w-4 h-4" />
                        </Button>
                        {key.status === 'ACTIVE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRevokeDialog({ open: true, key })}
                            title="Revoke Key"
                          >
                            <Ban className="w-4 h-4 text-orange-600" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteDialog({ open: true, key })}
                          title="Delete Key"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Revoke Dialog */}
      <Dialog open={revokeDialog.open} onOpenChange={(open) => setRevokeDialog({ open, key: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke API Key</DialogTitle>
            <DialogDescription>
              This will immediately revoke the API key "{revokeDialog.key?.name}". 
              Any applications using this key will lose access.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="revoke-reason">Reason for Revocation</Label>
              <Textarea
                id="revoke-reason"
                placeholder="e.g., Security concern, key compromised, no longer needed..."
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRevokeDialog({ open: false, key: null });
                setRevokeReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRevoke}
              disabled={!revokeReason.trim()}
            >
              <Ban className="w-4 h-4 mr-2" />
              Revoke Key
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, key: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete API Key</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently delete the API key "{deleteDialog.key?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-800">
                <p className="font-semibold mb-1">Warning</p>
                <p>
                  Deleting this key will permanently remove all associated logs and usage data.
                  If you only want to prevent further use, consider revoking instead.
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, key: null })}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
