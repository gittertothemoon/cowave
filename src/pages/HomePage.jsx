import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThreadCard from '../components/threads/ThreadCard.jsx';
import { useAppState } from '../state/AppStateContext.jsx';
import CreateRoomModal from '../components/rooms/CreateRoomModal.jsx';
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  cardBaseClass,
  cardAccentClass,
  eyebrowClass,
  pageTitleClass,
  bodyTextClass,
} from '../components/ui/primitives.js';
import { computeRoomStats } from '../utils/roomStats.js';

export default function HomePage() {
  const navigate = useNavigate();
  const {
    threads,
    followedRoomIds,
    rooms,
    postsByThread,
    justFinishedOnboarding,
    setJustFinishedOnboarding,
  } = useAppState();
  const [showWelcome, setShowWelcome] = useState(justFinishedOnboarding);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const feedRef = useRef(null);
  const [feedError] = useState(null);
  const [isFeedLoading] = useState(false);
  const roomStats = useMemo(
    () => computeRoomStats(rooms, threads, postsByThread),
    [rooms, threads, postsByThread]
  );
  const featuredRooms = useMemo(() => {
    const score = (roomId) => {
      const stats = roomStats[roomId] ?? {};
      return (stats.repliesLast24h ?? 0) * 5 + (stats.repliesCount ?? 0);
    };
    return [...rooms]
      .sort((a, b) => score(b.id) - score(a.id))
      .slice(0, 6);
  }, [roomStats, rooms]);

  const visibleThreads = useMemo(() => {
    if (!followedRoomIds.length) return [];
    return threads.filter((thread) => followedRoomIds.includes(thread.roomId));
  }, [threads, followedRoomIds]);

  useEffect(() => {
    if (justFinishedOnboarding) {
      setShowWelcome(true);
      setJustFinishedOnboarding(false);
    }
  }, [justFinishedOnboarding, setJustFinishedOnboarding]);

  const nextRoomId = followedRoomIds?.[0] ?? rooms?.[0]?.id ?? null;

  function scrollToFeed() {
    feedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleStartThread() {
    if (nextRoomId) {
      navigate(`/app/rooms/${nextRoomId}`, {
        state: { highlightCreateThread: true },
      });
    } else {
      setIsCreateRoomOpen(true);
    }
  }

  function goToRooms() {
    if (nextRoomId) {
      navigate(`/app/rooms/${nextRoomId}`);
    } else {
      setIsCreateRoomOpen(true);
    }
  }

  function dismissWelcome() {
    setShowWelcome(false);
    setJustFinishedOnboarding(false);
  }

  return (
    <div className="space-y-5">
      {showWelcome && (
        <section className={`${cardAccentClass} p-4 sm:p-5 space-y-3`}>
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-sky-100">
                Nuova sessione
              </p>
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                Benvenuto su CoWave
              </h2>
              <p className="text-sm text-slate-100">
                Hai selezionato stanze e persona: pronto a iniziare?
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-[11px] text-slate-100 rounded-full border border-white/30 px-3 py-1 bg-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
              sessione pronta
            </span>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 text-sm text-slate-100">
            <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
              <p className="font-semibold">Feed curato</p>
              <p className="text-[12px] text-slate-200">
                Thread solo dalle stanze che segui.
              </p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
              <p className="font-semibold">Sidebar pronta</p>
              <p className="text-[12px] text-slate-200">
                Stanze scelte, ordinale come preferisci.
              </p>
            </div>
            <div className="rounded-xl bg-white/5 border border-white/10 px-3 py-2">
              <p className="font-semibold">Primo thread</p>
              <p className="text-[12px] text-slate-200">
                Apri uno spunto per far partire la stanza.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={scrollToFeed}
              className={`${buttonPrimaryClass} text-sm shadow-[0_12px_30px_rgba(56,189,248,0.25)] flex items-center gap-2 transition-transform hover:-translate-y-0.5`}
            >
              <span>Vai al feed</span>
              <span className="text-xs">↗</span>
            </button>
            <button
              type="button"
              onClick={goToRooms}
              className={`${buttonSecondaryClass} text-sm flex items-center gap-2 transition-transform hover:-translate-y-0.5 hover:shadow-soft`}
            >
              <span className="text-xs">●</span>
              <span>Vai alle tue stanze</span>
            </button>
            <button
              type="button"
              onClick={dismissWelcome}
              className="inline-flex items-center text-[11px] text-slate-200 hover:text-white hover:underline underline-offset-4 px-2 py-1 transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Nascondi messaggio
            </button>
          </div>
        </section>
      )}

      <section className={`${cardBaseClass} p-4 sm:p-5`}>
        <p className={`${eyebrowClass} text-[10px] sm:text-[11px]`}>Home</p>
        <h1 className={`${pageTitleClass} mt-1 text-lg sm:text-xl`}>
          Il feed delle tue stanze
        </h1>
        <p className={`${bodyTextClass} mt-1`}>
          Vedi i thread dalle stanze che segui e apri solo i rami che ti interessano.
        </p>
      </section>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <button
          type="button"
          onClick={() => setIsCreateRoomOpen(true)}
          className={`${buttonPrimaryClass} w-full sm:w-auto sm:ml-auto text-white shadow-[0_18px_38px_rgba(56,189,248,0.28)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(56,189,248,0.35)]`}
        >
          <span className="text-lg leading-none">＋</span>
          Crea stanza
        </button>
        <p className="text-[11px] text-slate-500">
        Vuoi controllare meglio il feed?{' '}
        <Link
          to="/app/settings/esperienza"
          className="text-sky-400 hover:text-sky-300 underline"
        >
          Vai agli strumenti avanzati
        </Link>
        .
      </p>
    </div>

      <section className={`${cardBaseClass} p-4 sm:p-5 space-y-3`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={eyebrowClass}>Stanze vive</p>
            <p className={`${bodyTextClass} text-sm`}>
              Più scelta per iniziare: numeri reali da thread e risposte di oggi.
            </p>
          </div>
          <span className="text-[11px] text-slate-500">
            {rooms.length} stanze curate
          </span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {featuredRooms.map((room) => {
            const stats = roomStats[room.id] ?? {
              threadCount: 0,
              repliesCount: 0,
              repliesLast24h: 0,
            };
            const isFollowed = followedRoomIds.includes(room.id);
            return (
              <Link
                key={room.id}
                to={`/app/rooms/${room.id}`}
                className="rounded-2xl border border-white/10 bg-slate-950/70 p-4 hover:border-accent/50 hover:-translate-y-0.5 transition transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500/70 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                aria-label={`Apri la stanza ${room.name}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-white">
                      {room.name}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {room.description}
                    </p>
                  </div>
                  <span
                    className={`text-[11px] uppercase tracking-[0.18em] px-2 py-1 rounded-full ${
                      isFollowed
                        ? 'bg-accent/90 text-slate-950'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {isFollowed ? 'Seguita' : 'Suggerita'}
                  </span>
                </div>
                <p className="text-[12px] text-slate-200 mt-2">
                  {stats.threadCount} thread · {stats.repliesCount} risposte{' '}
                  {stats.repliesLast24h
                    ? `(oggi ${stats.repliesLast24h})`
                    : ''}
                </p>
                <div className="flex flex-wrap gap-1 mt-2 text-[10px] text-slate-400">
                  {room.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={`${room.id}-${tag}`}
                      className="rounded-full border border-white/10 px-2 py-1"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="space-y-3" ref={feedRef}>
        {feedError ? (
          <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-950/20 p-4 text-sm text-red-100">
            <p className="font-medium">
              Si è verificato un problema nel caricamento dei contenuti.
            </p>
            <p className="mt-1 text-xs text-red-200">
              Riprova a ricaricare la pagina. Se il problema persiste, segnalalo nella stanza “Feedback CoWave”.
            </p>
          </div>
        ) : isFeedLoading ? (
          <div className="space-y-3" aria-live="polite" role="status">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={idx}
                className={`${cardBaseClass} animate-pulse p-4 sm:p-5 space-y-3`}
              >
                <div className="h-3 w-32 rounded-full bg-slate-800/60" />
                <div className="h-5 w-3/4 rounded-full bg-slate-800/60" />
                <div className="h-4 w-full rounded-full bg-slate-800/50" />
                <div className="flex gap-2">
                  <span className="h-6 w-24 rounded-full bg-slate-800/50" />
                  <span className="h-6 w-28 rounded-full bg-slate-800/40" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleThreads.length === 0 ? (
          <div className={`${cardBaseClass} p-4 text-sm text-slate-300`}>
            <p className="font-medium text-slate-100">
              Nessun thread nel tuo feed
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Inizia creando il tuo primo thread o esplora nuove stanze.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleStartThread}
                className={`${buttonPrimaryClass} text-sm`}
              >
                Crea thread
              </button>
              <button
                type="button"
                onClick={goToRooms}
                className={`${buttonSecondaryClass} text-sm`}
              >
                Vai alle stanze
              </button>
            </div>
          </div>
        ) : (
          visibleThreads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))
        )}
      </div>

      <CreateRoomModal
        open={isCreateRoomOpen}
        onClose={() => setIsCreateRoomOpen(false)}
      />
    </div>
  );
}
