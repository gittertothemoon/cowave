export default function PostNode({ post, childrenNodes }) {
  return (
    <div className="relative pl-3 sm:pl-4 border-l border-white/10 ml-0.5 sm:ml-1">
      <div className="mb-2 rounded-2xl border border-white/10 bg-slate-950/50 px-3 py-2 shadow-inner">
        <div className="flex justify-between items-center text-[11px] text-slate-400">
          <p className="font-medium text-slate-200">{post.author}</p>
          <p className="text-slate-500">
            {new Date(post.createdAt).toLocaleString()}
          </p>
        </div>
        <p className="text-sm text-slate-100 whitespace-pre-wrap mt-2">
          {post.content}
        </p>
      </div>
      <div className="space-y-2">{childrenNodes}</div>
    </div>
  );
}
