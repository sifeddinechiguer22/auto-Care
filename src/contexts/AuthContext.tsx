import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role, AuthResponse } from '../types';
import { authService } from '../services/api';
import {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  DEMO_MODE_KEY,
  apiClient,
} from '../api/client';
import { INITIAL_USERS } from '../api/seedData';

interface AuthContextType {
  user: User | null;
  role: Role | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDemoMode: boolean;
  login: (email: string, password?: string) => Promise<AuthResponse>;
  logout: () => void;
  toggleDemoMode: (enabled: boolean) => void;
  switchRoleQuick: (role: Role) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(apiClient.isDemoMode());

  // Restore authentication state from storage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
      const storedUser = localStorage.getItem(USER_STORAGE_KEY);

      if (storedToken && storedUser) {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setRole(parsedUser.role);
        setToken(storedToken);
      } else {
        // Auto initialize default Admin session for immediate developer preview
        const defaultAdmin = INITIAL_USERS[0];
        setUser(defaultAdmin);
        setRole(defaultAdmin.role);
        const demoToken = 'mock-token-admin-auto';
        setToken(demoToken);
        localStorage.setItem(TOKEN_STORAGE_KEY, demoToken);
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(defaultAdmin));
      }
    } catch (e) {
      console.error('Failed to load initial auth state', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password?: string): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const res = await authService.login({ email, password });
      setUser(res.user);
      setRole(res.role);
      setToken(res.access_token);
      apiClient.setToken(res.access_token);
      localStorage.setItem(TOKEN_STORAGE_KEY, res.access_token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.user));
      return res;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setRole(null);
    setToken(null);
    apiClient.removeToken();
  }, []);

  const toggleDemoMode = useCallback((enabled: boolean) => {
    apiClient.setDemoMode(enabled);
    setIsDemoMode(enabled);
  }, []);

  // Quick switch for easy testing of Admin vs Garagiste in the UI
  const switchRoleQuick = useCallback((targetRole: Role) => {
    const targetUser = INITIAL_USERS.find((u) => u.role === targetRole) || INITIAL_USERS[0];
    setUser(targetUser);
    setRole(targetRole);
    const mockToken = `mock-token-${targetUser.id}`;
    setToken(mockToken);
    localStorage.setItem(TOKEN_STORAGE_KEY, mockToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(targetUser));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        isDemoMode,
        login,
        logout,
        toggleDemoMode,
        switchRoleQuick,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
