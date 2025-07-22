
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';
import type { ReactElement, ReactNode } from 'react';

type PrivateRouteProps = {
  children: ReactNode;
};

const PrivateRoute = ({ children }: PrivateRouteProps): ReactElement => {
  const isAuthenticated = authService.isAuthenticated();

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
