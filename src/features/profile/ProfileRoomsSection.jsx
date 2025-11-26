import { Link } from 'react-router-dom';
import {
  bodyTextClass,
  cardBaseClass,
  cardMutedClass,
  sectionTitleClass,
} from '../../components/ui/primitives.js';

function formatRelativeTime(dateLike) {
  const date = dateLike instanceof Date ? dateLike : new Date(dateLike);
  if (!date || Number.isNaN(date.getTime())) return '—';
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

export default function ProfileRoomsSection({ rooms }) {
  return (
    <section className={`${cardBaseClass} p-5 sm:p-6 space-y-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className={sectionTitleClass}>Le tue stanze</p>
          <h3 className="text-lg font-semibold text-white">
            Gli spazi che curi
          </h3>
          <p className={`${bodyTextClass} text-sm`}>
            Le stanze che definiscono cosa vedi nel feed.
          </p>
        </div>
        <Link
          to="/onboarding"
          className="text-sm text-accent hover:text-accentSoft"
        >
          Gestisci stanze →
        </Link>
      </div>

      {rooms.length === 0 ? (
        <p className="text-[13px] text-slate-400">
          Non segui ancora nessuna stanza. Inizia dall’onboarding per
          scegliere i tuoi spazi.
        </p>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-2 md:auto-rows-fr md:overflow-visible md:pb-0">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`${cardMutedClass} min-w-[260px] md:min-w-0 p-4 rounded-2xl space-y-2 border border-slate-800`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-base font-semibold text-white">
                    {room.name}
                  </p>
                  <p className="text-[12px] text-slate-400">
                    {room.tags?.map((tag) => `#${tag}`).join(' ') || room.id}
                  </p>
                </div>
                <Link
                  to={`/rooms/${room.id}`}
                  className="text-[12px] text-accent hover:text-accentSoft"
                >
                  <span className="hidden md:inline">Vai alla stanza ↗</span>
                  <span className="md:hidden">Apri ↗</span>
                </Link>
              </div>
              <p className={`${bodyTextClass} text-sm`}>
                {room.description}
              </p>
              <div className="flex flex-wrap gap-3 text-[12px] text-slate-400">
                <span>
                  Thread partecipati:{' '}
                  <strong className="text-slate-200">
                    {room.participationCount ?? 0}
                  </strong>
                </span>
                <span>
                  Ultima attività:{' '}
                  <strong className="text-slate-200">
                    {room.lastActivity
                      ? formatRelativeTime(room.lastActivity)
                      : '—'}
                  </strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
