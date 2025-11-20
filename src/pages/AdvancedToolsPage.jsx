import { useMemo } from 'react';
import { useAppState } from '../state/AppStateContext.jsx';
import SessionHUD from '../components/ui/SessionHUD.jsx';
import AlgorithmControls from '../components/ui/AlgorithmControls.jsx';

const quickActions = [
  { label: 'Lancia stanza pop-up', desc: 'focus room da 30 minuti' },
  { label: 'Crea highlight vocale', desc: 'clip audio da 90 secondi' },
  { label: 'Invita co-host', desc: 'apri uno slot per un ospite' },
];

const highlightMoments = [
  'Dev Lab • workflow “senza feed” votato top della settimana.',
  'Deep Talk • branch “stanchezza digitale” ha raggiunto 12 livelli.',
  'Creators 18+ Lab • nuovo rituale serale sperimentale.',
];

export default function AdvancedToolsPage() {
  const { rooms, followedRoomIds, algorithmPreset } = useAppState();
  const followedRooms = useMemo(() => {
    if (!followedRoomIds.length) return rooms.slice(0, 3);
    return rooms.filter((room) => followedRoomIds.includes(room.id)).slice(0, 3);
  }, [rooms, followedRoomIds]);

  return (
    <div className="space-y-5">
      <header className="glass-panel p-4 sm:p-5 space-y-2">
        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
          Strumenti
        </p>
        <h1 className="text-2xl font-semibold text-white">Strumenti avanzati</h1>
        <p className="text-sm text-slate-400 max-w-2xl">
          Timer mindful, radar, preset dell’algoritmo e rituali sperimentali
          vivono qui. Il feed resta pulito: regola da questa pagina tutto ciò che
          è intenso o sperimentale.
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.6fr)]">
        <div className="space-y-4">
          <div className="glass-panel p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  Sessione mindful
                </p>
                <p className="text-sm text-slate-300">
                  Gestisci timer, streak e recap consapevoli.
                </p>
              </div>
              <span className="text-[11px] text-slate-500">
                Modalità sperimentale
              </span>
            </div>
            <SessionHUD floating={false} className="max-w-none" fullWidth />
          </div>

          <div className="glass-panel p-4 sm:p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">
                  Controllo algoritmo
                </p>
                <p className="text-sm text-slate-300">
                  Regola manualmente comfort vs novità vs ritmo.
                </p>
              </div>
              <span className="text-[11px] text-slate-500 capitalize">
                Preset: {algorithmPreset}
              </span>
            </div>
            <AlgorithmControls />
            <p className="text-[11px] text-slate-500">
              Questi slider influenzano il feed, ma puoi sempre tornare ai preset
              Comfort, Bilanciato o Crescita.
            </p>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="glass-panel p-4 space-y-2">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Radar stanze
            </p>
            <p className="text-sm text-slate-300">
              Ricevi promemoria quando una stanza supera i limiti mindful o
              quando un thread esplode in nuovi rami.
            </p>
            <ul className="space-y-2 text-sm">
              {followedRooms.map((room) => (
                <li
                  key={room.id}
                  className="rounded-2xl border border-white/10 px-3 py-2 bg-slate-950/50 flex items-center justify-between gap-2"
                >
                  <span className="font-semibold text-white">{room.name}</span>
                  <span className="text-[11px] text-slate-500">
                    {room.tags[0] ? `#${room.tags[0]}` : '—'}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass-panel p-4 space-y-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
              Azioni veloci
            </p>
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
          </div>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="glass-panel p-4 sm:p-5 space-y-3">
          <p className="text-[11px] uppercase tracking-[0.18em] text-accent">
            Momenti iconici
          </p>
          <ul className="space-y-2 text-sm text-slate-300">
            {highlightMoments.map((moment) => (
              <li key={moment} className="flex items-start gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5" />
                <span>{moment}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="glass-panel p-4 sm:p-5 space-y-2">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
            Rituale quotidiano
          </p>
          <p className="text-sm text-slate-300">
            Blocchi da 28 minuti, pausa respiro guidata e recap serale con
            co-host. Modifica qui e condividi le routine con le tue stanze.
          </p>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            {['Mattino', 'Pomeriggio', 'Sera'].map((slot) => (
              <div
                key={slot}
                className="rounded-2xl border border-white/10 px-3 py-2 bg-slate-950/50"
              >
                <p className="uppercase tracking-[0.2em] text-slate-500">{slot}</p>
                <p className="text-slate-100">2 blocchi focus</p>
                <p className="text-slate-500">Pausa respiro</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
