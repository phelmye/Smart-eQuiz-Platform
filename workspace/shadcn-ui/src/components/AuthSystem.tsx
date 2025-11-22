import React, { useState, useEffect, createContext, useContext, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Eye, EyeOff, Mail, Lock, CheckCircle2, XCircle, AlertCircle, Search, Check, ChevronsUpDown, AlertTriangle } from 'lucide-react';
import { User, Tenant, Parish, Plan, mockUsers, mockTenants, defaultPlans, storage, STORAGE_KEYS, initializeMockData, getFieldLabels, getParishesByTenant, searchParishes } from '@/lib/mockData';
import { AddParishForm } from '@/components/AddParishForm';
import { apiClient } from '@/lib/apiClient';
import { cn } from '@/lib/utils';

// TenantFooter Component - Shows tenant-specific support, terms, and copyright
interface TenantFooterProps {
  tenant: Tenant | null;
}

const TenantFooter: React.FC<TenantFooterProps> = ({ tenant }) => {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [tenantAdminEmail, setTenantAdminEmail] = useState<string>('');
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubject, setContactSubject] = useState('');

  useEffect(() => {
    if (tenant) {
      // Get tenant's plan
      const plans = storage.get(STORAGE_KEYS.PLANS) || defaultPlans;
      const tenantPlan = plans.find((p: Plan) => p.id === tenant.planId);
      setPlan(tenantPlan || null);

      // Get tenant admin email
      const users = storage.get(STORAGE_KEYS.USERS) || mockUsers;
      const orgAdmin = users.find((u: User) => u.tenantId === tenant.id && u.role === 'org_admin');
      setTenantAdminEmail(orgAdmin?.email || 'support@example.com');
    }
  }, [tenant]);

  const hasWhiteLabel = plan?.features?.some(f => 
    f.includes('White-label') || f.includes('Full custom branding') || f.includes('Custom branding')
  ) || false;

  const handleContactSupport = () => {
    setShowContactDialog(true);
  };

  const handleSendMessage = () => {
    // In production, this would send an email to the tenant admin
    console.log('Sending message to tenant admin:', {
      to: tenantAdminEmail,
      subject: contactSubject,
      message: contactMessage
    });
    
    const alertMessage = `Message sent to ${tenant?.name} support team!\n\nIn production, this will send an email to: ${tenantAdminEmail}`;
    alert(alertMessage);
    setShowContactDialog(false);
    setContactMessage('');
    setContactSubject('');
  };

  const handleTermsClick = (type: 'terms' | 'privacy' | 'security') => {
    // In production, these would link to tenant-specific pages
    const title = type.charAt(0).toUpperCase() + type.slice(1);
    const alertMessage = `${title} for ${tenant?.name}\n\nIn production, this will show ${tenant?.name}'s ${type} policy.\n\nCurrent: Using platform default until tenant uploads their own.`;
    alert(alertMessage);
  };

  return (
    <>
      <div className="text-center text-sm text-gray-600">
        <p>
          Need help?{' '}
          <button 
            onClick={handleContactSupport}
            className="text-blue-600 hover:underline cursor-pointer"
          >
            Contact {tenant?.name || 'Support'}
          </button>
        </p>
      </div>
      
      <div className="flex justify-center gap-6 text-xs text-gray-500">
        <button 
          onClick={() => handleTermsClick('terms')}
          className="hover:text-gray-700 hover:underline cursor-pointer"
        >
          Terms
        </button>
        <button 
          onClick={() => handleTermsClick('privacy')}
          className="hover:text-gray-700 hover:underline cursor-pointer"
        >
          Privacy
        </button>
        <button 
          onClick={() => handleTermsClick('security')}
          className="hover:text-gray-700 hover:underline cursor-pointer"
        >
          Security
        </button>
      </div>
      
      <div className="text-center text-xs text-gray-400">
        {hasWhiteLabel ? (
          <>
            © {new Date().getFullYear()} {tenant?.name || 'Smart eQuiz Platform'}. All rights reserved.
          </>
        ) : (
          <>
            © {new Date().getFullYear()} Smart eQuiz Platform. All rights reserved.
            {tenant && (
              <div className="mt-1 text-gray-400">
                Powering {tenant.name}
              </div>
            )}
          </>
        )}
      </div>

      {/* Contact Support Dialog */}
      <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Contact {tenant?.name} Support</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Send a message to the {tenant?.name} administrative team. They will respond to your email address.
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact-subject">Subject</Label>
              <Input
                id="contact-subject"
                placeholder="Brief description of your issue"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contact-message">Message</Label>
              <textarea
                id="contact-message"
                className="w-full min-h-[120px] px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe your question or issue in detail..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowContactDialog(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={!contactSubject || !contactMessage}
              >
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface AuthContextType {
  user: User | null;
  tenant: Tenant | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isInitializing: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  tenantId: string;
  parishId?: string;
  role: 'org_admin' | 'inspector';
}

interface AuthSystemProps {
  onAuthSuccess?: () => void;
  defaultTab?: 'login' | 'register';
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  console.log('🔍 AuthProvider component rendering');
  
  // Initialize mock data including plans
  useEffect(() => {
    initializeMockData();
    console.log('🔍 Mock data initialized including plans');
    
    // Verify role permissions are initialized correctly
    const rolePerms = storage.get(STORAGE_KEYS.ROLE_PERMISSIONS);
    const orgAdmin = rolePerms?.find((r: any) => r.roleName?.toLowerCase() === 'org_admin');
    if (orgAdmin) {
      console.log('✓ ORG_ADMIN permissions verified:', orgAdmin.componentFeatures.length, 'features');
      if (!orgAdmin.componentFeatures.includes('manage-categories')) {
        console.error('⚠️ ORG_ADMIN missing manage-categories feature! Fixing...');
        // Force re-init
        import('@/lib/mockData').then(({ forceReinitializeRolePermissions }) => {
          forceReinitializeRolePermissions();
        });
      }
    }
  }, []);
  
  // Initialize user from storage (with global state fallback) immediately to prevent flash
  const [user, setUser] = useState<User | null>(() => {
    try {
      console.log('🔍 AuthProvider initializing - checking storage...');
      
      // Clean up any URL hash that might be present
      if (window.location.hash) {
        console.log('🔍 Cleaning up URL hash:', window.location.hash);
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      
      const savedUser = storage.get(STORAGE_KEYS.CURRENT_USER);
      console.log('AuthProvider initializing with saved user:', savedUser?.email || 'none');
      
      return savedUser;
    } catch (error) {
      console.log('Error loading saved user:', error);
      return null;
    }
  });
  
  const [tenant, setTenant] = useState<Tenant | null>(() => {
    try {
      const savedUser = storage.get(STORAGE_KEYS.CURRENT_USER);
      if (savedUser) {
        const userTenant = mockTenants.find(t => t.id === savedUser.tenantId);
        console.log('AuthProvider initializing with tenant:', userTenant?.name || 'none');
        return userTenant || null;
      }
      return null;
    } catch (error) {
      console.log('Error loading tenant:', error);
      return null;
    }
  });
  
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    console.log('AuthProvider mounted, current user:', user?.email);
    
    // Clean up any URL hash that might be present
    if (window.location.hash) {
      console.log('🔍 Cleaning up URL hash on mount:', window.location.hash);
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    
    // Give a brief moment for storage to be checked and state to settle
    const timer = setTimeout(() => {
      setIsInitializing(false);
      console.log('AuthProvider initialization complete');
    }, 100);
    
    return () => clearTimeout(timer);
  }, [user]);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔍 AuthProvider login called with:', email);
    
    try {
      // Use mock authentication for development
      // Accept any password that matches the pattern (for demo purposes)
      const mockUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
      
      if (!mockUser) {
        console.log('🔍 User not found in mock data');
        return false;
      }
      
      // Find tenant and check if it's suspended
      const userTenant = mockTenants.find(t => t.id === mockUser.tenantId);
      
      // Check tenant status (skip for super_admin)
      if (mockUser.role !== 'super_admin' && userTenant) {
        const tenantStatus = userTenant.status || 'active';
        if (tenantStatus === 'suspended') {
          console.log('🔍 Login blocked: Tenant is suspended');
          throw new Error('Your account has been suspended. Please contact support for assistance.');
        }
        if (tenantStatus === 'deactivated') {
          console.log('🔍 Login blocked: Tenant is deactivated');
          throw new Error('Your account has been deactivated. Please contact support for assistance.');
        }
      }
      
      console.log('🔍 Mock login successful:', mockUser.email);
      
      const loggedInUser: User = {
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
        tenantId: mockUser.tenantId,
        xp: mockUser.xp,
        level: mockUser.level,
        badges: mockUser.badges,
        walletBalance: mockUser.walletBalance,
        createdAt: mockUser.createdAt
      };
      
      // Set tenant (fallback to default if not found)
      const finalTenant = userTenant || {
        id: loggedInUser.tenantId,
        name: 'Default Church',
        planId: 'enterprise',
        primaryColor: '#3b82f6',
        maxUsers: 1000,
        maxTournaments: 100,
        paymentIntegrationEnabled: true,
        createdAt: new Date().toISOString()
      };
      
      console.log('🔍 Setting user and tenant state...');
      
      // Save to storage FIRST
      storage.set(STORAGE_KEYS.CURRENT_USER, loggedInUser);
      
      // Update state using batched update
      Promise.resolve().then(() => {
        setUser(loggedInUser);
        setTenant(finalTenant);
        setIsInitializing(false);
        console.log('🔍 State updated - user:', loggedInUser.email);
      });
      
      console.log('🔍 Login successful, returning true');
      return true;
    } catch (error: any) {
      console.error('🔍 Login error:', error.response?.data || error.message);
      throw error; // Re-throw to show error message to user
    }
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const users = storage.get(STORAGE_KEYS.USERS) || mockUsers;
    const existingUser = users.find((u: User) => u.email === userData.email);
    
    if (existingUser) {
      return false; // User already exists
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      email: userData.email,
      name: userData.name,
      role: 'inspector', // Always start as inspector
      tenantId: userData.tenantId,
      xp: 0,
      level: 1,
      badges: [],
      walletBalance: 0,
      createdAt: new Date().toISOString(),
      practiceAccessStatus: 'none', // No practice access yet
      qualificationStatus: 'not_qualified', // Not qualified for tournaments
      hasExtendedProfile: userData.parishId ? true : false,
      profileCompletionPercentage: userData.parishId ? 20 : 10 // Higher if parish selected
    };

    users.push(newUser);
    storage.set(STORAGE_KEYS.USERS, users);
    
    // Create UserProfile if parishId provided
    if (userData.parishId) {
      const profiles = storage.get(STORAGE_KEYS.USER_PROFILES) || [];
      const newProfile = {
        userId: newUser.id,
        parishId: userData.parishId,
        profileCompletionPercentage: 20,
        isProfileComplete: false,
        createdAt: new Date().toISOString()
      };
      profiles.push(newProfile);
      storage.set(STORAGE_KEYS.USER_PROFILES, profiles);
      console.log('✅ UserProfile created with parishId:', userData.parishId);
    }
    
    setUser(newUser);
    const userTenant = mockTenants.find(t => t.id === newUser.tenantId);
    setTenant(userTenant || null);
    storage.set(STORAGE_KEYS.CURRENT_USER, newUser);
    
    console.log('✅ User registered:', newUser.email, '- Tenant:', userTenant?.name, '- Parish:', userData.parishId || 'none');
    
    return true;
  };

  const logout = () => {
    apiClient.logout().catch(err => console.error('Logout error:', err));
    setUser(null);
    setTenant(null);
    storage.remove(STORAGE_KEYS.CURRENT_USER);
  };

  const isAuthenticated = !!user;
  
  // Log auth provider state changes
  useEffect(() => {
    console.log('AuthProvider state changed:', { 
      hasUser: !!user, 
      userEmail: user?.email, 
      isAuthenticated,
      isInitializing 
    });
  }, [user, isAuthenticated, isInitializing]);

  return (
    <AuthContext.Provider value={{
      user,
      tenant,
      login,
      register,
      logout,
      isAuthenticated,
      isInitializing
    }}>
      {children}
    </AuthContext.Provider>
  );
};

