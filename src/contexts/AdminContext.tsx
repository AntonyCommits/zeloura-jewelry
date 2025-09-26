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

// Mock admin users for development
const mockAdmins: AdminUser[] = [
  {
    id: '1',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'super_admin',
    permissions: [
      { resource: 'reviews', actions: ['read', 'moderate'] },
      { resource: 'products', actions: ['read', 'write', 'delete'] },
      { resource: 'users', actions: ['read', 'write'] },
      { resource: 'orders', actions: ['read'] },
      { resource: 'analytics', actions: ['read'] },
    ],
    lastLogin: new Date()
  },
  {
    id: '2',
    email: 'moderator@example.com',
    name: 'Moderator User',
    role: 'moderator',
    permissions: [
      { resource: 'reviews', actions: ['read', 'moderate'] },
      { resource: 'products', actions: ['read'] },
    ],
    lastLogin: new Date()
  }
];

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

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Find admin by email
    const admin = mockAdmins.find((admin: AdminUser) => admin.email === email);
    
    // For demo purposes, any password works
    if (admin) {
      const adminWithLogin = {
        ...admin,
        lastLogin: new Date()
      };
      
      // Save to localStorage
      localStorage.setItem('zeloura-admin', JSON.stringify(adminWithLogin));
      
      // Update state
      setState({
        admin: adminWithLogin,
        isLoading: false,
        isAuthenticated: true,
      });
      
      return true;
    }
    
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
  
  // Add debug logging
  useEffect(() => {
    console.log('useAdmin state:', {
      admin: context.admin,
      isAuthenticated: context.isAuthenticated,
      isLoading: context.isLoading,
      hasPermission: context.hasPermission
    });
  }, [context]);
  
  return context;
};
