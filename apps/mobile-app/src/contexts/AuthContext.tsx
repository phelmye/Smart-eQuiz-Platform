console.log('📦 AuthContext.tsx loading...');

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

console.log('📦 Importing apiClient...');
import { apiClient } from '../api/client';

console.log('📦 Importing AsyncStorage...');
import AsyncStorage from '@react-native-async-storage/async-storage';

console.log('📦 AuthContext imports complete');

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@smart_equiz_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthProvider: Starting initialization...');
    // Load cached user on app start
    loadCachedUser();
  }, []);

  const loadCachedUser = async () => {
    try {
      console.log('🔐 AuthProvider: Loading cached user...');
      const cachedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (cachedUser) {
        console.log('🔐 AuthProvider: Found cached user');
        setUser(JSON.parse(cachedUser));
      } else {
        console.log('🔐 AuthProvider: No cached user found');
      }
      
      // Try to refresh user data from API
      const token = await apiClient.getToken();
      if (token) {
        console.log('🔐 AuthProvider: Token found, refreshing user...');
        await refreshUser();
      } else {
        console.log('🔐 AuthProvider: No token found');
      }
    } catch (error) {
      console.error('❌ AuthProvider: Error loading cached user:', error);
    } finally {
      console.log('✓ AuthProvider: Initialization complete, isLoading = false');
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiClient.login(email, password);
      const userData: User = response.user;
      
      setUser(userData);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await apiClient.getProfile();
      setUser(userData);
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error refreshing user:', error);
      // If refresh fails, clear user data
      setUser(null);
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
