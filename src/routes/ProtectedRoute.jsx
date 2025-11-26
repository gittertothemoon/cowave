import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const {
    isAuthenticated,
    authReady,
    isAuthReady,
    isProfileLoading,
  } = useAuth();
  const ready = authReady ?? isAuthReady;
  const location = useLocation();

  if (!ready || isProfileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <span className="text-sm text-slate-400">
          Carichiamo la tua sessione...
        </span>
      </div>
    );
  }

  if (ready && !isAuthenticated) {
    const redirectPath = `${location.pathname}${location.search}`;
    return (
      <Navigate
        to="/"
        replace
        state={{ from: redirectPath }}
      />
    );
  }

  return children;
}
