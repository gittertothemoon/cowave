import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAppState } from '../state/AppStateContext.jsx';
import PostComposer from '../components/threads/PostComposer.jsx';
import PostNode from '../components/threads/PostNode.jsx';
import {
  buttonGhostClass,
  buttonSecondaryClass,
  cardBaseClass,
  eyebrowClass,
  pageTitleClass,
  bodyTextClass,
} from '../components/ui/primitives.js';

export default function ThreadPage() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const {
    threads,
    postsByThread,
    createPost,
    rooms,
    personas,
    toggleCommentWave,
  } = useAppState();
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

  function handleNewPost({ content, parentId, attachments }) {
    createPost(threadId, {
      content,
      parentId,
      personaId: thread.personaId,
      attachments,
    });
  }

  const personaLabel =
    personas.find((p) => p.id === thread?.personaId)?.label ?? 'Persona attiva';
  const treeRoot = buildTree(posts);
  const rootNode = treeRoot[0] ?? null;
  const firstLevelReplies = rootNode?.children ?? [];
  const repliesOnly = posts.filter((p) => p.parentId !== null);
  const repliesCount = repliesOnly.length;
  const lastReplyDate =
    repliesOnly.length > 0
      ? new Date(
          Math.max(
            ...repliesOnly.map((p) => new Date(p.createdAt).getTime())
          )
        )
      : null;
  const lastReplyText = lastReplyDate
    ? formatRelativeTime(lastReplyDate)
    : null;
  const [replyingToRoot, setReplyingToRoot] = useState(false);

  function handleCopyLink() {
    try {
      if (typeof window !== 'undefined') {
        navigator?.clipboard
          ?.writeText(window.location.href)
          .catch(() => {});
      }
    } catch {
      // best-effort copy
    }
  }

  function handleToggleWave(postId) {
    toggleCommentWave(threadId, postId);
  }

  return (
    <div className="space-y-5">
      <header
        className={`${cardBaseClass} p-4 sm:p-5 space-y-2 border`}
        style={{ borderColor: `${theme.primary}55` }}
      >
        <p className="text-[11px] text-slate-500">
          Stanza &gt; {threadRoom?.name ?? 'Stanza'} &gt; {thread.title}
        </p>
        <h1 className={`${pageTitleClass} mt-1 text-2xl`}>
          {thread.title}
        </h1>
        <p className="text-sm text-slate-400">
          Avviato da {personaLabel} ·{' '}
          {repliesCount === 1
            ? '1 risposta'
            : `${repliesCount} risposte`}
          {lastReplyText ? ` · Ultima risposta ${lastReplyText}` : ''}
        </p>
      </header>

      <section className="space-y-4">
        <div className="space-y-3">
          {rootNode ? (
            <div className="space-y-3">
              <PostNode
                post={rootNode.post}
                label="Post iniziale"
                onToggleWave={handleToggleWave}
                actions={
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                    <button
                      type="button"
                      className={`${buttonGhostClass} px-3 py-1 text-xs`}
                      onClick={() => setReplyingToRoot((prev) => !prev)}
                    >
                      Rispondi
                    </button>
                    <button
                      type="button"
                      className={`${buttonGhostClass} px-3 py-1 text-xs`}
                      onClick={handleCopyLink}
                    >
                      Copia link
                    </button>
                  </div>
                }
              />
              {replyingToRoot && (
                <div className="pl-1">
                  <PostComposer
                    parentId={rootNode.post.id}
                    onSubmit={(payload) => {
                      handleNewPost(payload);
                      setReplyingToRoot(false);
                    }}
                    accentGradient={accentGradient}
                  />
                </div>
              )}
            </div>
          ) : (
            <div className={`${cardBaseClass} p-4 sm:p-5 space-y-3`}>
              <p className={eyebrowClass}>Post iniziale</p>
              <p className={bodyTextClass}>
                Non c&apos;è ancora un post iniziale. Scrivi tu per avviare la conversazione.
              </p>
              <PostComposer
                parentId={null}
                onSubmit={handleNewPost}
                accentGradient={accentGradient}
              />
            </div>
          )}
        </div>

        <div className={`${cardBaseClass} p-4 sm:p-5 space-y-4`}>
          <div className="space-y-1">
            <p className={eyebrowClass}>Risposte</p>
            <p className="text-xs text-slate-500">
              {repliesCount > 0
                ? `${repliesCount} ${
                    repliesCount === 1 ? 'risposta' : 'risposte'
                  } in questa discussione`
                : 'Nessuna risposta ancora. Inizia tu la conversazione.'}
            </p>
          </div>

          {firstLevelReplies.length === 0 ? (
            <p className={bodyTextClass}>
              Scrivi una risposta per far partire la discussione.
            </p>
          ) : (
            <div className="space-y-4">
              {firstLevelReplies.map((node) => (
                <ReplyItem
                  key={node.post.id}
                  node={node}
                  onReply={handleNewPost}
                  accentGradient={accentGradient}
                  onToggleWave={handleToggleWave}
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

function ReplyItem({
  node,
  onReply,
  onToggleWave,
  accentGradient,
  depth = 0,
  parentAuthor,
}) {
  const { post, children } = node;
  const [showReplies, setShowReplies] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const hasChildren = children.length > 0;
  const visualDepth = Math.min(depth, 2);
  const spacingClass =
    visualDepth > 0
      ? 'mt-2 border-l border-slate-800 pl-3 sm:pl-4 space-y-2'
      : 'space-y-2';

  return (
    <div className={spacingClass}>
      <PostNode
        post={post}
        parentAuthor={depth > 0 ? parentAuthor : undefined}
        onToggleWave={onToggleWave}
        actions={
          <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-400">
            <button
              type="button"
              className={`${buttonSecondaryClass} px-3 py-1 text-xs`}
              onClick={() => setIsReplying((prev) => !prev)}
            >
              Rispondi
            </button>
            {hasChildren && (
              <button
                type="button"
                className={`${buttonGhostClass} px-3 py-1 text-xs`}
                onClick={() => setShowReplies((prev) => !prev)}
              >
                {showReplies
                  ? 'Nascondi risposte'
                  : `${children.length} risposte a questo messaggio`}
              </button>
            )}
          </div>
        }
      />

      {isReplying && (
        <div className="pt-1">
          <PostComposer
            parentId={post.id}
            onSubmit={(payload) => {
              onReply(payload);
              setIsReplying(false);
            }}
            accentGradient={accentGradient}
          />
        </div>
      )}

      {hasChildren && showReplies && (
        <div className="mt-2 space-y-2">
          {children.map((child) => (
            <ReplyItem
              key={child.post.id}
              node={child}
              onReply={onReply}
              onToggleWave={onToggleWave}
              accentGradient={accentGradient}
              depth={depth + 1}
              parentAuthor={post.author}
            />
          ))}
        </div>
      )}
    </div>
  );
}
