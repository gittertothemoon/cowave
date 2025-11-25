import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../state/AppStateContext.jsx';
import { useAuth } from '../state/AuthContext.jsx';

export function useLogout() {
  const navigate = useNavigate();
  const { resetOnboarding } = useAppState();
  const { signOut } = useAuth();

  return useCallback(async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Errore durante il logout da Supabase', error);
    }
    resetOnboarding();
    navigate('/', { replace: true });
  }, [navigate, resetOnboarding, signOut]);
}
