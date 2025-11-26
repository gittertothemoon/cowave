import { Link } from 'react-router-dom';
import {
  bodyTextClass,
  cardBaseClass,
  eyebrowClass,
  pageTitleClass,
} from '../../components/ui/primitives.js';

function getInitials(name) {
  if (!name) return 'TU';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export default function ProfileHeader({
  user,
  personaLabel,
  stats,
  followedRoomsCount,
}) {
  const initials = getInitials(user?.displayName);
  const joinedText = user?.joinedLabel ?? 'Da poco su CoWave';
  const quickActions = [
    { label: 'Modifica profilo', to: '/settings#profilo' },
    { label: 'Persona attiva', to: '/settings#persona-attiva' },
  ];

  return (
    <section className={`${cardBaseClass} p-5 sm:p-6 rounded-3xl`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-accent/80 via-accentSoft/80 to-accentBlue/70 text-slate-950 font-semibold flex items-center justify-center shadow-glow">
            {initials}
          </div>
          <div className="space-y-2 sm:space-y-3">
            <p className={eyebrowClass}>Profilo</p>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-3">
              <h1 className={`${pageTitleClass} text-xl sm:text-2xl`}>
                {user?.displayName || 'Tu'}
              </h1>
              <span className="text-sm text-slate-400">
                {user?.handle || '@tu'}
              </span>
            </div>
            <p className={`${bodyTextClass} text-sm text-slate-200 leading-relaxed`}>
              {user?.bio ||
                'Aggiungi una breve descrizione su come vuoi usare CoWave.'}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-accent/60 bg-accent/10 px-3 py-1 text-[12px] font-semibold text-accent">
                <span className="h-2 w-2 rounded-full bg-accent" />
                Persona attiva: {personaLabel || 'In definizione'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.to}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-[12px] font-semibold text-white hover:border-accent/60 hover:text-accent transition"
                >
                  {action.label}
                  <span className="text-[12px] text-accent">↗</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 text-sm text-slate-200 w-full lg:w-auto lg:justify-end">
          <MetaPill label="Iscritto da" value={joinedText} />
          <MetaPill
            label="Stanze seguite"
            value={followedRoomsCount ?? 0}
          />
          <MetaPill
            label="Thread avviati"
            value={stats?.threadsStarted ?? 0}
          />
          <MetaPill
            label="Risposte inviate"
            value={stats?.repliesSent ?? 0}
          />
        </div>
      </div>
    </section>
  );
}

function MetaPill({ label, value }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1.5">
      <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
        {label}
      </span>
      <span className="text-sm font-semibold text-white">{value}</span>
    </span>
  );
}
