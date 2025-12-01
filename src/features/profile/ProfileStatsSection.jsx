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

export default function ProfileStatsSection({ stats, activity }) {
  const statItems = [
    { label: 'Thread avviati', value: stats?.threadsStarted ?? 0 },
    { label: 'Risposte inviate', value: stats?.repliesSent ?? 0 },
    { label: 'Onde mandate', value: stats?.wavesSent ?? 0 },
    { label: 'Onde ricevute', value: stats?.wavesReceived ?? 0 },
  ];

  return (
    <section className={`${cardBaseClass} p-5 sm:p-6 space-y-5 sm:space-y-6`}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statItems.map((item) => (
          <div
            key={item.label}
            className={`${cardMutedClass} px-3 py-3 sm:px-4 sm:py-4 rounded-2xl flex flex-col gap-1`}
          >
            <span className="text-[12px] uppercase tracking-[0.16em] text-slate-400">
              {item.label}
            </span>
            <span className="text-xl sm:text-2xl font-semibold text-white">
              {item.value}
            </span>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className={sectionTitleClass}>La tua attività</p>
            <p className={`${bodyTextClass} text-sm text-slate-400`}>
              Ultimi movimenti nelle stanze che segui.
            </p>
          </div>
          <Link
            to="/app/feed"
            className="text-[12px] text-accent hover:text-accentSoft"
          >
            Vai al feed →
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <ActivityList
            title="Ultimi thread avviati"
            items={activity?.threads ?? []}
            emptyCopy="Non hai ancora avviato thread. Aprine uno dal feed."
          />
          <ActivityList
            title="Ultime risposte"
            items={activity?.replies ?? []}
            emptyCopy="Nessuna risposta recente. Partecipa a una discussione."
            isReply
          />
        </div>
      </div>
    </section>
  );
}

function ActivityList({ title, items, emptyCopy, isReply = false }) {
  return (
    <div className={`${cardMutedClass} p-3 sm:p-4 rounded-2xl space-y-3`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className={`${sectionTitleClass} text-base`}>{title}</h3>
        <span className="text-[11px] text-slate-500">
          {items.length}/3 mostrati
        </span>
      </div>
      {items.length === 0 ? (
        <p className="text-[13px] text-slate-400">{emptyCopy}</p>
      ) : (
        <ul className="space-y-3">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-white line-clamp-2">
                  {isReply ? item.threadTitle : item.title}
                </p>
                <span className="text-[12px] text-slate-400">
                  {formatRelativeTime(item.createdAt)}
                </span>
              </div>
              <p className="text-[12px] text-slate-400">
                {item.roomName}
              </p>
              {isReply ? (
                <p className="text-[13px] text-slate-200 line-clamp-2">
                  {item.preview}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
