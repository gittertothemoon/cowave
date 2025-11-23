import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../state/AppStateContext.jsx';
import { cardBaseClass } from '../components/ui/primitives.js';
import { computeRoomStats } from '../utils/roomStats.js';

export default function RoomsOverviewPage() {
  const { rooms, threads, postsByThread, followedRoomIds = [] } = useAppState();
  const statsByRoom = useMemo(
    () => computeRoomStats(rooms, threads, postsByThread),
    [rooms, threads, postsByThread]
  );
  const hasFollowedRooms = followedRoomIds.length > 0;
  const followedSet = useMemo(
    () => new Set(followedRoomIds),
    [followedRoomIds]
  );
  const followedRooms = useMemo(() => {
    if (!hasFollowedRooms) return [];
    return rooms.filter((room) => followedSet.has(room.id));
  }, [rooms, hasFollowedRooms, followedSet]);
  const suggestedRooms = useMemo(
    () => rooms.filter((room) => !followedSet.has(room.id)),
    [rooms, followedSet]
  );

  const cardClass = `${cardBaseClass} p-4 space-y-2 hover:-translate-y-1 hover:bg-slate-900/80 hover:border-sky-500/40 transition transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-50">
          Le tue stanze
        </h1>
        <p className="text-sm text-slate-400">
          Queste stanze definiscono cosa vedi nel feed.
        </p>
        {!hasFollowedRooms ? (
          <p className="text-sm text-slate-400">
            Non segui ancora nessuna stanza. Inizia scegliendo almeno 3 stanze che ti rappresentano.
          </p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {followedRooms.map((room) => {
              const stats = statsByRoom[room.id] ?? {};
              return (
                <Link
                  key={room.id}
                  to={`/app/rooms/${room.id}`}
                  className={cardClass}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-base font-semibold text-slate-50">
                      {room.name}
                    </h2>
                    {room.tags?.[0] && (
                      <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        #{room.tags[0]}
                      </span>
                    )}
                  </div>
                  {room.description && (
                    <p className="text-sm text-slate-300 line-clamp-2">
                      {room.description}
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    {stats.threadCount ?? 0} thread · {stats.repliesCount ?? 0}{' '}
                    risposte
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {suggestedRooms.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-50">
            Scopri nuove stanze
          </h2>
          <p className="text-sm text-slate-400">
            Aggiungi altre stanze per arricchire il tuo feed.
          </p>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {suggestedRooms.map((room) => {
              const stats = statsByRoom[room.id] ?? {};
              return (
                <Link
                  key={room.id}
                  to={`/app/rooms/${room.id}`}
                  className={cardClass}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-semibold text-slate-50">
                      {room.name}
                    </h3>
                    {room.tags?.[0] && (
                      <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                        #{room.tags[0]}
                      </span>
                    )}
                  </div>
                  {room.description && (
                    <p className="text-sm text-slate-300 line-clamp-2">
                      {room.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{room.members} membri</span>
                    <span>
                      {stats.threadCount ?? 0} thread ·{' '}
                      {stats.repliesCount ?? 0} risposte
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
