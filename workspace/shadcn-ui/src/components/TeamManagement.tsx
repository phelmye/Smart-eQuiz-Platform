import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Users, 
  UserPlus, 
  Mail,
  Shield,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Eye,
  Edit,
  MoreVertical,
  LogOut
} from 'lucide-react';
import { storage, STORAGE_KEYS, User } from '@/lib/mockData';
import { useAuth } from './AuthSystem';

interface TeamManagementProps {
  user: any;
  tenant: any;
  onBack?: () => void;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  joinedDate: string;
  lastActive: string;
  permissions: string[];
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  invitedBy: string;
  invitedDate: string;
  expiresDate: string;
  status: 'pending' | 'accepted' | 'expired';
}

interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'member' | 'permission' | 'invitation' | 'role';
}

const AVAILABLE_ROLES = [
  { id: 'org_admin', label: 'Organization Admin', description: 'Full access to all features' },
  { id: 'question_manager', label: 'Question Manager', description: 'Manage questions and categories' },
  { id: 'account_officer', label: 'Account Officer', description: 'Manage billing and payments' },
  { id: 'inspector', label: 'Inspector', description: 'Monitor tournaments and users' },
  { id: 'moderator', label: 'Moderator', description: 'Moderate content and users' }
];

const TeamManagement: React.FC<TeamManagementProps> = ({ user, tenant, onBack }) => {
  const { logout } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('members');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  
  // Invitation form state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('question_manager');
  const [inviteMessage, setInviteMessage] = useState('');

  useEffect(() => {
    loadTeamData();
  }, [tenant]);

  const loadTeamData = () => {
    // Load team members (mock data)
    const mockMembers: TeamMember[] = [
      {
        id: 'member-1',
        name: user?.name || 'Current User',
        email: user?.email || 'admin@example.com',
        role: 'org_admin',
        status: 'active',
        joinedDate: '2025-01-15',
        lastActive: new Date().toISOString(),
        permissions: ['all']
      },
      {
        id: 'member-2',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'question_manager',
        status: 'active',
        joinedDate: '2025-02-01',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        permissions: ['manage_questions', 'view_analytics']
      },
      {
        id: 'member-3',
        name: 'Jane Smith',
        email: 'jane@example.com',
        role: 'account_officer',
        status: 'active',
        joinedDate: '2025-03-10',
        lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        permissions: ['manage_billing', 'view_payments']
      },
      {
        id: 'member-4',
        name: 'Mike Johnson',
        email: 'mike@example.com',
        role: 'inspector',
        status: 'inactive',
        joinedDate: '2025-04-20',
        lastActive: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        permissions: ['view_tournaments', 'view_users']
      }
    ];
    setTeamMembers(mockMembers);

    // Load pending invitations (mock data)
    const mockInvitations: Invitation[] = [
      {
        id: 'inv-1',
        email: 'sarah@example.com',
        role: 'question_manager',
        invitedBy: user?.name || 'Admin',
        invitedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        expiresDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending'
      },
      {
        id: 'inv-2',
        email: 'david@example.com',
        role: 'moderator',
        invitedBy: user?.name || 'Admin',
        invitedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        expiresDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'expired'
      }
    ];
    setInvitations(mockInvitations);

    // Load activity logs (mock data)
    const mockLogs: ActivityLog[] = [
      {
        id: 'log-1',
        userId: 'member-2',
        userName: 'John Doe',
        action: 'Updated role',
        details: 'Changed from inspector to question_manager',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        type: 'role'
      },
      {
        id: 'log-2',
        userId: user?.id || 'member-1',
        userName: user?.name || 'Admin',
        action: 'Sent invitation',
        details: 'Invited sarah@example.com as question_manager',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'invitation'
      },
      {
        id: 'log-3',
        userId: 'member-3',
        userName: 'Jane Smith',
        action: 'Joined team',
        details: 'Accepted invitation as account_officer',
        timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'member'
      },
      {
        id: 'log-4',
        userId: user?.id || 'member-1',
        userName: user?.name || 'Admin',
        action: 'Updated permissions',
        details: 'Added view_analytics permission for John Doe',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'permission'
      }
    ];
    setActivityLogs(mockLogs);
  };

  const handleSendInvitation = () => {
    if (!inviteEmail.trim()) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    // Check if email already exists
    const emailExists = teamMembers.some(m => m.email.toLowerCase() === inviteEmail.toLowerCase()) ||
                       invitations.some(i => i.email.toLowerCase() === inviteEmail.toLowerCase() && i.status === 'pending');
    
    if (emailExists) {
      toast({
        title: "Email Already Exists",
        description: "This email is already associated with a team member or has a pending invitation",
        variant: "destructive"
      });
      return;
    }

    const newInvitation: Invitation = {
      id: `inv-${Date.now()}`,
      email: inviteEmail,
      role: inviteRole,
      invitedBy: user?.name || 'Admin',
      invitedDate: new Date().toISOString(),
      expiresDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'pending'
    };

    setInvitations(prev => [newInvitation, ...prev]);
    
    // Add activity log
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userId: user?.id || 'current',
      userName: user?.name || 'Admin',
      action: 'Sent invitation',
      details: `Invited ${inviteEmail} as ${AVAILABLE_ROLES.find(r => r.id === inviteRole)?.label}`,
      timestamp: new Date().toISOString(),
      type: 'invitation'
    };
    setActivityLogs(prev => [newLog, ...prev]);

    toast({
      title: "Invitation Sent",
      description: `Invitation sent to ${inviteEmail}!`
    });
    setInviteEmail('');
    setInviteMessage('');
  };

  const handleResendInvitation = (invitation: Invitation) => {
    toast({
      title: "Invitation Resent",
      description: `Invitation resent to ${invitation.email}`
    });
  };

  const handleCancelInvitation = (invitationId: string) => {
    if (confirm('Cancel this invitation?')) {
      setInvitations(prev => prev.filter(i => i.id !== invitationId));
      toast({
        title: "Invitation Cancelled",
        description: "Invitation cancelled"
      });
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    if (memberId === user?.id) {
      toast({
        title: "Action Not Allowed",
        description: "You cannot remove yourself from the team",
        variant: "destructive"
      });
      return;
    }

    if (confirm(`Remove ${memberName} from the team? They will lose access immediately.`)) {
      setTeamMembers(prev => prev.filter(m => m.id !== memberId));
      
      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        userId: user?.id || 'current',
        userName: user?.name || 'Admin',
        action: 'Removed member',
        details: `Removed ${memberName} from team`,
        timestamp: new Date().toISOString(),
        type: 'member'
      };
      setActivityLogs(prev => [newLog, ...prev]);

      toast({
        title: "Member Removed",
        description: `${memberName} has been removed from the team`
      });
    }
  };

  const handleChangeRole = (memberId: string, memberName: string, newRole: string) => {
    if (memberId === user?.id) {
      toast({
        title: "Action Not Allowed",
        description: "You cannot change your own role",
        variant: "destructive"
      });
      return;
    }

    setTeamMembers(prev => prev.map(m => 
      m.id === memberId ? { ...m, role: newRole } : m
    ));

    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userId: user?.id || 'current',
      userName: user?.name || 'Admin',
      action: 'Updated role',
      details: `Changed ${memberName}'s role to ${AVAILABLE_ROLES.find(r => r.id === newRole)?.label}`,
      timestamp: new Date().toISOString(),
      type: 'role'
    };
    setActivityLogs(prev => [newLog, ...prev]);

    toast({
      title: "Role Updated",
      description: `Role updated for ${memberName}`
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'org_admin': return 'bg-purple-100 text-purple-800';
      case 'question_manager': return 'bg-blue-100 text-blue-800';
      case 'account_officer': return 'bg-green-100 text-green-800';
      case 'inspector': return 'bg-yellow-100 text-yellow-800';
      case 'moderator': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="h-8 w-8 text-blue-600" />
                Team Management
              </h1>
              <p className="text-gray-600 mt-2">Manage your team members, roles, and permissions</p>
            </div>
            <div className="flex items-center gap-2">
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  Back to Dashboard
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Members</p>
                  <p className="text-2xl font-bold">{teamMembers.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active</p>
                  <p className="text-2xl font-bold">
                    {teamMembers.filter(m => m.status === 'active').length}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Invites</p>
                  <p className="text-2xl font-bold">
                    {invitations.filter(i => i.status === 'pending').length}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Roles</p>
                  <p className="text-2xl font-bold">{AVAILABLE_ROLES.length}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Shield className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">
              <Users className="h-4 w-4 mr-2" />
              Team Members
            </TabsTrigger>
            <TabsTrigger value="invitations">
              <Mail className="h-4 w-4 mr-2" />
              Invitations
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              Activity Log
            </TabsTrigger>
          </TabsList>

          {/* Team Members Tab */}
          <TabsContent value="members">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>Manage your team members and their roles</CardDescription>
                  </div>
                  <Button onClick={() => setActiveTab('invitations')}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Invite Member
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-blue-600 text-white font-semibold">
                            {getInitials(member.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{member.name}</h4>
                            {member.id === user?.id && (
                              <Badge variant="outline" className="text-xs">You</Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{member.email}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getRoleColor(member.role)}>
                              {AVAILABLE_ROLES.find(r => r.id === member.role)?.label || member.role}
                            </Badge>
                            <Badge className={getStatusColor(member.status)}>
                              {member.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            Last active: {formatDate(member.lastActive)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {member.id !== user?.id && (
                          <>
                            <Select
                              value={member.role}
                              onValueChange={(value) => handleChangeRole(member.id, member.name, value)}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {AVAILABLE_ROLES.map(role => (
                                  <SelectItem key={role.id} value={role.id}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleRemoveMember(member.id, member.name)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invitations Tab */}
          <TabsContent value="invitations">
            <div className="space-y-6">
              {/* Send Invitation Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Send Invitation</CardTitle>
                  <CardDescription>Invite new members to join your team</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="invite-email">Email Address</Label>
                      <Input
                        id="invite-email"
                        type="email"
                        placeholder="colleague@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="invite-role">Role</Label>
                      <Select value={inviteRole} onValueChange={setInviteRole}>
                        <SelectTrigger id="invite-role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {AVAILABLE_ROLES.map(role => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="invite-message">Custom Message (Optional)</Label>
                    <Input
                      id="invite-message"
                      placeholder="Add a personal message to the invitation"
                      value={inviteMessage}
                      onChange={(e) => setInviteMessage(e.target.value)}
                    />
                  </div>

                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Selected Role: {AVAILABLE_ROLES.find(r => r.id === inviteRole)?.label}</strong>
                      <p className="text-sm mt-1">
                        {AVAILABLE_ROLES.find(r => r.id === inviteRole)?.description}
                      </p>
                    </AlertDescription>
                  </Alert>

                  <Button onClick={handleSendInvitation} className="w-full">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </Button>
                </CardContent>
              </Card>

              {/* Pending Invitations */}
              <Card>
                <CardHeader>
                  <CardTitle>Pending Invitations</CardTitle>
                  <CardDescription>Invitations waiting for response</CardDescription>
                </CardHeader>
                <CardContent>
                  {invitations.filter(i => i.status === 'pending').length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No pending invitations</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {invitations.filter(i => i.status === 'pending').map(invitation => (
                        <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div>
                            <h4 className="font-semibold">{invitation.email}</h4>
                            <p className="text-sm text-gray-600">
                              {AVAILABLE_ROLES.find(r => r.id === invitation.role)?.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Invited {formatDate(invitation.invitedDate)} by {invitation.invitedBy}
                            </p>
                            <p className="text-xs text-gray-500">
                              Expires {formatDate(invitation.expiresDate)}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResendInvitation(invitation)}
                            >
                              Resend
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelInvitation(invitation.id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expired Invitations */}
              {invitations.filter(i => i.status === 'expired').length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Expired Invitations</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {invitations.filter(i => i.status === 'expired').map(invitation => (
                        <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg opacity-60">
                          <div>
                            <h4 className="font-semibold">{invitation.email}</h4>
                            <p className="text-sm text-gray-600">
                              {AVAILABLE_ROLES.find(r => r.id === invitation.role)?.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Expired {formatDate(invitation.expiresDate)}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResendInvitation(invitation)}
                          >
                            Resend
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
                <CardDescription>Recent team management activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activityLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className={`p-2 rounded-lg ${
                        log.type === 'member' ? 'bg-blue-100' :
                        log.type === 'role' ? 'bg-purple-100' :
                        log.type === 'permission' ? 'bg-green-100' :
                        'bg-yellow-100'
                      }`}>
                        <Activity className={`h-4 w-4 ${
                          log.type === 'member' ? 'text-blue-600' :
                          log.type === 'role' ? 'text-purple-600' :
                          log.type === 'permission' ? 'text-green-600' :
                          'text-yellow-600'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{log.userName}</h4>
                          <span className="text-xs text-gray-500">{formatDate(log.timestamp)}</span>
                        </div>
                        <p className="text-sm text-gray-900 mt-1">{log.action}</p>
                        <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeamManagement;
