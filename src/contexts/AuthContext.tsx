"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile as fbUpdateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  addresses?: Address[];
  wishlist?: string[];
  isAdmin?: boolean;
}

export interface Address {
  id: string;
  type: 'home' | 'office' | 'other';
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Firestore helpers
const userDocRef = (uid: string) => doc(db, 'users', uid);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  // Firebase auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        // Load profile from Firestore (create if missing)
        try {
          const snap = await getDoc(userDocRef(fbUser.uid));
          let profile: User;
          if (snap.exists()) {
            profile = snap.data() as User;
          } else {
            profile = {
              id: fbUser.uid,
              email: fbUser.email || '',
              name: fbUser.displayName || fbUser.email || 'User',
              wishlist: [],
              addresses: [],
              isAdmin: false,
            };
            await setDoc(userDocRef(fbUser.uid), profile);
          }

          // Auto-grant admin if email is in allowlist env var
          try {
            const allowlist = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || '')
              .split(',')
              .map(e => e.trim().toLowerCase())
              .filter(Boolean);
            const email = (fbUser.email || '').toLowerCase();
            if (email && allowlist.includes(email) && !profile.isAdmin) {
              await updateDoc(userDocRef(fbUser.uid), { isAdmin: true } as any);
              profile = { ...profile, isAdmin: true };
            }
          } catch (e) {
            console.warn('Admin allowlist check failed', e);
          }
          setState({ user: profile, isLoading: false, isAuthenticated: true });
        } catch (e) {
          console.error('Failed loading user profile', e);
          setState({ user: null, isLoading: false, isAuthenticated: false });
        }
      } else {
        setState({ user: null, isLoading: false, isAuthenticated: false });
      }
    });
    return () => unsub();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will populate state
      return true;
    } catch (e) {
      console.error('Login failed', e);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const signup = async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      // Set displayName
      await fbUpdateProfile(cred.user, { displayName: name });
      // Create Firestore profile
      const profile: User = { id: cred.user.uid, email, name, wishlist: [], addresses: [] };
      await setDoc(userDocRef(cred.user.uid), profile);
      return true;
    } catch (e) {
      console.error('Signup failed', e);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const logout = () => {
    signOut(auth).catch((e) => console.error('Logout failed', e));
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!state.user) return false;
    try {
      setState(prev => ({ ...prev, isLoading: true }));
      await updateDoc(userDocRef(state.user.id), updates as any);
      // Optionally sync displayName in Auth
      if (updates.name && auth.currentUser) {
        await fbUpdateProfile(auth.currentUser, { displayName: updates.name });
      }
      const updatedUser = { ...state.user, ...updates } as User;
      setState({ user: updatedUser, isLoading: false, isAuthenticated: true });
      return true;
    } catch (e) {
      console.error('Update profile failed', e);
      setState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const addToWishlist = async (productId: string) => {
    if (!state.user) return;
    const currentWishlist = state.user.wishlist || [];
    if (!currentWishlist.includes(productId)) {
      await updateProfile({ wishlist: [...currentWishlist, productId] });
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!state.user) return;
    const currentWishlist = state.user.wishlist || [];
    await updateProfile({ wishlist: currentWishlist.filter(id => id !== productId) });
  };

  const isInWishlist = (productId: string): boolean => {
    if (!state.user?.wishlist) return false;
    return state.user.wishlist.includes(productId);
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      signup,
      logout,
      updateProfile,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
