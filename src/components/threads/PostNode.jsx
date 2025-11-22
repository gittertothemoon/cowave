import { cardBaseClass, bodyTextClass } from '../ui/primitives.js';

export default function PostNode({
  post,
  label,
  parentAuthor,
  actions,
  onToggleWave,
  variant = 'reply',
}) {
  const createdAt = new Date(post.createdAt);
  const formattedDate = createdAt.toLocaleString();
  const isoCreatedAt = createdAt.toISOString();
  const initials = (post.author?.[0] ?? 'U').toUpperCase();
  const waveCount =
    typeof post.waveCount === 'number' ? post.waveCount : 0;
  const hasWaved = Boolean(post.hasWaved);
  const waveLabel = hasWaved ? 'Onda inviata' : 'Manda un’onda';
  const waveCountLabel =
    waveCount === 1 ? '1 onda' : `${waveCount} onde`;
  const waveButtonClass = [
    'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[13px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60',
    hasWaved
      ? 'bg-sky-500/15 border-sky-400/70 text-sky-50 shadow-[0_8px_24px_rgba(56,189,248,0.18)] animate-wave-pulse'
      : 'border-slate-800 bg-slate-900/70 text-slate-200 hover:border-sky-500/50 hover:text-white',
  ].join(' ');
  const isRoot = variant === 'root';
  const containerClass = [
    cardBaseClass,
    'p-3 sm:p-4 space-y-3',
    isRoot
      ? 'border-accent/60 bg-slate-900/80 shadow-[0_20px_60px_rgba(59,130,246,0.12)]'
      : 'border-slate-800/80 bg-slate-950/60',
  ].join(' ');
  const labelClassName = [
    'inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold',
    isRoot
      ? 'border border-accent/50 bg-accent/15 text-accent'
      : 'border border-slate-700 bg-slate-900/70 text-slate-300',
  ].join(' ');

  return (
    <article className={containerClass}>
      {label && (
        <span className={labelClassName}>
          {label}
        </span>
      )}
      {parentAuthor && (
        <p className="text-[11px] text-slate-500">
          In risposta a {parentAuthor}
        </p>
      )}

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sm font-semibold text-slate-100">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-100 leading-tight">
            {post.author}
          </p>
          <time
            className="text-[11px] text-slate-500 block mt-0.5"
            dateTime={isoCreatedAt}
          >
            {formattedDate}
          </time>
        </div>
      </div>

      <p className={`${bodyTextClass} text-sm whitespace-pre-wrap`}>
        {post.content}
      </p>

      {post.attachments?.length > 0 && (
        <AttachmentPreview attachments={post.attachments} />
      )}

      <div className="pt-1 flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className={waveButtonClass}
            onClick={() => onToggleWave?.(post.id)}
            aria-pressed={hasWaved}
            aria-label={`${waveLabel}. ${waveCountLabel}.`}
          >
            <WaveIcon active={hasWaved} />
            <span>{waveLabel}</span>
          </button>
          <span className="text-[12px] font-semibold text-slate-400">
            {waveCountLabel}
          </span>
        </div>

        {actions}
      </div>
    </article>
  );
}

function AttachmentPreview({ attachments }) {
  const imageAttachment = attachments.find(
    (attachment) => attachment?.type === 'image'
  );

  if (!imageAttachment) return null;

  return (
    <div className="mt-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
      <img
        src={imageAttachment.url}
        alt={imageAttachment.name || 'Immagine allegata'}
        className="aspect-video w-full object-cover"
      />
    </div>
  );
}

function WaveIcon({ active = false }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        className={active ? 'text-sky-300' : 'text-slate-300'}
        d="M3 14c1.7-3 3.3-3 5 0s3.3 3 5 0 3.3-3 5 0"
      />
      <path
        className={active ? 'text-sky-200' : 'text-slate-500'}
        d="M4.5 9c1.2-2.2 2.4-2.2 3.6 0s2.4 2.2 3.6 0 2.4-2.2 3.6 0"
      />
    </svg>
  );
}
