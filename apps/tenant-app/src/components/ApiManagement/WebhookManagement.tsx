/**
 * Webhook Management Component
 * 
 * Allows tenants to:
 * - Register webhooks to receive event notifications
 * - Configure which events to subscribe to
 * - View webhook delivery logs
 * - Test webhook endpoints
 * - Retry failed deliveries
 */

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Webhook as WebhookIcon,
  Plus,
  Trash2,
  Play,
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Copy,
  Eye,
  ExternalLink
} from 'lucide-react';
import {
  apiManagementClient,
  type Webhook,
  type WebhookDelivery,
  type CreateWebhookDto,
  type WebhookEvent
} from '@/lib/apiManagementClient';

const WEBHOOK_EVENTS: Array<{ value: WebhookEvent; label: string; description: string; category: string }> = [
  { value: 'USER_CREATED', label: 'User Created', description: 'New user account created', category: 'Users' },
  { value: 'USER_UPDATED', label: 'User Updated', description: 'User profile updated', category: 'Users' },
  { value: 'USER_DELETED', label: 'User Deleted', description: 'User account deleted', category: 'Users' },
  { value: 'TOURNAMENT_CREATED', label: 'Tournament Created', description: 'New tournament created', category: 'Tournaments' },
  { value: 'TOURNAMENT_STARTED', label: 'Tournament Started', description: 'Tournament has begun', category: 'Tournaments' },
  { value: 'TOURNAMENT_COMPLETED', label: 'Tournament Completed', description: 'Tournament finished', category: 'Tournaments' },
  { value: 'TOURNAMENT_CANCELLED', label: 'Tournament Cancelled', description: 'Tournament was cancelled', category: 'Tournaments' },
  { value: 'MATCH_STARTED', label: 'Match Started', description: 'A match has started', category: 'Matches' },
  { value: 'MATCH_COMPLETED', label: 'Match Completed', description: 'A match has ended', category: 'Matches' },
  { value: 'PAYMENT_SUCCEEDED', label: 'Payment Succeeded', description: 'Payment processed successfully', category: 'Payments' },
  { value: 'PAYMENT_FAILED', label: 'Payment Failed', description: 'Payment failed', category: 'Payments' },
  { value: 'QUESTION_CREATED', label: 'Question Created', description: 'New question added', category: 'Questions' },
  { value: 'QUESTION_UPDATED', label: 'Question Updated', description: 'Question modified', category: 'Questions' },
  { value: 'TICKET_CREATED', label: 'Support Ticket Created', description: 'New support ticket opened', category: 'Support' },
  { value: 'TICKET_RESOLVED', label: 'Support Ticket Resolved', description: 'Support ticket resolved', category: 'Support' },
  { value: 'TICKET_ESCALATED', label: 'Support Ticket Escalated', description: 'Support ticket escalated', category: 'Support' },
];

