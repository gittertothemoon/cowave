import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';

export function useLogout() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return useCallback(async () => {
    const { error } = await signOut();
    if (error) {
      console.error('Errore durante il logout da Supabase', error);
    }
    navigate('/', { replace: true });
  }, [navigate, signOut]);
}
