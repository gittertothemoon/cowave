import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAppState } from '../../state/AppStateContext.jsx';
import Logo from '../ui/Logo.jsx';
import { useLogout } from '../../hooks/useLogout.js';

export default function Topbar({
  activePersonaId,
  onPersonaChange,
  onToggleSidebar,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { personas, rooms, followedRoomIds } = useAppState();
  const logout = useLogout();

  const followedRooms = followedRoomIds?.length
    ? rooms.filter((room) => followedRoomIds.includes(room.id))
    : rooms;
  const roomsNavTarget =
    followedRooms[0]?.id ?? rooms[0]?.id ?? 'room-dev';

  const currentPersona =
    personas.find((p) => p.id === activePersonaId) ?? personas[0];

  const [personaMenuOpen, setPersonaMenuOpen] = useState(false);

  const tickerItems = [
    '13 stanze live',
    '28 thread avviati oggi',
    'Sessione media 34 min',
    'Highlight Dev Lab: “Workflow senza feed”',
  ];

  const navLinkBase =
    'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition';
  const navLinkActive = 'bg-sky-500 text-slate-900 shadow-sm';
  const navLinkInactive =
    'text-slate-400 hover:text-slate-100 hover:bg-slate-800';

  const navItems = [
    {
      label: 'Feed',
      to: '/app',
      icon: 'feed',
      exact: true,
      match: (path) => path === '/app',
    },
    {
      label: 'Stanze',
      to: `/app/rooms/${roomsNavTarget}`,
      icon: 'rooms',
      match: (path) => path.startsWith('/app/rooms'),
    },
    {
      label: 'Profilo',
      to: '/app/profile',
      icon: 'profile',
      match: (path) => path.startsWith('/app/profile'),
    },
    {
      label: 'Impostazioni',
      to: '/app/settings',
      icon: 'settings',
      match: (path) => path.startsWith('/app/settings'),
    },
  ];

  const sessionStats = [
    { label: 'Focus', value: '28m', detail: 'ancora 12m' },
    { label: 'Rami attivi', value: '7', detail: '+3 oggi' },
    { label: 'Streak', value: '5 giorni', detail: 'modalità mindful' },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 lg:px-6">
        <div className="flex h-14 items-center gap-2">
          <div className="flex items-center gap-2">
            <button
              className="inline-flex items-center justify-center rounded-md p-2 text-slate-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 md:hidden"
              onClick={onToggleSidebar}
              aria-label="Apri menu stanze"
            >
              <div className="space-y-1">
                <span className="block h-0.5 w-5 bg-slate-200" />
                <span className="block h-0.5 w-5 bg-slate-200" />
                <span className="block h-0.5 w-5 bg-slate-200" />
              </div>
            </button>
            <Link
              to="/app"
              className="flex items-center gap-2 text-slate-200"
            >
              <Logo size={32} className="-ml-1" />
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  CoWave
                </span>
                <span className="text-[10px] text-slate-500">beta privata</span>
              </div>
            </Link>
          </div>

          <div className="hidden md:flex flex-1 items-center gap-3 pl-2">
            <div className="flex-1 bg-slate-900/80 border border-slate-800 rounded-2xl px-3 py-1.5 items-center gap-2 text-xs focus-within:border-sky-500/60 transition flex">
              <span className="text-slate-500">⌘K</span>
              <input
                className="bg-transparent flex-1 min-w-0 focus:outline-none text-slate-200 placeholder:text-slate-500 text-sm"
                placeholder="Cerca stanze, thread o persone…"
              />
              <span className="text-[10px] text-slate-500">ricerca</span>
            </div>
            <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Sessione mindful in corso
            </div>
            <button className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-700 text-slate-300 hover:text-white">
              <NotificationIcon />
            </button>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-800 text-slate-300 hover:text-white md:hidden"
              aria-label="Notifiche"
            >
              <NotificationIcon />
            </button>
            <div className="relative">
              <button
                onClick={() => setPersonaMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 text-xs bg-slate-900/70 border border-slate-800 rounded-2xl px-2.5 py-1.5 hover:border-sky-500/70 transition"
              >
                <span className="h-7 w-7 rounded-full bg-gradient-to-br from-accent to-accentBlue flex items-center justify-center text-[10px] font-semibold text-slate-950">
                  {currentPersona?.label?.[0] ?? 'P'}
                </span>
                <div className="hidden md:block text-left">
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Persona attiva
                  </p>
                  <p className="text-[11px] font-medium">
                    {currentPersona?.label ?? 'Tu'}
                  </p>
                </div>
              </button>

              {personaMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-950 border border-slate-800 rounded-2xl shadow-soft py-1.5 text-xs z-40 backdrop-blur-xl">
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
                      <span className="truncate">{p.label}</span>
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
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setPersonaMenuOpen(false);
                    }}
                    className="w-full px-3 py-1.5 text-left text-[11px] text-rose-300 hover:bg-white/5 border-t border-white/5"
                  >
                    Esci
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="md:hidden w-full pb-3">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-3 py-1.5 text-sm flex items-center gap-2 focus-within:border-sky-500/60 transition">
            <span className="text-slate-500">🔍</span>
            <input
              className="bg-transparent flex-1 focus:outline-none text-slate-200 placeholder:text-slate-500"
              placeholder="Cerca thread o stanze…"
            />
          </div>
        </div>

        <div className="py-3 space-y-3">
          <nav className="flex flex-wrap gap-2 overflow-x-auto pb-1">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.exact}
                className={({ isActive }) => {
                  const active = item.match
                    ? item.match(location.pathname)
                    : isActive;
                  return `${navLinkBase} ${
                    active ? navLinkActive : navLinkInactive
                  }`;
                }}
              >
                <span className="text-white/80">
                  <NavItemIcon type={item.icon} />
                </span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[11px] text-slate-400 sm:hidden">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
              Sessione mindful attiva
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-2">
              <button className="focus-pill hidden lg:inline-flex">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                Radar
              </button>
              <button
                onClick={() => navigate(`/app/rooms/${roomsNavTarget}`)}
                className="text-[11px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-2xl text-slate-950 font-semibold shadow-glow w-full sm:w-auto text-center"
                style={{
                  backgroundImage: 'linear-gradient(120deg, #a78bfa, #38bdf8)',
                }}
              >
                Nuova stanza
              </button>
              <button
                type="button"
                onClick={logout}
                className="hidden md:inline-flex text-[11px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-2xl border border-slate-800 text-slate-300 hover:text-white transition text-center"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-3 gap-2">
            {sessionStats.map((stat) => (
              <div
                key={stat.label}
                className="px-3 py-1.5 rounded-2xl border border-slate-800 text-xs text-slate-300"
              >
                <p className="uppercase tracking-[0.2em] text-[10px] text-slate-500">
                  {stat.label}
                </p>
                <p className="text-white font-semibold">{stat.value}</p>
                <p className="text-[10px] text-slate-500">{stat.detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="hidden lg:block border-t border-slate-800/80 py-1">
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
