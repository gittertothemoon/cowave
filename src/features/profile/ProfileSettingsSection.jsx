import { Link } from 'react-router-dom';
import {
  bodyTextClass,
  cardBaseClass,
  cardMutedClass,
  sectionTitleClass,
} from '../../components/ui/primitives.js';

const actions = [
  {
    label: 'Modifica profilo',
    description: 'Aggiorna nome, bio e preferenze.',
    to: '/app/settings#profilo',
  },
  {
    label: 'Gestisci persona attiva',
    description: 'Scegli voce, tono e palette per navigare.',
    to: '/app/settings#persona-attiva',
  },
  {
    label: 'Apri strumenti avanzati',
    description: 'Preset feed, esperimenti e debug.',
    to: '/app/settings/esperienza',
  },
];

export default function ProfileSettingsSection() {
  return (
    <section className={`${cardBaseClass} p-5 sm:p-6 space-y-3 max-w-3xl`}>
      <div>
        <p className={sectionTitleClass}>Impostazioni</p>
        <p className={`${bodyTextClass} text-sm`}>
          Link rapidi per personalizzare la tua esperienza.
        </p>
      </div>
      <div className="space-y-2">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.to}
            className={`${cardMutedClass} block rounded-2xl border border-slate-800 px-4 py-3 hover:border-accent/60 transition`}
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-white">
                  {action.label}
                </p>
                <p className="text-[12px] text-slate-400">
                  {action.description}
                </p>
              </div>
              <span className="text-[12px] text-accent">Apri ↗</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
