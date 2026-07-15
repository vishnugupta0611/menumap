'use client';

import { createContext, useContext, useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authMutationVersion = useRef(0);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const requestVersion = authMutationVersion.current;
    try {
      const { data } = await api.get('/api/auth/me');
      if (requestVersion !== authMutationVersion.current) return;
      setUser(data.user);
      setRestaurant(data.restaurant || null);
      setError(null);
    } catch (error) {
      if (requestVersion !== authMutationVersion.current) return;
      // Not authenticated - this is normal
      setUser(null);
      setRestaurant(null);
    } finally {
      if (requestVersion === authMutationVersion.current) {
        setLoading(false);
      }
    }
  }

  async function login(email, password) {
    try {
      authMutationVersion.current += 1;
      setError(null);
      const { data } = await api.post('/api/auth/login', { email, password });
      setUser(data.user);
      setRestaurant(data.restaurant || null);
      setLoading(false);
      return data;
    } catch (error) {
      const message = error.response?.data?.error || 'Login failed';
      setError(message);
      throw new Error(message);
    }
  }

  async function employeeLogin(username, password) {
    try {
      authMutationVersion.current += 1;
      setError(null);
      const { data } = await api.post('/api/auth/employee-login', { username, password });
      setUser(data.user);
      setRestaurant(data.restaurant || null);
      setLoading(false);
      return data;
    } catch (error) {
      const message = error.response?.data?.error || 'Employee Login failed';
      setError(message);
      throw new Error(message);
    }
  }

  async function loginWithVerifiedEmail({ email, name, clerkId, role }) {
    try {
      authMutationVersion.current += 1;
      setError(null);
      const { data } = await api.post('/api/auth/login-verified', { email, name, clerkId, role });
      setUser(data.user);
      setRestaurant(data.restaurant || null);
      setLoading(false);
      return data;
    } catch (error) {
      const message = error.response?.data?.error || 'Verified Login failed';
      setError(message);
      throw new Error(message);
    }
  }

  async function registerOwner(userData) {
    try {
      authMutationVersion.current += 1;
      setError(null);
      const { data } = await api.post('/api/auth/register/owner', userData);
      setUser(data.user);
      setRestaurant(data.restaurant || null);
      setLoading(false);
      return data;
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  }

  async function registerCustomer(userData) {
    try {
      authMutationVersion.current += 1;
      setError(null);
      const { data } = await api.post('/api/auth/register/customer', userData);
      setUser(data.user);
      setRestaurant(null);
      setLoading(false);
      return data;
    } catch (error) {
      const message = error.response?.data?.error || 'Registration failed';
      setError(message);
      throw new Error(message);
    }
  }

  async function logout() {
    authMutationVersion.current += 1;
    try {
      await api.post('/api/auth/logout');
      setUser(null);
      setRestaurant(null);
      setError(null);
    } catch (error) {
      // Even if logout fails on server, clear local state
      setUser(null);
      setRestaurant(null);
    }
  }

  async function updateProfile(profileData) {
    try {
      setError(null);
      const { data } = await api.put('/api/auth/me', profileData);
      setUser(data.user);
      return data;
    } catch (error) {
      const message = error.response?.data?.error || 'Failed to update profile';
      setError(message);
      throw new Error(message);
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        restaurant,
        loading,
        error,
        login,
        employeeLogin,
        loginWithVerifiedEmail,
        registerOwner,
        registerCustomer,
        logout,
        checkAuth,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
