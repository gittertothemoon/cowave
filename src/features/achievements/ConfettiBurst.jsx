import { useMemo } from 'react';

const COLORS = [
  'bg-accent',
  'bg-sky-400',
  'bg-purple-400',
  'bg-emerald-400',
  'bg-amber-400',
];

export function ConfettiBurst() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 40 }).map((_, index) => ({
        id: index,
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 0.7}s`,
        duration: `${1.1 + Math.random() * 0.7}s`,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      })),
    []
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className={`pointer-events-none absolute top-0 left-0 h-2 w-1.5 rounded-sm opacity-80 animate-confettiFall ${piece.color}`}
          style={{
            left: piece.left,
            animationDelay: piece.delay,
            animationDuration: piece.duration,
          }}
        />
      ))}
    </div>
  );
}
