import { useEffect, useId, useRef } from 'react';
import { cardBaseClass } from './primitives.js';

export default function Modal({ open, onClose, title, children }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const prevFocusedRef = useRef(null);
  const previousOverflowRef = useRef('');
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;

    const dialog = dialogRef.current;
    const focusableElements = dialog
      ? Array.from(
          dialog.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )
        ).filter(
          (el) =>
            !el.hasAttribute('aria-hidden') &&
            (el.offsetParent !== null || el.getClientRects().length > 0)
        )
      : [];

    prevFocusedRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    previousOverflowRef.current = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    (firstFocusable ?? dialog)?.focus();

    function handleKeyDown(event) {
      if (!open || !dialogRef.current) return;

      if (event.key === 'Escape') {
        event.stopPropagation();
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current
        ? Array.from(
            dialogRef.current.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            )
          ).filter(
            (el) =>
              !el.hasAttribute('aria-hidden') &&
              (el.offsetParent !== null || el.getClientRects().length > 0)
          )
        : [];

      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflowRef.current;
      if (prevFocusedRef.current && prevFocusedRef.current.focus) {
        prevFocusedRef.current.focus();
      }
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-3 sm:px-5 py-10 sm:py-14 md:py-16">
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
          className={`pointer-events-auto relative w-full max-w-lg sm:max-w-xl ${cardBaseClass} p-4 sm:p-5 md:p-6 flex flex-col max-h-[75vh] md:max-h-[70vh] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60`}
        >
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 id={titleId} className="text-base font-semibold text-slate-50">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-200 text-sm rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              aria-label="Chiudi"
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
