import { useParams, useNavigate } from 'react-router-dom';
import { useAppState } from '../state/AppStateContext.jsx';
import PostComposer from '../components/threads/PostComposer.jsx';
import PostNode from '../components/threads/PostNode.jsx';

export default function ThreadPage() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { threads, postsByThread, createPost, rooms, personas } = useAppState();
  const thread = threads.find((t) => t.id === threadId);
  const posts = postsByThread[threadId] ?? [];
  const threadRoom = rooms.find((r) => r.id === thread?.roomId);
  const theme = threadRoom?.theme ?? {
    primary: '#a78bfa',
    secondary: '#38bdf8',
    glow: 'rgba(59,130,246,0.35)',
  };
  const accentGradient = `linear-gradient(120deg, ${theme.primary}, ${theme.secondary})`;
  if (!thread) {
    return <p className="text-sm text-red-400">Thread non trovato.</p>;
  }

  function handleNewPost({ content, parentId }) {
    createPost(threadId, { content, parentId, personaId: thread.personaId });
  }

  const personaLabel =
    personas.find((p) => p.id === thread?.personaId)?.label ?? 'Persona attiva';
  const treeRoot = buildTree(posts);

  return (
    <div className="space-y-5">
      <header
        className="glass-panel p-4 sm:p-5 space-y-2 border"
        style={{ borderColor: `${theme.primary}55` }}
      >
        <button
          onClick={() => navigate(-1)}
          className="text-[11px] text-slate-400 hover:text-white w-fit"
        >
          ← Torna alla stanza
        </button>
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
            Thread
          </p>
          <h1 className="text-2xl font-semibold mt-1 text-white">
            {thread.title}
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            {threadRoom?.name ?? 'Stanza'} • {personaLabel}
          </p>
        </div>
      </header>

      <section className="space-y-4">
        <div
          className="glass-panel p-5 border"
          style={{ borderColor: `${theme.primary}55` }}
        >
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-3">
            Radice del thread
          </p>
          <PostComposer
            parentId={null}
            onSubmit={handleNewPost}
            accentGradient={accentGradient}
          />
        </div>

        <div className="glass-panel p-5 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
            Risposte
          </p>
          {treeRoot.length === 0 ? (
            <p className="text-sm text-slate-400">
              Ancora nessun ramo. Rispondi alla radice per farlo crescere.
            </p>
          ) : (
            <div className="space-y-4">
              {treeRoot.map((node) => (
                <ThreadTreeNode
                  key={node.post.id}
                  node={node}
                  onReply={handleNewPost}
                  accentGradient={accentGradient}
                  depth={0}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function buildTree(posts) {
  const map = {};
  posts.forEach((p) => {
    map[p.id] = { post: p, children: [] };
  });
  const roots = [];
  posts.forEach((p) => {
    if (p.parentId && map[p.parentId]) {
      map[p.parentId].children.push(map[p.id]);
    } else if (!p.parentId) {
      roots.push(map[p.id]);
    }
  });
  return roots;
}

function ThreadTreeNode({ node, onReply, accentGradient, depth = 0 }) {
  const { post, children } = node;
  const composerIndent = Math.min(depth + 1, 4) * 0.55;

  return (
    <div className="space-y-2">
      <PostNode
        post={post}
        depth={depth}
        childrenNodes={
          children.length > 0 && (
            <div className="space-y-2">
              {children.map((child) => (
                <ThreadTreeNode
                  key={child.post.id}
                  node={child}
                  onReply={onReply}
                  accentGradient={accentGradient}
                  depth={depth + 1}
                />
              ))}
            </div>
          )
        }
      />
      <div
        className="pt-1"
        style={{ marginLeft: `${composerIndent}rem` }}
      >
        <PostComposer
          parentId={post.id}
          onSubmit={onReply}
          accentGradient={accentGradient}
        />
      </div>
    </div>
  );
}
