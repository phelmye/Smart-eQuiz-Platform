import React, { useState, useEffect, createContext, useContext } from 'react';
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
import { Eye, EyeOff, Mail, Lock, Chrome, Apple, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { User, Tenant, mockUsers, mockTenants, defaultPlans, storage, STORAGE_KEYS, initializeMockData, getFieldLabels, getCustomText, getParishesByTenant, searchParishes, Parish } from '@/lib/mockData';
import { apiClient } from '@/lib/apiClient';
import { AddParishForm } from '@/components/AddParishForm';
import { useTenant } from '@/contexts/TenantContext';

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
      
      // Save to storage
      storage.set(STORAGE_KEYS.CURRENT_USER, loggedInUser);
      
      // Set state
      setUser(loggedInUser);
      
      // Find tenant from mock data
      const userTenant = mockTenants.find(t => t.id === loggedInUser.tenantId);
      setTenant(userTenant || {
        id: loggedInUser.tenantId,
        name: 'Default Church',
        planId: 'enterprise',
        primaryColor: '#3b82f6',
        maxUsers: 1000,
        maxTournaments: 100,
        paymentIntegrationEnabled: true,
        createdAt: new Date().toISOString()
      });
      
      setIsInitializing(false);
      
      console.log('🔍 Login successful, user state set');
      return true;
    } catch (error: any) {
      console.error('🔍 Login error:', error.response?.data || error.message);
      return false;
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
      parishId: userData.parishId, // Store the selected parish
      xp: 0,
      level: 1,
      badges: [],
      walletBalance: 0,
      createdAt: new Date().toISOString(),
      practiceAccessStatus: 'none', // No practice access yet
      qualificationStatus: 'not_qualified' // Not qualified for tournaments
    };

    users.push(newUser);
    storage.set(STORAGE_KEYS.USERS, users);
    
    setUser(newUser);
    const userTenant = mockTenants.find(t => t.id === newUser.tenantId);
    setTenant(userTenant || null);
    storage.set(STORAGE_KEYS.CURRENT_USER, newUser);
    
    return true;
  };

  const logout = () => {
    apiClient.logout().catch(err => console.error('Logout error:', err));
    setUser(null);
    setTenant(null);
    storage.remove(STORAGE_KEYS.CURRENT_USER);
    // Redirect to marketing site after logout
    window.location.href = 'http://localhost:3000';
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

const AuthForms: React.FC<{ onAuthSuccess?: () => void }> = ({ onAuthSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedParishId, setSelectedParishId] = useState<string>('');
  const [parishSearchQuery, setParishSearchQuery] = useState('');
  const [showAddParishForm, setShowAddParishForm] = useState(false);
  const { login, register, user } = useAuth();
  const { tenant } = useTenant(); // Get current tenant from subdomain
  
  // Get custom field labels for current tenant
  const fieldLabels = getFieldLabels(tenant?.id);
  
  // Get custom text for current tenant
  const customText = getCustomText(tenant?.id);
  
  // Get parishes filtered by current tenant (tenant isolation)
  const parishes = tenant?.id && parishSearchQuery
    ? searchParishes(parishSearchQuery, tenant.id)
    : [];

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('🔍 FORM SUBMISSION STARTED!');
    console.log('🔍 Event object:', e);
    e.preventDefault();
    console.log('🔍 preventDefault called, setting loading state...');
    
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get('email') as string;
      const password = formData.get('password') as string;
      console.log('🔍 Form data extracted:', { email, password });

      if (!email || !password) {
        console.log('🔍 ERROR: Missing email or password');
        setError('Please enter both email and password');
        return;
      }

      console.log('🔍 About to call login function...');
      
      const success = await login(email, password);
      console.log('🔍 Login function returned:', success);
      
      if (success) {
        console.log('🔍 LOGIN SUCCESS! Setting success message and forcing navigation...');
        setSuccess('Login successful! Redirecting...');
        
        // Force navigation after a short delay to ensure state propagates
        setTimeout(() => {
          console.log('🔍 Attempting to force navigation...');
          window.location.reload(); // Force reload as a fallback
        }, 1500);
        
      } else {
        console.log('🔍 Login failed - invalid credentials');
        setError('Invalid credentials. Try: admin@church.com (any password)');
      }
    } catch (err: any) {
      console.error('🔍 Login error:', err);
      setError('Login error. Try: admin@church.com (any password)');
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      console.log('🔍 Setting loading to false...');
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log('🔍 REGISTRATION FORM SUBMISSION STARTED!');
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    if (!tenant?.id) {
      setError('Tenant information not available. Please refresh the page.');
      setIsLoading(false);
      return;
    }
    
    try {
      const formData = new FormData(e.currentTarget);
      const userData: RegisterData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        name: formData.get('name') as string,
        tenantId: tenant.id, // Use current tenant from subdomain
        parishId: selectedParishId || undefined,
        role: formData.get('role') as 'org_admin' | 'participant'
      };
      
      // Validate parish selection
      if (!selectedParishId) {
        setError(`Please select your ${fieldLabels.parishSingular.toLowerCase()} or register a new one.`);
        setIsLoading(false);
        return;
      }
      
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
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--color-background, #f9fafb)' }}>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-900">Smart eQuiz Platform</CardTitle>
          <CardDescription>Bible Tournament & Practice System</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    defaultValue="admin@demo.local"
                    autoComplete="email"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input
                    id="login-password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    defaultValue="password123"
                    autoComplete="current-password"
                    required
                  />
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="remember"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700">Remember me</span>
                  </label>
                  <a
                    href="http://localhost:3000/forgot-password"
                    className="text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    {success}
                  </div>
                )}
              </form>
            </TabsContent>
            
            <TabsContent value="register">
              {showAddParishForm ? (
                <div className="space-y-4">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowAddParishForm(false)}
                    className="mb-2"
                  >
                    ← Back to Registration
                  </Button>
                  <AddParishForm
                    tenantId={tenant?.id}
                    onSuccess={(parishId) => {
                      setSelectedParishId(parishId);
                      setShowAddParishForm(false);
                      setSuccess(`${fieldLabels.parishSingular} registered successfully! Please complete your registration.`);
                    }}
                    onCancel={() => setShowAddParishForm(false)}
                  />
                </div>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  {tenant && (
                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertDescription className="text-sm text-blue-800">
                        <strong>Registering under:</strong> {tenant.name}
                      </AlertDescription>
                    </Alert>
                  )}
                  
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
                    <Label htmlFor="reg-email">Email</Label>
                    <Input
                      id="reg-email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      name="password"
                      type="password"
                      placeholder="Create a password"
                      autoComplete="new-password"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="parishSearch">
                      {fieldLabels.parishSingular} *
                    </Label>
                    <p className="text-sm text-gray-600 mb-2">
                      {customText.registration.parishSearchHelper}
                    </p>
                    <Input
                      id="parishSearch"
                      placeholder={customText.registration.parishSearchPlaceholder}
                      value={parishSearchQuery}
                      onChange={(e) => setParishSearchQuery(e.target.value)}
                      className="mb-2"
                    />
                    
                    {parishes.length > 0 ? (
                      <div className="border rounded-md max-h-48 overflow-y-auto">
                        {parishes.map((parish) => (
                          <div
                            key={parish.id}
                            onClick={() => {
                              setSelectedParishId(parish.id);
                              setParishSearchQuery(parish.name);
                            }}
                            className={`p-3 cursor-pointer hover:bg-gray-100 border-b last:border-b-0 ${
                              selectedParishId === parish.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium">{parish.name}</div>
                                <div className="text-sm text-gray-600">{parish.location.address}</div>
                              </div>
                              {parish.isVerified && (
                                <Badge variant="secondary" className="ml-2">
                                  Verified
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : parishSearchQuery ? (
                      <Alert className="bg-amber-50 border-amber-200">
                        <AlertDescription className="text-sm text-amber-800">
                          No {fieldLabels.parishSingular.toLowerCase()} found matching "{parishSearchQuery}".
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert className="bg-blue-50 border-blue-200">
                        <AlertDescription className="text-sm text-blue-800">
                          Start typing to search for your {fieldLabels.parishSingular.toLowerCase()}, or register it if not found.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    <div className="flex items-center justify-between pt-2">
                      <p className="text-sm text-gray-600">
                        {selectedParishId 
                          ? `Selected: ${parishes.find(p => p.id === selectedParishId)?.name}` 
                          : `Can't find your ${fieldLabels.parishSingular.toLowerCase()}?`
                        }
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddParishForm(true)}
                      >
                        + {customText.registration.buttonRegisterParish}
                      </Button>
                    </div>
                  </div>
                  
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  {success && (
                    <Alert>
                      <AlertDescription>{success}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || !selectedParishId}
                    onClick={() => console.log('🔍 Create Account button clicked!')}
                  >
                    {isLoading ? 'Creating Account...' : customText.registration.buttonRegister}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

// Main AuthSystem component that combines AuthProvider and AuthForms
export const AuthSystem: React.FC<AuthSystemProps> = ({ onAuthSuccess }) => {
  return (
    <AuthProvider>
      <AuthForms onAuthSuccess={onAuthSuccess} />
    </AuthProvider>
  );
};