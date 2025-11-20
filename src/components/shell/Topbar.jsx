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

  const navLinkBase =
    'inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition whitespace-nowrap';
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

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto w-full max-w-6xl px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col gap-2 py-2 md:py-0">
          <div className="flex h-14 items-center gap-2">
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
              className="hidden md:flex items-center gap-2 text-slate-200"
            >
              <Logo size={32} className="-ml-1" />
              <div className="flex flex-col leading-tight">
                <span className="text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  CoWave
                </span>
                <span className="text-[10px] text-slate-500">beta privata</span>
              </div>
            </Link>
            <div className="flex flex-1 justify-center md:hidden">
              <Link
                to="/app"
                className="flex items-center gap-2 text-slate-100"
                aria-label="Vai alla home CoWave"
              >
                <Logo size={28} />
                <span className="text-sm font-semibold tracking-tight">
                  CoWave
                </span>
              </Link>
            </div>

            <div className="hidden md:flex flex-1 justify-center px-4 lg:px-8">
              <div className="flex w-full max-w-md items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs transition focus-within:border-sky-500/60">
                <span className="text-slate-500">⌘K</span>
                <input
                  className="bg-transparent flex-1 min-w-0 focus:outline-none text-slate-200 placeholder:text-slate-500 text-sm"
                  placeholder="Cerca stanze, thread o persone…"
                />
                <span className="text-[10px] text-slate-500">ricerca</span>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-800 text-slate-300 hover:text-white md:hidden"
                aria-label="Notifiche"
              >
                <NotificationIcon />
              </button>
              <nav className="hidden md:flex items-center gap-1">
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
              <button
                className="hidden md:inline-flex items-center justify-center w-9 h-9 rounded-full border border-slate-800 text-slate-300 hover:text-white"
                aria-label="Notifiche"
              >
                <NotificationIcon />
              </button>
              <div className="relative">
                <button
                  onClick={() => setPersonaMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 px-2 py-1.5 text-xs hover:border-sky-500/70 transition md:px-2.5"
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
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-800 bg-slate-950 py-1.5 text-xs shadow-soft backdrop-blur-xl z-40">
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
                      className="w-full border-t border-white/5 px-3 py-1.5 text-left text-[11px] text-slate-400 hover:bg-white/5"
                    >
                      Gestisci personas
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        logout();
                        setPersonaMenuOpen(false);
                      }}
                      className="w-full border-t border-white/5 px-3 py-1.5 text-left text-[11px] text-rose-300 hover:bg-white/5"
                    >
                      Esci
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="md:hidden space-y-2 pb-1">
            <div className="px-0.5">
              <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-sm transition focus-within:border-sky-500/60">
                <span className="text-slate-500">🔍</span>
                <input
                  className="bg-transparent flex-1 focus:outline-none text-slate-200 placeholder:text-slate-500"
                  placeholder="Cerca thread o stanze…"
                />
              </div>
            </div>
            <nav className="px-0.5">
              <div className="flex gap-2 overflow-x-auto pb-1">
                {navItems.map((item) => (
                  <NavLink
                    key={`${item.label}-mobile`}
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
              </div>
            </nav>
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
