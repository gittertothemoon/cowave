export function SidebarToggle({ isCollapsed, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isCollapsed ? 'Apri sidebar' : 'Chiudi sidebar'}
      className={`
        hidden lg:flex
        items-center justify-center
        h-8 w-8
        rounded-full
        border border-slate-800
        bg-slate-950/85
        text-slate-200
        shadow-lg shadow-slate-900/60
        absolute top-40
        right-0 translate-x-1/2
        z-30
        transition-colors transition-transform duration-200
        hover:border-accent/60 hover:bg-slate-900 hover:text-white
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60
      `}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4 text-slate-100"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {isCollapsed ? (
          // arrow right (open)
          <path d="M10 6l6 6-6 6" />
        ) : (
          // arrow left (close)
          <path d="M14 6l-6 6 6 6" />
        )}
      </svg>
    </button>
  );
}
