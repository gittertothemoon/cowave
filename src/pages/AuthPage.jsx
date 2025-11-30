import { useEffect, useId, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CoWaveLogo from '../components/CoWaveLogo.jsx';
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  cardBaseClass,
  eyebrowClass,
  pageTitleClass,
  bodyTextClass,
  inputBaseClass,
  labelClass,
} from '../components/ui/primitives.js';
import { useAppState } from '../state/AppStateContext.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import { supabase } from '../lib/supabaseClient.js';
import { getAuthErrorMessage, getDisplayNameFromEmail } from '../utils/auth.js';

export default function AuthPage({ onAuth }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname.includes('login');
  const {
    resetOnboarding,
    updateCurrentUser,
    currentUser,
  } = useAppState();
  const {
    isAuthenticated,
    authReady,
    isAuthReady,
    signIn,
    signUp,
    profile,
    isProfileLoading,
    refreshProfile,
  } = useAuth();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState('idle');
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const [isResending, setIsResending] = useState(false);
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const ready = authReady ?? isAuthReady;
  const fromState = location.state?.from;
  const onboardingPaths = ['/onboarding', '/app/onboarding'];

  function normalizeFromPath(value) {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value?.pathname) {
      return `${value.pathname}${value.search ?? ''}${value.hash ?? ''}`;
    }
    return '';
  }

  const requestedPath = normalizeFromPath(fromState);

  function resolveDestination({ isOnboarded }) {
    if (isOnboarded === false) {
      return '/onboarding';
    }
    if (
      requestedPath &&
      !requestedPath.startsWith('/auth') &&
      requestedPath !== '/login' &&
      !onboardingPaths.includes(requestedPath)
    ) {
      return requestedPath;
    }
    return '/feed';
  }

  useEffect(() => {
    if (!ready || isProfileLoading || !isAuthenticated) return;
    const destination = resolveDestination({
      isOnboarded: profile?.is_onboarded === true,
    });
    navigate(destination, { replace: true });
  }, [
    isAuthenticated,
    ready,
    isProfileLoading,
    profile?.is_onboarded,
    requestedPath,
    navigate,
  ]);

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setFormError('');
    setResendMessage('');
    setResendError('');
    if (status !== 'idle') {
      setStatus('idle');
    }
  }

  function validate() {
    const nextErrors = {};
    if (!isLogin && !form.name.trim()) {
      nextErrors.name = 'Nickname vuoto. Inserisci un nome per continuare.';
    }
    if (!form.email.trim()) {
      nextErrors.email = 'L’email è obbligatoria.';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      nextErrors.email = 'Email non valida.';
    }
    if (!form.password.trim()) {
      nextErrors.password = 'La password è obbligatoria.';
    } else if (form.password.length < 6) {
      nextErrors.password = 'Password troppo corta (minimo 6 caratteri).';
    }
    return nextErrors;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      setFormError('Correggi i campi evidenziati per continuare.');
      return;
    }
    setStatus(isLogin ? 'idle' : 'loading');
    setFormError('');
    setResendMessage('');
    setResendError('');
    setIsSubmitting(true);

    const email = form.email.trim();
    const password = form.password;
    const siteUrl = (
      import.meta.env.VITE_PUBLIC_SITE_URL ||
      (typeof window !== 'undefined' ? window.location.origin : '')
    ).replace(/\/$/, '');
    const displayName =
      form.name.trim() ||
      currentUser?.nickname?.trim() ||
      getDisplayNameFromEmail(email);

    try {
      if (isLogin) {
        const { data, error } = await signIn({
          email,
          password,
        });
        if (error) {
          setFormError(getAuthErrorMessage(error, { isLogin: true }));
          setStatus('idle');
          return;
        }
        const metadataName =
          data?.user?.user_metadata?.display_name?.trim() || '';
        const storedNickname = currentUser?.nickname?.trim();
        const hasCustomNickname =
          storedNickname && storedNickname !== 'Tu';
        const nickname = hasCustomNickname
          ? storedNickname
          : metadataName || storedNickname || getDisplayNameFromEmail(email);
        updateCurrentUser({
          nickname,
          email,
        });
        onAuth?.();
        const nextProfile = await refreshProfile(data?.user?.id);
        const destination = resolveDestination({
          isOnboarded:
            nextProfile?.is_onboarded === true || profile?.is_onboarded === true,
        });
        navigate(destination, { replace: true });
        return;
      }

      const { data, error } = await signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/auth/confirm`, // Necessario per far puntare il link di conferma alla pagina di verifica
          data: {
            display_name: displayName,
          },
        },
      });

      if (error) {
        setFormError(getAuthErrorMessage(error, { isLogin: false }));
        setStatus('idle');
        return;
      }

      const nextNickname =
        data?.user?.user_metadata?.display_name?.trim() ||
        displayName ||
        getDisplayNameFromEmail(email);

      resetOnboarding();
      updateCurrentUser({
        nickname: nextNickname,
        email,
      });
      onAuth?.();

      if (!data?.session) {
        setSubmittedEmail(email);
        setStatus('check_email');
        return;
      }

      setStatus('done');
      navigate('/onboarding');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResendEmail() {
    if (!submittedEmail || status !== 'check_email') return;
    setIsResending(true);
    setResendMessage('');
    setResendError('');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: submittedEmail,
      });
      if (error) {
        setResendError(getAuthErrorMessage(error, { isLogin: false }));
        return;
      }
      setResendMessage('Email inviata di nuovo.');
    } finally {
      setIsResending(false);
    }
  }

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
        <div className={`${cardBaseClass} w-full p-5 sm:p-6 space-y-4`}>
          <button
            type="button"
            onClick={() => navigate('/')}
            className={`${buttonSecondaryClass} rounded-full bg-slate-950/60 w-fit`}
          >
            <span className="text-base leading-none">←</span>
            Torna alla pagina iniziale
          </button>
          <p className={eyebrowClass}>
            {isLogin ? 'Accesso' : 'Registrazione'}
          </p>
          <h1 className={`${pageTitleClass} text-2xl`}>
            {isLogin ? 'Accedi a CoWave' : 'Crea il tuo account CoWave'}
          </h1>
          <p className={bodyTextClass}>
            {isLogin
              ? 'Se hai già un account, entra e riprendi le conversazioni nelle tue stanze.'
              : 'Dopo la registrazione ti guidiamo in tre passi rapidi: stanze da seguire, persona primaria e preset del feed.'}
          </p>

          {!isLogin && status === 'check_email' && (
            <div className={`${cardBaseClass} border-slate-800 bg-slate-950/60 p-4 sm:p-5 space-y-3`}>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-sky-400" aria-hidden />
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
                  Passo successivo
                </p>
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-50">
                  Controlla la tua email
                </h3>
                <p className="text-sm text-slate-200">
                  Ti abbiamo inviato un link di conferma a{' '}
                  <span className="font-semibold text-white">{submittedEmail}</span>. Aprilo per attivare l’account, poi torna qui e accedi.
                </p>
                <p className="text-xs text-slate-400">
                  Se non la vedi, controlla Spam/Promozioni. A volte serve un minuto.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={`${buttonPrimaryClass} px-4 py-2`}
                  onClick={() => navigate('/auth/login')}
                >
                  Vai alla pagina di accesso
                </button>
                <button
                  type="button"
                  disabled={isResending}
                  className={`${buttonSecondaryClass} px-4 py-2 ${isResending ? 'opacity-70 cursor-not-allowed' : ''}`}
                  onClick={handleResendEmail}
                >
                  {isResending ? 'Invio in corso...' : 'Rimanda email'}
                </button>
                <button
                  type="button"
                  className="text-xs text-slate-400 hover:text-slate-200 underline-offset-4 underline"
                  onClick={() => {
                    setStatus('idle');
                    setForm((prev) => ({ ...prev, email: submittedEmail }));
                  }}
                >
                  Cambia email
                </button>
                <button
                  type="button"
                  className="text-xs text-slate-400 hover:text-slate-200 underline-offset-4 underline"
                  onClick={() => navigate('/auth/login')}
                >
                  Ho già confermato
                </button>
              </div>
              {(resendMessage || resendError) && (
                <p
                  className={`text-xs ${
                    resendError ? 'text-red-300' : 'text-emerald-300'
                  }`}
                >
                  {resendError || resendMessage}
                </p>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            {formError && (
              <div className="rounded-xl border border-red-500/40 bg-red-950/30 px-3 py-2 text-xs text-red-100">
                {formError}
              </div>
            )}
            {!isLogin && (
              <div className="space-y-1">
                <label className={labelClass} htmlFor={nameId}>
                  Nickname
                </label>
                <input
                  type="text"
                  className={`${inputBaseClass} ${
                    errors.name ? 'border-red-500 focus:ring-red-500/70 focus:border-red-500/70' : ''
                  }`}
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Scegli come vuoi apparire su CoWave"
                  id={nameId}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && (
                  <p className="text-xs text-red-400 mt-1">{errors.name}</p>
                )}
              </div>
            )}
            <div className="space-y-1">
              <label className={labelClass} htmlFor={emailId}>
                Email
              </label>
              <input
                type="email"
                className={`${inputBaseClass} ${
                  errors.email ? 'border-red-500 focus:ring-red-500/70 focus:border-red-500/70' : ''
                }`}
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="nome@email.com"
                id={emailId}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email && (
                <p className="text-xs text-red-400 mt-1">{errors.email}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className={labelClass} htmlFor={passwordId}>
                Password
              </label>
              <input
                type="password"
                className={`${inputBaseClass} ${
                  errors.password ? 'border-red-500 focus:ring-red-500/70 focus:border-red-500/70' : ''
                }`}
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="Almeno 6 caratteri"
                id={passwordId}
                aria-invalid={Boolean(errors.password)}
              />
              {errors.password && (
                <p className="text-xs text-red-400 mt-1">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`${buttonPrimaryClass} w-full mt-2 text-base text-white shadow-[0_18px_40px_rgba(56,189,248,0.28)] ring-1 ring-white/10 ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting
                ? 'Attendi...'
                : isLogin
                  ? 'Accedi'
                  : 'Registrati'}
            </button>
          </form>

          <p className="text-[11px] text-slate-500">
            {isLogin ? 'Non hai un account?' : 'Hai già un account?'}{' '}
            <button
              type="button"
              onClick={() => navigate(isLogin ? '/auth/register' : '/auth/login')}
              className="text-accent hover:text-accentSoft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 rounded-sm"
            >
              {isLogin ? 'Registrati' : 'Accedi'}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
