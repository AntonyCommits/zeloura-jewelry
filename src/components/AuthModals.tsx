"use client";

import { useState } from 'react';
import { Eye, EyeOff, User, Mail, Phone, MapPin, Heart, ShoppingBag, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalsProps {
  isLoginOpen: boolean;
  setIsLoginOpen: (open: boolean) => void;
  isSignupOpen: boolean;
  setIsSignupOpen: (open: boolean) => void;
  isProfileOpen: boolean;
  setIsProfileOpen: (open: boolean) => void;
}

export default function AuthModals({
  isLoginOpen,
  setIsLoginOpen,
  isSignupOpen,
  setIsSignupOpen,
  isProfileOpen,
  setIsProfileOpen,
}: AuthModalsProps) {
  const { login, signup, logout, user, updateProfile, isLoading } = useAuth();

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [activeProfileTab, setActiveProfileTab] = useState<'profile' | 'addresses' | 'orders' | 'wishlist'>('profile');

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields');
      return;
    }

    const success = await login(loginData.email, loginData.password);
    if (success) {
      setIsLoginOpen(false);
      setLoginData({ email: '', password: '' });
    } else {
      setError('Invalid email or password. Please check your credentials.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!signupData.name || !signupData.email || !signupData.password) {
      setError('Please fill in all fields');
      return;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const success = await signup(signupData.email, signupData.password, signupData.name);
    if (success) {
      setIsSignupOpen(false);
      setSignupData({ name: '', email: '', password: '', confirmPassword: '' });
    } else {
      setError('Email already exists or signup failed');
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile(profileData);
    if (success) {
      alert('Profile updated successfully!');
    }
  };

  const switchToSignup = () => {
    setIsLoginOpen(false);
    setIsSignupOpen(true);
    setError('');
  };

  const switchToLogin = () => {
    setIsSignupOpen(false);
    setIsLoginOpen(true);
    setError('');
  };

  return (
    <>
      {/* Login Modal */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Welcome Back to Zeloura</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div className="bg-blue-50 border border-blue-200 text-blue-600 px-4 py-3 rounded-md text-sm">
              <p className="font-medium">Firebase Authentication Required:</p>
              <p>Please configure Firebase authentication to enable user login.</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={loginData.email}
                onChange={(e) => setLoginData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full p-3 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent pr-10"
                  value={loginData.password}
                  onChange={(e) => setLoginData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700"
              disabled={isLoading}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>

            <div className="text-center space-y-2">
              <button type="button" className="text-sm text-pink-600 hover:underline">
                Forgot your password?
              </button>
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={switchToSignup}
                  className="text-pink-600 hover:underline font-medium"
                >
                  Sign up
                </button>
              </p>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Signup Modal */}
      <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Join the Zeloura Family</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSignup} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={signupData.name}
                onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={signupData.email}
                onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={signupData.password}
                onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Create a password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                className="w-full p-3 border rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                placeholder="Confirm your password"
              />
            </div>

            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" className="mt-1" required />
              <label htmlFor="terms" className="text-sm text-gray-600">
                I agree to Zeloura's{' '}
                <a href="#" className="text-pink-600 hover:underline">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-pink-600 hover:underline">Privacy Policy</a>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700"
              disabled={isLoading}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>

            <p className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={switchToLogin}
                className="text-pink-600 hover:underline font-medium"
              >
                Sign in
              </button>
            </p>
          </form>
        </DialogContent>
      </Dialog>

      {/* Profile Modal */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              My Account
            </DialogTitle>
          </DialogHeader>

          <div className="grid md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="space-y-2">
              <button
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  activeProfileTab === 'profile' ? 'bg-pink-50 text-pink-600' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveProfileTab('profile')}
              >
                <User className="h-4 w-4 inline mr-2" />
                Profile
              </button>
              <button
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  activeProfileTab === 'addresses' ? 'bg-pink-50 text-pink-600' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveProfileTab('addresses')}
              >
                <MapPin className="h-4 w-4 inline mr-2" />
                Addresses
              </button>
              <button
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  activeProfileTab === 'orders' ? 'bg-pink-50 text-pink-600' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveProfileTab('orders')}
              >
                <ShoppingBag className="h-4 w-4 inline mr-2" />
                Orders
              </button>
              <button
                className={`w-full text-left p-3 rounded-md transition-colors ${
                  activeProfileTab === 'wishlist' ? 'bg-pink-50 text-pink-600' : 'hover:bg-gray-50'
                }`}
                onClick={() => setActiveProfileTab('wishlist')}
              >
                <Heart className="h-4 w-4 inline mr-2" />
                Wishlist
              </button>
              <button
                className="w-full text-left p-3 rounded-md hover:bg-red-50 text-red-600"
                onClick={() => {
                  logout();
                  setIsProfileOpen(false);
                }}
              >
                Sign Out
              </button>
            </div>

            {/* Content */}
            <div className="md:col-span-3">
              {activeProfileTab === 'profile' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Personal Information</h3>

                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Full Name</label>
                        <input
                          type="text"
                          className="w-full p-3 border rounded-md"
                          value={profileData.name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email</label>
                        <input
                          type="email"
                          className="w-full p-3 border rounded-md"
                          value={profileData.email}
                          onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-2">Phone</label>
                        <input
                          type="tel"
                          className="w-full p-3 border rounded-md"
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      </div>
                    </div>

                    <Button type="submit" className="bg-pink-600 hover:bg-pink-700" disabled={isLoading}>
                      {isLoading ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </form>
                </div>
              )}

              {activeProfileTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Saved Addresses</h3>
                    <Button size="sm">Add New Address</Button>
                  </div>

                  <div className="text-center py-12 text-gray-500">
                    <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No addresses saved yet</p>
                    <p className="text-sm mt-2">Add an address to speed up checkout</p>
                  </div>
                </div>
              )}

              {activeProfileTab === 'orders' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Order History</h3>

                  <div className="text-center py-12 text-gray-500">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No orders yet</p>
                    <p className="text-sm mt-2">Your order history will appear here</p>
                  </div>
                </div>
              )}

              {activeProfileTab === 'wishlist' && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">My Wishlist</h3>

                  <div className="text-center py-12 text-gray-500">
                    <Heart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Your wishlist is empty</p>
                    <p className="text-sm mt-2">Save your favorite items for later</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
