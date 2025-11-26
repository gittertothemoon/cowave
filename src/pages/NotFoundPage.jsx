import { Link } from 'react-router-dom';
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  cardBaseClass,
} from '../components/ui/primitives.js';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center px-4">
      <div className={`${cardBaseClass} max-w-lg w-full space-y-4 p-6`}>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">
          Errore 404
        </p>
        <h1 className="text-2xl font-semibold text-white">
          Pagina non trovata
        </h1>
        <p className="text-sm text-slate-300">
          Il percorso richiesto non esiste o non è più disponibile. Torna al feed
          o alla pagina principale per continuare a navigare.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            to="/feed"
            className={buttonPrimaryClass}
          >
            Vai al feed
          </Link>
          <Link
            to="/"
            className={buttonSecondaryClass}
          >
            Torna alla home
          </Link>
        </div>
      </div>
    </div>
  );
}
