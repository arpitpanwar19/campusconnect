import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Spinner } from '../common/Spinner';

export const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (
  requiredRole &&
  user.role !== requiredRole &&
  !(requiredRole === 'organizer' && user.role === 'admin')
) {
  return <Navigate to="/" replace />;
}

  return children;
};