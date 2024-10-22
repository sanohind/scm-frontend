// components/PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactElement;
  role?: string | string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, role }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth/signin" />;
  }

  if (role) {
    const userHasRequiredRole = Array.isArray(role)
      ? role.includes(user.role)
      : user.role === role;

    if (!userHasRequiredRole) {
      return <Navigate to="/not-authorized" />;
    }
  }

  return children;
};

export default PrivateRoute;
