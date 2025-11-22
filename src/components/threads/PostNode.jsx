import { cardBaseClass, bodyTextClass } from '../ui/primitives.js';

export default function PostNode({ post, label, parentAuthor, actions }) {
  const createdAt = new Date(post.createdAt);
  const formattedDate = createdAt.toLocaleString();
  const isoCreatedAt = createdAt.toISOString();
  const initials = (post.author?.[0] ?? 'U').toUpperCase();

  return (
    <article className={`${cardBaseClass} p-3 sm:p-4 space-y-3`}>
      {label && (
        <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
          {label}
        </p>
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

      {actions && <div className="pt-1">{actions}</div>}
    </article>
  );
}
