import { useMemo, useState } from 'react';
import ThreadCard from '../components/threads/ThreadCard.jsx';
import { useAppState } from '../state/AppStateContext.jsx';
import SessionHeaderCard from '../components/ui/SessionHeaderCard.jsx';

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
  const { threads, rooms, followedRoomIds } = useAppState();
  const [energyFilter, setEnergyFilter] = useState('all');
  const accentPalette = ['#38bdf8', '#a78bfa', '#34d399', '#f472b6'];
  const followedRooms =
    followedRoomIds.length > 0
      ? rooms.filter((room) => followedRoomIds.includes(room.id))
      : rooms;
  const visibleThreads = useMemo(() => {
    if (!followedRoomIds.length) return threads;
    return threads.filter((thread) => followedRoomIds.includes(thread.roomId));
  }, [threads, followedRoomIds]);

  const filteredThreads = useMemo(() => {
    if (energyFilter === 'all') return visibleThreads;
    return visibleThreads.filter((thread) => thread.energy === energyFilter);
  }, [visibleThreads, energyFilter]);

  const getRoomAccent = (room, index) =>
    room.theme?.primary ?? accentPalette[index % accentPalette.length];

  return (
    <div className="space-y-5">
      <SessionHeaderCard />
      <header className="glass-panel p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
              Home
            </p>
            <h1 className="text-2xl font-semibold mt-1 text-white">
              Il feed delle tue stanze
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Ogni card è un albero di conversazione. Niente scroll infinito:
              solo thread scelti dalle stanze che segui o scopri da subito.
            </p>
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
              aria-pressed={energyFilter === filter.value}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </header>

      <section className="grid gap-5 items-start lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          {filteredThreads.length === 0 ? (
            <div
              className="glass-panel p-5 text-sm text-slate-400"
              role="status"
              aria-live="polite"
            >
              Nessun thread nelle stanze che segui con questa energia ora. Cambia
              filtro o avvia tu il prossimo.
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
                {followedRooms.length} curate
              </span>
            </div>
            <ul className="space-y-2">
              {followedRooms.map((room, index) => {
                const accent = getRoomAccent(room, index);
                return (
                  <li
                    key={room.id}
                    className="rounded-2xl border px-3 py-2 text-sm"
                    style={{
                      borderColor: `${accent}35`,
                      backgroundImage: `linear-gradient(90deg, ${accent}12, rgba(15,23,42,0.8))`,
                    }}
                  >
                    <p className="font-semibold text-white">{room.name}</p>
                    <p className="text-[12px] text-slate-400 line-clamp-2">
                      {room.description}
                    </p>
                  </li>
                );
              })}
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
