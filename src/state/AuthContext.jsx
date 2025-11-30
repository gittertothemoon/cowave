import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { supabase } from '../lib/supabaseClient.js';
import { cleanAuthNoiseFromUrl } from '../lib/url.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isProfileReady, setIsProfileReady] = useState(false);

  useEffect(() => {
    let isMounted = true;
    let authSubscription = null;

    if (typeof window !== 'undefined') {
      const pathname = window.location.pathname;
      const isAuthFlow =
        pathname.startsWith('/auth/callback') || pathname.startsWith('/auth/confirm');
      if (!isAuthFlow) {
        cleanAuthNoiseFromUrl();
      }
    }

    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!isMounted) return;
        if (error) {
          console.error('Errore nel recupero della sessione Supabase', error);
          setSession(null);
          setUser(null);
        } else {
          setSession(data?.session ?? null);
          setUser(data?.session?.user ?? null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Errore inatteso nel recupero della sessione Supabase', err);
          setSession(null);
          setUser(null);
        }
      }

      if (!isMounted) return;

      const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (!isMounted) return;
        setSession(nextSession);
        setUser(nextSession?.user ?? null);
      });
      authSubscription = data?.subscription ?? null;

      if (isMounted) {
        setAuthReady(true);
      }
    }

    loadSession();

    return () => {
      isMounted = false;
      authSubscription?.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(
    async (targetUserId) => {
      const userId = targetUserId ?? user?.id;
      if (!userId) {
        setProfile(null);
        setIsProfileLoading(false);
        setIsProfileReady(false);
        return null;
      }
      setIsProfileLoading(true);
      setIsProfileReady(false);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();
        if (error) {
          console.error('Errore nel recupero del profilo', error);
          setProfile(null);
          setIsProfileReady(true);
          return null;
        }
        setProfile(data ?? null);
        setIsProfileReady(true);
        return data ?? null;
      } finally {
        setIsProfileLoading(false);
        setIsProfileReady(true);
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
          setIsProfileReady(true);
        }
        return;
      }
      setIsProfileLoading(true);
      setIsProfileReady(false);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();
        if (!isMounted) return;
        if (error) {
          console.error('Errore nel recupero del profilo', error);
          setProfile(null);
          setIsProfileReady(true);
          return;
        }
        setProfile(data ?? null);
      } finally {
        if (isMounted) {
          setIsProfileLoading(false);
          setIsProfileReady(true);
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
      authReady,
      isAuthReady: authReady,
      isProfileLoading,
      isProfileReady,
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
      authReady,
      isProfileLoading,
      isProfileReady,
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
