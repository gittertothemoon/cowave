import { useMemo, useState } from 'react';
import {
  cardBaseClass,
  cardMutedClass,
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
  onSendWave,
  variant = 'reply',
}) {
  const [isWaveMenuOpen, setIsWaveMenuOpen] = useState(false);
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
  const waveButtonClass = [
    'inline-flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[13px] font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/60',
    isWaveMenuOpen
      ? 'border-accent/60 text-white bg-slate-900/90 shadow-[0_10px_30px_rgba(56,189,248,0.18)]'
      : 'border-slate-800 bg-slate-900/70 text-slate-200 hover:border-accent/60 hover:text-white',
  ].join(' ');

  function handleWaveSelect(type) {
    if (!type) return;
    onSendWave?.(post.id, type);
    setIsWaveMenuOpen(false);
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
        {post.content}
      </p>

      {post.attachments?.length > 0 && (
        <AttachmentPreview attachments={post.attachments} />
      )}

      <div className="pt-1 space-y-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2 sm:space-y-1">
            <button
              type="button"
              className={waveButtonClass}
              onClick={() => setIsWaveMenuOpen((open) => !open)}
              aria-expanded={isWaveMenuOpen}
            >
              <WaveIcon active={isWaveMenuOpen} />
              <span>Manda un’onda</span>
            </button>
            {isWaveMenuOpen ? (
              <div className={`${cardMutedClass} border border-slate-800 px-3 py-2 rounded-2xl space-y-2`}>
                <p className="text-[12px] font-semibold text-slate-200">
                  Scegli il tipo di onda
                </p>
                <div className="flex flex-wrap gap-2">
                  {waveOptions.map((option) => (
                  <button
                    key={option.type}
                    type="button"
                    className="group flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950/70 px-3 py-2 text-left hover:border-accent/60 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60"
                    onClick={() => handleWaveSelect(option.type)}
                  >
                    <WaveTypeDot type={option.type} />
                    <div>
                      <p className="text-[13px] font-semibold text-slate-100">
                        {option.label}
                      </p>
                      <p className="text-[11px] text-slate-400">
                          {option.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          {actions ? (
            <div className="flex flex-wrap items-center gap-2">
              {actions}
            </div>
          ) : null}
        </div>

        {totalWaves > 0 ? (
          <WaveSummary waves={waves} parts={waveSummaryParts} total={totalWaves} />
        ) : null}
      </div>
    </article>
  );
}

function AttachmentPreview({ attachments }) {
  const imageAttachment = attachments.find(
    (attachment) => attachment?.type === 'image'
  );

  if (!imageAttachment) return null;

  return (
    <div className="mt-1 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/60">
      <img
        src={imageAttachment.url}
        alt={imageAttachment.name || 'Immagine allegata'}
        className="aspect-video w-full object-cover"
      />
    </div>
  );
}

function WaveIcon({ active = false }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path
        className={active ? 'text-sky-300' : 'text-slate-300'}
        d="M3 14c1.7-3 3.3-3 5 0s3.3 3 5 0 3.3-3 5 0"
      />
      <path
        className={active ? 'text-sky-200' : 'text-slate-500'}
        d="M4.5 9c1.2-2.2 2.4-2.2 3.6 0s2.4 2.2 3.6 0 2.4-2.2 3.6 0"
      />
    </svg>
  );
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
