import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { supabase } from '../lib/supabaseClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (error) {
          console.error('Errore nel recupero della sessione Supabase', error);
          setSession(null);
          setUser(null);
          return;
        }
        setSession(data?.session ?? null);
        setUser(data?.session?.user ?? null);
      } finally {
        if (isMounted) {
          setIsAuthReady(true);
        }
      }
    }

    loadSession();

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
        setIsAuthReady(true);
      }
    );

    return () => {
      isMounted = false;
      subscription?.subscription?.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(
    async (targetUserId) => {
      const userId = targetUserId ?? user?.id;
      if (!userId) {
        setProfile(null);
        setIsProfileLoading(false);
        return null;
      }
      setIsProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        if (error) {
          console.error('Errore nel recupero del profilo', error);
          setProfile(null);
          return null;
        }
        setProfile(data ?? null);
        return data ?? null;
      } finally {
        setIsProfileLoading(false);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    let isMounted = true;
    async function loadProfile() {
      if (!user?.id) {
        if (isMounted) {
          setProfile(null);
          setIsProfileLoading(false);
        }
        return;
      }
      setIsProfileLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (!isMounted) return;
        if (error) {
          console.error('Errore nel recupero del profilo', error);
          setProfile(null);
          return;
        }
        setProfile(data ?? null);
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
        }
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const updateProfileState = useCallback((updates) => {
    if (!updates) return;
    setProfile((prev) => {
      if (!prev) return { ...updates };
      return { ...prev, ...updates };
    });
  }, []);

  const value = useMemo(
    () => ({
      session,
      user,
      profile,
      isAuthenticated: Boolean(user),
      isAuthReady,
      isProfileLoading,
      refreshProfile,
      updateProfileState,
      signIn: (params) => supabase.auth.signInWithPassword(params),
      signUp: (params) => supabase.auth.signUp(params),
      signOut: () => supabase.auth.signOut(),
    }),
    [
      session,
      user,
      profile,
      isAuthReady,
      isProfileLoading,
      refreshProfile,
      updateProfileState,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth deve essere usato dentro un <AuthProvider>');
  }
  return ctx;
}
