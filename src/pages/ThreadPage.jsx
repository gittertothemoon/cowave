import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useAppState } from '../state/AppStateContext.jsx';
import PostComposer from '../components/threads/PostComposer.jsx';
import PostNode from '../components/threads/PostNode.jsx';
import Modal from '../components/ui/Modal.jsx';
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
  const replies = postsByThread[threadId] ?? [];
  const initialPost = thread?.initialPost ?? null;
  const [replyModalPostId, setReplyModalPostId] = useState(null);
  const [collapsedParents, setCollapsedParents] = useState(() => new Set());
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

  function handleNewPost({ content, attachments }) {
    if (!initialPost) return;
    createPost(threadId, {
      content,
      parentId: initialPost.id,
      personaId: thread.personaId,
      attachments,
    });
  }

  function handleCreateInitialPost({ content, attachments }) {
    createPost(threadId, {
      content,
      parentId: null,
      personaId: thread.personaId,
      attachments,
    });
  }

  const personaLabel =
    personas.find((p) => p.id === thread?.personaId)?.label ?? 'Persona attiva';
  const repliesSorted = useMemo(() => {
    const sorted = replies
      .slice()
      .sort((a, b) => {
        const timeA = new Date(a.createdAt).getTime();
        const timeB = new Date(b.createdAt).getTime();
        const safeA = Number.isNaN(timeA) ? 0 : timeA;
        const safeB = Number.isNaN(timeB) ? 0 : timeB;
        return safeB - safeA;
      });
    return sorted;
  }, [replies]);
  const postsById = useMemo(() => {
    const map = new Map();
    if (initialPost) {
      map.set(initialPost.id, initialPost);
    }
    repliesSorted.forEach((post) => {
      map.set(post.id, post);
    });
    return map;
  }, [initialPost, repliesSorted]);
  const repliesByParent = useMemo(() => {
    const map = new Map();
    repliesSorted.forEach((post) => {
      const parentId = post.parentId ?? initialPost?.id ?? null;
      const existing = map.get(parentId) ?? [];
      existing.push(post);
      map.set(parentId, existing);
    });
    return map;
  }, [initialPost?.id, repliesSorted]);
  const repliesCount = replies.length;
  const lastReplyDate =
    replies.length > 0
      ? new Date(
          Math.max(
            ...replies.map((p) => new Date(p.createdAt).getTime())
          )
        )
      : null;
  const lastReplyText = lastReplyDate
    ? formatRelativeTime(lastReplyDate)
    : null;
  const replyModalPost = replyModalPostId
    ? postsById.get(replyModalPostId)
    : null;

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

  function handleReplyTo(postId) {
    setReplyModalPostId(postId);
  }

  function handleModalReply({ content, attachments }) {
    if (!replyModalPostId || !thread) return;
    createPost(threadId, {
      content,
      parentId: replyModalPostId,
      personaId: thread.personaId,
      attachments,
    });
    setReplyModalPostId(null);
  }

  function handleToggleCollapse(postId) {
    setCollapsedParents((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) {
        next.delete(postId);
      } else {
        next.add(postId);
      }
      return next;
    });
  }

  function renderReplies(parentId, depth = 0) {
    const children = repliesByParent.get(parentId) ?? [];
    if (children.length === 0) return null;
    return children.map((post) => {
      const parentAuthor =
        post.parentId && postsById.has(post.parentId)
          ? postsById.get(post.parentId)?.author
          : undefined;
      const hasChildReplies = (repliesByParent.get(post.id) ?? []).length;
      const isNested = depth > 0;
      const wrapperClass = [
        'relative space-y-3',
        isNested ? 'ml-4 pl-4' : '',
      ]
        .filter(Boolean)
        .join(' ');
      const cardClass = isNested
        ? 'rounded-2xl border border-slate-800/60 bg-slate-950/50 p-3'
        : 'rounded-2xl border border-accent/30 bg-slate-900/70 p-3 shadow-[0_10px_30px_rgba(56,189,248,0.08)]';

      return (
        <div key={post.id} className={wrapperClass}>
          {isNested && (
            <span
              aria-hidden="true"
              className="absolute left-1 top-4 bottom-4 w-px bg-gradient-to-b from-accent/60 via-slate-700/80 to-transparent"
            />
          )}
          <div className={cardClass}>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 px-2 py-0.5 bg-white/5 text-[11px] text-slate-300">
                {isNested ? 'Risposta a un commento' : 'Risposta al post iniziale'}
              </span>
              {hasChildReplies ? (
                <span className="text-[10px] text-slate-500">
                  {hasChildReplies} risp.
                </span>
              ) : null}
            </div>
            <PostNode
              post={post}
              parentAuthor={parentAuthor}
              actions={
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className={`${buttonGhostClass} px-3 py-1 text-xs`}
                    onClick={() => handleReplyTo(post.id)}
                  >
                    Rispondi
                  </button>
                  {hasChildReplies ? (
                    <button
                      type="button"
                      className={`${buttonGhostClass} px-3 py-1 text-xs`}
                      onClick={() => handleToggleCollapse(post.id)}
                    >
                      {collapsedParents.has(post.id)
                        ? `Mostra ${hasChildReplies}`
                        : 'Nascondi risposte'}
                    </button>
                  ) : null}
                </div>
              }
              onToggleWave={handleToggleWave}
            />
            {hasChildReplies && !collapsedParents.has(post.id) ? (
              <div className="mt-3 space-y-3">
                {renderReplies(post.id, depth + 1)}
              </div>
            ) : null}
          </div>
        </div>
      );
    });
  }

  return (
    <div className="space-y-5">
      <header
        className={`${cardBaseClass} p-4 sm:p-5 space-y-2 border`}
        style={{ borderColor: `${theme.primary}55` }}
      >
        <p className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/app/rooms/${thread.roomId}`)}
            className={`${buttonGhostClass} px-0 py-0 h-auto text-[11px] text-slate-300`}
          >
            Stanza {threadRoom?.name ?? 'Stanza'}
          </button>
          <span className="text-slate-700">→</span>
          <span className="text-slate-400">Thread</span>
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
        <p className="text-[12px] text-slate-500">
          Qui leggi il thread di questa stanza e puoi rispondere con le tue onde. Per aprire un’altra conversazione torna alla stanza e crea un nuovo thread.
        </p>
      </header>

      <section className="space-y-4">
        {initialPost ? (
          <>
            <div className="space-y-3">
              <PostNode
                post={initialPost}
                label="Post iniziale"
                variant="root"
                onToggleWave={handleToggleWave}
                actions={
                  <button
                    type="button"
                    className={`${buttonGhostClass} px-3 py-1 text-xs`}
                    onClick={handleCopyLink}
                  >
                    Copia link
                  </button>
                }
              />
            </div>

            <div className={`${cardBaseClass} p-4 sm:p-5 space-y-4`}>
              <div className="space-y-1">
                <p className={eyebrowClass}>Risposte al thread</p>
                {repliesCount === 0 ? (
                  <>
                    <p className="text-xs text-slate-500">
                      Nessuna risposta ancora. Inizia tu la conversazione.
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Le risposte più recenti sono in alto.
                    </p>
                  </>
                ) : null}
              </div>

              <PostComposer
                parentId={initialPost.id}
                onSubmit={handleNewPost}
                accentGradient={accentGradient}
                placeholder="Scrivi una risposta a questo thread..."
              />

              {repliesCount > 0 && (
                <div className="space-y-4 pt-1">
                  {renderReplies(initialPost.id)}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={`${cardBaseClass} p-4 sm:p-5 space-y-3`}>
            <p className={eyebrowClass}>Post iniziale</p>
            <p className={bodyTextClass}>
              Nessun post iniziale ancora. Scrivi il primo per avviare la conversazione.
            </p>
            <PostComposer
              parentId={null}
              onSubmit={handleCreateInitialPost}
              accentGradient={accentGradient}
              placeholder="Scrivi il post iniziale per aprire questo thread..."
            />
          </div>
        )}
      </section>

      <Modal
        open={Boolean(replyModalPost)}
        onClose={() => setReplyModalPostId(null)}
        title={
          replyModalPost
            ? `Rispondi a ${replyModalPost.author || 'questo commento'}`
            : 'Rispondi'
        }
      >
        {replyModalPost && (
          <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-3 space-y-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-500">
              Commento
            </p>
            <p className="text-sm text-slate-200 whitespace-pre-wrap">
              {replyModalPost.content}
            </p>
          </div>
        )}
        <PostComposer
          parentId={replyModalPostId ?? undefined}
          onSubmit={handleModalReply}
          accentGradient={accentGradient}
          placeholder={
            replyModalPost
              ? `Rispondi a ${replyModalPost.author || 'questo commento'}...`
              : 'Scrivi la tua risposta...'
          }
        />
      </Modal>
    </div>
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
