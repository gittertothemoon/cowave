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

  const tier = getTierMeta(achievement.tier);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(120);
    }
  }, [achievement.id]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onContinue?.();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onContinue]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="absolute inset-0 -z-10 opacity-80 blur-3xl bg-[radial-gradient(circle_at_22%_18%,rgba(167,139,250,0.28),transparent_45%),radial-gradient(circle_at_80%_8%,rgba(56,189,248,0.25),transparent_40%),radial-gradient(circle_at_70%_75%,rgba(14,165,233,0.18),transparent_35%)]" />
      <ConfettiBurst />
      <div className="relative max-w-lg w-full mx-4 overflow-hidden rounded-[28px] border border-slate-800/70 bg-slate-950/95 shadow-[0_24px_90px_rgba(0,0,0,0.65)] animate-scaleIn">
        <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-accent via-sky-400 to-accentBlue opacity-80" />
        <div className="absolute inset-0 pointer-events-none border border-white/5 rounded-[28px]" />
        <button
          type="button"
          aria-label="Chiudi"
          onClick={onContinue}
          className="absolute right-3 top-3 rounded-full border border-slate-800/70 bg-slate-900/70 px-2 py-1 text-slate-400 hover:text-white hover:border-accent/60"
        >
          X
        </button>
        <div className="p-6 sm:p-7 space-y-5">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="relative">
              <div
                className={`h-16 w-16 sm:h-20 sm:w-20 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(167,139,250,0.35)] bg-gradient-to-br ${tier.pedestal}`}
              >
                <AchievementIcon
                  achievementId={achievement.id}
                  className="h-9 w-9 text-slate-50"
                />
              </div>
              <div
                className={`absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] ${tier.badge}`}
              >
                {tier.label}
              </div>
            </div>
            <div className="space-y-2 flex-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/50 bg-accent/10 px-3 py-1 text-[11px] font-semibold tracking-[0.2em] uppercase text-accent">
                Traguardo sbloccato
                <span className="block h-[6px] w-[6px] rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(52,211,153,0.12)]" />
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-slate-50 leading-snug">
                {achievement.title}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {achievement.description}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={onContinue}
              className={`${buttonPrimaryClass} w-full text-sm sm:text-base bg-gradient-to-r from-accent via-sky-500 to-accentBlue text-slate-950 shadow-[0_18px_50px_rgba(56,189,248,0.32)]`}
            >
              Continua
            </button>
            <button
              type="button"
              onClick={onViewAchievements}
              className={`${buttonSecondaryClass} w-full text-sm sm:text-base border-accent/50 text-slate-100 hover:text-white`}
            >
              Vai al profilo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function getTierMeta(tier) {
  switch (tier) {
    case 'gold':
      return {
        label: 'Oro',
        pedestal: 'from-amber-200/30 via-amber-400/30 to-orange-500/35',
        badge: 'border-amber-300/50 bg-amber-500/10 text-amber-100 shadow-[0_0_20px_rgba(251,191,36,0.25)]',
      };
    case 'silver':
      return {
        label: 'Argento',
        pedestal: 'from-slate-200/30 via-slate-300/20 to-cyan-100/25',
        badge: 'border-slate-200/50 bg-slate-100/10 text-slate-100 shadow-[0_0_18px_rgba(148,163,184,0.3)]',
      };
    case 'bronze':
    default:
      return {
        label: 'Bronzo',
        pedestal: 'from-amber-400/35 via-amber-500/25 to-orange-500/30',
        badge: 'border-amber-300/40 bg-amber-500/10 text-amber-100 shadow-[0_0_16px_rgba(251,191,36,0.18)]',
      };
  }
}
