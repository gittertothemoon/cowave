import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import { useAppState } from '../../state/AppStateContext.jsx';

export default function CreateRoomModal({ open, onClose }) {
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
    onClose?.();
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