export default function WebhookManagement() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialog, setCreateDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; webhook: Webhook | null }>({
    open: false,
    webhook: null
  });
  const [deliveriesDialog, setDeliveriesDialog] = useState<{ open: boolean; webhook: Webhook | null }>({
    open: false,
    webhook: null
  });
  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([]);
  const [formData, setFormData] = useState<CreateWebhookDto>({
    url: '',
    description: '',
    events: [],
    retryAttempts: 3,
    timeout: 30000
  });

  useEffect(() => {
    loadWebhooks();
  }, []);

  const loadWebhooks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiManagementClient.listWebhooks();
      setWebhooks(data);
    } catch (err) {
      console.error('Failed to load webhooks:', err);
      setError(err instanceof Error ? err.message : 'Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.url || formData.events.length === 0) {
      alert('Please provide URL and select at least one event');
      return;
    }

    try {
      await apiManagementClient.createWebhook(formData);
      await loadWebhooks();
      setCreateDialog(false);
      setFormData({
        url: '',
        description: '',
        events: [],
        retryAttempts: 3,
        timeout: 30000
      });
      console.log('Webhook created successfully');
    } catch (err) {
      console.error('Failed to create webhook:', err);
      alert('Failed to create webhook');
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.webhook) return;

    try {
      await apiManagementClient.deleteWebhook(deleteDialog.webhook.id);
      await loadWebhooks();
      setDeleteDialog({ open: false, webhook: null });
      console.log('Webhook deleted successfully');
    } catch (err) {
      console.error('Failed to delete webhook:', err);
      alert('Failed to delete webhook');
    }
  };

  const handleTest = async (webhook: Webhook) => {
    try {
      await apiManagementClient.testWebhook(webhook.id);
      console.log('Test webhook sent successfully');
      alert(`Test event sent to ${webhook.url}`);
    } catch (err) {
      console.error('Failed to test webhook:', err);
      alert('Failed to send test webhook');
    }
  };

  const loadDeliveries = async (webhook: Webhook) => {
    try {
      const data = await apiManagementClient.getWebhookDeliveries(webhook.id);
      setDeliveries(data);
      setDeliveriesDialog({ open: true, webhook });
    } catch (err) {
      console.error('Failed to load deliveries:', err);
      alert('Failed to load delivery logs');
    }
  };

  const handleEventToggle = (event: WebhookEvent, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      events: checked
        ? [...prev.events, event]
        : prev.events.filter(e => e !== event)
    }));
  };

  const getStatusBadge = (webhook: Webhook) => {
    if (webhook.status === 'ACTIVE') {
      return <Badge variant="success">Active</Badge>;
    }
    if (webhook.status === 'PAUSED') {
      return <Badge variant="secondary">Paused</Badge>;
    }
    return <Badge variant="destructive">Failed</Badge>;
  };

  const getDeliveryStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <Badge variant="success" className="flex items-center gap-1">
          <CheckCircle className="w-3 h-3" />
          Success
        </Badge>;
      case 'FAILED':
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="w-3 h-3" />
          Failed
        </Badge>;
      case 'RETRYING':
        return <Badge variant="warning" className="flex items-center gap-1">
          <RefreshCw className="w-3 h-3" />
          Retrying
        </Badge>;
      default:
        return <Badge variant="secondary" className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Pending
        </Badge>;
    }
  };

  const formatDate = (date?: Date | string) => {
    if (!date) return 'Never';
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  };

  const groupEventsByCategory = () => {
    const grouped: Record<string, typeof WEBHOOK_EVENTS> = {};
    WEBHOOK_EVENTS.forEach(event => {
      if (!grouped[event.category]) {
        grouped[event.category] = [];
      }
      grouped[event.category].push(event);
    });
    return grouped;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400 mr-2" />
            <span className="text-gray-600">Loading webhooks...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Webhooks</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadWebhooks}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const eventGroups = groupEventsByCategory();

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <WebhookIcon className="w-5 h-5" />
                  Webhooks
                </CardTitle>
                <CardDescription>
                  Receive real-time notifications about events in your account
                </CardDescription>
              </div>
              <Button onClick={() => setCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Webhook
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {webhooks.length === 0 ? (
              <div className="text-center py-12">
                <WebhookIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Webhooks Configured
                </h3>
                <p className="text-gray-600 mb-4">
                  Set up webhooks to receive real-time event notifications
                </p>
                <Button onClick={() => setCreateDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Webhook
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>URL</TableHead>
                    <TableHead>Events</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Delivery</TableHead>
                    <TableHead>Failures</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {webhook.url}
                            </code>
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          </div>
                          {webhook.description && (
                            <div className="text-sm text-gray-500 mt-1">{webhook.description}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {webhook.events.slice(0, 2).map((event) => (
                            <Badge key={event} variant="outline" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                          {webhook.events.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{webhook.events.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(webhook)}</TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(webhook.lastDeliveryAt)}
                      </TableCell>
                      <TableCell>
                        {webhook.consecutiveFailures > 0 && (
                          <Badge variant="destructive">
                            {webhook.consecutiveFailures} failures
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTest(webhook)}
                            title="Test Webhook"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => loadDeliveries(webhook)}
                            title="View Deliveries"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteDialog({ open: true, webhook })}
                            title="Delete Webhook"
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
      </div>

      {/* Create Webhook Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Webhook</DialogTitle>
            <DialogDescription>
              Configure a webhook endpoint to receive event notifications
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="url">Webhook URL *</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://your-app.com/api/webhooks"
                value={formData.url}
                onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              />
              <p className="text-xs text-gray-500 mt-1">
                HTTPS endpoint that will receive POST requests with event data
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="e.g., Production webhook for user events"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="retryAttempts">Retry Attempts</Label>
                <Input
                  id="retryAttempts"
                  type="number"
                  min={0}
                  max={5}
                  value={formData.retryAttempts}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    retryAttempts: parseInt(e.target.value) 
                  }))}
                />
              </div>
              <div>
                <Label htmlFor="timeout">Timeout (ms)</Label>
                <Input
                  id="timeout"
                  type="number"
                  min={5000}
                  max={60000}
                  step={1000}
                  value={formData.timeout}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    timeout: parseInt(e.target.value) 
                  }))}
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Events to Subscribe *</Label>
              <p className="text-sm text-gray-600 mb-3">
                Select which events will trigger this webhook
              </p>
              
              <div className="space-y-4">
                {Object.entries(eventGroups).map(([category, events]) => (
                  <Card key={category} className="p-4">
                    <h4 className="font-semibold text-sm mb-3">{category}</h4>
                    <div className="space-y-2">
                      {events.map((event) => (
                        <div key={event.value} className="flex items-start gap-3">
                          <Checkbox
                            id={event.value}
                            checked={formData.events.includes(event.value)}
                            onCheckedChange={(checked) => 
                              handleEventToggle(event.value, checked as boolean)
                            }
                          />
                          <div className="flex-1">
                            <Label htmlFor={event.value} className="text-sm font-medium cursor-pointer">
                              {event.label}
                            </Label>
                            <p className="text-xs text-gray-500">{event.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Create Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, webhook: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Webhook</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this webhook? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {deleteDialog.webhook && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <code className="text-sm">{deleteDialog.webhook.url}</code>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, webhook: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Webhook
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Logs Dialog */}
      <Dialog 
        open={deliveriesDialog.open} 
        onOpenChange={(open) => setDeliveriesDialog({ open, webhook: null })}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Webhook Delivery Logs</DialogTitle>
            <DialogDescription>
              {deliveriesDialog.webhook?.url}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {deliveries.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No deliveries yet
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Event</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Attempts</TableHead>
                    <TableHead>Response</TableHead>
                    <TableHead>Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deliveries.map((delivery) => (
                    <TableRow key={delivery.id}>
                      <TableCell>
                        <Badge variant="outline">{delivery.eventType}</Badge>
                      </TableCell>
                      <TableCell>{getDeliveryStatusBadge(delivery.status)}</TableCell>
                      <TableCell>{delivery.attempts}</TableCell>
                      <TableCell>
                        {delivery.responseStatus && (
                          <Badge variant={delivery.responseStatus < 300 ? 'success' : 'destructive'}>
                            {delivery.responseStatus}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(delivery.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
