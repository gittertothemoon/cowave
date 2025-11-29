import {
  bodyTextClass,
  cardBaseClass,
  cardMutedClass,
  sectionTitleClass,
} from '../../components/ui/primitives.js';
import { ACHIEVEMENTS } from '../achievements/achievementsConfig.js';
import AchievementIcon from '../achievements/AchievementIcon.jsx';

export default function ProfileAchievementsSection({
  unlocked = [],
  isLoading = false,
}) {
  const unlockedMap = new Map(
    (unlocked ?? []).map((item) => [item.id, item.unlockedAt ?? null])
  );
  const items = ACHIEVEMENTS.map((achievement) => {
    const unlockedAt = unlockedMap.get(achievement.id) ?? null;
    return {
      ...achievement,
      unlockedAt,
      isUnlocked: unlockedMap.has(achievement.id),
    };
  });
  const unlockedCount = items.filter((item) => item.isUnlocked).length;
  const total = items.length;
  const progress = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;
  const isEmpty = unlockedCount === 0;

  return (
    <section className={`${cardBaseClass} p-5 sm:p-6 space-y-4`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={sectionTitleClass}>Traguardi</p>
          <h3 className="text-lg font-semibold text-white">
            I tuoi progressi
          </h3>
          <p className={`${bodyTextClass} text-sm text-slate-300`}>
            Sblocca obiettivi in stile videogame: ogni azione costruisce il tuo profilo.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-auto sm:items-end">
          <p className="text-[12px] text-slate-400 flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/70 px-2 py-1 border border-slate-800/80">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.15)]" />
              {isLoading ? 'Aggiornamento...' : `${unlockedCount} su ${total} sbloccati`}
            </span>
            <span className="text-slate-500">•</span>
            <span>{progress}% completato</span>
          </p>
          <div className="h-2 w-full sm:w-48 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {isEmpty && (
        <div className={`${cardMutedClass} border border-dashed border-slate-800 p-4 rounded-2xl`}>
          <p className="text-[13px] text-slate-300">
            Qui compariranno i traguardi che sblocchi: prova a creare un thread, rispondere,
            mandare un’onda o allegare una foto per far apparire il primo badge.
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((achievement) => {
          const isUnlocked = achievement.isUnlocked;
          const tier = getTierStyles(achievement.tier);
          return (
            <div
              key={achievement.id}
              className={`${cardMutedClass} p-4 rounded-2xl flex gap-3 border relative ${
                isUnlocked
                  ? 'border-accent/60 bg-slate-900/60 shadow-[0_12px_35px_rgba(0,0,0,0.35)]'
                  : 'border-dashed border-slate-800 opacity-90'
              }`}
            >
              <div
                className={`h-12 w-12 rounded-xl border flex items-center justify-center ${
                  isUnlocked
                    ? `bg-gradient-to-br ${tier.pedestal} border-accent/60`
                    : 'bg-slate-900/70 border-slate-800'
                }`}
              >
                <AchievementIcon
                  achievementId={achievement.id}
                  className={
                    isUnlocked
                      ? 'h-7 w-7 text-accent'
                      : 'h-7 w-7 text-slate-500 opacity-60'
                  }
                />
              </div>
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={`text-sm font-semibold ${
                      isUnlocked ? 'text-white' : 'text-slate-200'
                    }`}
                  >
                    {achievement.title}
                  </p>
                  <span
                    className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${tier.badge}`}
                  >
                    {tier.label}
                  </span>
                </div>
                <p className="text-[12px] text-slate-400 leading-snug">
                  {achievement.description}
                </p>
                <p
                  className={`text-[12px] ${
                    isUnlocked ? 'text-emerald-200' : 'text-slate-500'
                  }`}
                >
                  {isUnlocked
                    ? `Sbloccato il ${formatUnlockDate(achievement.unlockedAt)}`
                    : lockedHint(achievement.id)}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function lockedHint(id) {
  switch (id) {
    case 'FIRST_THREAD':
      return 'Apri il tuo primo thread in una stanza.';
    case 'FIRST_COMMENT':
      return 'Scrivi una risposta a un thread che ti interessa.';
    case 'FIRST_WAVE':
      return 'Manda un’onda a un commento che ti colpisce.';
    case 'FIRST_PHOTO':
      return 'Allega una foto a una tua risposta.';
    case 'CONSISTENT_3':
    default:
      return 'Scrivi una riflessione al giorno per tre giorni di fila.';
  }
}

function formatUnlockDate(value) {
  if (!value) return 'oggi';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'qualche giorno fa';
  return date.toLocaleDateString('it-IT', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function getTierStyles(tier) {
  switch (tier) {
    case 'gold':
      return {
        label: 'Oro',
        pedestal: 'from-amber-300/30 via-amber-400/30 to-orange-500/30',
        badge:
          'border-amber-300/60 bg-amber-500/10 text-amber-100 shadow-[0_0_14px_rgba(251,191,36,0.2)]',
      };
    case 'silver':
      return {
        label: 'Argento',
        pedestal: 'from-slate-200/25 via-slate-300/20 to-cyan-100/20',
        badge:
          'border-slate-200/50 bg-slate-100/10 text-slate-100 shadow-[0_0_12px_rgba(148,163,184,0.2)]',
      };
    case 'bronze':
    default:
      return {
        label: 'Bronzo',
        pedestal: 'from-amber-400/25 via-amber-500/20 to-orange-500/20',
        badge:
          'border-amber-300/40 bg-amber-500/10 text-amber-100 shadow-[0_0_10px_rgba(251,191,36,0.16)]',
      };
  }
}
