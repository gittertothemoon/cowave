import { useMemo, useState } from 'react';
import { useAppState } from '../state/AppStateContext.jsx';
import SessionHUD from '../components/ui/SessionHUD.jsx';
import AlgorithmControls from '../components/ui/AlgorithmControls.jsx';
import {
  cardBaseClass,
  eyebrowClass,
  bodyTextClass,
} from '../components/ui/primitives.js';

const quickActions = [
  { label: 'Sessione breve', desc: '30 minuti per concentrarti con calma.' },
  { label: 'Nota vocale', desc: 'Registra un highlight audio di 90 secondi.' },
  { label: 'Invita un amico', desc: 'Apri uno slot per un ospite nel thread.' },
];

const highlightMoments = [
  'Dev Lab • Il thread “Senza feed” raccoglie nuove onde interessanti.',
  'Deep Talk • Il thread “Stanchezza digitale” ha raggiunto 12 risposte.',
  'Creators 18+ Lab • È in prova un rituale serale condiviso.',
];

export default function AdvancedToolsPage() {
  const { rooms, followedRoomIds, algorithmPreset } = useAppState();
  const [toolsError] = useState(null);
  const [isToolsLoading] = useState(false);
  const followedRooms = useMemo(() => {
    if (!followedRoomIds.length) return [];
    return rooms.filter((room) => followedRoomIds.includes(room.id)).slice(0, 3);
  }, [rooms, followedRoomIds]);
  const hasRadarEmpty = followedRooms.length === 0;

  if (toolsError) {
    return (
      <div className="mx-auto w-full max-w-4xl">
        <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-950/20 p-4 text-sm text-red-100">
          <p className="font-medium">
            Si è verificato un problema nel caricamento dei contenuti.
          </p>
          <p className="mt-1 text-xs text-red-200">
            Riprova a ricaricare la pagina. Se il problema persiste, segnalalo nella stanza “Feedback CoWave”.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className={`${cardBaseClass} p-4 sm:p-5 space-y-2`}>
        <p className={eyebrowClass}>Strumenti</p>
        <h1 className="text-xl font-semibold text-slate-50 sm:text-2xl">
          Strumenti avanzati
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Qui trovi timer, sessioni mindful e controlli dell’algoritmo per usare CoWave con più intenzione. Regola il ritmo senza appesantire il feed.
        </p>
      </header>

      <div className="mt-4 space-y-4">
        <section className={`${cardBaseClass} p-4 sm:p-5 space-y-4`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Sessione mindful</h2>
              <p className="mt-1 text-xs text-slate-400">
                Tieni il tempo e le pause con un ritmo gentile.
              </p>
            </div>
            <span className="text-[11px] text-slate-500">
              Modalità sperimentale
            </span>
          </div>
          <div className="space-y-3">
            <SessionHUD floating={false} className="max-w-none" fullWidth />
          </div>
        </section>

        <section className={`${cardBaseClass} p-4 sm:p-5 space-y-4`}>
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-slate-100">Radar stanze</h2>
            <p className="text-xs text-slate-400">
              Ricevi promemoria quando una stanza diventa vivace o un thread raccoglie molte risposte.
            </p>
          </div>
          <div className="space-y-3">
            {isToolsLoading ? (
              <div className="flex items-center justify-center py-6 text-sm text-slate-400">
                Caricamento in corso...
              </div>
            ) : hasRadarEmpty ? (
              <div className="rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2 text-xs text-slate-400">
                Nessun dato ancora disponibile.
              </div>
            ) : (
              <ul className="space-y-2 text-sm">
                {followedRooms.map((room) => (
                  <li
                    key={room.id}
                    className="rounded-2xl border border-white/10 px-3 py-2 bg-slate-950/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                  >
                    <span className="font-semibold text-white break-words">{room.name}</span>
                    <span className="text-[11px] text-slate-500">
                      {Array.isArray(room.tags) && room.tags[0] ? `#${room.tags[0]}` : '—'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {!isToolsLoading && hasRadarEmpty && (
              <p className="text-[11px] text-slate-500">
                Segui qualche stanza e vedrai qui i segnali più utili.
              </p>
            )}
          </div>
        </section>

        <section className={`${cardBaseClass} p-4 sm:p-5 space-y-4`}>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-100">Controllo algoritmo</h2>
              <p className="mt-1 text-xs text-slate-400">
                Scegli l’equilibrio tra comfort, novità e ritmo del feed.
              </p>
            </div>
            <span className="text-[11px] text-slate-500 capitalize">
              Preset: {algorithmPreset}
            </span>
          </div>
          <AlgorithmControls framed={false} />
          <p className="text-[11px] text-slate-500">
            Questi slider influenzano il feed, ma puoi sempre tornare ai preset
            Comfort, Bilanciato o Crescita.
          </p>
        </section>

        <section className={`${cardBaseClass} p-4 sm:p-5 space-y-3`}>
          <div>
            <h2 className="text-sm font-semibold text-slate-100">Azioni veloci</h2>
          </div>
          {quickActions.length === 0 ? (
            <p className="text-xs text-slate-500">Nessun dato ancora disponibile.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {quickActions.map((action) => (
                <li
                  key={action.label}
                  className="rounded-2xl border border-white/10 px-3 py-2 bg-slate-950/40 flex flex-col"
                >
                  <span className="font-semibold text-white">{action.label}</span>
                  <span className="text-[12px] text-slate-400">{action.desc}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-4 md:grid-cols-2">
          <section className={`${cardBaseClass} p-4 sm:p-5 space-y-3`}>
            <p className={`${eyebrowClass} text-accent`}>Momenti iconici</p>
            {highlightMoments.length === 0 ? (
              <p className="text-xs text-slate-500">Nessun dato ancora disponibile.</p>
            ) : (
              <ul className="space-y-2 text-sm text-slate-300">
                {highlightMoments.map((moment) => (
                  <li key={moment} className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5" />
                    <span>{moment}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className={`${cardBaseClass} p-4 sm:p-5 space-y-3`}>
            <p className={eyebrowClass}>Rituale quotidiano</p>
            <p className={bodyTextClass}>
              Blocchi da 28 minuti, pausa respiro e recap serale. Personalizza e condividi le tue routine con le stanze.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-[11px]">
              {['Mattino', 'Pomeriggio', 'Sera'].map((slot) => (
                <div
                  key={slot}
                  className="rounded-2xl border border-white/10 px-3 py-3 bg-slate-950/50 space-y-1"
                >
                  <p className="uppercase tracking-[0.2em] text-slate-500">{slot}</p>
                  <p className="text-slate-100">2 blocchi focus</p>
                  <p className="text-slate-500">Pausa respiro</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
