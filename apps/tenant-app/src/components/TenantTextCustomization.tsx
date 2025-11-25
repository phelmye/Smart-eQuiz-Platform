import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react';
import { useAuth } from '@/components/AuthSystem';
import { getCustomText, updateTenantCustomText } from '@/lib/mockData';

export const TenantTextCustomization: React.FC = () => {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Load current custom text
  const currentText = getCustomText(user?.tenantId);
  
  // Form state
  const [registrationText, setRegistrationText] = useState({
    welcomeText: currentText.registration.welcomeText,
    successMessage: currentText.registration.successMessage,
    parishSearchPlaceholder: currentText.registration.parishSearchPlaceholder,
    parishSearchHelper: currentText.registration.parishSearchHelper,
    buttonRegister: currentText.registration.buttonRegister,
    buttonRegisterParish: currentText.registration.buttonRegisterParish
  });

  const [parishFormText, setParishFormText] = useState({
    title: currentText.parishForm.title,
    subtitle: currentText.parishForm.subtitle,
    basicInfoSection: currentText.parishForm.basicInfoSection,
    authoritySection: currentText.parishForm.authoritySection,
    contactSection: currentText.parishForm.contactSection,
    locationSection: currentText.parishForm.locationSection,
    notesSection: currentText.parishForm.notesSection,
    buttonSubmit: currentText.parishForm.buttonSubmit,
    buttonCancel: currentText.parishForm.buttonCancel,
    successMessage: currentText.parishForm.successMessage,
    errorMessage: currentText.parishForm.errorMessage
  });

  const [commonText, setCommonText] = useState({
    loading: currentText.common.loading,
    saving: currentText.common.saving,
    cancel: currentText.common.cancel,
    save: currentText.common.save,
    edit: currentText.common.edit,
    delete: currentText.common.delete,
    confirm: currentText.common.confirm,
    search: currentText.common.search
  });

  const handleSave = async () => {
    if (!user?.tenantId) {
      setSaveMessage({ type: 'error', text: 'No tenant ID found' });
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const success = updateTenantCustomText(user.tenantId, {
        registration: registrationText,
        parishForm: parishFormText,
        common: commonText
      });

      if (success) {
        setSaveMessage({ 
          type: 'success', 
          text: 'Custom text saved successfully! Changes will apply immediately.' 
        });
      } else {
        setSaveMessage({ 
          type: 'error', 
          text: 'Failed to save custom text. Please try again.' 
        });
      }
    } catch (error) {
      setSaveMessage({ 
        type: 'error', 
        text: 'An error occurred while saving. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = (section: 'registration' | 'parishForm' | 'common') => {
    const defaultText = getCustomText(undefined); // Get defaults

    switch (section) {
      case 'registration':
        setRegistrationText({
          welcomeText: defaultText.registration.welcomeText,
          successMessage: defaultText.registration.successMessage,
          parishSearchPlaceholder: defaultText.registration.parishSearchPlaceholder,
          parishSearchHelper: defaultText.registration.parishSearchHelper,
          buttonRegister: defaultText.registration.buttonRegister,
          buttonRegisterParish: defaultText.registration.buttonRegisterParish
        });
        break;
      case 'parishForm':
        setParishFormText({
          title: defaultText.parishForm.title,
          subtitle: defaultText.parishForm.subtitle,
          basicInfoSection: defaultText.parishForm.basicInfoSection,
          authoritySection: defaultText.parishForm.authoritySection,
          contactSection: defaultText.parishForm.contactSection,
          locationSection: defaultText.parishForm.locationSection,
          notesSection: defaultText.parishForm.notesSection,
          buttonSubmit: defaultText.parishForm.buttonSubmit,
          buttonCancel: defaultText.parishForm.buttonCancel,
          successMessage: defaultText.parishForm.successMessage,
          errorMessage: defaultText.parishForm.errorMessage
        });
        break;
      case 'common':
        setCommonText({
          loading: defaultText.common.loading,
          saving: defaultText.common.saving,
          cancel: defaultText.common.cancel,
          save: defaultText.common.save,
          edit: defaultText.common.edit,
          delete: defaultText.common.delete,
          confirm: defaultText.common.confirm,
          search: defaultText.common.search
        });
        break;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Text Customization</CardTitle>
          <CardDescription>
            Customize text and messages displayed throughout your platform to match your organization's terminology and style.
          </CardDescription>
        </CardHeader>
      </Card>

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

      <Tabs defaultValue="registration" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="registration">Registration Page</TabsTrigger>
          <TabsTrigger value="parishForm">Parish Form</TabsTrigger>
          <TabsTrigger value="common">Common UI</TabsTrigger>
        </TabsList>

        {/* Registration Page Text */}
        <TabsContent value="registration">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Registration Page Text</CardTitle>
                  <CardDescription>Customize text shown on the user registration page</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleReset('registration')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="reg-welcome">Welcome Text</Label>
                <Input
                  id="reg-welcome"
                  value={registrationText.welcomeText}
                  onChange={(e) => setRegistrationText({ ...registrationText, welcomeText: e.target.value })}
                  placeholder="Create your account"
                />
              </div>

              <div>
                <Label htmlFor="reg-success">Success Message</Label>
                <Textarea
                  id="reg-success"
                  value={registrationText.successMessage}
                  onChange={(e) => setRegistrationText({ ...registrationText, successMessage: e.target.value })}
                  placeholder="Account created successfully!"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="reg-parish-placeholder">Parish Search Placeholder</Label>
                <Input
                  id="reg-parish-placeholder"
                  value={registrationText.parishSearchPlaceholder}
                  onChange={(e) => setRegistrationText({ ...registrationText, parishSearchPlaceholder: e.target.value })}
                  placeholder="Search for your parish/organization..."
                />
              </div>

              <div>
                <Label htmlFor="reg-parish-helper">Parish Search Helper Text</Label>
                <Textarea
                  id="reg-parish-helper"
                  value={registrationText.parishSearchHelper}
                  onChange={(e) => setRegistrationText({ ...registrationText, parishSearchHelper: e.target.value })}
                  placeholder="Select your parish to participate in tournaments..."
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="reg-button">Register Button Text</Label>
                <Input
                  id="reg-button"
                  value={registrationText.buttonRegister}
                  onChange={(e) => setRegistrationText({ ...registrationText, buttonRegister: e.target.value })}
                  placeholder="Create Account"
                />
              </div>

              <div>
                <Label htmlFor="reg-button-parish">Register Parish Button Text</Label>
                <Input
                  id="reg-button-parish"
                  value={registrationText.buttonRegisterParish}
                  onChange={(e) => setRegistrationText({ ...registrationText, buttonRegisterParish: e.target.value })}
                  placeholder="Register New Parish"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Parish Form Text */}
        <TabsContent value="parishForm">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Parish Registration Form Text</CardTitle>
                  <CardDescription>Customize text shown in the parish registration form</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleReset('parishForm')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="parish-title">Form Title</Label>
                <Input
                  id="parish-title"
                  value={parishFormText.title}
                  onChange={(e) => setParishFormText({ ...parishFormText, title: e.target.value })}
                  placeholder="Register New Parish"
                />
              </div>

              <div>
                <Label htmlFor="parish-subtitle">Form Subtitle</Label>
                <Textarea
                  id="parish-subtitle"
                  value={parishFormText.subtitle}
                  onChange={(e) => setParishFormText({ ...parishFormText, subtitle: e.target.value })}
                  placeholder="Add your parish information..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parish-basic">Basic Info Section Title</Label>
                  <Input
                    id="parish-basic"
                    value={parishFormText.basicInfoSection}
                    onChange={(e) => setParishFormText({ ...parishFormText, basicInfoSection: e.target.value })}
                    placeholder="Basic Information"
                  />
                </div>

                <div>
                  <Label htmlFor="parish-authority">Authority Section Title</Label>
                  <Input
                    id="parish-authority"
                    value={parishFormText.authoritySection}
                    onChange={(e) => setParishFormText({ ...parishFormText, authoritySection: e.target.value })}
                    placeholder="Authority Information"
                  />
                </div>

                <div>
                  <Label htmlFor="parish-contact">Contact Section Title</Label>
                  <Input
                    id="parish-contact"
                    value={parishFormText.contactSection}
                    onChange={(e) => setParishFormText({ ...parishFormText, contactSection: e.target.value })}
                    placeholder="Contact Person"
                  />
                </div>

                <div>
                  <Label htmlFor="parish-location">Location Section Title</Label>
                  <Input
                    id="parish-location"
                    value={parishFormText.locationSection}
                    onChange={(e) => setParishFormText({ ...parishFormText, locationSection: e.target.value })}
                    placeholder="Location Details"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="parish-success">Success Message</Label>
                <Textarea
                  id="parish-success"
                  value={parishFormText.successMessage}
                  onChange={(e) => setParishFormText({ ...parishFormText, successMessage: e.target.value })}
                  placeholder="Parish registration submitted successfully!"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="parish-error">Error Message</Label>
                <Input
                  id="parish-error"
                  value={parishFormText.errorMessage}
                  onChange={(e) => setParishFormText({ ...parishFormText, errorMessage: e.target.value })}
                  placeholder="Failed to register parish. Please try again."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="parish-submit">Submit Button Text</Label>
                  <Input
                    id="parish-submit"
                    value={parishFormText.buttonSubmit}
                    onChange={(e) => setParishFormText({ ...parishFormText, buttonSubmit: e.target.value })}
                    placeholder="Submit for Review"
                  />
                </div>

                <div>
                  <Label htmlFor="parish-cancel">Cancel Button Text</Label>
                  <Input
                    id="parish-cancel"
                    value={parishFormText.buttonCancel}
                    onChange={(e) => setParishFormText({ ...parishFormText, buttonCancel: e.target.value })}
                    placeholder="Cancel"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Common UI Text */}
        <TabsContent value="common">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Common UI Text</CardTitle>
                  <CardDescription>Customize common button labels and UI elements</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleReset('common')}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset to Defaults
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="common-loading">Loading Text</Label>
                  <Input
                    id="common-loading"
                    value={commonText.loading}
                    onChange={(e) => setCommonText({ ...commonText, loading: e.target.value })}
                    placeholder="Loading..."
                  />
                </div>

                <div>
                  <Label htmlFor="common-saving">Saving Text</Label>
                  <Input
                    id="common-saving"
                    value={commonText.saving}
                    onChange={(e) => setCommonText({ ...commonText, saving: e.target.value })}
                    placeholder="Saving..."
                  />
                </div>

                <div>
                  <Label htmlFor="common-cancel">Cancel Button</Label>
                  <Input
                    id="common-cancel"
                    value={commonText.cancel}
                    onChange={(e) => setCommonText({ ...commonText, cancel: e.target.value })}
                    placeholder="Cancel"
                  />
                </div>

                <div>
                  <Label htmlFor="common-save">Save Button</Label>
                  <Input
                    id="common-save"
                    value={commonText.save}
                    onChange={(e) => setCommonText({ ...commonText, save: e.target.value })}
                    placeholder="Save"
                  />
                </div>

                <div>
                  <Label htmlFor="common-edit">Edit Button</Label>
                  <Input
                    id="common-edit"
                    value={commonText.edit}
                    onChange={(e) => setCommonText({ ...commonText, edit: e.target.value })}
                    placeholder="Edit"
                  />
                </div>

                <div>
                  <Label htmlFor="common-delete">Delete Button</Label>
                  <Input
                    id="common-delete"
                    value={commonText.delete}
                    onChange={(e) => setCommonText({ ...commonText, delete: e.target.value })}
                    placeholder="Delete"
                  />
                </div>

                <div>
                  <Label htmlFor="common-confirm">Confirm Button</Label>
                  <Input
                    id="common-confirm"
                    value={commonText.confirm}
                    onChange={(e) => setCommonText({ ...commonText, confirm: e.target.value })}
                    placeholder="Confirm"
                  />
                </div>

                <div>
                  <Label htmlFor="common-search">Search Placeholder</Label>
                  <Input
                    id="common-search"
                    value={commonText.search}
                    onChange={(e) => setCommonText({ ...commonText, search: e.target.value })}
                    placeholder="Search"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? 'Saving Changes...' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  );
};
