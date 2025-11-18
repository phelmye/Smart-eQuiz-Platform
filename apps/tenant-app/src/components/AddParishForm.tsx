import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building, MapPin, Phone, Mail, User as UserIcon, 
  Camera, CheckCircle2, AlertCircle, Upload 
} from 'lucide-react';
import { useAuth } from '@/components/AuthSystem';
import {
  Parish,
  ParishAuthority,
  ParishContactPerson,
  ParishLocation,
  addParish,
  getFieldLabels,
  getCustomText
} from '@/lib/mockData';

interface AddParishFormProps {
  onSuccess?: (parishId: string) => void;
  onCancel?: () => void;
  tenantId?: string; // Optional: for use during registration when user is not yet authenticated
}

export const AddParishForm: React.FC<AddParishFormProps> = ({ onSuccess, onCancel, tenantId: propTenantId }) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Use provided tenantId (during registration) or user's tenantId (when authenticated)
  const tenantId = propTenantId || user?.tenantId;
  
  // Get custom field labels
  const fieldLabels = getFieldLabels(tenantId);
  
  // Get custom text
  const customText = getCustomText(tenantId);
  
  const [formData, setFormData] = useState({
    parishName: '',
    parishPhoneNumber: '',
    parishEmailAddress: '',
    parishImage: '',
    
    // Authority (Person in charge)
    authorityName: '',
    authorityPhoneNumber: '',
    authorityEmailAddress: '',
    authorityAddress: '',
    
    // Contact Person
    contactPersonName: '',
    contactPersonPhoneNumber: '',
    contactPersonEmailAddress: '',
    
    // Location
    locationAddress: '',
    locationLatitude: '',
    locationLongitude: '',
    locationMapUrl: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Parish Information
    if (!formData.parishName.trim()) newErrors.parishName = 'Parish name is required';
    if (!formData.parishPhoneNumber.trim()) newErrors.parishPhoneNumber = 'Parish phone number is required';
    if (!formData.parishEmailAddress.trim()) newErrors.parishEmailAddress = 'Parish email is required';
    
    // Authority Information
    if (!formData.authorityName.trim()) newErrors.authorityName = 'Authority name is required';
    if (!formData.authorityPhoneNumber.trim()) newErrors.authorityPhoneNumber = 'Authority phone is required';
    if (!formData.authorityEmailAddress.trim()) newErrors.authorityEmailAddress = 'Authority email is required';
    if (!formData.authorityAddress.trim()) newErrors.authorityAddress = 'Authority address is required';
    
    // Contact Person
    if (!formData.contactPersonName.trim()) newErrors.contactPersonName = 'Contact person name is required';
    if (!formData.contactPersonPhoneNumber.trim()) newErrors.contactPersonPhoneNumber = 'Contact person phone is required';
    if (!formData.contactPersonEmailAddress.trim()) newErrors.contactPersonEmailAddress = 'Contact person email is required';
    
    // Location
    if (!formData.locationAddress.trim()) newErrors.locationAddress = 'Parish address is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!tenantId) {
      setSubmitMessage({ type: 'error', text: 'Organization/Diocese not selected' });
      return;
    }

    if (!validateForm()) {
      setSubmitMessage({ type: 'error', text: 'Please fill in all required fields' });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const authority: ParishAuthority = {
        name: formData.authorityName,
        phoneNumber: formData.authorityPhoneNumber,
        emailAddress: formData.authorityEmailAddress,
        address: formData.authorityAddress
      };

      const contactPerson: ParishContactPerson = {
        name: formData.contactPersonName,
        phoneNumber: formData.contactPersonPhoneNumber,
        emailAddress: formData.contactPersonEmailAddress
      };

      const location: ParishLocation = {
        address: formData.locationAddress,
        latitude: formData.locationLatitude ? parseFloat(formData.locationLatitude) : undefined,
        longitude: formData.locationLongitude ? parseFloat(formData.locationLongitude) : undefined,
        mapUrl: formData.locationMapUrl || undefined
      };

      const result = addParish({
        name: formData.parishName,
        tenantId: tenantId,
        authority,
        contactPerson,
        parishPhoneNumber: formData.parishPhoneNumber,
        parishEmailAddress: formData.parishEmailAddress,
        location,
        parishImage: formData.parishImage || undefined,
        isActive: true,
        createdBy: user?.id || 'registration_user'
      });

      if (result.success) {
        setSubmitMessage({ 
          type: 'success', 
          text: customText.parishForm.successMessage
        });
        
        setTimeout(() => {
          if (onSuccess && result.parishId) {
            onSuccess(result.parishId);
          }
        }, 2000);
      } else {
        setSubmitMessage({ type: 'error', text: result.message || customText.parishForm.errorMessage });
      }
    } catch (error) {
      setSubmitMessage({ type: 'error', text: customText.parishForm.errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate image aspect ratio (16:9)
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        if (Math.abs(aspectRatio - 16/9) > 0.1) {
          alert('Please upload an image with 16:9 aspect ratio (landscape)');
          return;
        }
        const imageUrl = URL.createObjectURL(file);
        setFormData({ ...formData, parishImage: imageUrl });
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleMapPick = () => {
    // In production, integrate with Google Maps or similar
    // For now, provide guidance for manual entry
    const coords = prompt('Enter coordinates in format: latitude,longitude\n\nExample: 40.7128,-74.0060 (New York City)\n\nYou can get coordinates from Google Maps by right-clicking a location.');
    if (coords) {
      const [lat, lng] = coords.split(',').map(s => s.trim());
      if (lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
        setFormData({ 
          ...formData, 
          location: { 
            ...formData.location, 
            coordinates: { lat: parseFloat(lat), lng: parseFloat(lng) } 
          } 
        });
        alert('Coordinates saved successfully!');
      } else {
        alert('Invalid coordinates format. Please use: latitude,longitude');
      }
    }
  };

  if (!tenantId) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-600 mb-4">Organization Not Selected</h2>
            <p className="text-gray-600">Please select an organization/diocese first. The parish will be registered under this organization.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Building className="h-6 w-6" />
              {customText.parishForm.title}
            </CardTitle>
            <CardDescription>
              {customText.parishForm.subtitle}
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Submit Message */}
        {submitMessage && (
          <Alert className={submitMessage.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}>
            {submitMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription className={submitMessage.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {submitMessage.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Parish Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{customText.parishForm.basicInfoSection}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="parishName">{fieldLabels.parishSingular} Name *</Label>
              <Input
                id="parishName"
                placeholder={`e.g., St. Mary's ${fieldLabels.parishSingular}, Grace ${fieldLabels.parishSingular}`}
                value={formData.parishName}
                onChange={(e) => setFormData({ ...formData, parishName: e.target.value })}
                className={errors.parishName ? 'border-red-500' : ''}
              />
              {errors.parishName && <p className="text-sm text-red-600 mt-1">{errors.parishName}</p>}
            </div>

            <div>
              <Label htmlFor="parishPhone">{fieldLabels.parishSingular} Phone Number *</Label>
              <Input
                id="parishPhone"
                type="tel"
                placeholder="+234 XXX XXX XXXX"
                value={formData.parishPhoneNumber}
                onChange={(e) => setFormData({ ...formData, parishPhoneNumber: e.target.value })}
                className={errors.parishPhoneNumber ? 'border-red-500' : ''}
              />
              {errors.parishPhoneNumber && <p className="text-sm text-red-600 mt-1">{errors.parishPhoneNumber}</p>}
            </div>

            <div>
              <Label htmlFor="parishEmail">{fieldLabels.parishSingular} Email Address *</Label>
              <Input
                id="parishEmail"
                type="email"
                placeholder="parish@example.com"
                value={formData.parishEmailAddress}
                onChange={(e) => setFormData({ ...formData, parishEmailAddress: e.target.value })}
                className={errors.parishEmailAddress ? 'border-red-500' : ''}
              />
              {errors.parishEmailAddress && <p className="text-sm text-red-600 mt-1">{errors.parishEmailAddress}</p>}
            </div>

            <div>
              <Label>{fieldLabels.parishSingular} Image (Landscape 16:9 ratio)</Label>
              <div className="mt-2 space-y-3">
                {formData.parishImage ? (
                  <div className="relative">
                    <img 
                      src={formData.parishImage} 
                      alt={fieldLabels.parishSingular} 
                      className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => setFormData({ ...formData, parishImage: '' })}
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 mb-3">Upload a landscape photo of the {fieldLabels.parishSingular.toLowerCase()} (16:9 ratio)</p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="max-w-xs mx-auto"
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Authority (Person in Charge) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              {customText.parishForm.authoritySection}
            </CardTitle>
            <CardDescription>Information about the {fieldLabels.parishLeader.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="authName">Full Name *</Label>
              <Input
                id="authName"
                placeholder="Rev. Fr. John Doe / Pastor Jane Smith"
                value={formData.authorityName}
                onChange={(e) => setFormData({ ...formData, authorityName: e.target.value })}
                className={errors.authorityName ? 'border-red-500' : ''}
              />
              {errors.authorityName && <p className="text-sm text-red-600 mt-1">{errors.authorityName}</p>}
            </div>

            <div>
              <Label htmlFor="authPhone">Phone Number *</Label>
              <Input
                id="authPhone"
                type="tel"
                placeholder="+234 XXX XXX XXXX"
                value={formData.authorityPhoneNumber}
                onChange={(e) => setFormData({ ...formData, authorityPhoneNumber: e.target.value })}
                className={errors.authorityPhoneNumber ? 'border-red-500' : ''}
              />
              {errors.authorityPhoneNumber && <p className="text-sm text-red-600 mt-1">{errors.authorityPhoneNumber}</p>}
            </div>

            <div>
              <Label htmlFor="authEmail">Email Address *</Label>
              <Input
                id="authEmail"
                type="email"
                placeholder="authority@example.com"
                value={formData.authorityEmailAddress}
                onChange={(e) => setFormData({ ...formData, authorityEmailAddress: e.target.value })}
                className={errors.authorityEmailAddress ? 'border-red-500' : ''}
              />
              {errors.authorityEmailAddress && <p className="text-sm text-red-600 mt-1">{errors.authorityEmailAddress}</p>}
            </div>

            <div>
              <Label htmlFor="authAddress">Address *</Label>
              <Textarea
                id="authAddress"
                placeholder="Authority's residential address"
                value={formData.authorityAddress}
                onChange={(e) => setFormData({ ...formData, authorityAddress: e.target.value })}
                rows={3}
                className={errors.authorityAddress ? 'border-red-500' : ''}
              />
              {errors.authorityAddress && <p className="text-sm text-red-600 mt-1">{errors.authorityAddress}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Contact Person */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              {customText.parishForm.contactSection}
            </CardTitle>
            <CardDescription>Primary contact for parish communications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="contactName">Full Name *</Label>
              <Input
                id="contactName"
                placeholder="Contact person's full name"
                value={formData.contactPersonName}
                onChange={(e) => setFormData({ ...formData, contactPersonName: e.target.value })}
                className={errors.contactPersonName ? 'border-red-500' : ''}
              />
              {errors.contactPersonName && <p className="text-sm text-red-600 mt-1">{errors.contactPersonName}</p>}
            </div>

            <div>
              <Label htmlFor="contactPhone">Phone Number *</Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="+234 XXX XXX XXXX"
                value={formData.contactPersonPhoneNumber}
                onChange={(e) => setFormData({ ...formData, contactPersonPhoneNumber: e.target.value })}
                className={errors.contactPersonPhoneNumber ? 'border-red-500' : ''}
              />
              {errors.contactPersonPhoneNumber && <p className="text-sm text-red-600 mt-1">{errors.contactPersonPhoneNumber}</p>}
            </div>

            <div>
              <Label htmlFor="contactEmail">Email Address *</Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="contact@example.com"
                value={formData.contactPersonEmailAddress}
                onChange={(e) => setFormData({ ...formData, contactPersonEmailAddress: e.target.value })}
                className={errors.contactPersonEmailAddress ? 'border-red-500' : ''}
              />
              {errors.contactPersonEmailAddress && <p className="text-sm text-red-600 mt-1">{errors.contactPersonEmailAddress}</p>}
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              {customText.parishForm.locationSection}
            </CardTitle>
            <CardDescription>Physical location of the {fieldLabels.parishSingular.toLowerCase()}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="locationAddress">Full Address *</Label>
              <Textarea
                id="locationAddress"
                placeholder={`Complete ${fieldLabels.parishSingular.toLowerCase()} address with landmarks`}
                value={formData.locationAddress}
                onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                rows={3}
                className={errors.locationAddress ? 'border-red-500' : ''}
              />
              {errors.locationAddress && <p className="text-sm text-red-600 mt-1">{errors.locationAddress}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="latitude">Latitude (Optional)</Label>
                <Input
                  id="latitude"
                  type="number"
                  step="any"
                  placeholder="6.5244"
                  value={formData.locationLatitude}
                  onChange={(e) => setFormData({ ...formData, locationLatitude: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="longitude">Longitude (Optional)</Label>
                <Input
                  id="longitude"
                  type="number"
                  step="any"
                  placeholder="3.3792"
                  value={formData.locationLongitude}
                  onChange={(e) => setFormData({ ...formData, locationLongitude: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="mapUrl">Google Maps URL (Optional)</Label>
              <Input
                id="mapUrl"
                placeholder="https://maps.google.com/..."
                value={formData.locationMapUrl}
                onChange={(e) => setFormData({ ...formData, locationMapUrl: e.target.value })}
              />
            </div>

            <Button variant="outline" onClick={handleMapPick} className="w-full">
              <MapPin className="h-4 w-4 mr-2" />
              Pick Location on Map
            </Button>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <Card>
          <CardContent className="p-6">
            <div className="text-sm text-gray-600 mb-4">
              <p className="font-medium mb-2">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>All information will be verified by an admin before approval</li>
                <li>Ensure contact details are accurate and reachable</li>
                <li>Upload a clear, landscape photo of the parish/organization</li>
              </ul>
            </div>
            <div className="flex gap-3 justify-end">
              {onCancel && (
                <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
                  {customText.parishForm.buttonCancel}
                </Button>
              )}
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                size="lg"
                className="px-8"
              >
                {isSubmitting ? customText.common.saving : customText.parishForm.buttonSubmit}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
