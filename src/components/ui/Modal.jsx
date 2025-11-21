import { useEffect, useId, useRef } from 'react';
import { cardBaseClass } from './primitives.js';

export default function Modal({ open, onClose, title, children }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const prevFocusedRef = useRef(null);
  const previousOverflowRef = useRef('');

  useEffect(() => {
    if (!open) return undefined;

    prevFocusedRef.current = document.activeElement;
    dialogRef.current?.focus();
    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      if (prevFocusedRef.current && prevFocusedRef.current.focus) {
        prevFocusedRef.current.focus();
      }
      document.body.style.overflow = previousOverflowRef.current;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose?.();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-3 sm:px-6 py-10 sm:py-14">
      <div
        className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-50 flex w-full items-center justify-center pointer-events-none">
        <div
          onClick={(e) => e.stopPropagation()}
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          tabIndex={-1}
          className={`pointer-events-auto relative w-full max-w-lg sm:max-w-xl ${cardBaseClass} p-4 sm:p-5 flex flex-col max-h-[82vh] sm:max-h-[80vh] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60`}
        >
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 id={titleId} className="text-base font-semibold text-slate-100">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-200 text-sm rounded-md focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-500/60"
            >
              ✕
            </button>
          </div>
          <div className="space-y-3 text-sm overflow-y-auto pr-1 flex-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
