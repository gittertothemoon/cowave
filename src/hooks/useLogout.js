import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthenticated } from '../utils/auth.js';
import { useAppState } from '../state/AppStateContext.jsx';

export function useLogout() {
  const navigate = useNavigate();
  const { resetOnboarding } = useAppState();

  return useCallback(() => {
    // AUTH: cleanup fake auth state and onboarding selections
    clearAuthenticated();
    resetOnboarding();
    navigate('/', { replace: true });
  }, [navigate, resetOnboarding]);
}
