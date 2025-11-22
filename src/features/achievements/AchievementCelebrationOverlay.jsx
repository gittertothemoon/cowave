import { useEffect } from 'react';
import { AchievementIcon } from './AchievementIcon.jsx';
import { ConfettiBurst } from './ConfettiBurst.jsx';
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
} from '../../components/ui/primitives.js';

export function AchievementCelebrationOverlay({
  achievement,
  onContinue,
  onViewAchievements,
}) {
  if (!achievement) return null;

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(120);
    }
  }, [achievement.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="absolute inset-0 -z-10 opacity-70 blur-3xl bg-gradient-to-tr from-accent/40 via-purple-500/30 to-fuchsia-500/35" />
      <ConfettiBurst />
      <div className="relative max-w-sm w-full mx-4 rounded-3xl border border-accent/60 bg-slate-950/95 shadow-xl shadow-slate-900/80 p-6 space-y-5 animate-scaleIn">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent/30 via-sky-500/25 to-purple-500/30 shadow-lg shadow-accent/40 animate-pulseSoft">
          <AchievementIcon
            achievementId={achievement.id}
            className="h-9 w-9 text-slate-50"
          />
        </div>
        <div className="space-y-2 text-center">
          <p className="text-[11px] font-semibold tracking-[0.26em] uppercase text-accent">
            Nuovo traguardo sbloccato
          </p>
          <h2 className="text-xl font-semibold text-slate-50">
            {achievement.title}
          </h2>
          <p className="text-sm text-slate-300">{achievement.description}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={onContinue}
            className={`${buttonPrimaryClass} w-full text-sm`}
          >
            Continua
          </button>
          <button
            type="button"
            onClick={onViewAchievements}
            className={`${buttonSecondaryClass} w-full text-sm`}
          >
            Vedi i traguardi
          </button>
        </div>
      </div>
    </div>
  );
}
