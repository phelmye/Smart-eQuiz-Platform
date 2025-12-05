import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock admin users for demo
const mockAdmins = [
  {
    id: '1',
    email: 'admin@equiz.com',
    password: 'admin123',
    name: 'Platform Admin',
    role: 'super_admin' as const,
  },
  {
    id: '2',
    email: 'support@equiz.com',
    password: 'support123',
    name: 'Support Admin',
    role: 'admin' as const,
  },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('platform_admin_user');
    const storedToken = localStorage.getItem('platform_admin_token');
    
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('platform_admin_user');
        localStorage.removeItem('platform_admin_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Invalid credentials');
      }

      const data = await response.json();
      
      const userData: User = {
        id: data.user.id,
        name: data.user.name || data.user.email,
        email: data.user.email,
        role: data.user.role === 'SUPER_ADMIN' ? 'super_admin' : 'admin',
      };

      setUser(userData);
      setToken(data.access_token);
      localStorage.setItem('platform_admin_user', JSON.stringify(userData));
      localStorage.setItem('platform_admin_token', data.access_token);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('platform_admin_user');
    localStorage.removeItem('platform_admin_token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
