import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppState } from '../state/AppStateContext.jsx';
import PostComposer from '../components/threads/PostComposer.jsx';
import PostNode from '../components/threads/PostNode.jsx';
import {
  buttonGhostClass,
  cardBaseClass,
  eyebrowClass,
  pageTitleClass,
  bodyTextClass,
} from '../components/ui/primitives.js';

export default function ThreadPage() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { threads, postsByThread, createPost, rooms, personas } = useAppState();
  const [isThreadLoading] = useState(false);
  const [threadError] = useState(null);
  const thread = threads.find((t) => t.id === threadId);
  const posts = postsByThread[threadId] ?? [];
  const threadRoom = rooms.find((r) => r.id === thread?.roomId);
  const theme = threadRoom?.theme ?? {
    primary: '#a78bfa',
    secondary: '#38bdf8',
    glow: 'rgba(59,130,246,0.35)',
  };
  const accentGradient = `linear-gradient(120deg, ${theme.primary}, ${theme.secondary})`;

  if (threadError) {
    return (
      <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-950/20 p-4 text-sm text-red-100">
        <p className="font-medium">
          Si è verificato un problema nel caricamento dei contenuti.
        </p>
        <p className="mt-1 text-xs text-red-200">
          Riprova a ricaricare la pagina. Se il problema persiste, segnalalo nella stanza “Feedback CoWave”.
        </p>
      </div>
    );
  }

  if (isThreadLoading) {
    return (
      <div className="space-y-4">
        <div className={`${cardBaseClass} animate-pulse p-4 space-y-3`}>
          <div className="h-3 w-24 rounded-full bg-slate-800/60" />
          <div className="h-5 w-2/3 rounded-full bg-slate-800/50" />
          <div className="h-4 w-1/2 rounded-full bg-slate-800/40" />
        </div>
        <div className={`${cardBaseClass} animate-pulse p-4 space-y-3`}>
          <div className="h-4 w-1/3 rounded-full bg-slate-800/50" />
          <div className="h-10 w-full rounded-2xl bg-slate-800/40" />
          <div className="h-3 w-20 rounded-full bg-slate-800/50" />
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className={`${cardBaseClass} p-4`}>
        <p className="text-sm text-red-200">Thread non trovato.</p>
        <button
          type="button"
          onClick={() => navigate('/app')}
          className={`${buttonGhostClass} mt-2 text-sm`}
        >
          Torna al feed
        </button>
      </div>
    );
  }

  function handleNewPost({ content, parentId }) {
    createPost(threadId, { content, parentId, personaId: thread.personaId });
  }

  const personaLabel =
    personas.find((p) => p.id === thread?.personaId)?.label ?? 'Persona attiva';
  const treeRoot = buildTree(posts);
  const isOnlyRoot =
    treeRoot.length === 1 && (treeRoot[0]?.children?.length ?? 0) === 0;

  return (
    <div className="space-y-5">
      <header
        className={`${cardBaseClass} p-4 sm:p-5 space-y-2 border`}
        style={{ borderColor: `${theme.primary}55` }}
      >
        <button
          onClick={() => navigate(-1)}
          className={`${buttonGhostClass} text-sm w-fit`}
        >
          ← Torna alla stanza
        </button>
        <div>
          <p className={eyebrowClass}>Thread</p>
          <h1 className={`${pageTitleClass} mt-1 text-2xl`}>
            {thread.title}
          </h1>
          <p className="text-xs text-slate-500 mt-2">
            {threadRoom?.name ?? 'Stanza'} • {personaLabel}
          </p>
        </div>
      </header>

      <section className="space-y-4">
        <div
          className={`${cardBaseClass} p-4 sm:p-5 border`}
          style={{ borderColor: `${theme.primary}55` }}
        >
          <p className={`${eyebrowClass} mb-3`}>Radice del thread</p>
          <PostComposer
            parentId={null}
            onSubmit={handleNewPost}
            accentGradient={accentGradient}
          />
        </div>

        <div className={`${cardBaseClass} p-4 sm:p-5 space-y-3`}>
          <p className={eyebrowClass}>Risposte</p>
          {treeRoot.length === 0 ? (
            <p className={bodyTextClass}>
              Nessuna risposta ancora. Aggiungi un ramo e porta avanti la conversazione.
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
                  showNoRepliesNote={isOnlyRoot}
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

function ThreadTreeNode({
  node,
  onReply,
  accentGradient,
  depth = 0,
  showNoRepliesNote = false,
}) {
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
      {showNoRepliesNote && depth === 0 && (
        <p className="mt-3 text-xs text-slate-400">
          Nessuna risposta ancora. Scrivi la prima risposta per far partire il ramo.
        </p>
      )}
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
