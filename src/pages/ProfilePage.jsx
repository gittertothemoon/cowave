import { personas } from '../mockData.js';

const rituals = [
  {
    title: 'Vibe check mattina',
    detail: '3 stanze leggere, 1 thread lungo, timer 18 min.',
  },
  {
    title: 'Coaching room',
    detail: 'Hosta la stanza Deep Talk ogni giovedì.',
  },
  {
    title: 'Night detox',
    detail: 'Modalità contenuti intensi off + recap scritto.',
  },
];

export default function ProfilePage({ activePersonaId }) {
  const activePersona = personas.find((p) => p.id === activePersonaId);

  return (
    <div className="space-y-5">
      <header className="glass-panel p-4 sm:p-5 space-y-2">
        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
          Profilo
        </p>
        <h1 className="text-2xl font-semibold text-white">
          Le tue personas e le stanze che curi
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Ogni persona è un modo diverso di mostrarti nei mondi che frequenti.
          Qui puoi gestire voce, rituali e prossimi esperimenti.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel p-4 sm:p-5 space-y-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Persona attiva
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent to-accentBlue flex items-center justify-center text-sm font-semibold text-slate-950">
              {activePersona?.label?.[0] ?? 'P'}
            </div>
            <div>
              <p className="text-base font-semibold">{activePersona?.label}</p>
              <p className="text-[12px] text-slate-400">
                Presto potrai salvare descrizioni diverse e scegliere dove è visibile.
              </p>
            </div>
          </div>
          <button
            type="button"
            className="text-xs px-4 py-2 rounded-2xl bg-slate-950/40 border border-white/10 hover:border-accent/50 transition"
          >
            Personalizza persona
          </button>
        </div>

        <div className="glass-panel p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Altre personas
            </p>
            <button
              type="button"
              className="text-[11px] text-accent hover:text-accentSoft"
            >
              + Aggiungi
            </button>
          </div>
          <ul className="space-y-2 text-sm">
            {personas.map((p) => (
              <li
                key={p.id}
                className="rounded-2xl border border-white/10 px-3 py-2 bg-slate-950/40"
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

        <div className="glass-panel p-4 sm:p-5 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-accent">
            Rituali salvati
          </p>
          <ul className="space-y-3 text-sm text-slate-300">
            {rituals.map((ritual) => (
              <li key={ritual.title} className="rounded-2xl border border-white/10 px-3 py-2 bg-slate-950/40">
                <p className="font-semibold text-white">{ritual.title}</p>
                <p className="text-[12px] text-slate-400">{ritual.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
