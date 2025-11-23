import { useId, useState } from 'react';
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
import { setAuthenticated } from '../utils/auth.js';

export default function AuthPage({ onAuth }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname.includes('login');
  const { isOnboarded, resetOnboarding, updateCurrentUser } = useAppState();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const nameId = useId();
  const emailId = useId();
  const passwordId = useId();

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
    setFormError('');
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

  function handleSubmit(e) {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      setFormError('Correggi i campi evidenziati per continuare.');
      return;
    }
    setFormError('');

    if (!isLogin) {
      resetOnboarding();
      updateCurrentUser({
        nickname: form.name.trim() || 'Tu',
        email: form.email.trim(),
      });
    } else {
      updateCurrentUser({
        email: form.email.trim(),
      });
    }
    // AUTH: set fake authenticated state for protected pages
    setAuthenticated();
    onAuth?.();

    if (isLogin) {
      navigate(isOnboarded ? '/app' : '/app/onboarding');
    } else {
      navigate('/app/onboarding');
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
              className={`${buttonPrimaryClass} w-full mt-2 text-base text-white shadow-[0_18px_40px_rgba(56,189,248,0.28)] ring-1 ring-white/10`}
            >
              {isLogin ? 'Accedi' : 'Registrati'}
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
