import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const RoleRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="w-10 h-10 border-4 border-sage border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(user.role)) {
    // Redirect to the appropriate home for their role
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'er') return <Navigate to="/er/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default RoleRoute;
