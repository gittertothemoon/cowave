import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
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
  const { rooms, threads, createThread } = useAppState();

  const room = rooms.find((r) => r.id === roomId);
  const roomThreads = threads.filter((t) => t.roomId === roomId);

  const [isNewThreadOpen, setIsNewThreadOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [snippet, setSnippet] = useState('');
  const [energy, setEnergy] = useState('costruttivo');
  const titleInputRef = useRef(null);

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

  if (!room) {
    return (
      <div>
        <p className="text-sm text-red-400" role="status" aria-live="assertive">
          Stanza non trovata.
        </p>
      </div>
    );
  }

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
    if (!title.trim()) return;
    const id = createThread({
      roomId: room.id,
      title: title.trim(),
      rootSnippet: snippet.trim(),
      energy,
    });
    setTitle('');
    setSnippet('');
    setEnergy('costruttivo');
    setIsNewThreadOpen(false);
    navigate(`/app/threads/${id}`);
  }

  useEffect(() => {
    if (isNewThreadOpen) {
      window.setTimeout(() => {
        titleInputRef.current?.focus();
      }, 0);
    }
  }, [isNewThreadOpen]);

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
            className={`${buttonGhostClass} text-[11px] px-0 py-0 text-left`}
        >
          ← Torna al feed
        </button>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className={eyebrowClass}>
              Stanza
              </p>
              <h1 className={`${pageTitleClass} text-2xl`}>{room.name}</h1>
              <p className={`${bodyTextClass} mt-1 line-clamp-2`}>
                {room.description}
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
              className={`${buttonPrimaryClass} w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2`}
              style={{ backgroundImage: accentGradient }}
            >
              Crea thread
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

        {roomThreads.length === 0 ? (
          <p className={bodyTextClass}>
            Nessun thread ancora. Scrivi tu il primo spunto e fai partire la stanza.
          </p>
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
        onClose={() => setIsNewThreadOpen(false)}
        title="Nuovo thread nella stanza"
      >
        <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 mb-3">
          Crea uno spunto breve e chiaro: chi entra capirà subito il tono del thread.
        </div>
        <form onSubmit={handleCreateThread} className="space-y-4 text-slate-100">
          <div className="space-y-1">
            <label className={labelClass}>Titolo</label>
            <input
              type="text"
              ref={titleInputRef}
              className={inputBaseClass}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Flusso senza feed, rituali serali…"
              required
            />
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Spunto iniziale</label>
            <textarea
              rows={4}
              className={`${inputBaseClass} resize-none`}
              value={snippet}
              onChange={(e) => setSnippet(e.target.value)}
              placeholder="Descrivi il punto di partenza o la tensione che vuoi esplorare…"
            />
            <p className="text-[11px] text-slate-400">
              2-3 frasi: cosa vuoi esplorare e perché interessa questa stanza.
            </p>
          </div>
          <div className="space-y-1">
            <label className={labelClass}>Energia del thread</label>
            <select
              className={inputBaseClass}
              value={energy}
              onChange={(e) => setEnergy(e.target.value)}
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
              onClick={() => setIsNewThreadOpen(false)}
              className={`${buttonGhostClass} w-full sm:w-auto text-sm px-2 py-2`}
            >
              Annulla
            </button>
            <button
              type="submit"
              className={`${buttonPrimaryClass} w-full sm:w-auto text-sm px-4 py-2 rounded-2xl text-center`}
            >
              Crea thread
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
