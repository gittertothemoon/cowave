import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import ThreadCard from '../components/threads/ThreadCard.jsx';
import { useAppState } from '../state/AppStateContext.jsx';
import CreateRoomModal from '../components/rooms/CreateRoomModal.jsx';

export default function HomePage() {
  const { threads, followedRoomIds } = useAppState();
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

  const visibleThreads = useMemo(() => {
    if (!followedRoomIds.length) return threads;
    return threads.filter((thread) => followedRoomIds.includes(thread.roomId));
  }, [threads, followedRoomIds]);

  return (
    <div className="space-y-5">
      <section className="mb-4 rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:p-5">
        <p className="text-xs font-medium text-slate-300 uppercase tracking-wide">
          Home
        </p>
        <h1 className="mt-1 text-lg font-semibold text-slate-50 sm:text-xl">
          Il feed delle tue stanze
        </h1>
        <p className="mt-1 text-xs text-slate-400 sm:text-sm">
          Vedi i thread dalle stanze che segui e continua le conversazioni che ti
          interessano.
        </p>
      </section>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsCreateRoomOpen(true)}
          className="w-full sm:w-auto sm:ml-auto inline-flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-2xl text-slate-950 font-semibold shadow-glow"
          style={{
            backgroundImage: 'linear-gradient(120deg, #a78bfa, #38bdf8)',
          }}
        >
          + Nuova stanza
        </button>
        <p className="text-[11px] text-slate-500">
          Vuoi controllare nel dettaglio la tua esperienza?{' '}
          <Link
            to="/app/settings/esperienza"
            className="text-sky-400 hover:text-sky-300 underline"
          >
            Vai agli strumenti avanzati
          </Link>
          .
        </p>
      </div>

      <div className="space-y-3">
        {visibleThreads.length === 0 ? (
          <div
            className="glass-panel p-5 text-sm text-slate-400"
            role="status"
            aria-live="polite"
          >
            Nessun thread nelle stanze che segui ora. Apri una stanza o crea un
            nuovo thread per dare il via alla conversazione.
          </div>
        ) : (
          visibleThreads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))
        )}
      </div>

      <CreateRoomModal
        open={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
      />
    </div>
  );
}
