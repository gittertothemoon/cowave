import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../state/AuthContext.jsx';
import { useAppState } from '../state/AppStateContext.jsx';
import PostComposer from '../components/threads/PostComposer.jsx';
import PostNode from '../components/threads/PostNode.jsx';
import {
  buttonGhostClass,
  buttonPrimaryClass,
  buttonSecondaryClass,
  cardBaseClass,
  eyebrowClass,
  pageTitleClass,
  bodyTextClass,
} from '../components/ui/primitives.js';
import { getCanonicalUrl } from '../lib/url.js';

export default function ThreadPage() {
  const { threadId } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const {
    threads,
    threadsById,
    roomsById,
    commentsByThread,
    commentListsMeta,
    loadThreadById,
    loadCommentsForThread,
    createComment,
    toggleWaveOnComment,
    loadRooms,
    addAttachmentToComment,
    removeAttachmentFromComment,
    deleteComment: softDeleteComment,
    getSignedUrlForAttachment,
  } = useAppState();

  const existingThread = threadsById[threadId] ?? threads.find((t) => t.id === threadId);
  const [isThreadLoading, setIsThreadLoading] = useState(!existingThread);
  const [copyFeedback, setCopyFeedback] = useState('');
  const [replyTarget, setReplyTarget] = useState(null);
  const [composerError, setComposerError] = useState('');
  const [commentActionError, setCommentActionError] = useState('');
  const [deletingCommentId, setDeletingCommentId] = useState('');

  useEffect(() => {
    let isActive = true;
    async function ensureThread() {
      if (existingThread) {
        setIsThreadLoading(false);
        return;
      }
      setIsThreadLoading(true);
      await loadThreadById(threadId);
      if (isActive) {
        setIsThreadLoading(false);
      }
    }
    ensureThread();
    return () => {
      isActive = false;
    };
  }, [existingThread, loadThreadById, threadId]);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  useEffect(() => {
    if (!threadId) return;
    const meta = commentListsMeta[threadId];
    if (!meta || (!meta.loading && (meta.ids?.length ?? 0) === 0)) {
      loadCommentsForThread(threadId, { userId: user?.id ?? null });
    }
  }, [commentListsMeta, loadCommentsForThread, threadId, user?.id]);

  const thread = threadsById[threadId] ?? existingThread ?? null;
  const room = thread?.roomId ? roomsById?.[thread.roomId] : null;
  const comments = commentsByThread[threadId] ?? [];
  const commentsMeta = commentListsMeta[threadId] ?? {};
  const isCommentsLoading =
    commentsMeta.loading && (commentsMeta.ids?.length ?? 0) === 0;
  const commentsError = commentsMeta.error;
  const hasMoreComments = commentsMeta.hasMore;
  const rootPost = thread
    ? {
        id: thread.id,
        author: thread.author || 'Utente',
        createdAt: thread.createdAt,
        content: thread.body,
        waves: thread.waves,
        waveCount: thread.waveCount,
      }
    : null;

  const sortedComments = useMemo(() => {
    return [...comments].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [comments]);

  const repliesByParent = useMemo(() => {
    const map = new Map();
    sortedComments.forEach((comment) => {
      const parentKey = comment.parentCommentId || null;
      const existing = map.get(parentKey) ?? [];
      existing.push(comment);
      map.set(parentKey, existing);
    });
    return map;
  }, [sortedComments]);

  const repliesCount = comments.length;
  const lastReplyDate =
    comments.length > 0
      ? new Date(
          Math.max(
            ...comments.map((p) => new Date(p.createdAt).getTime())
          )
        )
      : null;
  const lastReplyText = lastReplyDate
    ? formatRelativeTime(lastReplyDate)
    : null;

  function handleCopyLink() {
    try {
      if (typeof window === 'undefined') return;
      const shareUrl =
        getCanonicalUrl() ||
        `${window.location.origin}/threads/${threadId}`;
      navigator?.clipboard?.writeText(shareUrl).catch(() => {});
      setCopyFeedback('Link copiato.');
      window.setTimeout(() => setCopyFeedback(''), 1200);
    } catch {
      // best effort
    }
  }

  async function handleSubmitComment({ content, parentId, attachmentFile = null }) {
    setComposerError('');
    setCommentActionError('');
    const authorName =
      profile?.username?.trim() ||
      profile?.display_name?.trim() ||
      user?.email ||
      'Utente';
    const { comment, error } = await createComment({
      threadId,
      body: content,
      parentCommentId: parentId ?? replyTarget?.id ?? null,
      createdBy: user?.id,
      authorName,
    });
    if (error || !comment) {
      setComposerError(
        'Non riesco a pubblicare la risposta. Riprova tra poco.'
      );
      return;
    }
    if (attachmentFile && comment.id) {
      const newCommentId = comment.id;
      const { error: attachmentError, attachment } = await addAttachmentToComment({
        commentId: newCommentId,
        file: attachmentFile,
        userId: user?.id ?? '',
      });
      if (attachmentError) {
        setComposerError(
          attachmentError.message ||
            'Risposta pubblicata, ma non sono riuscito a caricare l’immagine.'
        );
      } else if (attachment) {
        await loadCommentsForThread(threadId, {
          userId: user?.id ?? null,
        });
      }
    }
    setReplyTarget(null);
  }

  async function handleDeleteComment(targetComment) {
    if (!targetComment?.id) return;
    setCommentActionError('');
    const shouldConfirm =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(max-width: 640px)').matches;
    if (shouldConfirm) {
      const confirmed = window.confirm('Eliminare questo commento?');
      if (!confirmed) return;
    }
    setDeletingCommentId(targetComment.id);
    const { success, error } = await softDeleteComment(targetComment.id);
    if (!success || error) {
      setCommentActionError(
        error?.message ||
          'Non riesco a eliminare il commento ora. Riprova.'
      );
    } else if (replyTarget?.id === targetComment.id) {
      setReplyTarget(null);
    }
    setDeletingCommentId('');
  }

  function handleLoadMore() {
    loadCommentsForThread(threadId, {
      cursor: commentsMeta.cursor,
      userId: user?.id ?? null,
    });
  }

  function renderReplies(parentId, depth = 0) {
    const children = repliesByParent.get(parentId) ?? [];
    if (children.length === 0) return null;
    const indentClass = depth >= 1 ? 'md:pl-4 md:ml-2' : '';

    return children.map((comment) => {
      const hasChildren = (repliesByParent.get(comment.id) ?? []).length > 0;
      const canDelete = Boolean(
        comment?.createdBy &&
          user?.id &&
          comment.createdBy === user.id
      );
      const isDeleted = Boolean(comment?.isDeleted);
      const actionButtons = isDeleted ? null : (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`${buttonGhostClass} px-3 py-1 text-xs`}
            onClick={() => setReplyTarget(comment)}
          >
            Rispondi
          </button>
          {canDelete ? (
            <button
              type="button"
              className={`${buttonGhostClass} px-3 py-1 text-xs text-rose-200`}
              onClick={() => handleDeleteComment(comment)}
              disabled={deletingCommentId === comment.id}
            >
              {deletingCommentId === comment.id ? '...' : 'Elimina'}
            </button>
          ) : null}
        </div>
      );
      return (
        <div key={comment.id} className={`space-y-3 ${indentClass}`}>
          <PostNode
            post={comment}
            currentUserId={user?.id ?? null}
            onUploadAttachment={(file) =>
              addAttachmentToComment({
                commentId: comment.id,
                file,
                userId: user?.id ?? '',
              })
            }
            onDeleteAttachment={removeAttachmentFromComment}
            getSignedUrlForAttachment={getSignedUrlForAttachment}
            actions={actionButtons}
            onToggleWave={(postId, waveType) =>
              toggleWaveOnComment({
                threadId,
                commentId: postId,
                waveType,
                userId: user?.id ?? null,
              })
            }
          />
          {hasChildren ? (
            <div className="space-y-3">
              {renderReplies(comment.id, depth + 1)}
            </div>
          ) : null}
        </div>
      );
    });
  }

  if (isThreadLoading && !thread) {
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

  if (!thread && !isThreadLoading) {
    return (
      <div className={`${cardBaseClass} p-4`}>
        <p className="text-sm text-red-200">Thread non trovato.</p>
        <button
          type="button"
          onClick={() => navigate('/rooms')}
          className={`${buttonGhostClass} mt-2 text-sm`}
        >
          Torna alle stanze
        </button>
      </div>
    );
  }

  const roomLink = thread?.roomId
    ? `/rooms/${thread.roomId}`
    : '/rooms';
  const theme = room?.theme ?? {
    primary: '#38bdf8',
    secondary: '#a78bfa',
    glow: 'rgba(59,130,246,0.35)',
  };
  const accentGradient = `linear-gradient(120deg, ${theme.primary}, ${theme.secondary})`;

  return (
    <div className="space-y-5">
      <header
        className={`${cardBaseClass} p-4 sm:p-5 space-y-2 border`}
        style={{ borderColor: `${theme.primary}55` }}
      >
        <p className="text-[11px] text-slate-500 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(roomLink)}
            className={`${buttonGhostClass} px-0 py-0 h-auto text-[11px] text-slate-300`}
          >
            Stanza {room?.name ?? 'sconosciuta'}
          </button>
          <span className="text-slate-700">→</span>
          <span className="text-slate-400">Thread</span>
        </p>
        <h1 className={`${pageTitleClass} mt-1 text-2xl`}>
          {thread.title}
        </h1>
        <p className="text-sm text-slate-400">
          Avviato da {thread.author || 'Utente'} ·{' '}
          {repliesCount === 1
            ? '1 risposta'
            : `${repliesCount} risposte`}
          {lastReplyText ? ` · Ultima risposta ${lastReplyText}` : ''}
        </p>
        <p className="text-[12px] text-slate-500">
          Qui trovi il post iniziale e le risposte più recenti per questo thread.
        </p>
      </header>

      <section className="space-y-4">
        {rootPost ? (
          <>
            <div className="space-y-3">
              <PostNode
                post={rootPost}
                label="Post iniziale"
                variant="root"
                onToggleWave={(postId, waveType) =>
                  toggleWaveOnComment({
                    threadId,
                    commentId: postId,
                    waveType,
                    userId: user?.id ?? null,
                  })
                }
                actions={
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className={`${buttonGhostClass} px-3 py-1 text-xs`}
                      onClick={handleCopyLink}
                    >
                      Copia link
                    </button>
                    {copyFeedback ? (
                      <span className="text-[11px] text-slate-400">
                        {copyFeedback}
                      </span>
                    ) : null}
                  </div>
                }
              />
            </div>

            <div className={`${cardBaseClass} p-4 sm:p-5 space-y-4`}>
              <div className="space-y-1">
                <p className={eyebrowClass}>Risposte al thread</p>
                {repliesCount === 0 ? (
                  <>
                    <p className="text-xs text-slate-500">
                      Nessuna risposta per ora. Inizia tu.
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Le risposte più recenti sono in alto.
                    </p>
                  </>
                ) : null}
              </div>

              {replyTarget ? (
                <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/50 px-3 py-2 text-[12px] text-slate-300">
                  <span>
                    Rispondi a {replyTarget.author || 'questo messaggio'}
                  </span>
                  <button
                    type="button"
                    className={`${buttonGhostClass} text-xs`}
                    onClick={() => setReplyTarget(null)}
                  >
                    Annulla
                  </button>
                </div>
              ) : null}

              <PostComposer
                parentId={replyTarget?.id ?? null}
                onSubmit={handleSubmitComment}
                accentGradient={accentGradient}
                placeholder={
                  replyTarget
                    ? `Rispondi a ${replyTarget.author || 'questo commento'}...`
                    : 'Scrivi una risposta a questo thread...'
                }
              />
              {composerError ? (
                <p className="text-xs text-red-300">{composerError}</p>
              ) : null}
              {commentActionError ? (
                <p className="text-xs text-red-300">{commentActionError}</p>
              ) : null}

              {commentsError ? (
                <div className="rounded-xl border border-red-500/40 bg-red-950/20 p-3 text-sm text-red-200 space-y-2">
                  <p className="font-semibold">
                    Non riesco a caricare le risposte.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        loadCommentsForThread(threadId, {
                          userId: user?.id ?? null,
                        })
                      }
                      className={`${buttonPrimaryClass} text-xs`}
                    >
                      Riprova
                    </button>
                    <span className="text-[11px] text-red-300">
                      Se continua, segnala il problema al team.
                    </span>
                  </div>
                </div>
              ) : null}

              {isCommentsLoading ? (
                <div className="space-y-3" aria-live="polite" role="status">
                  {Array.from({ length: 2 }).map((_, idx) => (
                    <div
                      key={idx}
                      className={`${cardBaseClass} animate-pulse p-4 space-y-2`}
                    >
                      <div className="h-4 w-1/3 rounded-full bg-slate-800/60" />
                      <div className="h-4 w-2/3 rounded-full bg-slate-800/50" />
                      <div className="h-3 w-1/2 rounded-full bg-slate-800/40" />
                    </div>
                  ))}
                </div>
              ) : null}

              {repliesByParent.get(null)?.length ? (
                <div className="space-y-4 pt-1">
                  {renderReplies(null)}
                  {hasMoreComments ? (
                    <button
                      type="button"
                      onClick={handleLoadMore}
                      className={`${buttonSecondaryClass} w-full text-sm`}
                    >
                      Carica altre risposte
                    </button>
                  ) : null}
                </div>
              ) : null}
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
              onSubmit={handleSubmitComment}
              accentGradient={accentGradient}
              placeholder="Scrivi il post iniziale per aprire questo thread..."
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
