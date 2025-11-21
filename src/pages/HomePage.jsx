import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ThreadCard from '../components/threads/ThreadCard.jsx';
import { useAppState } from '../state/AppStateContext.jsx';
import CreateRoomModal from '../components/rooms/CreateRoomModal.jsx';
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  buttonGhostClass,
  cardBaseClass,
  cardAccentClass,
  eyebrowClass,
  pageTitleClass,
  bodyTextClass,
} from '../components/ui/primitives.js';

export default function HomePage() {
  const navigate = useNavigate();
  const {
    threads,
    followedRoomIds,
    rooms,
    justFinishedOnboarding,
    setJustFinishedOnboarding,
  } = useAppState();
  const [showWelcome, setShowWelcome] = useState(justFinishedOnboarding);
  const [isCreateRoomOpen, setIsCreateRoomOpen] = useState(false);
  const feedRef = useRef(null);

  const visibleThreads = useMemo(() => {
    if (!followedRoomIds.length) return threads;
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
        <section className={`${cardAccentClass} mb-2 p-4 sm:p-6 space-y-3`}>
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
              className={`${buttonPrimaryClass} rounded-xl px-4 py-2 text-sm shadow-[0_12px_30px_rgba(56,189,248,0.25)] flex items-center gap-2 transition-transform hover:-translate-y-0.5`}
            >
              <span>Vai al feed</span>
              <span className="text-xs">↗</span>
            </button>
            <button
              type="button"
              onClick={goToRooms}
              className={`${buttonSecondaryClass} rounded-xl px-4 py-2 text-sm border-white/20 bg-white/5 text-slate-100 hover:border-accent/60 hover:text-white flex items-center gap-2 transition-transform hover:-translate-y-0.5 hover:shadow-soft`}
            >
              <span className="text-xs">●</span>
              <span>Vai alle tue stanze</span>
            </button>
            <button
              type="button"
              onClick={dismissWelcome}
              className="inline-flex items-center text-[11px] text-slate-200 hover:text-white hover:underline underline-offset-4 px-2 py-1 transition-colors"
            >
              Nascondi messaggio
            </button>
          </div>
        </section>
      )}

      <section className={`${cardBaseClass} mb-4 p-4 sm:p-5`}>
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
          className={`${buttonPrimaryClass} w-full sm:w-auto sm:ml-auto rounded-2xl px-5 py-2.5 text-white shadow-[0_18px_38px_rgba(56,189,248,0.28)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(56,189,248,0.35)]`}
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

      <div className="space-y-3" ref={feedRef}>
        {visibleThreads.length === 0 ? (
          <div
            className={`${cardBaseClass} p-5 text-sm text-slate-400`}
            role="status"
            aria-live="polite"
          >
            Nessun thread dalle stanze che segui. Crea un thread o apri una nuova stanza
            per far partire la conversazione.
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
