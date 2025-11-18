import { useId } from 'react';

export default function Logo({ size = 48, withWordmark = false, className = '' }) {
  const gradientId = useId();
  const strokeId = `${gradientId}-stroke`;
  const glowId = `${gradientId}-glow`;

  return (
    <div
      className={`inline-flex items-center gap-3 ${withWordmark ? 'text-left' : ''} ${className}`}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role="img"
        aria-label="CoWave logo mark"
        className="drop-shadow-glow"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="45%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
          <linearGradient id={strokeId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f9fafb" />
            <stop offset="100%" stopColor="#c4b5fd" />
          </linearGradient>
          <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect
          x="4"
          y="4"
          width="56"
          height="56"
          rx="18"
          fill={`url(#${gradientId})`}
          opacity="0.85"
          filter={`url(#${glowId})`}
        />
        <path
          d="M10 40 Q18 28 26 40 T42 40 T58 40"
          fill="none"
          stroke={`url(#${strokeId})`}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M10 30 Q18 18 26 30 T42 30 T58 30"
          fill="none"
          stroke="rgba(250,250,255,0.65)"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      {withWordmark && (
        <div>
          <p className="text-sm font-semibold tracking-[0.22em] uppercase text-white">
            CoWave
          </p>
          <p className="text-[11px] text-slate-400">Onde coerenti, social intenzionale</p>
        </div>
      )}
    </div>
  );
}
