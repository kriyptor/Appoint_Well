// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// This component handles both authentication and role-based authorization
const ProtectedRoute = ({ allowedRoles }) => {
  const { currentUser, hasRole } = useAuth();
  
  // If user is not logged in, redirect to login page
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  
  // If roles are specified and user doesn't have any of the required roles
  if (allowedRoles && !hasRole(allowedRoles)) {
    // Redirect to an unauthorized page or dashboard
    return <Navigate to="/unauthorized" replace />;
  }
  
  // If user is logged in and has the required role, render the children
  return <Outlet />;
};

export default ProtectedRoute;