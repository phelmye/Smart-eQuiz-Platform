import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  FileDown,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Trophy,
  Clock,
  Mail,
  Plus,
  Eye,
  Trash2,
  Filter
} from 'lucide-react';

interface ReportingExportsProps {
  user: any;
  tenant: any;
  onBack?: () => void;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'tournaments' | 'users' | 'financial' | 'questions' | 'custom';
  fields: string[];
  format: 'pdf' | 'excel' | 'csv';
  icon: any;
}

interface ScheduledReport {
  id: string;
  name: string;
  template: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  nextRun: string;
  lastRun: string | null;
  active: boolean;
}

const REPORT_TEMPLATES: ReportTemplate[] = [
  {
    id: 'tournament-summary',
    name: 'Tournament Summary',
    description: 'Overview of all tournaments including participants and results',
    type: 'tournaments',
    fields: ['name', 'startDate', 'endDate', 'participants', 'winner', 'status'],
    format: 'pdf',
    icon: Trophy
  },
  {
    id: 'user-activity',
    name: 'User Activity Report',
    description: 'Detailed user engagement and activity metrics',
    type: 'users',
    fields: ['name', 'email', 'joinDate', 'lastActive', 'tournamentsParticipated', 'avgScore'],
    format: 'excel',
    icon: Users
  },
  {
    id: 'financial-overview',
    name: 'Financial Overview',
    description: 'Revenue, subscriptions, and payment transactions',
    type: 'financial',
    fields: ['date', 'subscriptionRevenue', 'tournamentFees', 'totalRevenue', 'transactionCount'],
    format: 'excel',
    icon: DollarSign
  },
  {
    id: 'question-bank',
    name: 'Question Bank Export',
    description: 'Complete export of all questions with metadata',
    type: 'questions',
    fields: ['question', 'category', 'difficulty', 'correctAnswer', 'createdBy', 'usageCount'],
    format: 'csv',
    icon: FileText
  }
];

const EXPORT_FORMATS = [
  { id: 'pdf', label: 'PDF', icon: FileText },
  { id: 'excel', label: 'Excel', icon: FileDown },
  { id: 'csv', label: 'CSV', icon: Download }
];

