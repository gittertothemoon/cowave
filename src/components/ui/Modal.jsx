import { useEffect, useId, useRef } from 'react';

export default function Modal({ open, onClose, title, children }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const prevFocusedRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    prevFocusedRef.current = document.activeElement;
    dialogRef.current?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (prevFocusedRef.current && prevFocusedRef.current.focus) {
        prevFocusedRef.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-50 w-full max-w-md sm:max-w-lg mx-auto gradient-border sheen">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className="glass-panel w-full rounded-[1.7rem] border border-transparent p-4 sm:p-5 flex flex-col max-h-[75vh] sm:max-h-[80vh] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 id={titleId} className="text-sm font-semibold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-200 text-sm rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3 text-xs overflow-y-auto pr-1 flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
