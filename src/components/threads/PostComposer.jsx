import { useEffect, useId, useRef, useState } from 'react';
import {
  inputBaseClass,
  buttonPrimaryClass,
  bodyTextClass,
} from '../ui/primitives.js';

export default function PostComposer({
  parentId = null,
  onSubmit,
  accentGradient,
}) {
  const [value, setValue] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);
  const shouldRevokePreviewRef = useRef(true);
  const textareaId = useId();
  const helperId = `${textareaId}-helper`;
  const isEmpty = value.trim().length === 0;
  const isReply = Boolean(parentId);

  useEffect(() => {
    return () => {
      if (previewUrl && shouldRevokePreviewRef.current) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      clearSelectedImage();
      return;
    }
    shouldRevokePreviewRef.current = true;
    const nextPreviewUrl = URL.createObjectURL(file);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(file);
    setPreviewUrl(nextPreviewUrl);
  }

  function clearSelectedImage({ revoke = true } = {}) {
    shouldRevokePreviewRef.current = revoke;
    if (revoke && previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedImage(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (isEmpty) return;
    const hasAttachment = Boolean(selectedImage && previewUrl);
    const attachments =
      hasAttachment
        ? [
            {
              id:
                typeof crypto !== 'undefined' && crypto.randomUUID
                  ? crypto.randomUUID()
                  : `att-${Date.now()}`,
              type: 'image',
              url: previewUrl,
              name: selectedImage.name,
            },
          ]
        : undefined;
    onSubmit?.({ content: value, parentId, attachments });
    setValue('');
    clearSelectedImage({ revoke: !hasAttachment });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 text-xs">
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />
      <textarea
        id={textareaId}
        rows={isReply ? 2 : 3}
        className={`${inputBaseClass} resize-none bg-slate-950/80`}
        placeholder={
          isReply
            ? 'Scrivi una risposta a questo messaggio…'
            : 'Scrivi il post iniziale del thread…'
        }
        value={value}
        onChange={(e) => setValue(e.target.value)}
        aria-describedby={helperId}
      />
      {previewUrl && (
        <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
          <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-800">
            <img
              src={previewUrl}
              alt={selectedImage?.name || 'Anteprima immagine'}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex flex-1 flex-col gap-2">
            <p className="text-[12px] font-semibold text-slate-100 line-clamp-2">
              {selectedImage?.name || 'Immagine allegata'}
            </p>
            <button
              type="button"
              onClick={clearSelectedImage}
              className="self-start rounded-xl border border-slate-700 px-3 py-1 text-[11px] font-semibold text-slate-200 hover:border-sky-500/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60"
            >
              Rimuovi
            </button>
          </div>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
        <div
          className={`${bodyTextClass} flex flex-wrap items-center gap-2 text-[11px] text-slate-500`}
          id={helperId}
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-1.5 font-semibold text-slate-200 hover:border-sky-500/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60"
          >
            <span aria-hidden="true">📎</span>
            <span>Aggiungi foto</span>
          </button>
          <span className="text-accent">💬</span>
          <span className="leading-snug">
            {isReply
              ? 'La tua risposta verrà mostrata sotto questo messaggio.'
              : 'Questo sarà il punto di partenza della conversazione.'}
          </span>
        </div>
        <button
          type="submit"
          disabled={isEmpty}
          className={`${buttonPrimaryClass} shadow-glow w-full sm:w-auto text-center ${
            isEmpty ? 'opacity-60 cursor-not-allowed shadow-none' : ''
          }`}
          style={accentGradient ? { backgroundImage: accentGradient } : undefined}
          aria-disabled={isEmpty}
        >
          Pubblica
        </button>
      </div>
    </form>
  );
}
