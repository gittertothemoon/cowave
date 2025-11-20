import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../state/AppStateContext.jsx';

export default function SessionHeaderCard({ className = '' }) {
  const navigate = useNavigate();
  const { rooms, followedRoomIds } = useAppState();

  const roomsNavTarget = useMemo(() => {
    const followedRooms = followedRoomIds?.length
      ? rooms.filter((room) => followedRoomIds.includes(room.id))
      : rooms;
    return followedRooms[0]?.id ?? rooms[0]?.id ?? 'room-dev';
  }, [rooms, followedRoomIds]);

  const sessionStats = [
    { label: 'Focus', value: '28m', detail: 'ancora 12m' },
    { label: 'Rami attivi', value: '7', detail: '+3 oggi' },
    { label: 'Streak', value: '5 giorni', detail: 'modalità mindful' },
  ];

  return (
    <section
      className={`rounded-2xl border border-slate-800 bg-slate-950/80 p-3 sm:p-4 backdrop-blur ${className}`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-300">
            Sessione mindful attiva
          </p>
          <p className="text-[11px] text-slate-400">
            Focus mode • restano 28 min
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full sm:w-auto">
          <button type="button" className="focus-pill justify-center">
            <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
            Radar
          </button>
          <button
            type="button"
            onClick={() => navigate(`/app/rooms/${roomsNavTarget}`)}
            className="text-[11px] uppercase tracking-[0.2em] px-3 py-1.5 rounded-2xl text-slate-950 font-semibold shadow-glow w-full sm:w-auto text-center"
            style={{
              backgroundImage: 'linear-gradient(120deg, #a78bfa, #38bdf8)',
            }}
          >
            Nuova stanza
          </button>
        </div>
      </div>

      <div className="mt-3 border-t border-white/5 pt-3 grid gap-2 sm:grid-cols-3">
        {sessionStats.map((stat) => (
          <div
            key={stat.label}
            className="px-3 py-1.5 rounded-2xl border border-white/10 text-xs text-slate-300"
          >
            <p className="uppercase tracking-[0.2em] text-[10px] text-slate-500">
              {stat.label}
            </p>
            <p className="text-white font-semibold">{stat.value}</p>
            <p className="text-[10px] text-slate-500">{stat.detail}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
