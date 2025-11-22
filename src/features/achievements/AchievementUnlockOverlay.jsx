import AchievementIcon from './AchievementIcon.jsx';
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  cardBaseClass,
} from '../../components/ui/primitives.js';

export default function AchievementUnlockOverlay({
  achievement,
  onClose,
  onViewProfile,
}) {
  if (!achievement) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-70 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(167,139,250,0.35), transparent 45%), radial-gradient(circle at 80% 10%, rgba(56,189,248,0.32), transparent 45%)',
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={`${cardBaseClass} max-w-sm w-full mx-4 rounded-3xl border border-accent/50 bg-slate-950/90 shadow-xl shadow-slate-900/80 p-6 space-y-5 animate-scaleIn relative`}
      >
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-accent via-accentSoft to-accentBlue text-slate-950 flex items-center justify-center shadow-glow animate-pulseSoft">
              <AchievementIcon
                achievementId={achievement.id}
                className="h-9 w-9 text-slate-950/90"
              />
            </div>
            <div className="absolute inset-0 -z-10 rounded-full bg-accent/30 blur-2xl opacity-70" />
          </div>
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-[0.22em] text-accent">
              Nuovo traguardo sbloccato
            </p>
            <h3 className="text-xl font-semibold text-white leading-tight">
              {achievement.title}
            </h3>
            <p className="text-sm text-slate-300 leading-snug">
              {achievement.description}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className={`${buttonPrimaryClass} w-full sm:w-auto text-base`}
          >
            Continua
          </button>
          <button
            type="button"
            onClick={onViewProfile}
            className={`${buttonSecondaryClass} w-full sm:w-auto`}
          >
            Vedi tutti i traguardi
          </button>
        </div>
      </div>
    </div>
  );
}
