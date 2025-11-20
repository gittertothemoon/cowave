import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../state/AppStateContext.jsx';

export default function ThreadCard({ thread }) {
  const navigate = useNavigate();
  const { personas, rooms } = useAppState();
  const persona = personas.find((p) => p.id === thread.personaId);
  const room = rooms.find((r) => r.id === thread.roomId);
  const theme = room?.theme ?? {
    primary: '#a78bfa',
    secondary: '#38bdf8',
    glow: 'rgba(59,130,246,0.35)',
  };

  function handleNavigation() {
    navigate(`/app/threads/${thread.id}`);
  }

  return (
    <article
      className="relative glass-panel glass-panel--interactive p-4 sm:p-5 cursor-pointer overflow-hidden group"
      onClick={handleNavigation}
      tabIndex={0}
      role="button"
      onKeyDown={(event) => {
        if (event.key === 'Enter') {
          handleNavigation();
        }
      }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-0 pointer-events-none transition duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(circle at top right, ${theme.primary}33, transparent 60%)`,
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -right-16 top-1/2 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-40 transition duration-300"
        style={{ background: theme.glow }}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="text-[11px] px-2.5 py-0.5 rounded-full border text-slate-200"
              style={{
                borderColor: theme.primary,
                backgroundColor: `${theme.primary}15`,
                color: room?.theme?.text ?? '#e2e8f0',
              }}
            >
              {room?.name ?? 'Stanza sconosciuta'}
            </span>
            <span className="text-[11px] text-slate-500">
              {thread.depth} livelli • {thread.branches} rami
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-white">
            {thread.title}
          </h3>
        </div>
        <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
          <span
            className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
          >
            {persona?.label?.[0] ?? 'P'}
          </span>
          <p className="text-[11px] text-slate-500 text-left sm:text-right">
            {persona?.label ?? thread.author}
          </p>
        </div>
      </div>

      <p className="mt-3 text-sm text-slate-300 line-clamp-2">
        {thread.rootSnippet}
      </p>

      <div className="mt-3 flex flex-col gap-2 text-[11px] text-slate-400 sm:flex-row sm:flex-wrap sm:items-center">
        <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-accent/30 to-accentBlue/30 text-accent border border-accent/40 w-fit">
          Energia: {thread.energy}
        </span>
        <span>
          Ultimo aggiornamento: {new Date(thread.createdAt).toLocaleString()}
        </span>
        <span className="text-slate-300 flex items-center gap-1 sm:ml-auto">
          Continua il ramo ↗
        </span>
      </div>
    </article>
  );
}
