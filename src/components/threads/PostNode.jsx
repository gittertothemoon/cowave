import { cardMutedClass, bodyTextClass } from '../ui/primitives.js';

export default function PostNode({ post, childrenNodes, depth = 0 }) {
  const clampedDepth = Math.min(depth, 4);
  const paddingLeft = 0.85 + clampedDepth * 0.35;
  const marginLeft =
    depth === 0 ? 0 : Math.min(0.35 * clampedDepth, 1.1);
  const createdAt = new Date(post.createdAt);
  const formattedDate = createdAt.toLocaleString();
  const isoCreatedAt = createdAt.toISOString();

  return (
    <article
      className="relative border-l border-white/10 w-full"
      style={{
        paddingLeft: `${paddingLeft}rem`,
        marginLeft: `${marginLeft}rem`,
      }}
    >
      <div className={`${cardMutedClass} mb-2 px-3 py-2 shadow-inner`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-400">
          <p className="font-medium text-slate-200 leading-tight">
            {post.author}
          </p>
          <time className="text-slate-500" dateTime={isoCreatedAt}>
            {formattedDate}
          </time>
        </div>
        <p className={`${bodyTextClass} text-sm whitespace-pre-wrap mt-2`}>
          {post.content}
        </p>
      </div>
      {childrenNodes && <div className="space-y-2 pt-1">{childrenNodes}</div>}
    </article>
  );
}
