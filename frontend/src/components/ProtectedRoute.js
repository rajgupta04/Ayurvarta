// Commit on 2026-02-03
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    // Redirect to auth page but remember where they were trying to go
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

export 