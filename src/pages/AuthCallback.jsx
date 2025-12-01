import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient.js';
import { cleanAuthNoiseFromUrl, hasAuthNoise } from '../lib/url.js';
import { useAuth } from '../state/AuthContext.jsx';
import {
  cardBaseClass,
  eyebrowClass,
  pageTitleClass,
  bodyTextClass,
} from '../components/ui/primitives.js';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { refreshProfile } = useAuth();
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(true);
  const hasHandledRef = useRef(false);

  useEffect(() => {
    if (hasHandledRef.current) return;
    hasHandledRef.current = true;
    let isActive = true;

    async function handleCallback() {
      if (typeof window === 'undefined') return;
      const currentUrl = new URL(window.location.href);
      const hasCode = currentUrl.searchParams.has('code');
      const hashFragment = currentUrl.hash?.startsWith('#')
        ? currentUrl.hash.slice(1)
        : currentUrl.hash ?? '';
      const hashParams = hashFragment ? new URLSearchParams(hashFragment) : null;
      const accessToken = hashParams?.get('access_token');
      const refreshToken = hashParams?.get('refresh_token');
      const hasHashTokens = Boolean(accessToken && refreshToken);
      const hasNoise = hasAuthNoise(currentUrl);

      if (!hasCode && !hasNoise && !hasHashTokens) {
        setIsProcessing(false);
        navigate('/app', { replace: true });
        return;
      }

      try {
        let sessionData = null;

        if (hasHashTokens) {
          const { data, error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (!isActive) return;
          if (sessionError) {
            throw sessionError;
          }
          sessionData = data?.session ?? null;
        } else {
          const { data, error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(window.location.href);
          if (!isActive) return;
          if (exchangeError) {
            throw exchangeError;
          }
          sessionData = data?.session ?? null;
        }

        if (!sessionData?.user?.id) {
          throw new Error('Sessione non valida ricevuta dal callback.');
        }

        const nextProfile = await refreshProfile(sessionData.user.id);
        if (!isActive) return;

        cleanAuthNoiseFromUrl();
        const destination =
          nextProfile?.is_onboarded === false ? '/onboarding' : '/app';
        navigate(destination, { replace: true });
      } catch (err) {
        if (!isActive) return;
        cleanAuthNoiseFromUrl();
        setError(
          'Non siamo riusciti a completare l’accesso. Richiedi un nuovo link e riprova.'
        );
      } finally {
        if (isActive) {
          setIsProcessing(false);
        }
      }
    }

    handleCallback();

    return () => {
      isActive = false;
    };
  }, [navigate, refreshProfile]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div className={`${cardBaseClass} w-full max-w-md p-5 sm:p-6 space-y-3`}>
        <p className={eyebrowClass}>Accesso</p>
        <h1 className={`${pageTitleClass} text-xl`}>
          Stiamo verificando il tuo link…
        </h1>
        <p className={bodyTextClass}>
          Attendi qualche istante mentre completiamo l’accesso.
        </p>
        {isProcessing ? (
          <p className="text-sm text-slate-400">Caricamento…</p>
        ) : error ? (
          <p className="text-sm text-red-200">{error}</p>
        ) : (
          <p className="text-sm text-slate-400">
            Reindirizzamento in corso…
          </p>
        )}
      </div>
    </div>
  );
}
