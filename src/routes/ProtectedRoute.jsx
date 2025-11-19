import { Navigate } from 'react-router-dom';
import { getIsAuthenticated } from '../utils/auth.js';

export default function ProtectedRoute({ children }) {
  const isAuthenticated = getIsAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
}
