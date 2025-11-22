import { useId, useState } from 'react';
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
  const textareaId = useId();
  const helperId = `${textareaId}-helper`;
  const isEmpty = value.trim().length === 0;
  const isReply = Boolean(parentId);

  function handleSubmit(e) {
    e.preventDefault();
    if (isEmpty) return;
    onSubmit?.({ content: value, parentId });
    setValue('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2 text-xs">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px]">
        <div
          className={`${bodyTextClass} flex gap-2 text-[11px] text-slate-500`}
          id={helperId}
        >
          <span className="text-accent">💬</span>
          <span>
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
