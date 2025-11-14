import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  User as UserIcon, Phone, Home, Calendar, Building, 
  CreditCard, Share2, CheckCircle2, AlertCircle, Camera,
  MapPin, Mail, Users
} from 'lucide-react';
import { useAuth } from '@/components/AuthSystem';
import {
  UserProfile,
  Parish,
  getUserProfile,
  saveUserProfile,
  getProfileCompletionStatus,
  searchParishes,
  getParishById
} from '@/lib/mockData';

interface UserProfileManagementProps {
  onBack?: () => void;
}

export const UserProfileManagement: React.FC<UserProfileManagementProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [completionStatus, setCompletionStatus] = useState({
    percentage: 0,
    missingFields: [] as string[],
    isComplete: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Parish search
  const [parishSearchQuery, setParishSearchQuery] = useState('');
  const [parishSearchResults, setParishSearchResults] = useState<Parish[]>([]);
  const [selectedParish, setSelectedParish] = useState<Parish | null>(null);
  const [showParishSearch, setShowParishSearch] = useState(false);
  const [showAddParish, setShowAddParish] = useState(false);

  useEffect(() => {
    if (user) {
      const existingProfile = getUserProfile(user.id);
      if (existingProfile) {
        setProfile(existingProfile);
        if (existingProfile.parishId) {
          const parish = getParishById(existingProfile.parishId);
          setSelectedParish(parish);
        }
      } else {
        setProfile({ userId: user.id });
      }
      updateCompletionStatus(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (parishSearchQuery) {
      const results = searchParishes(parishSearchQuery, user?.tenantId);
      setParishSearchResults(results);
    } else {
      setParishSearchResults([]);
    }
  }, [parishSearchQuery, user?.tenantId]);

  const updateCompletionStatus = (userId: string) => {
    const status = getProfileCompletionStatus(userId);
    setCompletionStatus(status);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setIsSaving(true);
    setSaveMessage(null);

    try {
      const success = saveUserProfile({ ...profile, userId: user.id });
      
      if (success) {
        setSaveMessage({ type: 'success', text: 'Profile updated successfully!' });
        updateCompletionStatus(user.id);
        
        // Auto-hide success message after 3 seconds
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        setSaveMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
      }
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'An error occurred. Please try again.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectParish = (parish: Parish) => {
    setSelectedParish(parish);
    setProfile({ ...profile, parishId: parish.id });
    setShowParishSearch(false);
    setParishSearchQuery('');
  };

  const handleImageUpload = (field: 'profilePicture', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In production, upload to server and get URL
      // For now, create local URL
      const imageUrl = URL.createObjectURL(file);
      setProfile({ ...profile, [field]: imageUrl });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-4">Authentication Required</h2>
            <p className="text-gray-600">Please log in to manage your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header with Profile Completion */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                <p className="text-gray-600">Manage your personal information</p>
              </div>
              {onBack && (
                <Button variant="outline" onClick={onBack}>
                  ← Back
                </Button>
              )}
            </div>
            
            {/* Profile Completion Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                <span className="text-sm font-bold text-blue-600">{completionStatus.percentage}%</span>
              </div>
              <Progress value={completionStatus.percentage} className="h-2" />
              {!completionStatus.isComplete && completionStatus.missingFields.length > 0 && (
                <Alert className="bg-yellow-50 border-yellow-200 mt-3">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 text-sm">
                    <strong>Missing fields:</strong> {completionStatus.missingFields.join(', ')}
                  </AlertDescription>
                </Alert>
              )}
              {completionStatus.isComplete && (
                <Alert className="bg-green-50 border-green-200 mt-3">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800 text-sm">
                    <strong>Profile Complete!</strong> You can now participate in tournaments and cashout rewards.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Save Message */}
        {saveMessage && (
          <Alert className={saveMessage.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
            {saveMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={saveMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {saveMessage.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Profile Tabs */}
        <Tabs defaultValue="personal" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="personal">
              <UserIcon className="h-4 w-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="parish">
              <Building className="h-4 w-4 mr-2" />
              Parish
            </TabsTrigger>
            <TabsTrigger value="nextofkin">
              <Users className="h-4 w-4 mr-2" />
              Next of Kin
            </TabsTrigger>
            <TabsTrigger value="banking">
              <CreditCard className="h-4 w-4 mr-2" />
              Banking
            </TabsTrigger>
            <TabsTrigger value="social">
              <Share2 className="h-4 w-4 mr-2" />
              Social
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Your basic personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Profile Picture */}
                <div>
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-4 mt-2">
                    {profile.profilePicture ? (
                      <img 
                        src={profile.profilePicture} 
                        alt="Profile" 
                        className="h-24 w-24 rounded-lg object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-lg bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload('profilePicture', e)}
                        className="max-w-xs"
                      />
                      <p className="text-xs text-gray-500 mt-1">Square or portrait format recommended</p>
                    </div>
                  </div>
                </div>

                {/* Name (from user account) */}
                <div>
                  <Label>Full Name</Label>
                  <Input value={user.name} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-500 mt-1">Contact support to change your name</p>
                </div>

                {/* Email (from user account) */}
                <div>
                  <Label>Email Address</Label>
                  <Input value={user.email} disabled className="bg-gray-50" />
                  <p className="text-xs text-gray-500 mt-1">Contact support to change your email</p>
                </div>

                {/* Date of Birth */}
                <div>
                  <Label htmlFor="dob">Date of Birth *</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={profile.dateOfBirth || ''}
                    onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  />
                </div>

                {/* Gender */}
                <div>
                  <Label htmlFor="gender">Gender *</Label>
                  <Select 
                    value={profile.gender || ''} 
                    onValueChange={(value) => setProfile({ ...profile, gender: value as any })}
                  >
                    <SelectTrigger id="gender">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                      <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Phone Number */}
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+234 XXX XXX XXXX"
                    value={profile.phoneNumber || ''}
                    onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                  />
                </div>

                {/* Alternate Phone */}
                <div>
                  <Label htmlFor="altPhone">Alternate Phone Number</Label>
                  <Input
                    id="altPhone"
                    type="tel"
                    placeholder="+234 XXX XXX XXXX"
                    value={profile.alternatePhoneNumber || ''}
                    onChange={(e) => setProfile({ ...profile, alternatePhoneNumber: e.target.value })}
                  />
                </div>

                {/* Home Address */}
                <div>
                  <Label htmlFor="address">Home Address *</Label>
                  <Textarea
                    id="address"
                    placeholder="Enter your full home address"
                    value={profile.homeAddress || ''}
                    onChange={(e) => setProfile({ ...profile, homeAddress: e.target.value })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parish/Organization Tab */}
          <TabsContent value="parish">
            <Card>
              <CardHeader>
                <CardTitle>Parish/Organization *</CardTitle>
                <CardDescription>Select your church or organization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Parish Display */}
                {selectedParish ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Building className="h-5 w-5 text-green-600" />
                          <h3 className="font-semibold text-green-900">{selectedParish.name}</h3>
                          {selectedParish.isVerified && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-green-700 space-y-1">
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {selectedParish.location.address}
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {selectedParish.parishPhoneNumber}
                          </p>
                          <p className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {selectedParish.parishEmailAddress}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedParish(null);
                          setProfile({ ...profile, parishId: undefined });
                        }}
                      >
                        Change
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800 text-sm">
                        Please select your parish/organization or add a new one if not found.
                      </AlertDescription>
                    </Alert>

                    {/* Search Parish */}
                    {!showAddParish && (
                      <div>
                        <Label htmlFor="parishSearch">Search Parish/Organization</Label>
                        <div className="flex gap-2 mt-2">
                          <Input
                            id="parishSearch"
                            placeholder="Type parish name to search..."
                            value={parishSearchQuery}
                            onChange={(e) => {
                              setParishSearchQuery(e.target.value);
                              setShowParishSearch(true);
                            }}
                            onFocus={() => setShowParishSearch(true)}
                          />
                        </div>

                        {/* Search Results */}
                        {showParishSearch && parishSearchResults.length > 0 && (
                          <div className="mt-2 border rounded-lg max-h-60 overflow-y-auto">
                            {parishSearchResults.map((parish) => (
                              <div
                                key={parish.id}
                                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                                onClick={() => handleSelectParish(parish)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className="font-medium text-gray-900">{parish.name}</p>
                                    <p className="text-sm text-gray-600">{parish.location.address}</p>
                                  </div>
                                  {parish.isVerified && (
                                    <Badge variant="outline" className="text-xs">Verified</Badge>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {showParishSearch && parishSearchQuery && parishSearchResults.length === 0 && (
                          <Alert className="mt-2 bg-yellow-50 border-yellow-200">
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                            <AlertDescription className="text-yellow-800 text-sm">
                              No parishes found. Try a different search or add a new parish.
                            </AlertDescription>
                          </Alert>
                        )}

                        <Button 
                          variant="outline" 
                          className="w-full mt-3"
                          onClick={() => setShowAddParish(true)}
                        >
                          + Add New Parish/Organization
                        </Button>
                      </div>
                    )}

                    {/* Add New Parish Link */}
                    {showAddParish && (
                      <Alert className="bg-purple-50 border-purple-200">
                        <Building className="h-4 w-4 text-purple-600" />
                        <AlertDescription className="text-purple-800">
                          <strong>Adding a new parish requires detailed information.</strong>
                          <br />
                          Please use the dedicated "Add Parish" form in your dashboard to register a new parish/organization.
                          <div className="mt-3 space-x-2">
                            <Button size="sm" onClick={() => {/* Navigate to add parish form */}}>
                              Go to Add Parish Form
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setShowAddParish(false)}>
                              Cancel
                            </Button>
                          </div>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Next of Kin Tab */}
          <TabsContent value="nextofkin">
            <Card>
              <CardHeader>
                <CardTitle>Next of Kin *</CardTitle>
                <CardDescription>Emergency contact information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="kinName">Full Name *</Label>
                  <Input
                    id="kinName"
                    placeholder="Enter next of kin's full name"
                    value={profile.nextOfKin?.name || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      nextOfKin: { ...profile.nextOfKin, name: e.target.value } as any
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="kinRelationship">Relationship *</Label>
                  <Input
                    id="kinRelationship"
                    placeholder="e.g., Spouse, Parent, Sibling"
                    value={profile.nextOfKin?.relationship || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      nextOfKin: { ...profile.nextOfKin, relationship: e.target.value } as any
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="kinPhone">Phone Number *</Label>
                  <Input
                    id="kinPhone"
                    type="tel"
                    placeholder="+234 XXX XXX XXXX"
                    value={profile.nextOfKin?.phoneNumber || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      nextOfKin: { ...profile.nextOfKin, phoneNumber: e.target.value } as any
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="kinAddress">Address *</Label>
                  <Textarea
                    id="kinAddress"
                    placeholder="Enter next of kin's address"
                    value={profile.nextOfKin?.address || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      nextOfKin: { ...profile.nextOfKin, address: e.target.value } as any
                    })}
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Banking Tab */}
          <TabsContent value="banking">
            <Card>
              <CardHeader>
                <CardTitle>Bank Account Details *</CardTitle>
                <CardDescription>Required for cashout and prize withdrawals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert className="bg-blue-50 border-blue-200">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <AlertDescription className="text-blue-800 text-sm">
                    <strong>Important:</strong> Ensure your bank account details are correct. This information will be used for prize payouts and cashouts.
                  </AlertDescription>
                </Alert>

                <div>
                  <Label htmlFor="bankName">Bank Name *</Label>
                  <Input
                    id="bankName"
                    placeholder="e.g., First Bank, GTBank, Access Bank"
                    value={profile.bankAccount?.bankName || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      bankAccount: { ...profile.bankAccount, bankName: e.target.value } as any
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    placeholder="10-digit account number"
                    maxLength={10}
                    value={profile.bankAccount?.accountNumber || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      bankAccount: { ...profile.bankAccount, accountNumber: e.target.value } as any
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="accountName">Account Name *</Label>
                  <Input
                    id="accountName"
                    placeholder="Name on the bank account"
                    value={profile.bankAccount?.accountName || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      bankAccount: { ...profile.bankAccount, accountName: e.target.value } as any
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="bankCode">Bank Code (Optional)</Label>
                  <Input
                    id="bankCode"
                    placeholder="3-digit bank code"
                    maxLength={3}
                    value={profile.bankAccount?.bankCode || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      bankAccount: { ...profile.bankAccount, bankCode: e.target.value } as any
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Social Media Tab */}
          <TabsContent value="social">
            <Card>
              <CardHeader>
                <CardTitle>Social Media Accounts</CardTitle>
                <CardDescription>Connect your social media profiles (at least one recommended)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    placeholder="https://facebook.com/yourprofile"
                    value={profile.socialAccounts?.facebook || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      socialAccounts: { ...profile.socialAccounts, facebook: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="twitter">Twitter/X</Label>
                  <Input
                    id="twitter"
                    placeholder="https://twitter.com/yourhandle"
                    value={profile.socialAccounts?.twitter || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      socialAccounts: { ...profile.socialAccounts, twitter: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    placeholder="https://instagram.com/yourhandle"
                    value={profile.socialAccounts?.instagram || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      socialAccounts: { ...profile.socialAccounts, instagram: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="whatsapp">WhatsApp</Label>
                  <Input
                    id="whatsapp"
                    placeholder="+234 XXX XXX XXXX"
                    value={profile.socialAccounts?.whatsapp || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      socialAccounts: { ...profile.socialAccounts, whatsapp: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="telegram">Telegram</Label>
                  <Input
                    id="telegram"
                    placeholder="@yourusername"
                    value={profile.socialAccounts?.telegram || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      socialAccounts: { ...profile.socialAccounts, telegram: e.target.value }
                    })}
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    placeholder="https://linkedin.com/in/yourprofile"
                    value={profile.socialAccounts?.linkedin || ''}
                    onChange={(e) => setProfile({ 
                      ...profile, 
                      socialAccounts: { ...profile.socialAccounts, linkedin: e.target.value }
                    })}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Save Button */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                * Required fields must be completed for full profile access
              </p>
              <Button 
                onClick={handleSaveProfile}
                disabled={isSaving}
                size="lg"
                className="px-8"
              >
                {isSaving ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
