import { useId } from 'react';

const wordmarkClass = 'flex items-baseline leading-none text-white select-none';

export default function CoWaveLogo({
  variant = 'full',
  size = 36,
  className = '',
}) {
  const gradientId = useId();
  const icon = (
    <span
      className="relative inline-flex items-center justify-center rounded-2xl border border-white/10 bg-slate-900/90 shadow-[0_14px_30px_rgba(3,7,18,0.6)]"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 64"
        className="relative h-[64%] w-[64%]"
        role="presentation"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <path
          d="M8 40c6-10 12-10 18 0s12 10 18 0 12-10 18 0"
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M12 28c5-8 10-8 15 0s10 8 15 0 10-8 15 0"
          fill="none"
          stroke="#e2e8f0cc"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-50/6 via-white/4 to-white/2" />
    </span>
  );

  const wordmarkContent = (
    <span className="text-lg font-semibold tracking-tight">CoWave</span>
  );

  if (variant === 'icon') {
    return <div className={className}>{icon}</div>;
  }

  if (variant === 'text') {
    return (
      <div className={`${wordmarkClass} ${className}`}>
        {wordmarkContent}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {icon}
      <div className={wordmarkClass}>{wordmarkContent}</div>
    </div>
  );
}
