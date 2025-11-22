import { useEffect, useRef, useState } from 'react';
import { cardBaseClass, eyebrowClass, bodyTextClass } from './ui/primitives.js';

const ROTATION_MS = 6000;

const heroStates = [
  {
    id: 'rooms',
    label: 'Stanze',
    headline: 'Le tue stanze',
    subheading: 'Scegli dove entrare oggi',
    rooms: [
      { name: 'Caffè creativo', detail: '3 nuovi thread freschi', badge: '+3' },
      { name: 'Mindful break', detail: 'Risposte lente, niente feed', badge: 'Nuovo' },
      { name: 'Outdoor & foto', detail: '2 risposte con immagini', badge: '+2' },
      { name: 'Tech senza hype', detail: '1 thread aggiornato', badge: '+1' },
    ],
  },
  {
    id: 'thread',
    label: 'Thread',
    title: 'Come stacchi dopo il lavoro?',
    author: 'Marta · Host',
    body: 'Sto provando a ritagliarmi 20 minuti senza schermo per cambiare ritmo. Idee pratiche?',
    replies: [
      { author: 'Luca', text: 'Timer da 20 minuti + tè caldo. Niente notifiche.' },
      { author: 'Giada', text: 'Passeggiata corta con cuffie spente, poi diario veloce.' },
      { author: 'Elena', text: 'Disegno su carta, così non torno sul tablet.' },
    ],
  },
  {
    id: 'reply',
    label: 'Risposta',
    title: 'Rispondi con una foto',
    prompt: 'Come stacchi dopo il lavoro?',
    replies: [
      { author: 'Teo', text: 'Ho provato il tuo consiglio del diario. Mi ha salvato la serata.', wave: true },
      { author: 'Sofia', text: 'Anch’io: 15 minuti di stretching e poi chiudo tutto.', wave: false },
    ],
  },
];

function RoomsView({ data }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className={eyebrowClass}>{data.headline}</p>
          <p className="text-sm text-slate-300">{data.subheading}</p>
        </div>
        <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent">
          3 nuove
        </span>
      </div>

      <div className="space-y-2.5">
        {data.rooms.map((room) => (
          <div
            key={room.name}
            className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-3.5 py-3 transition-all duration-300 hover:border-accent/50 hover:-translate-y-[1px]"
          >
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-white">{room.name}</p>
              <p className={`${bodyTextClass} text-xs text-slate-400`}>{room.detail}</p>
            </div>
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent">
              {room.badge}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ThreadView({ data }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className={eyebrowClass}>Thread aperto</p>
          <p className="text-base font-semibold text-white">{data.title}</p>
        </div>
        <span className="rounded-full border border-slate-800 bg-slate-900/70 px-3 py-1 text-[11px] font-semibold text-slate-200">
          in corso
        </span>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-sky-500/40 bg-sky-500/15 text-sm font-semibold text-sky-200">
            M
          </span>
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-white">{data.author}</p>
            <p className="text-xs text-slate-400">Post iniziale</p>
          </div>
        </div>
        <p className="mt-2 text-sm text-slate-200 leading-relaxed">{data.body}</p>
      </div>

      <div className="space-y-2">
        {data.replies.map((reply) => (
          <div key={reply.author} className="pl-3 border-l border-slate-800">
            <div className="flex items-start gap-2 rounded-xl border border-slate-900/80 bg-slate-950/60 px-3 py-2.5">
              <span className="text-slate-500">↳</span>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-white">{reply.author}</p>
                <p className="text-sm text-slate-300 leading-snug">{reply.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReplyView({ data }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className={eyebrowClass}>Risposta con foto</p>
          <p className="text-base font-semibold text-white">{data.prompt}</p>
        </div>
        <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-[11px] font-semibold text-accent">
          con foto
        </span>
      </div>

      <div className="space-y-2">
        {data.replies.map((reply) => (
          <div
            key={reply.author}
            className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-3.5 py-2.5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800/80 text-xs font-semibold text-slate-200">
              {reply.author[0]}
            </span>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-white">{reply.author}</p>
                {reply.wave ? <span className="text-accent" aria-hidden="true">🌊</span> : null}
              </div>
              <p className="text-sm text-slate-300 leading-snug">{reply.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-3 shadow-inner">
        <p className="text-xs font-semibold text-slate-400">Rispondi nel thread</p>
        <div className="flex gap-2">
          <div className="flex-1 rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-400">
            Scrivi una risposta...
          </div>
          <div className="flex h-14 w-24 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/70 text-[11px] font-semibold text-slate-300">
            Foto allegata
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="text-accent" aria-hidden="true">🌊</span>
            <span>Manda un’onda a chi ti colpisce</span>
          </div>
          <button
            type="button"
            className="rounded-xl border border-accent/40 bg-accent text-slate-950 px-3 py-1.5 text-sm font-semibold transition-colors duration-200 hover:bg-accentBlue hover:text-slate-950"
          >
            Invia
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HeroPreview() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const isFirstRun = useRef(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % heroStates.length);
    }, ROTATION_MS);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }

    setIsVisible(false);
    const timeout = setTimeout(() => setIsVisible(true), 30);
    return () => clearTimeout(timeout);
  }, [activeIndex]);

  const activeState = heroStates[activeIndex];

  return (
    <div className="relative w-full pointer-events-none select-none" aria-hidden="true">
      <div className="rounded-3xl border border-slate-700/70 bg-slate-950/80 p-3 sm:p-4 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-md">
        <div
          className={`${cardBaseClass} relative overflow-hidden p-4 sm:p-5 space-y-4 h-[420px] sm:h-[500px] lg:h-[520px]`}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sky-500/10 via-slate-900 to-fuchsia-500/10 opacity-70"
          />
          <div
            role="status"
            aria-live="polite"
            className={`relative transition-all duration-500 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
            key={activeState.id}
          >
            {activeState.id === 'rooms' && <RoomsView data={activeState} />}
            {activeState.id === 'thread' && <ThreadView data={activeState} />}
            {activeState.id === 'reply' && <ReplyView data={activeState} />}
          </div>
        </div>
      </div>
    </div>
  );
}