const AuthForms: React.FC<{ onAuthSuccess?: () => void; defaultTab?: 'login' | 'register' }> = ({ onAuthSuccess, defaultTab = 'login' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<{score: number; feedback: string[]}>({ score: 0, feedback: [] });
  const [regPassword, setRegPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab);
  const { login, register, user } = useAuth();
  
  // Tenant detection from URL
  const detectTenantFromUrl = (): string => {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    // Development mode detection
    const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';
    
    if (isDevelopment) {
      // Check URL parameter first
      const urlParams = new URLSearchParams(window.location.search);
      const tenantParam = urlParams.get('tenant');
      if (tenantParam) {
        console.log('🔍 Tenant detected from URL parameter:', tenantParam);
        return tenantParam;
      }
      
      // Default to tenant1 for development
      console.log('🔍 Development mode: defaulting to tenant1');
      return 'tenant1';
    }
    
    // Production: subdomain detection
    // e.g., firstbaptist.smartequiz.com -> 'firstbaptist'
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      const subdomain = parts[0];
      
      // Marketing site or admin site
      if (subdomain === 'www' || subdomain === 'admin') {
        console.log('🔍 Marketing/Admin site detected, defaulting to tenant1');
        return 'tenant1';
      }
      
      // Map subdomain to tenant ID (you can expand this mapping)
      const subdomainToTenant: Record<string, string> = {
        'firstbaptist': 'tenant1',
        'grace': 'tenant2',
        'stmarys': 'tenant3',
      };
      
      const tenantId = subdomainToTenant[subdomain] || 'tenant1';
      console.log('🔍 Tenant detected from subdomain:', subdomain, '->', tenantId);
      return tenantId;
    }
    
    // Fallback
    console.log('🔍 No tenant detected, defaulting to tenant1');
    return 'tenant1';
  };
  
  // Parish management state
  const [currentTenantId] = useState(() => detectTenantFromUrl());
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [selectedParishId, setSelectedParishId] = useState<string>('');
  const [parishSearchQuery, setParishSearchQuery] = useState('');
  const [showAddParishModal, setShowAddParishModal] = useState(false);
  const [parishComboboxOpen, setParishComboboxOpen] = useState(false);
  
  // Load parishes for current tenant
  useEffect(() => {
    if (currentTenantId) {
      const tenantParishes = getParishesByTenant(currentTenantId);
      setParishes(tenantParishes);
      setSelectedTenantId(currentTenantId);
      console.log('📍 Loaded parishes for tenant:', currentTenantId, '- Count:', tenantParishes.length);
    }
  }, [currentTenantId]);
  
  // Filtered parishes based on search
  const filteredParishes = useMemo(() => {
    if (!parishSearchQuery) return parishes;
    return searchParishes(parishSearchQuery, currentTenantId);
  }, [parishes, parishSearchQuery, currentTenantId]);
  
  // Get custom field labels for selected tenant
  const fieldLabels = getFieldLabels(currentTenantId || undefined);
  
  // Get current tenant info
  const currentTenant = mockTenants.find(t => t.id === currentTenantId);
  const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  // Password strength calculator
  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    const feedback: string[] = [];
    
    if (!password) return { score: 0, feedback: ['Enter a password'] };
    
    if (password.length >= 8) score += 25;
    else feedback.push('At least 8 characters');
    
    if (password.length >= 12) score += 10;
    
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 25;
    else feedback.push('Mix uppercase and lowercase');
    
    if (/\d/.test(password)) score += 20;
    else feedback.push('Include numbers');
    
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    else feedback.push('Add special characters');
    
    return { score, feedback };
  };

  // Handle password change for strength indicator
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const pwd = e.target.value;
    setRegPassword(pwd);
    setPasswordStrength(calculatePasswordStrength(pwd));
  };

  // Handle forgot password
  const handleForgotPassword = async (email: string) => {
    setIsLoading(true);
    setError('');
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setSuccess(`Password reset instructions sent to ${email}`);
      setTimeout(() => setShowForgotPassword(false), 3000);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;

      if (!email || !password) {
        setError('Please enter both email and password');
        return;
      }

      const success = await login(email, password);
      
      if (success) {
        console.log('🔍 Login returned success, reloading page');
        setSuccess('Login successful! Loading dashboard...');
        
        // Wait a moment for storage to be written
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Force reload to ensure fresh state
        window.location.reload();
      } else {
        setError('Invalid email or password');
      }
    } catch (error: any) {
      // Display the error message from tenant suspension check
      setError(error.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('🔍 REGISTRATION FORM SUBMISSION STARTED!');
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const formData = new FormData(e.currentTarget);
      const parishId = formData.get('parishId') as string;
      
      const userData: RegisterData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        name: formData.get('name') as string,
        tenantId: formData.get('tenantId') as string,
        parishId: parishId || undefined, // Optional
        role: formData.get('role') as 'org_admin' | 'inspector'
      };
      
      console.log('🔍 Registration data:', userData);

      const success = await register(userData);
      console.log('🔍 Registration result:', success);
      
      if (success) {
        console.log('🔍 REGISTRATION SUCCESS! Setting success message and forcing navigation...');
        setSuccess('Registration successful! You are now logged in. Redirecting...');
        
        // Force navigation after a short delay
        setTimeout(() => {
          console.log('🔍 Attempting to force navigation after registration...');
          window.location.reload(); // Force reload as a fallback
        }, 2000);
        
      } else {
        console.log('🔍 Registration failed - user already exists');
        setError('User already exists with this email.');
      }
    } catch (err) {
      console.error('🔍 Registration error:', err);
      setError('Registration failed. Please try again.');
    } finally {
      console.log('🔍 Setting registration loading to false...');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">S</span>
            </div>
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Smart eQuiz Platform
          </CardTitle>
          <CardDescription className="text-base">Enterprise Bible Tournament & Practice System</CardDescription>
        </CardHeader>
        
        <CardContent>
          {showForgotPassword ? (
            // Forgot Password Form
            <div className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold">Reset Password</h3>
                <p className="text-sm text-gray-600 mt-2">Enter your email to receive reset instructions</p>
              </div>
              <form onSubmit={(e) => {
                e.preventDefault();
                const email = (e.currentTarget.elements.namedItem('reset-email') as HTMLInputElement).value;
                handleForgotPassword(email);
              }}>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="reset-email"
                        name="reset-email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="w-full" 
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError('');
                      setSuccess('');
                    }}
                  >
                    Back to Sign In
                  </Button>
                </div>
              </form>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'login' | 'register')} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Create Account</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4 mt-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-email"
                        name="email"
                        type="email"
                        placeholder="your@email.com"
                        defaultValue="admin@demo.local"
                        className="pl-10"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="login-password">Password</Label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        defaultValue="password123"
                        className="pl-10 pr-10"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label 
                      htmlFor="remember" 
                      className="text-sm font-normal cursor-pointer"
                    >
                      Remember me for 30 days
                    </Label>
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing In...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4 mt-4">
                {isDevelopment && (
                  <Alert className="mb-4 bg-yellow-50 border-yellow-200">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <AlertDescription className="text-sm text-yellow-800">
                      <strong>Development Mode:</strong> Tenant detected as{' '}
                      <span className="font-mono font-semibold">{currentTenant?.name || currentTenantId}</span>
                      {window.location.search.includes('tenant=') && ' (from URL parameter)'}
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="mb-4 text-center">
                  <h3 className="text-lg font-semibold text-gray-900">Join {currentTenant?.name || 'Our Community'}</h3>
                  <p className="text-sm text-gray-600 mt-1">Create your account to participate in tournaments</p>
                </div>
                
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Full Name</Label>
                    <Input
                      id="reg-name"
                      name="name"
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Email Address</Label>
                    <Input
                      id="reg-email"
                      name="email"
                      type="email"
                      placeholder="your@email.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <div className="relative">
                      <Input
                        id="reg-password"
                        name="password"
                        type={showRegPassword ? 'text' : 'password'}
                        placeholder="Create a password (min. 8 characters)"
                        className="pr-10"
                        value={regPassword}
                        onChange={handlePasswordChange}
                        autoComplete="new-password"
                        minLength={8}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {regPassword && passwordStrength.score < 100 && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all ${
                                passwordStrength.score < 25 ? 'bg-red-500 w-1/4' :
                                passwordStrength.score < 50 ? 'bg-orange-500 w-1/2' :
                                passwordStrength.score < 75 ? 'bg-yellow-500 w-3/4' :
                                'bg-green-500 w-full'
                              }`}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-600">
                            {passwordStrength.score < 25 ? 'Weak' :
                             passwordStrength.score < 50 ? 'Fair' :
                             passwordStrength.score < 75 ? 'Good' :
                             'Strong'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-confirm-password">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="reg-confirm-password"
                        name="confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Re-enter your password"
                        className="pr-10"
                        autoComplete="new-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  {/* Parish Selection with Combobox */}
                  <div className="space-y-2">
                    <Label htmlFor="parishId">
                      {fieldLabels.parishSingular}
                      <span className="text-gray-500 text-xs ml-2">(Optional - can be added later)</span>
                    </Label>
                    <Popover open={parishComboboxOpen} onOpenChange={setParishComboboxOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={parishComboboxOpen}
                          className="w-full justify-between"
                        >
                          {selectedParishId
                            ? (() => {
                                const parish = parishes.find((p) => p.id === selectedParishId);
                                return (
                                  <span className="flex items-center gap-2">
                                    {parish?.name}
                                    {!parish?.isVerified && (
                                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Pending Verification
                                      </Badge>
                                    )}
                                  </span>
                                );
                              })()
                            : `Select your ${fieldLabels.parishSingular.toLowerCase()}...`}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput 
                            placeholder={`Search ${fieldLabels.parishPlural.toLowerCase()}...`}
                            value={parishSearchQuery}
                            onValueChange={setParishSearchQuery}
                          />
                          <CommandEmpty>
                            <div className="py-6 text-center text-sm">
                              <p className="text-gray-500 mb-3">No {fieldLabels.parishSingular.toLowerCase()} found.</p>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setParishComboboxOpen(false);
                                  setShowAddParishModal(true);
                                }}
                              >
                                Add New {fieldLabels.parishSingular}
                              </Button>
                            </div>
                          </CommandEmpty>
                          <CommandGroup>
                            {filteredParishes.map((parish) => (
                              <CommandItem
                                key={parish.id}
                                value={parish.id}
                                onSelect={(currentValue) => {
                                  setSelectedParishId(currentValue === selectedParishId ? "" : currentValue);
                                  setParishComboboxOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    selectedParishId === parish.id ? "opacity-100" : "opacity-0"
                                  )}
                                />
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <span>{parish.name}</span>
                                    {!parish.isVerified && (
                                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 text-xs">
                                        <AlertTriangle className="h-3 w-3 mr-1" />
                                        Unverified
                                      </Badge>
                                    )}
                                  </div>
                                  {parish.location?.address && (
                                    <p className="text-xs text-gray-500 mt-0.5">{parish.location.address}</p>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    
                    <div className="flex items-center justify-between text-sm">
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-blue-600"
                        onClick={() => setShowAddParishModal(true)}
                      >
                        + Add new {fieldLabels.parishSingular.toLowerCase()}
                      </Button>
                      {selectedParishId && !parishes.find(p => p.id === selectedParishId)?.isVerified && (
                        <span className="text-xs text-yellow-700 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Will be verified by admin
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <input type="hidden" name="tenantId" value={currentTenantId} />
                  <input type="hidden" name="parishId" value={selectedParishId} />
                  <input type="hidden" name="role" value="inspector" />
                  
                  <div className="flex items-start space-x-2">
                    <Checkbox id="terms" required />
                    <Label 
                      htmlFor="terms" 
                      className="text-sm font-normal leading-relaxed cursor-pointer"
                    >
                      I agree to the{' '}
                      <a href="/terms" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        Terms of Service
                      </a>{' '}
                      and{' '}
                      <a href="/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        Privacy Policy
                      </a>
                    </Label>
                  </div>
                  
                  <Alert className="bg-blue-50 border-blue-200">
                    <AlertDescription className="text-sm text-blue-800">
                      <strong>🎯 Ready to compete?</strong><br/>
                      After registration, you'll apply for Practice Mode to prepare for tournaments.
                      {selectedParishId && !parishes.find(p => p.id === selectedParishId)?.isVerified && (
                        <><br/><br/><strong>Note:</strong> Your selected {fieldLabels.parishSingular.toLowerCase()} will need admin verification before you can participate in tournaments.</>
                      )}
                    </AlertDescription>
                  </Alert>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">{success}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700" 
                    disabled={isLoading}
                    onClick={() => console.log('🔍 Create Account button clicked!')}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-4 border-t pt-6">
          <TenantFooter tenant={currentTenant} />
        </CardFooter>
      </Card>
      
      {/* Add Parish Modal */}
      <Dialog open={showAddParishModal} onOpenChange={setShowAddParishModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New {fieldLabels.parishSingular}</DialogTitle>
          </DialogHeader>
          <AddParishForm
            overrideTenantId={currentTenantId}
            overrideUserId="registration_user"
            onSuccess={(parishId) => {
              // Refresh parish list
              const updatedParishes = getParishesByTenant(currentTenantId);
              setParishes(updatedParishes);
              
              // Auto-select the newly added parish
              setSelectedParishId(parishId);
              
              // Close modal
              setShowAddParishModal(false);
              
              // Show success message
              setSuccess(`${fieldLabels.parishSingular} added successfully! You can now complete your registration.`);
              setTimeout(() => setSuccess(''), 5000);
            }}
            onCancel={() => setShowAddParishModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Main AuthSystem component that combines AuthProvider and AuthForms
export const AuthSystem: React.FC<AuthSystemProps> = ({ onAuthSuccess, defaultTab }) => {
  return (
    <AuthProvider>
      <AuthForms onAuthSuccess={onAuthSuccess} defaultTab={defaultTab} />
    </AuthProvider>
  );
};