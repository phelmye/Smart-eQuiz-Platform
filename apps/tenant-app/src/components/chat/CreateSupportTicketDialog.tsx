import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { chatApi } from '@/lib/chatApi';

interface CreateSupportTicketDialogProps {
  onTicketCreated?: () => void;
  trigger?: React.ReactNode;
}

export const CreateSupportTicketDialog: React.FC<CreateSupportTicketDialogProps> = ({
  onTicketCreated,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'TECHNICAL',
    priority: 'MEDIUM',
    initialMessage: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      
      // Create support channel
      await chatApi.createChannel({
        type: 'SUPPORT',
        participantIds: [], // Will be assigned by backend
        subject: formData.subject,
        category: formData.category,
        priority: formData.priority
      });

      // Send initial message if provided
      // (This would happen after channel creation in the callback)

      setOpen(false);
      setFormData({
        subject: '',
        category: 'TECHNICAL',
        priority: 'MEDIUM',
        initialMessage: ''
      });
      
      if (onTicketCreated) {
        onTicketCreated();
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
      alert('Failed to create support ticket. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <HelpCircle className="h-4 w-4 mr-2" />
            New Support Ticket
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Support Ticket</DialogTitle>
            <DialogDescription>
              Describe your issue and we'll help you resolve it.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                placeholder="Brief description of your issue"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    setFormData({ ...formData, category: value })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TECHNICAL">Technical Issue</SelectItem>
                    <SelectItem value="BILLING">Billing</SelectItem>
                    <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
                    <SelectItem value="TOURNAMENT_ISSUE">Tournament Issue</SelectItem>
                    <SelectItem value="QUESTION_ISSUE">Question Issue</SelectItem>
                    <SelectItem value="ACCOUNT_ACCESS">Account Access</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">Initial Message (Optional)</Label>
              <Textarea
                id="message"
                value={formData.initialMessage}
                onChange={(e) =>
                  setFormData({ ...formData, initialMessage: e.target.value })
                }
                placeholder="Provide more details about your issue..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || !formData.subject}>
              {submitting ? 'Creating...' : 'Create Ticket'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
