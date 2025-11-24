import { useId, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from '../ui/Modal.jsx';
import { useAppState } from '../../state/AppStateContext.jsx';
import {
  buttonPrimaryClass,
  buttonGhostClass,
  inputBaseClass,
  labelClass,
  bodyTextClass,
} from '../ui/primitives.js';

export default function CreateRoomModal({ open, onClose, onCreated }) {
  const navigate = useNavigate();
  const { createRoom } = useAppState();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState('');
  const [nameError, setNameError] = useState('');
  const nameId = useId();
  const descriptionId = useId();
  const tagsId = useId();

  const quickTags = ['focus', 'deep talk', 'rituali', 'tecnico', 'creatori'];

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Inserisci un nome per la stanza.');
      return;
    }
    const roomId = createRoom({
      name: name.trim(),
      description: description.trim(),
      isPrivate,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    });
    if (roomId) {
      onCreated?.(roomId);
      if (!onCreated) {
        navigate(`/app/rooms/${roomId}`);
      }
    }
    setNameError('');
    setName('');
    setDescription('');
    setIsPrivate(false);
    setTags('');
    handleClose();
  }

  function handleClose() {
    setNameError('');
    onClose?.();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Nuova stanza">
      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 mb-3">
        Dai un nome chiaro, una descrizione breve e qualche tag: chi entra saprà il tono
        e l’obiettivo della stanza.
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-slate-100">
        <div className="space-y-1">
          <label className={labelClass} htmlFor={nameId}>
            Nome stanza
          </label>
          <input
            type="text"
            className={`${inputBaseClass} ${
              nameError ? 'border-red-500 focus:border-red-500/70 focus:ring-red-500/70' : ''
            }`}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError('');
            }}
            placeholder="Es. Creators Lab, Deep Talk…"
            required
            id={nameId}
            aria-invalid={Boolean(nameError)}
          />
          {nameError && (
            <p className="text-xs text-red-400 mt-1">{nameError}</p>
          )}
        </div>
        <div className="space-y-1">
          <label className={labelClass} htmlFor={descriptionId}>
            Descrizione
          </label>
          <textarea
            rows={3}
            className={`${inputBaseClass} resize-none`}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrivi il tono e gli obiettivi della stanza…"
            id={descriptionId}
          />
          <p className={`${bodyTextClass} text-[11px] text-slate-400`}>
            Max 1-2 frasi: chi entra deve capire subito ritmo e regole.
          </p>
        </div>
        <div className="space-y-1">
          <label className={labelClass} htmlFor={tagsId}>
            Tag (separati da virgola)
          </label>
          <input
            type="text"
            className={inputBaseClass}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="es. coding, mindset, rituali"
            id={tagsId}
          />
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-300 mt-1">
            {quickTags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() =>
                  setTags((prev) =>
                    prev.includes(tag)
                      ? prev
                      : prev
                      ? `${prev.replace(/,\s*$/, '')}, ${tag}`
                      : tag
                  )
                }
                className="rounded-full border border-white/10 bg-slate-900/60 px-2.5 py-1 hover:border-accent/60 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-label={`Aggiungi tag ${tag}`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              className="accent-accent h-4 w-4"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              id="room-private"
            />
            <label htmlFor="room-private" className="cursor-pointer">
              Rendi la stanza privata
            </label>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 gap-2 sm:ml-auto w-full sm:w-auto">
            <button
              type="button"
              onClick={handleClose}
              className={`${buttonGhostClass} w-full sm:w-auto text-sm`}
            >
              Annulla
            </button>
            <button
              type="submit"
              className={`${buttonPrimaryClass} w-full sm:w-auto text-sm text-center`}
            >
              Crea stanza
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
