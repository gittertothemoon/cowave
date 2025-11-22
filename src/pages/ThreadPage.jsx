import { useParams, useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';
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
  const repliesSorted = useMemo(
    () =>
      replies
        .slice()
        .sort((a, b) => {
          const timeA = new Date(a.createdAt).getTime();
          const timeB = new Date(b.createdAt).getTime();
          const safeA = Number.isNaN(timeA) ? 0 : timeA;
          const safeB = Number.isNaN(timeB) ? 0 : timeB;
          return safeB - safeA;
        }),
    [replies]
  );
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
        <p className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(`/app/rooms/${thread.roomId}`)}
            className={`${buttonGhostClass} px-0 py-0 h-auto text-[11px] text-slate-300`}
          >
            Stanza: {threadRoom?.name ?? 'Stanza'}
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
          In questa pagina puoi leggere e rispondere al thread. Per aprire una nuova conversazione torna alla stanza e crea un nuovo thread.
        </p>
      </header>

      <section className="space-y-4">
        {initialPost ? (
          <>
            <div className="space-y-3">
              <PostNode
                post={initialPost}
                label="POST INIZIALE"
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
                <p className={eyebrowClass}>RISPOSTE AL THREAD</p>
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
                placeholder="Scrivi una risposta per far partire la discussione."
              />

              {repliesCount > 0 && (
                <div className="space-y-4 pt-1">
                  {repliesSorted.map((post) => (
                    <PostNode
                      key={post.id}
                      post={post}
                      parentAuthor={
                        post.parentId
                          ? postsById.get(post.parentId)?.author
                          : undefined
                      }
                      onToggleWave={handleToggleWave}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className={`${cardBaseClass} p-4 sm:p-5 space-y-3`}>
            <p className={eyebrowClass}>POST INIZIALE</p>
            <p className={bodyTextClass}>
              Non c&apos;è ancora un messaggio in questo thread. Scrivi il primo per avviare la conversazione.
            </p>
            <PostComposer
              parentId={null}
              onSubmit={handleCreateInitialPost}
              accentGradient={accentGradient}
              placeholder="Scrivi il messaggio con cui vuoi aprire questa conversazione."
            />
          </div>
        )}
      </section>
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