const ReportingExports: React.FC<ReportingExportsProps> = ({ user, tenant, onBack }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('quick-export');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [exportFormat, setExportFormat] = useState<string>('pdf');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: 'sched-1',
      name: 'Monthly Financial Summary',
      template: 'financial-overview',
      frequency: 'monthly',
      recipients: ['admin@example.com', 'finance@example.com'],
      nextRun: '2025-12-01',
      lastRun: '2025-11-01',
      active: true
    },
    {
      id: 'sched-2',
      name: 'Weekly User Activity',
      template: 'user-activity',
      frequency: 'weekly',
      recipients: ['admin@example.com'],
      nextRun: '2025-11-23',
      lastRun: '2025-11-16',
      active: true
    }
  ]);

  // Custom report builder state
  const [customReportName, setCustomReportName] = useState('');
  const [customReportType, setCustomReportType] = useState('tournaments');
  const [customFields, setCustomFields] = useState<string[]>([]);

  const handleQuickExport = (templateId: string) => {
    const template = REPORT_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      toast({
        title: "Generating Report",
        description: `Generating ${template.name} in ${exportFormat.toUpperCase()} format. This will download shortly.`
      });
      // In real app, this would trigger actual file generation
    }
  };

  const handleCustomExport = () => {
    if (selectedFields.length === 0) {
      toast({
        title: "Fields Required",
        description: "Please select at least one field to export",
        variant: "destructive"
      });
      return;
    }

    if (!dateRange.start || !dateRange.end) {
      toast({
        title: "Date Range Required",
        description: "Please select a date range",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Generating Custom Report",
      description: `Generating custom report with ${selectedFields.length} fields from ${dateRange.start} to ${dateRange.end} in ${exportFormat.toUpperCase()} format.`
    });
  };

  const handleSaveCustomReport = () => {
    if (!customReportName.trim()) {
      toast({
        title: "Name Required",
        description: "Please enter a report name",
        variant: "destructive"
      });
      return;
    }

    if (customFields.length === 0) {
      toast({
        title: "Fields Required",
        description: "Please select at least one field",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Report Saved",
      description: `Custom report "${customReportName}" saved successfully!`
    });
    setCustomReportName('');
    setCustomFields([]);
  };

  const handleScheduleReport = (reportId: string) => {
    // TODO: Implement schedule report dialog
    console.log('Schedule report dialog for:', reportId);
    toast({
      title: "Coming Soon",
      description: "Schedule report feature will be available soon"
    });
  };

  const handleToggleScheduledReport = (reportId: string) => {
    setScheduledReports(prev => prev.map(r =>
      r.id === reportId ? { ...r, active: !r.active } : r
    ));
  };

  const handleDeleteScheduledReport = (reportId: string) => {
    if (confirm('Delete this scheduled report?')) {
      setScheduledReports(prev => prev.filter(r => r.id !== reportId));
      toast({
        title: "Report Deleted",
        description: "Scheduled report deleted"
      });
    }
  };

  const toggleField = (field: string) => {
    setSelectedFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const toggleCustomField = (field: string) => {
    setCustomFields(prev =>
      prev.includes(field)
        ? prev.filter(f => f !== field)
        : [...prev, field]
    );
  };

  const getFieldsForType = (type: string) => {
    switch (type) {
      case 'tournaments':
        return ['name', 'startDate', 'endDate', 'participants', 'status', 'winner', 'prize', 'entryFee'];
      case 'users':
        return ['name', 'email', 'role', 'joinDate', 'lastActive', 'tournamentsJoined', 'avgScore', 'status'];
      case 'financial':
        return ['date', 'type', 'amount', 'currency', 'status', 'paymentMethod', 'invoice', 'description'];
      case 'questions':
        return ['question', 'category', 'difficulty', 'correctAnswer', 'options', 'createdBy', 'createdDate', 'usageCount'];
      default:
        return [];
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <FileDown className="h-8 w-8 text-blue-600" />
                Reporting & Exports
              </h1>
              <p className="text-gray-600 mt-2">Generate reports and export your data</p>
            </div>
            {onBack && (
              <Button variant="outline" onClick={onBack}>
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="quick-export">
              <Download className="h-4 w-4 mr-2" />
              Quick Export
            </TabsTrigger>
            <TabsTrigger value="custom">
              <Filter className="h-4 w-4 mr-2" />
              Custom Report
            </TabsTrigger>
            <TabsTrigger value="scheduled">
              <Clock className="h-4 w-4 mr-2" />
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="templates">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
          </TabsList>

          {/* Quick Export Tab */}
          <TabsContent value="quick-export">
            <div className="grid gap-6 md:grid-cols-2">
              {REPORT_TEMPLATES.map(template => {
                const Icon = template.icon;
                return (
                  <Card key={template.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Icon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{template.name}</CardTitle>
                            <CardDescription className="mt-1">{template.description}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label className="text-sm text-gray-600 mb-2 block">Included Fields ({template.fields.length})</Label>
                        <div className="flex flex-wrap gap-1">
                          {template.fields.slice(0, 4).map(field => (
                            <Badge key={field} variant="outline" className="text-xs">
                              {field}
                            </Badge>
                          ))}
                          {template.fields.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{template.fields.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickExport(template.id)}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          PDF
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setExportFormat('excel');
                            handleQuickExport(template.id);
                          }}
                        >
                          <FileDown className="h-4 w-4 mr-2" />
                          Excel
                        </Button>
                      </div>

                      <Button
                        className="w-full"
                        onClick={() => handleScheduleReport(template.id)}
                      >
                        <Clock className="h-4 w-4 mr-2" />
                        Schedule Report
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Custom Report Tab */}
          <TabsContent value="custom">
            <Card>
              <CardHeader>
                <CardTitle>Build Custom Report</CardTitle>
                <CardDescription>Select specific fields and filters for your export</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Report Type Selection */}
                <div>
                  <Label>Report Type</Label>
                  <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tournaments">Tournaments</SelectItem>
                      <SelectItem value="users">Users</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="questions">Questions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Field Selection */}
                {selectedTemplate && (
                  <div>
                    <Label className="mb-3 block">Select Fields to Include</Label>
                    <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg bg-gray-50">
                      {getFieldsForType(selectedTemplate).map(field => (
                        <div key={field} className="flex items-center space-x-2">
                          <Checkbox
                            id={field}
                            checked={selectedFields.includes(field)}
                            onCheckedChange={() => toggleField(field)}
                          />
                          <label
                            htmlFor={field}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {field}
                          </label>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedFields.length} field{selectedFields.length !== 1 ? 's' : ''} selected
                    </p>
                  </div>
                )}

                {/* Export Format */}
                <div>
                  <Label>Export Format</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    {EXPORT_FORMATS.map(format => {
                      const Icon = format.icon;
                      return (
                        <Button
                          key={format.id}
                          variant={exportFormat === format.id ? 'default' : 'outline'}
                          onClick={() => setExportFormat(format.id)}
                          className="w-full"
                        >
                          <Icon className="h-4 w-4 mr-2" />
                          {format.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    className="flex-1"
                    onClick={handleCustomExport}
                    disabled={!selectedTemplate || selectedFields.length === 0}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Generate Export
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setSelectedTemplate('');
                    setSelectedFields([]);
                    setDateRange({ start: '', end: '' });
                  }}>
                    Clear
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Scheduled Reports Tab */}
          <TabsContent value="scheduled">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Scheduled Reports</CardTitle>
                    <CardDescription>Automatically generated reports delivered via email</CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Schedule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scheduledReports.map(report => (
                    <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`p-2 rounded-lg ${report.active ? 'bg-green-100' : 'bg-gray-100'}`}>
                          <Clock className={`h-5 w-5 ${report.active ? 'text-green-600' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{report.name}</h4>
                            <Badge variant={report.active ? 'default' : 'secondary'}>
                              {report.active ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant="outline">{report.frequency}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            Template: {REPORT_TEMPLATES.find(t => t.id === report.template)?.name || report.template}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {report.recipients.length} recipient{report.recipients.length !== 1 ? 's' : ''}
                            </span>
                            <span>Next: {formatDate(report.nextRun)}</span>
                            {report.lastRun && <span>Last: {formatDate(report.lastRun)}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleScheduledReport(report.id)}
                        >
                          {report.active ? 'Pause' : 'Resume'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteScheduledReport(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Report Templates</CardTitle>
                    <CardDescription>Create and manage custom report templates</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Create Template Form */}
                <div className="p-4 border rounded-lg bg-gray-50 space-y-4">
                  <h3 className="font-semibold">Create New Template</h3>
                  
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input
                      id="template-name"
                      placeholder="e.g., Weekly Performance Report"
                      value={customReportName}
                      onChange={(e) => setCustomReportName(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="template-type">Report Type</Label>
                    <Select value={customReportType} onValueChange={setCustomReportType}>
                      <SelectTrigger id="template-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tournaments">Tournaments</SelectItem>
                        <SelectItem value="users">Users</SelectItem>
                        <SelectItem value="financial">Financial</SelectItem>
                        <SelectItem value="questions">Questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="mb-3 block">Select Fields</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {getFieldsForType(customReportType).map(field => (
                        <div key={field} className="flex items-center space-x-2">
                          <Checkbox
                            id={`custom-${field}`}
                            checked={customFields.includes(field)}
                            onCheckedChange={() => toggleCustomField(field)}
                          />
                          <label
                            htmlFor={`custom-${field}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                          >
                            {field}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleSaveCustomReport} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Save Template
                  </Button>
                </div>

                {/* Existing Templates */}
                <div>
                  <h3 className="font-semibold mb-3">Saved Templates</h3>
                  <div className="space-y-2">
                    {REPORT_TEMPLATES.map(template => {
                      const Icon = template.icon;
                      return (
                        <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Icon className="h-5 w-5 text-blue-600" />
                            <div>
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-gray-600">{template.fields.length} fields • {template.format.toUpperCase()}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              Use Template
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ReportingExports;
