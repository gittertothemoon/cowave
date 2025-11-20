import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import ThreadCard from '../components/threads/ThreadCard.jsx';
import { useAppState } from '../state/AppStateContext.jsx';
import Modal from '../components/ui/Modal.jsx';

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

  return (
    <div className="space-y-5">
      <header className="glass-panel p-4 sm:p-5 space-y-3 relative overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-15"
          style={{ background: accentGradient }}
        />
        <div className="relative space-y-3">
          <button
            type="button"
            onClick={handleBack}
            className="text-[11px] text-slate-400 hover:text-white text-left"
          >
            ← Torna al feed
          </button>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                Stanza
              </p>
              <h1 className="text-2xl font-semibold text-white">{room.name}</h1>
              <p className="text-sm text-slate-400 mt-1 line-clamp-2">
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
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 text-sm px-4 py-2 rounded-2xl text-slate-950 font-semibold shadow-glow"
              style={{
                backgroundImage: accentGradient,
              }}
            >
              + Nuovo thread
            </button>
          </div>
        </div>
      </header>

      <section className="glass-panel p-4 sm:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Thread della stanza
          </p>
          <span className="text-[11px] text-slate-500">
            {roomThreads.length} attivi
          </span>
        </div>

        {roomThreads.length === 0 ? (
          <p className="text-sm text-slate-400">
            Nessun thread ancora. Inizia tu e dai forma al primo ramo.
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
        <form onSubmit={handleCreateThread} className="space-y-2 text-xs">
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">Titolo</label>
            <input
              type="text"
              className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Workflow senza feed, rituali serali…"
              required
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">
              Spunto iniziale
            </label>
            <textarea
              rows={3}
              className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent resize-none"
              value={snippet}
              onChange={(e) => setSnippet(e.target.value)}
              placeholder="Descrivi il punto di partenza o la tensione che vuoi esplorare…"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] text-slate-300">
              Tipo di energia
            </label>
            <select
              className="w-full bg-slate-950/80 border border-white/15 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              value={energy}
              onChange={(e) => setEnergy(e.target.value)}
            >
              <option value="costruttivo">Costruttivo</option>
              <option value="riflessivo">Riflessivo</option>
              <option value="tecnico">Tecnico</option>
              <option value="giocoso">Giocoso</option>
            </select>
          </div>
          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="text-sm px-4 py-2 rounded-2xl bg-gradient-to-r from-accent to-accentBlue text-slate-950 font-semibold hover:opacity-90 shadow-glow"
            >
              Crea thread
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
