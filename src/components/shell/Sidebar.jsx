import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAppState } from '../../state/AppStateContext.jsx';
import Modal from '../ui/Modal.jsx';
import AlgorithmControls from '../ui/AlgorithmControls.jsx';
import SessionHUD from '../ui/SessionHUD.jsx';

const MOBILE_DRAWER_ID = 'cowave-sidebar-drawer';

export default function Sidebar({ variant = 'desktop', open = false, onClose }) {
  const { rooms, followedRoomIds = [] } = useAppState();
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = variant === 'mobile';
  const accentPalette = ['#38bdf8', '#a78bfa', '#34d399', '#f472b6', '#fb7185'];
  const hasFollowedRooms = followedRoomIds.length > 0;
  const followedSet = new Set(followedRoomIds);
  const primaryRooms = hasFollowedRooms
    ? rooms.filter((room) => followedSet.has(room.id))
    : rooms;
  const exploreRooms = hasFollowedRooms
    ? rooms.filter((room) => !followedSet.has(room.id))
    : [];

  const getRoomAccent = (room, index) =>
    room.theme?.primary ?? accentPalette[index % accentPalette.length];

  const supportLinks = [
    { label: 'Spazio sicurezza', hint: 'linee guida' },
    { label: 'Feedback onda', hint: 'condividi' },
  ];

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile && onClose) {
      onClose();
    }
  };

  useEffect(() => {
    if (!isMobile || !open) return undefined;
    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isMobile, open, onClose]);

  const content = (
    <div
      className={`flex h-full flex-col ${
        isMobile ? 'bg-slate-950 text-slate-100' : 'bg-surface/95 md:bg-transparent'
      }`}
    >
      {isMobile && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <p className="text-sm font-semibold text-white">Naviga CoWave</p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 hover:text-white hover:bg-slate-900/60"
            aria-label="Chiudi menu"
          >
            ✕
          </button>
        </div>
      )}
      <nav
        className={`flex-1 overflow-y-auto px-4 py-5 space-y-7 ${
          isMobile ? 'text-sm' : ''
        }`}
      >
        <div className="space-y-4">
          <SessionHUD floating={false} />
          <AlgorithmControls />
        </div>

        <div className="rounded-2xl border border-white/10 px-3.5 py-3 bg-slate-950/40 space-y-2">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
            Rituale di oggi
          </p>
          <p className="text-sm text-slate-100">
            Blocchi da 28 minuti, pausa respiro guidata e recap serale.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-signal-pulse" />
            <span>4/6 blocchi completati</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between px-1 mb-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Le tue stanze
            </p>
            <button
              type="button"
              onClick={() => setIsCreateRoomOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-950 px-2.5 py-1 rounded-2xl focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
              style={{
                backgroundImage: 'linear-gradient(120deg, #a78bfa, #38bdf8)',
                boxShadow: '0 10px 25px rgba(15,23,42,0.35)',
              }}
            >
              <span className="text-base leading-none">+</span> Crea
            </button>
          </div>

          <ul className="space-y-1.5">
            {primaryRooms.map((room, index) => {
              const accent = getRoomAccent(room, index);
              return (
                <li key={room.id}>
                      <button
                        type="button"
                        onClick={() => handleNavigate(`/app/rooms/${room.id}`)}
                        className="w-full text-left px-3 py-2.5 rounded-2xl border transition flex items-start gap-3 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                        style={{
                          borderColor: `${accent}40`,
                          boxShadow: `0 0 0 1px ${accent}20`,
                          backgroundImage: `linear-gradient(120deg, ${accent}18, rgba(15,23,42,0.65))`,
                        }}
                        aria-label={`Apri stanza ${room.name}`}
                      >
                    <span
                      className="mt-1 h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: accent }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate text-slate-100">
                        {room.name}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {room.members} membri •{' '}
                        {room.isPrivate ? 'Privata' : 'Aperta'}
                      </p>
                    </div>
                    <span className="text-[11px] text-slate-500">
                      {room.tags[0] ? `#${room.tags[0]}` : '—'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          {exploreRooms.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
                Esplora altre stanze
              </p>
              <ul className="space-y-1.5">
                {exploreRooms.slice(0, 3).map((room, index) => {
                  const accent = getRoomAccent(
                    room,
                    index + primaryRooms.length
                  );
                  return (
                    <li key={room.id}>
                      <button
                        type="button"
                        onClick={() => handleNavigate(`/app/rooms/${room.id}`)}
                        className="w-full text-left px-3 py-2 rounded-2xl border border-slate-800 bg-slate-950/40 text-xs text-slate-300 hover:border-white/20 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                        style={{
                          boxShadow: `inset 0 0 0 1px ${accent}20`,
                        }}
                        aria-label={`Esplora la stanza ${room.name}`}
                      >
                        {room.name}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          {!hasFollowedRooms && (
            <p className="text-[11px] text-slate-500 px-1 mt-3">
              Seguirai le stanze preferite durante l’onboarding iniziale.
            </p>
          )}
        </div>
      </nav>

      <div className="px-4 sm:px-5 py-4 border-t border-white/5 text-[11px] text-slate-500 space-y-3">
        <div>
          <p>Progettato per sessioni sane, non per binge infinito.</p>
          <p className="text-slate-400">13 stanze live in questo momento</p>
        </div>
        <div className="space-y-1">
          {supportLinks.map((link) => (
            <button
              key={link.label}
              type="button"
              className="w-full flex items-center justify-between text-left text-xs text-slate-400 hover:text-white transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent/60 rounded-xl px-2 py-1"
              aria-label={`${link.label}, ${link.hint}`}
            >
              <span>{link.label}</span>
              <span className="text-[10px] text-slate-500">{link.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {variant === 'desktop' && (
        <aside className="hidden md:flex flex-col w-72 bg-surface/80 border-r border-white/10 backdrop-blur-2xl relative z-30">
          {content}
        </aside>
      )}

      {variant === 'mobile' && open && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside
            id={MOBILE_DRAWER_ID}
            className="relative z-50 flex h-full w-72 max-w-[80%] flex-col border-r border-slate-800 bg-slate-950 shadow-soft"
            role="dialog"
            aria-modal="true"
            aria-label="Menu principale"
          >
            {content}
          </aside>
        </div>
      )}

      <CreateRoomModal
        open={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
      />
    </>
  );
}

function CreateRoomModal({ open, onClose }) {
  const { createRoom } = useAppState();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    createRoom({
      name: name.trim(),
      description: description.trim(),
      isPrivate,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    setName('');
    setDescription('');
    setIsPrivate(false);
    setTags('');
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Crea una nuova stanza">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="space-y-1">
          <label className="text-[11px] text-slate-300">Nome stanza</label>
          <input
            type="text"
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Es. Creators Lab, Deep Talk…"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-slate-300">Descrizione</label>
          <textarea
            rows={2}
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrivi il tono e gli obiettivi della stanza…"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-slate-300">
            Tag (separati da virgola)
          </label>
          <input
            type="text"
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="es. coding, mindset, adult…"
          />
        </div>
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-[11px] text-slate-300">
            <input
              type="checkbox"
              className="accent-accent"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
            />
            Stanza privata
          </label>
          <button
            type="submit"
            className="text-[11px] uppercase tracking-[0.2em] px-3.5 py-1.5 rounded-2xl text-slate-950 font-semibold shadow-glow hover:opacity-95 transition"
            style={{
              backgroundImage: 'linear-gradient(120deg, #a78bfa, #38bdf8)',
            }}
          >
            Crea stanza
          </button>
        </div>
      </form>
    </Modal>
  );
}
