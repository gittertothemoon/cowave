import { useEffect, useId, useState } from 'react';
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

function slugifyRoomName(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 64);
}

export default function CreateRoomModal({ open, onClose, onCreated }) {
  const navigate = useNavigate();
  const { createRoom } = useAppState();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [tags, setTags] = useState('');
  const [nameError, setNameError] = useState('');
  const [slugError, setSlugError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameId = useId();
  const descriptionId = useId();
  const slugId = useId();
  const tagsId = useId();

  const quickTags = ['focus', 'deep talk', 'rituali', 'tecnico', 'creatori'];

  useEffect(() => {
    if (slugEdited) return;
    const nextSlug = slugifyRoomName(name);
    setSlug(nextSlug);
  }, [name, slugEdited]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setNameError('Inserisci un nome per la stanza.');
      return;
    }
    const safeSlug = slugifyRoomName(slug || name);
    if (!safeSlug) {
      setSlugError('Scegli uno slug (URL) leggibile e senza caratteri speciali.');
      return;
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(safeSlug)) {
      setSlugError('Lo slug può contenere solo lettere minuscole, numeri e trattini.');
      return;
    }
    setSlugError('');
    setSlug(safeSlug);
    setSubmitError('');
    setIsSubmitting(true);
    try {
      const { roomId, error } = await createRoom({
        name: name.trim(),
        description: description.trim(),
        slug: safeSlug,
        isPrivate,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      if (error) {
        setSubmitError(error.message || 'Non riesco a creare la stanza ora.');
        return;
      }
      if (roomId) {
        onCreated?.(roomId);
        if (!onCreated) {
          navigate(`/rooms/${roomId}`);
        }
      }
      setNameError('');
      setName('');
      setDescription('');
      setSlug('');
      setSlugEdited(false);
      setIsPrivate(false);
      setTags('');
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setNameError('');
    setSlugError('');
    onClose?.();
  }

  return (
    <Modal open={open} onClose={handleClose} title="Proponi una stanza">
      <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300 mb-3">
        Dai un nome chiaro, una descrizione breve e qualche tag: la proposta verrà revisionata
        prima di essere pubblica.
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
          <label className={labelClass} htmlFor={slugId}>
            URL (slug)
          </label>
          <input
            type="text"
            className={`${inputBaseClass} ${
              slugError ? 'border-red-500 focus:border-red-500/70 focus:ring-red-500/70' : ''
            }`}
            value={slug}
            onChange={(e) => {
              const nextValue = e.target.value;
              setSlug(nextValue);
              setSlugEdited(nextValue.trim().length > 0);
              if (slugError) setSlugError('');
            }}
            placeholder="es. creators-lab"
            required
            id={slugId}
            aria-invalid={Boolean(slugError)}
          />
          <p className={`${bodyTextClass} text-[11px] text-slate-400`}>
            Solo lettere minuscole, numeri e trattini. È l’indirizzo della stanza.
          </p>
          {slugError && (
            <p className="text-xs text-red-400 mt-1">{slugError}</p>
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
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Invio…' : 'Proponi stanza'}
            </button>
          </div>
        </div>
        {submitError ? (
          <p className="text-xs text-red-300">{submitError}</p>
        ) : null}
      </form>
    </Modal>
  );
}
