export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-2">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative z-50 w-full max-w-md sm:max-w-lg mx-auto gradient-border sheen">
        <div className="glass-panel w-full rounded-[1.7rem] border border-transparent p-4 sm:p-5 flex flex-col max-h-[75vh] sm:max-h-[80vh] overflow-hidden">
          <div className="flex items-center justify-between mb-3 gap-3">
            <h2 className="text-sm font-semibold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-500 hover:text-slate-200 text-sm"
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
