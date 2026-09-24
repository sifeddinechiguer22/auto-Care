import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Role, AuthResponse, normalizeUser } from '../types';
import { authService } from '../services/api';
import {
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
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
        const parsedUser = JSON.parse(storedUser) as User;
        const normalizedUser = normalizeUser(parsedUser) ?? parsedUser;
        setUser(normalizedUser);
        setRole(normalizedUser.role);
        setToken(storedToken);
      } else {
        setUser(null);
        setRole(null);
        setToken(null);
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
      const normalizedUser = normalizeUser(res.user) ?? res.user;
      setUser(normalizedUser);
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
    setIsDemoMode(false);
  }, []);

  // Quick switch is disabled for the production app; authentication is always backend-driven.
  const switchRoleQuick = useCallback((targetRole: Role) => {
    if (!user) {
      setRole(targetRole);
      return;
    }
    const nextUser: User = { ...user, role: targetRole };
    setUser(nextUser);
    setRole(targetRole);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(nextUser));
  }, [user]);

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
