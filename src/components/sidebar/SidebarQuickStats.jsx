import { cardBaseClass, eyebrowClass } from '../ui/primitives.js';

function SidebarStatPill({ label, value, helper }) {
  return (
    <div
      className="
        flex flex-col items-center justify-center
        rounded-xl border border-slate-800 bg-slate-950/70
        px-2 py-2 min-h-[72px]
        text-center
      "
    >
      <span className="text-[9px] font-semibold tracking-[0.22em] text-slate-500 uppercase">
        {label}
      </span>
      <span className="mt-0.5 text-lg font-semibold text-slate-50 leading-tight tabular-nums">
        {value}
      </span>
      <span className="mt-0.5 text-[10px] text-slate-500 whitespace-nowrap leading-tight">
        {helper}
      </span>
    </div>
  );
}

export function SidebarQuickStats({ rooms, threadsToday, repliesToday }) {
  return (
    <section className={`${cardBaseClass} p-3 space-y-2`}>
      <p className={eyebrowClass}>Controllo rapido</p>
      <p className="text-xs text-slate-400">
        Numeri veloci sulle stanze che segui.
      </p>
      <div className="grid grid-cols-3 gap-1.5">
        <SidebarStatPill label="STANZE" value={rooms} helper="in elenco" />
        <SidebarStatPill label="THREAD" value={threadsToday} helper="ultime 24h" />
        <SidebarStatPill label="RISPOSTE" value={repliesToday} helper="ultime 24h" />
      </div>
    </section>
  );
}
