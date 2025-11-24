import { Link } from 'react-router-dom';
import { useAppState } from '../../state/AppStateContext.jsx';
import { cardBaseClass, bodyTextClass } from '../ui/primitives.js';

export default function ThreadCard({ thread }) {
  const { personas, rooms, postsByThread } = useAppState();
  const persona = personas.find((p) => p.id === thread.personaId);
  const room = rooms.find((r) => r.id === thread.roomId);
  const theme = room?.theme ?? {
    primary: '#a78bfa',
    secondary: '#38bdf8',
    glow: 'rgba(59,130,246,0.35)',
  };
  const posts = postsByThread?.[thread.id] ?? [];
  const replies = posts;
  const repliesCount = replies.length;
  const lastActivityTimestamps = [
    ...replies.map((p) => new Date(p.createdAt).getTime()),
  ];
  if (thread.initialPost) {
    lastActivityTimestamps.push(
      new Date(thread.initialPost.createdAt).getTime()
    );
  }
  if (thread.createdAt) {
    lastActivityTimestamps.push(new Date(thread.createdAt).getTime());
  }
  const validActivityTimes = lastActivityTimestamps.filter(
    (time) => !Number.isNaN(time)
  );
  const lastActivityDate =
    validActivityTimes.length > 0
      ? new Date(Math.max(...validActivityTimes))
      : null;
  const lastActivityText = lastActivityDate
    ? formatRelativeTime(lastActivityDate)
    : '—';
  const cardLabel = `Apri thread ${thread.title} nella stanza ${room?.name ?? 'sconosciuta'}`;
  const previewText =
    thread.initialPost?.content ||
    thread.rootSnippet ||
    replies.find((p) => p.parentId === null)?.content ||
    'Post iniziale in arrivo. Entra e scrivilo tu.';

  return (
    <article className="relative">
      <Link
        to={`/app/threads/${thread.id}`}
        className={`${cardBaseClass} glass-panel--interactive relative block p-4 sm:p-5 overflow-hidden group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950`}
        aria-label={cardLabel}
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
            </div>
            <h3 className="text-base sm:text-lg font-semibold text-white">
              {thread.title}
            </h3>
            <p className="text-[12px] text-slate-400 mt-1">
              Avviato da {thread.author || persona?.label || 'autore sconosciuto'} ·{' '}
              {repliesCount === 1 ? '1 risposta' : `${repliesCount} risposte`} · Ultima attività{' '}
              {lastActivityText}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-1">
            <span
              className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
              aria-hidden="true"
            >
              {persona?.label?.[0] ?? 'P'}
            </span>
            <p className="text-[11px] text-slate-500 text-left sm:text-right">
              {persona?.label ?? thread.author}
            </p>
          </div>
        </div>

        <p className={`${bodyTextClass} mt-3 line-clamp-2`}>
          {previewText}
        </p>

        <div className="mt-3 flex flex-col gap-2 text-[11px] text-slate-400 sm:flex-row sm:flex-wrap sm:items-center">
          <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-accent/30 to-accentBlue/30 text-accent border border-accent/40 w-fit">
            Energia: {thread.energy}
          </span>
          <span>
            Ultima attività:{' '}
            {lastActivityDate ? (
              <time dateTime={lastActivityDate.toISOString()}>
                {lastActivityText}
              </time>
            ) : (
              '—'
            )}
          </span>
          <span className="text-slate-300 flex items-center gap-1 sm:ml-auto">
            Apri il thread ↗
          </span>
        </div>
      </Link>
    </article>
  );
}

function formatRelativeTime(date) {
  const now = Date.now();
  const diffMs = now - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return 'poco fa';
  if (minutes < 60) return `${minutes} min fa`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h fa`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}g fa`;
  const weeks = Math.floor(days / 7);
  return `${weeks} sett fa`;
}
