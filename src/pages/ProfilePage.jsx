import { useAppState } from '../state/AppStateContext.jsx';
import {
  cardBaseClass,
  cardMutedClass,
  eyebrowClass,
  pageTitleClass,
  bodyTextClass,
  buttonSecondaryClass,
} from '../components/ui/primitives.js';
import { ACHIEVEMENTS } from '../features/achievements/achievementsConfig.js';
import { useAchievements } from '../features/achievements/useAchievements.js';
import AchievementIcon from '../features/achievements/AchievementIcon.jsx';

const rituals = [
  {
    title: 'Check mattutino',
    detail: '3 stanze leggere, 1 thread lungo, timer 18 min.',
  },
  {
    title: 'Sessione coaching',
    detail: 'Ospita la stanza Deep Talk ogni giovedì.',
  },
  {
    title: 'Detox serale',
    detail: 'Contenuti intensi off e recap scritto prima di uscire.',
  },
];

export default function ProfilePage({ activePersonaId }) {
  const { personas } = useAppState();
  const { unlockedSet, unlockedIds } = useAchievements();
  const activePersona = personas.find((p) => p.id === activePersonaId);
  const unlockedCount = unlockedIds.length;

  return (
    <div className="space-y-5">
      <header className={`${cardBaseClass} p-4 sm:p-5 space-y-2`}>
        <p className={eyebrowClass}>Profilo</p>
        <h1 className={`${pageTitleClass} text-2xl`}>
          Personas e stanze che curi
        </h1>
        <p className={`${bodyTextClass} max-w-2xl`}>
          Persone diverse per toni diversi. Qui gestisci voce, rituali e prepari i
          prossimi esperimenti.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className={`${cardBaseClass} p-4 sm:p-5 space-y-4`}>
          <p className={eyebrowClass}>Persona attiva</p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent to-accentBlue flex items-center justify-center text-sm font-semibold text-slate-950">
              {activePersona?.label?.[0] ?? 'P'}
            </div>
            <div>
              <p className="text-base font-semibold">{activePersona?.label}</p>
              <p className="text-[12px] text-slate-400">
                A breve potrai aggiungere descrizioni dedicate e decidere dove mostrarle.
              </p>
            </div>
          </div>
          <button
            type="button"
            className={`${buttonSecondaryClass} rounded-full`}
          >
            Personalizza persona
          </button>
        </div>

        <div className={`${cardBaseClass} p-4 sm:p-5 space-y-3`}>
          <div className="flex items-center justify-between">
            <p className={eyebrowClass}>Altre personas</p>
            <button
              type="button"
              className="text-[11px] text-accent hover:text-accentSoft rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              + Aggiungi
            </button>
          </div>
          <ul className="space-y-2 text-sm">
            {personas.map((p) => (
              <li
                key={p.id}
                className={`${cardMutedClass} px-3 py-2`}
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span>{p.label}</span>
                  <span className="text-[11px] text-slate-500">
                    Reputazione: in arrivo
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={`${cardBaseClass} p-4 sm:p-5 space-y-3`}>
          <p className={`${eyebrowClass} text-accent`}>Rituali salvati</p>
          <ul className="space-y-3 text-sm text-slate-300">
            {rituals.map((ritual) => (
              <li key={ritual.title} className={`${cardMutedClass} px-3 py-2`}>
                <p className="font-semibold text-white">{ritual.title}</p>
                <p className="text-[12px] text-slate-400">{ritual.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={`${cardBaseClass} p-4 sm:p-5 space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className={eyebrowClass}>Traguardi</p>
            <h2 className={`${pageTitleClass} text-xl`}>
              Progressi su CoWave
            </h2>
            <p className={`${bodyTextClass} text-sm`}>
              Sblocca badge usando le stanze, rispondendo e completando l’onboarding.
            </p>
          </div>
          <span className="text-[11px] text-slate-300 rounded-full border border-white/10 px-3 py-1 bg-slate-900/60">
            {unlockedCount}/{ACHIEVEMENTS.length} sbloccati
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = unlockedSet.has(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`rounded-2xl border p-3 sm:p-4 flex flex-col gap-2 transition ${
                  unlocked
                    ? 'border-sky-400/60 bg-sky-500/10 shadow-[0_12px_34px_rgba(56,189,248,0.18)]'
                    : 'border-slate-800 border-dashed bg-slate-950/70 opacity-80'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div
                    className={`h-12 w-12 rounded-xl border flex items-center justify-center ${
                      unlocked
                        ? 'bg-gradient-to-br from-accent/20 via-accentSoft/20 to-accentBlue/25 border-accent/50 shadow-glow'
                        : 'bg-slate-900/70 border-slate-800'
                    }`}
                  >
                    <AchievementIcon
                      achievementId={achievement.id}
                      className={
                        unlocked
                          ? 'h-8 w-8 text-accent'
                          : 'h-8 w-8 text-slate-500 opacity-50'
                      }
                    />
                  </div>
                  <span
                    className={`text-[11px] font-semibold uppercase tracking-[0.14em] rounded-full px-2 py-1 ${
                      unlocked
                        ? 'text-emerald-100 bg-emerald-500/15 border border-emerald-400/40'
                        : 'text-slate-400 bg-slate-900/60 border border-slate-800'
                    }`}
                  >
                    {unlocked ? 'Sbloccato' : 'Bloccato'}
                  </span>
                </div>
                <div className="space-y-1">
                  <p
                    className={`text-sm font-semibold ${
                      unlocked ? 'text-white' : 'text-slate-200'
                    }`}
                  >
                    {achievement.title}
                  </p>
                  <p className="text-[12px] text-slate-400 leading-snug">
                    {achievement.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
