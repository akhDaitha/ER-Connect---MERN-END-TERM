import React, { createContext, useContext, useState, useEffect } from 'react';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  const refreshUser = async () => {
    try {
      setLoading(true);
      const res = await authApi.getMe();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (credentials) => {
    setAuthError(null);
    try {
      const res = await authApi.login(credentials);
      if (res.success && res.user) {
        setUser(res.user);
        return res.user;
      }
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const signup = async (formData) => {
    setAuthError(null);
    try {
      const res = await authApi.signup(formData);
      if (res.success && res.user) {
        setUser(res.user);
        return res.user;
      }
    } catch (err) {
      setAuthError(err.message);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout request warning:', err);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        authError,
        login,
        signup,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
