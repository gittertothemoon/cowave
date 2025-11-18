import { useParams, useNavigate } from 'react-router-dom';
import { useAppState } from '../state/AppStateContext.jsx';
import PostComposer from '../components/threads/PostComposer.jsx';
import PostNode from '../components/threads/PostNode.jsx';

export default function ThreadPage() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { threads, postsByThread, createPost, rooms } = useAppState();

  const thread = threads.find((t) => t.id === threadId);
  const posts = postsByThread[threadId] ?? [];
  const threadRoom = rooms.find((r) => r.id === thread?.roomId);
  const theme = threadRoom?.theme ?? {
    primary: '#a78bfa',
    secondary: '#38bdf8',
    glow: 'rgba(59,130,246,0.35)',
  };
  const accentGradient = `linear-gradient(120deg, ${theme.primary}, ${theme.secondary})`;
  const prompts = [
    'Porta un caso reale o una storia vissuta.',
    'Quale metrica usi per capire se la proposta funziona?',
    'Che contro-argomento vale la pena esplorare?',
  ];

  if (!thread) {
    return <p className="text-sm text-red-400">Thread non trovato.</p>;
  }

  function handleNewPost({ content, parentId }) {
    createPost(threadId, { content, parentId, personaId: thread.personaId });
  }

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
        </div>
      </header>

      <section className="grid gap-5 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
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

          <div className="glass-panel p-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400 mb-3">
              Rami della conversazione
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
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div
            className="glass-panel p-5 space-y-2 border"
            style={{ borderColor: `${theme.primary}40` }}
          >
            <p className="text-[11px] uppercase tracking-[0.16em] text-slate-400">
              Info sul thread
            </p>
            <div className="grid gap-2 text-sm text-slate-300">
              <p>Profondità stimata: {thread.depth}</p>
              <p>Rami attivi: {thread.branches}</p>
              <p>Energia: {thread.energy}</p>
            </div>
            <p className="text-[11px] text-slate-400">
              Presto troverai qui equilibrio comfort/sfida, ritmo e contributi da
              mettere in evidenza.
            </p>
          </div>
          <div className="glass-panel p-4 space-y-2 text-sm text-slate-300">
            <p className="text-[11px] uppercase tracking-[0.16em] text-accent">
              Prompt per contribuire
            </p>
            <ul className="space-y-2">
              {prompts.map((prompt) => (
                <li key={prompt} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5" />
                  <span>{prompt}</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
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

function ThreadTreeNode({ node, onReply, accentGradient }) {
  const { post, children } = node;

  return (
    <div className="space-y-2">
      <PostNode
        post={post}
        childrenNodes={
          children.length > 0 && (
            <div className="space-y-2">
              {children.map((child) => (
                <ThreadTreeNode
                  key={child.post.id}
                  node={child}
                  onReply={onReply}
                  accentGradient={accentGradient}
                />
              ))}
            </div>
          )
        }
      />
      <div className="ml-3 sm:ml-5">
        <PostComposer
          parentId={post.id}
          onSubmit={onReply}
          accentGradient={accentGradient}
        />
      </div>
    </div>
  );
}
