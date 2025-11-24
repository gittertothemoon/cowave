import {
  bodyTextClass,
  cardBaseClass,
  cardMutedClass,
  sectionTitleClass,
} from '../../components/ui/primitives.js';
import { ACHIEVEMENTS } from '../achievements/achievementsConfig.js';
import AchievementIcon from '../achievements/AchievementIcon.jsx';

export default function ProfileAchievementsSection({ unlocked }) {
  const unlockedSet = new Set(unlocked ?? []);
  const unlockedCount = unlockedSet.size;
  const total = ACHIEVEMENTS.length;
  const progress = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;

  return (
    <section className={`${cardBaseClass} p-5 sm:p-6 space-y-4`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className={sectionTitleClass}>Traguardi</p>
          <h3 className="text-lg font-semibold text-white">
            I tuoi progressi
          </h3>
          <p className={`${bodyTextClass} text-sm`}>
            I traguardi che sblocchi man mano che usi CoWave.
          </p>
        </div>
        <div className="flex flex-col gap-2 w-full sm:w-auto sm:items-end">
          <p className="text-[12px] text-slate-400">
            {unlockedCount} sbloccati su {total} • {progress}% completato
          </p>
          <div className="h-2 w-full sm:w-40 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-accent transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {unlockedCount === 0 && (
        <p className="text-[12px] text-slate-400">
          Qui vedrai i traguardi che sblocchi man mano che usi CoWave.
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedSet.has(achievement.id);
          return (
            <div
              key={achievement.id}
              className={`${cardMutedClass} p-4 rounded-2xl flex gap-3 border ${
                isUnlocked
                  ? 'border-accent/60 bg-slate-900/60'
                  : 'border-dashed border-slate-800 opacity-80'
              }`}
            >
              <div
                className={`h-12 w-12 rounded-xl border flex items-center justify-center ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-accent/15 via-accentSoft/15 to-accentBlue/20 border-accent/60'
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
              <div className="space-y-1">
                <p
                  className={`text-sm font-semibold ${
                    isUnlocked ? 'text-white' : 'text-slate-200'
                  }`}
                >
                  {achievement.title}
                </p>
                <p className="text-[12px] text-slate-400 leading-snug">
                  {achievement.description}
                </p>
                <span
                  className={`inline-flex w-fit rounded-full px-2 py-1 text-[11px] font-semibold ${
                    isUnlocked
                      ? 'text-emerald-100 bg-emerald-500/15 border border-emerald-400/40'
                      : 'text-slate-400 bg-slate-900/70 border border-slate-800'
                  }`}
                >
                  {isUnlocked ? 'Sbloccato' : 'Da sbloccare'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
