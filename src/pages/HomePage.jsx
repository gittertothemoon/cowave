import { useMemo, useState } from 'react';
import ThreadCard from '../components/threads/ThreadCard.jsx';
import { useAppState } from '../state/AppStateContext.jsx';

const energyFilters = [
  { label: 'Tutti', value: 'all' },
  { label: 'Costruttivo', value: 'costruttivo' },
  { label: 'Riflessivo', value: 'riflessivo' },
  { label: 'Tecnico', value: 'tecnico' },
  { label: 'Giocoso', value: 'giocoso' },
];

const quickActions = [
  { label: 'Lancia stanza pop-up', desc: 'focus room da 30 minuti' },
  { label: 'Crea highlight vocale', desc: 'clip audio da 90 secondi' },
  { label: 'Invita co-host', desc: 'apri uno slot per un ospite' },
];

const highlightMoments = [
  'Dev Lab • workflow “senza feed” votato top della settimana',
  'Deep Talk • branch “stanchezza digitale” ha raggiunto 12 livelli',
  'Creators 18+ Lab • nuovo rituale serale sperimentale',
];

export default function HomePage() {
  const { threads, rooms } = useAppState();
  const [energyFilter, setEnergyFilter] = useState('all');

  const filteredThreads = useMemo(() => {
    if (energyFilter === 'all') return threads;
    return threads.filter((thread) => thread.energy === energyFilter);
  }, [threads, energyFilter]);

  return (
    <div className="space-y-5">
      <header className="glass-panel p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
              Home
            </p>
            <h1 className="text-2xl font-semibold mt-1 text-white">
              Il feed delle tue stanze
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Ogni card è un albero di conversazione. Niente scroll infinito:
              solo thread scelti dalle stanze che segui.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 text-[11px] text-slate-400 bg-slate-950/40 border border-white/10 rounded-2xl px-3 py-2 w-full sm:w-auto justify-center">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Focus mode • restano 28 min</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mt-4">
          {energyFilters.map((filter) => (
            <button
              key={filter.value}
              type="button"
              onClick={() => setEnergyFilter(filter.value)}
              className={`px-3 py-1.5 rounded-2xl text-xs border transition ${
                energyFilter === filter.value
                  ? 'bg-gradient-to-r from-accent/30 to-accentBlue/30 text-white border-accent/40'
                  : 'text-slate-400 border-white/10 hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      <section className="grid gap-5 items-start lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          {filteredThreads.length === 0 ? (
            <div className="glass-panel p-5 text-sm text-slate-400">
              Nessun thread con questa energia ora. Cambia filtro o avvia tu il
              prossimo.
            </div>
          ) : (
            filteredThreads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))
          )}
        </div>

        <aside className="space-y-4 w-full">
          <div className="glass-panel p-5 space-y-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Radar
            </p>
            <p className="text-sm text-slate-300">
              Quando attivi stanze o thread, qui arrivano promemoria e metriche
              rapide per restare orientato.
            </p>
          </div>

          <div className="glass-panel p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Stanze in evidenza
              </p>
              <span className="text-[11px] text-slate-500">
                {rooms.length} attive
              </span>
            </div>
            <ul className="space-y-2">
              {rooms.map((room) => (
                <li
                  key={room.id}
                  className="rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2 text-sm"
                >
                  <p className="font-semibold text-white">{room.name}</p>
                  <p className="text-[12px] text-slate-400 line-clamp-2">
                    {room.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-panel p-5 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Azioni veloci
            </p>
            <ul className="space-y-2 text-sm">
              {quickActions.map((action) => (
                <li
                  key={action.label}
                  className="rounded-2xl border border-white/10 px-3 py-2 bg-slate-950/40 flex flex-col"
                >
                  <span className="font-semibold text-white">{action.label}</span>
                  <span className="text-[12px] text-slate-400">{action.desc}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-panel p-4 space-y-2 text-[12px] text-slate-300">
            <p className="text-[11px] uppercase tracking-[0.18em] text-accent">
              Momenti iconici
            </p>
            <ul className="space-y-2">
              {highlightMoments.map((moment) => (
                <li key={moment} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5" />
                  <span>{moment}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
