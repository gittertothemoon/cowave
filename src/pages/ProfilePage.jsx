import { useAppState } from '../state/AppStateContext.jsx';
import {
  cardBaseClass,
  cardMutedClass,
  eyebrowClass,
  pageTitleClass,
  bodyTextClass,
  buttonSecondaryClass,
} from '../components/ui/primitives.js';

const rituals = [
  {
    title: 'Check mattutino',
    detail: '3 stanze leggere, 1 thread lungo, timer 18 min.',
  },
  {
    title: 'Sessione coaching',
    detail: 'Ospita la stanza Deep Talk ogni giovedì.',
  },
  {
    title: 'Detox serale',
    detail: 'Contenuti intensi off e recap scritto prima di uscire.',
  },
];

export default function ProfilePage({ activePersonaId }) {
  const { personas } = useAppState();
  const activePersona = personas.find((p) => p.id === activePersonaId);

  return (
    <div className="space-y-5">
      <header className={`${cardBaseClass} p-4 sm:p-5 space-y-2`}>
        <p className={eyebrowClass}>Profilo</p>
        <h1 className={`${pageTitleClass} text-2xl`}>
          Personas e stanze che curi
        </h1>
        <p className={`${bodyTextClass} max-w-2xl`}>
          Persone diverse per toni diversi. Qui gestisci voce, rituali e prepari i
          prossimi esperimenti.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <div className={`${cardBaseClass} p-4 sm:p-5 space-y-4`}>
          <p className={eyebrowClass}>Persona attiva</p>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-accent to-accentBlue flex items-center justify-center text-sm font-semibold text-slate-950">
              {activePersona?.label?.[0] ?? 'P'}
            </div>
            <div>
              <p className="text-base font-semibold">{activePersona?.label}</p>
              <p className="text-[12px] text-slate-400">
                A breve potrai aggiungere descrizioni dedicate e decidere dove mostrarle.
              </p>
            </div>
          </div>
          <button
            type="button"
            className={`${buttonSecondaryClass} text-xs px-4 py-2 rounded-2xl border-white/15`}
          >
            Personalizza persona
          </button>
        </div>

        <div className={`${cardBaseClass} p-4 sm:p-5 space-y-3`}>
          <div className="flex items-center justify-between">
            <p className={eyebrowClass}>Altre personas</p>
            <button
              type="button"
              className="text-[11px] text-accent hover:text-accentSoft"
            >
              + Aggiungi
            </button>
          </div>
          <ul className="space-y-2 text-sm">
            {personas.map((p) => (
              <li
                key={p.id}
                className={`${cardMutedClass} px-3 py-2`}
              >
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span>{p.label}</span>
                  <span className="text-[11px] text-slate-500">
                    Reputazione: in arrivo
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className={`${cardBaseClass} p-4 sm:p-5 space-y-3`}>
          <p className={`${eyebrowClass} text-accent`}>Rituali salvati</p>
          <ul className="space-y-3 text-sm text-slate-300">
            {rituals.map((ritual) => (
              <li key={ritual.title} className={`${cardMutedClass} px-3 py-2`}>
                <p className="font-semibold text-white">{ritual.title}</p>
                <p className="text-[12px] text-slate-400">{ritual.detail}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
