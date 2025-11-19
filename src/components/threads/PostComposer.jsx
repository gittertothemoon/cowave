import { useState } from 'react';

export default function PostComposer({
  parentId = null,
  onSubmit,
  accentGradient,
}) {
  const [value, setValue] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!value.trim()) return;
    onSubmit?.({ content: value, parentId });
    setValue('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 text-xs">
      <div className="rounded-2xl border border-white/10 bg-slate-950/40 focus-within:border-accent/60 transition">
        <textarea
          rows={parentId ? 2 : 3}
          className="w-full bg-transparent rounded-2xl px-3 py-2 text-sm text-slate-100 focus:outline-none placeholder:text-slate-500 resize-none"
          placeholder={
            parentId
              ? 'Contribuisci a questo ramo…'
              : 'Scrivi lo spunto o la tensione da cui parte il thread…'
          }
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
        <div className="flex gap-2 text-slate-500">
          <span className="text-accent">↳</span>
          <span>
            {parentId
              ? 'Stai aprendo un ramo di questo thread'
              : 'Questo messaggio diventa la radice del thread'}
          </span>
        </div>
        <button
          type="submit"
          className={`text-[11px] px-3 py-1.5 rounded-2xl font-semibold tracking-wide hover:opacity-95 transition shadow-glow w-full sm:w-auto text-center ${
            accentGradient
              ? 'text-slate-950'
              : 'bg-gradient-to-r from-accent to-accentBlue text-slate-950'
          }`}
          style={accentGradient ? { backgroundImage: accentGradient } : undefined}
        >
          Pubblica
        </button>
      </div>
    </form>
  );
}
