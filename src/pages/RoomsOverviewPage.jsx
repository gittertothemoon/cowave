import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import CreateRoomModal from '../components/rooms/CreateRoomModal.jsx';
import { useAppState } from '../state/AppStateContext.jsx';
import { useAuth } from '../state/AuthContext.jsx';
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  cardBaseClass,
} from '../components/ui/primitives.js';

const STATUS_STYLES = {
  pending: 'bg-amber-500/20 text-amber-100 border-amber-400/40',
  approved: 'bg-emerald-500/15 text-emerald-100 border-emerald-400/40',
  rejected: 'bg-slate-500/20 text-slate-200 border-slate-400/40',
};

function StatusBadge({ status }) {
  const label =
    status === 'approved'
      ? 'Approvata'
      : status === 'rejected'
      ? 'Rifiutata'
      : 'In revisione';
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.pending;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-medium ${style}`}
    >
      {label}
    </span>
  );
}

export default function RoomsOverviewPage() {
  const {
    rooms,
    myRooms,
    roomsStatus,
    myRoomsStatus,
    followedRoomIds = [],
    loadRooms,
    loadMyRooms,
    loadFollowedRooms,
    followRoom,
    unfollowRoom,
  } = useAppState();
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [pendingRoomId, setPendingRoomId] = useState(null);
  const [actionError, setActionError] = useState('');
  const [creationMessage, setCreationMessage] = useState('');
  const [activeTab, setActiveTab] = useState('public');
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    if (user?.id) {
      loadFollowedRooms(user.id);
      loadMyRooms(user.id);
    } else {
      loadMyRooms(null);
    }
  }, [user?.id, loadFollowedRooms, loadMyRooms]);

  useEffect(() => {
    const navMessage = location.state?.roomProposedMessage;
    if (navMessage) {
      setCreationMessage(navMessage);
      setActiveTab('mine');
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  useEffect(() => {
    if (!user?.id && activeTab === 'mine') {
      setActiveTab('public');
    }
  }, [user?.id, activeTab]);

  const followedSet = useMemo(
    () => new Set(followedRoomIds),
    [followedRoomIds]
  );
  const isAuthenticated = Boolean(user?.id);
  const isLoadingPublic = roomsStatus.loading;
  const isLoadingMine = myRoomsStatus.loading;
  const roomError = roomsStatus.error;
  const myRoomError = myRoomsStatus.error;

  const hasPublicRooms = rooms.length > 0;
  const hasMyRooms = myRooms.length > 0;

  async function handleToggleFollow(room) {
    if (!room?.id) return;
    setActionError('');
    if (!isAuthenticated) {
      setActionError('Accedi per seguire le stanze.');
      return;
    }
    setPendingRoomId(room.id);
    const isFollowed = followedSet.has(room.id);
    const { error } = isFollowed
      ? await unfollowRoom(room.id, user.id)
      : await followRoom(room.id, user.id);
    if (error) {
      setActionError(
        'Non riesco ad aggiornare il follow ora. Riprova tra poco.'
      );
    }
    setPendingRoomId(null);
  }

  function handleOpenCreate() {
    setActionError('');
    if (!isAuthenticated) {
      setCreationMessage('');
      setActionError('Accedi per proporre una stanza.');
      return;
    }
    setIsCreateRoomOpen(true);
  }

  async function handleRoomCreated() {
    setCreationMessage('Grazie! La tua stanza è stata inviata in revisione.');
    setActionError('');
    setActiveTab('mine');
    setIsCreateRoomOpen(false);
    if (user?.id) {
      await loadMyRooms(user.id);
    }
    await loadRooms();
  }

  function renderRoomCard(room) {
    const isFollowed = followedSet.has(room.id);
    const canFollow = room.status === 'approved' && room.isPublic;

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
                Stanza approvata
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
          {isAuthenticated && canFollow ? (
            <button
              type="button"
              onClick={() => handleToggleFollow(room)}
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

  function renderMyRoomCard(room) {
    return (
      <article
        key={room.id}
        className={`${cardBaseClass} p-4 sm:p-5 space-y-2 border border-white/10 bg-slate-950/70`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              La tua proposta
            </p>
            <h2 className="text-lg font-semibold text-white">
              {room.name}
            </h2>
            {room.description && (
              <p className="text-sm text-slate-300">{room.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
              <StatusBadge status={room.status} />
              <span>Creata il {formatDate(room.createdAt)}</span>
            </div>
            {room.status === 'rejected' ? (
              <p className="text-xs text-slate-300">
                Puoi proporne un’altra rispettando le linee guida.
              </p>
            ) : room.status === 'pending' ? (
              <p className="text-xs text-slate-300">
                In revisione: riceverai l’esito appena sarà valutata.
              </p>
            ) : null}
          </div>
          <Link
            to={`/app/rooms/${room.id}`}
            className={`${buttonSecondaryClass} text-xs`}
          >
            Apri
          </Link>
        </div>
      </article>
    );
  }

  function renderPublicSection() {
    return (
      <section className="space-y-4">
        {!isAuthenticated ? (
          <div className={`${cardBaseClass} p-3 text-sm text-slate-200`}>
            <p className="font-medium">Accedi per seguire le stanze.</p>
            <p className="text-xs text-slate-400">
              Senza login puoi leggere le stanze pubbliche, ma il feed segue solo quelle che attivi.
            </p>
          </div>
        ) : null}

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

        {isLoadingPublic ? (
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

        {!isLoadingPublic && !hasPublicRooms && !roomError ? (
          <div className={`${cardBaseClass} p-4 text-sm text-slate-300`}>
            <p className="font-semibold text-slate-100">
              Nessuna stanza disponibile per ora.
            </p>
            <p className="text-xs text-slate-400">
              Torna più tardi o proponi tu una stanza con un tema chiaro.
            </p>
          </div>
        ) : null}

        {hasPublicRooms ? (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room) => renderRoomCard(room))}
          </div>
        ) : null}
      </section>
    );
  }

  function renderMySection() {
    if (!isAuthenticated) {
      return (
        <div className={`${cardBaseClass} p-4 text-sm text-slate-200`}>
          Accedi per vedere e gestire le tue proposte di stanza.
        </div>
      );
    }

    return (
      <section className="space-y-3">
        <p className="text-sm text-slate-300">
          Puoi avere massimo 3 stanze attive (pending o approvate) e proporne 1 al giorno. Lo stato qui sotto è aggiornato in tempo reale.
        </p>

        {myRoomError ? (
          <div className={`${cardBaseClass} p-4 text-sm text-red-200 space-y-2`}>
            <p className="font-semibold">
              Non riesco a caricare le tue stanze.
            </p>
            <p className="text-xs text-red-300">
              Riprova tra poco. Se continua, scrivici.
            </p>
            <button
              type="button"
              onClick={() => loadMyRooms(user.id)}
              className={`${buttonPrimaryClass} text-sm`}
            >
              Riprova
            </button>
          </div>
        ) : null}

        {isLoadingMine ? (
          <div className="grid gap-3 md:grid-cols-2" aria-live="polite">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className={`${cardBaseClass} p-4 space-y-3 animate-pulse`}
              >
                <div className="h-3 w-24 rounded-full bg-slate-800/50" />
                <div className="h-5 w-3/4 rounded-full bg-slate-800/40" />
                <div className="h-4 w-1/2 rounded-full bg-slate-800/30" />
              </div>
            ))}
          </div>
        ) : null}

        {!isLoadingMine && !hasMyRooms && !myRoomError ? (
          <div className={`${cardBaseClass} p-4 text-sm text-slate-300`}>
            <p className="font-semibold text-slate-100">
              Non hai ancora proposto stanze.
            </p>
            <p className="text-xs text-slate-400">
              Scegli un nome chiaro, descrivi lo scopo e invia la tua idea: la revisioniamo in breve.
            </p>
            <button
              type="button"
              onClick={handleOpenCreate}
              className={`${buttonPrimaryClass} mt-3 text-sm`}
            >
              Proponi la tua stanza
            </button>
          </div>
        ) : null}

        {hasMyRooms ? (
          <div className="grid gap-3 md:grid-cols-2">
            {myRooms.map((room) => renderMyRoomCard(room))}
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <section className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold text-slate-50">
            Stanze della community
          </h1>
          <p className="text-sm text-slate-400">
            Le stanze pubbliche sono approvate e aperte. Le tue proposte restano in revisione finché il team non le sblocca.
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenCreate}
          className={`${buttonPrimaryClass} w-full sm:w-auto text-sm`}
        >
          Proponi stanza
        </button>
      </section>

      <div className="flex flex-wrap gap-2 items-center">
        <button
          type="button"
          className={`rounded-full px-3 py-2 text-sm border transition ${
            activeTab === 'public'
              ? 'border-sky-400/70 bg-sky-500/10 text-sky-100'
              : 'border-white/10 bg-slate-900/60 text-slate-200'
          }`}
          onClick={() => setActiveTab('public')}
          aria-pressed={activeTab === 'public'}
        >
          Stanze pubbliche
        </button>
        {isAuthenticated ? (
          <button
            type="button"
            className={`rounded-full px-3 py-2 text-sm border transition ${
              activeTab === 'mine'
                ? 'border-sky-400/70 bg-sky-500/10 text-sky-100'
                : 'border-white/10 bg-slate-900/60 text-slate-200'
            }`}
            onClick={() => setActiveTab('mine')}
            aria-pressed={activeTab === 'mine'}
          >
            Le tue stanze
          </button>
        ) : null}
      </div>

      {creationMessage ? (
        <div className="rounded-xl border border-emerald-400/50 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          {creationMessage}
        </div>
      ) : null}

      {actionError ? (
        <div className="rounded-xl border border-red-400/50 bg-red-500/10 p-3 text-sm text-red-100">
          {actionError}
        </div>
      ) : null}

      {activeTab === 'public' ? renderPublicSection() : renderMySection()}

      <CreateRoomModal
        open={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
        onCreated={(roomId) => {
          handleRoomCreated(roomId);
        }}
      />
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
