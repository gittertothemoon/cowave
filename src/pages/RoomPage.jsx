import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useId, useRef, useState } from 'react';
import ThreadCard from '../components/threads/ThreadCard.jsx';
import { useAppState } from '../state/AppStateContext.jsx';
import Modal from '../components/ui/Modal.jsx';
import {
  buttonPrimaryClass,
  buttonGhostClass,
  cardBaseClass,
  eyebrowClass,
  pageTitleClass,
  bodyTextClass,
  inputBaseClass,
  labelClass,
} from '../components/ui/primitives.js';

export default function RoomPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { rooms, threads, createThread } = useAppState();

  const room = rooms.find((r) => r.id === roomId);
  const roomThreads = threads.filter((t) => t.roomId === roomId);

  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [energy, setEnergy] = useState('costruttivo');
  const [threadError, setThreadError] = useState('');
  const [initialContentError, setInitialContentError] = useState('');
  const [roomError] = useState(null);
  const [isRoomLoading] = useState(false);
  const titleInputRef = useRef(null);
  const titleId = useId();
  const initialContentId = useId();
  const energyId = useId();
  const shouldOpenThread = location.state?.highlightCreateThread;

  const theme = room?.theme ?? {
    primary: '#a78bfa',
    secondary: '#38bdf8',
    glow: 'rgba(59,130,246,0.35)',
    text: '#e0f2fe',
  };
  const accentGradient = `linear-gradient(120deg, ${theme.primary}, ${theme.secondary})`;
  const tagsPreview =
    room?.tags?.length > 0
      ? room.tags.slice(0, 2).map((tag) => `#${tag}`).join(' · ')
      : 'Senza tag';

  function handleBack() {
    const canGoBack =
      typeof window !== 'undefined' && window.history.length > 2;
    if (canGoBack) {
      navigate(-1);
    } else {
      navigate('/app');
    }
  }

  function handleCreateThread(e) {
    e.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = initialContent.trim();
    if (!trimmedTitle) {
      setThreadError('Inserisci un titolo per il thread.');
      setInitialContentError('');
      return;
    }
    if (!trimmedContent) {
      setInitialContentError('Inserisci il testo del thread.');
      setThreadError('');
      return;
    }
    const id = createThread({
      roomId: room.id,
      title: trimmedTitle,
      initialContent: trimmedContent,
      rootSnippet: trimmedContent,
      energy,
    });
    if (!id) return;
    setThreadError('');
    setInitialContentError('');
    setTitle('');
    setInitialContent('');
    setEnergy('costruttivo');
    closeNewThread();
    navigate(`/app/threads/${id}`);
  }

  function closeNewThread() {
    setThreadError('');
    setInitialContentError('');
    setIsNewThreadOpen(false);
  }

  useEffect(() => {
    if (isNewThreadOpen) {
      window.setTimeout(() => {
        titleInputRef.current?.focus();
      }, 0);
    }
  }, [isNewThreadOpen]);

  useEffect(() => {
    if (shouldOpenThread) {
      setIsNewThreadOpen(true);
    }
  }, [shouldOpenThread]);

  if (roomError) {
    return (
      <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-950/20 p-4 text-sm text-red-100">
        <p className="font-medium">
          Si è verificato un problema nel caricamento dei contenuti.
        </p>
        <p className="mt-1 text-xs text-red-200">
          Riprova a ricaricare la pagina. Se il problema persiste, segnalalo nella stanza “Feedback CoWave”.
        </p>
      </div>
    );
  }

  if (!room) {
    return (
      <div className={`${cardBaseClass} p-4`}>
        <p className="text-sm text-red-200" role="status" aria-live="assertive">
          Stanza non trovata.
        </p>
        <button
          type="button"
          onClick={() => navigate('/app')}
          className={`${buttonPrimaryClass} mt-3 text-sm`}
        >
          Torna al feed
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
            onClick={handleBack}
            className={`${buttonGhostClass} text-[11px] text-left`}
          >
            ← Torna al feed
          </button>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className={eyebrowClass}>Stanza</p>
              <h1 className={`${pageTitleClass} text-2xl`}>{room.name}</h1>
              <p className={`${bodyTextClass} mt-1 line-clamp-2`}>
                {room.description}
              </p>
              <p className="text-[12px] text-slate-400 mt-2 max-w-2xl">
                In questa stanza raccogliamo thread su {room.name}. Apri un thread quando vuoi iniziare una nuova conversazione: le risposte vivono dentro il thread.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] text-slate-400 mt-3">
                <span className="px-2 py-1 rounded-2xl bg-slate-950/40 border border-white/10">
                  {room.members} membri
                </span>
                {room.isPrivate && (
                  <span className="px-2 py-1 rounded-2xl bg-slate-950/40 border border-white/10">
                    Privata
                  </span>
                )}
                <span className="px-2 py-1 rounded-2xl bg-slate-950/40 border border-white/10">
                  {tagsPreview}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsNewThreadOpen(true)}
              className={`${buttonPrimaryClass} w-full md:w-auto inline-flex items-center justify-center gap-2`}
              style={{ backgroundImage: accentGradient }}
            >
              Crea un nuovo thread in questa stanza
            </button>
          </div>
        </div>
      </header>

      <section className={`${cardBaseClass} p-4 sm:p-5 space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className={eyebrowClass}>Thread della stanza</p>
          <span className="text-[11px] text-slate-500">
            {roomThreads.length} attivi
          </span>
        </div>
        <p className="text-[12px] text-slate-500">
          Ogni thread è una conversazione autonoma: entra per leggere e rispondere. Se vuoi aprire un tema nuovo, crea qui un thread.
        </p>

        {isRoomLoading ? (
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
        ) : roomThreads.length === 0 ? (
          <div className={`${cardBaseClass} p-4 text-sm text-slate-300`}>
            <p className="font-medium text-slate-100">
              Nessun thread in questa stanza
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Crea il primo thread per iniziare la conversazione.
            </p>
            <button
              type="button"
              onClick={() => setIsNewThreadOpen(true)}
              className={`${buttonPrimaryClass} mt-3 text-sm`}
            >
              Crea un nuovo thread in questa stanza
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {roomThreads.map((t) => (
              <ThreadCard key={t.id} thread={t} />
            ))}
          </div>
        )}
      </section>

      <Modal
        open={isNewThreadOpen}
        onClose={closeNewThread}
        title={`Nuovo thread in ${room.name}`}
      >
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 mb-3">
          Crea uno spunto breve e chiaro: chi entra capirà subito il tono del thread.
        </div>
        <form onSubmit={handleCreateThread} className="space-y-4 text-slate-100">
          <div className="space-y-1">
            <label className={labelClass} htmlFor={titleId}>
              Titolo
            </label>
            <input
              type="text"
              ref={titleInputRef}
              className={`${inputBaseClass} ${
                threadError ? 'border-red-500 focus:border-red-500/70 focus:ring-red-500/70' : ''
              }`}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (threadError) setThreadError('');
              }}
              placeholder="Es. Flusso senza feed, rituali serali…"
              required
              id={titleId}
            />
            {threadError && (
              <p className="text-xs text-red-400 mt-1">{threadError}</p>
            )}
          </div>
          <div className="space-y-1">
            <label className={labelClass} htmlFor={initialContentId}>
              Testo del thread
            </label>
            <textarea
              rows={4}
              className={`${inputBaseClass} resize-none`}
              value={initialContent}
              onChange={(e) => {
                setInitialContent(e.target.value);
                if (initialContentError) setInitialContentError('');
              }}
              placeholder="Scrivi il messaggio con cui vuoi aprire questa conversazione…"
              id={initialContentId}
              required
            />
            {initialContentError ? (
              <p className="text-xs text-red-400 mt-1">
                {initialContentError}
              </p>
            ) : (
              <p className="text-[11px] text-slate-400">
                Questo sarà il primo messaggio del thread: rendilo chiaro per chi entra.
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className={labelClass} htmlFor={energyId}>
              Energia del thread
            </label>
            <select
              className={inputBaseClass}
              value={energy}
              onChange={(e) => setEnergy(e.target.value)}
              id={energyId}
            >
              <option value="costruttivo">Costruttivo</option>
              <option value="riflessivo">Riflessivo</option>
              <option value="tecnico">Tecnico</option>
              <option value="giocoso">Giocoso</option>
            </select>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={closeNewThread}
              className={`${buttonGhostClass} w-full sm:w-auto text-sm`}
            >
              Annulla
            </button>
            <button
              type="submit"
              className={`${buttonPrimaryClass} w-full sm:w-auto text-sm text-center`}
            >
              Crea thread
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
