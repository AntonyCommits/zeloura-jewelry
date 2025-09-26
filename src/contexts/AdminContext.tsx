"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'moderator' | 'customer_service';
  avatar?: string;
  permissions: AdminPermission[];
  lastLogin?: Date;
}

export interface AdminPermission {
  resource: 'reviews' | 'products' | 'users' | 'orders' | 'analytics';
  actions: ('read' | 'write' | 'delete' | 'moderate')[];
}

interface AdminAuthState {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AdminContextValue extends AdminAuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (resource: string, action: string) => boolean;
}

const AdminContext = createContext<AdminContextValue | undefined>(undefined);

// Admin users will be loaded from Firebase
const mockAdmins: any[] = [];

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AdminAuthState>({
    admin: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Check for saved admin session on mount
  useEffect(() => {
    const checkAuth = () => {
      try {
        const savedAdmin = localStorage.getItem('zeloura-admin');
        if (savedAdmin) {
          const admin = JSON.parse(savedAdmin);
          setState({
            admin,
            isLoading: false,
            isAuthenticated: true,
          });
        } else {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    // TODO: Replace with Firebase authentication
    // For now, return false to indicate no mock data
    setState(prev => ({ ...prev, isLoading: false }));
    return false;
  };

  const logout = () => {
    setState({
      admin: null,
      isLoading: false,
      isAuthenticated: false,
    });
    localStorage.removeItem('zeloura-admin');
  };

  const hasPermission = (resource: string, action: string): boolean => {
    if (!state.admin) return false;

    const permission = state.admin.permissions.find(p => p.resource === resource);
    return permission ? permission.actions.includes(action as any) : false;
  };

  return (
    <AdminContext.Provider value={{
      ...state,
      login,
      logout,
      hasPermission,
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
