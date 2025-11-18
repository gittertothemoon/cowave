import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppState } from '../../state/AppStateContext.jsx';
import Modal from '../ui/Modal.jsx';
import AlgorithmControls from '../ui/AlgorithmControls.jsx';
import SessionHUD from '../ui/SessionHUD.jsx';

export default function Sidebar({ variant = 'desktop', open = false, onClose }) {
  const { rooms } = useAppState();
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = variant === 'mobile';

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

  const content = (
    <div className="flex h-full flex-col bg-surface/95 md:bg-transparent">
      {isMobile && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <p className="text-sm font-semibold text-white">Naviga CoWave</p>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white text-base"
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
              onClick={() => setIsCreateRoomOpen(true)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-950 px-2.5 py-1 rounded-2xl"
              style={{
                backgroundImage: 'linear-gradient(120deg, #a78bfa, #38bdf8)',
                boxShadow: '0 10px 25px rgba(15,23,42,0.35)',
              }}
            >
              <span className="text-base leading-none">+</span> Crea
            </button>
          </div>

          <ul className="space-y-1.5">
            {rooms.map((room) => (
              <li key={room.id}>
                <button
                  onClick={() => handleNavigate(`/app/rooms/${room.id}`)}
                  className="w-full text-left px-3 py-2.5 rounded-2xl border hover:border-accent/50 hover:bg-slate-900/60 transition flex items-start gap-3"
                  style={{
                    borderColor: `${room.theme?.primary ?? '#334155'}30`,
                    background: `linear-gradient(120deg, ${
                      room.theme?.primary ?? '#475569'
                    }14, transparent)`,
                  }}
                >
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-gradient-to-br from-accent to-accentBlue flex-shrink-0" />
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
            ))}
          </ul>
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
              className="w-full flex items-center justify-between text-left text-xs text-slate-400 hover:text-white transition"
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
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 bottom-0 w-full max-w-xs sm:w-72 bg-surface/95 border-r border-white/10 shadow-soft flex flex-col">
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
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
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
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent resize-none"
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
            className="w-full bg-slate-950/80 border border-slate-700 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-accent"
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
