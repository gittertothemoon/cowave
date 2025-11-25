import { useEffect, useState } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import {
  bodyTextClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
  inputBaseClass,
  labelClass,
} from '../../components/ui/primitives.js';

const TAG_OPTIONS = [
  {
    value: 'idea',
    label: 'Un’idea più chiara',
    helper: 'Hai trovato chiarezza o direzione.',
  },
  {
    value: 'sfogo',
    label: 'Uno sfogo che mi serviva',
    helper: 'Ti sei alleggerito grazie a una conversazione.',
  },
  {
    value: 'spunto',
    label: 'Qualcosa su cui riflettere',
    helper: 'Un dubbio o un pensiero che vuoi tenere a mente.',
  },
];

export default function AddReflectionModal({ isOpen, onClose, onSave }) {
  const MIN_LENGTH = 12;
  const MAX_LENGTH = 240;
  const [selectedTag, setSelectedTag] = useState('idea');
  const [note, setNote] = useState('');
  const trimmed = note.trim();
  const remaining = Math.max(0, MIN_LENGTH - trimmed.length);
  const isTooLong = trimmed.length > MAX_LENGTH;
  const isValid = trimmed.length >= MIN_LENGTH && !isTooLong;

  useEffect(() => {
    if (isOpen) {
      setSelectedTag('idea');
      setNote('');
    }
  }, [isOpen]);

  function handleSave() {
    const trimmedNote = note.trim();
    if (!trimmedNote || trimmedNote.length < MIN_LENGTH || isTooLong) return;
    onSave?.({
      tag: selectedTag,
      note: trimmedNote,
      date: new Date().toISOString(),
    });
  }

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title="Cosa ti porti via da oggi?"
    >
      <div className="space-y-4 text-slate-100">
        <p className={`${bodyTextClass} text-sm`}>
          Salva una nota veloce su cosa ti ha lasciato CoWave oggi. Rimane solo nel tuo profilo.
        </p>

        <div className="space-y-2">
          <p className={labelClass}>Che tipo di appunto è?</p>
          <div className="flex flex-wrap gap-2">
            {TAG_OPTIONS.map((option) => {
              const isActive = selectedTag === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedTag(option.value)}
                  className={`rounded-2xl border px-3 py-2 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60 ${
                    isActive
                      ? 'border-accent/70 bg-accent/10 text-white'
                      : 'border-slate-800 bg-slate-900/70 text-slate-200 hover:border-accent/50'
                  }`}
                >
                  <p className="font-semibold">{option.label}</p>
                  <p className="text-[12px] text-slate-400">
                    {option.helper}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-1">
          <label className={labelClass} htmlFor="reflection-note">
            Appunto
          </label>
          <textarea
            id="reflection-note"
            rows={4}
            className={`${inputBaseClass} resize-none`}
            placeholder="Scrivi in poche parole cosa ti ha lasciato oggi CoWave..."
            value={note}
            maxLength={MAX_LENGTH + 20}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Sarà visibile solo a te nel profilo.
            </span>
            <span className={isTooLong ? 'text-red-400' : 'text-slate-500'}>
              {trimmed.length}/{MAX_LENGTH}
            </span>
          </div>
          {!isValid ? (
            <p className="text-[11px] text-amber-400">
              {isTooLong
                ? 'Accorcia un po’ il testo per salvarlo.'
                : `Scrivi ancora ${remaining} caratteri per salvare.`}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className={`${buttonSecondaryClass} w-full sm:w-auto text-sm`}
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isValid}
            className={`${buttonPrimaryClass} w-full sm:w-auto text-sm disabled:cursor-not-allowed disabled:opacity-60`}
          >
            Salva nei miei appunti
          </button>
        </div>
      </div>
    </Modal>
  );
}
