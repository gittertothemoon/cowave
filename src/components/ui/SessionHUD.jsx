import { cardBaseClass, eyebrowClass } from './primitives.js';

const tickerMessages = [
  '13 stanze attive con timer',
  '2 richieste di accesso in attesa',
  'Preset attuale: Comfort 45%',
  'Ultimo thread profondo: “Dev Lab / Rami automatici”',
];

export default function SessionHUD({
  floating = true,
  className = '',
  fullWidth = false,
}) {
  const card = (
    <div
      className={`${cardBaseClass} w-full ${
        fullWidth ? '' : 'max-w-sm'
      } p-4 sm:p-5 space-y-4 shadow-glow`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className={eyebrowClass}>Sessione</p>
          <p className="text-sm text-white font-semibold">Focus intenzionale</p>
        </div>
        <span className="focus-pill">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          Attiva
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
        <div className="rounded-2xl border border-white/10 px-3 py-2 space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Rimanente
          </p>
          <p className="text-base text-white font-semibold">24 min</p>
        </div>
        <div className="rounded-2xl border border-white/10 px-3 py-2 space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
            Prossima pausa
          </p>
          <p className="text-base text-white font-semibold">8 min</p>
        </div>
      </div>
      <div className="ticker text-[11px] text-slate-400 border border-white/10 rounded-2xl px-3 py-2 bg-slate-950/50">
        <div className="ticker__inner">
          {tickerMessages.map((msg) => (
            <span key={msg} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {msg}
            </span>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-400">
        <span>Streak mindful</span>
        <span className="text-white font-semibold">5 giorni</span>
      </div>
    </div>
  );

  if (!floating) {
    return <div className={className}>{card}</div>;
  }

  return (
    <div className={`hidden lg:block fixed bottom-6 right-6 z-40 ${className}`}>
      {card}
    </div>
  );
}
