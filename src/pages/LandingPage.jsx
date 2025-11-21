import { Link } from 'react-router-dom';
import CoWaveLogo from '../components/CoWaveLogo.jsx';
import {
  buttonPrimaryClass,
  buttonSecondaryClass,
  cardBaseClass,
  eyebrowClass,
  bodyTextClass,
} from '../components/ui/primitives.js';

const featureCards = [
  {
    title: 'Stanze tematiche',
    bullets: ['Segui solo gli spazi che ti servono.', 'Apri stanze nuove con regole chiare.'],
  },
  {
    title: 'Thread ad albero',
    bullets: ['Conversazioni a rami, non un feed infinito.', 'Apri solo i rami che ti interessano.'],
  },
  {
    title: 'Feed sotto controllo',
    bullets: ['Persona e preset scelti prima di entrare.', 'Comfort, bilanciato o crescita: decidi tu.'],
  },
];

const differencePoints = [
  'Ogni thread ha un inizio e una chiusura: niente scroll senza fine.',
  'La tua persona attiva è sempre visibile e modificabile.',
  'Algoritmo trasparente: preset chiari e slider sempre revocabili.',
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-60 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at 20% 20%, rgba(56,189,248,0.17), transparent 45%), radial-gradient(circle at 80% 0%, rgba(167,139,250,0.2), transparent 55%)',
        }}
      />
      <div className="relative z-10">
        <header className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3 text-slate-200" aria-label="CoWave">
            <CoWaveLogo size={38} variant="full" />
          </Link>
          <div className="flex items-center gap-2 text-sm">
            <Link to="/auth/login" className={`${buttonSecondaryClass} rounded-full`}>
              Accedi
            </Link>
            <Link
              to="/auth/register"
              className={`${buttonPrimaryClass} rounded-full`}
            >
              Inizia ora
            </Link>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16 pb-20">
          <section className="py-12 lg:py-20 grid gap-10 lg:grid-cols-[1.05fr,0.95fr] items-center">
            <div className="space-y-6">
              <p className={`${eyebrowClass} inline-flex items-center gap-2`}>
                Beta privata
                <span className="text-slate-500 text-[10px] tracking-[0.24em]">
                  Accesso su invito
                </span>
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight text-white">
                CoWave: il social a stanze dove le conversazioni restano chiare.
              </h1>
              <p className="text-base sm:text-lg text-slate-300 max-w-2xl">
                Entra in stanze tematiche, segui i thread come rami e decidi tu che tipo
                di contenuti arrivano nel feed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Link
                  to="/auth/register"
                  className={`${buttonPrimaryClass} w-full sm:w-auto rounded-3xl px-5 py-3 text-base`}
                >
                  Inizia ora
                </Link>
                <Link
                  to="/auth/login"
                  className={`${buttonSecondaryClass} w-full sm:w-auto rounded-3xl px-5 py-3 border-white/15`}
                >
                  Accedi
                </Link>
              </div>
            </div>

            <div className="relative w-full">
              <div className="absolute -inset-12 bg-gradient-to-tr from-accent/25 via-purple-500/20 to-fuchsia-500/25 blur-3xl opacity-60 animate-pulse-soft" />
              <div className={`${cardBaseClass} relative rounded-3xl p-5 space-y-5`}>
                <p className={eyebrowClass}>
                  Tre passi e sei dentro
                </p>
                <ol className="space-y-3 text-sm text-slate-200 list-decimal list-inside">
                  <li>Seleziona 1–3 stanze curate.</li>
                  <li>Indica la persona con cui vuoi apparire.</li>
                  <li>Imposta il preset del feed: Comfort, Bilanciato o Crescita.</li>
                </ol>
                <p className="text-[12px] text-slate-400">
                  Trovi solo i thread generati dalle stanze che segui, senza feed infinito.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="text-center space-y-2">
              <p className={eyebrowClass}>Cosa trovi dentro</p>
              <h2 className="text-3xl font-semibold text-white">
                Conversazioni ordinate, feed intenzionale
              </h2>
              <p className={`${bodyTextClass} max-w-2xl mx-auto`}>
                Stanze, thread ad albero e controllo dell’algoritmo. Gli strumenti più
                tecnici restano separati per non sporcare il feed.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {featureCards.map((card) => (
                <article
                  key={card.title}
                  className={`${cardBaseClass} p-5 sm:p-6 space-y-3`}
                >
                  <p className="text-lg font-semibold text-white">
                    {card.title}
                  </p>
                  <ul className="space-y-1.5 text-sm text-slate-300">
                    {card.bullets.map((bullet) => (
                      <li key={bullet} className="flex items-start gap-2">
                        <span className="text-accent mt-[2px] text-xs">✺</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>

          <section className={`${cardBaseClass} p-6 sm:p-8 rounded-3xl space-y-4`}>
            <p className={eyebrowClass}>Perché è diverso</p>
            <h3 className="text-2xl font-semibold text-white">
              Conversazioni più intenzionali, meno rumore
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              {differencePoints.map((point) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="max-w-4xl mx-auto text-center space-y-4">
            <h3 className="text-3xl font-semibold text-white">
              Pronto a entrare in CoWave?
            </h3>
            <p className={`${bodyTextClass} text-base`}>
              Registrati, fai l’onboarding in tre passi e atterra direttamente sul feed
              delle tue stanze.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <Link
                to="/auth/register"
                className={`${buttonPrimaryClass} rounded-3xl px-6 py-3 text-base`}
              >
                Inizia ora
              </Link>
              <Link
                to="/auth/login"
                className={`${buttonSecondaryClass} rounded-3xl px-6 py-3 border-white/15`}
              >
                Accedi
              </Link>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
