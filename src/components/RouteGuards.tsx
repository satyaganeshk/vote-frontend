import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../models';

// Blocks access to everything under it unless a session exists.
export const RequireAuth: React.FC = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

// Blocks access unless the signed-in user has one of the allowed roles.
// A mismatched role is sent back to "/", which resolves to that user's own home page.
export const RequireRole: React.FC<{ allow: Role[] }> = ({ allow }) => {
  const { role } = useAuth();
  if (!role || !allow.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

// The index route at "/" — sends every signed-in user straight to their own home page.
export const RoleHome: React.FC = () => {
  const { role } = useAuth();
  switch (role) {
    case 'ADMIN':
      return <Navigate to="/admin" replace />;
    case 'CANDIDATE':
      return <Navigate to="/candidate" replace />;
    case 'VOTER':
      return <Navigate to="/vote" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};
