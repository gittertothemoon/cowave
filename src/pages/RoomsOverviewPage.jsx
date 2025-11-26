import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState } from '../state/AppStateContext.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  cardBaseClass,
} from '../components/ui/primitives.js';

export default function RoomsOverviewPage() {
  const {
    rooms,
    roomsStatus,
    followedRoomIds = [],
    loadRooms,
    loadFollowedRooms,
    followRoom,
    unfollowRoom,
  } = useAppState();
  const { user } = useAuth();
  const [pendingRoomId, setPendingRoomId] = useState(null);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    if (user?.id) {
      loadFollowedRooms(user.id);
    }
  }, [user?.id, loadFollowedRooms]);

  const followedSet = useMemo(
    () => new Set(followedRoomIds),
    [followedRoomIds]
  );
  const hasFollowedRooms = followedSet.size > 0;

  const followedRooms = useMemo(() => {
    if (!hasFollowedRooms) return [];
    return rooms.filter((room) => followedSet.has(room.id));
  }, [rooms, hasFollowedRooms, followedSet]);

  const suggestedRooms = useMemo(
    () => rooms.filter((room) => !followedSet.has(room.id)),
    [rooms, followedSet]
  );

  const isLoading = roomsStatus.loading;
  const roomError = roomsStatus.error;

  async function handleToggleFollow(roomId, isFollowing) {
    setActionError('');
    if (!user?.id) {
      setActionError('Serve un account per seguire o lasciare una stanza.');
      return;
    }
    setPendingRoomId(roomId);
    const { error } = isFollowing
      ? await unfollowRoom(roomId, user.id)
      : await followRoom(roomId, user.id);
    if (error) {
      setActionError(
        'Non riesco ad aggiornare il follow ora. Riprova tra poco.'
      );
    }
    setPendingRoomId(null);
  }

  function renderRoomCard(room) {
    const isFollowed = followedSet.has(room.id);
    return (
      <article
        key={room.id}
        className={`${cardBaseClass} p-4 sm:p-5 space-y-2 border border-white/10 bg-slate-950/70`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link
              to={`/app/rooms/${room.id}`}
              className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Stanza
              </p>
              <h2 className="text-lg font-semibold text-white group-hover:text-sky-200 transition-colors">
                {room.name}
              </h2>
              {room.description && (
                <p className="text-sm text-slate-300 mt-1 line-clamp-2">
                  {room.description}
                </p>
              )}
            </Link>
          </div>
          {user ? (
            <button
              type="button"
              onClick={() => handleToggleFollow(room.id, isFollowed)}
              className={`${buttonSecondaryClass} text-[12px] px-3 py-2`}
              disabled={pendingRoomId === room.id}
            >
              {isFollowed ? 'Smetti di seguire' : 'Segui stanza'}
            </button>
          ) : null}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Creata il {formatDate(room.createdAt)}</span>
          <Link
            to={`/app/rooms/${room.id}`}
            className="text-sky-300 hover:text-sky-200 text-xs"
          >
            Entra →
          </Link>
        </div>
      </article>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-50">
          Stanze della community
        </h1>
        <p className="text-sm text-slate-400">
          Scegli cosa seguire: thread e risposte arrivano solo dalle stanze che attivi.
        </p>
        {actionError ? (
          <p className="text-xs text-red-300">{actionError}</p>
        ) : null}
      </section>

      {roomError ? (
        <div className={`${cardBaseClass} p-4 text-sm text-red-200 space-y-2`}>
          <p className="font-semibold">
            Non riesco a caricare le stanze.
          </p>
          <p className="text-xs text-red-300">
            Controlla la connessione e riprova. Se il problema persiste segnalalo al team.
          </p>
          <button
            type="button"
            onClick={loadRooms}
            className={`${buttonPrimaryClass} text-sm`}
          >
            Riprova
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className={`${cardBaseClass} p-4 sm:p-5 space-y-3 animate-pulse`}
            >
              <div className="h-4 w-1/2 rounded-full bg-slate-800/50" />
              <div className="h-4 w-3/4 rounded-full bg-slate-800/40" />
              <div className="h-3 w-1/3 rounded-full bg-slate-800/30" />
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && rooms.length === 0 && !roomError ? (
        <div className={`${cardBaseClass} p-4 text-sm text-slate-300`}>
          <p className="font-semibold text-slate-100">
            Nessuna stanza disponibile per ora.
          </p>
          <p className="text-xs text-slate-400">
            Torna più tardi o crea tu la prossima stanza con un tema chiaro.
          </p>
        </div>
      ) : null}

      {hasFollowedRooms ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-50">
              Le tue stanze
            </h2>
            <span className="text-[11px] text-slate-500">
              {followedRooms.length} attive
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {followedRooms.map((room) => renderRoomCard(room))}
          </div>
        </section>
      ) : null}

      {suggestedRooms.length > 0 ? (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-slate-50">
              Altre stanze da scoprire
            </h3>
            <span className="text-[11px] text-slate-500">
              Tocca per entrare e seguire
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {suggestedRooms.map((room) => renderRoomCard(room))}
          </div>
        </section>
      ) : null}
    </main>
  );
}

function formatDate(value) {
  if (!value) return '–';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '–';
  return date.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
