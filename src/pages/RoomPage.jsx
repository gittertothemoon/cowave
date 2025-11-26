import { useEffect, useMemo, useState, useId } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';
import { useAppState } from '../state/AppStateContext.jsx';
import ThreadCard from '../components/threads/ThreadCard.jsx';
import Modal from '../components/ui/Modal.jsx';
import {
  buttonPrimaryClass,
  buttonGhostClass,
  buttonSecondaryClass,
  cardBaseClass,
  eyebrowClass,
  pageTitleClass,
  inputBaseClass,
  labelClass,
  bodyTextClass,
} from '../components/ui/primitives.js';

export default function RoomPage() {
  const { roomId: roomParam } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    rooms,
    roomsStatus,
    threadsByRoom,
    threadListsMeta,
    followedRoomIds,
    loadRooms,
    loadFollowedRooms,
    loadThreadsForRoom,
    createThread,
    followRoom,
    unfollowRoom,
  } = useAppState();

  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [titleError, setTitleError] = useState('');
  const [bodyError, setBodyError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingFollowId, setPendingFollowId] = useState(null);
  const titleId = useId();
  const bodyId = useId();

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    if (user?.id) {
      loadFollowedRooms(user.id);
    }
  }, [user?.id, loadFollowedRooms]);

  const room = useMemo(
    () =>
      rooms.find(
        (entry) => entry.id === roomParam || entry.slug === roomParam
      ),
    [rooms, roomParam]
  );

  const threadMeta = threadListsMeta[room?.id ?? roomParam] ?? {};
  const roomThreads = room ? threadsByRoom[room.id] ?? [] : [];
  const isThreadsLoading =
    threadMeta.loading && (threadMeta.ids?.length ?? 0) === 0;
  const threadsError = threadMeta.error;
  const hasMoreThreads = threadMeta.hasMore;
  const shouldOpenThread = location.state?.highlightCreateThread;
  const isFollowed = room ? followedRoomIds.includes(room.id) : false;

  useEffect(() => {
    if (room?.id && !threadMeta.ids) {
      loadThreadsForRoom(room.id);
    }
  }, [room?.id, threadMeta.ids, loadThreadsForRoom]);

  useEffect(() => {
    if (shouldOpenThread) {
      setIsNewThreadOpen(true);
    }
  }, [shouldOpenThread]);

  const theme = room?.theme ?? {
    primary: '#38bdf8',
    secondary: '#a78bfa',
    glow: 'rgba(59,130,246,0.35)',
  };
  const accentGradient = `linear-gradient(120deg, ${theme.primary}, ${theme.secondary})`;

  async function handleCreateThread(e) {
    e.preventDefault();
    setActionError('');
    const trimmedTitle = title.trim();
    const trimmedBody = body.trim();
    if (!trimmedTitle) {
      setTitleError('Inserisci un titolo per il thread.');
      return;
    }
    if (!trimmedBody) {
      setBodyError('Scrivi il post iniziale del thread.');
      return;
    }
    if (!room?.id) return;
    setIsSubmitting(true);
    const { thread, error } = await createThread({
      roomId: room.id,
      title: trimmedTitle,
      body: trimmedBody,
      createdBy: user?.id,
      authorName: user?.email,
    });
    setIsSubmitting(false);
    if (error || !thread) {
      setActionError('Non riesco a creare il thread adesso. Riprova tra poco.');
      return;
    }
    setTitle('');
    setBody('');
    setTitleError('');
    setBodyError('');
    setIsNewThreadOpen(false);
    navigate(`/app/threads/${thread.id}`);
  }

  async function handleToggleFollow() {
    if (!room?.id) return;
    if (!user?.id) {
      setActionError('Accedi per seguire questa stanza.');
      return;
    }
    setPendingFollowId(room.id);
    const { error } = isFollowed
      ? await unfollowRoom(room.id, user.id)
      : await followRoom(room.id, user.id);
    if (error) {
      setActionError('Non riesco ad aggiornare il follow. Riprova tra poco.');
    }
    setPendingFollowId(null);
  }

  function openComposer() {
    setTitleError('');
    setBodyError('');
    setIsNewThreadOpen(true);
  }

  if (roomsStatus.loading && !room) {
    return (
      <div className="space-y-4">
        <div className={`${cardBaseClass} animate-pulse p-4 space-y-3`}>
          <div className="h-3 w-24 rounded-full bg-slate-800/60" />
          <div className="h-6 w-2/3 rounded-full bg-slate-800/50" />
          <div className="h-4 w-1/2 rounded-full bg-slate-800/40" />
        </div>
        <div className={`${cardBaseClass} animate-pulse p-4 space-y-3`}>
          <div className="h-4 w-1/3 rounded-full bg-slate-800/50" />
          <div className="h-10 w-full rounded-2xl bg-slate-800/40" />
          <div className="h-3 w-20 rounded-full bg-slate-800/50" />
        </div>
      </div>
    );
  }

  if (roomsStatus.error && !room) {
    return (
      <div className={`${cardBaseClass} p-4 space-y-2 text-sm text-red-200`}>
        <p className="font-semibold">Non riesco a caricare questa stanza.</p>
        <p className="text-xs text-red-300">
          Controlla la connessione e riprova.
        </p>
        <button
          type="button"
          onClick={loadRooms}
          className={`${buttonPrimaryClass} text-sm`}
        >
          Riprova
        </button>
      </div>
    );
  }

  if (!room && !roomsStatus.loading) {
    return (
      <div className={`${cardBaseClass} p-4`}>
        <p className="text-sm text-red-200" role="status" aria-live="assertive">
          Stanza non trovata.
        </p>
        <button
          type="button"
          onClick={() => navigate('/app/rooms')}
          className={`${buttonPrimaryClass} mt-3 text-sm`}
        >
          Torna alle stanze
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <header
        className={`${cardBaseClass} p-4 sm:p-5 space-y-3 relative overflow-hidden`}
        style={{
          background: `linear-gradient(120deg, ${theme.primary}26, ${theme.secondary}26), #0b1020`,
          borderColor: `${theme.primary}30`,
        }}
      >
        <div className="relative space-y-3">
          <button
            type="button"
            onClick={() => navigate('/app/rooms')}
            className={`${buttonGhostClass} text-[11px] text-left`}
          >
            ← Torna alle stanze
          </button>
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="space-y-1 max-w-3xl">
              <p className={eyebrowClass}>Stanza</p>
              <h1 className={`${pageTitleClass} text-2xl`}>{room?.name}</h1>
              <p className={`${bodyTextClass} mt-1`}>
                {room?.description || 'Spazio di conversazione dedicato.'}
              </p>
              <p className="text-[12px] text-slate-500">
                Thread e risposte più recenti sono in alto. Segui la stanza per tenere tutto nel tuo feed.
              </p>
              {actionError ? (
                <p className="text-[12px] text-red-300">{actionError}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-2 w-full md:w-auto">
              <button
                type="button"
                onClick={openComposer}
                className={`${buttonPrimaryClass} w-full md:w-auto inline-flex items-center justify-center gap-2`}
                style={{ backgroundImage: accentGradient }}
              >
                Crea thread
              </button>
              <button
                type="button"
                onClick={handleToggleFollow}
                className={`${buttonSecondaryClass} w-full md:w-auto text-sm`}
                disabled={pendingFollowId === room?.id}
              >
                {isFollowed ? 'Smetti di seguire' : 'Segui questa stanza'}
              </button>
            </div>
          </div>
        </div>
      </header>

      <section className={`${cardBaseClass} p-4 sm:p-5 space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={eyebrowClass}>Thread della stanza</p>
          <span className="text-[11px] text-slate-500">
            {roomThreads.length} thread
          </span>
        </div>
        <p className="text-[12px] text-slate-500">
          Apri un thread per proporre un tema nuovo o entra in uno esistente per rispondere.
        </p>

        {threadsError ? (
          <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-3 text-sm text-red-200">
            <p className="font-semibold">Impossibile caricare i thread.</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => loadThreadsForRoom(room.id)}
                className={`${buttonPrimaryClass} text-xs`}
              >
                Riprova
              </button>
              <span className="text-[11px] text-red-300">
                Se continua, segnala il problema al team.
              </span>
            </div>
          </div>
        ) : null}

        {isThreadsLoading ? (
          <div className="space-y-3" aria-live="polite" role="status">
            {Array.from({ length: 2 }).map((_, idx) => (
              <div
                key={idx}
                className={`${cardBaseClass} animate-pulse p-4 space-y-2`}
              >
                <div className="h-4 w-1/3 rounded-full bg-slate-800/60" />
                <div className="h-5 w-3/4 rounded-full bg-slate-800/50" />
                <div className="h-4 w-full rounded-full bg-slate-800/40" />
              </div>
            ))}
          </div>
        ) : null}

        {!isThreadsLoading && roomThreads.length === 0 && !threadsError ? (
          <div className={`${cardBaseClass} p-4 text-sm text-slate-300`}>
            <p className="font-medium text-slate-100">
              Ancora nessun thread. Vuoi aprire la conversazione?
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Proponi un tema chiaro per rompere il ghiaccio.
            </p>
            <button
              type="button"
              onClick={openComposer}
              className={`${buttonPrimaryClass} mt-3 text-sm`}
            >
              Crea un nuovo thread
            </button>
          </div>
        ) : null}

        {roomThreads.length > 0 ? (
          <div className="space-y-4">
            {roomThreads.map((t) => (
              <ThreadCard key={t.id} thread={t} />
            ))}
            {hasMoreThreads ? (
              <button
                type="button"
                onClick={() =>
                  loadThreadsForRoom(room.id, { cursor: threadMeta.cursor })
                }
                className={`${buttonSecondaryClass} w-full text-sm`}
              >
                Carica altri thread
              </button>
            ) : null}
          </div>
        ) : null}
      </section>

      <Modal
        open={isNewThreadOpen}
        onClose={() => setIsNewThreadOpen(false)}
        title={`Nuovo thread in ${room?.name ?? 'stanza'}`}
      >
        <form onSubmit={handleCreateThread} className="space-y-4 text-slate-100">
          <div className="space-y-1">
            <label className={labelClass} htmlFor={titleId}>
              Titolo
            </label>
            <input
              type="text"
              className={`${inputBaseClass} ${
                titleError ? 'border-red-500 focus:border-red-500/70 focus:ring-red-500/70' : ''
              }`}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError('');
              }}
              placeholder="Es. Flusso senza feed, rituali serali…"
              required
              id={titleId}
            />
            {titleError && (
              <p className="text-xs text-red-400 mt-1">{titleError}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className={labelClass} htmlFor={bodyId}>
              Post iniziale
            </label>
            <textarea
              rows={4}
              className={`${inputBaseClass} resize-none`}
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                if (bodyError) setBodyError('');
              }}
              placeholder="Scrivi il post iniziale con cui vuoi aprire questa conversazione..."
              id={bodyId}
              required
            />
            {bodyError ? (
              <p className="text-xs text-red-400 mt-1">
                {bodyError}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">
                Questo è il post iniziale del thread: rendilo chiaro per chi entra.
              </p>
            )}
          </div>
          {actionError ? (
            <p className="text-xs text-red-300">{actionError}</p>
          ) : null}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsNewThreadOpen(false)}
              className={`${buttonGhostClass} w-full sm:w-auto text-sm`}
            >
              Annulla
            </button>
            <button
              type="submit"
              className={`${buttonPrimaryClass} w-full sm:w-auto text-sm text-center`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creo...' : 'Crea thread'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
