import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CoWaveLogo from '../components/CoWaveLogo.jsx';
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  cardBaseClass,
  eyebrowClass,
  pageTitleClass,
  bodyTextClass,
} from '../components/ui/primitives.js';
import { supabase } from '../lib/supabaseClient.js';

export default function AuthConfirm() {
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState('');
  const hasHandledRef = useRef(false);

  useEffect(() => {
    if (hasHandledRef.current) return;
    hasHandledRef.current = true;
    let isActive = true;

    async function handleConfirmation() {
      if (typeof window === 'undefined') return;
      const searchParams = new URLSearchParams(window.location.search);
      const tokenHash = searchParams.get('token_hash');
      const type = searchParams.get('type');
      const nextParam = searchParams.get('next');
      const nextDestination = nextParam || '/app/onboarding';

      if (!tokenHash || !type) {
        if (isActive) {
          setError(
            'Link di conferma non valido o scaduto. Richiedi un nuovo link e riprova.'
          );
          setStatus('error');
        }
        return;
      }

      try {
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type,
        });
        if (!isActive) return;
        if (verifyError) {
          throw verifyError;
        }

        const sessionTokens = data?.session;
        if (sessionTokens) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: sessionTokens.access_token,
            refresh_token: sessionTokens.refresh_token,
          });
          if (!isActive) return;
          if (sessionError) throw sessionError;
        }

        const { data: sessionData, error: sessionCheckError } =
          await supabase.auth.getSession();
        if (!isActive) return;
        if (sessionCheckError) throw sessionCheckError;

        if (sessionData?.session) {
          setStatus('success');
          window.location.replace(nextDestination);
          return;
        }

        setError(
          'Email confermata, ma non siamo riusciti a completare la sessione. Accedi di nuovo.'
        );
        setStatus('error');
      } catch (err) {
        if (!isActive) return;
        console.error('Errore nella verifica del token', err);
        setError(
          'Non siamo riusciti a confermare l’accesso. Richiedi un nuovo link e riprova.'
        );
        setStatus('error');
      }
    }

    handleConfirmation();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-12 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-50 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 10% 20%, rgba(56,189,248,0.25), transparent 45%), radial-gradient(circle at 90% 10%, rgba(167,139,250,0.25), transparent 50%)',
        }}
      />

      <main className="relative w-full max-w-xl mx-auto text-slate-100 flex flex-col items-center gap-4">
        <Link
          to="/"
          aria-label="Torna alla landing"
          className="flex justify-center"
        >
          <CoWaveLogo variant="full" size={96} />
        </Link>
        <div className={`${cardBaseClass} w-full p-5 sm:p-6 space-y-3`}>
          <p className={eyebrowClass}>Conferma email</p>
          <h1 className={`${pageTitleClass} text-2xl`}>
            {status === 'error'
              ? 'Qualcosa non va'
              : status === 'success'
              ? 'Email confermata'
              : 'Verifica in corso…'}
          </h1>
          <p className={bodyTextClass}>
            {status === 'error'
              ? 'Il link potrebbe essere scaduto o già utilizzato. Puoi richiedere un nuovo invio.'
              : status === 'success'
              ? 'Email verificata con successo. Ti stiamo portando alla tua area.'
              : 'Stiamo verificando il tuo link di conferma. Attendi qualche istante.'}
          </p>

          {status === 'loading' && (
            <p className="text-sm text-slate-400">Caricamento…</p>
          )}
          {status === 'success' && (
            <p className="text-sm text-slate-400">Reindirizzamento in corso…</p>
          )}
          {status === 'error' && (
            <div className="space-y-3">
              <p className="text-sm text-red-200">{error}</p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/auth/login"
                  className={`${buttonPrimaryClass} rounded-full`}
                >
                  Vai al login
                </Link>
                <Link
                  to="/auth/register"
                  className={`${buttonSecondaryClass} rounded-full`}
                >
                  Richiedi un nuovo link
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
