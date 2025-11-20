import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Logo from '../components/ui/Logo.jsx';
import { useAppState } from '../state/AppStateContext.jsx';
import { setAuthenticated } from '../utils/auth.js';

const insights = [
  'Thread ramificati anziché commenti in fila.',
  'Timer mindful e preset algoritmo sempre visibili.',
  'Personas multiple per ruoli e toni diversi.',
];

export default function AuthPage({ onAuth }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname.includes('login');
  const { isOnboarded, resetOnboarding, updateCurrentUser } = useAppState();

  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: '' }));
  }

  function validate() {
    const nextErrors = {};
    if (!isLogin && !form.name.trim()) {
      nextErrors.name = 'Inserisci un nome o nickname.';
    }
    if (!form.email.trim()) {
      nextErrors.email = 'L’email è obbligatoria.';
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim())) {
      nextErrors.email = 'Inserisci un’email valida.';
    }
    if (!form.password.trim()) {
      nextErrors.password = 'La password è obbligatoria.';
    } else if (form.password.length < 6) {
      nextErrors.password = 'Minimo 6 caratteri.';
    }
    return nextErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validation = validate();
    if (Object.keys(validation).length > 0) {
      setErrors(validation);
      return;
    }

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

      <div className="relative w-full max-w-4xl mx-auto grid gap-6 lg:grid-cols-[0.85fr,1.15fr] text-slate-100">
        <div className="glass-panel p-5 sm:p-8 rounded-3xl border border-white/10 space-y-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-white transition w-fit px-3 py-1.5 rounded-2xl border border-white/10 bg-slate-950/40"
          >
            <span className="text-base leading-none">←</span>
            Torna alla landing
          </button>
          <Link to="/" aria-label="Torna alla landing">
            <Logo withWordmark size={44} />
          </Link>
          <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
            {isLogin ? 'Accesso' : 'Registrazione'}
          </p>
          <h1 className="text-2xl font-semibold text-white">
            {isLogin ? 'Bentornato in CoWave' : 'Entra con la tua identità'}
          </h1>
          <p className="text-sm text-slate-400">
            {isLogin
              ? 'Se hai già completato l’onboarding tornerai subito al feed. Se manca qualcosa, ripartiremo dai tre passi di allineamento.'
              : 'Dopo la registrazione ti guidiamo in tre passi rapidi: stanze da seguire, persona primaria e preset algoritmo.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            {!isLogin && (
              <div className="space-y-1">
                <label className="text-xs text-slate-300">Nome o nickname</label>
                <input
                  type="text"
                  className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-accent text-slate-100 text-base"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Es. Pionio"
                />
                {errors.name && (
                  <p className="text-xs text-rose-300">{errors.name}</p>
                )}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Email</label>
              <input
                type="email"
                className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-accent text-slate-100 text-base"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="tu@email.com"
              />
              {errors.email && (
                <p className="text-xs text-rose-300">{errors.email}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs text-slate-300">Password</label>
              <input
                type="password"
                className="w-full bg-slate-950/60 border border-white/10 rounded-2xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-accent text-slate-100 text-base"
                value={form.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="●●●●●●●●"
              />
              {errors.password && (
                <p className="text-xs text-rose-300">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-accent to-accentBlue text-white text-sm font-semibold py-3 rounded-2xl transition hover:opacity-95"
            >
              {isLogin ? 'Accedi' : 'Registrati'}
            </button>
          </form>

          <p className="text-[11px] text-slate-500">
            {isLogin ? 'Non hai un account?' : 'Hai già un account?'}{' '}
            <button
              type="button"
              onClick={() => navigate(isLogin ? '/auth/register' : '/auth/login')}
              className="text-accent hover:text-accentSoft"
            >
              {isLogin ? 'Registrati' : 'Accedi'}
            </button>
          </p>
        </div>

        <div className="glass-panel p-5 sm:p-8 rounded-3xl border border-white/10 space-y-5 bg-slate-950/60 backdrop-blur">
          <p className="text-[11px] uppercase tracking-[0.4em] text-slate-400">
            Perché CoWave
          </p>
          <ul className="space-y-3 text-sm text-slate-300">
            {insights.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="text-accent text-lg leading-none">✺</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="rounded-2xl border border-white/10 px-4 py-3 text-xs text-slate-400 bg-slate-950/50">
            <p className="text-sm text-white font-semibold">Cosa succede dopo?</p>
            <p>
              Ti portiamo al percorso di onboarding. Se l’hai già completato, CoWave ti
              riapre direttamente la home con le tue stanze e personas.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 px-4 py-3 text-xs text-slate-400 bg-slate-950/50">
            <p className="text-sm text-white font-semibold">Tempo stimato</p>
            <p>Onboarding: 1 minuto. Sessioni consigliate: blocchi da 28 minuti.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
