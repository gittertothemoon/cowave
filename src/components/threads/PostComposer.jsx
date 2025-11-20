import { useId, useState } from 'react';

export default function PostComposer({
  parentId = null,
  onSubmit,
  accentGradient,
}) {
  const [value, setValue] = useState('');
  const textareaId = useId();
  const helperId = `${textareaId}-helper`;
  const isEmpty = value.trim().length === 0;

  function handleSubmit(e) {
    e.preventDefault();
    if (isEmpty) return;
    onSubmit?.({ content: value, parentId });
    setValue('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 text-xs">
      <div className="rounded-2xl border border-white/10 bg-slate-950/40 focus-within:border-accent/60 transition">
        <textarea
          id={textareaId}
          rows={parentId ? 2 : 3}
          className="w-full bg-transparent rounded-2xl px-3 py-2 text-sm text-slate-100 focus:outline-none placeholder:text-slate-500 resize-none"
          placeholder={
            parentId
              ? 'Contribuisci a questo ramo…'
              : 'Scrivi lo spunto o la tensione da cui parte il thread…'
          }
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-describedby={helperId}
        />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
        <div className="flex gap-2 text-slate-500" id={helperId}>
          <span className="text-accent">↳</span>
          <span>
            {parentId
              ? 'Stai aprendo un ramo di questo thread'
              : 'Questo messaggio diventa la radice del thread'}
          </span>
        </div>
        <button
          type="submit"
          disabled={isEmpty}
          className={`text-[11px] px-3 py-1.5 rounded-2xl font-semibold tracking-wide transition shadow-glow w-full sm:w-auto text-center ${
            accentGradient
              ? 'text-slate-950'
              : 'bg-gradient-to-r from-accent to-accentBlue text-slate-950'
          } ${isEmpty ? 'opacity-60 cursor-not-allowed shadow-none' : 'hover:opacity-95'}`}
          style={accentGradient ? { backgroundImage: accentGradient } : undefined}
          aria-disabled={isEmpty}
        >
          Pubblica
        </button>
      </div>
    </form>
  );
}
