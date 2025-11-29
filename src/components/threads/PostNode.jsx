import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_ATTACHMENT_BYTES,
  validateAttachmentFile,
} from '../../data/commentAttachments';
import {
  cardBaseClass,
  bodyTextClass,
} from '../ui/primitives.js';

const waveOptions = [
  {
    type: 'support',
    label: 'Supporto',
    description: 'Sono con te o ti capisco',
  },
  {
    type: 'insight',
    label: 'Insight',
    description: 'Mi ha aiutato o fatto pensare',
  },
  {
    type: 'question',
    label: 'Domanda',
    description: 'Vorrei saperne di più',
  },
];

const emptyWaves = { support: 0, insight: 0, question: 0 };

export default function PostNode({
  post,
  label,
  parentAuthor,
  actions,
  onToggleWave,
  variant = 'reply',
  currentUserId = null,
  onUploadAttachment,
  onDeleteAttachment,
  getSignedUrlForAttachment,
}) {
  const [waveError, setWaveError] = useState('');
  const [pendingWaveType, setPendingWaveType] = useState('');
  const [attachmentError, setAttachmentError] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState('');
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [attachmentUrls, setAttachmentUrls] = useState({});
  const [openLightboxId, setOpenLightboxId] = useState(null);
  const [deletingAttachmentId, setDeletingAttachmentId] = useState('');
  const fileInputRef = useRef(null);
  const lightboxCloseRef = useRef(null);
  const previousFocusRef = useRef(null);
  const createdAt = new Date(post.createdAt);
  const formattedDate = createdAt.toLocaleString();
  const isoCreatedAt = createdAt.toISOString();
  const initials = (post.author?.[0] ?? 'U').toUpperCase();
  const waves = useMemo(
    () => normalizeWaveShape(post?.waves),
    [post?.waves, post?.id]
  );
  const totalWaves = waves.support + waves.insight + waves.question;
  const waveSummaryParts = useMemo(
    () => buildWaveSummary(waves),
    [waves.support, waves.insight, waves.question]
  );
  const myWaves = useMemo(
    () => (Array.isArray(post?.myWaves) ? post.myWaves : []),
    [post?.myWaves, post?.id]
  );
  const isRoot = variant === 'root';
  const containerClass = [
    cardBaseClass,
    'p-3 sm:p-4 space-y-3',
    isRoot
      ? 'border-accent/60 bg-slate-900/80 shadow-[0_20px_60px_rgba(59,130,246,0.12)]'
      : 'border-slate-800/80 bg-slate-950/60',
  ].join(' ');
  const labelClassName = [
    'inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold',
    isRoot
      ? 'border border-accent/50 bg-accent/15 text-accent'
      : 'border border-slate-700 bg-slate-900/70 text-slate-300',
  ].join(' ');
  const attachments = Array.isArray(post.attachments) ? post.attachments : [];
  const hasThreadContext = Boolean(post?.threadId);
  const isOwner =
    hasThreadContext &&
    Boolean(currentUserId) &&
    Boolean(post?.createdBy) &&
    post.createdBy === currentUserId;
  const canAttach = Boolean(isOwner && onUploadAttachment);
  const showAttachmentAction = Boolean(canAttach);
  const allowedTypesLabel = useMemo(
    () =>
      ALLOWED_IMAGE_TYPES.map(
        (type) => type?.split('/')?.[1]?.toUpperCase?.() || type
      ).join(', '),
    []
  );

  async function handleWaveToggle(type) {
    if (!type || !hasThreadContext || !onToggleWave) return;
    if (pendingWaveType) return;
    setWaveError('');
    setPendingWaveType(type);
    try {
      const result = (await onToggleWave(post.id, type)) ?? {};
      if (result.error) {
        setWaveError(
          result.error?.message ||
            'Non riesco a salvare questa onda. Riprova tra poco.'
        );
      }
    } catch (err) {
      setWaveError(
        err?.message ||
          'Connessione instabile: non ho registrato l’onda.'
      );
    } finally {
      setPendingWaveType('');
    }
  }

  useEffect(() => {
    return () => {
      if (pendingPreviewUrl) {
        URL.revokeObjectURL(pendingPreviewUrl);
      }
    };
  }, [pendingPreviewUrl]);

  useEffect(() => {
    let isActive = true;
    async function hydrateSignedUrls() {
      if (!attachments.length) {
        setAttachmentUrls({});
        return;
      }
      if (!getSignedUrlForAttachment) return;
      const next = {};
      for (const attachment of attachments) {
        const { url } = await getSignedUrlForAttachment(attachment);
        if (url) {
          next[attachment.id] = url;
        }
      }
      if (!isActive) return;
      setAttachmentUrls((prev) => {
        const merged = {};
        attachments.forEach((attachment) => {
          if (next[attachment.id]) {
            merged[attachment.id] = next[attachment.id];
          } else if (prev[attachment.id]) {
            merged[attachment.id] = prev[attachment.id];
          }
        });
        return merged;
      });
    }
    hydrateSignedUrls();
    return () => {
      isActive = false;
    };
  }, [attachments, getSignedUrlForAttachment]);

  useEffect(() => {
    if (!openLightboxId) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setOpenLightboxId(null);
      }
    };
    previousFocusRef.current = document?.activeElement ?? null;
    document.addEventListener('keydown', handleKeyDown);
    lightboxCloseRef.current?.focus({ preventScroll: true });
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
        previousFocusRef.current.focus();
      }
    };
  }, [openLightboxId]);

  function handleAttachmentButton() {
    setAttachmentError('');
    fileInputRef.current?.click();
  }

  function clearPendingAttachment() {
    if (pendingPreviewUrl) {
      URL.revokeObjectURL(pendingPreviewUrl);
    }
    setPendingFile(null);
    setPendingPreviewUrl('');
  }

  function handleAttachmentChange(event) {
    const file = event.target.files?.[0];
    if (!file) {
      clearPendingAttachment();
      return;
    }
    const validation = validateAttachmentFile(file);
    if (!validation.ok) {
      clearPendingAttachment();
      setAttachmentError(validation.reason);
      return;
    }
    if (pendingPreviewUrl) {
      URL.revokeObjectURL(pendingPreviewUrl);
    }
    setPendingFile(file);
    setPendingPreviewUrl(URL.createObjectURL(file));
    setAttachmentError('');
  }

  async function handleAttachmentUpload() {
    if (!pendingFile || !onUploadAttachment || isUploadingAttachment) return;
    setIsUploadingAttachment(true);
    const { attachment, error } = await onUploadAttachment(pendingFile);
    if (error || !attachment) {
      setAttachmentError(
        error?.message ||
          'Non riesco a caricare la foto adesso. Riprova tra poco.'
      );
      setIsUploadingAttachment(false);
      return;
    }
    clearPendingAttachment();
    setAttachmentError('');
    setIsUploadingAttachment(false);
  }

  async function handleDeleteAttachmentClick(attachment) {
    if (!onDeleteAttachment || !attachment) return;
    const shouldConfirm =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(max-width: 640px)').matches;
    if (shouldConfirm) {
      const confirmed = window.confirm('Rimuovere foto?');
      if (!confirmed) return;
    }
    setDeletingAttachmentId(attachment.id);
    const { error } = await onDeleteAttachment(attachment);
    if (error) {
      setAttachmentError(
        error.message || 'Non sono riuscito a rimuovere la foto.'
      );
    }
    setDeletingAttachmentId('');
  }

  async function handleOpenLightbox(attachmentId) {
    setOpenLightboxId(attachmentId);
    const target = attachments.find((att) => att.id === attachmentId);
    if (!target || !getSignedUrlForAttachment) return;
    const { url } = await getSignedUrlForAttachment(target);
    if (url) {
      setAttachmentUrls((prev) => ({ ...prev, [attachmentId]: url }));
    }
  }

  function closeLightbox() {
    setOpenLightboxId(null);
  }

  return (
    <article className={containerClass}>
      {label && (
        <span className={labelClassName}>
          {label}
        </span>
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
        {post.content || post.body}
      </p>

      {hasThreadContext ? (
        <div className="space-y-2">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={handleAttachmentChange}
          />

          {attachments.length > 0 ? (
            <AttachmentGrid
              attachments={attachments}
              attachmentUrls={attachmentUrls}
              onOpen={handleOpenLightbox}
              onDelete={handleDeleteAttachmentClick}
              canDelete={isOwner}
              deletingAttachmentId={deletingAttachmentId}
            />
          ) : null}

          {canAttach && attachments.length === 0 ? (
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 px-3 py-2 text-[12px] text-slate-400">
              Nessuna foto allegata qui. Aggiungine una per dare più colore alla risposta.
            </div>
          ) : null}

          {pendingPreviewUrl ? (
            <AttachmentUploadPreview
              previewUrl={pendingPreviewUrl}
              fileName={pendingFile?.name}
              fileSize={pendingFile?.size}
              isUploading={isUploadingAttachment}
              allowedTypesLabel={allowedTypesLabel}
              onCancel={clearPendingAttachment}
              onConfirm={handleAttachmentUpload}
            />
          ) : null}

          {attachmentError ? (
            <p className="text-[11px] text-amber-200">
              {attachmentError}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="pt-1 space-y-3">
        {hasThreadContext ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-3 py-3">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-[12px] font-semibold text-slate-100">
                  Onde
                </p>
                <p className="text-[11px] text-slate-400">
                  Sostieni, condividi un insight o fai una domanda.
                </p>
              </div>
              <span className="rounded-full bg-slate-800/70 px-2 py-1 text-[11px] font-semibold text-slate-200">
                {totalWaves === 1 ? '1 onda' : `${totalWaves} onde`}
              </span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {waveOptions.map((option) => {
                const isActive = myWaves.includes(option.type);
                const isPending = pendingWaveType === option.type;
                const count = Number.isFinite(waves[option.type])
                  ? waves[option.type]
                  : 0;
                return (
                  <button
                    key={option.type}
                    type="button"
                    className={`group flex min-h-[44px] flex-1 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-60 ${
                      isActive
                        ? 'border-sky-400/70 bg-sky-900/60 text-white shadow-[0_10px_30px_rgba(56,189,248,0.18)]'
                        : 'border-slate-800 bg-slate-950/70 text-slate-200 hover:border-sky-400/50'
                    }`}
                    aria-pressed={isActive}
                    aria-label={`${option.label}: ${option.description}`}
                    onClick={() => handleWaveToggle(option.type)}
                    disabled={Boolean(pendingWaveType)}
                  >
                    <WaveTypeDot type={option.type} />
                    <div className="flex flex-1 flex-col">
                      <span className="text-[13px] font-semibold text-slate-100">
                        {option.label}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {option.description}
                      </span>
                    </div>
                    <span className="rounded-full border border-slate-700 bg-slate-900/70 px-2 py-1 text-[11px] font-semibold text-slate-100">
                      {isPending ? '...' : count}
                    </span>
                  </button>
                );
              })}
            </div>
            {waveError ? (
              <p className="pt-2 text-[11px] text-amber-200">
                {waveError}
              </p>
            ) : null}
          </div>
        ) : null}

        {showAttachmentAction || actions ? (
          <div className="flex flex-wrap items-center gap-2">
            {showAttachmentAction ? (
              <button
                type="button"
                onClick={handleAttachmentButton}
                disabled={isUploadingAttachment}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-1.5 text-[12px] font-semibold text-slate-200 hover:border-accent/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span aria-hidden="true">📎</span>
                <span>{isUploadingAttachment ? 'Carico...' : 'Allega foto'}</span>
              </button>
            ) : null}
            {actions}
          </div>
        ) : null}

        {totalWaves > 0 ? (
          <WaveSummary waves={waves} parts={waveSummaryParts} total={totalWaves} />
        ) : null}
      </div>

      {openLightboxId ? (
        <AttachmentLightbox
          attachment={attachments.find((att) => att.id === openLightboxId)}
          url={attachmentUrls[openLightboxId]}
          onClose={closeLightbox}
          closeRef={lightboxCloseRef}
        />
      ) : null}
    </article>
  );
}

function AttachmentGrid({
  attachments,
  attachmentUrls,
  onOpen,
  onDelete,
  canDelete,
  deletingAttachmentId,
}) {
  if (!attachments?.length) return null;
  return (
    <div className="flex flex-wrap gap-2" aria-label="Foto allegate">
      {attachments.map((attachment) => {
        const url = attachmentUrls?.[attachment.id];
        return (
          <div
            key={attachment.id}
            className="group relative"
          >
            <button
              type="button"
              onClick={() => onOpen?.(attachment.id)}
              className="relative h-20 w-20 rounded-xl border border-slate-800 bg-slate-950/70 p-0.5 sm:h-24 sm:w-24 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
            >
              {url ? (
                <img
                  src={url}
                  alt="Apri immagine allegata"
                  className="h-full w-full rounded-[10px] object-cover"
                />
              ) : (
                <span className="flex h-full items-center justify-center rounded-[10px] bg-slate-900/80 text-[11px] text-slate-400">
                  Link sicuro in preparazione…
                </span>
              )}
            </button>
            {canDelete ? (
              <button
                type="button"
                onClick={() => onDelete?.(attachment)}
                disabled={deletingAttachmentId === attachment.id}
                className="absolute -right-1 -top-1 rounded-full border border-slate-800 bg-slate-900/90 px-2 py-0.5 text-[11px] font-semibold text-slate-200 opacity-0 shadow-lg transition group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deletingAttachmentId === attachment.id ? '...' : 'Rimuovi'}
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function AttachmentUploadPreview({
  previewUrl,
  fileName,
  fileSize,
  isUploading,
  allowedTypesLabel = 'JPG, PNG, WEBP o GIF',
  onCancel,
  onConfirm,
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-3">
      <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-slate-800">
        <img
          src={previewUrl}
          alt={fileName || 'Anteprima immagine'}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 text-[12px]">
        <p className="font-semibold text-slate-100 line-clamp-2">
          {fileName || 'Immagine allegata'}
        </p>
        <p className="text-[11px] text-slate-400">
          {formatBytes(fileSize)} · {allowedTypesLabel} · max {Math.round(MAX_ATTACHMENT_BYTES / (1024 * 1024))} MB
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isUploading}
            className="rounded-xl bg-accent/80 px-3 py-1.5 text-[12px] font-semibold text-slate-950 shadow-lg shadow-accent/20 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading ? 'Carico...' : 'Carica adesso'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isUploading}
            className="rounded-xl border border-slate-700 px-3 py-1.5 text-[12px] font-semibold text-slate-200 hover:border-accent/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Annulla
          </button>
        </div>
      </div>
    </div>
  );
}

function AttachmentLightbox({ attachment, url, onClose, closeRef }) {
  if (!attachment) return null;
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose?.();
    }
  };
  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Foto allegata"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl">
        <button
          type="button"
          ref={closeRef}
          onClick={onClose}
          className="absolute right-0 top-0 rounded-full border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-[12px] font-semibold text-slate-100 shadow-lg hover:border-accent/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
        >
          Chiudi
        </button>
        <div className="mt-10 flex max-h-[70vh] items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-2">
          {url ? (
            <img
              src={url}
              alt="Foto allegata"
              className="max-h-[66vh] w-full object-contain"
            />
          ) : (
            <p className="text-sm text-slate-200">
              Sto recuperando il link sicuro...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function formatBytes(value) {
  if (!Number.isFinite(value)) return '';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function WaveSummary({ parts, total, waves }) {
  const decorated = buildWaveChips(waves);

  return (
    <div className="flex flex-wrap items-center gap-2 text-[12px] text-slate-300">
      <span className="px-2 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[11px] font-semibold">
        {total === 1 ? '1 onda' : `${total} onde`}
      </span>
      {decorated.map((chip) => (
        <span
          key={chip.type}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-800 bg-slate-900/60"
        >
          <WaveTypeDot type={chip.type} size="sm" />
          <span className="font-semibold text-[11px] text-slate-200">
            {chip.label}
          </span>
        </span>
      ))}
      <p className="text-[12px] text-slate-400">
        {parts.join(' · ')}
      </p>
    </div>
  );
}

function buildWaveSummary(waves) {
  const pieces = [];
  if (waves.support > 0) {
    pieces.push(formatWaveLabel(waves.support, 'onda di supporto'));
  }
  if (waves.insight > 0) {
    pieces.push(formatWaveLabel(waves.insight, 'onda di insight'));
  }
  if (waves.question > 0) {
    pieces.push(formatWaveLabel(waves.question, 'onda di domanda'));
  }
  return pieces;
}

function formatWaveLabel(count, label) {
  return count === 1 ? `1 ${label}` : `${count} ${label.replace('onda', 'onde')}`;
}

function buildWaveChips(waves) {
  const map = {
    support: { label: 'Supporto' },
    insight: { label: 'Insight' },
    question: { label: 'Domanda' },
  };
  return Object.entries(waves ?? {})
    .filter(([, value]) => Number.isFinite(value) && value > 0)
    .map(([type, value]) => ({
      type,
      label: `${value} ${map[type]?.label ?? 'Onda'}`,
    }));
}

function WaveTypeDot({ type, size = 'md' }) {
  const palette = {
    support: 'from-emerald-400/80 to-emerald-500/80',
    insight: 'from-sky-400/80 to-indigo-500/80',
    question: 'from-amber-400/80 to-orange-500/80',
  };
  const dimensions = size === 'sm' ? 'h-5 w-5 text-[10px]' : 'h-6 w-6 text-[11px]';
  const iconSize = size === 'sm' ? 12 : 14;

  function renderGlyph() {
    if (type === 'support') {
      return (
        <svg
          viewBox="0 0 24 24"
          width={iconSize}
          height={iconSize}
          className="text-slate-950"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M7 10.5c0-1.6 1.2-2.9 2.8-2.9 1.4 0 2.5 1 2.7 2.4" />
          <path d="M17 13.5c0 1.6-1.2 2.9-2.8 2.9-1.4 0-2.5-1-2.7-2.4" />
          <path d="M9.2 13.4 8 15m5.6-4.8 2.4-1.7" />
        </svg>
      );
    }
    if (type === 'insight') {
      return (
        <svg
          viewBox="0 0 24 24"
          width={iconSize}
          height={iconSize}
          className="text-slate-950"
          fill="currentColor"
        >
          <path d="M12 4.2 14.8 8l4.2 1.6-4.2 1.6L12 15l-2.8-3.8L5 9.6 9.2 8z" />
          <circle cx="12" cy="12" r="1.6" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      );
    }
    if (type === 'question') {
      return (
        <svg
          viewBox="0 0 24 24"
          width={iconSize}
          height={iconSize}
          className="text-slate-950"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <path d="M10 8.4c.6-1 1.9-1.5 3-1.1 1.6.5 2 2.3 1.1 3.4-.6.7-1.6 1-2.1 1.8-.3.5-.4 1-.4 1.7" />
          <circle cx="12.1" cy="17.6" r="1" fill="currentColor" />
        </svg>
      );
    }
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className={`flex items-center justify-center rounded-full bg-gradient-to-br ${palette[type] ?? 'from-slate-600 to-slate-500'} text-slate-950 font-extrabold ${dimensions} shadow-[0_6px_18px_rgba(0,0,0,0.25)]`}
    >
      {renderGlyph()}
    </span>
  );
}

function normalizeWaveShape(waves) {
  if (!waves || typeof waves !== 'object') return { ...emptyWaves };
  return {
    support:
      Number.isFinite(waves.support) && waves.support > 0 ? waves.support : 0,
    insight:
      Number.isFinite(waves.insight) && waves.insight > 0 ? waves.insight : 0,
    question:
      Number.isFinite(waves.question) && waves.question > 0
        ? waves.question
        : 0,
  };
}
