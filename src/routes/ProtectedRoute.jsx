import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const {
    isAuthenticated,
    authReady,
    isAuthReady,
    isProfileLoading,
    isProfileReady,
    profile,
  } = useAuth();
  const ready = authReady ?? isAuthReady;
  const location = useLocation();
  const onboardingPaths = new Set(['/onboarding', '/app/onboarding']);
  const isOnboardingRoute = onboardingPaths.has(location.pathname);
  const profileSettled =
    !isAuthenticated ||
    ((isProfileReady ?? !isProfileLoading) && !isProfileLoading);
  const isBootstrapping = !ready || !profileSettled;
  const needsOnboarding =
    profileSettled &&
    isAuthenticated &&
    (profile?.is_onboarded === false || profile === null);

  if (isBootstrapping) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-200">
        <div className="flex items-center gap-2 rounded-xl border border-white/5 bg-slate-900/60 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <span className="h-2 w-2 rounded-full bg-accent animate-pulse" aria-hidden="true" />
          <span className="text-sm text-slate-300">
            Carichiamo la tua sessione...
          </span>
        </div>
      </div>
    );
  }

  if (ready && !isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  if (
    ready &&
    needsOnboarding &&
    !isOnboardingRoute
  ) {
    return <Navigate to="/onboarding" replace state={{ from: location }} />;
  }

  return children;
}
