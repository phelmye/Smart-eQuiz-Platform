import React, { useState, useEffect, createContext, useContext } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { User, Tenant, mockUsers, mockTenants, defaultPlans, storage, STORAGE_KEYS, initializeMockData } from '@/lib/mockData';
import { apiClient } from '@/lib/apiClient';

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
  role: 'org_admin' | 'participant' | 'spectator';
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
  }, []);
  
  // Initialize user from storage (with global state fallback) immediately to prevent flash
  const [user, setUser] = useState<User | null>(() => {
    try {
      console.log('🔍 AuthProvider initializing - checking storage...');
      
      // Add a small delay for hash-based recovery after component remounting
      const urlHash = window.location.hash;
      if (urlHash.includes('user=') && !localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
        console.log('Detected URL hash with user but no localStorage - waiting briefly for initialization');
        // Force a quick re-check after component mounts
        setTimeout(() => {
          const hashUser = storage.get(STORAGE_KEYS.CURRENT_USER);
          if (hashUser) {
            console.log('Hash user recovered on delayed check:', hashUser.email);
            setUser(hashUser);
          }
        }, 50);
      }
      
      const savedUser = storage.get(STORAGE_KEYS.CURRENT_USER);
      console.log('AuthProvider initializing with saved user:', savedUser?.email || 'none');
      
      // If we got a basic user from URL hash, upgrade to full user details
      if (savedUser?.email && !savedUser.name) {
        const allUsers = storage.get(STORAGE_KEYS.USERS) || mockUsers;
        const fullUser = allUsers.find((u: User) => u.email === savedUser.email);
        if (fullUser) {
          console.log('Upgraded URL hash user to full user:', fullUser.email);
          // Save the full user details back to storage
          storage.set(STORAGE_KEYS.CURRENT_USER, fullUser);
          return fullUser;
        }
      }
      
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
    
    // Check URL hash on every mount as a fallback
    const urlHash = window.location.hash;
    if (urlHash.includes('user=') && !user) {
      console.log('AuthProvider mounted with URL hash but no user - attempting recovery');
      const hashUser = storage.get(STORAGE_KEYS.CURRENT_USER);
      if (hashUser && hashUser.email) {
        console.log('Recovered user from hash on mount:', hashUser.email);
        setUser(hashUser);
      }
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
      // Call real API
      const response = await apiClient.login(email, password);
      console.log('🔍 API login successful:', response.user.email);
      
      const loggedInUser: User = {
        id: response.user.id,
        email: response.user.email,
        name: response.user.username || response.user.email,
        role: response.user.role || 'participant',
        tenantId: response.user.tenantId || 'default',
        xp: response.user.totalXp || 0,
        level: response.user.currentLevel || 1,
        badges: [],
        walletBalance: 0,
        createdAt: response.user.createdAt || new Date().toISOString()
      };
      
      // Save to storage
      storage.set(STORAGE_KEYS.CURRENT_USER, loggedInUser);
      
      // Set state
      setUser(loggedInUser);
      
      // Try to find tenant from mock data (will need API endpoint later)
      const userTenant = mockTenants.find(t => t.id === loggedInUser.tenantId);
      setTenant(userTenant || {
        id: loggedInUser.tenantId,
        name: 'Default Church',
        domain: 'default',
        planId: 'standard',
        settings: {},
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
      role: userData.role,
      tenantId: userData.tenantId,
      xp: 0,
      level: 1,
      badges: [],
      walletBalance: 0,
      createdAt: new Date().toISOString()
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
  const { login, register, user } = useAuth();

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
        setError('Invalid credentials. Try: admin@demo.local / password123');
      }
    } catch (err: any) {
      console.error('🔍 Login error:', err);
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
    
    try {
      const formData = new FormData(e.currentTarget);
      const userData: RegisterData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        name: formData.get('name') as string,
        tenantId: formData.get('tenantId') as string,
        role: formData.get('role') as 'org_admin' | 'participant' | 'spectator'
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
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
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  onClick={() => console.log('🔍 Sign In button clicked!')}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>

                {/* Test buttons for debugging */}
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm text-gray-600 mb-2">Debug tools:</p>
                  <button
                    type="button"
                    onClick={async () => {
                      console.log('🧪 TEST BUTTON CLICKED!');
                      alert('Test button clicked! Check console for details.');
                      
                      try {
                        console.log('🧪 Calling login function directly with test credentials...');
                        const success = await login('admin@church.com', 'password');
                        console.log('🧪 Test login result:', success);
                        
                        if (success) {
                          console.log('🧪 Test login successful!');
                          alert('Test login successful! Should navigate to dashboard.');
                        } else {
                          console.log('🧪 Test login failed');
                          alert('Test login failed - check console for details.');
                        }
                      } catch (err) {
                        console.error('🧪 Test login error:', err);
                        alert('Test login error: ' + err);
                      }
                    }}
                    style={{ 
                      padding: '8px 16px', 
                      backgroundColor: '#10b981', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer',
                      width: '100%',
                      marginBottom: '8px'
                    }}
                  >
                    🧪 Test Login (Bypass Form)
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      console.log('=== 🔍 AUTH DEBUG INFO ===');
                      console.log('Current URL:', window.location.href);
                      console.log('URL Hash:', window.location.hash);
                      console.log('LocalStorage current user:', localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
                      console.log('SessionStorage current user:', sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER));
                      console.log('AuthProvider user:', user?.email);
                      console.log('AuthProvider authenticated:', user ? true : false);
                      console.log('=== END DEBUG INFO ===');
                      
                      // Show alert with summary
                      const currentUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
                      const summary = `Debug Info:
- User in storage: ${currentUser ? 'YES' : 'NO'}
- User in AuthProvider: ${user?.email || 'NONE'}
- Is Authenticated: ${user ? 'YES' : 'NO'}
- URL: ${window.location.href}

Check browser console (F12) for detailed debug info.`;
                      alert(summary);
                    }}
                    style={{
                      padding: '8px 16px',
                      background: '#f3f4f6',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      width: '100%',
                      fontSize: '12px'
                    }}
                  >
                    🔍 Debug Auth State
                  </button>
                </div>
                
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
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
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
                  <Label htmlFor="tenantId">Organization</Label>
                  <Select name="tenantId" required>
                    <SelectTrigger id="tenantId">
                      <SelectValue placeholder="Select your organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockTenants.map(tenant => {
                        const plan = defaultPlans.find(p => p.id === tenant.planId);
                        return (
                          <SelectItem key={tenant.id} value={tenant.id}>
                            {tenant.name}
                            <Badge variant="outline" className="ml-2">
                              {plan?.displayName || 'Unknown Plan'}
                            </Badge>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select name="role" required>
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select your role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="participant">Participant</SelectItem>
                      <SelectItem value="spectator">Spectator</SelectItem>
                      <SelectItem value="org_admin">Organization Admin</SelectItem>
                    </SelectContent>
                  </Select>
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
                  disabled={isLoading}
                  onClick={() => console.log('🔍 Create Account button clicked!')}
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
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