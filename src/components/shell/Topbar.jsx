import { useState } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useAppState } from '../../state/AppStateContext.jsx';
import Logo from '../ui/Logo.jsx';

export default function Topbar({
  activePersonaId,
  onPersonaChange,
  onToggleSidebar,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { personas } = useAppState();

  const currentPersona =
    personas.find((p) => p.id === activePersonaId) ?? personas[0];

  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);

  const tickerItems = [
    '13 stanze live',
    '28 thread avviati oggi',
    'Sessione media 34 min',
    'Highlight Dev Lab: “Workflow senza feed”',
  ];

  const navItems = [
    { label: 'Feed', to: '/app', icon: 'feed' },
    { label: 'Stanze', to: '/app/rooms/room-dev', icon: 'rooms' },
    { label: 'Profilo', to: '/app/profile', icon: 'profile' },
    { label: 'Impostazioni', to: '/app/settings', icon: 'settings' },
  ];

  const sessionStats = [
    { label: 'Focus', value: '28m', detail: 'ancora 12m' },
    { label: 'Rami attivi', value: '7', detail: '+3 oggi' },
    { label: 'Streak', value: '5 giorni', detail: 'modalità mindful' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-gradient-to-b from-surfaceAlt/90 via-surface/85 to-surface/70 backdrop-blur-2xl shadow-soft">
      <div className="absolute inset-0 opacity-60 pointer-events-none bg-[radial-gradient(circle_at_top,_rgba(167,139,250,0.18),_transparent_60%)]" />
      <div className="relative max-w-6xl mx-auto flex flex-col gap-3 px-4 sm:px-8 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            className="md:hidden text-slate-400 hover:text-slate-100"
            onClick={onToggleSidebar}
            aria-label="Apri menu laterale"
          >
            ☰
          </button>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 pr-0 sm:pr-4 border-r border-white/10 -ml-3 sm:-ml-8">
            <Logo size={34} className="-ml-1" />
            <div className="text-[11px] uppercase tracking-[0.3em] text-slate-400">
              CoWave
              <span className="ml-2 px-1.5 py-0.5 rounded-full bg-white/5 text-[10px] tracking-[0.2em]">
                beta
              </span>
            </div>
          </div>
          <div className="flex-1 hidden sm:flex items-center gap-3">
            <div className="flex-1 bg-slate-900/60 border border-white/10 rounded-2xl px-3 py-1.5 items-center gap-2 text-xs focus-within:border-accent/60 transition">
              <span className="text-slate-500">⌘K</span>
              <input
                className="bg-transparent flex-1 focus:outline-none text-slate-200 placeholder:text-slate-500"
                placeholder="Cerca stanze, thread o persone…"
              />
              <span className="text-[10px] text-slate-500">⌘K ovunque</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">Sessione mindful in corso</span>
          </div>
          <button className="hidden sm:flex items-center justify-center w-8 h-8 rounded-full border border-white/10 text-slate-300 hover:text-white">
            <NotificationIcon />
          </button>

          <div className="relative">
            <button
              onClick={() => setPersonaMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 text-xs bg-slate-900/60 border border-white/10 rounded-2xl px-2.5 py-1.5 hover:border-accent/70 transition"
            >
              <span className="h-7 w-7 rounded-full bg-gradient-to-br from-accent to-accentBlue flex items-center justify-center text-[10px] font-semibold text-slate-950">
                {currentPersona?.label?.[0] ?? 'P'}
              </span>
              <div className="hidden sm:block text-left">
                <p className="text-[11px] text-slate-400 leading-tight">
                  Persona attiva
                </p>
                <p className="text-[11px] font-medium">
                  {currentPersona?.label ?? 'Tu'}
                </p>
              </div>
            </button>

            {personaMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-slate-950/90 border border-white/10 rounded-2xl shadow-soft py-1.5 text-xs z-40 backdrop-blur-xl">
                {personas.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onPersonaChange?.(p.id);
                      setPersonaMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-1.5 text-left hover:bg-white/5 ${
                      p.id === currentPersona?.id
                        ? 'text-accent'
                        : 'text-slate-200'
                    }`}
                  >
                    <span className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] uppercase font-semibold">
                      {p.label[0]}
                    </span>
                    <span>{p.label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    navigate('/app/profile');
                    setPersonaMenuOpen(false);
                  }}
                  className="w-full px-3 py-1.5 text-left text-[11px] text-slate-400 hover:bg-white/5 border-t border-white/5"
                >
                  Gestisci personas
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="w-full sm:hidden">
          <div className="bg-slate-900/60 border border-white/10 rounded-2xl px-3 py-1.5 text-xs flex items-center gap-2 focus-within:border-accent/60 transition">
            <span className="text-slate-500">🔍</span>
            <input
              className="bg-transparent flex-1 focus:outline-none text-slate-200 placeholder:text-slate-500 text-sm"
              placeholder="Cerca thread o stanze…"
            />
          </div>
        </div>
      </div>
      <div className="border-t border-white/5 px-4 sm:px-8 py-2 flex flex-wrap gap-3 items-center">
        <nav className="flex items-center gap-2 flex-wrap">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `px-3 py-1.5 rounded-2xl text-[12px] uppercase tracking-[0.2em] transition flex items-center gap-2 ${
                  isActive
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-slate-400 border border-transparent hover:text-white'
                }`
              }
            >
              <span className="text-white/80">
                <NavItemIcon type={item.icon} />
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex-1 flex flex-wrap justify-end gap-2">
          {sessionStats.map((stat) => (
            <div
              key={stat.label}
              className="px-3 py-1.5 rounded-2xl border border-white/10 text-xs text-slate-300"
            >
              <p className="uppercase tracking-[0.2em] text-[10px] text-slate-500">
                {stat.label}
              </p>
              <p className="text-white font-semibold">{stat.value}</p>
              <p className="text-[10px] text-slate-500">{stat.detail}</p>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <button className="focus-pill hidden sm:flex">
              <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
              Radar
            </button>
            <button
              onClick={() => navigate('/app/rooms/room-dev')}
              className="text-[11px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-2xl text-slate-950 font-semibold shadow-glow"
              style={{
                backgroundImage: 'linear-gradient(120deg, #a78bfa, #38bdf8)',
              }}
            >
              Nuova stanza
            </button>
          </div>
        </div>
      </div>

      <div className="hidden md:block border-t border-white/5 px-4 sm:px-8 py-1">
        <div className="ticker text-[11px] text-slate-400">
          <div className="ticker__inner">
            {tickerItems.map((item) => (
              <span key={item} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

    </header>
  );
}

function NavItemIcon({ type }) {
  const baseProps = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className: 'text-slate-300',
  };

  switch (type) {
    case 'Feed':
    case 'feed':
      return (
        <svg {...baseProps}>
          <path d="M4 6h16M4 12h10M4 18h7" />
        </svg>
      );
    case 'rooms':
      return (
        <svg {...baseProps}>
          <path d="M4 10c2-3 6-3 8 0s6 3 8 0" />
          <path d="M4 16c2-3 6-3 8 0s6 3 8 0" />
        </svg>
      );
    case 'profile':
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="8" r="3" />
          <path d="M5 20c1.5-3 4-4 7-4s5.5 1 7 4" />
        </svg>
      );
    case 'settings':
    default:
      return (
        <svg {...baseProps}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c0 .69.28 1.35.78 1.82.5.47 1.16.74 1.82.74H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
  }
}

function NotificationIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}
